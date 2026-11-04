import { Router } from "express";
import sql from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { normalizarEmail, validarCadastro } from "../services/validacao.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Procura e-mail, username ou CNPJ já cadastrados. Devolve { erro, campo } ou null.
// (O banco também tem UNIQUE nessas colunas; esta consulta só dá a mensagem certa mais cedo.)
async function buscarDuplicado({ perfil, email, username, cnpj }) {
  const usuarios = await sql`
    SELECT email, username FROM usuario
    WHERE lower(email) = ${email} OR username = ${username}
  `;
  if (usuarios.some((u) => u.email.toLowerCase() === email)) {
    return { erro: "E-mail já cadastrado.", campo: "email" };
  }
  if (usuarios.length) return { erro: "Username já está em uso.", campo: "username" };

  if (perfil === "organizador" || perfil === "fornecedor") {
    // o nome da tabela vem do perfil já validado, nunca direto do usuário
    const [existente] = await sql`
      SELECT 1 AS existe FROM ${sql(perfil)} WHERE cnpj = ${cnpj}
    `;
    if (existente) return { erro: "CNPJ já cadastrado.", campo: "cnpj" };
  }
  return null;
}

router.post("/cadastro", async (req, res) => {
  // A validação do servidor não depende da do front-end.
  const { erros, dados } = validarCadastro(req.body);
  if (Object.keys(erros).length) {
    return res.status(400).json({ erro: Object.values(erros)[0], campos: erros });
  }

  const { perfil, nome, username, email, idade, senha, empresa, cnpj, areaAtuacao } =
    dados;

  try {
    const duplicado = await buscarDuplicado(dados);
    if (duplicado) return res.status(409).json(duplicado);

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // sql.begin: se o insert em organizador/fornecedor falhar, desfaz o
    // insert em usuario também (BEGIN/COMMIT/ROLLBACK automáticos).
    const idUsuario = await sql.begin(async (sql) => {
      const [{ id_usuario }] = await sql`
        INSERT INTO usuario (nome, idade, username, email, senha, perfil)
        VALUES (${nome}, ${idade}, ${username}, ${email}, ${senhaCriptografada}, ${perfil})
        RETURNING id_usuario
      `;

      // id_organizador / id_fornecedor sao o mesmo id_usuario (FK com PK compartilhada)
      if (perfil === "organizador") {
        await sql`
          INSERT INTO organizador (id_organizador, nome_organizacao, cnpj)
          VALUES (${id_usuario}, ${empresa}, ${cnpj})
        `;
      }

      if (perfil === "fornecedor") {
        await sql`
          INSERT INTO fornecedor (id_fornecedor, nome_organizacao, cnpj, area_atuacao)
          VALUES (${id_usuario}, ${empresa}, ${cnpj}, ${areaAtuacao})
        `;
      }

      return id_usuario;
    });

    return res.status(201).json({ ok: true, id: idUsuario });
  } catch (erro) {
    if (erro.code === "23505") {
      // dois cadastros iguais chegaram juntos e o UNIQUE do banco barrou um deles
      return res.status(409).json({ erro: "E-mail, username ou CNPJ já cadastrado." });
    }
    // Só a mensagem: o objeto inteiro do erro pode carregar dados do formulário.
    console.error("[cadastro]", erro.message);
    return res.status(500).json({ erro: "Erro interno." });
  }
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body ?? {};

  if (!email || !senha) {
    return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
  }
  if (typeof email !== "string" || typeof senha !== "string") {
    return res.status(400).json({ erro: "E-mail ou senha inválidos." });
  }

  try {
    // lower(): contas criadas com letras maiúsculas no e-mail continuam entrando
    const [usuario] = await sql`
      SELECT id_usuario, nome, email, senha, perfil FROM usuario
      WHERE lower(email) = ${normalizarEmail(email)}
    `;

    if (!usuario) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos." });
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos." });
    }

    // Organizador e fornecedor só entram depois de aprovados pelo admin.
    if (usuario.perfil === "organizador" || usuario.perfil === "fornecedor") {
      const tabela =
        usuario.perfil === "organizador" ? "organizador" : "fornecedor";
      const coluna =
        usuario.perfil === "organizador" ? "id_organizador" : "id_fornecedor";

      const [conta] = await sql`
        SELECT status_aprovacao FROM ${sql(tabela)} WHERE ${sql(coluna)} = ${usuario.id_usuario}
      `;

      if (!conta || conta.status_aprovacao !== "aprovado") {
        const motivo =
          conta?.status_aprovacao === "rejeitado"
            ? "Seu cadastro foi rejeitado. Entre em contato com o suporte."
            : "Seu cadastro ainda está em análise. Você poderá entrar assim que for aprovado.";
        return res
          .status(403)
          .json({
            erro: motivo,
            status_aprovacao: conta?.status_aprovacao ?? "pendente",
          });
      }
    }

    const payload = {
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      perfil: usuario.perfil,
    };

    // 2. ASSINATURA DO TOKEN (jwt.sign recebendo a variável payload)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2d" });

    // 3. RETORNO PARA O FRONT-END
    return res.status(200).json({
      ok: true,
      token: token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    });
  } catch (error) {
    // Nunca logar `req.body` nem o objeto de erro inteiro: aqui passam e-mail e senha.
    console.error("[login]", error.message);
    return res.status(500).json({ erro: "Erro interno." });
  }
});

export default router;

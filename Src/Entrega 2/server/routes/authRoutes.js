import { Router } from "express";
import sql from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { autenticar } from "../middlewares/autenticacao.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/cadastro", async (req, res) => {
  const {
    nome,
    username,
    email,
    idade,
    senha,
    perfil,
    empresa,
    cnpj,
    areaAtuacao,
  } = req.body;

  if (!nome || !email || !senha || !perfil || !idade || !username) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
  }

  if (!["cliente", "organizador", "fornecedor"].includes(perfil))
    return res.status(400).json({ erro: "Perfil inválido." });

  // organizador e fornecedor precisam de empresa e cnpj pra preencher a tabela deles
  if (
    (perfil === "organizador" || perfil === "fornecedor") &&
    (!empresa || !cnpj)
  ) {
    return res
      .status(400)
      .json({
        erro: "Empresa e CNPJ são obrigatórios para esse tipo de conta.",
      });
  }

  try {
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
          VALUES (${id_usuario}, ${empresa}, ${cnpj}, ${areaAtuacao || ""})
        `;
      }

      return id_usuario;
    });

    return res.status(201).json({ ok: true, id: idUsuario });
  } catch (erro) {
    // '23505' = unique_violation no Postgres. Erro vem do driver `postgres`
    // (porsager), que expõe `.constraint_name` e `.detail`.
    if (erro.code === "23505") {
      const msg = `${erro.constraint_name || ""} ${erro.detail || ""}`;
      const campo = msg.includes("username")
        ? "username"
        : msg.includes("cnpj")
          ? "cnpj"
          : msg.includes("email")
            ? "email"
            : null;

      const mensagens = {
        email: "E-mail já cadastrado.",
        username: "Username já está em uso.",
        cnpj: "CNPJ já cadastrado.",
      };

      return res.status(409).json({
        erro: mensagens[campo] || "Dado já cadastrado.",
        campo, // 'email' | 'username' | 'cnpj' | null
      });
    }
    console.error(erro);
    return res.status(500).json({ erro: "Erro interno." });
  }
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
  }

  try {
    const [usuario] = await sql`
      SELECT id_usuario, nome, email, senha, perfil FROM usuario WHERE email = ${email}
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
    console.error(error);
    return res.status(500).json({ erro: "Erro interno." });
  }
});

export default router;
import { Router } from "express";
import sql from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { emailValido, normalizarEmail, validarCadastro } from "../services/validacao.js";
import {
  limiteDeReenvio,
  enviarEmailVerificacao,
  expiracaoDoToken,
  gerarToken,
  hashToken,
} from "../services/verificacaoEmail.js";

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
    const { token, hash: hashDoToken } = gerarToken();

    // Faxina: cadastros pendentes vencidos há mais de 7 dias (a pessoa nunca confirmou).
    await sql`
      DELETE FROM cadastro_pendente WHERE token_expira < ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
    `;

    // Nada é gravado em usuario/organizador/fornecedor ainda: só depois do clique no link.
    // Cadastrar de novo com o mesmo e-mail substitui o pendente anterior, mas no máximo
    // 1 vez por minuto (o WHERE do DO UPDATE), para ninguém usar isso para encher uma caixa de e-mail.
    const [pendente] = await sql`
      INSERT INTO cadastro_pendente
        (nome, idade, username, email, senha, perfil, nome_organizacao, cnpj, area_atuacao, token_verificacao, token_expira)
      VALUES (
        ${nome}, ${idade}, ${username}, ${email}, ${senhaCriptografada}, ${perfil},
        ${perfil === "cliente" ? null : empresa},
        ${perfil === "cliente" ? null : cnpj},
        ${perfil === "fornecedor" ? areaAtuacao : null},
        ${hashDoToken}, ${expiracaoDoToken()}
      )
      ON CONFLICT (email) DO UPDATE SET
        nome = EXCLUDED.nome, idade = EXCLUDED.idade, username = EXCLUDED.username,
        senha = EXCLUDED.senha, perfil = EXCLUDED.perfil,
        nome_organizacao = EXCLUDED.nome_organizacao, cnpj = EXCLUDED.cnpj,
        area_atuacao = EXCLUDED.area_atuacao,
        token_verificacao = EXCLUDED.token_verificacao, token_expira = EXCLUDED.token_expira,
        criado_em = now()
      WHERE cadastro_pendente.token_expira < ${limiteDeReenvio()}
      RETURNING id_pendente
    `;
    if (!pendente) {
      return res.status(429).json({
        erro: "Já enviamos um link de confirmação para este e-mail. Aguarde 1 minuto para tentar de novo.",
        campo: "email",
      });
    }

    // Se o e-mail falhar, o cadastro pendente fica salvo e o login oferece o reenvio.
    const emailEnviado = await enviarEmailVerificacao({ nome, email, token });

    return res.status(201).json({ ok: true, emailEnviado });
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

// Confirma o e-mail a partir do token do link e SÓ ENTÃO cria a conta.
// O token é de uso único e expira.
router.post("/verificar-email", async (req, res) => {
  const { token } = req.body ?? {};
  if (typeof token !== "string" || !/^[0-9a-f]{64}$/.test(token)) {
    return res.status(400).json({ erro: "Link de confirmação inválido." });
  }
  const hash = hashToken(token);

  try {
    // sql.begin: o DELETE do pendente e os INSERTs da conta valem juntos ou não valem.
    // Se a criação falhar, o pendente volta e o link continua válido.
    const perfil = await sql.begin(async (sql) => {
      const [p] = await sql`
        DELETE FROM cadastro_pendente
        WHERE token_verificacao = ${hash} AND token_expira > now()
        RETURNING *
      `;
      if (!p) return null;

      const [{ id_usuario }] = await sql`
        INSERT INTO usuario (nome, idade, username, email, senha, perfil)
        VALUES (${p.nome}, ${p.idade}, ${p.username}, ${p.email}, ${p.senha}, ${p.perfil})
        RETURNING id_usuario
      `;

      // id_organizador / id_fornecedor sao o mesmo id_usuario (FK com PK compartilhada)
      if (p.perfil === "organizador") {
        await sql`
          INSERT INTO organizador (id_organizador, nome_organizacao, cnpj)
          VALUES (${id_usuario}, ${p.nome_organizacao}, ${p.cnpj})
        `;
      }
      if (p.perfil === "fornecedor") {
        await sql`
          INSERT INTO fornecedor (id_fornecedor, nome_organizacao, cnpj, area_atuacao)
          VALUES (${id_usuario}, ${p.nome_organizacao}, ${p.cnpj}, ${p.area_atuacao})
        `;
      }
      return p.perfil;
    });

    if (!perfil) {
      return res.status(400).json({
        erro: "Link inválido ou expirado. Se você já confirmou, é só entrar. Se não, peça um novo link na tela de login.",
      });
    }
    return res.status(200).json({ ok: true, perfil });
  } catch (erro) {
    if (erro.code === "23505") {
      // Entre o cadastro e o clique, outra pessoa ficou com o e-mail, o username ou o CNPJ.
      // O pendente não serve mais: apaga para não ficar travado.
      try {
        await sql`DELETE FROM cadastro_pendente WHERE token_verificacao = ${hash}`;
      } catch {
        // a limpeza é só para não deixar o pendente travado; o 409 abaixo vale de qualquer jeito
      }
      return res.status(409).json({
        erro: "Enquanto você confirmava, outra pessoa cadastrou o mesmo e-mail, username ou CNPJ. Faça o cadastro novamente.",
      });
    }
    console.error("[verificar-email]", erro.message);
    return res.status(500).json({ erro: "Erro interno." });
  }
});

// Manda um novo link para um cadastro pendente. A resposta é sempre a mesma,
// exista o cadastro ou não, para ninguém descobrir quais e-mails estão em uso.
router.post("/reenviar-verificacao", async (req, res) => {
  const email = typeof req.body?.email === "string" ? normalizarEmail(req.body.email) : "";
  if (!emailValido(email)) {
    return res.status(400).json({ erro: "E-mail inválido." });
  }

  try {
    const { token, hash } = gerarToken();
    const [pendente] = await sql`
      UPDATE cadastro_pendente
      SET token_verificacao = ${hash}, token_expira = ${expiracaoDoToken()}
      WHERE email = ${email} AND token_expira < ${limiteDeReenvio()}
      RETURNING nome
    `;
    if (pendente) await enviarEmailVerificacao({ nome: pendente.nome, email, token });

    return res.status(200).json({
      ok: true,
      mensagem: "Se existir um cadastro aguardando confirmação com este e-mail, enviamos um novo link.",
    });
  } catch (erro) {
    console.error("[reenviar-verificacao]", erro.message);
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
    const emailNormalizado = normalizarEmail(email);
    // lower(): contas criadas com letras maiúsculas no e-mail continuam entrando
    const [usuario] = await sql`
      SELECT id_usuario, nome, email, senha, perfil FROM usuario
      WHERE lower(email) = ${emailNormalizado}
    `;

    if (!usuario) {
      // A conta só existe depois da confirmação do e-mail. Se o e-mail e a senha batem com um
      // cadastro pendente, avisa que falta confirmar (e o front oferece o reenvio do link).
      const [pendente] = await sql`
        SELECT senha FROM cadastro_pendente WHERE email = ${emailNormalizado}
      `;
      if (pendente && (await bcrypt.compare(senha, pendente.senha))) {
        return res.status(403).json({
          erro: "Confirme seu e-mail para ativar a conta. Enviamos um link de confirmação para o seu e-mail.",
          codigo: "email_nao_verificado",
        });
      }
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

import { Router } from "express";
import pool from "../config/db.js";
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

  // pega uma conexao dedicada pra poder usar transacao
  // (se o insert na tabela organizador/fornecedor falhar, desfaz o insert em usuario tambem)
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // RETURNING id_usuario: o Postgres não tem insertId automático como o
    // MySQL, então pedimos o id gerado de volta explicitamente.
    const [resultadoUsuario] = await connection.query(
      `INSERT INTO usuario (nome, idade, username, email, senha, perfil) VALUES (?, ?, ?, ?, ?, ?) RETURNING id_usuario`,
      [nome, idade, username, email, senhaCriptografada, perfil],
    );
    const idUsuario = resultadoUsuario.insertId;

    // id_organizador / id_fornecedor sao o mesmo id_usuario (FK com PK compartilhada)
    if (perfil === "organizador") {
      await connection.query(
        `INSERT INTO organizador (id_organizador, nome_organizacao, cnpj) VALUES (?, ?, ?)`,
        [idUsuario, empresa, cnpj],
      );
    }

    if (perfil === "fornecedor") {
      await connection.query(
        `INSERT INTO fornecedor (id_fornecedor, nome_organizacao, cnpj, area_atuacao) VALUES (?, ?, ?, ?)`,
        [idUsuario, empresa, cnpj, areaAtuacao || ""],
      );
    }

    await connection.commit();
    return res.status(201).json({ ok: true, id: idUsuario });
  } catch (erro) {
    await connection.rollback();

    // '23505' = unique_violation no Postgres (era erro.code === 'ER_DUP_ENTRY'
    // no mysql2). O driver `postgres` também não tem `erro.sqlMessage`:
    // usamos `erro.constraint_name` (nome da constraint única violada, ex:
    // "usuario_email_key") e `erro.detail` como no mysql2 usava sqlMessage.
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
  } finally {
    connection.release();
  }
});

router.delete("/deleteUsers/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [resultado] = await pool.query(
      `DELETE FROM usuario WHERE id_usuario= ?`,
      [id],
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    return res
      .status(200)
      .json({ ok: true, mensagem: "Usuário excluído com sucesso." });
  } catch (erro) {
    return res.status(500).json({ erro: "Erro interno ao excluir usuário." });
  }
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
  }

  try {
    const [resultado] = await pool.query(
      `SELECT id_usuario, nome, email, senha, perfil FROM usuario WHERE email=?`,
      [email],
    );

    const [usuario] = resultado;

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

      const [[conta]] = await pool.query(
        `SELECT status_aprovacao FROM ${tabela} WHERE ${coluna} = ?`,
        [usuario.id_usuario],
      );

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

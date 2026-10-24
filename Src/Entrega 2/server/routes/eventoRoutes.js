import { consultarCobertura } from '../services/cobertura.js'
import { Router } from 'express'
import pool from '../config/db.js'
import { autenticar, permitir } from '../middlewares/autenticacao.js'

const router = Router()

// Verifica se o valor é um texto preenchido e respeita o limite.
function textoValido(valor, tamanhoMaximo) {
    return (
        typeof valor === 'string' &&
        valor.trim().length > 0 &&
        valor.trim().length <= tamanhoMaximo
    )
}

// Aceita reais com ponto ou vírgula decimal; não aceita separadores de milhar.
function lerPreco(valor, opcional = false) {
    const texto = String(valor ?? '').trim()

    if (opcional && texto === '') {
        return null
    }

    if (!/^\d+(?:[.,]\d{1,2})?$/.test(texto)) {
        return NaN
    }

    const numero = Number(texto.replace(',', '.'))
    return numero <= 99999999.99 ? numero : NaN
}

function lerPublico(valor, opcional = false) {
    const texto = String(valor ?? '').trim()
    if (opcional && texto === '') return 0
    return /^\d+$/.test(texto) ? Number(texto) : NaN
}

// Transforma uma data local no formato YYYY-MM-DD.
function formatarData(data) {
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const dia = String(data.getDate()).padStart(2, '0')

    return `${ano}-${mes}-${dia}`
}

// A listagem pode ser acessada sem login.
// Se houver um token, ele precisa ser validado.
function autenticarSeHouverToken(req, res, next) {
    if (req.headers.authorization) {
        return autenticar(req, res, next)
    }

    return next()
}

// Lista eventos publicados e também os eventos do próprio organizador.
router.get('/eventos', autenticarSeHouverToken, async (req, res, next) => {
    try {
        const idOrganizador =
            req.usuario?.perfil === 'organizador' ? req.usuario.id_usuario : 0

        const [eventos] = await pool.query(
            `
                SELECT
                    e.id_evento AS id,
                    e.titulo_evento AS titulo,
                    TO_CHAR(
                        e.data_inicio,
                        'YYYY-MM-DD'
                    ) AS data_inicio,
                    TO_CHAR(
                        e.data_fim,
                        'YYYY-MM-DD'
                    ) AS data_fim,
                    e.endereco,
                    e.status_publicacao,
                    COALESCE(e.ticket_estimado, e.qtd_lote_minimo) AS ticket_estimado,
                    COALESCE(e.ticket_estimado, e.qtd_lote_minimo) AS primeiro_lote,
                    e.qtd_lote_maximo AS segundo_lote,
                    (
                        SELECT COUNT(*)
                        FROM itemcusto ic
                        WHERE ic.id_evento_fk = e.id_evento
                    ) AS quantidade_itens,
                    e.id_organizador_fk AS organizador_id,
                    o.nome_organizacao AS organizador_nome
                FROM evento e
                JOIN organizador o
                    ON o.id_organizador = e.id_organizador_fk
                WHERE
                    e.status_publicacao = 'publicado'
                    OR e.id_organizador_fk = ?
                ORDER BY e.created_at DESC
                `,
            [idOrganizador],
        )

        // Adapta os nomes e valores para o formato usado pelo painel.
        const eventosFormatados = eventos.map((evento) => ({
            ...evento,
            status_publicacao:
                evento.status_publicacao[0].toUpperCase() +
                evento.status_publicacao.slice(1),
            banner_color: 'var(--tt-azul-principal)',
            // Alias mantido para compatibilidade com versões anteriores do painel.
            itens_pendentes: Number(evento.quantidade_itens),
        }))

        return res.json(eventosFormatados)
    } catch (erro) {
        next(erro)
    }
})

// Apenas fornecedores podem consultar os itens de custo.
router.get(
    '/eventos/:id/custos',
    autenticar,
    permitir('fornecedor'),
    async (req, res, next) => {
        try {
            const idEvento = req.params.id

            const [eventos] = await pool.query(
                `
                SELECT id_evento
                FROM evento
                WHERE
                    id_evento = ?
                    AND status_publicacao = 'publicado'
                `,
                [idEvento],
            )

            if (eventos.length === 0) {
                return res.status(404).json({
                    erro: 'Evento publicado não encontrado.',
                })
            }

            const itens = await consultarCobertura(pool, idEvento)

            return res.json(itens)
        } catch (erro) {
            next(erro)
        }
    },
)

// Empresas confirmadas, sem expor preços ou mensagens das propostas.
router.get('/eventos/:id/fornecedores', autenticar, permitir('fornecedor','organizador'), async(req,res,next)=>{
 try {
  const [eventos]=await pool.query(`SELECT id_evento FROM evento WHERE id_evento=? AND (status_publicacao='publicado' OR id_organizador_fk=?)`,[req.params.id,req.usuario.id_usuario])
  if(!eventos.length)return res.status(404).json({erro:'Evento não encontrado.'})
  const [rows]=await pool.query(`SELECT f.id_fornecedor,f.nome_organizacao,p.id,p.produto,p.quantidade,i.descricao_detalhada
   FROM solicitacao_fornecimento s JOIN fornecedor f ON f.id_fornecedor=s.id_fornecedor_fk
   JOIN produto_solicitacao p ON p.id_solicitacao_fk=s.id JOIN itemcusto i ON i.id_item_custo=p.id_item_custo_fk
   WHERE s.id_evento_fk=? AND s.status='aceita' ORDER BY f.nome_organizacao,p.id`,[req.params.id])
  res.json(rows)
 }catch(e){next(e)}
})

// Cria o evento, seus itens e os custos independentes.
router.post(
    '/eventos',
    autenticar,
    permitir('organizador'),
    async (req, res, next) => {
        const {
            eventData: dadosEvento = {},
            lotData: dadosLotes = {},
            independentCosts: custosIndependentes = [],
            groups: grupos = [],
        } = req.body

        // 1. Valida as informações básicas.
        const informacoesInvalidas =
            !textoValido(dadosEvento.name, 150) ||
            !textoValido(dadosEvento.location, 150) ||
            !textoValido(dadosEvento.city, 45) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(dadosEvento.date || '') ||
            !/^\d{2}:\d{2}$/.test(dadosEvento.startTime || '') ||
            !/^\d{2}:\d{2}$/.test(dadosEvento.endTime || '')

        if (informacoesInvalidas) {
            return res.status(400).json({
                erro: 'Preencha as informações do evento.',
            })
        }

        // 2. Valida a data e ajusta eventos que atravessam a meia-noite.
        const inicio = new Date(`${dadosEvento.date}T${dadosEvento.startTime}`)

        const fim = new Date(`${dadosEvento.date}T${dadosEvento.endTime}`)

        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        const datasInvalidas =
            !Number.isFinite(inicio.getTime()) ||
            !Number.isFinite(fim.getTime()) ||
            inicio < hoje

        if (datasInvalidas) {
            return res.status(400).json({
                erro: 'Confira a data e os horários do evento.',
            })
        }

        // Exemplo: 22:00 até 02:00 termina no dia seguinte.
        if (fim < inicio) {
            fim.setDate(fim.getDate() + 1)
        }

        const dataFinal = formatarData(fim)

        // 3. Valida a estrutura das listas de custos.
        const listasInvalidas =
            !Array.isArray(grupos) ||
            !Array.isArray(custosIndependentes) ||
            grupos.length > 30 ||
            custosIndependentes.length > 200

        if (listasInvalidas) {
            return res.status(400).json({
                erro: 'Custos inválidos.',
            })
        }

        const categoriasInvalidas = grupos.some((grupo) => {
            if (
                !grupo ||
                !textoValido(grupo.name, 80) ||
                !Array.isArray(grupo.items)
            ) {
                return true
            }

            return grupo.items.some((item) => !item || typeof item !== 'object')
        })

        if (categoriasInvalidas) {
            return res.status(400).json({
                erro: 'Categorias inválidas.',
            })
        }

        // Junta os itens de todas as categorias em uma única lista.
        // Cada item passa a carregar também o nome da categoria.
        const itens = grupos.flatMap((grupo) =>
            grupo.items.map((item) => ({
                ...item,
                categoria: grupo.name,
            })),
        )

        // 4. Valida descrição, quantidade e valor dos itens.
        const itensInvalidos = itens.some((item) => {
            const quantidade = Number(item.qty)
            const valorUnitario = Number(item.unit)

            return (
                !textoValido(item.description, 255) ||
                !Number.isInteger(quantidade) ||
                quantidade < 1 ||
                quantidade > 1000000 ||
                !Number.isFinite(valorUnitario) ||
                valorUnitario < 0 ||
                valorUnitario > 9999999999
            )
        })

        if (itens.length > 200 || itensInvalidos) {
            return res.status(400).json({
                erro: 'Itens de custo inválidos.',
            })
        }

        // 5. Lotes são PREÇOS; o público é uma QUANTIDADE de pessoas.
        const primeiroLote = lerPreco(dadosLotes.firstLot)
        const segundoLote = lerPreco(dadosLotes.secondLot, true)
        const publicoMinimo = lerPublico(dadosLotes.minAudience, true)
        const publicoMaximo = lerPublico(dadosLotes.maxAudience)

        if (
            !Number.isFinite(primeiroLote) ||
            (segundoLote !== null && !Number.isFinite(segundoLote))
        ) {
            return res.status(400).json({
                erro: 'Informe os preços dos lotes com até duas casas decimais, sem separador de milhar.',
            })
        }

        if (
            !Number.isInteger(publicoMinimo) ||
            !Number.isInteger(publicoMaximo) ||
            publicoMinimo < 0 ||
            publicoMaximo < 1 ||
            publicoMinimo > 1000000000 ||
            publicoMaximo > 1000000000 ||
            publicoMinimo > publicoMaximo
        ) {
            return res.status(400).json({
                erro: 'Confira o público: máximo de pelo menos 1 pessoa e mínimo não superior ao máximo.',
            })
        }

        // 6. Valida os custos independentes.
        const custosInvalidos = custosIndependentes.some((custo) => {
            if (!custo) {
                return true
            }

            const valor = Number(custo.numericValue)

            return (
                !textoValido(custo.type, 80) ||
                !textoValido(custo.description, 255) ||
                !Number.isFinite(valor) ||
                valor < 0 ||
                valor > 9999999999
            )
        })

        if (custosInvalidos) {
            return res.status(400).json({
                erro: 'Custos independentes inválidos.',
            })
        }

        // 7. Salva tudo na mesma transação.
        let conexao

        try {
            conexao = await pool.getConnection()
            await conexao.beginTransaction()

            // RETURNING id_evento: o Postgres não gera um insertId sozinho
            // como o MySQL, então pedimos a chave gerada de volta.
            const [resultado] = await conexao.query(
                `
                INSERT INTO evento (
                    id_organizador_fk,
                    titulo_evento,
                    data_evento,
                    data_inicio,
                    data_fim,
                    endereco,
                    publico_minimo,
                    publico_maximo,
                    qtd_lote_minimo,
                    qtd_lote_maximo,
                    ticket_estimado,
                    status_publicacao
                )
                VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'publicado'
                )
                RETURNING id_evento
                `,
                [
                    req.usuario.id_usuario,
                    dadosEvento.name,
                    dadosEvento.date,
                    `${dadosEvento.date} ${dadosEvento.startTime}`,
                    `${dataFinal} ${dadosEvento.endTime}`,
                    `${dadosEvento.location}, ${dadosEvento.city}`,
                    publicoMinimo,
                    publicoMaximo,
                    primeiroLote,
                    segundoLote,
                    primeiroLote,
                ],
            )

            const idEvento = resultado.insertId

            // Salva os itens solicitados pelo organizador.
            for (const item of itens) {
                await conexao.query(
                    `
                    INSERT INTO itemcusto (
                        id_evento_fk,
                        categoria,
                        descricao_detalhada,
                        quantidade,
                        valor_unitario
                    )
                    VALUES (?, ?, ?, ?, ?)
                    `,
                    [
                        idEvento,
                        item.categoria,
                        item.description,
                        item.qty,
                        item.unit,
                    ],
                )
            }

            // Salva despesas avulsas, como taxas e licenças.
            for (const custo of custosIndependentes) {
                await conexao.query(
                    `
                    INSERT INTO custoindependente (
                        id_evento_fk,
                        tipo_custo,
                        descricao,
                        valor
                    )
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        idEvento,
                        custo.type,
                        custo.description,
                        custo.numericValue,
                    ],
                )
            }

            await conexao.commit()

            return res.status(201).json({
                id: idEvento,
                primeiro_lote: primeiroLote,
                segundo_lote: segundoLote,
                quantidade_itens: itens.length,
            })
        } catch (erro) {
            if (conexao) {
                await conexao.rollback()
            }

            next(erro)
        } finally {
            conexao?.release()
        }
    },
)

// Edita os dados básicos de um evento do próprio organizador.
router.patch(
    '/eventos/:id',
    autenticar,
    permitir('organizador'),
    async (req, res, next) => {
        const { titulo, inicio, fim, endereco, status, ticket, segundoLote } =
            req.body

        const statusPermitidos = {
            Publicado: 'publicado',
            Rascunho: 'rascunho',
            Encerrado: 'encerrado',
            Cancelado: 'cancelado',
        }

        const valorTicket = lerPreco(ticket)
        const valorSegundoLote = lerPreco(segundoLote, true)
        const alterarSegundoLote = Object.hasOwn(req.body, 'segundoLote')

        const dadosInvalidos =
            !textoValido(titulo, 150) ||
            !textoValido(endereco, 200) ||
            !Object.hasOwn(statusPermitidos, status) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(inicio || '') ||
            !/^\d{4}-\d{2}-\d{2}$/.test(fim || '') ||
            !Number.isFinite(new Date(inicio).getTime()) ||
            !Number.isFinite(new Date(fim).getTime()) ||
            fim < inicio ||
            !Number.isFinite(valorTicket) ||
            valorTicket < 0 ||
            valorTicket > 99999999.99 ||
            (alterarSegundoLote &&
                valorSegundoLote !== null &&
                !Number.isFinite(valorSegundoLote))

        if (dadosInvalidos) {
            return res.status(400).json({
                erro: 'Confira os dados do evento.',
            })
        }

        try {
            const [resultado] = await pool.query(
                `
                UPDATE evento
                SET
                    titulo_evento = ?,
                    data_evento = ?,
                    data_inicio = (CONCAT(
                        ?, ' ', data_inicio::time
                    ))::timestamptz,
                    data_fim = (CONCAT(
                        ?, ' ', data_fim::time
                    ))::timestamptz,
                    endereco = ?,
                    status_publicacao = ?,
                    ticket_estimado = ?,
                    qtd_lote_minimo = ?,
                    qtd_lote_maximo = CASE
                        WHEN CAST(? AS boolean) THEN ? ELSE qtd_lote_maximo
                    END
                WHERE
                    id_evento = ?
                    AND id_organizador_fk = ?
                `,
                [
                    titulo,
                    inicio,
                    inicio,
                    fim,
                    endereco,
                    statusPermitidos[status],
                    valorTicket,
                    valorTicket,
                    alterarSegundoLote,
                    valorSegundoLote,
                    req.params.id,
                    req.usuario.id_usuario,
                ],
            )

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    erro: 'Evento não encontrado.',
                })
            }

            return res.json({
                ok: true,
            })
        } catch (erro) {
            next(erro)
        }
    },
)

// Exclui um evento somente se ele pertencer ao organizador autenticado.
router.delete(
    '/eventos/:id',
    autenticar,
    permitir('organizador'),
    async (req, res, next) => {
        try {
            const [resultado] = await pool.query(
                `
                DELETE FROM evento
                WHERE
                    id_evento = ?
                    AND id_organizador_fk = ?
                `,
                [req.params.id, req.usuario.id_usuario],
            )

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    erro: 'Evento não encontrado.',
                })
            }

            return res.json({
                ok: true,
            })
        } catch (erro) {
            next(erro)
        }
    },
)

export default router

import express from 'express'
import pool from './config/db.js'
import { EventRegistration } from '../../client/src/components/EventRegistration.jsx'

const event = express()
event.post('/eventos', async (req, res) => {
    const { name, 
            date, 
            startTime, 
            endTime, 
            location, 
            city } = req.body

    if (!name || !date || !startTime || !endTime || !location || !city) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios." })
    }

    try {
        const [resultado] = await pool.query(
    `INSERT INTO evento
     (id_organizador_fk, titulo_evento, data_evento,
      data_inicio, data_fim, endereco)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
        idOrganizador,
        name,
        date,
        `${date} ${startTime}`,
        `${date} ${endTime}`,
        `${location}, ${city}`
    ]
)

        return res.status(201).json({ ok: true, id: resultado.insertId })
    } catch (erro) {
        console.error(erro)
        return res.status(500).json({erro: 'Erro interno'})
    }
})

event.post('/lote', async (req, res) => {
    const { minBatchAmount, maxBatchAmount, minPublic, maxPublic } = req.body

    if (!minBatchAmount || ! maxBatchAmount || !minPublic || !maxPublic) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios." })
    }

    try {
        const [resultado] = await pool.query(
    `UPDATE evento
     SET qtd_lote_minimo = ?,
         qtd_lote_maximo = ?,
         publico_minimo = ?,
         publico_maximo = ?
     WHERE id_evento = ?`,
    [minBatchAmount, maxBatchAmount, minPublic, maxPublic, idEvento]
)
        
        return res.status(201).json({ ok: true, id: resultado.insertId })
    } catch (erro) {
        console.error(erro)
        return res.status(500).json({erro: 'Erro interno'})
    }
})

event.post('/custos-independentes', async (req, res) => {
    const { costCategory, description, cost } = req.body

    if (!costCategory || !description || !cost) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios." })
    }

    try {
        const [resultado] = await pool.query(
    `INSERT INTO custoindependente
     (id_evento_fk, tipo_custo, descricao, valor)
     VALUES (?, ?, ?, ?)`,
    [idEvento, costCategory, description, cost]
)

        return res.status(201).json({ ok: true, id: resultado.insertId })
    } catch (erro) {
        console.error(erro)
        return res.status(500).json({erro: 'Erro interno'})
    }
})
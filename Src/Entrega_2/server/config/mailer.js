import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,  // corrigido: era STMP (typo)
        pass: process.env.SMTP_PASS,
    },
})

// await só funciona dentro de função async
// antes estava solto no arquivo, o que causava erro
export async function enviarEmail({ para, assunto, texto, html }) {
    try {
        const info = await transporter.sendMail({
            from: '"Equipe TrocaTicket" <trocaticketprojeto@gmail.com>',
            to: para,
            subject: assunto,
            text: texto,
            html: html,
        })
        console.log('E-mail enviado:', info.messageId)
        return info
    } catch (err) {
        console.error('Erro ao enviar e-mail:', err)
        throw err
    }
}
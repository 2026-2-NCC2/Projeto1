import crypto from 'node:crypto'

// Confirmação de e-mail: gera o token, monta o link e envia a mensagem.

// Quanto tempo o link vale
export const VALIDADE_TOKEN_HORAS = 24

// Gera um token aleatório. `token` vai por e-mail; `hash` é o que fica no banco,
// assim um vazamento do banco não entrega links válidos.
export function gerarToken() {
    const token = crypto.randomBytes(32).toString('hex')
    return { token, hash: hashToken(token) }
}

export function hashToken(token) {
    return crypto.createHash('sha256').update(String(token)).digest('hex')
}

export function expiracaoDoToken() {
    return new Date(Date.now() + VALIDADE_TOKEN_HORAS * 60 * 60 * 1000)
}

// Limite de 1 e-mail por minuto para o mesmo cadastro: só vale renovar o token se o atual foi
// criado há mais de 1 min. Como o token vale VALIDADE_TOKEN_HORAS, "criado há 1 min" é o mesmo
// que "expira em (VALIDADE - 1 min)", então a coluna token_expira < este limite libera o reenvio.
export function limiteDeReenvio() {
    return new Date(Date.now() + (VALIDADE_TOKEN_HORAS * 60 - 1) * 60 * 1000)
}

function urlDoFrontend() {
    return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '')
}

function escaparHtml(texto) {
    return String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

// Envia o e-mail de confirmação. Devolve true se enviou, false se não deu.
// Nunca lança erro: o cadastro já foi gravado e a pessoa pode pedir o reenvio no login.
export async function enviarEmailVerificacao({ nome, email, token }) {
    const link = `${urlDoFrontend()}/verificar-email?token=${token}`
    const chave = process.env.RESEND_API_KEY

    if (!chave) {
        if (process.env.NODE_ENV === 'production') {
            console.error('[email] RESEND_API_KEY não configurada: e-mail de confirmação não enviado.')
            return false
        }
        // Desenvolvimento sem provedor de e-mail: mostra o link no terminal.
        console.log(`[email:dev] Link de confirmação: ${link}`)
        return true
    }

    try {
        const resposta = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: process.env.EMAIL_FROM || 'TrocaTicket <onboarding@resend.dev>',
                to: [email],
                subject: 'Confirme seu e-mail no TrocaTicket',
                text: `Olá, ${nome}!\n\nConfirme seu e-mail para ativar sua conta no TrocaTicket:\n${link}\n\nO link vale por ${VALIDADE_TOKEN_HORAS} horas. Se você não criou esta conta, ignore esta mensagem.`,
                html: `<p>Olá, ${escaparHtml(nome)}!</p>
<p>Confirme seu e-mail para ativar sua conta no TrocaTicket:</p>
<p><a href="${link}">Confirmar meu e-mail</a></p>
<p>O link vale por ${VALIDADE_TOKEN_HORAS} horas. Se você não criou esta conta, ignore esta mensagem.</p>`,
            }),
        })
       if (!resposta.ok) {
        const corpo = await resposta.text()
        console.error('[email] provedor recusou o envio, status', resposta.status, corpo)
      return false
}
        return true
    } catch (erro) {
        // Só a mensagem: nada de e-mail ou token no log.
        console.error('[email] falha ao enviar:', erro.message)
        return false
    }
}

// Tratador de erros do Express (último middleware do index.js).
export function tratarErros(erro, req, res, next) {
    // JSON malformado: o erro carrega o corpo da requisição (e-mail e senha), então não é logado.
    if (erro.type === 'entity.parse.failed') {
        return res.status(400).json({ erro: 'JSON inválido na requisição.' })
    }
    console.error('[erro]', erro.message) // só a mensagem, nunca o objeto inteiro
    res.status(500).json({ erro: 'Não foi possível concluir a operação. Tente novamente.' })
}

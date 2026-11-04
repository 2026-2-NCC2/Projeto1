// Validações do cadastro (RF01/RF02). Rodam SEMPRE no servidor, mesmo que o
// front-end já tenha validado. O que depende do banco (e-mail, username e CNPJ
// já cadastrados) fica em authRoutes.js.
// Os tamanhos máximos são os das colunas em bancoPG.sql.

// Deixa só os números: '11.222.333/0001-81' vira '11222333000181'
export function normalizarCnpj(valor) {
    return String(valor ?? '').replace(/\D/g, '')
}

export function normalizarEmail(valor) {
    return String(valor ?? '').trim().toLowerCase()
}

// Confere os 2 dígitos verificadores do CNPJ (cálculo oficial, módulo 11).
export function cnpjValido(cnpj) {
    if (!/^\d{14}$/.test(cnpj)) return false
    if (/^(\d)\1{13}$/.test(cnpj)) return false // 00000000000000, 11111111111111...

    const calcularDigito = (quantidade) => {
        const pesos = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2].slice(-quantidade)
        let soma = 0
        for (let i = 0; i < quantidade; i++) soma += Number(cnpj[i]) * pesos[i]
        const resto = soma % 11
        return resto < 2 ? 0 : 11 - resto
    }

    return calcularDigito(12) === Number(cnpj[12]) && calcularDigito(13) === Number(cnpj[13])
}

export function emailValido(email) {
    return email.length <= 150 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

// Texto sem espaços nas pontas. Se não for texto (ex.: objeto), vira ''.
const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '')

// Mensagem de erro para texto obrigatório com tamanho máximo ('' = tudo certo)
function erroTexto(valor, rotulo, maximo) {
    if (!valor) return `${rotulo} obrigatório.`
    return valor.length > maximo ? `${rotulo}: máximo de ${maximo} caracteres.` : ''
}

// Valida o corpo do POST /cadastro e devolve { erros, dados }.
// erros = { campo: 'mensagem' } (vazio = tudo certo); dados = valores já limpos.
export function validarCadastro(corpo = {}) {
    const dados = {
        perfil: texto(corpo.perfil),
        nome: texto(corpo.nome),
        username: texto(corpo.username),
        email: normalizarEmail(corpo.email),
        idade: Number(corpo.idade),
        senha: typeof corpo.senha === 'string' ? corpo.senha : '', // senha não leva trim
        empresa: texto(corpo.empresa),
        cnpj: normalizarCnpj(corpo.cnpj),
        areaAtuacao: texto(corpo.areaAtuacao),
    }
    const { perfil, nome, username, email, idade, senha, empresa, cnpj, areaAtuacao } = dados

    const erros = {}
    const marcar = (campo, mensagem) => {
        if (mensagem) erros[campo] = mensagem
    }

    if (!['cliente', 'organizador', 'fornecedor'].includes(perfil)) erros.perfil = 'Perfil inválido.'
    marcar('nome', erroTexto(nome, 'Nome', 150))
    marcar('username', erroTexto(username, 'Username', 50))

    if (!email) erros.email = 'E-mail obrigatório.'
    else if (!emailValido(email)) erros.email = 'E-mail inválido.'

    if (corpo.idade === '' || corpo.idade == null) erros.idade = 'Idade obrigatória.'
    else if (!Number.isInteger(idade) || idade < 1 || idade > 120) erros.idade = 'A idade deve ser um número inteiro entre 1 e 120.'

    if (!senha) erros.senha = 'Senha obrigatória.'
    else if (senha.length < 6) erros.senha = 'A senha deve ter no mínimo 6 caracteres.'
    else if (senha.length > 72) erros.senha = 'A senha deve ter no máximo 72 caracteres.'

    if (corpo.confirmarSenha !== undefined && corpo.confirmarSenha !== senha) erros.confirmarSenha = 'As senhas não coincidem.'

    // organizador e fornecedor também precisam de empresa e CNPJ
    if (perfil === 'organizador' || perfil === 'fornecedor') {
        marcar('empresa', erroTexto(empresa, 'Nome da empresa', 150))
        if (!cnpj) erros.cnpj = 'CNPJ obrigatório.'
        else if (!cnpjValido(cnpj)) erros.cnpj = 'CNPJ inválido.'
    }

    if (perfil === 'fornecedor') {
        marcar('areaAtuacao', erroTexto(areaAtuacao, 'Serviços', 80))
    }

    return { erros, dados }
}

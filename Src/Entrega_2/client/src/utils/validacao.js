// Validações do cadastro e do login no navegador (RF01, RF02, RF04).
// Só servem para avisar a pessoa na hora: quem decide é o servidor, que repete
// as regras (e confere os dígitos verificadores do CNPJ) em server/services/validacao.js.

// Tamanhos máximos = tamanho das colunas do banco
export const LIMITES = { nome: 150, username: 50, email: 150, empresa: 150, areaAtuacao: 80 }

// Deixa só os números: '11.222.333/0001-81' vira '11222333000181'
export function normalizarCnpj(valor) {
  return String(valor ?? '').replace(/\D/g, '')
}

// Máscara enquanto a pessoa digita: XX.XXX.XXX/XXXX-XX
export function formatarCnpj(valor) {
  return normalizarCnpj(valor)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

// Cada função devolve a mensagem de erro, ou '' quando está tudo certo.
export function erroEmail(email) {
  if (!email.trim()) return 'E-mail obrigatório.'
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ? '' : 'E-mail inválido.'
}

export function erroSenha(senha) {
  if (!senha) return 'Senha obrigatória.'
  if (senha.length < 6) return 'Mínimo 6 caracteres.'
  if (senha.length > 72) return 'Máximo 72 caracteres.'
  return ''
}

export function erroConfirmacaoSenha(senha, confirmacao) {
  if (!confirmacao) return 'Confirme sua senha.'
  return senha === confirmacao ? '' : 'As senhas não coincidem.'
}

export function erroCnpj(cnpj) {
  if (!cnpj.trim()) return 'CNPJ obrigatório.'
  return normalizarCnpj(cnpj).length === 14 ? '' : 'CNPJ incompleto.'
}

export function erroIdade(idade) {
  if (!String(idade).trim()) return 'Idade obrigatória.'
  const numero = Number(idade)
  return Number.isInteger(numero) && numero >= 1 && numero <= 120 ? '' : 'A idade deve ser um número inteiro entre 1 e 120.'
}

// Texto obrigatório com tamanho máximo (nome, username, empresa)
export function erroTexto(valor, rotulo, maximo) {
  const texto = valor.trim()
  if (!texto) return `${rotulo} obrigatório.`
  return texto.length > maximo ? `Máximo de ${maximo} caracteres.` : ''
}

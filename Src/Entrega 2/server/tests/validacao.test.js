// Testes unitários das validações de cadastro (T04 / RF01 e RF02). Sem banco.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    cnpjValido,
    emailValido,
    normalizarCnpj,
    validarCadastro,
} from '../services/validacao.js'

test('CNPJ: aceita válidos com e sem máscara', () => {
    for (const cnpj of ['11.222.333/0001-81', '11222333000181', '11.444.777/0001-61', '33.000.167/0001-01'])
        assert.equal(cnpjValido(normalizarCnpj(cnpj)), true, cnpj)
})

test('CNPJ: recusa dígito errado, repetidos, tamanho e vazios', () => {
    for (const cnpj of ['11.222.333/0001-82', '11.222.333/0001-18', '00000000000000', '11111111111111', '123', '', null, undefined, '1122233300018', '112223330001811'])
        assert.equal(cnpjValido(normalizarCnpj(cnpj)), false, String(cnpj))
    assert.equal(normalizarCnpj(' 11.222.333/0001-81 '), '11222333000181')
})

test('e-mail: formato', () => {
    for (const email of ['a@b.com', 'Ju.Souza@fecap.br', 'nome+tag@dominio.com.br'])
        assert.equal(emailValido(email), true, email)
    for (const email of ['', 'sem-arroba', 'a@b', 'a@b.c', '@b.com', 'a@.com', 'a b@c.com', `${'a'.repeat(150)}@b.com`])
        assert.equal(emailValido(email), false, email)
})

const base = { nome: 'Ju', username: 'ju', email: 'JU@Fecap.br', idade: 20, senha: '123456', confirmarSenha: '123456' }
const org = { ...base, perfil: 'organizador', empresa: 'Eventos SA', cnpj: '11.222.333/0001-81' }
const forn = { ...org, perfil: 'fornecedor', areaAtuacao: 'Som e Luz' }

test('cadastro: dados válidos saem limpos (e-mail minúsculo, CNPJ sem máscara)', () => {
    const { erros, dados } = validarCadastro(org)
    assert.deepEqual(erros, {})
    assert.equal(dados.email, 'ju@fecap.br')
    assert.equal(dados.cnpj, '11222333000181')
    assert.deepEqual(validarCadastro({ ...base, perfil: 'cliente' }).erros, {})
    assert.deepEqual(validarCadastro(forn).erros, {})
})

test('cadastro: campos vazios, ausentes ou só com espaços', () => {
    const { erros } = validarCadastro({ perfil: 'organizador', nome: '  ', email: '', senha: '' })
    for (const campo of ['nome', 'username', 'email', 'idade', 'senha', 'empresa', 'cnpj'])
        assert.ok(erros[campo], `esperava erro em ${campo}`)
    assert.ok(validarCadastro(undefined).erros.perfil)
    assert.ok(validarCadastro(null ?? {}).erros.nome)
})

test('cadastro: perfil inválido, inclusive administrador', () => {
    for (const perfil of ['administrador', 'root', '', undefined])
        assert.ok(validarCadastro({ ...base, perfil }).erros.perfil, String(perfil))
})

test('cadastro: CNPJ, e-mail e senha inválidos', () => {
    assert.equal(validarCadastro({ ...org, cnpj: '11.222.333/0001-82' }).erros.cnpj, 'CNPJ inválido.')
    assert.equal(validarCadastro({ ...org, email: 'ju@fecap' }).erros.email, 'E-mail inválido.')
    assert.ok(validarCadastro({ ...org, senha: '12345', confirmarSenha: '12345' }).erros.senha)
    assert.ok(validarCadastro({ ...org, senha: 'a'.repeat(73), confirmarSenha: 'a'.repeat(73) }).erros.senha) // máximo de 72
    assert.equal(validarCadastro({ ...org, confirmarSenha: 'outra123' }).erros.confirmarSenha, 'As senhas não coincidem.')
})

test('cadastro: idade precisa ser inteira e plausível', () => {
    for (const idade of [0, -1, 121, 12.5, 'abc', '', null, undefined])
        assert.ok(validarCadastro({ ...base, perfil: 'cliente', idade }).erros.idade, String(idade))
    assert.deepEqual(validarCadastro({ ...base, perfil: 'cliente', idade: '25' }).erros, {})
})

test('cadastro: limites de tamanho das colunas e área do fornecedor', () => {
    assert.ok(validarCadastro({ ...base, perfil: 'cliente', nome: 'n'.repeat(151) }).erros.nome)
    assert.ok(validarCadastro({ ...base, perfil: 'cliente', username: 'u'.repeat(51) }).erros.username)
    assert.ok(validarCadastro({ ...forn, areaAtuacao: 'x'.repeat(81) }).erros.areaAtuacao)
    assert.ok(validarCadastro({ ...forn, areaAtuacao: '' }).erros.areaAtuacao)
    // cliente não precisa de empresa/CNPJ
    assert.deepEqual(validarCadastro({ ...base, perfil: 'cliente' }).erros, {})
})

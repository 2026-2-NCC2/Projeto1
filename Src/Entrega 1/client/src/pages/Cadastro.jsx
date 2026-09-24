import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Footer from '../components/Footer'
import { ui, inputClass } from '../styles/ui'

function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erros, setErros] = useState({})
  const navigate = useNavigate()

  function validar() {
    const novosErros = {}

    if (!nome.trim()) novosErros.nome = 'Nome obrigatório.'

    if (!email.trim()) novosErros.email = 'E-mail obrigatório.'
    else if (!/\S+@\S+\.\S+/.test(email)) novosErros.email = 'E-mail inválido.'

    if (!senha) novosErros.senha = 'Senha obrigatória.'
    else if (senha.length < 6) novosErros.senha = 'Mínimo 6 caracteres.'

    if (!confirmarSenha) novosErros.confirmarSenha = 'Confirme sua senha.'
    else if (senha !== confirmarSenha) novosErros.confirmarSenha = 'As senhas não coincidem.'

    return novosErros
  }

  function handleCadastro() {
    const errosEncontrados = validar()
    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados)
      return
    }
    setErros({})
    console.log('Dados válidos! Enviando...', { nome, email, senha })
    navigate('/TelaDeEscolha')
  }

  return (
    <div className={ui.page}>
      <div className={ui.container}>
        <div className={ui.card}>
          <h1 className={ui.title}>Criar conta</h1>
          <p className={ui.subtitle}>Preencha os dados para se cadastrar.</p>

          <div className={ui.campo}>
            <label className={ui.label}>Nome completo</label>
            <input type="text" placeholder="Seu nome completo" value={nome}
              onChange={(e) => setNome(e.target.value)} className={inputClass(erros.nome)} />
            {erros.nome && <span className={ui.erro}>{erros.nome}</span>}
          </div>

          <div className={ui.campo}>
            <label className={ui.label}>E-mail</label>
            <input type="email" placeholder="seuemail@exemplo.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className={inputClass(erros.email)} />
            {erros.email && <span className={ui.erro}>{erros.email}</span>}
          </div>

          <div className={ui.campo}>
            <label className={ui.label}>Senha</label>
            <input type="password" placeholder="••••••••" value={senha}
              onChange={(e) => setSenha(e.target.value)} className={inputClass(erros.senha)} />
            {erros.senha && <span className={ui.erro}>{erros.senha}</span>}
          </div>

          <div className={ui.campo}>
            <label className={ui.label}>Confirmar senha</label>
            <input type="password" placeholder="••••••••" value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)} className={inputClass(erros.confirmarSenha)} />
            {erros.confirmarSenha && <span className={ui.erro}>{erros.confirmarSenha}</span>}
          </div>

          <div className={ui.botoes}>
            <Link to="/" className={ui.btnVoltar}>Voltar</Link>
            <button className={ui.btnPrimary} onClick={handleCadastro}>Cadastrar</button>
          </div>

          <div className={ui.footerLink}>
            Já tem conta? <Link to="/login">Entrar</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Cadastro

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Footer from '../components/Footer'
import { ui, inputClass } from '../styles/ui'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState({})
  const navigate = useNavigate()

  function validar() {
    const novosErros = {}

    if (!email.trim()) novosErros.email = 'E-mail obrigatório.'
    else if (!/\S+@\S+\.\S+/.test(email)) novosErros.email = 'E-mail inválido.'

    if (!senha) novosErros.senha = 'Senha obrigatória.'
    else if (senha.length < 6) novosErros.senha = 'Senha inválida.'

    return novosErros
  }

  function handleLogin() {
    const errosEncontrados = validar()
    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados)
      return
    }
    setErros({})
    console.log('Dados válidos! Enviando...', { email, senha }) // corrigido: "nome" não existia aqui
    navigate('/')
  }

  return (
    <div className={ui.page}>
      <div className={ui.container}>
        <div className={ui.card}>
          <h1 className={ui.title}>Entrar</h1>
          <p className={ui.subtitle}>Preencha os dados para se conectar.</p>

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

          <div className={ui.botoes}>
            <Link to="/" className={ui.btnVoltar}>Voltar</Link>
            <button className={ui.btnPrimary} onClick={handleLogin}>Login</button>
          </div>

          <div className={ui.footerLink}>
            Ainda não tem uma conta? <Link to="/Cadastro">Cadastre-se</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Login

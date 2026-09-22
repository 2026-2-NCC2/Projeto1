import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/Cadastro.css'
import Footer from '../components/Footer'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const navigate = useNavigate();

  // Objeto que guarda os erros de cada campo
  const [erros, setErros] = useState({})

  function validar() {
    // Criamos um objeto vazio e vamos preenchendo com os erros encontrados
    const novosErros = {}

    if (!email.trim())
      novosErros.email = 'E-mail obrigatório.'
    else if (!/\S+@\S+\.\S+/.test(email))
      novosErros.email = 'E-mail inválido.'

    if (!senha)
      novosErros.senha = 'Senha obrigatória.'
    else if (senha.length < 6)
      novosErros.senha = 'Senha inválida.'

    return novosErros
  }

  function handleCadastro() {
    const errosEncontrados = validar()
    

    // Se o objeto tiver alguma chave, significa que tem erro
    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados)
      return // para aqui, não envia
    }

    // Se chegou aqui, tudo certo
    setErros({})
    console.log('Dados válidos! Enviando...', { nome, email, senha })

    navigate("/")
  }

  return (
    <div className="cadastro-page">
      <div className="cadastro-container">
        <div className="cadastro-card">
          <h1>Entrar</h1>
          <p className="subtitulo">Preencha os dados para se conectar.</p>
          
          <div className="campo">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={erros.email ? 'campo--erro' : ''}
            />
            
            {erros.email && <span className="erro-msg">{erros.email}</span>}
          </div>

          <div className="campo">
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={erros.senha ? 'campo--erro' : ''}
            />
            {erros.senha && <span className="erro-msg">{erros.senha}</span>}
          </div>

          <div className='botoes-inferiores'>
            <Link to="/" className="btn-voltar">Voltar</Link>
            <button className="btn-cadastrar" onClick={handleCadastro}>
             Login
            </button>
          </div>

          <div className="cadastro-footer">
            Ainda não tem uma conta? <a href="/Cadastro">Cadastre-se</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Login
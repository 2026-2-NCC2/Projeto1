import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Footer from '../components/Footer'
import { ui, inputClass } from '../styles/ui' // classes de estilo compartilhadas entre as paginas

// pagina de login
function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState({}) // mensagens de erro dos campos
  const navigate = useNavigate()         // pra mudar de pagina pelo codigo

  // valida os campos e devolve os erros encontrados
  // se voltar vazio e porque ta tudo certo
  function validar() {
    const novosErros = {}

    // regex simples, so confere se tem algo@algo.algo
    if (!email.trim()) novosErros.email = 'E-mail obrigatório.'
    else if (!/\S+@\S+\.\S+/.test(email)) novosErros.email = 'E-mail inválido.'

    if (!senha) novosErros.senha = 'Senha obrigatória.'
    else if (senha.length < 6) novosErros.senha = 'Senha inválida.'

    return novosErros
  }

  // roda quando clica em "Login"
  function handleLogin() {
    const errosEncontrados = validar()
    // se tiver erro, mostra nos campos e para aqui
    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados)
      return
    }
    setErros({})
    // por enquanto so mostra no console e volta pra home, depois vai chamar a API
    console.log('Dados válidos! Enviando...', { email, senha }) // corrigido: "nome" nao existia aqui
    navigate('/')
  }

  return (
    <div className={ui.page}>
      <div className={ui.container}>
        <div className={ui.card}>
          <h1 className={ui.title}>Entrar</h1>
          <p className={ui.subtitle}>Preencha os dados para se conectar.</p>

          {/* campo de email, inputClass muda o estilo se tiver erro */}
          <div className={ui.campo}>
            <label className={ui.label}>E-mail</label>
            <input type="email" placeholder="seuemail@exemplo.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className={inputClass(erros.email)} />
            {erros.email && <span className={ui.erro}>{erros.email}</span>}
          </div>

          {/* campo de senha */}
          <div className={ui.campo}>
            <label className={ui.label}>Senha</label>
            <input type="password" placeholder="••••••••" value={senha}
              onChange={(e) => setSenha(e.target.value)} className={inputClass(erros.senha)} />
            {erros.senha && <span className={ui.erro}>{erros.senha}</span>}
          </div>

          {/* voltar pra home e entrar */}
          <div className={ui.botoes}>
            <Link to="/" className={ui.btnVoltar}>Voltar</Link>
            <button className={ui.btnPrimary} onClick={handleLogin}>Login</button>
          </div>

          {/* link pra quem ainda nao tem conta */}
          <div className={ui.footerLink}>
            Ainda não tem uma conta? <Link to="/Cadastro">Cadastre-se</Link>
          </div>
        </div>
      </div>

      {/* rodape do site */}
      <Footer />
    </div>
  )
}

export default Login
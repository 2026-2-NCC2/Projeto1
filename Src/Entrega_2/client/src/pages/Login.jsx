import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Sticker from '../components/Sticker'
import { ui, inputClass } from '../styles/ui' // classes de estilo compartilhadas entre as paginas
import { loginUsuario, reenviarVerificacao } from '../services/api'
import { useAuth } from '../services/AuthContext'
import { erroEmail } from '../utils/validacao'

// pagina de login


function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState({}) // mensagens de erro dos campos
  const navigate = useNavigate()         // pra mudar de pagina pelo codigo

  const [apiLoading, setApiLoading] = useState(false)

  // true quando o servidor diz que falta confirmar o e-mail (mostra o botao de reenviar)
  const [precisaConfirmar, setPrecisaConfirmar] = useState(false)
  const [reenvio, setReenvio] = useState({ carregando: false, mensagem: '' })

  // pede um novo link de confirmacao pro e-mail digitado
  async function handleReenviar() {
    setReenvio({ carregando: true, mensagem: '' })
    try {
      const r = await reenviarVerificacao(email)
      setReenvio({ carregando: false, mensagem: r.mensagem })
    } catch (err) {
      setReenvio({ carregando: false, mensagem: err.message })
    }
  }

  // valida os campos e devolve os erros encontrados
  // se voltar vazio e porque ta tudo certo
  function validar() {
    const novosErros = {}

    // mesma regra do cadastro (utils/validacao.js)
    const erroDoEmail = erroEmail(email)
    if (erroDoEmail) novosErros.email = erroDoEmail

    if (!senha) novosErros.senha = 'Senha obrigatória.'
    else if (senha.length < 6) novosErros.senha = 'Senha inválida.'

    return novosErros
  }

  // roda quando clica em "Login"
  async function handleLogin() {
    const errosEncontrados = validar()
    // se tiver erro, mostra nos campos e para aqui
    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados)
      return
    }
    setErros({})
    setPrecisaConfirmar(false)
    setReenvio({ carregando: false, mensagem: '' })
    setApiLoading(true)
    try {
      const usuario = await loginUsuario({ email, senha })
      login(usuario) // <-- em vez de localStorage.setItem direto
      navigate('/PainelDeEventos')
    } catch (err) {
        setErros({ senha: err.message })
        setPrecisaConfirmar(err.codigo === 'email_nao_verificado')
    } finally {
      setApiLoading(false) // sem isso o botao ficaria preso depois de um erro
    }
  }

  return (
    <div className={`${ui.page} relative overflow-x-clip`}>
      <div className={ui.container}>
        {/* o relative prende os adesivos no card */}
        <div className="relative w-full max-w-[440px]">
        <form className={`${ui.card} relative z-[2]`} onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
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

          {/* e-mail ainda nao confirmado: da pra pedir um novo link */}
          {precisaConfirmar && (
            <div className="mb-4 text-sm text-tt-grafite/70">
              <button type="button" onClick={handleReenviar} disabled={reenvio.carregando}
                className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-tt-azul-marinho underline disabled:cursor-not-allowed disabled:opacity-50">
                {reenvio.carregando ? 'Enviando...' : 'Reenviar e-mail de confirmação'}
              </button>
              {reenvio.mensagem && <p className="mt-2" role="status">{reenvio.mensagem}</p>}
            </div>
          )}

          {/* voltar pra home e entrar */}
          <div className={ui.botoes}>
            <Link to="/" className={ui.btnVoltar}>Voltar</Link>
            <button type="submit" className={ui.btnPrimary} disabled={apiLoading}>{apiLoading ? 'Entrando...' : 'Login'}</button>
          </div>

          {/* link pra quem ainda nao tem conta */}
          <div className={ui.footerLink}>
            Ainda não tem uma conta? <Link to="/Cadastro">Cadastre-se</Link>
          </div>
        </form>
        {/* adesivo pequeno na quina do card (celular e tablet) */}
        <Sticker nome="estrela" tamanho={70} rotate={14} className="-right-2 -top-9 z-[3] lg:hidden" />
        {/* adesivos grandes nas laterais, so em tela larga */}
        <Sticker nome="fita" tamanho={150} rotate={-9} delay={0.5} className="-left-[124px] top-[8%] z-[3] hidden lg:block" />
        <Sticker nome="cd" tamanho={120} rotate={12} delay={1.5} className="-left-[94px] bottom-[6%] z-[3] hidden lg:block" />
        <Sticker nome="estrela" tamanho={100} rotate={-12} delay={1} className="-right-[74px] top-[6%] z-[3] hidden lg:block" />
        <Sticker nome="vinil" tamanho={140} rotate={8} delay={0.2} className="-right-[114px] bottom-[4%] z-[3] hidden lg:block" />
        </div>
      </div>

      {/* rodape do site */}
      <Footer />
    </div>
  )
}

export default Login
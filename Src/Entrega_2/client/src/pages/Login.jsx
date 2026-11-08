import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import CenaConta from '../components/ui/CenaConta'
import Folha from '../components/ui/Folha'
import { btn, campoCls, erroCls, linkClaroCls, rotuloCls } from '../components/ui/estilos'
import { loginUsuario } from '../services/api'
import { useAuth } from '../services/AuthContext'
import { erroEmail } from '../utils/validacao'

// adesivos em volta da folha, so em tela larga
const ADESIVOS = [
  { nome: 'fita', tamanho: 150, rotate: -9, delay: 0.5, className: '-left-[130px] top-[10%] z-[3] hidden lg:block' },
  { nome: 'vinil', tamanho: 140, rotate: 8, delay: 0.2, className: '-right-[118px] bottom-[6%] z-[3] hidden lg:block' },
]

// pagina de login
function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState({}) // mensagens de erro dos campos
  const navigate = useNavigate()         // pra mudar de pagina pelo codigo
  const location = useLocation()

  const [apiLoading, setApiLoading] = useState(false)

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
    setApiLoading(true)
    try {
      const usuario = await loginUsuario({ email, senha })
      login(usuario)
      // volta pra pagina que a pessoa tentou abrir antes de ser mandada pro login (ver ProtectedRoute)
      const destino = location.state?.from
      navigate(destino ? `${destino.pathname}${destino.search}` : '/PainelDeEventos', { replace: true })
    } catch (err) {
        setErros({ senha: err.message })
    } finally {
      setApiLoading(false) // sem isso o botao ficaria preso depois de um erro
    }
  }

  return (
    <CenaConta adesivos={ADESIVOS}>
      <Folha as="form" gel="indigo" faixa="h-2.5" className="z-[2]" onSubmit={(e) => { e.preventDefault(); handleLogin(); }} noValidate>
        <div className="px-6 pb-8 pt-8 sm:px-10 sm:pb-10">
          <h1 className="text-[2.5rem] font-black leading-none tracking-[-0.025em]">Entrar</h1>
          <p className="mt-3 text-[15px] text-tinta/65">Preencha os dados para se conectar.</p>

          <div className="mt-8 flex flex-col gap-5">
            {/* campo de email, a borda muda se tiver erro */}
            <div className="flex flex-col gap-2">
              <label htmlFor="login-email" className={rotuloCls}>E-mail</label>
              <input id="login-email" type="email" autoComplete="email" placeholder="seuemail@exemplo.com" value={email}
                onChange={(e) => setEmail(e.target.value)} className={campoCls(erros.email)} aria-invalid={Boolean(erros.email)} />
              {erros.email && <span className={erroCls} role="alert">{erros.email}</span>}
            </div>

            {/* campo de senha */}
            <div className="flex flex-col gap-2">
              <label htmlFor="login-senha" className={rotuloCls}>Senha</label>
              <input id="login-senha" type="password" autoComplete="current-password" placeholder="••••••••" value={senha}
                onChange={(e) => setSenha(e.target.value)} className={campoCls(erros.senha)} aria-invalid={Boolean(erros.senha)} />
              {erros.senha && <span className={erroCls} role="alert">{erros.senha}</span>}
            </div>
          </div>

          {/* voltar pra home e entrar */}
          <div className="mt-8 grid grid-cols-[auto_1fr] gap-3">
            <Link to="/" className={btn('claro', 'lg')}>Voltar</Link>
            <button type="submit" className={btn('primario', 'lg')} disabled={apiLoading}>{apiLoading ? 'Entrando...' : 'Login'}</button>
          </div>

          {/* link pra quem ainda nao tem conta */}
          <p className="mt-7 border-t border-tinta/10 pt-6 text-center text-sm text-tinta/65">
            Ainda não tem uma conta? <Link to="/Cadastro" className={linkClaroCls}>Cadastre-se</Link>
          </p>
        </div>
      </Folha>
    </CenaConta>
  )
}

export default Login

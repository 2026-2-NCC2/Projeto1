// useState = guarda o que a pessoa digita e os erros
import { useState } from 'react'
// useNavigate = troca de pagina pelo codigo / Link = link sem recarregar
import { useNavigate, Link } from 'react-router-dom'
import { ui, inputClass } from '../styles/ui' // classes de estilo compartilhadas entre as paginas
// funcao que manda e-mail e senha pro back-end
import { loginUsuario } from '../services/api'

// pagina de login
function Login() {
  // e-mail digitado
  const [email, setEmail] = useState('')
  // senha digitada
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState({}) // mensagens de erro dos campos
  const navigate = useNavigate()         // pra mudar de pagina pelo codigo

  // true enquanto espera a resposta do servidor
  // (ainda nao aparece na tela, por isso o lint avisa que nao e usado)
  const [apiLoading, setApiLoading] = useState(false)

  // valida os campos e devolve os erros encontrados
  // se voltar vazio e porque ta tudo certo
  function validar() {
    // comeca sem erros
    const novosErros = {}

    // regex simples, so confere se tem algo@algo.algo
    if (!email.trim()) novosErros.email = 'E-mail obrigatório.'
    else if (!/\S+@\S+\.\S+/.test(email)) novosErros.email = 'E-mail inválido.'

    // senha vazia ou com menos de 6 letras = erro
    if (!senha) novosErros.senha = 'Senha obrigatória.'
    else if (senha.length < 6) novosErros.senha = 'Senha inválida.'

    // devolve os erros (vazio = tudo certo)
    return novosErros
  }

  // roda quando clica em "Login"
  async function handleLogin() {
    // confere os campos
    const errosEncontrados = validar()
    // se tiver erro, mostra nos campos e para aqui
    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados)
      return
    }
    // limpa os erros antigos
    setErros({})
    // marca que esta carregando
    setApiLoading(true)
    // try = tenta fazer o login; se der erro, cai no catch
    try{
      const usuario = await loginUsuario({email, senha})
      localStorage.setItem('usuario', JSON.stringify(usuario)) // { id_usuario, nome, email, perfil }
      // deu certo: vai pro painel de eventos
      navigate('/PainelDeEventos')
    } catch(err){
      // deu errado: mostra a mensagem embaixo da senha
      setErros({ senha: 'E-mail ou senha inválidos.' })
    } finally{
      // finally = roda sempre, dando certo ou errado: para de carregar
      setApiLoading(false)
    }
    // por enquanto so mostra no console e volta pra home, depois vai chamar a API
    console.log('Dados válidos! Enviando...', { email, senha }) // corrigido: "nome" nao existia aqui
    
  }

  return (
    // pagina com fundo cinza claro (as classes vem do styles/ui.js)
    <div className={ui.page}>
      {/* centraliza o card na tela */}
      <div className={ui.container}>
        {/* card branco com o formulario */}
        <div className={ui.card}>
          {/* titulo e subtitulo */}
          <h1 className={ui.title}>Entrar</h1>
          <p className={ui.subtitle}>Preencha os dados para se conectar.</p>

          {/* campo de email, inputClass muda o estilo se tiver erro */}
          <div className={ui.campo}>
            {/* texto do campo */}
            <label className={ui.label}>E-mail</label>
            {/* cada letra digitada atualiza o e-mail */}
            <input type="email" placeholder="seuemail@exemplo.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className={inputClass(erros.email)} />
            {/* mensagem de erro (so aparece se tiver erro) */}
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
            {/* Voltar leva pra pagina inicial */}
            <Link to="/" className={ui.btnVoltar}>Voltar</Link>
            {/* Login chama o handleLogin */}
            <button className={ui.btnPrimary} onClick={handleLogin}>Login</button>
          </div>

          {/* link pra quem ainda nao tem conta */}
          <div className={ui.footerLink}>
            Ainda não tem uma conta? <Link to="/Cadastro">Cadastre-se</Link>
          </div>
        </div>
      </div>

    </div>
  )
}

// deixa a pagina disponivel pras rotas
export default Login
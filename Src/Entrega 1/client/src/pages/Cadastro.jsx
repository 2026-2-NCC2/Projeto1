import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/Cadastro.css'
import Footer from '../components/Footer'

function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  const navigate = useNavigate();

  // Objeto que guarda os erros de cada campo
  const [erros, setErros] = useState({})

  function validar() {
    // Criamos um objeto vazio e vamos preenchendo com os erros encontrados
    const novosErros = {}

    if (!nome.trim())
      novosErros.nome = 'Nome obrigatório.'

    if (!email.trim())
      novosErros.email = 'E-mail obrigatório.'
    else if (!/\S+@\S+\.\S+/.test(email))
      novosErros.email = 'E-mail inválido.'

    if (!senha)
      novosErros.senha = 'Senha obrigatória.'
    else if (senha.length < 6)
      novosErros.senha = 'Mínimo 6 caracteres.'

    if (!confirmarSenha)
      novosErros.confirmarSenha = 'Confirme sua senha.'
    else if (senha !== confirmarSenha)
      novosErros.confirmarSenha = 'As senhas não coincidem.'

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

    navigate("/TelaDeEscolha")
  }

  return (
    <div className="cadastro-page">
      <div className="cadastro-container">
        <div className="cadastro-card">
          <h1>Criar conta</h1>
          <p className="subtitulo">Preencha os dados para se cadastrar.</p>

          <div className="campo">
            <label>Nome completo</label>
            <input
              type="text"
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={erros.nome ? 'campo--erro' : ''}
            />
            {erros.nome && <span className="erro-msg">{erros.nome}</span>}
          </div>

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

          <div className="campo">
            <label>Confirmar senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className={erros.confirmarSenha ? 'campo--erro' : ''}
            />
            {erros.confirmarSenha && <span className="erro-msg">{erros.confirmarSenha}</span>}
          </div>

          <div className='botoes-inferiores'>
            <Link to="/" className="btn-voltar">Voltar</Link>
            <button className="btn-cadastrar" onClick={handleCadastro}>
             Cadastrar
            </button>
          </div>

          <div className="cadastro-footer">
            Já tem conta? <a href="/login">Entrar</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Cadastro
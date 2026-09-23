import '../styles/LandingPage.css'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const PASSOS = [
  { n: '1', titulo: 'Crie sua conta',    desc: 'Escolha seu perfil e aguarde aprovação.' },
  { n: '2', titulo: 'Cadastre o evento', desc: 'Defina datas, local e público estimado.' },
  { n: '3', titulo: 'Receba propostas',  desc: 'Fornecedores enviam cotações.' },
  { n: '4', titulo: 'Calcule o ingresso', desc: 'O sistema estima o ticket ideal.' },
]

function LandingPage() {
  return (
    <div>

      {/* NAVBAR */}
      <nav className="navbar">
        <span className="navbar__logo">🎟 TrocaTicket</span>
        <div className="navbar__links">
          <Link to="/login" className="navbar__entrar">Entrar</Link>
          <Link to ="/Cadastro" className="navbar__cadastro">Criar conta</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <h1 className="hero__titulo">
          Planeje. Conecte. <span className="hero__destaque">Precifique.</span>
        </h1>
        <p className="hero__subtitulo">
          A TrocaTicket reúne organizadores e fornecedores para planejar
          eventos e calcular o preço justo do ingresso.
        </p>
        <Link to ="/cadastro" className="hero__btn">
          Começar agora.
        </Link>
      </section>

      {/* COMO FUNCIONA */}
      <section className="como-funciona">
        <h2 className="como-funciona__titulo">Como funciona</h2>
        <div className="como-funciona__grid">
          {PASSOS.map((passo) => (
            <div key={passo.n} className="passo">
              <div className="passo__numero">{passo.n}</div>
              <h3 className="passo__titulo">{passo.titulo}</h3>
              <p className="passo__desc">{passo.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage
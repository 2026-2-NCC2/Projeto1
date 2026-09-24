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
      {/* HERO */}
      <section className="bg-[#001635] px-8 py-24 text-center">
        <h1 className="text-[32px] md:text-5xl font-black text-white mb-4">
          Planeje. Conecte. <span className="text-verde">Precifique.</span>
        </h1>
        <p className="text-white/60 text-lg max-w-[560px] mx-auto mb-8 leading-relaxed">
          A TrocaTicket reúne organizadores e fornecedores para planejar
          eventos e calcular o preço justo do ingresso.
        </p>
        <Link to="/cadastro" className="inline-block bg-white text-navy font-bold px-8 py-4 rounded-md no-underline cursor-pointer">
          Começar agora.
        </Link>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-white px-8 py-16">
        <h2 className="text-[32px] font-bold text-navy text-center mb-10">Como funciona</h2>
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4 gap-6 max-w-[960px] mx-auto">
          {PASSOS.map((passo) => (
            <div key={passo.n} className="bg-[#F7F8FA] border border-borda rounded-xl p-6 text-center">
              <div className="size-10 rounded-full bg-navy text-verde font-bold text-base flex items-center justify-center mx-auto mb-4">
                {passo.n}
              </div>
              <h3 className="font-bold text-navy mb-2">{passo.titulo}</h3>
              <p className="text-muted text-sm leading-normal">{passo.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage

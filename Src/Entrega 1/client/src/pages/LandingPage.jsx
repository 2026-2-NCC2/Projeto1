import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const CATEGORIAS = [
  { titulo: 'Shows e música', texto: 'Descubra apresentações e novos artistas.', icone: '♫', cor: 'text-[#6a3fd1]', fundo: 'bg-[#f3effb]', brilho: 'bg-[#6a3fd1]' },
  { titulo: 'Cultura e teatro', texto: 'Encontre espetáculos e experiências culturais.', icone: '✦', cor: 'text-[#e91e8c]', fundo: 'bg-[#fceaf4]', brilho: 'bg-[#e91e8c]' },
  { titulo: 'Festivais e encontros', texto: 'Explore eventos para compartilhar bons momentos.', icone: '⌖', cor: 'text-[#f5821f]', fundo: 'bg-[#fff1e5]', brilho: 'bg-[#f5821f]' },
]

const ETAPAS = [
  { titulo: 'Encontre um evento', texto: 'Explore opções e descubra experiências que combinam com você.' },
  { titulo: 'Escolha seu ingresso', texto: 'Consulte as informações do evento em um só lugar.' },
  { titulo: 'Aproveite com tranquilidade', texto: 'Tenha os detalhes do seu evento sempre à mão.' },
]

function LandingPage() {
  return (
    <main className="bg-white text-[#161a2e]">
      <section className="overflow-hidden bg-[#f6f7fb]">
        <div className="mx-auto grid min-h-[485px] w-[calc(100%_-_48px)] max-w-[1180px] grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] items-center gap-12 py-[68px] max-[760px]:w-[calc(100%_-_36px)] max-[760px]:max-w-[560px] max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:py-[54px] max-[760px]:pb-10">
          <div className="max-w-[620px]">
            <span className="inline-block text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-[#1e4fa0]">Eventos e ingressos em um só lugar</span>
            <h1 className="my-4 text-[clamp(38px,5vw,62px)] font-extrabold leading-[1.06] tracking-[-0.055em] text-[#161a2e]">
              Encontre seu próximo <span className="text-[#1e4fa0]">grande momento.</span>
            </h1>
            <p className="mb-[26px] max-w-[510px] text-base leading-[1.7] text-[#5b6178]">
              Descubra eventos, conheça novas experiências e tenha tudo o que precisa
              para aproveitar cada momento.
            </p>
            <div className="flex max-w-[560px] items-center gap-3 rounded-full border border-[#e3e6ef] bg-white py-[7px] pl-[17px] pr-2 shadow-[0_8px_24px_rgba(20,24,51,0.08)] max-[480px]:gap-2 max-[480px]:pl-3" aria-label="Busca ilustrativa">
              <span className="text-2xl leading-none text-[#8a90a6]" aria-hidden="true">⌕</span>
              <input
                type="search"
                aria-label="Busca ilustrativa de eventos"
                className="w-full min-w-0 border-0 bg-transparent py-[10px] text-[13px] text-[#5b6178] outline-none placeholder:text-[#8a90a6] max-[480px]:text-[11px]"
                placeholder="Busque eventos, artistas ou lugares"
                readOnly
              />
              <Link to="/PainelDeEventos" className="shrink-0 rounded-full bg-[#161a2e] px-5 py-3 text-[13px] font-bold text-white no-underline transition hover:-translate-y-px hover:bg-[#1e4fa0] max-[480px]:px-[14px] max-[480px]:py-[11px] max-[480px]:text-xs">Explorar</Link>
            </div>
            <div className="mt-[18px] flex flex-wrap items-center gap-[14px] text-xs max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-1.5">
              <a className="font-bold text-[#1e4fa0] no-underline" href="#categorias">Descobrir categorias</a>
              <span className="text-[#8a90a6]">Uma experiência simples, do começo ao evento.</span>
            </div>
          </div>

          <div className="isolate relative grid min-h-[320px] place-items-center max-[760px]:min-h-[270px]" aria-label="Ilustração de um ingresso digital" role="img">
            <div className="absolute -z-10 aspect-square w-[min(330px,80%)] rounded-full bg-[linear-gradient(135deg,rgba(106,63,209,0.16),rgba(233,30,140,0.12),rgba(245,130,31,0.13))] blur-[3px]" />
            <div className="w-[min(330px,86%)] rotate-[5deg] rounded-[20px] border border-white/60 bg-[linear-gradient(145deg,#1e4fa0_0%,#563ab4_56%,#812fa1_100%)] p-[22px] text-white shadow-[0_25px_60px_rgba(30,48,122,0.25)] max-[760px]:w-[min(300px,78%)]">
              <div className="flex items-center justify-between gap-3 text-[9px] font-extrabold tracking-[0.12em]">
                <span className="grid size-[34px] place-items-center rounded-[11px] bg-white text-xs tracking-[-0.06em] text-[#1e4fa0]">TT</span>
                <span>SEU PRÓXIMO EVENTO</span>
              </div>
              <div className="relative flex min-h-[174px] items-end border-b border-dashed border-white/35 py-6 max-[760px]:min-h-[150px]">
                <span className="absolute right-[17px] top-[23px] text-[52px] text-[#ffb74b]">✦</span>
                <p className="m-0 text-[34px] font-extrabold leading-[1.02] tracking-[-0.05em] text-white">Momentos<br />que ficam.</p>
              </div>
              <div className="flex items-center justify-between gap-3 pt-4 text-[9px] font-extrabold tracking-[0.12em] text-white/70">
                <span>VIVA A EXPERIÊNCIA</span>
                <span className="h-[23px] w-[66px] bg-[repeating-linear-gradient(90deg,#fff_0_2px,transparent_2px_4px,#fff_4px_5px,transparent_5px_8px)]" aria-hidden="true" />
              </div>
            </div>
            <span className="absolute bottom-[14px] right-0 rotate-[-4deg] rounded-full border border-[#e3e6ef] bg-white px-[15px] py-[10px] text-[11px] font-bold text-[#5b6178] shadow-[0_8px_20px_rgba(20,24,51,0.08)] max-[760px]:right-[4%] max-[760px]:bottom-[7px]">Descubra. Escolha. Aproveite.</span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[calc(100%_-_48px)] max-w-[1180px] py-[68px] pb-[76px] max-[760px]:w-[calc(100%_-_36px)] max-[760px]:max-w-[560px] max-[760px]:py-[52px] max-[760px]:pb-[58px]" id="categorias">
        <div className="mb-6 flex items-end justify-between gap-6 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-3">
          <div>
            <span className="inline-block text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-[#1e4fa0]">Inspire-se</span>
            <h2 className="mb-0 mt-2 text-[clamp(25px,3vw,34px)] font-extrabold leading-[1.15] tracking-[-0.04em] text-[#161a2e]">O que você quer viver?</h2>
          </div>
          <Link className="shrink-0 text-[13px] font-bold text-[#1e4fa0] no-underline" to="/PainelDeEventos">Ver eventos <span aria-hidden="true">→</span></Link>
        </div>
        <div className="grid grid-cols-3 gap-[18px] max-[760px]:grid-cols-1">
          {CATEGORIAS.map((categoria) => (
            <Link
              className="group relative flex min-h-[205px] flex-col items-start overflow-hidden rounded-[18px] border border-[#e3e6ef] bg-white p-[23px] no-underline shadow-[0_1px_2px_rgba(20,24,51,0.04)] transition duration-150 hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgba(20,24,51,0.1)] max-[760px]:min-h-[175px]"
              key={categoria.titulo}
              to="/PainelDeEventos"
            >
              <span className={`absolute -bottom-12 -right-8 size-[155px] rounded-full opacity-[0.11] ${categoria.brilho}`} aria-hidden="true" />
              <span className={`mb-[22px] grid size-[42px] place-items-center rounded-[13px] text-[22px] ${categoria.fundo} ${categoria.cor}`} aria-hidden="true">{categoria.icone}</span>
              <span className="absolute right-6 top-[25px] text-lg text-[#8a90a6]" aria-hidden="true">↗</span>
              <h3 className="z-[1] mb-1.5 text-base font-bold text-[#161a2e]">{categoria.titulo}</h3>
              <p className="z-[1] m-0 max-w-[28ch] text-[13px] leading-[1.55] text-[#5b6178]">{categoria.texto}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#f6f7fb] py-[65px] pb-[72px] max-[760px]:py-[52px] max-[760px]:pb-[58px]" id="como-funciona">
        <div className="mx-auto w-[calc(100%_-_48px)] max-w-[1180px] max-[760px]:w-[calc(100%_-_36px)] max-[760px]:max-w-[560px]">
          <div className="mb-6 flex justify-center gap-6 text-center max-[480px]:items-center max-[480px]:flex-col max-[480px]:gap-3">
            <div>
              <span className="inline-block text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-[#1e4fa0]">Sem complicação</span>
              <h2 className="mb-0 mt-2 text-[clamp(25px,3vw,34px)] font-extrabold leading-[1.15] tracking-[-0.04em] text-[#161a2e]">Uma jornada simples até o seu evento</h2>
            </div>
          </div>
          <div className="mt-[34px] grid grid-cols-3 gap-[18px] max-[760px]:grid-cols-1">
            {ETAPAS.map((etapa, index) => (
              <article className="rounded-2xl border border-[#e3e6ef] bg-white p-[23px_22px]" key={etapa.titulo}>
                <span className="mb-5 inline-grid size-[38px] place-items-center rounded-full bg-[linear-gradient(135deg,rgba(30,79,160,0.1),rgba(245,130,31,0.12))] text-xs font-extrabold text-[#1e4fa0]">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mb-2 text-base font-bold text-[#161a2e]">{etapa.titulo}</h3>
                <p className="m-0 text-[13px] leading-[1.6] text-[#5b6178]">{etapa.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto my-[62px] flex w-[calc(100%_-_48px)] max-w-[1180px] items-center justify-between gap-7 rounded-[20px] border border-[#e3e6ef] bg-[linear-gradient(120deg,#f5f6fc,#fff8f1)] p-[34px_38px] max-[760px]:my-[42px] max-[760px]:w-[calc(100%_-_36px)] max-[760px]:max-w-[560px] max-[760px]:items-start max-[760px]:flex-col max-[760px]:p-[26px]">
        <div>
          <span className="inline-block text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-[#1e4fa0]">Seu próximo momento começa aqui</span>
          <h2 className="mb-0 mt-2 text-[clamp(25px,3vw,34px)] font-extrabold leading-[1.15] tracking-[-0.04em] text-[#161a2e]">Pronto para descobrir algo novo?</h2>
          <p className="mb-0 mt-[10px] max-w-[58ch] text-sm text-[#5b6178]">Explore a página de eventos e encontre a próxima experiência para guardar na memória.</p>
        </div>
        <Link to="/PainelDeEventos" className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#161a2e] px-5 py-3 text-[13px] font-bold text-white no-underline transition hover:-translate-y-px hover:bg-[#1e4fa0]">Explorar eventos <span aria-hidden="true">→</span></Link>
      </section>

      <Footer />
    </main>
  )
}

export default LandingPage

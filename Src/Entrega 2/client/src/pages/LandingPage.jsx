import { useState } from 'react'
import { Link } from 'react-router-dom'

const CATEGORIAS = [
  { titulo: 'Shows e música', texto: 'Descubra apresentações e novos artistas.', icone: '♫', cor: 'text-tt-roxo-principal', fundo: 'bg-tt-lilas-claro', brilho: 'bg-tt-roxo-principal' },
  { titulo: 'Cultura e teatro', texto: 'Encontre espetáculos e experiências culturais.', icone: '✦', cor: 'text-tt-rosa-principal', fundo: 'bg-tt-rosa-claro', brilho: 'bg-tt-rosa-principal' },
  { titulo: 'Festivais e encontros', texto: 'Explore eventos para compartilhar bons momentos.', icone: '⌖', cor: 'text-tt-laranja-principal', fundo: 'bg-tt-laranja-claro', brilho: 'bg-tt-laranja-principal' },
]

const ETAPAS = [
  { titulo: 'Encontre um evento', texto: 'Explore opções e descubra experiências que combinam com você.' },
  { titulo: 'Escolha seu ingresso', texto: 'Consulte as informações do evento em um só lugar.' },
  { titulo: 'Aproveite com tranquilidade', texto: 'Tenha os detalhes do seu evento sempre à mão.' },
]

function LandingPage() {
  // animacao do ingresso: 'parado' -> 'caindo' (hinge) -> 'voltando' (backInDown) -> 'parado'
  const [animTicket, setAnimTicket] = useState('parado')

  // clicar (ou apertar Enter/espaco) no ingresso faz ele cair, se ja nao estiver animando
  function animarTicket() {
    if (animTicket === 'parado') setAnimTicket('caindo')
  }

  // quando uma animacao termina passa pra proxima etapa
  function fimAnimacaoTicket(e) {
    if (e.target !== e.currentTarget) return
    setAnimTicket(animTicket === 'caindo' ? 'voltando' : 'parado')
  }

  // classes do Animate.css de cada etapa
  const classeAnimTicket = {
    parado: '',
    caindo: 'animate__animated animate__hinge',
    voltando: 'animate__animated animate__backInDown',
  }[animTicket]

  return (
    <div className="bg-tt-branco text-tt-azul-marinho">
      <section className="overflow-hidden bg-[image:var(--tt-gradiente-suave)]">
        <div className="mx-auto grid min-h-[485px] w-[calc(100%_-_48px)] max-w-[1180px] grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] items-center gap-12 py-[68px] max-[760px]:w-[calc(100%_-_36px)] max-[760px]:max-w-[560px] max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:py-[54px] max-[760px]:pb-10">
          <div className="max-w-[620px]">
            <span className="inline-block text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-tt-roxo-principal">Eventos e ingressos em um só lugar</span>
            <h1 className="my-4 text-[clamp(38px,5vw,62px)] font-extrabold leading-[1.06] tracking-[-0.055em] text-tt-azul-marinho">
              Encontre seu próximo <span className="text-tt-azul-principal">grande momento.</span>
            </h1>
            <p className="mb-[26px] max-w-[510px] text-base leading-[1.7] text-tt-grafite/75">
              Descubra eventos, conheça novas experiências e tenha tudo o que precisa
              para aproveitar cada momento.
            </p>
            <div className="flex max-w-[560px] items-center gap-3 rounded-xl border border-tt-azul-marinho/12 bg-tt-branco py-[7px] pl-[17px] pr-2 shadow-[0_8px_24px_color-mix(in_srgb,var(--tt-azul-marinho)_8%,transparent)] max-[480px]:gap-2 max-[480px]:pl-3" aria-label="Busca ilustrativa">
              <span className="text-2xl leading-none text-tt-grafite/60" aria-hidden="true">⌕</span>
              <input
                type="search"
                aria-label="Busca ilustrativa de eventos"
                className="w-full min-w-0 border-0 bg-transparent py-[10px] text-[13px] text-tt-grafite/75 outline-none placeholder:text-tt-grafite/60 max-[480px]:text-[11px]"
                placeholder="Busque eventos, artistas ou lugares"
                readOnly
              />
              <Link to="/PainelDeEventos" className="shrink-0 rounded-lg bg-[image:var(--tt-gradiente-botao)] px-5 py-3 text-[13px] font-bold text-tt-branco no-underline transition hover:brightness-110 hover:shadow-[0_8px_20px_color-mix(in_srgb,var(--tt-rosa-principal)_30%,transparent)] max-[480px]:px-[14px] max-[480px]:py-[11px] max-[480px]:text-xs">Explorar</Link>
            </div>
            <div className="mt-[18px] flex flex-wrap items-center gap-[14px] text-xs max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-1.5">
              <a className="font-bold text-tt-azul-principal no-underline" href="#categorias">Descobrir categorias</a>
              <span className="text-tt-grafite/60">Uma experiência simples, do começo ao evento.</span>
            </div>
          </div>

          <div className="isolate relative grid min-h-[320px] place-items-center max-[760px]:min-h-[270px]">
            <div className="absolute -z-10 aspect-square w-[min(330px,80%)] rounded-full bg-[image:var(--tt-gradiente-principal)] opacity-15 blur-[3px]" />
            {/* ingresso clicavel: ao clicar ele despenca (animate__hinge) e depois volta descendo */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Ingresso digital ilustrativo, clique para animar"
              title="Clique no ingresso"
              onClick={animarTicket}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); animarTicket() } }}
              onAnimationEnd={fimAnimacaoTicket}
              className={`${classeAnimTicket} w-[min(330px,86%)] cursor-pointer rotate-[5deg] rounded-[20px] outline-none focus-visible:ring-4 focus-visible:ring-tt-azul-suave max-[760px]:w-[min(300px,78%)]`}
            >
            <div className="rounded-[20px] border border-tt-branco/60 bg-[image:var(--tt-gradiente-azul-roxo)] p-[22px] text-tt-branco shadow-[0_25px_60px_color-mix(in_srgb,var(--tt-azul-principal)_25%,transparent)]">
              <div className="flex items-center justify-between gap-3 text-[9px] font-extrabold tracking-[0.12em]">
                <span className="grid size-[34px] place-items-center rounded-[11px] bg-tt-branco text-xs tracking-[-0.06em] text-tt-azul-principal">TT</span>
                <span>SEU PRÓXIMO EVENTO</span>
              </div>
              <div className="relative flex min-h-[174px] items-end border-b border-dashed border-tt-branco/35 py-6 max-[760px]:min-h-[150px]">
                <span className="absolute right-[17px] top-[23px] text-[52px] text-tt-laranja-vivo">✦</span>
                <p className="m-0 text-[34px] font-extrabold leading-[1.02] tracking-[-0.05em] text-tt-branco">Momentos<br />que ficam.</p>
              </div>
              <div className="flex items-center justify-between gap-3 pt-4 text-[9px] font-extrabold tracking-[0.12em] text-tt-branco/70">
                <span>VIVA A EXPERIÊNCIA</span>
                <span className="h-[23px] w-[66px] bg-[repeating-linear-gradient(90deg,var(--tt-branco)_0_2px,transparent_2px_4px,var(--tt-branco)_4px_5px,transparent_5px_8px)]" aria-hidden="true" />
              </div>
            </div>
            </div>
            <span className="absolute bottom-[14px] right-0 rotate-[-4deg] rounded-lg border border-tt-azul-marinho/12 bg-tt-branco px-[15px] py-[10px] text-[11px] font-bold text-tt-grafite/75 shadow-[0_8px_20px_color-mix(in_srgb,var(--tt-azul-marinho)_8%,transparent)] max-[760px]:right-[4%] max-[760px]:bottom-[7px]">Descubra. Escolha. Aproveite.</span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[calc(100%_-_48px)] max-w-[1180px] py-[68px] pb-[76px] max-[760px]:w-[calc(100%_-_36px)] max-[760px]:max-w-[560px] max-[760px]:py-[52px] max-[760px]:pb-[58px]" id="categorias">
        <div className="mb-6 flex items-end justify-between gap-6 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-3">
          <div>
            <span className="inline-block text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-tt-roxo-principal">Inspire-se</span>
            <h2 className="mb-0 mt-2 text-[clamp(25px,3vw,34px)] font-extrabold leading-[1.15] tracking-[-0.04em] text-tt-azul-marinho">O que você quer viver?</h2>
          </div>
          <Link className="shrink-0 text-[13px] font-bold text-tt-azul-principal no-underline" to="/PainelDeEventos">Ver eventos <span aria-hidden="true">→</span></Link>
        </div>
        <div className="grid grid-cols-3 gap-[18px] max-[760px]:grid-cols-1">
          {CATEGORIAS.map((categoria) => (
            <Link
              className="group relative flex min-h-[205px] flex-col items-start overflow-hidden rounded-[18px] border border-tt-azul-marinho/12 bg-tt-branco p-[23px] no-underline shadow-[0_1px_2px_color-mix(in_srgb,var(--tt-azul-marinho)_4%,transparent)] transition duration-150 hover:-translate-y-[3px] hover:shadow-[0_12px_28px_color-mix(in_srgb,var(--tt-azul-marinho)_10%,transparent)] max-[760px]:min-h-[175px]"
              key={categoria.titulo}
              to="/PainelDeEventos"
            >
              <span className={`absolute -bottom-12 -right-8 size-[155px] rounded-full opacity-[0.11] ${categoria.brilho}`} aria-hidden="true" />
              <span className={`mb-[22px] grid size-[42px] place-items-center rounded-[13px] text-[22px] ${categoria.fundo} ${categoria.cor}`} aria-hidden="true">{categoria.icone}</span>
              <span className="absolute right-6 top-[25px] text-lg text-tt-grafite/60" aria-hidden="true">↗</span>
              <h3 className="z-[1] mb-1.5 text-base font-bold text-tt-azul-marinho">{categoria.titulo}</h3>
              <p className="z-[1] m-0 max-w-[28ch] text-[13px] leading-[1.55] text-tt-grafite/75">{categoria.texto}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-tt-cinza-claro py-[65px] pb-[72px] max-[760px]:py-[52px] max-[760px]:pb-[58px]" id="como-funciona">
        <div className="mx-auto w-[calc(100%_-_48px)] max-w-[1180px] max-[760px]:w-[calc(100%_-_36px)] max-[760px]:max-w-[560px]">
          <div className="mb-6 flex justify-center gap-6 text-center max-[480px]:items-center max-[480px]:flex-col max-[480px]:gap-3">
            <div>
              <span className="inline-block text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-tt-roxo-principal">Sem complicação</span>
              <h2 className="mb-0 mt-2 text-[clamp(25px,3vw,34px)] font-extrabold leading-[1.15] tracking-[-0.04em] text-tt-azul-marinho">Uma jornada simples até o seu evento</h2>
            </div>
          </div>
          <div className="mt-[34px] grid grid-cols-3 gap-[18px] max-[760px]:grid-cols-1">
            {ETAPAS.map((etapa, index) => (
              <article className="rounded-2xl border border-tt-azul-marinho/12 bg-tt-branco p-[23px_22px]" key={etapa.titulo}>
                <span className="mb-5 inline-grid size-[38px] place-items-center rounded-full bg-tt-azul-suave text-xs font-extrabold text-tt-azul-principal">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mb-2 text-base font-bold text-tt-azul-marinho">{etapa.titulo}</h3>
                <p className="m-0 text-[13px] leading-[1.6] text-tt-grafite/75">{etapa.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto my-[62px] flex w-[calc(100%_-_48px)] max-w-[1180px] items-center justify-between gap-7 rounded-[20px] border border-tt-azul-marinho/12 bg-tt-laranja-claro p-[34px_38px] max-[760px]:my-[42px] max-[760px]:w-[calc(100%_-_36px)] max-[760px]:max-w-[560px] max-[760px]:items-start max-[760px]:flex-col max-[760px]:p-[26px]">
        <div>
          <span className="inline-block text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-tt-roxo-principal">Seu próximo momento começa aqui</span>
          <h2 className="mb-0 mt-2 text-[clamp(25px,3vw,34px)] font-extrabold leading-[1.15] tracking-[-0.04em] text-tt-azul-marinho">Pronto para descobrir algo novo?</h2>
          <p className="mb-0 mt-[10px] max-w-[58ch] text-sm text-tt-grafite/75">Explore a página de eventos e encontre a próxima experiência para guardar na memória.</p>
        </div>
        <Link to="/PainelDeEventos" className="inline-flex shrink-0 items-center gap-3 rounded-lg bg-[image:var(--tt-gradiente-botao)] px-5 py-3 text-[13px] font-bold text-tt-branco no-underline transition hover:brightness-110 hover:shadow-[0_8px_20px_color-mix(in_srgb,var(--tt-rosa-principal)_30%,transparent)]">Explorar eventos <span aria-hidden="true">→</span></Link>
      </section>

    </div>
  )
}

export default LandingPage

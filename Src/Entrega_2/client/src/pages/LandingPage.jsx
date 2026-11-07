import { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import Sticker from '../components/Sticker'
import { Link, useNavigate } from 'react-router-dom'
import { solicitar } from '../services/api'
import { rolarAteSecao } from '../utils/rolagem'

const CATEGORIAS = [
  { titulo: 'Shows e música', texto: 'Descubra apresentações e novos artistas.', icone: '♫', cor: 'text-tt-branco', fundo: 'bg-tt-azul-marinho', brilho: 'bg-tt-roxo-vivo' },
  { titulo: 'Cultura e teatro', texto: 'Encontre espetáculos e experiências culturais.', icone: '✦', cor: 'text-tt-branco', fundo: 'bg-tt-azul-marinho', brilho: 'bg-tt-rosa-vivo' },
  { titulo: 'Festivais e encontros', texto: 'Explore eventos para compartilhar bons momentos.', icone: '⌖', cor: 'text-tt-branco', fundo: 'bg-tt-azul-marinho', brilho: 'bg-tt-laranja-principal' },
]

const ETAPAS = [
  { titulo: 'Encontre um evento', texto: 'Explore opções e descubra experiências que combinam com você.' },
  { titulo: 'Escolha seu ingresso', texto: 'Consulte as informações do evento em um só lugar.' },
  { titulo: 'Aproveite com tranquilidade', texto: 'Tenha os detalhes do seu evento sempre à mão.' },
]

// Indicadores da faixa escura: vêm do banco (GET /api/eventos), nada fixo no código.
// O sistema ainda não vende ingressos nem tem cidades cadastradas, então só existe
// o número de eventos publicados. Se a API falhar ou não houver eventos, a faixa não aparece.
function useIndicadores() {
  const [indicadores, setIndicadores] = useState([])

  useEffect(() => {
    async function carregar() {
      try {
        const eventos = await solicitar('/eventos')
        const publicados = eventos.filter((e) => e.status_publicacao === 'Publicado').length
        setIndicadores(publicados > 0 ? [{ rotulo: 'Eventos publicados', valor: publicados.toLocaleString('pt-BR') }] : [])
      } catch {
        // se der erro a faixa so nao aparece
      }
    }
    carregar()
  }, [])

  return indicadores
}

function LandingPage() {
  const indicadores = useIndicadores()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')

  return (
    <main className="bg-tt-azul-marinho text-tt-branco">
      <section className="relative overflow-hidden border-b border-tt-branco/25 bg-tt-azul-marinho">
        <span className="tt-blob tt-blob--violeta -right-24 -top-24 size-[460px] opacity-70" aria-hidden="true" />
        <span className="tt-blob -right-10 top-24 size-[380px] opacity-40 max-[760px]:top-[40%]" aria-hidden="true" />
        <span className="tt-blob -bottom-32 left-[18%] size-[420px] opacity-50" aria-hidden="true" />
        <span className="tt-globe absolute right-[4%] top-6 z-[1] size-[76px] !bg-tt-roxo-vivo max-[760px]:hidden" aria-hidden="true" />
        <span className="tt-semi-l absolute -left-0 bottom-10 z-[1] h-[72px] w-6 !bg-tt-destaque max-[760px]:hidden" aria-hidden="true" />
        <div className="relative z-[1] mx-auto grid min-h-[560px] w-[calc(100%_-_48px)] max-w-[1180px] grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] items-center gap-12 py-[68px] max-[760px]:w-[calc(100%_-_36px)] max-[760px]:max-w-[560px] max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:py-[54px] max-[760px]:pb-10">
          <div className="max-w-[620px]">
            <span className="tt-eyebrow select-none text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-tt-branco before:bg-tt-branco">Eventos e ingressos em um só lugar</span>
            <h1 className="tt-display my-5 select-none text-[clamp(34px,5.4vw,76px)] text-tt-branco">
              Encontre seu próximo <span className="tt-outline-claro">grande momento.</span>
            </h1>
            <p className="mb-[26px] max-w-[510px] text-base leading-[1.7] text-tt-branco/80">
              Descubra eventos, conheça novas experiências e tenha tudo o que precisa
              para aproveitar cada momento.
            </p>
            <form
              role="search"
              className="flex max-w-[560px] items-center gap-3 border-[1.5px] border-tt-azul-marinho bg-tt-branco py-[7px] pl-[17px] pr-2 shadow-[6px_6px_0_var(--tt-roxo-vivo)] max-[480px]:gap-2 max-[480px]:pl-3"
              onSubmit={(e) => {
                e.preventDefault()
                const termo = busca.trim()
                navigate(termo ? `/PainelDeEventos?q=${encodeURIComponent(termo)}` : '/PainelDeEventos')
              }}
            >
              <span className="text-2xl leading-none text-tt-grafite/65" aria-hidden="true">⌕</span>
              <input
                type="search"
                aria-label="Buscar eventos"
                className="w-full min-w-0 border-0 bg-transparent py-[10px] text-[13px] text-tt-grafite outline-none placeholder:text-tt-grafite/65 max-[480px]:text-[11px]"
                placeholder="Busque eventos, artistas ou lugares"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <button type="submit" className="shrink-0 cursor-pointer border-0 bg-tt-laranja-principal px-5 py-3 text-[13px] font-bold text-tt-azul-marinho transition hover:-translate-y-px hover:bg-tt-laranja-vivo max-[480px]:px-[14px] max-[480px]:py-[11px] max-[480px]:text-xs">Explorar</button>
            </form>
            <div className="mt-[18px] flex flex-wrap items-center gap-[14px] text-xs max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-1.5">
              <a className="font-bold text-tt-branco underline decoration-tt-roxo-suave decoration-2 underline-offset-4" href="#categorias" onClick={rolarAteSecao}>Descobrir categorias</a>
              <span className="text-tt-branco/70">Uma experiência simples, do começo ao evento.</span>
            </div>
          </div>

        <div className="isolate relative grid min-h-[320px] place-items-center max-[760px]:min-h-[270px]" aria-label="Ilustração de um ingresso digital" role="img">
  <div className="absolute -z-10 aspect-square w-[min(380px,90%)] rounded-full bg-[image:var(--tt-gradiente-principal)] opacity-60 blur-[40px]" />

  {/* wrapper novo: só cuida do tamanho e da animação */}
  <div className="relative w-[min(330px,86%)] max-[760px]:w-[min(300px,78%)]">
    {/* ingresso: mantém a inclinação e ocupa 100% do wrapper */}
    <div className="relative w-full rotate-[4deg] overflow-hidden border-[1.5px] border-tt-azul-marinho bg-tt-branco p-[22px] text-tt-azul-marinho shadow-[10px_10px_0_var(--tt-roxo-vivo)]">
      <span className="absolute -left-4 top-[46%] size-8 rounded-full bg-tt-azul-marinho" aria-hidden="true" />
      <span className="absolute -right-4 top-[46%] size-8 rounded-full bg-tt-azul-marinho" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3 text-[9px] font-extrabold tracking-[0.12em]">
        <span className="grid size-[34px] place-items-center bg-tt-azul-marinho text-xs tracking-[-0.06em] text-tt-branco">TT</span>
        <span>SEU PRÓXIMO EVENTO</span>
      </div>
      <div className="relative flex min-h-[174px] items-end border-b border-dashed border-tt-azul-marinho/35 py-6 max-[760px]:min-h-[150px]">
        <span className="absolute right-[17px] top-[23px] text-[52px] text-tt-rosa-vivo">✦</span>
        <p className="tt-display m-0 text-[30px] text-tt-azul-marinho" style={{ fontStretch: '118%' }}>Momentos<br />que ficam.</p>
      </div>
      <div className="flex items-center justify-between gap-3 pt-4 text-[9px] font-extrabold tracking-[0.12em] text-tt-grafite/70">
        <span>VIVA A EXPERIÊNCIA</span>
        <span className="h-[23px] w-[66px] bg-[repeating-linear-gradient(90deg,var(--tt-azul-marinho)_0_2px,transparent_2px_4px,var(--tt-azul-marinho)_4px_5px,transparent_5px_8px)]" aria-hidden="true" />
      </div>
    </div>
  </div>

  {/* adesivos colados em volta do ingresso */}
  <Sticker nome="cd" tamanho={104} rotate={12} className="-top-3 right-0 max-[760px]:right-1 max-[760px]:top-0 max-[760px]:w-[76px]" />
  <Sticker nome="estrela" tamanho={86} rotate={-14} delay={1.2} className="bottom-6 left-0 max-[760px]:left-1 max-[760px]:w-[64px]" />

  <span className="absolute bottom-[14px] right-0 rotate-[-4deg] border-[1.5px] border-tt-azul-marinho bg-tt-laranja-principal px-[15px] py-[10px] text-[11px] font-bold text-tt-azul-marinho max-[760px]:right-[4%] max-[760px]:bottom-[7px]">Descubra. Escolha. Aproveite.</span>
      </div>
        </div>
      </section>

      {indicadores.length > 0 && (
       <section className="relative overflow-hidden border-b border-tt-branco/25 bg-tt-roxo-vivo">
              <span className="tt-blob left-[30%] -top-24 h-[200px] w-[420px] opacity-40" aria-hidden="true" />
              <div className="relative z-[1] mx-auto flex w-[calc(100%-48px)] max-w-[1180px] divide-x divide-tt-branco/30 py-9 max-[560px]:flex-col max-[560px]:divide-x-0 max-[560px]:divide-y max-[560px]:py-4">
                 {indicadores.map((s) => (
              <div key={s.rotulo} className="flex flex-1 flex-col items-start gap-1 px-6 max-[560px]:py-4">
                 <span className="tt-display text-[clamp(30px,4.4vw,56px)] text-tt-branco">{s.valor}</span>
                   <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tt-branco/90">{s.rotulo}</span>
              </div>
                     ))}
               </div>
                  </section>
      )}

      <section className="relative mx-auto w-[calc(100%_-_48px)] max-w-[1180px] py-[84px] pb-[92px] max-[760px]:w-[calc(100%_-_36px)] max-[760px]:max-w-[560px] max-[760px]:py-[52px] max-[760px]:pb-[58px]" id="categorias">
        <Sticker nome="vinil" tamanho={104} rotate={-10} delay={0.6} className="right-[24%] top-[40px] hidden min-[1000px]:block" />
        <div className="mb-10 flex items-end justify-between gap-6 border-t border-tt-branco/30 pt-6 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-3">
          <div>
            <span className="tt-eyebrow text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-tt-branco before:bg-tt-branco">Inspire-se</span>
            <h2 className="tt-display mb-0 mt-3 text-[clamp(28px,4.2vw,58px)] text-tt-branco">O que você quer viver?</h2>
          </div>
          <Link className="shrink-0 border-b-2 border-tt-branco pb-0.5 text-[13px] font-bold text-tt-branco no-underline" to="/PainelDeEventos">Ver eventos <span aria-hidden="true">→</span></Link>
        </div>
        <div className="grid grid-cols-3 gap-[18px] max-[760px]:grid-cols-1">
          {CATEGORIAS.map((categoria) => (
            <Link
              className="group relative flex min-h-[205px] flex-col items-start overflow-hidden border-[1.5px] border-tt-azul-marinho bg-tt-branco p-[23px] no-underline transition duration-150 hover:-translate-y-[3px] hover:shadow-[6px_6px_0_var(--tt-roxo-vivo)] max-[760px]:min-h-[175px]"
              key={categoria.titulo}
              to="/PainelDeEventos"
            >
              <span className={`absolute -bottom-16 -right-10 size-[170px] rounded-full opacity-30 blur-[28px] transition-opacity duration-150 group-hover:opacity-70 ${categoria.brilho}`} aria-hidden="true" />
              <span className={`mb-[22px] grid size-[42px] place-items-center text-[22px] ${categoria.fundo} ${categoria.cor}`} aria-hidden="true">{categoria.icone}</span>
              <span className="absolute right-6 top-[25px] text-lg text-tt-azul-marinho" aria-hidden="true">↗</span>
              <h3 className="z-[1] mb-1.5 text-lg font-extrabold text-tt-azul-marinho">{categoria.titulo}</h3>
              <p className="z-[1] m-0 max-w-[28ch] text-[13px] leading-[1.55] text-tt-grafite/75">{categoria.texto}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-tt-branco/25 bg-tt-azul-marinho py-[84px] pb-[92px] max-[760px]:py-[52px] max-[760px]:pb-[58px]" id="como-funciona">
        <span className="tt-blob -left-24 top-10 size-[380px] opacity-40" aria-hidden="true" />
        <span className="tt-semi-r absolute -right-0 top-12 h-[110px] w-6 !bg-tt-roxo-vivo max-[760px]:hidden" aria-hidden="true" />
        <Sticker nome="fita" tamanho={150} rotate={-8} delay={1.4} className="left-[3%] top-[56px] hidden min-[1100px]:block" />
        <Sticker nome="globo" tamanho={84} rotate={10} delay={0.3} className="right-[9%] top-[44px] hidden min-[1100px]:block" />
        <div className="relative z-[1] mx-auto w-[calc(100%_-_48px)] max-w-[1180px] max-[760px]:w-[calc(100%_-_36px)] max-[760px]:max-w-[560px]">
          <div className="mb-6 flex justify-center gap-6 text-center max-[480px]:items-center max-[480px]:flex-col max-[480px]:gap-3">
            <div>
              <span className="tt-eyebrow text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-tt-branco before:bg-tt-branco">Sem complicação</span>
              <h2 className="tt-display mb-0 mt-3 text-[clamp(26px,4vw,52px)] text-tt-branco">Uma jornada simples até o seu evento</h2>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-3 border-[1.5px] border-tt-azul-marinho bg-tt-branco shadow-[10px_10px_0_var(--tt-roxo-vivo)] max-[760px]:grid-cols-1">
            {ETAPAS.map((etapa, index) => (
              // linha separando as etapas (menos antes da primeira): do lado no computador, em cima no celular
              <article className={`border-tt-azul-marinho p-[28px_26px] ${index > 0 ? 'border-l-[1.5px] max-[760px]:border-l-0 max-[760px]:border-t-[1.5px]' : ''}`} key={etapa.titulo}>
                <span className="tt-display tt-outline mb-6 block text-[64px] leading-none">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mb-2 text-lg font-extrabold text-tt-azul-marinho">{etapa.titulo}</h3>
                <p className="m-0 text-[13px] leading-[1.6] text-tt-grafite/75">{etapa.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto my-[84px] flex w-[calc(100%_-_48px)] max-w-[1180px] items-center justify-between gap-7 overflow-hidden border-[1.5px] border-tt-azul-marinho bg-tt-branco p-[48px_44px] shadow-[10px_10px_0_var(--tt-roxo-vivo)] max-[760px]:my-[42px] max-[760px]:w-[calc(100%_-_36px)] max-[760px]:max-w-[560px] max-[760px]:items-start max-[760px]:flex-col max-[760px]:p-[26px]">
        <span className="tt-semi-r absolute right-0 bottom-16 h-[90px] w-6 !bg-tt-destaque max-[760px]:hidden" aria-hidden="true" />
        <span className="tt-semi-l absolute left-0 top-14 h-[80px] w-6 !bg-tt-laranja-principal max-[760px]:hidden" aria-hidden="true" />
        <span className="tt-blob -right-20 -top-24 size-[420px] opacity-70" aria-hidden="true" />
        <span className="tt-blob tt-blob--violeta right-[22%] -bottom-40 size-[360px] opacity-60" aria-hidden="true" />
        <div className="relative z-[1]">
          <span className="tt-eyebrow text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em]">Seu próximo momento começa aqui</span>
          <h2 className="tt-display mb-0 mt-3 text-[clamp(26px,4vw,52px)] text-tt-azul-marinho">Pronto para descobrir algo novo?</h2>
          <p className="mb-0 mt-[14px] max-w-[58ch] text-sm font-medium text-tt-azul-marinho">Explore a página de eventos e encontre a próxima experiência para guardar na memória.</p>
        </div>
        <Link to="/PainelDeEventos" className="relative z-[1] inline-flex shrink-0 items-center gap-3 bg-tt-azul-marinho px-6 py-4 text-[13px] font-bold text-tt-branco no-underline transition hover:-translate-y-px hover:bg-tt-roxo-vivo">Explorar eventos <span aria-hidden="true">→</span></Link>
      </section>

      <Footer />
    </main>
  )
}

export default LandingPage

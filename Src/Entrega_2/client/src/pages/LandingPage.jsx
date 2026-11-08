import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Sticker from '../components/Sticker'
import Semicirculos from '../components/ui/Semicirculos'
import { IconBusca, IconHolofote, IconSeta, IconSetaDiagonal, IconSom, IconUsuarios } from '../components/ui/Icones'
import { btn, containerCls, linkEscuroCls } from '../components/ui/estilos'
import { solicitar } from '../services/api'
import { rolarAteSecao } from '../utils/rolagem'

// cada categoria tem uma cor pastel (roxos e azuis) que cresce no canto do card ao passar o mouse
const CATEGORIAS = [
  { titulo: 'Shows e música', texto: 'Descubra apresentações e novos artistas.', Icone: IconSom, fundo: 'bg-gel-ceu' },
  { titulo: 'Cultura e teatro', texto: 'Encontre espetáculos e experiências culturais.', Icone: IconHolofote, fundo: 'bg-gel-magenta' },
  { titulo: 'Festivais e encontros', texto: 'Explore eventos para compartilhar bons momentos.', Icone: IconUsuarios, fundo: 'bg-gel-indigo' },
]

const ETAPAS = [
  { titulo: 'Encontre um evento', texto: 'Explore opções e descubra experiências que combinam com você.', gel: 'bg-gel-indigo' },
  { titulo: 'Escolha seu ingresso', texto: 'Consulte as informações do evento em um só lugar.', gel: 'bg-gel-magenta' },
  { titulo: 'Aproveite com tranquilidade', texto: 'Tenha os detalhes do seu evento sempre à mão.', gel: 'bg-gel-ceu' },
]

// Indicadores: vêm do banco (GET /api/eventos), nada fixo no código.
// O sistema ainda não vende ingressos nem tem cidades cadastradas, então só existe
// o número de eventos publicados. Se a API falhar ou não houver eventos, nada aparece.
function useIndicadores() {
  const [indicadores, setIndicadores] = useState([])

  useEffect(() => {
    async function carregar() {
      try {
        const eventos = await solicitar('/eventos')
        const publicados = eventos.filter((e) => e.status_publicacao === 'Publicado').length
        setIndicadores(publicados > 0 ? [{ rotulo: 'eventos publicados', valor: publicados.toLocaleString('pt-BR') }] : [])
      } catch {
        // se der erro o indicador so nao aparece
      }
    }
    carregar()
  }, [])

  return indicadores
}

// ingresso da primeira dobra: inclina em 3D seguindo o mouse e um reflexo de luz passa por cima.
// quem pede menos movimento ve o ingresso parado. E so ilustracao (role="img").
function IngressoInterativo() {
  const ref = useRef(null)

  function mover(e) {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(x * 16).toFixed(2)}deg`)
    el.style.setProperty('--bx', `${((x + 0.5) * 100).toFixed(1)}%`)
    el.style.setProperty('--by', `${((y + 0.5) * 100).toFixed(1)}%`)
  }

  function sair() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--bx', '50%')
    el.style.setProperty('--by', '0%')
  }

  return (
    <div
      className="group/ingresso relative grid min-h-[460px] place-items-center [perspective:1100px] max-[860px]:min-h-[360px]"
      onPointerMove={mover}
      onPointerLeave={sair}
      role="img"
      aria-label="Ilustração de um ingresso de evento"
    >
      {/* ingresso: o wrapper gira (variaveis --rx/--ry), o ingresso fica levemente inclinado */}
      <div
        ref={ref}
        className="relative w-[min(400px,90%)] transition-transform duration-300 ease-saida [transform-style:preserve-3d] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]"
      >
        <div className="relative -rotate-[4deg] overflow-hidden border-[1.5px] border-black border-t-[5px] border-t-gel-fogo bg-folha text-tinta shadow-brutal">
          {/* reflexo de luz que segue o mouse */}
          <div
            className="pointer-events-none absolute inset-0 z-[3] opacity-0 transition-opacity duration-300 group-hover/ingresso:opacity-60 mix-blend-soft-light [background:radial-gradient(circle_at_var(--bx,50%)_var(--by,0%),rgb(255_255_255/0.9),transparent_55%)]"
            aria-hidden="true"
          />

          <div className="relative z-[2] flex items-center justify-between px-6 pt-5 font-mono text-[10px] font-semibold tracking-[0.14em]">
            <span className="grid size-9 place-items-center bg-tinta text-xs font-black tracking-[-0.04em] text-white">TT</span>
            <span>SEU PRÓXIMO EVENTO</span>
          </div>

          <div className="relative px-6 pb-7 pt-10">
            {/* circulo lavanda atras do titulo */}
            <span className="absolute -right-12 top-2 size-32 rounded-full bg-gel-indigo/70" aria-hidden="true" />
            <p className="relative text-[2.9rem] font-black leading-[0.92] tracking-[-0.03em] max-[480px]:text-[2.5rem]">
              Momentos<br />que <span className="text-transparent [-webkit-text-stroke:1.5px_var(--color-tinta)]">ficam.</span>
            </p>
          </div>

          {/* linha de picote com os dois recortes do canhoto (semicirculos na cor do palco) */}
          <div className="relative border-t-[1.5px] border-dashed border-tinta/40">
            <span className="absolute -left-4 top-0 size-8 -translate-y-1/2 rounded-full border-[1.5px] border-black bg-palco" aria-hidden="true" />
            <span className="absolute -right-4 top-0 size-8 -translate-y-1/2 rounded-full border-[1.5px] border-black bg-palco" aria-hidden="true" />
          </div>

          <div className="flex items-center justify-between gap-4 px-6 py-5">
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-tinta/70">VIVA A EXPERIÊNCIA</span>
            <span className="h-7 w-24 bg-[repeating-linear-gradient(90deg,var(--color-tinta)_0_2px,transparent_2px_4px,var(--color-tinta)_4px_5px,transparent_5px_8px)]" aria-hidden="true" />
          </div>
        </div>

        {/* etiqueta laranja colada no ingresso (detalhe) */}
        <span className="absolute -bottom-5 -right-3 z-[4] border-[1.5px] border-black bg-gel-fogo px-4 py-2 text-xs font-bold text-tinta [transform:translateZ(30px)_rotate(-5deg)]">
          Descubra. Escolha. Aproveite.
        </span>
      </div>

      {/* adesivos em volta */}
      <Sticker nome="cd" tamanho={104} rotate={12} className="-top-2 right-[4%] z-[5] max-[860px]:w-[76px]" />
      <Sticker nome="estrela" tamanho={86} rotate={-14} delay={1.2} className="bottom-2 left-[2%] z-[5] max-[860px]:w-[64px]" />
    </div>
  )
}

function LandingPage() {
  const indicadores = useIndicadores()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')

  return (
    <main className="fundo-luz relative overflow-x-clip text-white">
      <Semicirculos
        posicoes={[
          { lado: 'esq', topo: 'top-[520px]', cor: 'bg-gel-fogo', tamanho: 'm' },
          { lado: 'dir', topo: 'top-[160px]', cor: 'bg-gel-indigo', tamanho: 'p' },
          { lado: 'dir', topo: 'top-[1120px]', cor: 'bg-gel-fogo', tamanho: 'g' },
          { lado: 'esq', topo: 'top-[2050px]', cor: 'bg-gel-ceu', tamanho: 'p' },
        ]}
      />

      {/* ── Primeira dobra: titulo + busca a esquerda, ingresso interativo a direita ── */}
      <section className="relative border-b border-white/10">
        <div className={`${containerCls} grid min-h-[min(760px,calc(100svh-68px))] grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center gap-14 py-16 max-[860px]:grid-cols-1 max-[860px]:gap-8 max-[860px]:py-12`}>
          <div className="relative z-[2]">
            <h1 className="text-[clamp(2.75rem,6.4vw,5.75rem)] font-black leading-[0.92] tracking-[-0.025em] text-white">
              Encontre seu próximo{' '}
              {/* destaque vazado: tarja laranja com as letras "recortadas" (na cor do fundo), sem contorno */}
              {/* destaque: so o contorno laranja, letras vazadas por dentro.
                  o traco e desenhado antes do preenchimento (paint-order) e o miolo vai na cor do fundo:
                  assim os riscos internos da fonte ficam escondidos e sobra so a borda de fora (3px visiveis) */}
              <span className="text-palco [-webkit-text-stroke:6px_var(--color-gel-fogo)] [paint-order:stroke_fill]">grande momento.</span>
            </h1>
            <p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-white/75">
              Descubra eventos, conheça novas experiências e tenha tudo o que precisa
              para aproveitar cada momento.
            </p>

            <form
              role="search"
              className="mt-9 flex max-w-[560px] items-center gap-2 border-[1.5px] border-black bg-folha p-2 shadow-brutal"
              onSubmit={(e) => {
                e.preventDefault()
                const termo = busca.trim()
                navigate(termo ? `/PainelDeEventos?q=${encodeURIComponent(termo)}` : '/PainelDeEventos')
              }}
            >
              <span className="pl-3 text-tinta/50"><IconBusca tamanho={20} /></span>
              <input
                type="search"
                aria-label="Buscar eventos"
                className="min-h-12 w-full min-w-0 bg-transparent px-1 text-[15px] text-tinta outline-none placeholder:text-tinta/50"
                placeholder="Busque eventos, artistas ou lugares"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <button type="submit" className={`${btn('primario', 'lg')} max-[480px]:px-4`}>Explorar</button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <a className={linkEscuroCls} href="#categorias" onClick={rolarAteSecao}>Descobrir categorias</a>
              <span className="text-white/60">Uma experiência simples, do começo ao evento.</span>
            </div>

            {indicadores.map((s) => (
              <p key={s.rotulo} className="mt-10 flex items-baseline gap-3 border-t border-white/10 pt-5">
                <span className="tabular text-4xl font-black tracking-[-0.025em] text-white">{s.valor}</span>
                <span className="text-sm font-semibold text-white/65">{s.rotulo}</span>
              </p>
            ))}
          </div>

          <IngressoInterativo />
        </div>
      </section>

      {/* ── Categorias: cards que se alargam ao passar o mouse, com um circulo pastel crescendo no canto ── */}
      <section className={`${containerCls} relative py-24 max-[760px]:py-16`} id="categorias">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-[14ch] text-[clamp(2.25rem,4.6vw,4rem)] font-black leading-[0.95] tracking-[-0.025em]">O que você quer viver?</h2>
          <Link className={`${linkEscuroCls} inline-flex items-center gap-2 text-sm`} to="/PainelDeEventos">
            Ver eventos <IconSeta />
          </Link>
        </div>

        <div className="flex gap-5 max-[760px]:flex-col">
          {CATEGORIAS.map(({ titulo, texto, Icone, fundo }) => (
            <Link
              key={titulo}
              to="/PainelDeEventos"
              className="group relative flex min-h-[340px] flex-1 flex-col justify-between overflow-hidden border-[1.5px] border-black border-t-[5px] border-t-gel-fogo bg-folha p-6 text-tinta no-underline shadow-brutal transition-[flex-grow,transform] duration-500 ease-saida hover:-translate-y-1 min-[761px]:hover:flex-[1.6] min-[761px]:focus-visible:flex-[1.6] max-[760px]:min-h-[200px]"
            >
              {/* circulo pastel que cresce a partir do canto */}
              <span className={`absolute -right-16 -top-16 size-44 rounded-full ${fundo} scale-50 opacity-80 transition-transform duration-500 ease-saida group-hover:scale-110 group-focus-visible:scale-110`} aria-hidden="true" />

              <div className="relative flex items-start justify-between">
                <span className={`grid size-12 place-items-center border-[1.5px] border-black ${fundo}`}><Icone tamanho={22} /></span>
                <span className="relative grid size-10 place-items-center border-[1.5px] border-black bg-papel transition-colors duration-200 group-hover:bg-gel-fogo">
                  <IconSetaDiagonal tamanho={18} />
                </span>
              </div>

              <div className="relative max-w-[30ch]">
                <h3 className="text-2xl font-black leading-tight tracking-[-0.015em]">{titulo}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-tinta/75">{texto}</p>
              </div>
            </Link>
          ))}
        </div>
        <Sticker nome="vinil" tamanho={110} rotate={-10} delay={0.6} className="-top-2 right-[30%] hidden min-[1100px]:block" />
      </section>

      {/* ── Como funciona: faixa de descanso, um feixe dividido em tres trechos ── */}
      <section className="relative border-y border-white/10 bg-palco-2/55 py-24 max-[760px]:py-16" id="como-funciona">
        <div className={containerCls}>
          <h2 className="max-w-[18ch] text-[clamp(2rem,4vw,3.5rem)] font-black leading-[0.95] tracking-[-0.025em]">Uma jornada simples até o seu evento</h2>
          <ol className="mt-14 grid grid-cols-3 gap-1 max-[760px]:grid-cols-1 max-[760px]:gap-10">
            {ETAPAS.map((etapa) => (
              <li key={etapa.titulo}>
                <span className={`block h-2 ${etapa.gel}`} aria-hidden="true" />
                <div className="pr-8 pt-6">
                  <h3 className="text-xl font-extrabold">{etapa.titulo}</h3>
                  <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-white/65">{etapa.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Fechamento: card grande no estilo original (borda preta, faixa laranja, sombra chapada) ── */}
      <section className={`${containerCls} relative py-24 max-[760px]:py-16`}>
        <div className="relative flex flex-wrap items-end justify-between gap-8 overflow-hidden border-[1.5px] border-black border-t-[5px] border-t-gel-fogo bg-gel-indigo py-10 pl-16 pr-10 text-tinta shadow-brutal max-[760px]:p-7">
          <span className="absolute left-0 top-10 h-20 w-7 rounded-r-full bg-gel-fogo max-[760px]:hidden" aria-hidden="true" />
          <span className="absolute right-0 top-8 h-14 w-6 rounded-l-full bg-tinta max-[760px]:hidden" aria-hidden="true" />
          <div className="relative">
            <h2 className="max-w-[16ch] text-[clamp(2.25rem,5vw,4.25rem)] font-black leading-[0.92] tracking-[-0.025em]">Pronto para descobrir algo novo?</h2>
            <p className="mt-5 max-w-[52ch] text-base font-medium leading-relaxed text-tinta/80">Explore a página de eventos e encontre a próxima experiência para guardar na memória.</p>
          </div>
          <Link to="/PainelDeEventos" className={`${btn('tinta', 'lg')} relative`}>
            Explorar eventos <IconSeta />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default LandingPage

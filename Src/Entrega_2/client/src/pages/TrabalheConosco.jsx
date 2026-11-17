import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Sticker from '../components/Sticker'
import Semicirculos from '../components/ui/Semicirculos'
import { IconCheck, IconEscudo, IconIngresso, IconSeta } from '../components/ui/Icones'
import { btn, containerCls, linkEscuroCls } from '../components/ui/estilos'
import { useAuth } from '../services/AuthContext'

// canal oficial: o interesse em ser administrador chega por e-mail, nao por formulario
const EMAIL = 'trocaticket1@gmail.com'
const ASSUNTO = 'Quero me tornar um administrador'

// o que a TrocaTicket precisa ler no e-mail pra avaliar a pessoa (obrigatorio = sem isso nao da pra avaliar)
const CAMPOS = [
  { rotulo: 'Nome completo', dica: 'Como está no seu documento.', obrigatorio: true },
  { rotulo: 'Idade', dica: 'Administradores precisam ser maiores de 18 anos.', obrigatorio: true },
  { rotulo: 'Telefone / WhatsApp para contato', dica: 'Com DDD. É por aqui que podemos ligar ou chamar.', obrigatorio: true },
  { rotulo: 'Cidade e estado', dica: 'Onde você mora.', obrigatorio: true },
  { rotulo: 'Por que quer ser administrador?', dica: 'Conte em poucas linhas o que te motiva.', obrigatorio: true },
  { rotulo: 'Experiência', dica: 'Eventos, atendimento, moderação, gestão de plataformas ou áreas parecidas.', obrigatorio: true },
  { rotulo: 'Disponibilidade', dica: 'Quantas horas por semana e em quais períodos você consegue dedicar.', obrigatorio: true },
  { rotulo: 'Username na TrocaTicket', dica: 'Se você já tem conta. Ajuda a gente a te localizar.', obrigatorio: false },
  { rotulo: 'LinkedIn ou portfólio', dica: 'Opcional, mas ajuda na avaliação.', obrigatorio: false },
]

// modelo de mensagem: vai preenchido no app de e-mail (celular) ou pode ser copiado (computador)
const MODELO = `Olá, equipe TrocaTicket!

Quero me tornar um administrador parceiro. Seguem meus dados:

Nome completo:
Idade:
Telefone / WhatsApp (com DDD):
Cidade e estado:
Username na TrocaTicket (se tiver conta):
LinkedIn ou portfólio (opcional):

Por que quero ser administrador:

Minha experiência:

Minha disponibilidade (horas por semana e períodos):
`
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent(ASSUNTO)}&body=${encodeURIComponent(MODELO)}`

const ETAPAS = [
  { titulo: 'Envie o e-mail', texto: 'Escreva para o endereço acima, com o assunto indicado e os dados pedidos na mensagem.', gel: 'bg-gel-indigo' },
  { titulo: 'Analisamos seu perfil', texto: 'Nossa equipe lê cada mensagem, confere seus dados e avalia se faz sentido para a plataforma.', gel: 'bg-gel-magenta' },
  { titulo: 'Entramos em contato', texto: 'Se houver afinidade, retornamos por e-mail ou pelo telefone que você informou.', gel: 'bg-gel-ceu' },
]

// o que um administrador parceiro faz na plataforma (bate com as telas de admin do site)
const RESPONSABILIDADES = [
  { titulo: 'Aprovar cadastros', texto: 'Revisar organizadores e fornecedores antes de entrarem na plataforma.', Icone: IconEscudo },
  { titulo: 'Acompanhar a plataforma', texto: 'Consultar usuários, eventos e relatórios para manter tudo em ordem.', Icone: IconIngresso },
]

// pagina publica "Trabalhe conosco": quem quer virar administrador parceiro
function TrabalheConosco() {
  const { logado, perfil } = useAuth()
  const [copiado, setCopiado] = useState('') // o que acabou de ser copiado: 'email' | 'modelo' | ''
  const jaEAdmin = perfil === 'administrador'

  // copia o e-mail pra quem nao tem app de e-mail configurado (mailto nao faz nada nesses casos)
  async function copiar(qual, texto) {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(qual)
      setTimeout(() => setCopiado(''), 2500)
    } catch {
      // sem permissao de area de transferencia: o e-mail continua visivel na tela pra copiar na mao
    }
  }

  return (
    <main className="fundo-luz relative overflow-x-clip text-white">
      <Semicirculos
        posicoes={[
          { lado: 'esq', topo: 'top-[300px]', cor: 'bg-gel-fogo', tamanho: 'm' },
          { lado: 'dir', topo: 'top-[120px]', cor: 'bg-gel-indigo', tamanho: 'p' },
          { lado: 'dir', topo: 'top-[900px]', cor: 'bg-gel-ceu', tamanho: 'g' },
        ]}
      />

      {/* ── Convite: titulo a esquerda, a mensagem e o e-mail numa folha a direita ── */}
      <section className="relative border-b border-white/10">
        <div className={`${containerCls} grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-14 py-16 sm:py-20 max-[860px]:grid-cols-1 max-[860px]:gap-10`}>
          <div className="relative z-[2]">
            <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-acento">TRABALHE CONOSCO</p>
            <h1 className="mt-4 text-[clamp(2.5rem,5.6vw,4.75rem)] font-black leading-[0.92] tracking-[-0.025em]">
              Faça parte dos{' '}
              <span className="text-palco [-webkit-text-stroke:6px_var(--color-gel-fogo)] [paint-order:stroke_fill]">bastidores.</span>
            </h1>
            <p className="mt-7 max-w-[44ch] text-lg leading-relaxed text-white/75">
              A TrocaTicket cresce com parceiros que cuidam da plataforma por dentro. Se você quer
              ajudar a manter eventos e ingressos funcionando bem, queremos conversar.
            </p>
          </div>

          <div className="relative z-[2]">
            <div className="relative overflow-hidden border-[1.5px] border-black border-t-[5px] border-t-gel-fogo bg-folha text-tinta shadow-brutal">
              <span className="rebite right-4 top-4 z-[2]" aria-hidden="true" />
              <div className="h-2.5 bg-gel-indigo" aria-hidden="true" />
              <div className="px-6 pb-8 pt-7 sm:px-9 sm:pb-9">
                <h2 className="max-w-[22ch] text-[1.65rem] font-black leading-[1.1] tracking-[-0.02em]">
                  Quer se tornar um administrador parceiro da TrocaTicket?
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-tinta/75">
                  Envie um e-mail para{' '}
                  <a href={MAILTO} className="font-bold text-tinta underline decoration-gel-fogo decoration-2 underline-offset-4 hover:text-gel-indigo-forte">{EMAIL}</a>{' '}
                  com o assunto <strong className="text-tinta">“{ASSUNTO}”</strong>.
                </p>

                {/* o assunto aparece num bloco proprio: tem que ser copiado exatamente assim */}
                <dl className="mt-6 grid gap-px border-[1.5px] border-tinta/25 bg-tinta/25 text-sm">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 bg-papel px-4 py-3">
                    <dt className="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-[0.07em] text-tinta/55">Para</dt>
                    <dd className="font-mono text-[13px] font-semibold break-all">{EMAIL}</dd>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 bg-papel px-4 py-3">
                    <dt className="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-[0.07em] text-tinta/55">Assunto</dt>
                    <dd className="font-mono text-[13px] font-semibold">{ASSUNTO}</dd>
                  </div>
                </dl>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a href={MAILTO} className={`${btn('primario', 'lg')} max-sm:w-full`}>
                    Abrir app de e-mail <IconSeta />
                  </a>
                  <button type="button" onClick={() => copiar('email', EMAIL)} className={`${btn('claro', 'lg')} max-sm:w-full`}>
                    {copiado === 'email' ? <><IconCheck tamanho={18} /> E-mail copiado</> : 'Copiar e-mail'}
                  </button>
                </div>
                {/* mailto so funciona quando ha um app de e-mail configurado (comum no celular, raro no computador) */}
                <p className="mt-4 text-[13px] leading-relaxed text-tinta/65">
                  <strong className="text-tinta">No computador?</strong> O botão “Abrir app de e-mail” costuma não funcionar, pois depende de um app de e-mail instalado.
                  Use “Copiar e-mail” e “Copiar modelo” (logo abaixo) e envie pelo seu provedor (Gmail, Outlook...). No celular, ele abre o app de e-mail já com o modelo preenchido.
                </p>
                <p className="sr-only" role="status">{copiado === 'email' ? 'E-mail copiado.' : copiado === 'modelo' ? 'Modelo copiado.' : ''}</p>

                {jaEAdmin && (
                  <p className="mt-6 border-t border-tinta/10 pt-5 text-sm text-tinta/65">
                    Você já é administrador. <Link to="/AdminDashboard" className="font-semibold text-tinta underline decoration-gel-fogo decoration-2 underline-offset-4">Ir para o painel</Link>
                  </p>
                )}
              </div>
            </div>
            <Sticker nome="estrela" tamanho={84} rotate={-12} delay={0.8} className="-bottom-8 -left-6 z-[3] hidden min-[1100px]:block" />
          </div>
        </div>
      </section>

      {/* ── O que enviar: a lista do que a TrocaTicket precisa ler pra avaliar a pessoa ── */}
      <section className={`${containerCls} relative py-20 max-[760px]:py-14`} id="o-que-enviar">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="max-w-[18ch] text-[clamp(2rem,4vw,3.25rem)] font-black leading-[0.95] tracking-[-0.025em]">O que incluir no e-mail</h2>
            <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-white/70">
              Para avaliar seu perfil, precisamos destas informações no corpo da mensagem. Quanto mais completo, mais rápido conseguimos responder.
            </p>
          </div>
          <button type="button" onClick={() => copiar('modelo', MODELO)} className={btn('escuro', 'lg')}>
            {copiado === 'modelo' ? <><IconCheck tamanho={18} /> Modelo copiado</> : 'Copiar modelo da mensagem'}
          </button>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-5 max-[760px]:grid-cols-1">
          {CAMPOS.map(({ rotulo, dica, obrigatorio }) => (
            <li key={rotulo} className="relative border-[1.5px] border-black border-t-[5px] border-t-gel-fogo bg-folha p-5 text-tinta shadow-brutal">
              <span className={`absolute right-4 top-4 border-[1.5px] border-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.07em] ${obrigatorio ? 'bg-gel-indigo' : 'bg-papel text-tinta/70'}`}>
                {obrigatorio ? 'Obrigatório' : 'Opcional'}
              </span>
              <h3 className="max-w-[24ch] pr-24 text-lg font-black leading-tight tracking-[-0.015em]">{rotulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-tinta/70">{dica}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── O que faz um administrador ── */}
      <section className={`${containerCls} relative py-20 max-[760px]:py-14`}>
        <h2 className="max-w-[16ch] text-[clamp(2rem,4vw,3.25rem)] font-black leading-[0.95] tracking-[-0.025em]">O que um administrador faz</h2>
        <div className="mt-10 grid grid-cols-2 gap-5 max-[760px]:grid-cols-1">
          {RESPONSABILIDADES.map(({ titulo, texto, Icone }) => (
            <article key={titulo} className="flex items-start gap-5 border-[1.5px] border-black border-t-[5px] border-t-gel-fogo bg-folha p-6 text-tinta shadow-brutal">
              <span className="grid size-12 shrink-0 place-items-center border-[1.5px] border-black bg-gel-indigo"><Icone tamanho={22} /></span>
              <div>
                <h3 className="text-xl font-black tracking-[-0.015em]">{titulo}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-tinta/75">{texto}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Como funciona o processo ── */}
      <section className="relative border-y border-white/10 bg-palco-2/55 py-20 max-[760px]:py-14" id="como-funciona-processo">
        <div className={containerCls}>
          <h2 className="max-w-[18ch] text-[clamp(2rem,4vw,3.25rem)] font-black leading-[0.95] tracking-[-0.025em]">Como funciona o processo</h2>
          <ol className="mt-12 grid grid-cols-3 gap-1 max-[760px]:grid-cols-1 max-[760px]:gap-10">
            {ETAPAS.map((etapa, i) => (
              <li key={etapa.titulo}>
                <span className={`block h-2 ${etapa.gel}`} aria-hidden="true" />
                <div className="pr-8 pt-6">
                  <p className="tabular font-mono text-xs font-semibold tracking-[0.14em] text-white/55">0{i + 1}</p>
                  <h3 className="mt-2 text-xl font-extrabold">{etapa.titulo}</h3>
                  <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-white/65">{etapa.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Saida: quem so queria usar a plataforma nao fica num beco sem saida ── */}
      <section className={`${containerCls} relative py-16 max-[760px]:py-12`}>
        <p className="text-[15px] text-white/70">
          {logado ? 'Prefere voltar aos eventos?' : 'Só quer usar a plataforma?'}{' '}
          {logado
            ? <Link to="/PainelDeEventos" className={linkEscuroCls}>Ver eventos</Link>
            : <>Você pode <Link to="/Cadastro" className={linkEscuroCls}>criar uma conta</Link> como cliente, organizador ou fornecedor.</>}
        </p>
      </section>

      <Footer />
    </main>
  )
}

export default TrabalheConosco

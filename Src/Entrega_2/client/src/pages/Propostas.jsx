import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { solicitar } from '../services/api'
import { brl } from '../utils/formato'
import Aviso from '../components/ui/Aviso'
import Badge from '../components/ui/Badge'
import CabecalhoPagina from '../components/ui/CabecalhoPagina'
import Spinner from '../components/ui/Spinner'
import Semicirculos from '../components/ui/Semicirculos'
import { IconVoltar } from '../components/ui/Icones'
import { GELS, btn, containerCls, dadoRotuloCls, gelDoId } from '../components/ui/estilos'

// texto de cada status (os mesmos do banco: enviada, aceita, recusada); a cor vem do Badge
const STATUS = {
  enviada: 'Aguardando resposta',
  aceita: 'Aceita',
  recusada: 'Recusada',
}

// filtros por status (o valor bate com o banco)
const FILTROS = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'enviada', rotulo: 'Aguardando' },
  { valor: 'aceita', rotulo: 'Aceitas' },
  { valor: 'recusada', rotulo: 'Recusadas' },
]

// soma em centavos pra nao dar erro de arredondamento
function totalDaProposta(produtos) {
  return produtos.reduce((soma, i) => soma + i.quantidade * Math.round(Number(i.valor_unitario) * 100), 0) / 100
}

// fornecedor ve as propostas que mandou, organizador ve as que recebeu e pode responder
// o servidor (GET /propostas) ja devolve so as propostas de quem ta logado
export default function Propostas() {
  const { perfil, usuario } = useAuth()
  const [dados, setDados] = useState([])
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [ocupado, setOcupado] = useState(null) // id da proposta sendo respondida
  const [filtro, setFiltro] = useState('todas')
  const [aviso, setAviso] = useState('')

  const fornecedor = perfil === 'fornecedor'
  const permitido = fornecedor || perfil === 'organizador'

  // busca as propostas quando a tela abre (ou quando troca o usuario logado)
  useEffect(() => {
    if (!permitido) return
    async function carregar() {
      try {
        setDados(await solicitar('/propostas'))
      } catch (e) {
        setErro(e.message)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [permitido, usuario?.id_usuario])

  async function responder(id, status) {
    setOcupado(id)
    setErro('')
    setAviso('')
    try {
      await solicitar(`/propostas/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setDados((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
      setAviso(`Proposta ${status} com sucesso.`)
    } catch (e) {
      setErro(e.message)
    } finally {
      setOcupado(null)
    }
  }

  // a rota ja e protegida pelo ProtectedRoute, isso aqui e so por garantia
  if (!permitido) {
    return (
      <main className={`${containerCls} py-16`}>
        <h1 className="text-3xl font-black">Acesso restrito</h1>
        <p className="mt-2 text-white/70">Esta área é exclusiva de fornecedores e organizadores.</p>
        <Link to="/Login" className={`${btn('primario')} mt-6`}>Entrar</Link>
      </main>
    )
  }

  const visiveis = dados.filter((p) => filtro === 'todas' || p.status === filtro)

  return (
    <main className="relative min-h-[calc(100svh-68px)] overflow-x-clip fundo-luz pb-24">
      <Semicirculos />
      <CabecalhoPagina
        titulo={fornecedor ? 'Propostas enviadas' : 'Propostas recebidas'}
        sub={fornecedor
          ? 'Acompanhe suas ofertas e as respostas dos organizadores.'
          : 'Confira os produtos, compare os custos e responda aos fornecedores.'}
        voltar={
          <Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/70 no-underline transition-colors hover:text-white" to="/PainelDeEventos">
            <IconVoltar /> Painel de eventos
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-[920px] space-y-5 px-4 pt-8 sm:px-6">
        {/* filtro por status: controle segmentado com a contagem de cada um */}
        <div className="flex flex-wrap border-[1.5px] border-white/40 bg-palco-2 sm:w-fit" role="group" aria-label="Filtrar por status">
          {FILTROS.map((f) => {
            const qtd = f.valor === 'todas' ? dados.length : dados.filter((p) => p.status === f.valor).length
            const ativo = filtro === f.valor
            return (
              <button
                key={f.valor}
                type="button"
                aria-pressed={ativo}
                onClick={() => setFiltro(f.valor)}
                className={`flex items-center gap-2 rounded-none border-r-[1.5px] border-white/20 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.06em] transition-colors last:border-r-0 ${ativo ? 'bg-folha text-tinta' : 'text-white/65 hover:bg-white/8 hover:text-white'}`}
              >
                {f.rotulo}
                <span className={`tabular font-mono text-[11px] ${ativo ? 'text-tinta/55' : 'text-white/40'}`}>{qtd}</span>
              </button>
            )
          })}
        </div>

        {erro && <Aviso tipo="erro" escuro>{erro}</Aviso>}
        {aviso && <Aviso tipo="sucesso" escuro>{aviso}</Aviso>}

        {carregando ? (
          <Spinner text="Carregando propostas…" escuro />
        ) : !visiveis.length ? (
          <div className="rounded-none border border-dashed border-white/15 px-6 py-16 text-center">
            <h2 className="text-2xl font-black tracking-[-0.015em]">Nenhuma proposta por aqui</h2>
            <p className="mx-auto mt-2 max-w-[44ch] text-white/60">
              {fornecedor
                ? 'Acesse os custos de um evento para enviar sua primeira proposta.'
                : 'As propostas dos fornecedores aparecerão aqui.'}
            </p>
          </div>
        ) : (
          visiveis.map((p) => (
            <article key={p.id} className="rounded-2xl border border-tt-azul-marinho/10 bg-tt-branco p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-xs text-tt-grafite/70">Proposta #{p.id} · {new Date(p.criada_em).toLocaleDateString('pt-BR')}</p>
                  <h2 className="mt-1 text-xl font-bold">{p.titulo_evento}</h2>
                  <p className="mt-1 text-sm">{fornecedor ? `Para: ${p.organizador}` : `De: ${p.fornecedor}`}</p>
                </div>
                <span className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${STATUS[p.status].classe}`}>
                  {STATUS[p.status].rotulo}
                </span>
              </div>

              <ul className="my-5 divide-y divide-tt-azul-marinho/10">
                {p.produtos.map((i) => (
                  <li key={i.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                    <span>
                      <strong>{i.produto}</strong>
                      <br />
                      {i.quantidade} × {brl(i.valor_unitario)}
                    </span>
                    <strong>{brl(i.quantidade * Number(i.valor_unitario))}</strong>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between rounded-xl bg-tt-cinza-claro p-4 font-bold">
                <span>Total da proposta</span>
                <span>{brl(totalDaProposta(p.produtos))}</span>
              </div>
              <p className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-tt-azul-marinho/10 p-4 text-sm">{p.mensagem}</p>
              {p.observacoes && (
                <p className="mt-3 whitespace-pre-wrap break-words rounded-xl border border-tt-azul-marinho/10 p-4 text-sm">
                  <strong>Observações:</strong> {p.observacoes}
                </p>
              )}
              {p.data_validade && (
                <p className={`mt-3 text-sm font-bold ${p.vencida && p.status === 'enviada' ? 'text-tt-rosa-principal' : ''}`}>
                  Válida até {p.data_validade.split('-').reverse().join('/')}
                  {p.vencida && p.status === 'enviada' ? ' · vencida' : ''}
                </p>
              )}

              {/* so o organizador responde, e so se a proposta ainda ta aguardando */}
              {perfil === 'organizador' && p.status === 'enviada' && (
                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <button
                    disabled={ocupado === p.id}
                    onClick={() => responder(p.id, 'recusada')}
                    className="rounded-xl border border-tt-rosa-principal px-4 py-2 text-sm font-bold text-tt-rosa-principal disabled:opacity-50"
                  >
                    Recusar proposta
                  </button>
                  <button disabled={ocupado === p.id || p.vencida} onClick={() => responder(p.id, 'aceita')} className={botao}>
                    {ocupado === p.id ? 'Salvando…' : 'Aceitar proposta'}
                  </button>
                </div>
              </article>
            )
          })
        )}
      </div>
    </main>
  )
}

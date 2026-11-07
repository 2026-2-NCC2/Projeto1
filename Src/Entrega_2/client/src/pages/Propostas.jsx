import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { solicitar } from '../services/api'
import { brl, campo, botao } from '../styles/propostas'

// texto e cor da etiqueta de cada status (os mesmos do banco: enviada, aceita, recusada)
const STATUS = {
  enviada: { rotulo: 'Aguardando resposta', classe: 'bg-tt-laranja-claro' },
  aceita: { rotulo: 'Aceita', classe: 'bg-tt-verde-claro' },
  recusada: { rotulo: 'Recusada', classe: 'bg-tt-rosa-claro text-tt-rosa-principal' },
}

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
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-bold">Acesso restrito</h1>
        <p>Esta área é exclusiva de fornecedores e organizadores.</p>
        <Link to="/Login" className="text-tt-azul-principal underline">Entrar</Link>
      </main>
    )
  }

  const visiveis = dados.filter((p) => filtro === 'todas' || p.status === filtro)

  return (
    <main className="tt-canvas tt-canvas--semis min-h-screen">
      <section className="relative overflow-hidden border-b-[1.5px] border-tt-branco/25 px-5 py-12 text-tt-branco">
        <div className="mx-auto max-w-5xl">
          <p className="tt-eyebrow text-xs font-extrabold uppercase tracking-[0.1em] text-tt-branco before:bg-tt-branco">Negócios no TrocaTicket</p>
          <h1 className="tt-display mt-3 text-[clamp(32px,5vw,56px)]">{fornecedor ? 'Propostas enviadas' : 'Propostas recebidas'}</h1>
          <p className="mt-3 text-tt-branco/75">
            {fornecedor
              ? 'Acompanhe suas ofertas e as respostas dos organizadores.'
              : 'Confira os produtos, compare os custos e responda aos fornecedores.'}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-5 px-5 py-8">
        <Link className="inline-block text-sm font-bold text-tt-branco underline underline-offset-4 hover:text-tt-roxo-suave" to="/PainelDeEventos">← Painel de eventos</Link>

        <label className="block max-w-xs text-sm font-bold">
          Status
          <select className={`${campo} mt-2`} value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="todas">Todas as propostas</option>
            <option value="enviada">Aguardando resposta</option>
            <option value="aceita">Aceitas</option>
            <option value="recusada">Recusadas</option>
          </select>
        </label>

        {erro && <p role="alert" className="border-[1.5px] border-tt-rosa-principal bg-tt-rosa-claro p-4 text-tt-rosa-principal">{erro}</p>}
        {aviso && <p role="status" className="border-[1.5px] border-tt-azul-marinho bg-tt-verde-claro p-4 text-tt-azul-marinho">{aviso}</p>}

        {carregando ? (
          <p role="status" className="text-tt-branco/80">Carregando propostas…</p>
        ) : !visiveis.length ? (
          <div className="tt-card p-10 text-center">
            <h2 className="tt-display text-2xl">Nenhuma proposta por aqui</h2>
            <p className="mt-2 text-tt-grafite/70">
              {fornecedor
                ? 'Acesse os custos de um evento para enviar sua primeira proposta.'
                : 'As propostas dos fornecedores aparecerão aqui.'}
            </p>
          </div>
        ) : (
          visiveis.map((p) => (
            <article key={p.id} className="tt-card p-5 sm:p-7">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-xs text-tt-grafite/70">Proposta #{p.id} · {new Date(p.criada_em).toLocaleDateString('pt-BR')}</p>
                  <h2 className="mt-1 font-display text-xl font-black">{p.titulo_evento}</h2>
                  <p className="mt-1 text-sm">{fornecedor ? `Para: ${p.organizador}` : `De: ${p.fornecedor}`}</p>
                </div>
                <span className={`tt-tag h-fit ${STATUS[p.status].classe}`}>
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

              <div className="flex justify-between border-[1.5px] border-tt-azul-marinho bg-tt-cinza-claro p-4 font-bold">
                <span>Total da proposta</span>
                <span>{brl(totalDaProposta(p.produtos))}</span>
              </div>
              <p className="mt-4 whitespace-pre-wrap break-words border-[1.5px] border-tt-azul-marinho p-4 text-sm">{p.mensagem}</p>

              {/* so o organizador responde, e so se a proposta ainda ta aguardando */}
              {perfil === 'organizador' && p.status === 'enviada' && (
                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <button
                    disabled={ocupado === p.id}
                    onClick={() => responder(p.id, 'recusada')}
                    className="border-[1.5px] border-tt-rosa-principal px-4 py-2 text-sm font-bold text-tt-rosa-principal transition-colors hover:bg-tt-rosa-claro disabled:opacity-50"
                  >
                    Recusar proposta
                  </button>
                  <button disabled={ocupado === p.id} onClick={() => responder(p.id, 'aceita')} className={botao}>
                    {ocupado === p.id ? 'Salvando…' : 'Aceitar proposta'}
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </main>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { solicitar } from '../services/api'
import { brl, campo, botao } from '../styles/propostas'

// data de hoje (YYYY-MM-DD) no horario local, usada como minimo da validade
function hojeLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// area do fornecedor nos detalhes do evento: mostra os itens de custo (com quanto ainda falta)
// e envia a proposta com os produtos escolhidos
// o servidor confere tudo de novo (saldo, valores e permissao) antes de salvar
export default function CustosFornecedor({ evento }) {
  const [itens, setItens] = useState([])
  const [selecionados, setSelecionados] = useState({}) // ex: { 10: { itemId, produto, quantidade, valorUnitario } }
  const [mensagem, setMensagem] = useState('')
  const [validade, setValidade] = useState('') // opcional
  const [observacoes, setObservacoes] = useState('') // opcional
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const trava = useRef(false) // trava pra nao enviar duas vezes se clicar rapido

  // busca os itens quando a tela abre
  useEffect(() => {
    async function carregar() {
      try {
        const dados = await solicitar(`/eventos/${evento.id}/custos`)
        setItens(dados)
      } catch (e) {
        setErro(e.message)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [evento.id])

  const produtos = Object.values(selecionados)
  // soma em centavos pra nao dar erro de arredondamento (0.1 + 0.2 no js nao da 0.3)
  const total = produtos.reduce((soma, p) => soma + Number(p.quantidade || 0) * Math.round(Number(p.valorUnitario || 0) * 100), 0) / 100

  // muda um campo (produto, quantidade ou valorUnitario) de um item marcado
  function alterar(id, chave, valor) {
    setSelecionados((prev) => ({ ...prev, [id]: { ...prev[id], [chave]: valor } }))
  }

  // marca ou desmarca um item, ao marcar ja preenche a descricao e a quantidade que falta
  function alternarItem(item, marcado) {
    setSelecionados((prev) => {
      const novo = { ...prev }
      if (marcado) {
        novo[item.id_item_custo] = {
          itemId: item.id_item_custo,
          produto: item.descricao_detalhada,
          quantidade: item.quantidade_restante,
          valorUnitario: '',
        }
      } else {
        delete novo[item.id_item_custo]
      }
      return novo
    })
  }

  async function enviar(e) {
    e.preventDefault()
    if (trava.current) return
    setErro('')

    if (!produtos.length) {
      setErro('Selecione pelo menos um item de custo.')
      return
    }

    trava.current = true
    setSending(true)
    try {
      await solicitar('/propostas', {
        method: 'POST',
        body: JSON.stringify({ eventoId: evento.id, mensagem, produtos, validade, observacoes }),
      })
      setSucesso(true)
    } catch (e) {
      setErro(e.message)
      // pode ser que outra proposta foi aceita antes, entao busca os itens de novo e limpa a selecao
      try {
        const atuais = await solicitar(`/eventos/${evento.id}/custos`)
        setItens(atuais)
        setSelecionados({})
      } catch {
        /* Mantém a mensagem original se a atualização falhar. */
      }
    } finally {
      trava.current = false
      setSending(false)
    }
  }

  function conteudo() {
    if (loading) return <p role="status" className="py-8">Carregando itens…</p>

    if (sucesso) {
      return (
        <div role="status" className="mt-5 rounded-xl bg-tt-verde-claro p-5">
          <strong>Proposta enviada ao organizador!</strong>
          <p className="mt-2">
            <Link className="font-bold underline" to="/propostas">Acompanhar propostas enviadas →</Link>
          </p>
        </div>
      )
    }

    if (!itens.length) {
      return <p className="mt-4 rounded-xl bg-tt-cinza-claro p-5">Este evento não tem itens disponíveis para cotação.</p>
    }

    return (
      <form onSubmit={enviar} className="mt-5 space-y-4">
        {itens.map((i) => {
          const p = selecionados[i.id_item_custo] // undefined = item nao marcado
          return (
            <div key={i.id_item_custo} className="rounded-xl border border-tt-azul-marinho/15 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-tt-azul-principal"
                  disabled={i.quantidade_restante === 0}
                  checked={Boolean(p)}
                  onChange={(e) => alternarItem(i, e.target.checked)}
                />
                <span>
                  <span className="block text-xs font-bold text-tt-azul-principal">{i.categoria}</span>
                  <strong className="block">{i.descricao_detalhada}</strong>
                  <span className="text-sm text-tt-grafite/70">
                    Solicitado: {i.quantidade} · Coberto: {i.quantidade_coberta} ·{' '}
                    {i.quantidade_restante === 0 ? 'Já coberto' : `Restam: ${i.quantidade_restante}`} ·
                    Estimativa unitária: {brl(i.valor_unitario)}
                  </span>
                </span>
              </label>

              {p && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm sm:col-span-2">
                    Produto ou serviço oferecido
                    <input required maxLength={255} className={`${campo} mt-1`} value={p.produto} onChange={(e) => alterar(i.id_item_custo, 'produto', e.target.value)} />
                  </label>
                  <label className="text-sm">
                    Quantidade
                    <input required type="number" min="1" max={i.quantidade_restante} step="1" className={`${campo} mt-1`} value={p.quantidade} onChange={(e) => alterar(i.id_item_custo, 'quantidade', e.target.value)} />
                  </label>
                  <label className="text-sm">
                    Valor unitário (R$)
                    <input required type="number" min="0.01" max="9999999999" step="0.01" className={`${campo} mt-1`} value={p.valorUnitario} onChange={(e) => alterar(i.id_item_custo, 'valorUnitario', e.target.value)} />
                  </label>
                </div>
              )}
            </div>
          )
        })}

        <label className="block text-sm font-bold">
          Mensagem ao organizador
          <textarea
            required
            maxLength={1000}
            rows={3}
            className={`${campo} mt-2`}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Descreva sua oferta, condições e prazo de entrega."
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold">
            Validade da proposta — opcional
            <input
              type="date"
              min={hojeLocal()}
              className={`${campo} mt-2`}
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
            />
          </label>
          <label className="block text-sm font-bold sm:col-span-2">
            Observações — opcional
            <textarea
              maxLength={1000}
              rows={2}
              className={`${campo} mt-2`}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Condições de pagamento, garantia, restrições…"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-tt-cinza-claro p-4">
          <strong>Total: {brl(total)}</strong>
          <button disabled={sending || !produtos.length} className={botao}>
            {sending ? 'Enviando…' : 'Enviar proposta'}
          </button>
        </div>
      </form>
    )
  }

  return (
    <section className="mt-8 border-t border-tt-azul-marinho/10 pt-6">
      <p className="text-xs font-bold uppercase text-tt-azul-principal">Área do fornecedor</p>
      <h2 className="mt-1 text-2xl font-bold">Itens de custos do evento</h2>
      <p className="mt-2 text-sm text-tt-grafite/70">Selecione os itens que deseja fornecer e informe seus produtos e preços.</p>
      {erro && <p role="alert" className="my-4 rounded-xl bg-tt-rosa-claro p-4 text-tt-rosa-principal">{erro}</p>}
      {conteudo()}
    </section>
  )
}

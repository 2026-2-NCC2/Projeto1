import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { solicitar } from '../services/api'
import { brl } from '../utils/formato'
import Aviso from './ui/Aviso'
import { IconCheck, IconSeta } from './ui/Icones'
import { btn, campoCls, dadoRotuloCls, linkClaroCls, rotuloCls } from './ui/estilos'

// area do fornecedor nos detalhes do evento: mostra os itens de custo (com quanto ainda falta)
// e envia a proposta com os produtos escolhidos
// o servidor confere tudo de novo (saldo, valores e permissao) antes de salvar
export default function CustosFornecedor({ evento }) {
  const [itens, setItens] = useState([])
  const [selecionados, setSelecionados] = useState({}) // ex: { 10: { itemId, produto, quantidade, valorUnitario } }
  const [mensagem, setMensagem] = useState('')
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
        body: JSON.stringify({ eventoId: evento.id, mensagem, produtos }),
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
    if (loading) return <p role="status" className="py-8 text-sm text-tinta/65">Carregando itens…</p>

    if (sucesso) {
      return (
        <Aviso tipo="sucesso" className="mt-5">
          <strong>Proposta enviada ao organizador!</strong>
          <p className="mt-2">
            <Link className={`${linkClaroCls} inline-flex items-center gap-1.5`} to="/propostas">Acompanhar propostas enviadas <IconSeta /></Link>
          </p>
        </Aviso>
      )
    }

    if (!itens.length) {
      return <p className="mt-5 rounded-none border border-dashed border-tinta/20 px-4 py-5 text-sm text-tinta/65">Este evento não tem itens disponíveis para cotação.</p>
    }

    return (
      <form onSubmit={enviar} className="mt-5 space-y-3">
        {itens.map((i) => {
          const p = selecionados[i.id_item_custo] // undefined = item nao marcado
          const coberto = i.quantidade_restante === 0
          return (
            <div
              key={i.id_item_custo}
              className={`rounded-none border bg-papel transition-colors ${p ? 'border-gel-indigo-forte shadow-gel' : 'border-tinta/12'} ${coberto ? 'opacity-60' : ''}`}
            >
              <label className={`flex items-start gap-3 p-4 ${coberto ? '' : 'cursor-pointer'}`}>
                {/* caixinha de marcar desenhada por cima do checkbox nativo (o nativo continua acessivel) */}
                <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
                  <input
                    type="checkbox"
                    className="peer absolute inset-0 m-0 cursor-pointer appearance-none rounded-none border border-tinta/30 bg-papel checked:border-gel-indigo-forte checked:bg-gel-indigo disabled:cursor-not-allowed"
                    disabled={coberto}
                    checked={Boolean(p)}
                    onChange={(e) => alternarItem(i, e.target.checked)}
                  />
                  <span className="pointer-events-none relative hidden text-tinta peer-checked:block"><IconCheck tamanho={13} strokeWidth="2.8" /></span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className={dadoRotuloCls}>{i.categoria}</span>
                  <strong className="mt-0.5 block font-bold">{i.descricao_detalhada}</strong>
                  <span className="tabular mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-tinta/65">
                    <span>Solicitado: {i.quantidade}</span>
                    <span>Coberto: {i.quantidade_coberta}</span>
                    <span className={coberto ? 'font-semibold text-gel-verde-forte' : 'font-semibold text-tinta'}>
                      {coberto ? 'Já coberto' : `Restam: ${i.quantidade_restante}`}
                    </span>
                    <span>Estimativa unitária: {brl(i.valor_unitario)}</span>
                  </span>
                </span>
              </label>

              {p && (
                <div className="grid gap-3 border-t border-tinta/10 px-4 pb-4 pt-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 sm:col-span-2">
                    <span className={rotuloCls}>Produto ou serviço oferecido</span>
                    <input required maxLength={255} className={campoCls()} value={p.produto} onChange={(e) => alterar(i.id_item_custo, 'produto', e.target.value)} />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className={rotuloCls}>Quantidade</span>
                    <input required type="number" min="1" max={i.quantidade_restante} step="1" className={`${campoCls()} tabular`} value={p.quantidade} onChange={(e) => alterar(i.id_item_custo, 'quantidade', e.target.value)} />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className={rotuloCls}>Valor unitário (R$)</span>
                    <input required type="number" min="0.01" max="9999999999" step="0.01" className={`${campoCls()} tabular`} value={p.valorUnitario} onChange={(e) => alterar(i.id_item_custo, 'valorUnitario', e.target.value)} />
                  </label>
                </div>
              )}
            </div>
          )
        })}

        <label className="flex flex-col gap-2 pt-3">
          <span className={rotuloCls}>Mensagem ao organizador</span>
          <textarea
            required
            maxLength={1000}
            rows={3}
            className={`${campoCls()} resize-y`}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Descreva sua oferta, condições e prazo de entrega."
          />
        </label>

        {/* total da proposta: numero grande, botao do lado */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-none bg-tinta px-5 py-4 text-white">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-white/55">Total</p>
            <p className="tabular text-2xl font-black tracking-[-0.015em]">{brl(total)}</p>
          </div>
          <button disabled={sending || !produtos.length} className={btn('primario', 'lg')}>
            {sending ? 'Enviando…' : 'Enviar proposta'}
          </button>
        </div>
      </form>
    )
  }

  return (
    <section className="mt-10 border-t border-tinta/10 pt-8" aria-labelledby="titulo-custos">
      <h2 id="titulo-custos" className="text-2xl font-black tracking-[-0.015em]">Itens de custos do evento</h2>
      <p className="mt-2 text-sm text-tinta/65">Selecione os itens que deseja fornecer e informe seus produtos e preços.</p>
      {erro && <Aviso tipo="erro" className="my-4">{erro}</Aviso>}
      {conteudo()}
    </section>
  )
}

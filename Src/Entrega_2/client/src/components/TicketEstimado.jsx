import { useEffect, useState } from 'react'
import { solicitar } from '../services/api'
import { brl, campo, botao } from '../styles/propostas'

// Ticket estimado do evento (RF13). Não calcula nada: mostra o que o servidor devolve em
// GET /eventos/:id/ticket (custos consolidados + cenários de público mínimo e máximo).
// A fórmula e as premissas estão em FORMULA-TICKET.md.
export default function TicketEstimado({ eventoId }) {
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState('')
  const [margem, setMargem] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState('')

  // guarda o que o servidor mandou e preenche o campo da margem com virgula
  function mostrar(d) {
    setDados(d)
    setMargem(String(d.margem_percentual).replace('.', ','))
  }

  // busca o ticket quando a tela abre
  useEffect(() => {
    async function carregar() {
      try {
        mostrar(await solicitar(`/eventos/${eventoId}/ticket`))
      } catch (e) {
        setErro(e.message)
      }
    }
    carregar()
  }, [eventoId])

  async function salvarMargem(e) {
    e.preventDefault()
    setErro('')
    setAviso('')
    setSalvando(true)
    try {
      await solicitar(`/eventos/${eventoId}/margem`, {
        method: 'PATCH',
        body: JSON.stringify({ margem }),
      })
      mostrar(await solicitar(`/eventos/${eventoId}/ticket`)) // o servidor calcula o ticket de novo
      setAviso('Margem atualizada.')
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  const c = dados?.custos

  return (
    <section className="mt-6 border-t border-tt-azul-marinho/10 pt-5">
      <h2 className="text-xl font-bold">Ticket estimado</h2>
      {erro && (
        <p role="alert" className="mt-3 bg-tt-rosa-claro p-4 text-sm text-tt-rosa-principal">
          {erro}
        </p>
      )}
      {!dados && !erro && <p role="status" className="mt-3 text-sm">Calculando…</p>}

      {dados && (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {['minimo', 'maximo'].map((chave) => {
              const cen = dados.cenarios[chave]
              return (
                <div key={chave} className=" bg-tt-cinza-claro p-4">
                  <p className="text-xs font-bold uppercase text-tt-grafite/60">
                    Público {chave === 'minimo' ? 'mínimo' : 'máximo'}
                    {cen.disponivel && ` · ${cen.publico.toLocaleString('pt-BR')} pessoas`}
                  </p>
                  {cen.disponivel ? (
                    <>
                      <p className="mt-2 text-sm">
                        Ticket de equilíbrio: <strong>{brl(cen.ticket_equilibrio)}</strong>
                      </p>
                      <p className="mt-1 text-sm">
                        Ticket-alvo ({String(dados.margem_percentual).replace('.', ',')}% de margem):{' '}
                        <strong className="text-lg text-tt-azul-principal">{brl(cen.ticket_alvo)}</strong>
                      </p>
                      <p className="mt-1 text-xs text-tt-grafite/60">Custo total: {brl(cen.custo_total)}</p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm">{cen.motivo}</p>
                  )}
                </div>
              )
            })}
          </div>

          <form onSubmit={salvarMargem} className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-sm font-bold">
              Margem de lucro (%)
              <input
                inputMode="decimal"
                className={`${campo} mt-1 w-32`}
                value={margem}
                onChange={(e) => setMargem(e.target.value)}
              />
            </label>
            <button disabled={salvando} className={botao}>
              {salvando ? 'Salvando…' : 'Atualizar margem'}
            </button>
            {aviso && <span role="status" className="text-sm">{aviso}</span>}
          </form>

          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-bold">Como o ticket foi calculado</summary>
            <ul className="mt-2 space-y-1">
              <li>Itens de custo (propostas aceitas + estimativas): {brl(c.total_itens)}</li>
              <li>Custos independentes fixos: {brl(c.independentes_fixos)}</li>
              <li>Custo variável por participante: {brl(c.variavel_por_participante)}</li>
              <li><strong>Custo fixo total: {brl(c.custo_fixo_total)}</strong></li>
            </ul>
            <p className="mt-2 text-tt-grafite/70">{dados.formula}</p>
          </details>
        </>
      )}
    </section>
  )
}

import { useEffect, useState } from 'react'
import { solicitar } from '../services/api'
import { brl } from '../utils/formato'
import Aviso from './ui/Aviso'
import { IconChevron } from './ui/Icones'
import { btn, campoCls, dadoRotuloCls, rotuloCls } from './ui/estilos'

// as tres camadas do preco, nas mesmas cores da mesa de luz da pagina inicial
const CAMADAS = [
  { chave: 'fixo', rotulo: 'Custos fixos', cor: 'bg-gel-ceu' },
  { chave: 'variavel', rotulo: 'Custo por participante', cor: 'bg-gel-magenta' },
  { chave: 'margem', rotulo: 'Margem', cor: 'bg-gel-indigo' },
]

// quanto cada camada pesa na receita de um cenario (so pra desenhar a barra; os valores vem do servidor)
function camadasDoCenario(cen, custoFixo) {
  const receita = cen.ticket_alvo * cen.publico
  const fixo = Math.max(0, custoFixo)
  const variavel = Math.max(0, cen.custo_total - custoFixo)
  const margem = Math.max(0, receita - cen.custo_total)
  const soma = fixo + variavel + margem
  if (soma <= 0) return null
  return { fixo: (fixo / soma) * 100, variavel: (variavel / soma) * 100, margem: (margem / soma) * 100 }
}

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
    const controle = new AbortController()
    async function carregar() {
      try {
        mostrar(await solicitar(`/eventos/${eventoId}/ticket`, { signal: controle.signal }))
      } catch (e) {
        if (e.name !== 'AbortError') setErro(e.message)
      }
    }
    carregar()
    return () => controle.abort()
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
    <section className="mt-10 border-t border-tinta/10 pt-8" aria-labelledby="titulo-ticket">
      <h2 id="titulo-ticket" className="text-2xl font-black tracking-[-0.015em]">Ticket estimado</h2>
      {erro && <Aviso tipo="erro" className="mt-4">{erro}</Aviso>}
      {!dados && !erro && <p role="status" className="mt-4 text-sm text-tinta/65">Calculando…</p>}

      {dados && (
        <>
          {/* legenda das camadas (vale pras duas barras) */}
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-tinta/65">
            {CAMADAS.map((k) => (
              <li key={k.chave} className="flex items-center gap-1.5">
                <span className={`size-2.5 rounded-none ${k.cor}`} aria-hidden="true" />
                {k.rotulo}
              </li>
            ))}
          </ul>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {['minimo', 'maximo'].map((chave) => {
              const cen = dados.cenarios[chave]
              const partes = cen.disponivel ? camadasDoCenario(cen, c.custo_fixo_total) : null
              return (
                <div key={chave} className="rounded-none border border-tinta/12 bg-papel p-5">
                  <p className={dadoRotuloCls}>
                    Público {chave === 'minimo' ? 'mínimo' : 'máximo'}
                    {cen.disponivel && ` · ${cen.publico.toLocaleString('pt-BR')} pessoas`}
                  </p>
                  {cen.disponivel ? (
                    <>
                      {/* o ticket-alvo e o numero mais importante da tela */}
                      <p className="tabular mt-3 text-[clamp(2rem,5vw,2.75rem)] font-black leading-none tracking-[-0.025em]">
                        {brl(cen.ticket_alvo)}
                      </p>
                      <p className="mt-1.5 text-sm text-tinta/65">
                        Ticket-alvo ({String(dados.margem_percentual).replace('.', ',')}% de margem)
                      </p>

                      {/* camadas somadas: tres gelatinas translucidas saindo da mesma borda.
                          a margem cobre tudo, o custo por participante vai ate fixo + variavel e o fixo so ate a parte dele.
                          onde as tres se cruzam a cor fica mais escura; a ponta da ultima camada e o ingresso */}
                      {partes && (
                        <div className="relative mt-5 h-14 overflow-hidden rounded-none bg-mesa ring-1 ring-tinta/10" aria-hidden="true">
                          {/* cada camada desce um pouco em relacao a anterior: a faixa de cima mostra o indigo puro,
                              a de baixo o azul puro, e o meio mostra a soma */}
                          {[
                            { cor: 'bg-gel-indigo', largura: 100, pos: 'top-0' },
                            { cor: 'bg-gel-magenta', largura: partes.fixo + partes.variavel, pos: 'top-[22%]' },
                            { cor: 'bg-gel-ceu', largura: partes.fixo, pos: 'top-[44%]' },
                          ].map((camada) => (
                            <span
                              key={camada.cor}
                              className={`gelatina absolute left-0 h-[56%] rounded-none transition-[width] duration-500 ease-saida ${camada.pos} ${camada.cor}`}
                              style={{ width: `${camada.largura}%` }}
                            />
                          ))}
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-none bg-papel/90 px-2 py-0.5 text-[11px] font-bold text-tinta">Ingresso</span>
                        </div>
                      )}

                      <dl className="tabular mt-4 grid grid-cols-2 gap-3 border-t border-tinta/10 pt-4 text-sm">
                        <div>
                          <dt className="text-xs text-tinta/55">Ticket de equilíbrio</dt>
                          <dd className="mt-0.5 font-bold">{brl(cen.ticket_equilibrio)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-tinta/55">Custo total</dt>
                          <dd className="mt-0.5 font-bold">{brl(cen.custo_total)}</dd>
                        </div>
                      </dl>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-tinta/70">{cen.motivo}</p>
                  )}
                </div>
              )
            })}
          </div>

          <form onSubmit={salvarMargem} className="mt-5 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-2">
              <span className={rotuloCls}>Margem de lucro (%)</span>
              <input
                inputMode="decimal"
                className={`${campoCls()} tabular w-32`}
                value={margem}
                onChange={(e) => setMargem(e.target.value)}
              />
            </label>
            <button disabled={salvando} className={btn('tinta')}>
              {salvando ? 'Salvando…' : 'Atualizar margem'}
            </button>
            {aviso && <span role="status" className="pb-3 text-sm font-semibold text-gel-verde-forte">{aviso}</span>}
          </form>

          <details className="group mt-5 rounded-none border border-tinta/12 bg-papel text-sm">
            <summary className="cursor-pointer list-none px-4 py-3 font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="mr-1.5 inline-block align-[-3px] text-tinta/55 transition-transform -rotate-90 group-open:rotate-0"><IconChevron /></span>
              Como o ticket foi calculado
            </summary>
            <ul className="tabular space-y-1.5 border-t border-tinta/10 px-4 py-3">
              <li className="flex justify-between gap-4"><span className="text-tinta/70">Itens de custo (propostas aceitas + estimativas)</span> <span>{brl(c.total_itens)}</span></li>
              <li className="flex justify-between gap-4"><span className="text-tinta/70">Custos independentes fixos</span> <span>{brl(c.independentes_fixos)}</span></li>
              <li className="flex justify-between gap-4"><span className="text-tinta/70">Custo variável por participante</span> <span>{brl(c.variavel_por_participante)}</span></li>
              <li className="flex justify-between gap-4 border-t border-tinta/10 pt-1.5 font-bold"><span>Custo fixo total</span> <span>{brl(c.custo_fixo_total)}</span></li>
            </ul>
            <p className="border-t border-tinta/10 px-4 py-3 font-mono text-xs leading-relaxed text-tinta/60">{dados.formula}</p>
          </details>
        </>
      )}
    </section>
  )
}

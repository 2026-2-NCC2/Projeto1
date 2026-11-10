import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CurrencyInput, Field } from '../components/FormUI'
import Aviso from '../components/ui/Aviso'
import CabecalhoPagina from '../components/ui/CabecalhoPagina'
import Folha, { FolhaCabecalho } from '../components/ui/Folha'
import Semicirculos from '../components/ui/Semicirculos'
import Spinner from '../components/ui/Spinner'
import { btn, containerCls, dicaCls } from '../components/ui/estilos'
import { solicitar } from '../services/api'
import { brl, dataHora } from '../utils/formato'

const ATALHOS = [25, 50, 100, 200]
const ROTULO_TIPO = { recarga: 'Adição de saldo', compra: 'Compra de ingressos', compra_cartao: 'Compra de ingressos' }

// area de saldo do cliente: saldo atual, adicionar saldo (simulado) e historico de movimentacoes.
// O saldo nunca e calculado nem alterado aqui: vem do servidor, e so muda depois de uma operacao aprovada la.
export default function Saldo() {
  const navigate = useNavigate()
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState('')
  const [valor, setValor] = useState('')
  const [erroValor, setErroValor] = useState('')

  useEffect(() => {
    const controle = new AbortController()
    solicitar('/saldo', { signal: controle.signal }, 'Não foi possível carregar o saldo.')
      .then(setDados)
      .catch((e) => { if (e.name !== 'AbortError') setErro(e.message) })
    return () => controle.abort()
  }, [])

  const limites = dados?.limites ?? { minimo: 10, maximo: 5000 }

  // valida o valor e segue para a tela de confirmacao (o servidor valida de novo)
  function continuar(e) {
    e.preventDefault()
    const texto = valor.trim()
    const numero = Number(texto.replace(',', '.'))
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(texto)) return setErroValor('Informe um valor válido, com até 2 casas decimais.')
    if (numero < limites.minimo || numero > limites.maximo) return setErroValor(`O valor precisa estar entre ${brl(limites.minimo)} e ${brl(limites.maximo)}.`)
    navigate('/saldo/adicionar', { state: { valor: texto } })
  }

  function historico() {
    if (!dados.movimentacoes.length) {
      return <p className="m-0 px-6 py-8 text-center text-sm text-tinta/65 sm:px-8">Nenhuma movimentação ainda. Adicione saldo para começar.</p>
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <caption className="sr-only">Histórico de movimentações do saldo</caption>
          <thead>
            <tr className="border-b border-tinta/10 text-[11px] uppercase tracking-[0.07em] text-tinta/60">
              <th scope="col" className="px-6 py-3 font-semibold sm:pl-8">Movimentação</th>
              <th scope="col" className="px-3 py-3 font-semibold">Data</th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">Valor</th>
              <th scope="col" className="px-6 py-3 text-right font-semibold sm:pr-8">Saldo após</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tinta/10">
            {dados.movimentacoes.map((m) => (
              <tr key={`${m.origem}-${m.id}`}>
                <td className="px-6 py-3.5 sm:pl-8">
                  <span className="block font-semibold">{ROTULO_TIPO[m.tipo] ?? m.tipo}</span>
                  <span className="block text-xs text-tinta/60">{m.descricao}</span>
                </td>
                <td className="tabular whitespace-nowrap px-3 py-3.5">{dataHora(m.criado_em)}</td>
                <td className={`tabular whitespace-nowrap px-3 py-3.5 text-right font-bold ${m.tipo === 'recarga' ? 'text-gel-verde-forte' : ''}`}>
                  {m.tipo === 'recarga' ? '+' : '−'} {brl(m.valor)}
                </td>
                <td className="tabular whitespace-nowrap px-6 py-3.5 text-right sm:pr-8">{m.saldo_resultante == null ? '—' : brl(m.saldo_resultante)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Meu saldo"
        sub="Use o saldo para comprar ingressos. As adições de saldo são simuladas."
        acoes={<Link to="/ingressos" className={btn('escuro')}>Meus ingressos</Link>}
        gels={['bg-gel-verde', 'bg-gel-indigo']}
      />
      <main className="relative min-h-[calc(100svh-68px)] overflow-x-clip fundo-luz pb-24">
        <Semicirculos posicoes={[{ lado: 'esq', topo: 'top-[520px]', cor: 'bg-gel-fogo', tamanho: 'm' }, { lado: 'dir', topo: 'top-[300px]', cor: 'bg-gel-magenta', tamanho: 'p' }]} />
        <div className={`${containerCls} relative pt-10`}>
          {erro ? <Aviso tipo="erro" escuro>{erro}</Aviso> : !dados ? <Spinner text="Carregando saldo..." escuro /> : (
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(300px,380px)_1fr]">
              <div className="flex flex-col gap-6">
                <Folha gel="verde" aria-labelledby="saldo-titulo">
                  <div className="px-6 pb-6 pt-6 sm:px-7">
                    <h2 id="saldo-titulo" className="mb-2 pr-8 text-sm font-semibold text-tinta/70">Saldo disponível</h2>
                    <p className="tabular m-0 text-5xl font-black tracking-[-0.03em]">{brl(dados.saldo)}</p>
                  </div>
                </Folha>

                <Folha gel="indigo" aria-labelledby="adicionar-titulo">
                  <form onSubmit={continuar} noValidate className="px-6 pb-6 pt-6 sm:px-7">
                    <h2 id="adicionar-titulo" className="mb-1 pr-8 text-lg font-extrabold">Adicionar saldo</h2>
                    <p className={`${dicaCls} mb-4`}>Operação simulada: nenhum dinheiro real é movimentado.</p>
                    <Field label="Valor a adicionar" error={erroValor} hint={`De ${brl(limites.minimo)} a ${brl(limites.maximo)}.`}>
                      <CurrencyInput value={valor} onChange={(e) => { setValor(e.target.value); setErroValor('') }} />
                    </Field>
                    <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Valores sugeridos">
                      {ATALHOS.map((v) => (
                        <button key={v} type="button" className={btn('claro', 'sm')} onClick={() => { setValor(String(v)); setErroValor('') }}>{brl(v)}</button>
                      ))}
                    </div>
                    <button type="submit" className={`${btn('primario', 'lg')} mt-5 w-full`}>Continuar</button>
                  </form>
                </Folha>
              </div>

              <Folha aria-labelledby="historico-titulo">
                <FolhaCabecalho id="historico-titulo" titulo="Histórico" sub="Suas últimas movimentações." />
                {historico()}
              </Folha>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

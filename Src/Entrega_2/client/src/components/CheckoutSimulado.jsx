import { useEffect, useRef, useState } from 'react'
import { brl } from '../utils/formato'
import Aviso from './ui/Aviso'
import CabecalhoPagina from './ui/CabecalhoPagina'
import Etapas from './ui/Etapas'
import Folha, { FolhaCabecalho } from './ui/Folha'
import Semicirculos from './ui/Semicirculos'
import Spinner from './ui/Spinner'
import { btn, containerCls, dadoRotuloCls, rotuloCls } from './ui/estilos'

// Tela de checkout SIMULADA, usada pela compra de ingressos e pela adicao de saldo (mesma experiencia nas duas).
// Nenhum pagamento real e feito. Quem decide e grava tudo de verdade e o servidor.
//
// Fases: aguardando -> processando -> aprovado | recusado
// Props:
//   titulo, sub, voltar            cabecalho da pagina
//   linhas = [{ rotulo, detalhe, valor }]   resumo do que esta sendo pago
//   total                          valor final (so exibicao: o servidor calcula o valor de verdade)
//   metodos = [{ id, nome, descricao, indisponivel }]   formas de pagamento simuladas
//   aoConfirmar(metodo, resultado) => Promise<{ resultado: 'aprovado' | 'recusado', dados, mensagem }>   (lanca erro se falhar)
//   sucesso(dados)                 tela mostrada quando aprova
//   rotuloBotao                    texto do botao de confirmar
const ETAPAS = [
  { label: 'Aguardando confirmação', gel: 'indigo' },
  { label: 'Processando', gel: 'ceu' },
  { label: 'Resultado', gel: 'magenta' },
]
const ETAPA_DA_FASE = { aguardando: 0, processando: 1, aprovado: 2, recusado: 2 }
const TEMPO_MINIMO = 1500 // a simulacao responde na hora; esse tempo deixa o usuario ver o "processando"

export default function CheckoutSimulado({ titulo, sub, voltar, linhas, total, metodos, aoConfirmar, sucesso, rotuloBotao = 'Confirmar pagamento' }) {
  const [fase, setFase] = useState('aguardando')
  const [dados, setDados] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [metodo, setMetodo] = useState(() => metodos.find((m) => !m.indisponivel)?.id ?? '')
  const [resultado, setResultado] = useState('aprovado') // escolhido no painel de simulacao
  const travado = useRef(false) // trava contra clique duplo (o estado so muda no proximo render, o ref muda na hora)

  // veio de um botao da pagina anterior (que pode estar rolada): comeca no topo
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const metodoAtual = metodos.find((m) => m.id === metodo)

  async function confirmar() {
    if (travado.current || !metodoAtual || metodoAtual.indisponivel) return
    travado.current = true
    setErro('')
    setFase('processando')
    try {
      const [resposta] = await Promise.all([aoConfirmar(metodo, resultado), new Promise((r) => setTimeout(r, TEMPO_MINIMO))])
      setDados(resposta.dados)
      setMensagem(resposta.mensagem || '')
      setFase(resposta.resultado)
    } catch (e) {
      // erro "de verdade" (sem conexao, ingressos esgotados...): volta pra tela de confirmar, nada foi concluido
      setErro(e.message)
      setFase('aguardando')
    } finally {
      travado.current = false
    }
  }

  return (
    <>
      <CabecalhoPagina titulo={titulo} sub={sub} voltar={voltar} gels={['bg-gel-indigo', 'bg-gel-ceu', 'bg-gel-magenta']} />

      <main className="relative min-h-[calc(100svh-68px)] overflow-x-clip fundo-luz pb-24">
        <Semicirculos posicoes={[{ lado: 'esq', topo: 'top-[420px]', cor: 'bg-gel-fogo', tamanho: 'm' }, { lado: 'dir', topo: 'top-[260px]', cor: 'bg-gel-ceu', tamanho: 'p' }]} />
        <div className={`${containerCls} relative pt-8`}>
          <Etapas itens={ETAPAS} atual={ETAPA_DA_FASE[fase]} escuro rotulo="Etapas do pagamento" />

          <div className="mt-6">
            <Aviso tipo="atencao" escuro>
              <strong>Ambiente de simulação.</strong> Nenhum pagamento real é feito e nenhum dado de cartão é coletado.
            </Aviso>
          </div>

          {fase === 'aprovado' ? (
            <div className="mt-8">{sucesso(dados)}</div>
          ) : (
            <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_minmax(320px,400px)]">
              {/* resumo do que esta sendo pago */}
              <Folha as="section" gel="indigo" aria-labelledby="resumo-titulo">
                <FolhaCabecalho id="resumo-titulo" titulo="Resumo" sub="Confira antes de confirmar." />
                <dl className="m-0 divide-y divide-tinta/10 px-6 sm:px-8">
                  {linhas.map((l) => (
                    <div key={l.rotulo} className="flex items-baseline justify-between gap-4 py-4">
                      <div className="min-w-0">
                        <dt className="font-semibold">{l.rotulo}</dt>
                        {l.detalhe && <dd className="m-0 mt-0.5 text-sm text-tinta/60">{l.detalhe}</dd>}
                      </div>
                      {l.valor != null && <dd className="tabular m-0 shrink-0 font-bold">{brl(l.valor)}</dd>}
                    </div>
                  ))}
                </dl>
                <div className="flex items-baseline justify-between gap-4 border-t border-tinta/10 bg-tinta/[0.03] px-6 py-5 sm:px-8">
                  <span className={dadoRotuloCls}>Total</span>
                  <span className="tabular text-3xl font-black tracking-[-0.025em]">{brl(total)}</span>
                </div>
              </Folha>

              {/* pagamento */}
              <Folha as="section" gel="ceu" aria-labelledby="pagamento-titulo" aria-busy={fase === 'processando'}>
                <FolhaCabecalho id="pagamento-titulo" titulo="Pagamento" sub="Escolha como pagar (simulado)." />

                {fase === 'processando' ? (
                  <div className="px-6 py-10 sm:px-8" role="status" aria-live="polite">
                    <Spinner text="" />
                    <p className="mt-2 text-center font-bold">Processando pagamento…</p>
                    <p className="mt-1 text-center text-sm text-tinta/65">Não feche esta página.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 px-6 py-6 sm:px-8">
                    {fase === 'recusado' && (
                      <Aviso tipo="erro">
                        <strong>Pagamento recusado.</strong> {mensagem} Nada foi cobrado e você pode tentar de novo.
                      </Aviso>
                    )}
                    {erro && <Aviso tipo="erro">{erro}</Aviso>}

                    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
                      <legend className={`${rotuloCls} mb-2`}>Método de pagamento</legend>
                      {metodos.map((m) => (
                        <label
                          key={m.id}
                          className={`flex items-start gap-3 border-[1.5px] px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foco ${
                            m.indisponivel ? 'cursor-not-allowed border-tinta/15 opacity-60' : 'cursor-pointer border-tinta/40 hover:border-tinta has-[:checked]:border-tinta has-[:checked]:bg-gel-indigo/20'
                          }`}
                        >
                          <input type="radio" name="metodo" value={m.id} checked={metodo === m.id} disabled={m.indisponivel} onChange={() => setMetodo(m.id)} className="mt-1" />
                          <span className="min-w-0">
                            <span className="block text-sm font-bold">{m.nome}</span>
                            <span className="block text-xs text-tinta/65">{m.descricao}</span>
                          </span>
                        </label>
                      ))}
                    </fieldset>

                    {/* painel de simulacao: quem testa escolhe o resultado do cartao */}
                    <fieldset className="m-0 border-[1.5px] border-dashed border-tinta/40 bg-papel p-4">
                      <legend className="px-1 font-mono text-[11px] font-semibold uppercase tracking-[0.07em] text-tinta/70">Painel de simulação</legend>
                      {metodo === 'cartao' ? (
                        <div className="flex flex-wrap gap-4 text-sm font-semibold">
                          {[['aprovado', 'Aprovar pagamento'], ['recusado', 'Recusar pagamento']].map(([valor, rotulo]) => (
                            <label key={valor} className="inline-flex cursor-pointer items-center gap-2">
                              <input type="radio" name="resultado" value={valor} checked={resultado === valor} onChange={() => setResultado(valor)} />
                              {rotulo}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="m-0 text-xs text-tinta/65">Com o saldo da plataforma não há o que simular: o servidor confere o seu saldo de verdade.</p>
                      )}
                    </fieldset>

                    <button type="button" className={`${btn('primario', 'lg')} w-full`} disabled={!metodoAtual || metodoAtual.indisponivel} onClick={confirmar}>
                      {fase === 'recusado' ? 'Tentar novamente' : rotuloBotao} · {brl(total)}
                    </button>
                  </div>
                )}
              </Folha>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

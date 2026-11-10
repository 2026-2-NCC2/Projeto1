import { Link, Navigate, useLocation } from 'react-router-dom'
import CheckoutSimulado from '../components/CheckoutSimulado'
import Badge from '../components/ui/Badge'
import Folha, { FolhaCabecalho } from '../components/ui/Folha'
import { IconVoltar } from '../components/ui/Icones'
import { btn, dadoRotuloCls } from '../components/ui/estilos'
import { solicitar } from '../services/api'
import { brl } from '../utils/formato'

// confirmacao: so aparece depois que o servidor aprovou e atualizou o saldo
function ConfirmacaoSaldo({ resultado }) {
  const dados = [
    ['Valor adicionado', brl(resultado.valor)],
    ['Saldo atual', brl(resultado.saldo)],
  ]
  return (
    <Folha gel="verde" aria-labelledby="confirmacao-titulo">
      <FolhaCabecalho
        id="confirmacao-titulo"
        titulo="Saldo adicionado"
        sub="Operação concluída (simulação). O saldo já está disponível para comprar ingressos."
        acoes={<Badge label="Aprovada" variant="aprovado" />}
      />
      <div role="status" className="sr-only">Saldo adicionado com sucesso. Novo saldo: {brl(resultado.saldo)}.</div>
      <dl className="m-0 grid gap-px bg-tinta/10 sm:grid-cols-2">
        {dados.map(([rotulo, valor]) => (
          <div key={rotulo} className="bg-papel px-6 py-4 sm:px-8">
            <dt className={dadoRotuloCls}>{rotulo}</dt>
            <dd className="tabular m-0 mt-1 text-lg font-semibold">{valor}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap justify-end gap-3 border-t border-tinta/10 bg-tinta/[0.03] px-6 py-5 sm:px-8">
        <Link to="/saldo" className={btn('claro')}>Ver histórico</Link>
        <Link to="/PainelDeEventos" className={btn('primario')}>Comprar ingressos</Link>
      </div>
    </Folha>
  )
}

// confirmacao (simulada) de uma adicao de saldo: mesma experiencia do pagamento dos ingressos.
// O valor chega pela navegacao (tela /saldo); o saldo so muda no servidor quando a operacao e confirmada aqui.
export default function AdicionarSaldo() {
  const { state } = useLocation()
  if (!state?.valor) return <Navigate to="/saldo" replace />

  const valor = Number(String(state.valor).replace(',', '.'))

  async function aoConfirmar(metodo, resultado) {
    const r = await solicitar('/saldo/adicionar', { method: 'POST', body: JSON.stringify({ valor: String(state.valor), resultado }) }, 'Não foi possível processar a operação.')
    return { resultado: r.resultado, dados: r, mensagem: r.motivo }
  }

  return (
    <CheckoutSimulado
      titulo="Adicionar saldo"
      sub="Confirme a operação para creditar o valor na sua conta."
      voltar={<Link to="/saldo" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/70 no-underline transition-colors hover:text-white"><IconVoltar /> Voltar ao saldo</Link>}
      linhas={[{ rotulo: 'Adição de saldo', detalhe: 'Operação simulada', valor }]}
      total={valor}
      metodos={[{ id: 'cartao', nome: 'Cartão de crédito (simulado)', descricao: 'Nenhum dado de cartão é pedido ou guardado.' }]}
      aoConfirmar={aoConfirmar}
      sucesso={(r) => <ConfirmacaoSaldo resultado={r} />}
      rotuloBotao="Confirmar adição"
    />
  )
}

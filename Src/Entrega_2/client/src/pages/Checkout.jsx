import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import CheckoutSimulado from '../components/CheckoutSimulado'
import IngressoCard from '../components/IngressoCard'
import Badge from '../components/ui/Badge'
import Folha, { FolhaCabecalho } from '../components/ui/Folha'
import { IconVoltar } from '../components/ui/Icones'
import { btn, dadoRotuloCls } from '../components/ui/estilos'
import { solicitar } from '../services/api'
import { brl, dataCurta, dataHora } from '../utils/formato'

// confirmacao da compra: so aparece depois que o servidor confirmou o pagamento e registrou os ingressos
function ConfirmacaoCompra({ compra }) {
  const dados = [
    ['Evento', compra.evento_titulo],
    ['Data do evento', dataCurta(compra.evento_data)],
    ['Ingressos', `${compra.quantidade} × ${compra.tipo_nome} (${brl(compra.valor_unitario)} cada)`],
    ['Valor total', brl(compra.valor_total)],
    ['Comprador', `${compra.comprador_nome} (@${compra.comprador_username})`],
    ['Data da compra', dataHora(compra.criado_em)],
  ]
  return (
    <div className="flex flex-col gap-6">
      <Folha gel="verde" aria-labelledby="confirmacao-titulo">
        <FolhaCabecalho
          id="confirmacao-titulo"
          titulo="Pagamento aprovado"
          sub="Compra concluída (simulação). Seus ingressos já estão na sua conta."
          acoes={<Badge label={compra.status} variant="aprovado" />}
        />
        <div role="status" className="sr-only">Pagamento aprovado. {compra.quantidade} ingressos adquiridos.</div>
        <dl className="m-0 grid gap-px bg-tinta/10 sm:grid-cols-2">
          {dados.map(([rotulo, valor]) => (
            <div key={rotulo} className="bg-papel px-6 py-4 sm:px-8">
              <dt className={dadoRotuloCls}>{rotulo}</dt>
              <dd className="tabular m-0 mt-1 break-words font-semibold">{valor}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap justify-end gap-3 border-t border-tinta/10 bg-tinta/[0.03] px-6 py-5 sm:px-8">
          <Link to="/PainelDeEventos" className={btn('claro')}>Ver mais eventos</Link>
          <Link to="/ingressos" className={btn('primario')}>Ver meus ingressos</Link>
        </div>
      </Folha>
      <div className="max-w-xl"><IngressoCard compra={compra} /></div>
    </div>
  )
}

// pagamento (simulado) da compra. Os dados chegam pela navegacao (botao "Continuar para o pagamento" do evento);
// a compra so e criada no servidor quando o pagamento e confirmado aqui.
export default function Checkout() {
  const { state } = useLocation()
  const [saldo, setSaldo] = useState(null)

  useEffect(() => {
    if (!state) return
    solicitar('/saldo').then((d) => setSaldo(d.saldo)).catch(() => {}) // sem saldo, a opcao fica indisponivel
  }, [state])

  // abriu /checkout direto (ou deu F5): nao tem o que pagar, volta pros eventos
  if (!state?.evento) return <Navigate to="/PainelDeEventos" replace />

  const { evento, tipo, tipoNome, preco, quantidade } = state
  const total = preco * quantidade // so exibicao: o servidor calcula o total de verdade
  const saldoSuficiente = saldo != null && saldo >= total

  const metodos = [
    {
      id: 'saldo',
      nome: 'Saldo da plataforma',
      descricao: saldo == null ? 'Indisponível no momento.' : saldoSuficiente ? `Saldo disponível: ${brl(saldo)}` : `Saldo insuficiente (${brl(saldo)}). Adicione saldo na sua conta.`,
      indisponivel: !saldoSuficiente,
    },
    { id: 'cartao', nome: 'Cartão de crédito (simulado)', descricao: 'Nenhum dado de cartão é pedido ou guardado.' },
  ]

  async function aoConfirmar(metodo, resultado) {
    const r = await solicitar('/compras', {
      method: 'POST',
      body: JSON.stringify({ eventoId: evento.id, tipo, quantidade, metodo, resultado }),
    }, 'Não foi possível processar o pagamento.')
    return { resultado: r.resultado, dados: r.compra, mensagem: r.motivo }
  }

  return (
    <CheckoutSimulado
      titulo="Finalizar compra"
      sub={`${evento.titulo} · ${dataCurta(evento.data)}`}
      voltar={<Link to="/PainelDeEventos" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/70 no-underline transition-colors hover:text-white"><IconVoltar /> Voltar aos eventos</Link>}
      linhas={[{ rotulo: `${tipoNome} × ${quantidade}`, detalhe: `${brl(preco)} cada`, valor: total }]}
      total={total}
      metodos={metodos}
      aoConfirmar={aoConfirmar}
      sucesso={(compra) => <ConfirmacaoCompra compra={compra} />}
    />
  )
}

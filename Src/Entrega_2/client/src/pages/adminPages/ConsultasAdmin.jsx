import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { solicitar } from '../../services/api'
import Footer from '../../components/Footer'

const moeda = (valor) => Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const caixa = 'rounded-xl border border-tt-azul-marinho/15 bg-tt-branco p-5'

function Tabela({ colunas, linhas }) {
  return <div className="overflow-x-auto"><table className="w-full text-left text-sm">
    <thead><tr>{colunas.map((c) => <th key={c} className="border-b p-3">{c}</th>)}</tr></thead>
    <tbody>{linhas.map((linha, i) => <tr key={i}>{linha.map((valor, j) => <td key={j} className="border-b border-tt-azul-marinho/10 p-3">{valor ?? '—'}</td>)}</tr>)}</tbody>
  </table>{!linhas.length && <p className="py-5">Nenhum resultado encontrado.</p>}</div>
}

function DetalhesEvento({ id }) {
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState('')
  useEffect(() => {
    let ativo = true
    solicitar(`/admin/eventos/${id}`).then((d) => { if (ativo) setDados(d) })
      .catch((e) => { if (ativo) setErro(e.message) })
    return () => { ativo = false }
  }, [id])
  if (erro) return <p role="alert">{erro}</p>
  if (!dados) return <p role="status">Carregando detalhes…</p>
  const { ticket, itens, independentes, propostas } = dados
  return <section className={`${caixa} mt-6 space-y-5`}>
    <h2 className="text-xl font-bold">{ticket.evento.titulo}</h2>
    <h3 className="font-bold">Custos previstos dos itens</h3>
    <Tabela colunas={['Categoria', 'Descrição', 'Quantidade', 'Valor unitário']} linhas={itens.map((i) => [i.categoria, i.descricao_detalhada, i.quantidade, moeda(i.valor_unitario)])} />
    <h3 className="font-bold">Custos independentes</h3>
    <Tabela colunas={['Tipo', 'Descrição', 'Valor']} linhas={independentes.map((c) => [c.tipo_custo, c.descricao, moeda(c.valor)])} />
    <p className="text-sm">Custos do tipo Variável são valores por participante.</p>
    <h3 className="font-bold">Propostas</h3>
    <Tabela colunas={['Fornecedor', 'Status', 'Mensagem', 'Valor total']} linhas={propostas.map((p) => [p.fornecedor, p.status, p.mensagem, moeda(p.valor)])} />
    <h3 className="font-bold">Custos consolidados e ticket estimado</h3>
    <p>Custos fixos: {moeda(ticket.custos.custo_fixo_total)} · Variável por participante: {moeda(ticket.custos.variavel_por_participante)} · Margem: {ticket.margem_percentual}%</p>
    <Tabela colunas={['Cenário', 'Público', 'Custo total', 'Ticket de equilíbrio', 'Ticket alvo']} linhas={Object.entries(ticket.cenarios).map(([nome, c]) => [nome === 'minimo' ? 'Mínimo' : 'Máximo', c.publico, c.disponivel ? moeda(c.custo_total) : c.motivo, c.disponivel ? moeda(c.ticket_equilibrio) : '—', c.disponivel ? moeda(c.ticket_alvo) : '—'])} />
    <p className="text-sm text-tt-grafite/70">{ticket.formula}</p>
  </section>
}

// As duas consultas compartilham a estrutura visual e o tratamento de carregamento.
export default function ConsultasAdmin({ usuarios = false }) {
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('')
  const [evento, setEvento] = useState(null)
  useEffect(() => {
    let ativo = true
    solicitar(usuarios ? '/admin/usuarios' : '/admin/relatorios')
      .then((d) => { if (ativo) setDados(d) })
      .catch((e) => { if (ativo) setErro(e.message) })
      .finally(() => { if (ativo) setLoading(false) })
    return () => { ativo = false }
  }, [usuarios])
  const lista = dados.filter((d) =>
    [d.nome, d.email, d.empresa, d.titulo, d.organizador].some((v) => String(v ?? '').toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))) &&
    (!filtro || (usuarios ? d.perfil : d.status_publicacao) === filtro))
  return <div className="min-h-screen bg-tt-cinza-claro text-tt-azul-marinho">
    <main className="mx-auto max-w-[1100px] px-4 py-10">
      <Link to="/AdminDashboard" className="font-bold">← Voltar ao painel</Link>
      <h1 className="tt-display my-6 text-4xl">{usuarios ? 'Lista de usuários' : 'Relatórios gerenciais'}</h1>
      <div className="mb-6 flex flex-wrap gap-3">
        <input aria-label="Buscar por nome" placeholder={usuarios ? 'Buscar nome, e-mail ou empresa' : 'Buscar evento ou organizador'} value={busca} onChange={(e) => setBusca(e.target.value)} className="rounded-lg border p-3" />
        <select aria-label={usuarios ? 'Filtrar perfil' : 'Filtrar status'} value={filtro} onChange={(e) => setFiltro(e.target.value)} className="rounded-lg border p-3">
          <option value="">{usuarios ? 'Todos os perfis' : 'Todos os status'}</option>
          {(usuarios ? ['cliente', 'organizador', 'fornecedor', 'administrador'] : ['rascunho', 'publicado', 'encerrado', 'cancelado']).map((v) => <option key={v}>{v}</option>)}
        </select>
      </div>
      {loading && <p role="status">Carregando…</p>}
      {erro && <p role="alert">{erro}</p>}
      {!loading && !erro && <>
        <p className="mb-4 font-semibold">{lista.length} {usuarios ? 'usuários' : 'eventos'} encontrados{!usuarios && ` · ${lista.reduce((s, e) => s + Number(e.propostas), 0)} propostas · Valor aceito: ${moeda(lista.reduce((s, e) => s + Number(e.valor_aceito), 0))}`}</p>
        <div className={caixa}>
          {usuarios ? <Tabela colunas={['Nome', 'E-mail', 'Perfil', 'Empresa', 'Aprovação', 'Cadastro']} linhas={lista.map((u) => [u.nome, u.email, u.perfil, u.empresa, u.status, u.data_criacao ? new Date(u.data_criacao).toLocaleDateString('pt-BR') : '—'])} />
            : <Tabela colunas={['Evento', 'Organizador', 'Status', 'Propostas', 'Aceitas', 'Valor aceito', 'Detalhes']} linhas={lista.map((e) => [e.titulo, e.organizador, e.status_publicacao, e.propostas, e.aceitas, moeda(e.valor_aceito), <button key={e.id} onClick={() => setEvento(e.id)} className="font-bold underline">Ver custos e ticket</button>])} />}
        </div>
        {!usuarios && evento && <DetalhesEvento key={evento} id={evento} />}
      </>}
    </main>
    <Footer />
  </div>
}

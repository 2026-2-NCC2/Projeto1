import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

// ─── Dados mock ───────────────────────────────────────────────────────────────
// mesmos dados falsos do dashboard, com um cadastro a mais pra testar a lista
// status: 'pendente', 'aprovado' ou 'rejeitado'
const MOCK_CADASTROS = [
  { id: 1, nome: 'Carlos Mendonça',  empresa: 'Eventos & Cia',    tipo: 'organizador', email: 'carlos@eventosecia.com',  data: '23/09/2026', status: 'pendente'  },
  { id: 2, nome: 'Mariana Souza',    empresa: 'Som & Arte',        tipo: 'fornecedor',  email: 'mari@somart.com',         data: '22/09/2026', status: 'aprovado'  },
  { id: 3, nome: 'Pedro Alves',      empresa: 'AlvesShow',         tipo: 'organizador', email: 'pedro@alvesshow.com',     data: '21/09/2026', status: 'pendente'  },
  { id: 4, nome: 'Lúcia Ferreira',   empresa: 'LF Iluminação',     tipo: 'fornecedor',  email: 'lucia@lfilu.com',         data: '20/09/2026', status: 'rejeitado' },
  { id: 5, nome: 'Bruno Lima',       empresa: 'Lima Produções',    tipo: 'organizador', email: 'bruno@limaproducoes.com', data: '19/09/2026', status: 'aprovado'  },
  { id: 6, nome: 'Tatiana Campos',   empresa: 'TC Eventos',        tipo: 'fornecedor',  email: 'tati@tceven.com',         data: '18/09/2026', status: 'pendente'  },
];

// ─── Icone de busca ───────────────────────────────────────────────────────────
// estilo padrao dos svgs (mesmo do dashboard)
const S = { fill:'none', stroke:'currentColor', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round', viewBox:'0 0 24 24' };
// lupa que fica dentro do campo de pesquisa
const IconSearch = () => <svg width="15" height="15" {...S}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

// ─── Navbar Admin (igual ao Dashboard) ───────────────────────────────────────
// links do menu, mesma lista do dashboard
const NAV_LINKS = [
  { to: '/AdminDashboard',   label: 'Dashboard'  },
  { to: '/AprovarCadastros', label: 'Aprovações' },
];

// navbar do admin (mesma do dashboard)
function AdminNav() {
  // rota atual, pra saber qual link destacar
  const { pathname } = useLocation();
  return (
    // fica fixa no topo quando rola a pagina
    <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/10 bg-[#0d1b2e] px-6 md:px-10">
      {/* logo, volta pra home */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#7ED957] text-sm font-black text-[#0d1b2e]">T</span>
        <span className="text-sm font-extrabold tracking-tight text-white">
          TrocaTicket <span className="font-normal text-white/40">· Admin</span>
        </span>
      </Link>

      {/* links do menu */}
      <div className="flex items-center gap-1">
        {NAV_LINKS.map(({ to, label }) => {
          // ativo se for a pagina atual
          const active = pathname === to || (to !== '/admin' && pathname.startsWith(to));
          return (
            // link ativo fica mais claro, os outros mais apagados
            <Link key={to} to={to}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold no-underline transition-colors duration-150 ${
                active ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* botao de sair, por enquanto so leva pro login */}
      <Link to="/Login"
        className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/60 no-underline transition-colors hover:border-white/40 hover:text-white">
        Sair
      </Link>
    </nav>
  );
}

// ─── Filtros ──────────────────────────────────────────────────────────────────
// botoes de filtro da lista de cadastros
// key = status que vai filtrar / label = texto do botao / active = cor quando ta selecionado
const FILTROS = [
  { key: 'todos',     label: 'Todos',      active: 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' },
  { key: 'pendente',  label: 'Pendentes',  active: 'bg-[var(--color-pending)] text-white border-[var(--color-pending)]' },
  { key: 'aprovado',  label: 'Aprovados',  active: 'bg-[var(--color-success)] text-white border-[var(--color-success)]' },
  { key: 'rejeitado', label: 'Rejeitados', active: 'bg-[var(--color-danger)] text-white border-[var(--color-danger)]'   },
];

// ─── Componente principal ─────────────────────────────────────────────────────
// pagina onde o admin aprova ou rejeita os cadastros
export default function AprovarCadastros() {
  // lista de cadastros, fica no state pra atualizar quando aprovar/rejeitar
  const [cadastros, setCadastros] = useState(MOCK_CADASTROS);
  // filtro selecionado, comeca mostrando todos
  const [filtro, setFiltro]       = useState('todos');
  // texto digitado na busca
  const [busca, setBusca]         = useState('');

  // quantidade de cada status pra mostrar nos botoes de filtro
  // useMemo so recalcula quando a lista muda
  const contadores = useMemo(() => ({
    pendente:  cadastros.filter(c => c.status === 'pendente').length,
    aprovado:  cadastros.filter(c => c.status === 'aprovado').length,
    rejeitado: cadastros.filter(c => c.status === 'rejeitado').length,
  }), [cadastros]);

  // lista que aparece na tela, ja filtrada
  const lista = useMemo(() =>
    cadastros
      // primeiro filtra pelo status do botao selecionado
      .filter(c => filtro === 'todos' || c.status === filtro)
      // depois pela busca, procurando no nome, empresa ou email (sem diferenciar maiuscula)
      .filter(c => !busca || [c.nome, c.empresa, c.email].some(v => v.toLowerCase().includes(busca.toLowerCase())))
  , [cadastros, filtro, busca]);

  // muda o status do cadastro quando clica em aprovar ou rejeitar
  // por enquanto so muda no state, depois vai ter que chamar a API
  function handleAcao(id, acao) {
    setCadastros(prev =>
      prev.map(c => c.id === id ? { ...c, status: acao === 'aprovar' ? 'aprovado' : 'rejeitado' } : c)
    );
  }

  return (
    // fundo da pagina toda
    <div className="min-h-screen bg-[var(--color-bg)]">
      <AdminNav />

      {/* Hero - faixa azul do topo com o titulo */}
      <div className="bg-[var(--color-primary)] px-6 pb-12 pt-8 md:px-10">
        {/* centraliza o conteudo */}
        <div className="mx-auto max-w-[1100px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#7ED957]">Administração</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white md:text-4xl">Aprovar Cadastros</h1>
          <p className="mt-1.5 text-sm text-white/50">Gerencie solicitações de organizadores e fornecedores.</p>
        </div>
      </div>

      {/* conteudo principal */}
      <div className="mx-auto max-w-[1100px] px-6 pb-16 md:px-10">

        {/* Toolbar - filtros e busca */}
        {/* flex-wrap faz quebrar linha no celular */}
        <div className="mt-6 mb-5 flex flex-wrap items-center gap-3">
          {/* Filtros pill - um botao pra cada item do FILTROS */}
          <div className="flex flex-wrap gap-2">
            {FILTROS.map(f => (
              <button key={f.key} onClick={() => setFiltro(f.key)}
                // selecionado pega a cor do filtro, os outros ficam brancos
                className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                  filtro === f.key
                    ? f.active
                    : 'border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                }`}>
                {f.label}
                {/* contador do lado do nome, menos no "Todos" */}
                {f.key !== 'todos' && (
                  <span className={`min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${
                    filtro === f.key ? 'bg-white/25 text-white' : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}>{contadores[f.key] ?? 0}</span>
                )}
              </button>
            ))}
          </div>

          {/* Busca - campo de pesquisa com a lupa dentro */}
          <div className="relative min-w-[200px] flex-1 max-w-[360px]">
            {/* lupa posicionada na esquerda do input, pointer-events-none pra nao atrapalhar o clique */}
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]">
              <IconSearch />
            </span>
            {/* pl-9 deixa espaco pra lupa, no foco a borda e a sombra mudam de cor */}
            <input
              className="w-full rounded-xl border border-[var(--color-border)] bg-white py-2 pl-9 pr-4 text-sm text-[var(--color-text)] outline-none transition-all placeholder:text-[var(--color-text-light)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(26,46,74,.10)]"
              placeholder="Buscar por nome, empresa ou e-mail..."
              value={busca}
              // atualiza a busca a cada letra digitada
              onChange={e => setBusca(e.target.value)}
            />
          </div>

          {/* quantos cadastros tao aparecendo do total, ml-auto joga pro canto direito */}
          <span className="ml-auto whitespace-nowrap text-xs text-[var(--color-text-muted)]">
            {lista.length} de {cadastros.length} cadastros
          </span>
        </div>

        {/* Estado vazio - aparece quando o filtro ou a busca nao acha nada */}
        {lista.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-white px-6 py-16 text-center">
            <p className="font-semibold text-[var(--color-primary)]">Nenhum cadastro encontrado</p>
            {/* se tiver busca sugere mudar o texto, senao avisa que ta tudo processado */}
            <p className="text-sm text-[var(--color-text-muted)]">
              {busca ? 'Tente ajustar o termo de busca.' : 'Todas as solicitações foram processadas.'}
            </p>
          </div>
        )}

        {/* Tabela - so aparece se tiver algum cadastro na lista */}
        {lista.length > 0 && (
          // caixa branca em volta da tabela
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
            {/* deixa rolar pro lado no celular */}
            <div className="overflow-x-auto">
              {/* min-w impede a tabela de ficar espremida demais */}
              <table className="w-full min-w-[620px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                    {/* cabecalho com map, agora com a coluna de acoes */}
                    {['Nome / Empresa','Tipo','E-mail','Data','Status','Ações'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* uma linha pra cada cadastro da lista filtrada */}
                  {lista.map(c => (
                    // pendentes ficam com fundo roxinho pra chamar atencao
                    <tr key={c.id}
                      className={`border-b border-[var(--color-border)] transition-colors last:border-b-0 hover:bg-[#f8fafc] ${c.status === 'pendente' ? 'bg-[#faf5ff]' : ''}`}>
                      {/* nome e empresa na mesma celula */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[var(--color-primary)]">{c.nome}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{c.empresa}</p>
                      </td>
                      <td className="px-5 py-4"><Badge label={c.tipo} variant={c.tipo} /></td>
                      <td className="px-5 py-4 text-[var(--color-text-muted)]">{c.email}</td>
                      <td className="px-5 py-4 text-[var(--color-text-muted)]">{c.data}</td>
                      <td className="px-5 py-4"><Badge label={c.status} variant={c.status} /></td>
                      {/* botoes de aprovar e rejeitar so aparecem nos pendentes */}
                      <td className="px-5 py-4">
                        {c.status === 'pendente' ? (
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="danger"  onClick={() => handleAcao(c.id, 'rejeitar')}>Rejeitar</Button>
                            <Button size="sm" variant="primary" onClick={() => handleAcao(c.id, 'aprovar')}>Aprovar</Button>
                          </div>
                        ) : (
                          // quem ja foi analisado mostra so um tracinho
                          <span className="text-[var(--color-text-light)]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* rodape da tabela com a contagem */}
            <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3">
              <p className="text-xs text-[var(--color-text-muted)]">
                Mostrando <strong>{lista.length}</strong> de <strong>{cadastros.length}</strong> cadastros
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
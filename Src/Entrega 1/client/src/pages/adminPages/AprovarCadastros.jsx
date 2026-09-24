import React, { useState, useMemo } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

// ─── Dados mock ───────────────────────────────────────────────────────────────
const MOCK_CADASTROS = [
  { id: 1, nome: 'Carlos Mendonça',  empresa: 'Eventos & Cia',    tipo: 'organizador', email: 'carlos@eventosecia.com',  data: '23/09/2026', status: 'pendente'  },
  { id: 2, nome: 'Mariana Souza',    empresa: 'Som & Arte',        tipo: 'fornecedor',  email: 'mari@somart.com',         data: '22/09/2026', status: 'aprovado'  },
  { id: 3, nome: 'Pedro Alves',      empresa: 'AlvesShow',         tipo: 'organizador', email: 'pedro@alvesshow.com',     data: '21/09/2026', status: 'pendente'  },
  { id: 4, nome: 'Lúcia Ferreira',   empresa: 'LF Iluminação',     tipo: 'fornecedor',  email: 'lucia@lfilu.com',         data: '20/09/2026', status: 'rejeitado' },
  { id: 5, nome: 'Bruno Lima',       empresa: 'Lima Produções',    tipo: 'organizador', email: 'bruno@limaproducoes.com', data: '19/09/2026', status: 'aprovado'  },
  { id: 6, nome: 'Tatiana Campos',   empresa: 'TC Eventos',        tipo: 'fornecedor',  email: 'tati@tceven.com',         data: '18/09/2026', status: 'pendente'  },
];

const S = { fill:'none', stroke:'currentColor', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round', viewBox:'0 0 24 24' };
const IconSearch = () => <svg width="16" height="16" {...S}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

const FILTROS = [
  { key: 'todos',     label: 'Todos',      activeClass: 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' },
  { key: 'pendente',  label: 'Pendentes',  activeClass: 'bg-[var(--color-pending)] text-white border-[var(--color-pending)]' },
  { key: 'aprovado',  label: 'Aprovados',  activeClass: 'bg-[var(--color-success)] text-white border-[var(--color-success)]' },
  { key: 'rejeitado', label: 'Rejeitados', activeClass: 'bg-[var(--color-danger)]  text-white border-[var(--color-danger)]'  },
];

export default function AprovarCadastros() {
  const [cadastros, setCadastros] = useState(MOCK_CADASTROS);
  const [filtro, setFiltro]       = useState('todos');
  const [busca, setBusca]         = useState('');

  const contadores = useMemo(() => ({
    pendente:  cadastros.filter(c => c.status === 'pendente').length,
    aprovado:  cadastros.filter(c => c.status === 'aprovado').length,
    rejeitado: cadastros.filter(c => c.status === 'rejeitado').length,
  }), [cadastros]);

  const lista = useMemo(() =>
    cadastros
      .filter(c => filtro === 'todos' || c.status === filtro)
      .filter(c => !busca || [c.nome, c.empresa, c.email].some(v => v.toLowerCase().includes(busca.toLowerCase())))
  , [cadastros, filtro, busca]);

  function handleAcao(id, acao) {
    setCadastros(prev =>
      prev.map(c => c.id === id ? { ...c, status: acao === 'aprovar' ? 'aprovado' : 'rejeitado' } : c)
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-16">
      <div className="bg-[var(--color-primary)] px-6 pb-10 pt-8 md:px-10">
        <div className="mx-auto max-w-[1100px]">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]">Administração</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white md:text-4xl">Aprovar Cadastros</h1>
          <p className="mt-1.5 text-sm text-white/50">Gerencie solicitações de organizadores e fornecedores.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-6 md:px-10">
        {/* Toolbar */}
        <div className="-mt-5 mb-6 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTROS.map(f => (
              <button key={f.key} onClick={() => setFiltro(f.key)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                  filtro === f.key ? f.activeClass : 'border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                }`}>
                {f.label}
                {f.key !== 'todos' && (
                  <span className={`min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${
                    filtro === f.key ? 'bg-white/25 text-white' : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}>{contadores[f.key] ?? 0}</span>
                )}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[200px] max-w-[360px]">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]"><IconSearch /></span>
            <input
              className="w-full rounded-xl border border-[var(--color-border)] bg-white py-2 pl-9 pr-4 text-sm text-[var(--color-text)] outline-none transition-all focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(26,46,74,.10)] placeholder:text-[var(--color-text-light)]"
              placeholder="Buscar por nome, empresa ou e-mail..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>

          <span className="ml-auto whitespace-nowrap text-xs text-[var(--color-text-muted)]">
            {lista.length} de {cadastros.length} cadastros
          </span>
        </div>

        {/* Estado vazio */}
        {lista.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-white px-6 py-16 text-center">
            <p className="font-semibold text-[var(--color-primary)]">Nenhum cadastro encontrado</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {busca ? 'Tente ajustar o termo de busca.' : 'Todas as solicitações foram processadas.'}
            </p>
          </div>
        )}

        {/* Tabela */}
        {lista.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                    {['Nome / Empresa','Tipo','E-mail','Data','Status','Ações'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lista.map(c => (
                    <tr key={c.id} className={`border-b border-[var(--color-border)] transition-colors hover:bg-[#f8fafc] last:border-b-0 ${c.status === 'pendente' ? 'bg-purple-50/20' : ''}`}>
                      <td className="px-5 py-4"><p className="font-semibold text-[var(--color-primary)]">{c.nome}</p><p className="text-xs text-[var(--color-text-muted)]">{c.empresa}</p></td>
                      <td className="px-5 py-4"><Badge label={c.tipo} variant={c.tipo} /></td>
                      <td className="px-5 py-4 text-[var(--color-text-muted)]">{c.email}</td>
                      <td className="px-5 py-4 text-[var(--color-text-muted)]">{c.data}</td>
                      <td className="px-5 py-4"><Badge label={c.status} variant={c.status} /></td>
                      <td className="px-5 py-4">
                        {c.status === 'pendente' ? (
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="danger"  onClick={() => handleAcao(c.id, 'rejeitar')}>Rejeitar</Button>
                            <Button size="sm" variant="primary" onClick={() => handleAcao(c.id, 'aprovar')}>Aprovar</Button>
                          </div>
                        ) : (
                          <span className="text-[var(--color-text-light)]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

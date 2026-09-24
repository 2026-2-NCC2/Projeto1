import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Badge from '../../components/ui/Badge';

// ─── Dados mock ───────────────────────────────────────────────────────────────
const MOCK_CADASTROS = [
  { id: 1, nome: 'Carlos Mendonça',  empresa: 'Eventos & Cia',    tipo: 'organizador', email: 'carlos@eventosecia.com',  data: '23/09/2026', status: 'pendente'  },
  { id: 2, nome: 'Mariana Souza',    empresa: 'Som & Arte',        tipo: 'fornecedor',  email: 'mari@somart.com',         data: '22/09/2026', status: 'aprovado'  },
  { id: 3, nome: 'Pedro Alves',      empresa: 'AlvesShow',         tipo: 'organizador', email: 'pedro@alvesshow.com',     data: '21/09/2026', status: 'pendente'  },
  { id: 4, nome: 'Lúcia Ferreira',   empresa: 'LF Iluminação',     tipo: 'fornecedor',  email: 'lucia@lfilu.com',         data: '20/09/2026', status: 'rejeitado' },
  { id: 5, nome: 'Bruno Lima',       empresa: 'Lima Produções',    tipo: 'organizador', email: 'bruno@limaproducoes.com', data: '19/09/2026', status: 'aprovado'  },
];

// ─── Ícones ───────────────────────────────────────────────────────────────────
const S = { fill:'none', stroke:'currentColor', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round', viewBox:'0 0 24 24' };
const IconUsers  = () => <svg width="20" height="20" {...S}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconCheck  = () => <svg width="20" height="20" {...S}><polyline points="20 6 9 17 4 12"/></svg>;
const IconClock  = () => <svg width="20" height="20" {...S}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconX      = () => <svg width="20" height="20" {...S}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconArrow  = () => <svg width="15" height="15" {...S}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconReport = () => <svg width="20" height="20" {...S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;

// ─── Navbar Admin ─────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { to: '/AdminDashboard',           label: 'Dashboard'  },
  { to: '/AprovarCadastros', label: 'Aprovações' },
];

function AdminNav() {
  const { pathname } = useLocation();
  return (
    <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/10 bg-[#0d1b2e] px-6 md:px-10">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#7ED957] text-sm font-black text-[#0d1b2e]">T</span>
        <span className="text-sm font-extrabold tracking-tight text-white">
          TrocaTicket <span className="font-normal text-white/40">· Admin</span>
        </span>
      </Link>

      {/* Links de navegação */}
      <div className="flex items-center gap-1">
        {NAV_LINKS.map(({ to, label }) => {
          const active = pathname === to || (to !== '/admin' && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold no-underline transition-colors duration-150 ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Sair */}
      <Link
        to="/Login"
        className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/60 no-underline transition-colors hover:border-white/40 hover:text-white"
      >
        Sair
      </Link>
    </nav>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accentColor, bgClass }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
      <span className="absolute left-0 top-0 h-full w-1 rounded-l-2xl" style={{ background: accentColor }} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</p>
          <p className="mt-1 text-4xl font-extrabold leading-none text-[var(--color-primary)]">{value}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgClass}`}>{icon}</span>
      </div>
    </div>
  );
}

// ─── Quick Card ───────────────────────────────────────────────────────────────
function QuickCard({ to, icon, titulo, desc, badge }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-white px-5 py-4 no-underline shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0f4fa] text-xl transition-colors duration-200 group-hover:bg-[var(--color-primary)] group-hover:text-white">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-semibold text-[var(--color-primary)]">
          {titulo}
          {badge > 0 && (
            <span className="rounded-full bg-[var(--color-pending)] px-2 py-0.5 text-[10px] font-bold text-white">{badge}</span>
          )}
        </p>
        <p className="mt-0.5 truncate text-sm text-[var(--color-text-muted)]">{desc}</p>
      </div>
      <span className="shrink-0 text-[var(--color-text-light)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--color-primary)]">
        <IconArrow />
      </span>
    </Link>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const stats = {
    total:      MOCK_CADASTROS.length,
    pendentes:  MOCK_CADASTROS.filter(c => c.status === 'pendente').length,
    aprovados:  MOCK_CADASTROS.filter(c => c.status === 'aprovado').length,
    rejeitados: MOCK_CADASTROS.filter(c => c.status === 'rejeitado').length,
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <AdminNav />

      {/* Hero */}
      <div className="bg-[var(--color-primary)] px-6 pb-12 pt-8 md:px-10">
        <div className="mx-auto max-w-[1100px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#7ED957]">Administração</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white md:text-4xl">Painel Administrativo</h1>
          <p className="mt-1.5 text-sm text-white/50">Gerencie a plataforma TrocaTicket.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-6 pb-16 md:px-10">

        {/* Stat cards sobrepostos ao hero */}
        <div className="-mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total de cadastros" value={stats.total}
            icon={<span className="text-[var(--color-primary)]"><IconUsers /></span>}
            accentColor="var(--color-primary)" bgClass="bg-[#eef1f7]" />
          <StatCard label="Pendentes" value={stats.pendentes}
            icon={<span className="text-[var(--color-pending)]"><IconClock /></span>}
            accentColor="var(--color-pending)" bgClass="bg-[var(--color-pending-light)]" />
          <StatCard label="Aprovados" value={stats.aprovados}
            icon={<span className="text-[var(--color-success)]"><IconCheck /></span>}
            accentColor="var(--color-success)" bgClass="bg-[var(--color-success-light)]" />
          <StatCard label="Rejeitados" value={stats.rejeitados}
            icon={<span className="text-[var(--color-danger)]"><IconX /></span>}
            accentColor="var(--color-danger)" bgClass="bg-[var(--color-danger-light)]" />
        </div>

        {/* Acesso rápido */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-[var(--color-primary)]">Acesso rápido</h2>
          <div className="flex flex-col gap-3">
            <QuickCard to="/AprovacaoCadastros" icon="✅"
              titulo="Aprovar Cadastros"
              desc={`${stats.pendentes} solicitações aguardando revisão`}
              badge={stats.pendentes} />
            <QuickCard to="#" icon={<IconUsers />}
              titulo="Lista de Usuários"
              desc="Compradores, vendedores e suas permissões" />
            <QuickCard to="#" icon={<IconReport />}
              titulo="Relatórios"
              desc="Atividade da plataforma e métricas de uso" />
          </div>
        </section>

        {/* Cadastros recentes */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--color-primary)]">Cadastros recentes</h2>
            <Link to="/AprovacaoCadastros"
              className="text-sm font-semibold text-[var(--color-primary)] underline underline-offset-2 no-underline hover:opacity-75">
              Ver todos →
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                    {['Nome / Empresa','Tipo','E-mail','Data','Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CADASTROS.map(c => (
                    <tr key={c.id}
                      className={`border-b border-[var(--color-border)] transition-colors last:border-b-0 hover:bg-[#f8fafc] ${c.status === 'pendente' ? 'bg-[#faf5ff]' : ''}`}>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[var(--color-primary)]">{c.nome}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{c.empresa}</p>
                      </td>
                      <td className="px-5 py-3.5"><Badge label={c.tipo} variant={c.tipo} /></td>
                      <td className="px-5 py-3.5 text-[var(--color-text-muted)]">{c.email}</td>
                      <td className="px-5 py-3.5 text-[var(--color-text-muted)]">{c.data}</td>
                      <td className="px-5 py-3.5"><Badge label={c.status} variant={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

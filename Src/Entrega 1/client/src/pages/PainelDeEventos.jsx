import { useState } from "react";
import "../styles/PainelDeEventos.css";

// ─── Dados de exemplo (substituir por fetch da API) ───────────────────────────
const EVENTOS_MOCK = [
  {
    id: 1,
    titulo: "Lollapalooza 2026",
    data_inicio: "2026-03-28",
    data_fim: "2026-03-30",
    endereco: "Autódromo de Interlagos, SP",
    status_publicacao: "Publicado",
    ticket_estimado: 890.0,
    itens_pendentes: 3,
    banner_color: "#1a2f4e",
  },
  {
    id: 2,
    titulo: "Rock in Rio — Dia 1",
    data_inicio: "2026-09-12",
    data_fim: "2026-09-12",
    endereco: "Cidade do Rock, Rio de Janeiro",
    status_publicacao: "Publicado",
    ticket_estimado: 650.0,
    itens_pendentes: 4,
    banner_color: "#2d1b3d",
  },
  {
    id: 3,
    titulo: "Show Maroon 5",
    data_inicio: "2026-11-05",
    data_fim: "2026-11-05",
    endereco: "Allianz Parque, São Paulo",
    status_publicacao: "Rascunho",
    ticket_estimado: 420.0,
    itens_pendentes: 5,
    banner_color: "#1e3a2e",
  },
  {
    id: 4,
    titulo: "Tomorrowland Brasil",
    data_inicio: "2026-10-30",
    data_fim: "2026-11-01",
    endereco: "Parque Maeda, Itu — SP",
    status_publicacao: "Publicado",
    ticket_estimado: 1200.0,
    itens_pendentes: 6,
    banner_color: "#2a1a3e",
  },
  {
    id: 5,
    titulo: "GP de Interlagos 2026",
    data_inicio: "2026-11-13",
    data_fim: "2026-11-15",
    endereco: "Autódromo José Carlos Pace, SP",
    status_publicacao: "Publicado",
    ticket_estimado: 980.0,
    itens_pendentes: 7,
    banner_color: "#3a1a1a",
  },
  {
    id: 6,
    titulo: "Slayer em São Paulo",
    data_inicio: "2026-08-22",
    data_fim: "2026-08-22",
    endereco: "Audio Club, São Paulo",
    status_publicacao: "Encerrado",
    ticket_estimado: 280.0,
    itens_pendentes: 8,
    banner_color: "#1a1a1a",
  },
];

// ─── Mapa de status → className do badge ─────────────────────────────────────
const BADGE_CLASS = {
  Publicado: "badge--publicado",
  Rascunho:  "badge--rascunho",
  Encerrado: "badge--encerrado",
  Cancelado: "badge--cancelado",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatCurrency(val) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val);
}

// ─── Ícones ───────────────────────────────────────────────────────────────────
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);

const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconTicket = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
  </svg>
);

const IconPending = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5"  x2="12" y2="19"/>
    <line x1="5"  y1="12" x2="19" y2="12"/>
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

// ─── Subcomponentes ───────────────────────────────────────────────────────────
function MetaRow({ icon, text }) {
  return (
    <div className="meta-row">
      <span className="meta-row__icon">{icon}</span>
      <span className="meta-row__text">{text}</span>
    </div>
  );
}

function StatChip({ icon, label, value, accent }) {
  return (
    <div className="stat-chip">
      <span className={`stat-chip__label${accent ? " stat-chip__label--accent" : ""}`}>
        {icon}
        {label}
      </span>
      <span className={`stat-chip__value${accent ? "" : " stat-chip__value--dark"}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Card de Evento ───────────────────────────────────────────────────────────
function EventCard({ evento, onVerDetalhes }) {
  const isEncerrado =
    evento.status_publicacao === "Encerrado" ||
    evento.status_publicacao === "Cancelado";

  const badgeClass = BADGE_CLASS[evento.status_publicacao] || "badge--rascunho";

  const dataTexto =
    evento.data_inicio === evento.data_fim
      ? formatDate(evento.data_inicio)
      : `${formatDate(evento.data_inicio)} → ${formatDate(evento.data_fim)}`;

  return (
    <article className={`card${isEncerrado ? " card--encerrado" : ""}`}>
      {/* Banner dinâmico — só o gradient usa style inline pois depende de dados */}
      <div
        className="card__banner"
        style={{
          background: `linear-gradient(135deg, ${evento.banner_color} 0%, #0d1b2e 100%)`,
        }}
      >
        <span className={`badge ${badgeClass}`}>{evento.status_publicacao}</span>
      </div>

      <div className="card__body">
        <h2 className="card__title">{evento.titulo}</h2>

        <div className="card__meta">
          <MetaRow icon={<IconCalendar />} text={dataTexto} />
          <MetaRow icon={<IconPin />}      text={evento.endereco} />
        </div>

        <hr className="card__divider" />

        <div className="card__stats">
          <StatChip
            icon={<IconTicket />}
            label="Ticket estimado"
            value={formatCurrency(evento.ticket_estimado)}
            accent
          />
          <StatChip
            icon={<IconPending />}
            label="Itens pendentes"
            value={evento.itens_pendentes}
          />
        </div>

        <button
          className={`btn-detalhe${isEncerrado ? " btn-detalhe--disabled" : ""}`}
          onClick={() => !isEncerrado && onVerDetalhes(evento)}
          disabled={isEncerrado}
        >
          {isEncerrado ? "Evento encerrado" : "Ver detalhes →"}
        </button>
      </div>
    </article>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ activeTab, onTabChange }) {
  return (
    <nav className="navbar">
      <a className="navbar__logo" href="#">
        <span className="navbar__logo-icon">🎫</span>
        <span className="navbar__logo-text">
          Troca<span>Ticket</span>
        </span>
      </a>

      <div className="navbar__tabs">
        {[
          { key: "painel", label: "Painel de Eventos" },
          { key: "meus",   label: "Meus Eventos" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`navbar__tab${activeTab === tab.key ? " navbar__tab--active" : ""}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="navbar__user">
        <span className="navbar__username">Organizador</span>
        <button className="btn-sair">Sair</button>
      </div>
    </nav>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
const STATUS_OPCOES = ["Todos", "Publicado", "Rascunho", "Encerrado", "Cancelado"];

export default function PainelDeEventos() {
  const [activeTab,    setActiveTab]    = useState("painel");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [busca,        setBusca]        = useState("");

  const publicados = EVENTOS_MOCK.filter((e) => e.status_publicacao === "Publicado").length;

  const eventosFiltrados = EVENTOS_MOCK.filter((ev) => {
    const matchStatus =
      filtroStatus === "Todos" || ev.status_publicacao === filtroStatus;
    const matchBusca =
      ev.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      ev.endereco.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  function handleVerDetalhes(evento) {
    // TODO: integrar com React Router → navigate(`/eventos/${evento.id}`)
    alert(`Navegar para detalhes: ${evento.titulo}`);
  }

  return (
    <div className="painel-page">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Header */}
      <div className="page-header">
        <div className="page-header__inner">
          <div>
            <p className="page-header__eyebrow">Olá, Organizador</p>
            <h1 className="page-header__title">Painel de Eventos</h1>
            <p className="page-header__sub">
              {EVENTOS_MOCK.length} eventos cadastrados · {publicados} publicados
            </p>
          </div>
          <button className="btn-criar">
            <IconPlus />
            Criar Evento
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-bar">
        <div className="search-wrap">
          <span className="search-wrap__icon">
            <IconSearch />
          </span>
          <input
            className="search-input"
            type="text"
            placeholder="Buscar evento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="status-pills">
          {STATUS_OPCOES.map((s) => (
            <button
              key={s}
              className={`pill${filtroStatus === s ? " pill--active" : ""}`}
              onClick={() => setFiltroStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <span className="results-count">
          {eventosFiltrados.length} resultado{eventosFiltrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <main className="eventos-grid">
        {eventosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__emoji">🎟️</div>
            <p className="empty-state__title">Nenhum evento encontrado</p>
            <p className="empty-state__sub">
              Tente ajustar o filtro ou crie um novo evento.
            </p>
          </div>
        ) : (
          eventosFiltrados.map((ev) => (
            <EventCard key={ev.id} evento={ev} onVerDetalhes={handleVerDetalhes} />
          ))
        )}
      </main>
    </div>
  );
}

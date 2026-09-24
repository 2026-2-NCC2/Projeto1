import { useState } from "react";
import { Link } from "react-router-dom";

// ─── Dados de exemplo (substituir por fetch da API) ───────────────────────────
const EVENTOS_MOCK = [
  { id: 1, titulo: "Lollapalooza 2026", data_inicio: "2026-03-28", data_fim: "2026-03-30", endereco: "Autódromo de Interlagos, SP", status_publicacao: "Publicado", ticket_estimado: 890.0, itens_pendentes: 3, banner_color: "#1a2f4e" },
  { id: 2, titulo: "Rock in Rio — Dia 1", data_inicio: "2026-09-12", data_fim: "2026-09-12", endereco: "Cidade do Rock, Rio de Janeiro", status_publicacao: "Publicado", ticket_estimado: 650.0, itens_pendentes: 4, banner_color: "#2d1b3d" },
  { id: 3, titulo: "Show Maroon 5", data_inicio: "2026-11-05", data_fim: "2026-11-05", endereco: "Allianz Parque, São Paulo", status_publicacao: "Rascunho", ticket_estimado: 420.0, itens_pendentes: 5, banner_color: "#1e3a2e" },
  { id: 4, titulo: "Tomorrowland Brasil", data_inicio: "2026-10-30", data_fim: "2026-11-01", endereco: "Parque Maeda, Itu — SP", status_publicacao: "Publicado", ticket_estimado: 1200.0, itens_pendentes: 6, banner_color: "#2a1a3e" },
  { id: 5, titulo: "GP de Interlagos 2026", data_inicio: "2026-11-13", data_fim: "2026-11-15", endereco: "Autódromo José Carlos Pace, SP", status_publicacao: "Publicado", ticket_estimado: 980.0, itens_pendentes: 7, banner_color: "#3a1a1a" },
  { id: 6, titulo: "Slayer em São Paulo", data_inicio: "2026-08-22", data_fim: "2026-08-22", endereco: "Audio Club, São Paulo", status_publicacao: "Encerrado", ticket_estimado: 280.0, itens_pendentes: 8, banner_color: "#1a1a1a" },
];

// ─── Status → classes Tailwind do badge ──────────────────────────────────────
const BADGE_CLASS = {
  Publicado: "bg-[#dcfce7] text-[#15803d]",
  Rascunho:  "bg-[#fef9c3] text-[#a16207]",
  Encerrado: "bg-slate-100 text-slate-600",
  Cancelado: "bg-[#fee2e2] text-[#b91c1c]",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatCurrency(val) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

// ─── Ícones ───────────────────────────────────────────────────────────────────
const svgProps = {
  fill: "none", stroke: "currentColor", strokeWidth: 2,
  strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24",
};

const IconCalendar = () => (
  <svg width="14" height="14" {...svgProps}>
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconPin = () => (
  <svg width="14" height="14" {...svgProps}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconTicket = () => (
  <svg width="13" height="13" {...svgProps}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
  </svg>
);
const IconPending = () => (
  <svg width="13" height="13" {...svgProps}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconPlus = () => (
  <svg width="16" height="16" {...svgProps} strokeWidth={2.5}>
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" {...svgProps}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

// ─── Subcomponentes ───────────────────────────────────────────────────────────
function MetaRow({ icon, text }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <span className="shrink-0 flex text-slate-400">{icon}</span>
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{text}</span>
    </div>
  );
}

function StatChip({ icon, label, value, accent }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.6px] text-slate-400">
        <span className={accent ? "text-brand flex" : "flex"}>{icon}</span>
        {label}
      </span>
      <span className={`text-sm font-bold ${accent ? "text-brand-dark" : "text-navy-deep"}`}>{value}</span>
    </div>
  );
}

// ─── Card de Evento ───────────────────────────────────────────────────────────
function EventCard({ evento, onVerDetalhes }) {
  const isEncerrado = evento.status_publicacao === "Encerrado" || evento.status_publicacao === "Cancelado";
  const badgeClass = BADGE_CLASS[evento.status_publicacao] || BADGE_CLASS.Rascunho;

  const dataTexto =
    evento.data_inicio === evento.data_fim
      ? formatDate(evento.data_inicio)
      : `${formatDate(evento.data_inicio)} → ${formatDate(evento.data_fim)}`;

  return (
    <article
      className={`bg-white rounded-2xl overflow-hidden flex flex-col cursor-pointer shadow-[0_4px_24px_rgba(13,27,46,0.12)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(13,27,46,0.19)] ${
        isEncerrado ? "opacity-[0.72]" : ""
      }`}
    >
      {/* Banner: só o gradient é inline, pois depende dos dados */}
      <div
        className="relative overflow-hidden h-28 flex items-end px-4 py-3
          before:content-[''] before:absolute before:top-3.5 before:right-4 before:size-[52px] before:rounded-full before:border-2 before:border-brand/[0.22]
          after:content-[''] after:absolute after:top-[26px] after:right-7 after:size-7 after:rounded-full after:bg-brand/10"
        style={{ background: `linear-gradient(135deg, ${evento.banner_color} 0%, #0d1b2e 100%)` }}
      >
        <span className={`relative z-[1] text-[11px] font-semibold px-2.5 py-[3px] rounded-[20px] tracking-[0.2px] ${badgeClass}`}>
          {evento.status_publicacao}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 px-[18px] pt-4 pb-[18px]">
        <h2 className="text-base font-bold text-navy-deep leading-tight">{evento.titulo}</h2>

        <div className="flex flex-col gap-[5px]">
          <MetaRow icon={<IconCalendar />} text={dataTexto} />
          <MetaRow icon={<IconPin />} text={evento.endereco} />
        </div>

        <hr className="border-0 border-t border-slate-200 my-0.5" />

        <div className="flex justify-between items-start">
          <StatChip icon={<IconTicket />} label="Ticket estimado" value={formatCurrency(evento.ticket_estimado)} accent />
          <StatChip icon={<IconPending />} label="Itens pendentes" value={evento.itens_pendentes} />
        </div>

        <button
          className={`mt-1 w-full py-2.5 rounded-[10px] text-[13px] font-semibold tracking-[0.2px] transition-colors ${
            isEncerrado
              ? "bg-slate-100 text-slate-500 cursor-default"
              : "bg-navy-deep text-brand cursor-pointer hover:bg-navy-2"
          }`}
          onClick={() => !isEncerrado && onVerDetalhes(evento)}
          disabled={isEncerrado}
        >
          {isEncerrado ? "Evento encerrado" : "Ver detalhes →"}
        </button>
      </div>
    </article>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
const STATUS_OPCOES = ["Todos", "Publicado", "Rascunho", "Encerrado", "Cancelado"];

export default function PainelDeEventos() {
  const [activeTab, setActiveTab] = useState("painel");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [busca, setBusca] = useState("");

  const publicados = EVENTOS_MOCK.filter((e) => e.status_publicacao === "Publicado").length;

  const eventosFiltrados = EVENTOS_MOCK.filter((ev) => {
    const matchStatus = filtroStatus === "Todos" || ev.status_publicacao === filtroStatus;
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
    <div className="min-h-screen bg-slate-50 text-navy-deep">
     

      {/* Header */}
      <div className="bg-navy-deep px-4 pt-5 pb-7 md:px-8 md:pt-7 md:pb-9">
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-brand text-[11px] font-semibold tracking-[1.2px] uppercase mb-1">Olá, Organizador</p>
            <h1 className="text-white text-[22px] md:text-[26px] font-extrabold tracking-[-0.5px]">Painel de Eventos</h1>
            <p className="text-white/40 text-[13px] mt-1.5">
              {EVENTOS_MOCK.length} eventos cadastrados · {publicados} publicados
            </p>
          </div>
          <Link to="/criar-evento/evento" className="flex items-center gap-2 bg-brand text-navy-deep rounded-xl px-[22px] py-[11px] text-sm font-bold whitespace-nowrap cursor-pointer shadow-[0_4px_14px_rgba(74,222,128,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(74,222,128,0.45)]">
            <IconPlus />
            Criar Evento
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-[22px] flex flex-wrap items-center gap-3">
        <div className="relative flex-[1_1_240px] md:max-w-[340px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex">
            <IconSearch />
          </span>
          <input
            className="w-full py-[9px] pr-3 pl-[38px] rounded-[10px] border border-slate-200 bg-white text-[13px] text-navy-deep outline-none transition focus:border-[#94c6ff] focus:ring-[3px] focus:ring-blue-500/[0.12]"
            type="text"
            placeholder="Buscar evento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPCOES.map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`rounded-[20px] border px-4 py-1.5 text-xs cursor-pointer transition ${
                filtroStatus === s
                  ? "bg-navy-deep text-brand border-navy-deep font-semibold"
                  : "bg-white text-slate-500 border-slate-200 font-normal hover:border-slate-300 hover:text-navy-deep"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">
          {eventosFiltrados.length} resultado{eventosFiltrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-6 pb-[60px] grid gap-6 grid-cols-[repeat(auto-fill,minmax(308px,1fr))]">
        {eventosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">🎟️</div>
            <p className="text-base font-semibold text-slate-600 mb-1.5">Nenhum evento encontrado</p>
            <p className="text-[13px]">Tente ajustar o filtro ou crie um novo evento.</p>
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

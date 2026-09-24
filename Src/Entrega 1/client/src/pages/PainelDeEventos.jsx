import { useState } from "react";

// ─── Dados de exemplo iniciais ────────────────────────────────────────────────
const EVENTOS_INICIAIS = [
  { id: 1, titulo: "Lollapalooza 2026", data_inicio: "2026-03-28", data_fim: "2026-03-30", endereco: "Autódromo de Interlagos, SP", status_publicacao: "Publicado", ticket_estimado: 890.0, itens_pendentes: 3, banner_color: "#1a2f4e", organizador_id: 99, organizador_nome: "Você" },
  { id: 2, titulo: "Rock in Rio — Dia 1", data_inicio: "2026-09-12", data_fim: "2026-09-12", endereco: "Cidade do Rock, Rio de Janeiro", status_publicacao: "Publicado", ticket_estimado: 650.0, itens_pendentes: 4, banner_color: "#2d1b3d", organizador_id: 12, organizador_nome: "Rock World" },
  { id: 3, titulo: "Show Maroon 5", data_inicio: "2026-11-05", data_fim: "2026-11-05", endereco: "Allianz Parque, São Paulo", status_publicacao: "Rascunho", ticket_estimado: 420.0, itens_pendentes: 5, banner_color: "#1e3a2e", organizador_id: 99, organizador_nome: "Você" },
  { id: 4, titulo: "Tomorrowland Brasil", data_inicio: "2026-10-30", data_fim: "2026-11-01", endereco: "Parque Maeda, Itu — SP", status_publicacao: "Publicado", ticket_estimado: 1200.0, itens_pendentes: 6, banner_color: "#2a1a3e", organizador_id: 45, organizador_nome: "SFX Entertainment" },
  { id: 5, titulo: "GP de Interlagos 2026", data_inicio: "2026-11-13", data_fim: "2026-11-15", endereco: "Autódromo José Carlos Pace, SP", status_publicacao: "Publicado", ticket_estimado: 980.0, itens_pendentes: 7, banner_color: "#3a1a1a", organizador_id: 99, organizador_nome: "Você" },
  { id: 6, titulo: "Slayer em São Paulo", data_inicio: "2026-08-22", data_fim: "2026-08-22", endereco: "Audio Club, São Paulo", status_publicacao: "Encerrado", ticket_estimado: 280.0, itens_pendentes: 8, banner_color: "#1a1a1a", organizador_id: 77, organizador_nome: "Move Concerts" },
];

const BADGE_CLASS = {
  Publicado: "bg-[#dcfce7] text-[#15803d]",
  Rascunho:  "bg-[#fef9c3] text-[#a16207]",
  Encerrado: "bg-[#f1f5f9] text-[#475569]",
  Cancelado: "bg-[#fee2e2] text-[#b91c1c]",
};

function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatCurrency(val) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

// ─── Ícones SVG ───────────────────────────────────────────────────────────────
const svgProps = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24" };
const IconCalendar = () => <svg width="14" height="14" {...svgProps}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconPin = () => <svg width="14" height="14" {...svgProps}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconTicket = () => <svg width="13" height="13" {...svgProps}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>;
const IconPending = () => <svg width="13" height="13" {...svgProps}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconPlus = () => <svg width="16" height="16" {...svgProps} strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconSearch = () => <svg width="16" height="16" {...svgProps}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconArrowLeft = () => <svg width="16" height="16" {...svgProps}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;

export default function PainelDeEventos() {
  // ─── Estados Principais do App Mockado ─────────────────────────────────────
  const [logado, setLogado] = useState(true);
  const [telaAtual, setTelaAtual] = useState("painel"); // 'painel' ou 'detalhes'
  const [eventos, setEventos] = useState(EVENTOS_INICIAIS);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  
  // Filtros da listagem
  const [activeTab, setActiveTab] = useState("painel"); // 'painel' ou 'meus'
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [busca, setBusca] = useState("");

  // Controle dos Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState("criar"); // 'criar' ou 'editar'
  
  // Campos do formulário unificado (Criar/Editar)
  const [formId, setFormId] = useState(null);
  const [formTitulo, setFormTitulo] = useState("");
  const [formInicio, setFormInicio] = useState("");
  const [formFim, setFormFim] = useState("");
  const [formEndereco, setFormEndereco] = useState("");
  const [formStatus, setFormStatus] = useState("Publicado");
  const [formTicket, setFormTicket] = useState("");

  const ORGANIZADOR_LOGADO_ID = 99;

  // ─── Lógica de Filtros Integrada ────────────────────────────────────────────
  const eventosFiltrados = eventos.filter((ev) => {
    const matchAba = activeTab === "painel" || ev.organizador_id === ORGANIZADOR_LOGADO_ID;
    const matchStatus = filtroStatus === "Todos" || ev.status_publicacao === filtroStatus;
    const matchBusca = ev.titulo.toLowerCase().includes(busca.toLowerCase()) || ev.endereco.toLowerCase().includes(busca.toLowerCase());
    return matchAba && matchStatus && matchBusca;
  });

  // ─── Handlers de Fluxos e Ações ─────────────────────────────────────────────
  function abrirModalCriar() {
    setModoModal("criar");
    setFormId(null);
    setFormTitulo("");
    setFormInicio("");
    setFormFim("");
    setFormEndereco("");
    setFormStatus("Publicado");
    setFormTicket("");
    setModalAberto(true);
  }

  function abrirModalEditar(ev) {
    setModoModal("editar");
    setFormId(ev.id);
    setFormTitulo(ev.titulo);
    setFormInicio(ev.data_inicio);
    setFormFim(ev.data_fim);
    setFormEndereco(ev.endereco);
    setFormStatus(ev.status_publicacao);
    setFormTicket(ev.ticket_estimado.toString());
    setModalAberto(true);
  }

  function salvarFormulario(e) {
    e.preventDefault();
    if (!formTitulo || !formInicio || !formEndereco) return;

    if (modoModal === "criar") {
      const novoEvento = {
        id: Date.now(),
        titulo: formTitulo,
        data_inicio: formInicio,
        data_fim: formFim || formInicio,
        endereco: formEndereco,
        status_publicacao: formStatus,
        ticket_estimado: parseFloat(formTicket) || 0,
        itens_pendentes: 0,
        banner_color: "#1a2f4e",
        organizador_id: ORGANIZADOR_LOGADO_ID,
        organizador_nome: "Você"
      };
      setEventos([novoEvento, ...eventos]);
    } else {
      const eventosAtualizados = eventos.map((ev) => {
        if (ev.id === formId) {
          const atualizado = { ...ev, titulo: formTitulo, data_inicio: formInicio, data_fim: formFim || formInicio, endereco: formEndereco, status_publicacao: formStatus, ticket_estimado: parseFloat(formTicket) || 0 };
          if (eventoSelecionado && eventoSelecionado.id === formId) setEventoSelecionado(atualizado);
          return atualizado;
        }
        return ev;
      });
      setEventos(eventosAtualizados);
    }
    setModalAberto(false);
  }

  function excluirEvento(id) {
    if (confirm("Tem certeza que deseja remover este evento do painel mockado?")) {
      setEventos(eventos.filter(ev => ev.id !== id));
      setTelaAtual("painel");
      setEventoSelecionado(null);
    }
  }

  // ─── RENDER: Tela de Login Fictícia ─────────────────────────────────────────
  if (!logado) {
    return (
      <div className="min-h-screen bg-[#0d1b2e] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="text-5xl mb-3">🎫</div>
          <h2 className="text-2xl font-extrabold text-[#0d1b2e]">Troca<span className="text-[#4ade80]">Ticket</span></h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">Acesse seu painel administrativo de eventos</p>
          <div className="space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">E-mail fake</label>
              <input type="text" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm" value="organizador@trocaticket.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Senha fake</label>
              <input type="password" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm" value="••••••••" />
            </div>
          </div>
          <button onClick={() => setLogado(true)} className="mt-6 w-full bg-[#0d1b2e] text-[#4ade80] font-bold py-3 rounded-xl transition hover:bg-[#1a2f4e]">
            Entrar no Painel Fictício
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0d1b2e]">
      {/* Navbar Geral */}
      <nav className="sticky top-0 z-[100] h-[60px] px-8 flex items-center justify-between bg-[#0d1b2e] border-b border-white/[0.06]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setTelaAtual("painel"); setEventoSelecionado(null); }}>
          <span className="text-xl">🎫</span>
          <span className="text-white font-extrabold text-lg tracking-[-0.3px]">Troca<span className="text-[#4ade80]">Ticket</span></span>
        </div>

        {telaAtual === "painel" && (
          <div className="flex gap-1">
            {[{ key: "painel", label: "Painel de Eventos" }, { key: "meus", label: "Meus Eventos" }].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`border-b-2 px-4 py-[7px] text-[13px] cursor-pointer transition rounded-t-md ${activeTab === tab.key ? "text-[#4ade80] bg-[#4ade80]/[0.12] border-[#4ade80] font-semibold" : "text-white/55 border-transparent font-normal hover:text-white/85"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="text-[13px] text-white/55 hidden sm:inline">Modo Organizador</span>
          <button onClick={() => setLogado(false)} className="bg-transparent border border-white/20 rounded-md text-white/70 px-3.5 py-[5px] text-xs cursor-pointer transition hover:border-white/45">Sair</button>
        </div>
      </nav>

      {/* TELA 1: LISTAGEM E PAINEL */}
      {telaAtual === "painel" && (
        <>
          <div className="bg-[#0d1b2e] px-8 pt-7 pb-9">
            <div className="max-w-[1200px] mx-auto flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[#4ade80] text-[12px] font-semibold tracking-[1px] uppercase mb-1">{activeTab === "meus" ? "Seus Eventos" : "Geral"}</p>
                <h1 className="text-white text-[26px] font-extrabold tracking-[-0.5px]">{activeTab === "meus" ? "Meus Eventos Criados" : "Painel de Eventos"}</h1>
                <p className="text-white/45 text-[13px] mt-1.5">{eventos.length} eventos cadastrados · {eventos.filter(e => e.status_publicacao === "Publicado").length} publicados</p>
              </div>
              <button onClick={abrirModalCriar} className="flex items-center gap-2 bg-[#4ade80] text-[#0d1b2e] rounded-xl px-[22px] py-[11px] text-sm font-bold whitespace-nowrap cursor-pointer shadow-[0_4px_14px_rgba(74,222,128,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(74,222,128,0.45)]">
                <IconPlus /> Criar Evento
              </button>
            </div>
          </div>

          <div className="max-w-[1200px] mx-auto px-8 pt-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-[1_1_240px] max-w-[340px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] flex"><IconSearch /></span>
              <input className="w-full py-[9px] pr-3 pl-[38px] rounded-[10px] border border-[#e2e8f0] bg-white text-[13px] text-[#0d1b2e] outline-none transition focus:border-[#94c6ff] focus:ring-[3px] focus:ring-blue-500/[0.12]" type="text" placeholder="Buscar evento..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {["Todos", "Publicado", "Rascunho", "Encerrado", "Cancelado"].map((s) => (
                <button key={s} onClick={() => setFiltroStatus(s)} className={`rounded-[20px] border px-4 py-1.5 text-xs cursor-pointer transition ${filtroStatus === s ? "bg-[#0d1b2e] text-[#4ade80] border-[#0d1b2e] font-semibold" : "bg-white text-[#64748b] border-[#e2e8f0] font-normal hover:border-slate-300 hover:text-[#0d1b2e]"}`}>{s}</button>
              ))}
            </div>
            <span className="ml-auto text-xs text-[#94a3b8] whitespace-nowrap">{eventosFiltrados.length} resultado{eventosFiltrados.length !== 1 ? "s" : ""}</span>
          </div>

          <main className="max-w-[1200px] mx-auto px-8 pt-6 pb-12 grid gap-6 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
            {eventosFiltrados.length === 0 ? (
              <div className="col-span-full text-center py-20 text-[#94a3b8]">
                <div className="text-5xl mb-4">🎟️</div>
                <p className="text-base font-semibold text-slate-600 mb-1.5">Nenhum evento encontrado</p>
                <p className="text-[13px]">Ajuste seus filtros de busca ou crie um novo evento.</p>
              </div>
            ) : (
              eventosFiltrados.map((ev) => {
                const enc = ev.status_publicacao === "Encerrado" || ev.status_publicacao === "Cancelado";
                return (
                  <article key={ev.id} className={`bg-white rounded-2xl overflow-hidden flex flex-col cursor-pointer shadow-[0_4px_24px_rgba(13,27,46,0.13)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(13,27,46,0.20)] ${enc ? "opacity-[0.72]" : ""}`}>
                    <div className="relative overflow-hidden h-[110px] flex items-end px-4 py-3 before:content-[''] before:absolute before:top-3.5 before:right-4 before:size-12 before:rounded-full before:border-2 before:border-[#4ade80]/[0.25] after:content-[''] after:absolute after:top-[24px] after:right-[26px] after:size-7 after:rounded-full after:bg-[#4ade80]/[0.12]" style={{ background: `linear-gradient(135deg, ${ev.banner_color} 0%, #0d1b2e 100%)` }}>
                      <span className={`relative z-1 text-[11px] font-semibold px-2.5 py-[3px] rounded-[20px] tracking-[0.2px] ${BADGE_CLASS[ev.status_publicacao] || "bg-slate-100"}`}>{ev.status_publicacao}</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2 px-[18px] pt-4 pb-[18px]">
                      <h2 className="text-base font-bold text-[#0d1b2e] leading-tight line-clamp-1">{ev.titulo}</h2>
                      <div className="text-[11.5px] text-[#94a3b8] -mt-1">Por: <strong className="text-[#64748b] font-semibold">{ev.organizador_nome}</strong></div>
                      <div className="flex flex-col gap-1.5 mt-1">
                        <div className="flex items-center gap-1.5 text-xs text-[#64748b]"><span className="text-[#94a3b8] flex"><IconCalendar /></span><span className="truncate">{ev.data_inicio === ev.data_fim ? formatDate(ev.data_inicio) : `${formatDate(ev.data_inicio)} → ${formatDate(ev.data_fim)}`}</span></div>
                        <div className="flex items-center gap-1.5 text-xs text-[#64748b]"><span className="text-[#94a3b8] flex"><IconPin /></span><span className="truncate">{ev.endereco}</span></div>
                      </div>
                      <hr className="border-0 border-t border-[#e2e8f0] my-1" />
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5"><span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.5px] text-[#94a3b8]"><span className="text-[#4ade80] flex"><IconTicket /></span>Ticket</span><span className="text-sm font-bold text-[#15803d]">{formatCurrency(ev.ticket_estimado)}</span></div>
                        <div className="flex flex-col gap-0.5"><span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.5px] text-[#94a3b8]">Pendências</span><span className="text-sm font-bold text-[#0d1b2e]">{ev.itens_pendentes}</span></div>
                      </div>
                      <button onClick={() => { setEventoSelecionado(ev); setTelaAtual("detalhes"); }} className="mt-2 w-full py-[9px] rounded-lg text-[13px] font-semibold tracking-[0.2px] bg-[#0d1b2e] text-[#4ade80] hover:bg-[#1a2f4e] transition-colors">Ver detalhes →</button>
                    </div>
                  </article>
                );
              })
            )}
          </main>
        </>
      )}

      {/* TELA 2: VISUALIZAÇÃO INTERNA DE DETALHES */}
      {telaAtual === "detalhes" && eventoSelecionado && (
        <div className="max-w-[800px] mx-auto px-4 py-8">
          <button onClick={() => { setTelaAtual("painel"); setEventoSelecionado(null); }} className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#0d1b2e] mb-6 transition-colors font-medium">
            <IconArrowLeft /> Voltar para a lista
          </button>
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-100">
            <div className="h-[160px] flex items-end p-6" style={{ background: `linear-gradient(135deg, ${eventoSelecionado.banner_color} 0%, #0d1b2e 100%)` }}>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${BADGE_CLASS[eventoSelecionado.status_publicacao]}`}>{eventoSelecionado.status_publicacao}</span>
            </div>
            <div className="p-8">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0d1b2e] tracking-tight">{eventoSelecionado.titulo}</h1>
              <p className="text-sm text-[#64748b] mt-1">Organizado por: <span className="font-semibold text-[#0d1b2e]">{eventoSelecionado.organizador_nome}</span></p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 p-4 bg-[#f8fafc] rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 text-sm text-[#64748b]"><span className="p-2 bg-white rounded-lg shadow-sm text-[#0d1b2e]"><IconCalendar /></span><div><p className="text-[11px] uppercase tracking-wider text-[#94a3b8] font-bold">Data do Evento</p><p className="font-medium text-[#0d1b2e]">{eventoSelecionado.data_inicio === eventoSelecionado.data_fim ? formatDate(eventoSelecionado.data_inicio) : `${formatDate(eventoSelecionado.data_inicio)} até ${formatDate(eventoSelecionado.data_fim)}`}</p></div></div>
                <div className="flex items-center gap-3 text-sm text-[#64748b]"><span className="p-2 bg-white rounded-lg shadow-sm text-[#0d1b2e]"><IconPin /></span><div><p className="text-[11px] uppercase tracking-wider text-[#94a3b8] font-bold">Localização</p><p className="font-medium text-[#0d1b2e] truncate max-w-[260px]">{eventoSelecionado.endereco}</p></div></div>
                <div className="flex items-center gap-3 text-sm text-[#64748b]"><span className="p-2 bg-white rounded-lg shadow-sm text-[#15803d]"><IconTicket /></span><div><p className="text-[11px] uppercase tracking-wider text-[#94a3b8] font-bold">Ticket Médio Estimado</p><p className="font-bold text-[#15803d]">{formatCurrency(eventoSelecionado.ticket_estimado)}</p></div></div>
                <div className="flex items-center gap-3 text-sm text-[#64748b]"><span className="p-2 bg-white rounded-lg shadow-sm text-[#0d1b2e]"><IconPending /></span><div><p className="text-[11px] uppercase tracking-wider text-[#94a3b8] font-bold">Tarefas Pendentes</p><p className="font-medium text-[#0d1b2e]">{eventoSelecionado.itens_pendentes} itens registrados</p></div></div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button onClick={() => excluirEvento(eventoSelecionado.id)} className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition">Excluir Evento</button>
                <button onClick={() => abrirModalEditar(eventoSelecionado)} className="px-5 py-2.5 rounded-xl bg-[#0d1b2e] text-[#4ade80] font-semibold text-sm hover:bg-[#1a2f4e] transition">Editar Evento</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL COLETIVO (CRIAR / EDITAR) */}
      {modalAberto && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl font-bold text-[#0d1b2e] mb-4">{modoModal === "criar" ? "Criar Novo Evento Fictício" : "Editar Dados do Evento"}</h2>
            <form onSubmit={salvarFormulario} className="space-y-4">
              <div><label className="text-xs font-bold text-[#64748b] block mb-1">Título do Evento *</label><input type="text" required value={formTitulo} onChange={(e) => setFormTitulo(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#4ade80]" placeholder="Ex: Lollapalooza 2026" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-[#64748b] block mb-1">Data Início *</label><input type="date" required value={formInicio} onChange={(e) => setFormInicio(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#4ade80]" /></div>
                <div><label className="text-xs font-bold text-[#64748b] block mb-1">Data Fim</label><input type="date" value={formFim} onChange={(e) => setFormFim(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#4ade80]" /></div>
              </div>
              <div><label className="text-xs font-bold text-[#64748b] block mb-1">Endereço / Local *</label><input type="text" required value={formEndereco} onChange={(e) => setFormEndereco(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#4ade80]" placeholder="Ex: Allianz Parque, São Paulo" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-[#64748b] block mb-1">Status de Publicação</label><select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none bg-white focus:border-[#4ade80]"><option value="Publicado">Publicado</option><option value="Rascunho">Rascunho</option><option value="Encerrado">Encerrado</option><option value="Cancelado">Cancelado</option></select></div>
                <div><label className="text-xs font-bold text-[#64748b] block mb-1">Ticket Estimado (R$)</label><input type="number" value={formTicket} onChange={(e) => setFormTicket(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#4ade80]" placeholder="890" /></div>
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalAberto(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#64748b] hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-[#4ade80] text-[#0d1b2e] font-bold rounded-xl text-sm hover:opacity-90">Salvar Mudanças</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

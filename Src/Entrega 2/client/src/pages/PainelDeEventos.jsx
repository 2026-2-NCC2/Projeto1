// useCallback = guarda uma funcao pra ela nao ser recriada a toda hora / useState = guarda informacoes que mudam
import { useCallback, useState } from "react";
// Link = link sem recarregar / useSearchParams = le o que vem depois do ? na url (ex: ?tab=meus)
import { Link, useSearchParams } from "react-router-dom";
// mapinha do OpenStreetMap usado nos detalhes
import MapaEvento from "../components/MapaEvento";
// funcao que coloca o nome do evento no caminho de pao
import { useBreadcrumbExtra } from "../components/Breadcrumb";
// funcao que diz qual perfil esta usando o site
import { lerPerfil } from "../services/perfil";

// ─── Dados de exemplo iniciais ────────────────────────────────────────────────
// eventos falsos pra testar a tela enquanto a API nao ta pronta
// organizador_id 99 e o "usuario logado", entao esses aparecem em "Meus Eventos"
const EVENTOS_INICIAIS = [
  // cada evento tem: id, titulo, datas, endereco, status, ticket, pendencias, cor do banner e quem organiza
  { id: 1, titulo: "Lollapalooza 2026", data_inicio: "2026-03-28", data_fim: "2026-03-30", endereco: "Autódromo de Interlagos, SP", status_publicacao: "Publicado", ticket_estimado: 890.0, itens_pendentes: 3, banner_color: "var(--tt-azul-vivo)", organizador_id: 99, organizador_nome: "Você" },
  { id: 2, titulo: "Rock in Rio — Dia 1", data_inicio: "2026-09-12", data_fim: "2026-09-12", endereco: "Cidade do Rock, Rio de Janeiro", status_publicacao: "Publicado", ticket_estimado: 650.0, itens_pendentes: 4, banner_color: "#6D3FD1", organizador_id: 12, organizador_nome: "Rock World" },
  { id: 3, titulo: "Show Maroon 5", data_inicio: "2026-11-05", data_fim: "2026-11-05", endereco: "Allianz Parque, São Paulo", status_publicacao: "Rascunho", ticket_estimado: 420.0, itens_pendentes: 5, banner_color: "#1261A0", organizador_id: 99, organizador_nome: "Você" },
  { id: 4, titulo: "Tomorrowland Brasil", data_inicio: "2026-10-30", data_fim: "2026-11-01", endereco: "Parque Maeda, Itu — SP", status_publicacao: "Publicado", ticket_estimado: 1200.0, itens_pendentes: 6, banner_color: "#172554", organizador_id: 45, organizador_nome: "SFX Entertainment" },
  { id: 5, titulo: "GP de Interlagos 2026", data_inicio: "2026-11-13", data_fim: "2026-11-15", endereco: "Autódromo José Carlos Pace, SP", status_publicacao: "Publicado", ticket_estimado: 980.0, itens_pendentes: 7, banner_color: "var(--tt-rosa-principal)", organizador_id: 99, organizador_nome: "Você" },
  { id: 6, titulo: "Slayer em São Paulo", data_inicio: "2026-08-22", data_fim: "2026-08-22", endereco: "Audio Club, São Paulo", status_publicacao: "Encerrado", ticket_estimado: 280.0, itens_pendentes: 8, banner_color: "#1F2937", organizador_id: 77, organizador_nome: "Move Concerts" },
];

// cor da etiqueta de cada status
const BADGE_CLASS = {
  Publicado: "bg-tt-verde-claro text-tt-verde-sucesso",
  Rascunho:  "bg-tt-laranja-claro text-tt-azul-marinho",
  Encerrado: "bg-tt-cinza-claro text-tt-grafite/85",
  Cancelado: "bg-tt-rosa-claro text-tt-rosa-principal",
};

// transforma a data do formato do banco (2026-03-28) pro brasileiro (28/03/2026)
// se nao tiver data mostra um tracinho
function formatDate(iso) {
  // sem data: mostra um tracinho
  if (!iso) return "—";
  // separa ano, mes e dia pelo "-"
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// formata numero como dinheiro (ex: 890 vira "R$ 890,00")
function formatCurrency(val) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

// ─── Ícones SVG ───────────────────────────────────────────────────────────────
// estilo padrao dos svgs, currentColor faz o icone pegar a cor do texto
// icones: calendario, localizacao, ingresso, pendencias, mais (criar), lupa e seta de voltar
const svgProps = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24" };
// icone de calendario
const IconCalendar  = () => <svg width="14" height="14" {...svgProps}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
// icone de alfinete de mapa
const IconPin       = () => <svg width="14" height="14" {...svgProps}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
// icone de ingresso
const IconTicket    = () => <svg width="13" height="13" {...svgProps}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>;
// icone de relogio (pendencias)
const IconPending   = () => <svg width="13" height="13" {...svgProps}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
// icone de + (criar)
const IconPlus      = () => <svg width="16" height="16" {...svgProps} strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
// icone de lupa (busca)
const IconSearch    = () => <svg width="16" height="16" {...svgProps}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
// icone de seta pra esquerda (voltar)
const IconArrowLeft = () => <svg width="16" height="16" {...svgProps}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;

// disquinho de vinil decorativo do canto do banner: branco translucido (combina com qualquer cor de evento),
// sulcos finos, um brilho e o selo do meio no degrade roxo -> rosa do site
// id = id do evento, pra cada card ter o proprio degrade no svg
// gira bem devagar quando passa o mouse no card (so se a pessoa nao pediu menos animacao no sistema)
const DiscoVinil = ({ id }) => (
  // desenho feito em SVG (aria-hidden: so enfeite, o leitor de tela ignora)
  <svg
    viewBox="0 0 56 56"
    aria-hidden="true"
    className="pointer-events-none absolute right-4 top-3.5 size-12 opacity-80 motion-safe:group-hover:animate-[spin_5s_linear_infinite]"
  >
    {/* degrade do selo do meio (roxo -> rosa) */}
    <defs>
      <linearGradient id={`selo-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--tt-roxo-principal)" />
        <stop offset="100%" stopColor="var(--tt-rosa-principal)" />
      </linearGradient>
    </defs>
    {/* disco */}
    <circle cx="28" cy="28" r="27" fill="var(--tt-branco)" fillOpacity="0.14" stroke="var(--tt-branco)" strokeOpacity="0.4" strokeWidth="1.2" />
    {/* sulcos */}
    {[22, 18, 14].map((r) => (
      <circle key={r} cx="28" cy="28" r={r} fill="none" stroke="var(--tt-branco)" strokeOpacity="0.22" strokeWidth="0.8" />
    ))}
    {/* brilho */}
    <path d="M12 16 A20 20 0 0 1 24 9" fill="none" stroke="var(--tt-branco)" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
    {/* selo do meio e furinho */}
    <circle cx="28" cy="28" r="8" fill={`url(#selo-${id})`} />
    <circle cx="28" cy="28" r="1.8" fill="var(--tt-branco)" />
  </svg>
);

// id do organizador "logado", por enquanto fixo ate ter login de verdade
const ORGANIZADOR_LOGADO_ID = 99;

// classes dos campos do modal de criar/editar (iguais em todos os campos)
// texto em cima de cada campo
const labelModal = "mb-1.5 block text-xs font-bold text-tt-azul-marinho";
// campo de texto
const inputModal = "w-full rounded-xl border border-tt-azul-marinho/12 bg-tt-branco p-2.5 text-sm text-tt-azul-marinho outline-none transition focus:border-tt-azul-principal focus:ring-[3px] focus:ring-tt-azul-suave";

// pagina com a lista de eventos, os detalhes de um evento e o modal de editar
export default function PainelDeEventos() {
  // ── Aba ativa vem da url (o link "Meus Eventos" da Navbar coloca ?tab=meus) ──────────────────
  // ex: ?tab=meus mostra so os meus eventos, sem nada mostra todos
  // le os parametros da url
  const [searchParams] = useSearchParams()
  // aba atual: 'meus' ou 'painel' (padrao)
  const activeTab = searchParams.get('tab') || 'painel'

  // o que cada perfil pode fazer aqui: organizador cria e mexe nos eventos dele, admin mexe em todos
  // usuario, fornecedor e visitante so olham
  // perfil atual: admin, organizador, cliente, fornecedor ou visitante
  const perfil = lerPerfil()
  // true se pode criar evento
  const podeCriar = perfil === "organizador" || perfil === "admin"
  // recebe um evento e diz se pode editar/excluir ele
  const podeEditar = (ev) => perfil === "admin" || (perfil === "organizador" && ev.organizador_id === ORGANIZADOR_LOGADO_ID)

  // ── Estado interno da página ──────────────────────────────────────────────
  // telaAtual = "painel" (lista) ou "detalhes" / eventoSelecionado = evento aberto nos detalhes
  // modoModal = "criar" ou "editar" / os form... sao os campos do formulario do modal
  // qual tela esta aberta: lista ou detalhes
  const [telaAtual, setTelaAtual]           = useState("painel");
  // lista de eventos (comeca com os de exemplo)
  const [eventos, setEventos]               = useState(EVENTOS_INICIAIS);
  // evento aberto nos detalhes
  const [eventoSelecionado, setEventoSel]   = useState(null);
  // filtro de status escolhido
  const [filtroStatus, setFiltroStatus]     = useState("Todos");
  // texto digitado na busca
  const [busca, setBusca]                   = useState("");
  // se o modal de criar/editar esta aberto
  const [modalAberto, setModalAberto]       = useState(false);
  // se o modal esta criando ou editando
  const [modoModal, setModoModal]           = useState("criar");
  // campos do formulario do modal (um estado pra cada campo)
  const [formId, setFormId]                 = useState(null);
  const [formTitulo, setFormTitulo]         = useState("");
  const [formInicio, setFormInicio]         = useState("");
  const [formFim, setFormFim]               = useState("");
  const [formEndereco, setFormEndereco]     = useState("");
  const [formStatus, setFormStatus]         = useState("Publicado");
  const [formTicket, setFormTicket]         = useState("");
  // true enquanto o card de detalhes faz a animacao de cair ao excluir
  const [excluindo, setExcluindo]           = useState(false);

  // nos detalhes, o nome do evento aparece no fim do caminho de pao
  // e clicar em "Eventos" no caminho volta pra lista
  // volta pra lista e limpa o evento aberto
  const voltarParaLista = useCallback(() => { setTelaAtual("painel"); setEventoSel(null); }, []);
  // manda o nome do evento pro caminho de pao (so quando os detalhes estao abertos)
  useBreadcrumbExtra(telaAtual === "detalhes" ? eventoSelecionado?.titulo : null, voltarParaLista);

  // ── Filtragem (usa activeTab vindo da URL) ────────────────────────────────
  // o evento so aparece se passar nos 3 filtros: aba, status e busca
  // a busca procura no titulo ou no endereco, sem diferenciar maiuscula
  const eventosFiltrados = eventos.filter((ev) => {
    // aba "painel" mostra tudo; aba "meus" so os do organizador logado
    const matchAba    = activeTab === "painel" || ev.organizador_id === ORGANIZADOR_LOGADO_ID;
    // "Todos" mostra qualquer status
    const matchStatus = filtroStatus === "Todos" || ev.status_publicacao === filtroStatus;
    // busca no titulo ou no endereco
    const matchBusca  = ev.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                        ev.endereco.toLowerCase().includes(busca.toLowerCase());
    return matchAba && matchStatus && matchBusca;
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  // abre o modal ja preenchido com os dados do evento
  function abrirModalEditar(ev) {
    // preenche cada campo do modal com os dados do evento
    setModoModal("editar");
    setFormId(ev.id);
    setFormTitulo(ev.titulo);
    setFormInicio(ev.data_inicio);
    setFormFim(ev.data_fim);
    setFormEndereco(ev.endereco);
    setFormStatus(ev.status_publicacao);
    setFormTicket(ev.ticket_estimado.toString());
    // abre o modal
    setModalAberto(true);
  }

  // salva o formulario do modal (criando um evento novo ou editando)
  function salvarFormulario(e) {
    // impede o form de recarregar a pagina
    e.preventDefault();
    // nao salva se faltar titulo, data de inicio ou endereco
    if (!formTitulo || !formInicio || !formEndereco) return;

    if (modoModal === "criar") {
      // monta o evento novo, usa a hora atual como id e se nao tiver data fim usa a de inicio
      const novoEvento = {
        // Date.now() = numero da hora atual (serve como id unico)
        id: Date.now(),
        titulo: formTitulo,
        data_inicio: formInicio,
        data_fim: formFim || formInicio,
        endereco: formEndereco,
        status_publicacao: formStatus,
        ticket_estimado: parseFloat(formTicket) || 0,
        itens_pendentes: 0,
        // evento novo comeca com o banner azul e com o organizador logado como dono
        banner_color: "var(--tt-azul-vivo)",
        organizador_id: ORGANIZADOR_LOGADO_ID,
        organizador_nome: "Você",
      };
      // coloca o novo no comeco da lista
      setEventos([novoEvento, ...eventos]);
    } else {
      // troca so o evento que ta sendo editado, os outros ficam iguais
      setEventos(eventos.map((ev) => {
        // os outros eventos ficam como estao
        if (ev.id !== formId) return ev;
        // copia o evento e troca so os campos do formulario
        const atualizado = { ...ev, titulo: formTitulo, data_inicio: formInicio, data_fim: formFim || formInicio, endereco: formEndereco, status_publicacao: formStatus, ticket_estimado: parseFloat(formTicket) || 0 };
        // se o evento editado ta aberto nos detalhes, atualiza la tambem
        if (eventoSelecionado?.id === formId) setEventoSel(atualizado);
        return atualizado;
      }));
    }
    // fecha o modal
    setModalAberto(false);
  }

  // depois de confirmar, so liga a animacao de "cair" (animate__hinge) no card
  // o evento so e removido quando a animacao termina (no onAnimationEnd do card)
  function excluirEvento() {
    // confirm = caixinha do navegador com OK/Cancelar
    if (confirm("Tem certeza que deseja remover este evento?")) {
      setExcluindo(true);
    }
  }

  // roda quando o card termina de cair: remove o evento e volta pra lista
  function finalizarExclusao(e) {
    // ignora animacoes de elementos de dentro do card
    if (!excluindo || e.target !== e.currentTarget) return;
    // tira o evento da lista
    setEventos(eventos.filter((ev) => ev.id !== eventoSelecionado.id));
    // desliga a animacao
    setExcluindo(false);
    // volta pra lista
    setTelaAtual("painel");
    setEventoSel(null);
  }
  // ── Render ────────────────────────────────────────────────────────────────
  return (
    // pagina inteira com fundo cinza claro
    <div className="min-h-screen bg-tt-cinza-claro text-tt-azul-marinho">

      {/* ── TELA: LISTAGEM ── */}
      {telaAtual === "painel" && (
        // <></> agrupa varias partes sem criar uma div a mais
        <>
          {/* Hero sub-header, no mesmo estilo claro da pagina inicial */}
          {/* titulo muda conforme a aba, e embaixo mostra o total e quantos estao publicados */}
          <section className="border-b border-tt-azul-marinho/12 bg-[image:var(--tt-gradiente-suave)]">
            {/* conteudo centralizado */}
            <div className="mx-auto flex w-[calc(100%_-_48px)] max-w-[1180px] flex-wrap items-end justify-between gap-4 py-10 max-[760px]:w-[calc(100%_-_36px)] max-[760px]:py-8">
              {/* etiqueta, titulo e resumo */}
              <div>
                <span className="inline-block text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-tt-roxo-principal">
                  {activeTab === "meus" ? "Seus eventos" : "Explore"}
                </span>
                <h1 className="mb-0 mt-2 text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.1] tracking-[-0.045em] text-tt-azul-marinho">
                  {activeTab === "meus" ? "Meus eventos criados" : "Painel de eventos"}
                </h1>
                <p className="mt-2 text-sm text-tt-grafite/75">
                  {eventos.length} eventos cadastrados · {eventos.filter((e) => e.status_publicacao === "Publicado").length} publicados
                </p>
              </div>
              {/* botao que leva pro formulario de criar evento (so pra quem pode criar) */}
              {podeCriar && <Link
                to="/criar-evento/evento"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[image:var(--tt-gradiente-botao)] px-5 py-3 text-[13px] font-bold text-tt-branco no-underline transition hover:brightness-110 hover:shadow-[0_8px_20px_color-mix(in_srgb,var(--tt-rosa-principal)_30%,transparent)]"
              >
                <IconPlus /> Criar evento
              </Link>}
            </div>
          </section>

          {/* Barra de filtros */}
          <div className="mx-auto flex w-[calc(100%_-_48px)] max-w-[1180px] flex-wrap items-center gap-3 pt-7 max-[760px]:w-[calc(100%_-_36px)]">
            {/* campo de busca com a lupa dentro, em formato de pilula igual ao da pagina inicial */}
            <div className="relative flex-[1_1_240px] max-w-[360px]">
              {/* lupa dentro do campo */}
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tt-grafite/60 flex"><IconSearch /></span>
              {/* campo de busca: cada letra digitada atualiza a busca */}
              <input
                className="w-full rounded-lg border border-tt-azul-marinho/12 bg-tt-branco py-[10px] pl-[42px] pr-4 text-[13px] text-tt-azul-marinho outline-none shadow-[0_8px_24px_color-mix(in_srgb,var(--tt-azul-marinho)_6%,transparent)] transition placeholder:text-tt-grafite/60 focus:border-tt-azul-principal"
                type="text"
                placeholder="Buscar evento ou local..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            {/* botoes de filtro por status, o selecionado fica escuro */}
            <div className="flex flex-wrap gap-1.5">
              {["Todos", "Publicado", "Rascunho", "Encerrado", "Cancelado"].map((s) => (
                // um botao pra cada status
                <button
                  key={s}
                  onClick={() => setFiltroStatus(s)}
                  className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                    filtroStatus === s
                      ? "border-tt-azul-principal bg-tt-azul-principal text-tt-branco"
                      : "border-tt-azul-marinho/12 bg-tt-branco text-tt-grafite/75 hover:border-tt-azul-principal hover:text-tt-azul-principal"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {/* quantidade de resultados, coloca o "s" so se for mais de um */}
            <span className="ml-auto whitespace-nowrap text-xs text-tt-grafite/60">
              {eventosFiltrados.length} resultado{eventosFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Grid de cards */}
          {/* cabe quantos cards de 300px der na largura da tela */}
          <div className="mx-auto grid w-[calc(100%_-_48px)] max-w-[1180px] grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[18px] pb-[72px] pt-6 max-[760px]:w-[calc(100%_-_36px)]">
            {/* se nenhum evento passar nos filtros mostra a mensagem, senao mostra os cards */}
            {eventosFiltrados.length === 0 ? (
              <div className="col-span-full rounded-[18px] border border-dashed border-tt-azul-marinho/12 bg-tt-branco py-20 text-center text-tt-grafite/60">
                {/* emoji, titulo e texto da mensagem */}
                <div className="mb-4 text-5xl">🎟️</div>
                <p className="mb-1.5 text-base font-bold text-tt-azul-marinho">Nenhum evento encontrado</p>
                <p className="text-[13px]">Ajuste seus filtros de busca ou crie um novo evento.</p>
              </div>
            ) : (
              eventosFiltrados.map((ev) => {
                // eventos encerrados ou cancelados ficam mais apagados
                const enc = ev.status_publicacao === "Encerrado" || ev.status_publicacao === "Cancelado";
                return (
                  // card do evento (o "group" deixa o disco girar ao passar o mouse no card)
                  <article
                    key={ev.id}
                    className={`group flex flex-col overflow-hidden rounded-[18px] border border-tt-azul-marinho/12 bg-tt-branco shadow-[0_1px_2px_color-mix(in_srgb,var(--tt-azul-marinho)_4%,transparent)] transition duration-150 hover:-translate-y-[3px] hover:shadow-[0_12px_28px_color-mix(in_srgb,var(--tt-azul-marinho)_10%,transparent)] ${enc ? "opacity-[0.72]" : ""}`}
                  >
                    {/* banner do card com a cor do evento */}
                    {/* no canto fica um disquinho de vinil decorativo (gira devagar ao passar o mouse no card) */}
                    <div
                      className="relative flex h-[104px] items-end overflow-hidden px-4 py-3"
                      style={{ background: ev.banner_color }}
                    >
                      {/* disco de vinil do canto */}
                      <DiscoVinil id={ev.id} />
                      {/* etiqueta de status */}
                      <span className={`relative z-1 rounded-full px-2.5 py-[3px] text-[11px] font-semibold tracking-[0.2px] ${BADGE_CLASS[ev.status_publicacao] || "bg-tt-cinza-claro"}`}>
                        {ev.status_publicacao}
                      </span>
                    </div>

                    {/* conteudo do card: titulo, organizador, data, local, ticket e pendencias */}
                    <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-4">
                      {/* nome do evento (line-clamp-1 corta com ... se for grande) */}
                      <h2 className="line-clamp-1 text-base font-bold leading-tight text-tt-azul-marinho">{ev.titulo}</h2>
                      {/* quem organiza */}
                      <div className="-mt-1 text-xs text-tt-grafite/60">
                        Por: <strong className="font-semibold text-tt-grafite/75">{ev.organizador_nome}</strong>
                      </div>
                      {/* data e local */}
                      <div className="mt-1 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-tt-grafite/75">
                          <span className="flex text-tt-azul-principal"><IconCalendar /></span>
                          {/* se for um dia so mostra uma data, senao mostra inicio → fim */}
                          <span className="truncate">
                            {ev.data_inicio === ev.data_fim
                              ? formatDate(ev.data_inicio)
                              : `${formatDate(ev.data_inicio)} → ${formatDate(ev.data_fim)}`}
                          </span>
                        </div>
                        {/* local */}
                        <div className="flex items-center gap-1.5 text-xs text-tt-grafite/75">
                          <span className="flex text-tt-azul-principal"><IconPin /></span>
                          <span className="truncate">{ev.endereco}</span>
                        </div>
                      </div>
                      {/* linha separando as partes */}
                      <hr className="my-1 border-0 border-t border-tt-azul-marinho/12" />
                      {/* ticket estimado e pendencias lado a lado */}
                      <div className="flex items-start justify-between">
                        {/* ticket estimado */}
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.5px] text-tt-grafite/60">
                            <span className="flex text-tt-azul-principal"><IconTicket /></span>Ticket
                          </span>
                          <span className="text-sm font-bold text-tt-azul-principal">{formatCurrency(ev.ticket_estimado)}</span>
                        </div>
                        {/* pendencias */}
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.5px] text-tt-grafite/60">Pendências</span>
                          <span className="text-sm font-bold text-tt-azul-marinho">{ev.itens_pendentes}</span>
                        </div>
                      </div>
                      {/* abre a tela de detalhes desse evento */}
                      <button
                        onClick={() => { setEventoSel(ev); setTelaAtual("detalhes"); }}
                        className="mt-2 w-full cursor-pointer rounded-lg bg-tt-azul-principal py-[10px] text-[13px] font-bold text-tt-branco transition hover:bg-tt-azul-profundo"
                      >
                        Ver detalhes →
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ── TELA: DETALHES ── */}
      {/* so aparece se tiver um evento selecionado */}
      {telaAtual === "detalhes" && eventoSelecionado && (
        // area dos detalhes, centralizada (no maximo 800px)
        <div className="mx-auto w-[calc(100%_-_48px)] max-w-[800px] py-10 max-[760px]:w-[calc(100%_-_36px)]">
          {/* volta pra lista e limpa o evento selecionado */}
          <button
            onClick={() => { setTelaAtual("painel"); setEventoSel(null); }}
            className="mb-6 flex cursor-pointer items-center gap-2 text-[13px] font-bold text-tt-azul-principal transition-colors hover:text-tt-azul-marinho"
          >
            <IconArrowLeft /> Voltar para a lista
          </button>

          {/* ao excluir, ganha as classes do Animate.css e "despenca" pendurado pelo canto (hinge) */}
          <div
            onAnimationEnd={finalizarExclusao}
            className={`overflow-hidden rounded-[20px] border border-tt-azul-marinho/12 bg-tt-branco shadow-[0_12px_28px_color-mix(in_srgb,var(--tt-azul-marinho)_8%,transparent)] ${excluindo ? "animate__animated animate__hinge pointer-events-none" : ""}`}
          >
            {/* banner com a cor do evento e o status */}
            <div
              className="flex h-[150px] items-end p-6"
              style={{ background: eventoSelecionado.banner_color }}
            >
              {/* etiqueta de status */}
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${BADGE_CLASS[eventoSelecionado.status_publicacao]}`}>
                {eventoSelecionado.status_publicacao}
              </span>
            </div>

            {/* conteudo do card de detalhes */}
            <div className="p-8 max-[480px]:p-5">
              {/* etiqueta, nome do evento e quem organiza */}
              <span className="inline-block text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-tt-roxo-principal">Detalhes do evento</span>
              <h1 className="mb-0 mt-2 text-[clamp(26px,3.4vw,34px)] font-extrabold leading-[1.15] tracking-[-0.04em] text-tt-azul-marinho">
                {eventoSelecionado.titulo}
              </h1>
              <p className="mt-1.5 text-sm text-tt-grafite/75">
                Organizado por: <span className="font-semibold text-tt-azul-marinho">{eventoSelecionado.organizador_nome}</span>
              </p>

              {/* caixa com data, local, ticket e pendencias (1 coluna no celular e 2 em tela maior) */}
              <div className="my-6 grid grid-cols-1 gap-4 rounded-2xl border border-tt-azul-marinho/12 bg-tt-cinza-claro p-4 sm:grid-cols-2">
                {/* data */}
                <div className="flex items-center gap-3 text-sm">
                  <span className="rounded-xl bg-tt-azul-suave p-2.5 text-tt-azul-principal"><IconCalendar /></span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-tt-grafite/60">Data do evento</p>
                    <p className="font-medium text-tt-azul-marinho">
                      {eventoSelecionado.data_inicio === eventoSelecionado.data_fim
                        ? formatDate(eventoSelecionado.data_inicio)
                        : `${formatDate(eventoSelecionado.data_inicio)} até ${formatDate(eventoSelecionado.data_fim)}`}
                    </p>
                  </div>
                </div>
                {/* localizacao */}
                <div className="flex items-center gap-3 text-sm">
                  <span className="rounded-xl bg-tt-azul-suave p-2.5 text-tt-azul-principal"><IconPin /></span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-tt-grafite/60">Localização</p>
                    <p className="truncate font-medium text-tt-azul-marinho">{eventoSelecionado.endereco}</p>
                  </div>
                </div>
                {/* ticket medio */}
                <div className="flex items-center gap-3 text-sm">
                  <span className="rounded-xl bg-tt-azul-suave p-2.5 text-tt-azul-principal"><IconTicket /></span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-tt-grafite/60">Ticket médio estimado</p>
                    <p className="font-bold text-tt-azul-principal">{formatCurrency(eventoSelecionado.ticket_estimado)}</p>
                  </div>
                </div>
                {/* pendencias */}
                <div className="flex items-center gap-3 text-sm">
                  <span className="rounded-xl bg-tt-azul-suave p-2.5 text-tt-azul-principal"><IconPending /></span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-tt-grafite/60">Tarefas pendentes</p>
                    <p className="font-medium text-tt-azul-marinho">{eventoSelecionado.itens_pendentes} itens registrados</p>
                  </div>
                </div>
              </div>

              {/* mapa com a localizacao do evento (OpenStreetMap), dentro do card */}
              <div className="mb-6">
                <MapaEvento endereco={eventoSelecionado.endereco} />
              </div>

              {/* botoes de excluir e editar (so pra quem pode mexer nesse evento) */}
              {podeEditar(eventoSelecionado) && <div className="flex flex-wrap justify-end gap-3 border-t border-tt-azul-marinho/12 pt-5">
                {/* excluir: pergunta antes e depois faz o card cair */}
                <button
                  onClick={excluirEvento}
                  className="cursor-pointer rounded-lg border border-tt-rosa-suave px-5 py-3 text-[13px] font-bold text-tt-rosa-principal transition hover:bg-tt-rosa-claro"
                >
                  Excluir evento
                </button>
                {/* editar: abre o modal com os dados do evento */}
                <button
                  onClick={() => abrirModalEditar(eventoSelecionado)}
                  className="cursor-pointer rounded-lg bg-[image:var(--tt-gradiente-botao)] px-5 py-3 text-[13px] font-bold text-tt-branco transition hover:brightness-110 hover:shadow-[0_8px_20px_color-mix(in_srgb,var(--tt-rosa-principal)_30%,transparent)]"
                >
                  Editar evento
                </button>
              </div>}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CRIAR / EDITAR ── */}
      {/* fundo escuro por cima da tela toda com o formulario no meio */}
      {modalAberto && (
        // fixed inset-0 = cobre a tela inteira; backdrop-blur desfoca o que esta atras
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-tt-azul-marinho/50 p-4 backdrop-blur-sm">
          {/* caixa branca do formulario */}
          <div className="w-full max-w-lg rounded-[20px] border border-tt-azul-marinho/12 bg-tt-branco p-7 shadow-2xl max-[480px]:p-5">
            {/* titulo muda se ta criando ou editando */}
            <span className="inline-block text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-tt-roxo-principal">
              {modoModal === "criar" ? "Novo evento" : "Edição"}
            </span>
            {/* titulo do modal */}
            <h2 className="mb-5 mt-1 text-xl font-extrabold tracking-[-0.03em] text-tt-azul-marinho">
              {modoModal === "criar" ? "Criar novo evento" : "Editar dados do evento"}
            </h2>
            {/* ao enviar chama o salvarFormulario */}
            <form onSubmit={salvarFormulario} className="space-y-4">
              {/* titulo */}
              <div>
                {/* cada campo: texto em cima e o campo embaixo */}
                <label className={labelModal}>Título do evento *</label>
                <input type="text" required value={formTitulo} onChange={(e) => setFormTitulo(e.target.value)}
                  className={inputModal}
                  placeholder="Ex: Lollapalooza 2026" />
              </div>
              {/* datas lado a lado, so a de inicio e obrigatoria */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelModal}>Data início *</label>
                  <input type="date" required value={formInicio} onChange={(e) => setFormInicio(e.target.value)}
                    className={inputModal} />
                </div>
                <div>
                  <label className={labelModal}>Data fim</label>
                  <input type="date" value={formFim} onChange={(e) => setFormFim(e.target.value)}
                    className={inputModal} />
                </div>
              </div>
              {/* endereco */}
              <div>
                <label className={labelModal}>Endereço / Local *</label>
                <input type="text" required value={formEndereco} onChange={(e) => setFormEndereco(e.target.value)}
                  className={inputModal}
                  placeholder="Ex: Allianz Parque, São Paulo" />
              </div>
              {/* status e ticket lado a lado */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelModal}>Status de publicação</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}
                    className={inputModal}>
                    {/* opcoes de status */}
                    <option value="Publicado">Publicado</option>
                    <option value="Rascunho">Rascunho</option>
                    <option value="Encerrado">Encerrado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className={labelModal}>Ticket estimado (R$)</label>
                  <input type="number" value={formTicket} onChange={(e) => setFormTicket(e.target.value)}
                    className={inputModal}
                    placeholder="890" />
                </div>
              </div>
              {/* cancelar fecha sem salvar / salvar envia o form */}
              <div className="flex justify-end gap-2 border-t border-tt-azul-marinho/12 pt-5">
                {/* Cancelar: so fecha o modal */}
                <button type="button" onClick={() => setModalAberto(false)}
                  className="cursor-pointer rounded-lg px-5 py-3 text-[13px] font-bold text-tt-grafite/75 transition hover:bg-tt-cinza-claro">
                  Cancelar
                </button>
                {/* Salvar: envia o formulario (chama o salvarFormulario) */}
                <button type="submit"
                  className="cursor-pointer rounded-lg bg-[image:var(--tt-gradiente-botao)] px-5 py-3 text-[13px] font-bold text-tt-branco transition hover:brightness-110 hover:shadow-[0_8px_20px_color-mix(in_srgb,var(--tt-rosa-principal)_30%,transparent)]">
                  Salvar mudanças
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

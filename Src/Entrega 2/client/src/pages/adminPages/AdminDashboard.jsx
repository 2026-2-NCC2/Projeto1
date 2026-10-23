
import { Link, useLocation } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Footer from '../../components/Footer';
import Sticker from '../../components/Sticker';
import React, { useEffect, useState } from "react";
import { buscarCadastros } from "../../services/api";

// formata o timestamp vindo do banco (data_criacao) pro formato brasileiro
function formatDate(dataCriacao) {
  if (!dataCriacao) return "—";
  return new Date(dataCriacao).toLocaleDateString("pt-BR");
}

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
};
// ─── Icones ───────────────────────────────────────────────────────────────────
// Estilo padrao dos svgs, assim todos os icones ficam iguais e nao precisa repetir em cada um.
// currentColor faz o icone pegar a cor do texto onde ele estiver
const IconUsers  = () => <svg width="20" height="20" {...S}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>; // total de cadastros
const IconCheck  = () => <svg width="20" height="20" {...S}><polyline points="20 6 9 17 4 12"/></svg>; // aprovados
const IconClock  = () => <svg width="20" height="20" {...S}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; // pendentes
const IconX      = () => <svg width="20" height="20" {...S}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; // rejeitados
const IconArrow  = () => <svg width="16" height="16" {...S}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>; // seta dos links
const IconReport = () => <svg width="20" height="20" {...S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; // relatorios


// ─── Stat Card ────────────────────────────────────────────────────────────────
// card dos numeros do dashboard, reaproveitado pros 4 status
// accentColor = cor da faixa do topo e da sombra no hover / bgClass = fundo do quadradinho do icone
function StatCard({ label, value, icon, accentColor, bgClass }) {
  return (
    <div
      className="group relative overflow-hidden border-[1.5px] border-tt-azul-marinho bg-tt-branco p-5 transition duration-150 hover:-translate-y-[3px] hover:shadow-[6px_6px_0_var(--accent)]"
      style={{ '--accent': accentColor }}
    >
      {/* faixa colorida no topo, cor muda por card */}
      <span className="absolute left-0 top-0 h-1.5 w-full" style={{ background: accentColor }} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3 pt-1">
        {/* quadradinho do icone */}
        <span className={`grid size-10 shrink-0 place-items-center border-[1.5px] border-tt-azul-marinho ${bgClass}`}>{icon}</span>
        <p className="text-right text-[11px] font-extrabold uppercase leading-tight tracking-[0.1em] text-tt-grafite/70">{label}</p>
      </div>
      {/* numero grande no estilo dos titulos do site */}
      <p className="tt-display mt-6 text-[clamp(40px,5vw,60px)] text-tt-azul-marinho">{value}</p>
    </div>
  );
}

// ─── Quick Card ───────────────────────────────────────────────────────────────
// card de atalho pras outras paginas do admin
function QuickCard({ to, icon, titulo, desc, badge, numero }) {
  return (
    // o card inteiro e um link, group deixa os filhos reagirem ao hover
    <Link
      to={to}
      className="group relative flex min-h-[188px] flex-col overflow-hidden border-[1.5px] border-tt-azul-marinho bg-tt-branco p-5 no-underline transition duration-150 hover:-translate-y-[3px] hover:shadow-[6px_6px_0_var(--tt-roxo-vivo)]"
    >
      {/* mancha de luz no canto, acende no hover (mesmo truque dos cards da home) */}
      <span className="absolute -bottom-16 -right-10 size-[170px] rounded-full bg-tt-rosa-vivo opacity-20 blur-[28px] transition-opacity duration-150 group-hover:opacity-60" aria-hidden="true" />
      <div className="relative z-[1] flex items-start justify-between">
        {/* icone, vira roxo no hover */}
        <span className="grid size-11 place-items-center rounded-full bg-tt-azul-marinho text-tt-branco transition-colors duration-150 group-hover:bg-tt-roxo-vivo">
          {icon}
        </span>
        {/* numero no contorno, igual as etapas da home */}
        <span className="tt-display tt-outline text-[40px] leading-none">{numero}</span>
      </div>
      <div className="relative z-[1] mt-auto pt-6">
        <p className="flex items-center gap-2 font-display text-lg font-extrabold text-tt-azul-marinho">
          {titulo}
          {/* bolinha com a quantidade, so aparece se tiver algo pendente */}
          {badge > 0 && (
            <span className="rounded-full bg-tt-rosa-vivo px-2 py-0.5 text-[10px] font-bold text-tt-branco">{badge}</span>
          )}
        </p>
        <p className="mt-1 pr-8 text-[13px] leading-[1.5] text-tt-grafite/75">{desc}</p>
      </div>
      {/* seta que anda pro lado no hover */}
      <span className="absolute bottom-5 right-5 z-[1] text-tt-azul-marinho transition-transform duration-150 group-hover:translate-x-1">
        <IconArrow />
      </span>
    </Link>
  );
}

// titulo de secao: linha preta em cima, quadradinho + legenda e titulo grande (mesmo padrao da home)
function TituloSecao({ legenda, titulo, children }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-t border-tt-azul-marinho pt-5">
      <div>
        <span className="tt-eyebrow text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em]">{legenda}</span>
        <h2 className="tt-display mt-2 text-[clamp(24px,3.4vw,38px)] text-tt-azul-marinho">{titulo}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
// pagina do dashboard do admin, junta tudo que foi feito acima
export default function AdminDashboard() {
  // conta os cadastros por status pra mostrar nos stat cards
  const [cadastros, setCadastros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erroApi, setErroApi] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarCadastros();
        setCadastros(dados);
      } catch (err) {
        setErroApi("Não foi possível carregar os cadastros. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  // conta os cadastros por status pra mostrar nos stat cards
  const stats = {
    total: cadastros.length,
    pendentes: cadastros.filter((c) => c.status === "pendente").length,
    aprovados: cadastros.filter((c) => c.status === "aprovado").length,
    rejeitados: cadastros.filter((c) => c.status === "rejeitado").length,
  };

  // so os 5 mais recentes pro preview do dashboard; a lista completa fica em AprovarCadastros
  const recentes = cadastros.slice(0, 5);

  return (
    // fundo da pagina toda (overflow-x-clip evita barra de rolagem lateral por causa dos adesivos)
    <div className="min-h-screen overflow-x-clip bg-tt-cinza-claro">

      {/* Hero - faixa escura do topo com o titulo da pagina, manchas de luz e adesivos */}
      <section className="relative overflow-hidden border-b-[1.5px] border-tt-azul-marinho bg-tt-azul-marinho px-4 pb-20 pt-10 sm:px-6 md:px-10 md:pb-24 md:pt-14">
        <span className="tt-blob tt-blob--violeta -right-20 -top-32 size-[420px] opacity-60" aria-hidden="true" />
        <span className="tt-blob -bottom-40 left-[28%] size-[380px] opacity-40" aria-hidden="true" />

        {/* max-w centraliza o conteudo pra nao esticar demais em tela grande */}
        <div className="relative z-[1] mx-auto max-w-[1100px]">
          <span className="tt-eyebrow text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-tt-branco before:bg-tt-branco">Administração</span>
          <h1 className="tt-display mt-4 max-w-[12ch] text-[clamp(36px,6vw,72px)] text-tt-branco">
            Painel <span className="tt-outline-claro">Administrativo</span>
          </h1>
          <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.6] text-tt-branco/75">Gerencie a plataforma TrocaTicket.</p>
        </div>

        {/* adesivos do hero: no celular fica so a TV pequena, no desktop vira um monte de adesivos colados */}
        <Sticker nome="tv" tamanho={86} rotate={7} className="right-3 top-5 md:hidden" />
        <Sticker nome="tv" tamanho={210} rotate={-6} delay={0.4} className="right-[7%] top-8 hidden md:block" />
        <Sticker nome="estrela" tamanho={92} rotate={14} delay={1.2} className="right-[3%] top-4 hidden md:block" />
        <Sticker nome="cd" tamanho={108} rotate={-12} delay={2} className="right-[22%] top-[196px] hidden lg:block" />
      </section>

      {/* conteudo principal da pagina */}
      <div className="mx-auto max-w-[1100px] px-4 pb-20 sm:px-6 md:px-10">

        {/* Stat cards - o -mt-12 puxa eles pra cima, ficando em cima da faixa escura */}
        {/* 2 colunas no celular e 4 em tela grande */}
        <div className="relative z-[2] -mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* um card pra cada status, cada um com sua cor e icone */}
          <StatCard label="Total de cadastros" value={stats.total}
            icon={<span className="text-tt-azul-marinho"><IconUsers /></span>}
            accentColor="var(--tt-azul-marinho)" bgClass="bg-tt-cinza-claro" />
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

        {/* Acesso rapido - atalhos pras outras paginas do admin */}
        <section className="relative mt-16">
          <TituloSecao legenda="Atalhos" titulo="Acesso rápido" />
          {/* fita cassete colada no canto do titulo, so aparece em tela maior */}
          <Sticker nome="fita" tamanho={138} rotate={7} delay={0.8} className="-top-6 right-0 hidden md:block" />
          <div className="grid gap-4 md:grid-cols-3">
            {/* o badge mostra quantos cadastros tao esperando aprovacao */}
            <QuickCard to="/AprovarCadastros" icon={<IconCheck />} numero="01"
              titulo="Aprovar Cadastros"
              desc={`${stats.pendentes} solicitações aguardando revisão`}
              badge={stats.pendentes}
            />
            {/* to="#" porque essas paginas ainda nao foram feitas */}
            <QuickCard to="#" icon={<IconUsers />} numero="02"
              titulo="Lista de Usuários"
              desc="Compradores, vendedores e suas permissões" />
            <QuickCard to="#" icon={<IconReport />} numero="03"
              titulo="Relatórios"
              desc="Atividade da plataforma e métricas de uso"
            />
          </div>
        </section>

        {/* Cadastros recentes - ultimos pedidos que chegaram */}
        <section className="relative mt-16">
          {/* titulo de um lado e link "ver todos" do outro */}
          <TituloSecao legenda="Últimos pedidos" titulo="Cadastros recentes">
            {/* leva pra pagina com a lista completa */}
            <Link to="/AprovarCadastros"
              className="shrink-0 border-b-2 border-tt-azul-marinho pb-0.5 text-[13px] font-bold text-tt-azul-marinho no-underline transition-colors hover:border-tt-roxo-vivo hover:text-tt-roxo-vivo">
              Ver todos <span aria-hidden="true">→</span>
            </Link>
          </TituloSecao>

          {/* caixa branca em volta da tabela */}
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-tt-branco shadow-[var(--shadow-sm)]">
            {loading && (
              <p className="px-5 py-10 text-center text-sm text-[var(--color-text-muted)]">
                Carregando cadastros...
              </p>
            )}
            {erroApi && (
              <p
                role="alert"
                className="px-5 py-10 text-center text-sm text-[var(--color-danger)]"
              >
                {erroApi}
              </p>
            )}
            {!loading && !erroApi && recentes.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-[var(--color-text-muted)]">
                Nenhum cadastro recebido até o momento.
              </p>
            )}
            {/* overflow-x-auto deixa rolar pro lado no celular quando a tabela nao cabe */}
            {!loading && !erroApi && recentes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                      {/* cabecalho da tabela, fiz com map pra nao repetir o th 5 vezes */}
                      {[
                        "Nome / Empresa",
                        "Tipo",
                        "E-mail",
                        "Data",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* uma linha pra cada cadastro recente vindo do banco */}
                    {recentes.map((c) => (
                      // os pendentes ficam com fundo roxinho pra chamar atencao
                      // last:border-b-0 tira a borda da ultima linha
                      <tr
                        key={c.id}
                        className={`border-b border-[var(--color-border)] transition-colors last:border-b-0 hover:bg-tt-cinza-claro ${c.status === "pendente" ? "bg-tt-lilas-claro" : ""}`}
                      >
                        {/* nome em cima e empresa embaixo, na mesma celula */}
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-[var(--color-primary)]">
                            {c.nome}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {c.empresa}
                          </p>
                        </td>
                        {/* tipo e status aparecem como etiqueta colorida (Badge) */}
                        <td className="px-5 py-3.5">
                          <Badge label={c.tipo} variant={c.tipo} />
                        </td>
                        <td className="px-5 py-3.5 text-[var(--color-text-muted)]">
                          {c.email}
                        </td>
                        <td className="px-5 py-3.5 text-[var(--color-text-muted)]">
                          {formatDate(c.data_criacao)}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge label={c.status} variant={c.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* vinil e globo colados na quina da tabela, so em tela maior pra nao cobrir os dados */}
          <Sticker nome="vinil" tamanho={118} rotate={-10} delay={1.5} className="-bottom-[78px] -right-6 hidden xl:block" />
          <Sticker nome="globo" tamanho={92} rotate={9} delay={0.2} className="-bottom-[66px] right-[118px] hidden xl:block" />
        </section>
        {/* fim dos cadastros recentes */}
      </div>
      {/* fim do conteudo principal */}

      {/* rodape do site */}
      <Footer />
    </div>
  );
}
// fim do AdminDashboard

import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Footer from '../../components/Footer';
import Sticker from '../../components/Sticker';
import { buscarCadastros } from '../../services/api';
import { atualizarStatusCadastro } from '../../services/api';

// formata o timestamp vindo do banco (data_criacao) pro formato brasileiro
function formatDate(dataCriacao) {
  if (!dataCriacao) return '—';
  return new Date(dataCriacao).toLocaleDateString('pt-BR');
}

// pega as iniciais do nome pro quadradinho do avatar (ex: "Maria Souza" -> "MS")
function iniciais(nome = '') {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?';
}

// ─── Icones ───────────────────────────────────────────────────────────────────
// estilo padrao dos svgs (mesmo do dashboard)
const S = { fill:'none', stroke:'currentColor', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round', viewBox:'0 0 24 24' };
const IconSearch = () => <svg width="16" height="16" {...S}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconUsers  = () => <svg width="20" height="20" {...S}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconClock  = () => <svg width="20" height="20" {...S}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconCheck  = () => <svg width="20" height="20" {...S}><polyline points="20 6 9 17 4 12"/></svg>;
const IconX      = () => <svg width="20" height="20" {...S}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconBack   = () => <svg width="14" height="14" {...S}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;

// ─── Filtros ──────────────────────────────────────────────────────────────────
// cada filtro e um card clicavel (mesmo visual dos stat cards do dashboard)
// key = status que filtra / accent = cor da faixa do topo e da sombra / bgClass = fundo do icone
const FILTROS = [
  { key: 'todos',     label: 'Todos',      icon: <IconUsers />, accent: 'var(--tt-azul-marinho)',  bgClass: 'bg-tt-cinza-claro',                  iconColor: 'text-tt-azul-marinho' },
  { key: 'pendente',  label: 'Pendentes',  icon: <IconClock />, accent: 'var(--color-pending)',    bgClass: 'bg-[var(--color-pending-light)]',    iconColor: 'text-[var(--color-pending)]' },
  { key: 'aprovado',  label: 'Aprovados',  icon: <IconCheck />, accent: 'var(--color-success)',    bgClass: 'bg-[var(--color-success-light)]',    iconColor: 'text-[var(--color-success)]' },
  { key: 'rejeitado', label: 'Rejeitados', icon: <IconX />,     accent: 'var(--color-danger)',     bgClass: 'bg-[var(--color-danger-light)]',     iconColor: 'text-[var(--color-danger)]' },
];

// ─── Filtro Card ──────────────────────────────────────────────────────────────
// card que mostra a quantidade e tambem funciona como botao de filtro
function FiltroCard({ filtro, valor, ativo, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`group relative cursor-pointer overflow-hidden border-[1.5px] border-tt-azul-marinho p-4 text-left transition duration-150 hover:-translate-y-[3px] hover:shadow-[6px_6px_0_var(--accent)] sm:p-5 ${
        ativo ? '-translate-y-[3px] bg-tt-azul-marinho shadow-[6px_6px_0_var(--accent)]' : 'bg-tt-branco'
      }`}
      style={{ '--accent': filtro.accent }}
    >
      {/* faixa colorida no topo, cor muda por card */}
      <span className="absolute left-0 top-0 h-1.5 w-full" style={{ background: filtro.accent }} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3 pt-1">
        <span className={`grid size-9 shrink-0 place-items-center border-[1.5px] sm:size-10 ${ativo ? 'border-tt-branco' : 'border-tt-azul-marinho'} ${filtro.bgClass} ${filtro.iconColor}`}>
          {filtro.icon}
        </span>
        <p className={`text-right text-[11px] font-extrabold uppercase leading-tight tracking-[0.1em] ${ativo ? 'text-tt-branco/80' : 'text-tt-grafite/70'}`}>
          {filtro.label}
        </p>
      </div>
      {/* numero grande no estilo dos titulos do site */}
      <p className={`tt-display mt-4 text-[clamp(32px,4.5vw,52px)] ${ativo ? 'text-tt-branco' : 'text-tt-azul-marinho'}`}>{valor}</p>
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
// pagina onde o admin aprova ou rejeita os cadastros
export default function AprovarCadastros() {
  const [cadastros, setCadastros] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erroApi, setErroApi]     = useState('');
  const [filtro, setFiltro]       = useState('todos');
  const [busca, setBusca]         = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarCadastros();
        setCadastros(dados);
      } catch (err) {
        setErroApi('Não foi possível carregar os cadastros. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  // quantidade de cada status pra mostrar nos cards de filtro
  // useMemo so recalcula quando a lista muda
  const contadores = useMemo(() => ({
    todos:     cadastros.length,
    pendente:  cadastros.filter(c => c.status === 'pendente').length,
    aprovado:  cadastros.filter(c => c.status === 'aprovado').length,
    rejeitado: cadastros.filter(c => c.status === 'rejeitado').length,
  }), [cadastros]);

  // lista que aparece na tela, ja filtrada
  const lista = useMemo(() =>
    cadastros
      // primeiro filtra pelo status do card selecionado
      .filter(c => filtro === 'todos' || c.status === filtro)
      // depois pela busca, procurando no nome, empresa ou email (sem diferenciar maiuscula)
      .filter(c => !busca || [c.nome, c.empresa, c.email].some(v => (v || '').toLowerCase().includes(busca.toLowerCase())))
  , [cadastros, filtro, busca]);

  // muda o status do cadastro quando clica em aprovar ou rejeitar
  async function handleAcao(id, acao) {
    const cadastro = cadastros.find(c => c.id === id);
    const status = acao === 'aprovar' ? 'aprovado' : 'rejeitado';

    try {
      await atualizarStatusCadastro(id, cadastro.tipo, status);
      // so atualiza a tela depois que o banco confirmou
      setCadastros(prev =>
        prev.map(c => c.id === id ? { ...c, status } : c)
      );
    } catch (err) {
      alert('Não foi possível atualizar o cadastro. Tente novamente.');
    }
  }

  return (
    // fundo da pagina toda (overflow-x-clip evita barra de rolagem lateral por causa dos adesivos)
    <div className="min-h-screen overflow-x-clip bg-tt-cinza-claro">

      {/* Hero - faixa escura do topo com o titulo, manchas de luz e adesivos (igual ao dashboard) */}
      <section className="relative overflow-hidden border-b-[1.5px] border-tt-azul-marinho bg-tt-azul-marinho px-4 pb-20 pt-10 sm:px-6 md:px-10 md:pb-24 md:pt-14">
        <span className="tt-blob tt-blob--violeta -right-20 -top-32 size-[420px] opacity-60" aria-hidden="true" />
        <span className="tt-blob -bottom-40 left-[28%] size-[380px] opacity-40" aria-hidden="true" />

        <div className="relative z-[1] mx-auto max-w-[1100px]">
          {/* link pra voltar pro painel */}
          <Link to="/AdminDashboard"
            className="mb-6 inline-flex items-center gap-2 border-b border-tt-branco/40 pb-0.5 text-[12px] font-bold uppercase tracking-[0.1em] text-tt-branco/80 no-underline transition-colors hover:border-tt-branco hover:text-tt-branco">
            <IconBack /> Painel
          </Link>
          <div>
            <span className="tt-eyebrow text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-tt-branco before:bg-tt-branco">Administração</span>
          </div>
          <h1 className="tt-display mt-4 max-w-[12ch] text-[clamp(36px,6vw,72px)] text-tt-branco">
            Aprovar <span className="tt-outline-claro">Cadastros</span>
          </h1>
          <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.6] text-tt-branco/75">Gerencie solicitações de organizadores e fornecedores.</p>
        </div>

        {/* adesivos do hero: no celular so a estrela pequena, no desktop vira uma colagem */}
        <Sticker nome="estrela" tamanho={80} rotate={12} className="right-3 top-5 md:hidden" />
        <Sticker nome="cd" tamanho={190} rotate={-8} delay={0.4} className="right-[8%] top-8 hidden md:block" />
        <Sticker nome="estrela" tamanho={96} rotate={14} delay={1.2} className="right-[3%] top-4 hidden md:block" />
        <Sticker nome="fita" tamanho={130} rotate={-6} delay={2} className="right-[22%] top-[190px] hidden lg:block" />
      </section>

      {/* conteudo principal */}
      <div className="mx-auto max-w-[1100px] px-4 pb-20 sm:px-6 md:px-10">

        {/* Cards de filtro - o -mt-12 puxa eles pra cima, ficando em cima da faixa escura */}
        <div className="relative z-[2] -mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {FILTROS.map(f => (
            <FiltroCard key={f.key} filtro={f} valor={contadores[f.key]}
              ativo={filtro === f.key} onClick={() => setFiltro(f.key)} />
          ))}
        </div>

        {/* Toolbar - busca e contagem */}
        <section className="mt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-t border-tt-azul-marinho pt-5">
            <div>
              <span className="tt-eyebrow text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em]">Solicitações</span>
              <h2 className="tt-display mt-2 text-[clamp(24px,3.4vw,38px)] text-tt-azul-marinho">Lista de cadastros</h2>
            </div>
            {/* quantos cadastros tao aparecendo do total */}
            <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.1em] text-tt-grafite/70">
              {lista.length} de {cadastros.length} cadastros
            </span>
          </div>

          {/* Busca - campo quadrado com a lupa dentro, mesmo estilo dos inputs de login/cadastro */}
          <div className="relative mb-5 max-w-[440px]">
            {/* pointer-events-none pra lupa nao atrapalhar o clique */}
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tt-azul-marinho">
              <IconSearch />
            </span>
            <input
              className="w-full rounded-none border-[1.5px] border-tt-azul-marinho bg-tt-branco py-2.5 pl-10 pr-4 text-sm text-tt-azul-marinho outline-none transition-colors placeholder:text-tt-grafite/45 focus:border-tt-roxo-vivo focus:shadow-[4px_4px_0_var(--tt-roxo-vivo)]"
              placeholder="Buscar por nome, empresa ou e-mail..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>

          {/* Estados de carregando, erro e vazio */}
          {loading && (
            <p className="border-[1.5px] border-tt-azul-marinho bg-tt-branco px-5 py-10 text-center text-sm text-tt-grafite/70">Carregando cadastros...</p>
          )}
          {erroApi && (
            <p role="alert" className="border-[1.5px] border-tt-rosa-principal bg-tt-rosa-claro px-5 py-10 text-center text-sm font-medium text-tt-rosa-principal">{erroApi}</p>
          )}
          {!loading && !erroApi && lista.length === 0 && (
            <div className="relative flex flex-col items-center justify-center gap-2 overflow-hidden border-[1.5px] border-dashed border-tt-azul-marinho bg-tt-branco px-6 py-16 text-center">
              <span className="tt-blob tt-blob--rosa -bottom-16 -right-10 size-[170px] opacity-40" aria-hidden="true" />
              <p className="tt-display relative z-[1] text-2xl text-tt-azul-marinho">Nenhum cadastro encontrado</p>
              {/* se tiver busca sugere mudar o texto, senao avisa que ta tudo processado */}
              <p className="relative z-[1] text-sm text-tt-grafite/70">
                {busca ? 'Tente ajustar o termo de busca.' : 'Todas as solicitações foram processadas.'}
              </p>
            </div>
          )}

          {/* Tabela - so aparece se tiver algum cadastro na lista */}
          {lista.length > 0 && (
            // caixa branca com borda preta e sombra solida roxa (mesmo card do login/cadastro)
            <div className="overflow-hidden border-[1.5px] border-tt-azul-marinho bg-tt-branco shadow-[8px_8px_0_var(--tt-roxo-vivo)]">
              {/* deixa rolar pro lado no celular */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  {/* cabecalho preto com letras brancas */}
                  <thead>
                    <tr className="bg-tt-azul-marinho">
                      {['Nome / Empresa','Tipo','E-mail','Data','Status','Ações'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-[0.1em] text-tt-branco">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* uma linha pra cada cadastro da lista filtrada */}
                    {lista.map(c => (
                      // pendentes ficam com fundo lilas e uma barra rosa na esquerda pra chamar atencao
                      <tr key={c.id}
                        className={`border-b border-tt-azul-marinho/15 transition-colors last:border-b-0 hover:bg-tt-cinza-claro ${c.status === 'pendente' ? 'bg-tt-lilas-claro shadow-[inset_4px_0_0_var(--tt-rosa-vivo)]' : ''}`}>
                        {/* avatar com iniciais + nome e empresa */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="grid size-10 shrink-0 place-items-center border-[1.5px] border-tt-azul-marinho bg-tt-branco text-[13px] font-black text-tt-azul-marinho">
                              {iniciais(c.nome)}
                            </span>
                            <div className="min-w-0">
                              <p className="font-display font-extrabold text-tt-azul-marinho">{c.nome}</p>
                              <p className="text-xs text-tt-grafite/70">{c.empresa}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><Badge label={c.tipo} variant={c.tipo} /></td>
                        <td className="px-5 py-4 text-tt-grafite/70">{c.email}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-tt-grafite/70">{formatDate(c.data_criacao)}</td>
                        <td className="px-5 py-4"><Badge label={c.status} variant={c.status} /></td>
                        {/* botoes de aprovar e rejeitar so aparecem nos pendentes */}
                        <td className="px-5 py-4">
                          {c.status === 'pendente' ? (
                            <div className="flex items-center gap-2">
                              {/* rejeitar: contorno preto, vira rosa no hover */}
                              <button type="button" onClick={() => handleAcao(c.id, 'rejeitar')}
                                className="cursor-pointer rounded-none border-[1.5px] border-tt-azul-marinho bg-tt-branco px-3.5 py-1.5 text-[13px] font-bold text-tt-azul-marinho transition-colors hover:border-tt-rosa-principal hover:bg-tt-rosa-principal hover:text-tt-branco">
                                Rejeitar
                              </button>
                              {/* aprovar: botao principal do site (magenta com borda preta) */}
                              <button type="button" onClick={() => handleAcao(c.id, 'aprovar')}
                                className="cursor-pointer rounded-none border-[1.5px] border-tt-azul-marinho bg-tt-laranja-principal px-3.5 py-1.5 text-[13px] font-bold text-tt-azul-marinho transition duration-150 hover:-translate-y-0.5 hover:bg-tt-laranja-vivo hover:shadow-[3px_3px_0_var(--tt-azul-marinho)]">
                                Aprovar
                              </button>
                            </div>
                          ) : (
                            // quem ja foi analisado mostra so um tracinho
                            <span className="text-tt-grafite/45">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* rodape da tabela com a contagem */}
              <div className="border-t-[1.5px] border-tt-azul-marinho bg-tt-cinza-claro px-5 py-3">
                <p className="text-xs text-tt-grafite/70">
                  Mostrando <strong className="text-tt-azul-marinho">{lista.length}</strong> de <strong className="text-tt-azul-marinho">{cadastros.length}</strong> cadastros
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* rodape do site */}
      <Footer />
    </div>
  );
}

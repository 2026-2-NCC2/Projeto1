import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Footer from '../../components/Footer';
import Aviso from '../../components/ui/Aviso';
import CabecalhoPagina from '../../components/ui/CabecalhoPagina';
import Folha from '../../components/ui/Folha';
import Spinner from '../../components/ui/Spinner';
import Semicirculos from '../../components/ui/Semicirculos';
import { IconCheck, IconRelatorio, IconRelogio, IconSeta, IconSetaDiagonal, IconUsuarios, IconX } from '../../components/ui/Icones';
import { btn, containerCls, linkEscuroCls } from '../../components/ui/estilos';
import { buscarCadastros } from '../../services/api';

// formata o timestamp vindo do banco (data_criacao) pro formato brasileiro
function formatDate(dataCriacao) {
  if (!dataCriacao) return '—';
  return new Date(dataCriacao).toLocaleDateString('pt-BR');
}

// "1 solicitação" / "2 solicitações"
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

// atalhos pras outras paginas do admin; pronto = false quer dizer que a pagina ainda nao existe
function atalhos(pendentes) {
  return [
    { to: '/AprovarCadastros', Icone: IconCheck, titulo: 'Aprovar Cadastros', desc: `${plural(pendentes, 'solicitação aguardando', 'solicitações aguardando')} revisão`, badge: pendentes, pronto: true },
    { to: '/admin/usuarios', Icone: IconUsuarios, titulo: 'Lista de Usuários', desc: 'Compradores, vendedores e suas permissões', pronto: true },
    { to: '/admin/relatorios', Icone: IconRelatorio, titulo: 'Relatórios', desc: 'Atividade da plataforma e métricas de uso', pronto: true },
  ];
}

// pagina do dashboard do admin
export default function AdminDashboard() {
  const [cadastros, setCadastros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erroApi, setErroApi] = useState('');

  // cada vez que esse numero muda a busca roda de novo (o botao "Tentar de novo" soma 1)
  const [tentativa, setTentativa] = useState(0);

  // busca os cadastros; os setState so acontecem depois da resposta, e uma resposta antiga e ignorada
  useEffect(() => {
    let ativo = true;
    buscarCadastros()
      .then((dados) => { if (ativo) setCadastros(dados); })
      .catch(() => { if (ativo) setErroApi('Não foi possível carregar os cadastros.'); })
      .finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, [tentativa]);

  // botao "Tentar de novo": volta pro estado de carregando e busca outra vez
  function tentarDeNovo() {
    setLoading(true);
    setErroApi('');
    setTentativa((n) => n + 1);
  }

  // sem dados confiaveis (carregando ou deu erro): os cards mostram "—" em vez de um 0 que nao e verdade
  const semDados = loading || Boolean(erroApi);

  // conta os cadastros por status
  const stats = {
    total: cadastros.length,
    pendentes: cadastros.filter((c) => c.status === 'pendente').length,
    aprovados: cadastros.filter((c) => c.status === 'aprovado').length,
    rejeitados: cadastros.filter((c) => c.status === 'rejeitado').length,
  };

  // so os 5 mais recentes pro preview (o servidor ja manda do mais novo pro mais antigo); a lista completa fica em AprovarCadastros
  const recentes = cadastros.slice(0, 5);

  // um card por status; chave = filtro que a pagina de aprovacoes abre ja selecionado (?status=)
  const contagens = [
    { chave: 'todos', rotulo: 'Total de cadastros', valor: stats.total, cor: 'bg-gel-indigo', Icone: IconUsuarios, detalhe: 'Organizadores e fornecedores' },
    { chave: 'pendente', rotulo: 'Pendentes', valor: stats.pendentes, cor: 'bg-gel-ambar', Icone: IconRelogio, detalhe: 'Aguardando a sua revisão' },
    { chave: 'aprovado', rotulo: 'Aprovados', valor: stats.aprovados, cor: 'bg-gel-verde', Icone: IconCheck, detalhe: 'Com acesso liberado' },
    { chave: 'rejeitado', rotulo: 'Rejeitados', valor: stats.rejeitados, cor: 'bg-gel-rubi', Icone: IconX, detalhe: 'Solicitações recusadas' },
  ];
  // quanto cada status representa do total (o card "total" nao mostra porcentagem)
  const porcento = (valor) => (stats.total > 0 ? Math.round((valor / stats.total) * 100) : 0);

  // subtitulo do topo: diz o que precisa de atencao agora
  const subtitulo = semDados
    ? 'Gerencie a plataforma TrocaTicket.'
    : stats.pendentes > 0
      ? `${plural(stats.pendentes, 'cadastro aguardando', 'cadastros aguardando')} a sua revisão.`
      : 'Nenhum cadastro aguardando revisão.';

  return (
    <div className="relative flex min-h-[calc(100svh-68px)] flex-col overflow-x-clip fundo-luz">
      <Semicirculos />
      <CabecalhoPagina titulo="Painel Administrativo" sub={subtitulo} />

      <div className={`${containerCls} pb-20 pt-8`}>
        {erroApi && (
          <Aviso tipo="erro" escuro className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{erroApi} Verifique sua conexão e tente de novo.</span>
              <button type="button" onClick={tentarDeNovo} className={btn('escuro', 'sm')}>Tentar de novo</button>
            </div>
          </Aviso>
        )}

        {/* contagem de cadastros por status: cada card e um atalho pra lista ja filtrada */}
        <ul className="grid list-none grid-cols-2 gap-5 p-0 lg:grid-cols-4">
          {contagens.map(({ chave, rotulo, valor, cor, Icone, detalhe }) => (
            <li key={chave}>
              <Link
                to={`/AprovarCadastros?status=${chave}`}
                aria-label={semDados ? `${rotulo}. Ver lista` : `${rotulo}: ${valor}. Ver lista${chave === 'todos' ? ' completa' : ' filtrada'}`}
                className="group relative flex h-full flex-col border-[1.5px] border-black bg-folha text-tinta no-underline shadow-brutal transition duration-150 ease-saida hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_var(--color-gel-fogo)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 focus-visible:shadow-[8px_8px_0_var(--color-gel-fogo)]"
              >
                {/* faixa com a cor do status */}
                <span className={`h-2 border-b-[1.5px] border-black ${cor}`} aria-hidden="true" />
                <div className="flex flex-1 flex-col p-5" aria-hidden="true">
                  <div className="flex items-start justify-between">
                    <span className={`grid size-10 place-items-center border-[1.5px] border-black ${cor}`}><Icone tamanho={18} /></span>
                    <span className="text-tinta/40 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-tinta"><IconSetaDiagonal tamanho={18} /></span>
                  </div>
                  <p className="tabular mt-5 text-5xl font-black leading-none tracking-[-0.025em]">{semDados ? '—' : valor}</p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em]">{rotulo}</p>
                  <p className="mt-1 text-[13px] leading-snug text-tinta/60">{detalhe}</p>

                  {/* rodape do card: porcentagem do total com uma barrinha, ou o atalho pra lista completa */}
                  <div className="mt-auto pt-5">
                    {chave === 'todos' ? (
                      <p className="border-t border-tinta/15 pt-3 text-xs font-semibold text-tinta/70">Ver lista completa</p>
                    ) : (
                      <div className="border-t border-tinta/15 pt-3">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-tinta/60">do total</span>
                          <span className="tabular font-bold">{semDados ? '—' : `${porcento(valor)}%`}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 border border-black/70 bg-papel">
                          <span className={`block h-full ${cor}`} style={{ width: `${semDados ? 0 : porcento(valor)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          {/* Acesso rapido: atalhos pras outras paginas do admin */}
          <section aria-labelledby="titulo-atalhos" className="min-w-0">
            <h2 id="titulo-atalhos" className="mb-5 text-2xl font-black tracking-[-0.015em]">Acesso rápido</h2>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {atalhos(stats.pendentes).map(({ to, Icone, titulo, desc, badge, pronto }) => {
                const conteudo = (
                  <>
                    <span className={`grid size-10 shrink-0 place-items-center rounded-none ${pronto ? 'bg-gel-indigo text-tinta' : 'bg-palco-3 text-white/60'}`}><Icone tamanho={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 font-bold">
                        {titulo}
                        {pronto && !semDados && badge > 0 && (
                          <span className="tabular rounded-none bg-gel-ambar px-2 py-0.5 text-[11px] font-bold text-tinta">
                            {badge}<span className="sr-only"> pendentes</span>
                          </span>
                        )}
                        {!pronto && (
                          <span className="border border-white/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white/70">Em breve</span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-white/55">{desc}</span>
                    </span>
                  </>
                );
                return (
                  <li key={titulo}>
                    {pronto ? (
                      <Link to={to} className="group flex items-center gap-4 py-4 text-white no-underline transition-colors">
                        {conteudo}
                        <span className="text-white/40 transition-transform duration-150 group-hover:translate-x-1 group-hover:text-white group-focus-visible:translate-x-1"><IconSeta /></span>
                      </Link>
                    ) : (
                      // pagina ainda nao existe: nao e link, so mostra que vem ai
                      <div className="flex cursor-not-allowed items-center gap-4 py-4 text-white/55" aria-disabled="true">
                        {conteudo}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Cadastros recentes: ultimos pedidos que chegaram */}
          <section aria-labelledby="titulo-recentes" className="min-w-0">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 id="titulo-recentes" className="text-2xl font-black tracking-[-0.015em]">Cadastros recentes</h2>
              <Link to="/AprovarCadastros" className={`${linkEscuroCls} inline-flex items-center gap-1.5 text-sm`}>
                Ver todos <IconSeta />
              </Link>
            </div>

            <Folha rebite={false}>
              {loading && <Spinner text="Carregando cadastros…" />}
              {!loading && erroApi && (
                <p className="px-6 py-12 text-center text-sm text-tinta/65">Os cadastros recentes aparecem aqui quando a conexão voltar.</p>
              )}
              {!loading && !erroApi && recentes.length === 0 && (
                <p className="px-6 py-12 text-center text-sm text-tinta/65">Nenhum cadastro recebido até o momento.</p>
              )}

              {!loading && !erroApi && recentes.length > 0 && (
                <>
                  {/* celular: lista de cards (a tabela nao cabe sem rolar pro lado) */}
                  <ul className="divide-y divide-tinta/15 sm:hidden">
                    {recentes.map((c) => (
                      <li key={c.id} className={`px-5 py-4 ${c.status === 'pendente' ? 'bg-gel-ambar/20 shadow-[inset_5px_0_0_var(--color-gel-fogo)]' : ''}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-extrabold">{c.nome}</p>
                            <p className="text-xs text-tinta/60">{c.empresa}</p>
                          </div>
                          <Badge label={c.status} variant={c.status} />
                        </div>
                        <p className="mt-2 break-words text-[13px] text-tinta/70">{c.email}</p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-2 text-xs text-tinta/60">
                            <Badge label={c.tipo} variant={c.tipo} />
                            {formatDate(c.data_criacao)}
                          </span>
                          {c.status === 'pendente' && (
                            <Link to="/AprovarCadastros?status=pendente" className={btn('primario', 'sm')}>Revisar</Link>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* a partir de 640px: tabela com cabecalho preto */}
                  <div className="hidden overflow-x-auto sm:block">
                    <table className="w-full min-w-[600px] border-collapse text-sm">
                      <caption className="sr-only">Os cinco cadastros mais recentes</caption>
                      <thead>
                        <tr className="bg-tinta">
                          {['Cadastro', 'Tipo', 'Data', 'Status', 'Ação'].map((h) => (
                            <th key={h} scope="col" className="px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-[0.1em] text-white">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentes.map((c) => (
                          <tr key={c.id} className={`border-b border-tinta/15 transition-colors last:border-b-0 hover:bg-papel ${c.status === 'pendente' ? 'bg-gel-ambar/20 shadow-[inset_5px_0_0_var(--color-gel-fogo)]' : ''}`}>
                            {/* nome, empresa e e-mail juntos na mesma celula (deixa espaco pra coluna de acao) */}
                            <td className="min-w-0 px-5 py-3.5">
                              <p className="font-extrabold">{c.nome}</p>
                              <p className="text-xs text-tinta/60">{c.empresa}</p>
                              <p className="mt-0.5 break-all text-xs text-tinta/70">{c.email}</p>
                            </td>
                            <td className="px-5 py-3.5"><Badge label={c.tipo} variant={c.tipo} /></td>
                            <td className="whitespace-nowrap px-5 py-3.5 text-tinta/70">{formatDate(c.data_criacao)}</td>
                            <td className="px-5 py-3.5"><Badge label={c.status} variant={c.status} /></td>
                            <td className="px-5 py-3.5">
                              {c.status === 'pendente' ? (
                                <Link to="/AprovarCadastros?status=pendente" className={btn('primario', 'sm')}>Revisar</Link>
                              ) : (
                                <span className="text-tinta/45" aria-label="Sem ação">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </Folha>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
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
    { Icone: IconUsuarios, titulo: 'Lista de Usuários', desc: 'Compradores, vendedores e suas permissões', pronto: false },
    { Icone: IconRelatorio, titulo: 'Relatórios', desc: 'Atividade da plataforma e métricas de uso', pronto: false },
  ];
}

// pagina do dashboard do admin
export default function AdminDashboard() {
  const [cadastros, setCadastros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erroApi, setErroApi] = useState('');

  // busca os cadastros (os setState so acontecem depois da resposta)
  const carregar = useCallback(async () => {
    try {
      setCadastros(await buscarCadastros());
    } catch {
      setErroApi('Não foi possível carregar os cadastros.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // botao "Tentar de novo": volta pro estado de carregando e busca outra vez
  function tentarDeNovo() {
    setLoading(true);
    setErroApi('');
    carregar();
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
            <QuickCard to="/admin/usuarios" icon={<IconUsers />} numero="02"
              titulo="Lista de Usuários"
              desc="Compradores, vendedores e suas permissões" />
            <QuickCard to="/admin/relatorios" icon={<IconReport />} numero="03"
              titulo="Relatórios"
              desc="Atividade da plataforma e métricas de uso"
            />
          </div>
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

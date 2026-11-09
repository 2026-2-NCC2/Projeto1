import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Footer from '../../components/Footer';
import Aviso from '../../components/ui/Aviso';
import CabecalhoPagina from '../../components/ui/CabecalhoPagina';
import Folha from '../../components/ui/Folha';
import Spinner from '../../components/ui/Spinner';
import Semicirculos from '../../components/ui/Semicirculos';
import { IconBusca, IconVoltar } from '../../components/ui/Icones';
import { btn, campoEscuroCls, containerCls } from '../../components/ui/estilos';
import { buscarCadastros, atualizarStatusCadastro } from '../../services/api';

// formata o timestamp vindo do banco (data_criacao) pro formato brasileiro
function formatDate(dataCriacao) {
  if (!dataCriacao) return '—';
  return new Date(dataCriacao).toLocaleDateString('pt-BR');
}

// pega as iniciais do nome pro quadradinho do avatar (ex: "Maria Souza" -> "MS")
function iniciais(nome = '') {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?';
}

// ─── Filtros ──────────────────────────────────────────────────────────────────
// key = status que filtra / label = texto / cor = amostra da gelatina do status
const FILTROS = [
  { key: 'todos',     label: 'Todos',      cor: 'bg-papel' },
  { key: 'pendente',  label: 'Pendentes',  cor: 'bg-gel-ambar' },
  { key: 'aprovado',  label: 'Aprovados',  cor: 'bg-gel-verde' },
  { key: 'rejeitado', label: 'Rejeitados', cor: 'bg-gel-rubi' },
];

// ─── Componente principal ─────────────────────────────────────────────────────
// pagina onde o admin aprova ou rejeita os cadastros
export default function AprovarCadastros() {
  const [cadastros, setCadastros] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erroApi, setErroApi]     = useState('');
  // o painel do admin pode abrir esta pagina ja filtrada (ex: /AprovarCadastros?status=pendente)
  const [searchParams] = useSearchParams();
  const statusDaUrl = searchParams.get('status');
  const [filtro, setFiltro]       = useState(FILTROS.some(f => f.key === statusDaUrl) ? statusDaUrl : 'todos');
  const [busca, setBusca]         = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarCadastros();
        setCadastros(dados);
      } catch {
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
    } catch {
      alert('Não foi possível atualizar o cadastro. Tente novamente.');
    }
  }

  return (
    <div className="relative flex min-h-[calc(100svh-68px)] flex-col overflow-x-clip fundo-luz">
      <Semicirculos />
      <CabecalhoPagina
        titulo="Aprovar Cadastros"
        sub="Gerencie solicitações de organizadores e fornecedores."
        voltar={
          <Link to="/AdminDashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/70 no-underline transition-colors hover:text-white">
            <IconVoltar /> Painel
          </Link>
        }
      />

      <div className={`${containerCls} pb-20 pt-8`}>
        {/* filtros por status (com a contagem) e busca na mesma linha */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Filtrar cadastros por status" className="flex flex-wrap border-[1.5px] border-white/40 bg-palco-2">
            {FILTROS.map((f) => {
              const ativo = filtro === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFiltro(f.key)}
                  aria-pressed={ativo}
                  className={`flex items-center gap-2 rounded-none border-r-[1.5px] border-white/20 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.06em] transition-colors last:border-r-0 ${ativo ? 'bg-folha text-tinta' : 'text-white/65 hover:bg-white/8 hover:text-white'}`}
                >
                  {f.key !== 'todos' && <span className={`size-2 rounded-none ${f.cor}`} aria-hidden="true" />}
                  {f.label}
                  <span className={`tabular font-mono text-[11px] ${ativo ? 'text-tinta/55' : 'text-white/40'}`}>{contadores[f.key]}</span>
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[220px] flex-1 sm:max-w-[380px]">
            {/* pointer-events-none pra lupa nao atrapalhar o clique */}
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50">
              <IconBusca />
            </span>
            <input
              type="search"
              aria-label="Buscar cadastros"
              className={`${campoEscuroCls} pl-10`}
              placeholder="Buscar por nome, empresa ou e-mail..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
          {/* quantos cadastros tao aparecendo do total */}
          <span className="ml-auto text-xs text-white/55">{lista.length} de {cadastros.length} cadastros</span>
        </div>

        <section>
          {/* Estados de carregando, erro e vazio */}
          {loading && <Spinner text="Carregando cadastros..." escuro />}
          {erroApi && <Aviso tipo="erro" escuro>{erroApi}</Aviso>}
          {!loading && !erroApi && lista.length === 0 && (
            <div className="rounded-none border border-dashed border-white/15 px-6 py-16 text-center">
              <p className="text-2xl font-black tracking-[-0.015em]">Nenhum cadastro encontrado</p>
              {/* se tiver busca sugere mudar o texto, senao avisa que ta tudo processado */}
              <p className="mt-2 text-sm text-white/60">
                {busca ? 'Tente ajustar o termo de busca.' : 'Todas as solicitações foram processadas.'}
              </p>
            </div>
          )}

          {/* Tabela - so aparece se tiver algum cadastro na lista */}
          {lista.length > 0 && (
            <Folha rebite={false}>
              {/* deixa rolar pro lado no celular */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  {/* cabecalho preto com letras brancas, como na versao original */}
                  <thead>
                    <tr className="bg-tinta">
                      {['Nome / Empresa', 'Tipo', 'E-mail', 'Data', 'Status', 'Ações'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-[0.1em] text-sobre-escuro">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* uma linha pra cada cadastro; pendentes ficam com fundo ambar claro e uma barra laranja na esquerda pra chamar atencao */}
                    {lista.map(c => (
                      <tr key={c.id}
                        className={`border-b border-tinta/15 transition-colors last:border-b-0 hover:bg-papel ${c.status === 'pendente' ? 'bg-gel-ambar/20 shadow-[inset_5px_0_0_var(--color-gel-fogo)]' : ''}`}>
                        {/* avatar com iniciais + nome e empresa */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {/* iniciais num quadrado com a cor do tipo de conta */}
                            <span className={`grid size-10 shrink-0 place-items-center border-[1.5px] border-black text-xs font-black text-tinta ${c.tipo === 'fornecedor' ? 'bg-gel-ceu' : 'bg-gel-indigo'}`}>
                              {iniciais(c.nome)}
                            </span>
                            <div className="min-w-0">
                              <p className="font-extrabold">{c.nome}</p>
                              <p className="text-xs text-tinta/60">{c.empresa}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3"><Badge label={c.tipo} variant={c.tipo} /></td>
                        <td className="px-5 py-3 text-tinta/70">{c.email}</td>
                        <td className="tabular whitespace-nowrap px-5 py-3 text-tinta/70">{formatDate(c.data_criacao)}</td>
                        <td className="px-5 py-3"><Badge label={c.status} variant={c.status} /></td>
                        {/* botoes de aprovar e rejeitar so aparecem nos pendentes */}
                        <td className="px-5 py-3">
                          {c.status === 'pendente' ? (
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => handleAcao(c.id, 'rejeitar')} className={btn('perigo', 'sm')}>
                                Rejeitar
                              </button>
                              <button type="button" onClick={() => handleAcao(c.id, 'aprovar')} className={btn('primario', 'sm')}>
                                Aprovar
                              </button>
                            </div>
                          ) : (
                            // quem ja foi analisado mostra so um tracinho
                            <span className="text-tinta/45">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* rodape da tabela com a contagem */}
              <div className="border-t border-tinta/10 bg-tinta/[0.03] px-5 py-3">
                <p className="text-xs text-tinta/65">
                  Mostrando <strong className="text-tinta">{lista.length}</strong> de <strong className="text-tinta">{cadastros.length}</strong> cadastros
                </p>
              </div>
            </Folha>
          )}
        </section>
      </div>

      {/* rodape do site */}
      <Footer />
    </div>
  );
}

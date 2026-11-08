import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FornecedoresConfirmados from '../components/FornecedoresConfirmados';
import CustosFornecedor from '../components/CustosFornecedor';
import TicketEstimado from '../components/TicketEstimado';
import Aviso from '../components/ui/Aviso';
import Badge from '../components/ui/Badge';
import CabecalhoPagina from '../components/ui/CabecalhoPagina';
import Spinner from '../components/ui/Spinner';
import {
  IconBusca, IconCalendario, IconIngresso, IconLapis, IconLista, IconLixeira, IconLocal, IconMais, IconSeta, IconVoltar,
} from '../components/ui/Icones';
import { GELS, btn, campoCls, campoEscuroCls, containerCls, dadoRotuloCls, gelDoId, rotuloCls } from '../components/ui/estilos';
import { solicitar } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { brl } from '../utils/formato';

// transforma a data do formato do banco (2026-03-28) pro brasileiro (28/03/2026)
// se nao tiver data mostra um tracinho
function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// formata numero como dinheiro (ex: 890 vira "R$ 890,00"); sem valor mostra "Não informado"
function formatCurrency(val) {
  if (val === null || val === undefined || val === '') return 'Não informado';
  return brl(val);
}


// pagina com a lista de eventos, os detalhes de um evento e o modal de editar
export default function PainelDeEventos() {
  const { perfil, usuario } = useAuth();
  const idUsuarioLogado = usuario?.id_usuario;
  // ── Aba ativa vem do query param gerenciado pelo Header ──────────────────
  // ex: ?tab=meus mostra so os meus eventos, sem nada mostra todos
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'painel';

  // ── Estado interno da página ──────────────────────────────────────────────
  // telaAtual = "painel" (lista) ou "detalhes" / eventoSelecionado = evento aberto nos detalhes
  const [telaAtual, setTelaAtual] = useState('painel');
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSel] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [busca, setBusca] = useState(searchParams.get('q') || ''); // ?q= vem da busca da landing page
  // campos do modal de edicao num objeto so; null = modal fechado
  const [form, setForm] = useState(null);

  const [erroApi, setErroApi] = useState('');
  const [carregando, setCarregando] = useState(true);
  // busca os eventos quando a pagina abre
  useEffect(() => {
    async function carregar() {
      try {
        setEventos(await solicitar('/eventos'));
      } catch (e) {
        setErroApi(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  // ── Filtragem (usa activeTab vindo da URL) ────────────────────────────────
  // o evento so aparece se passar nos 3 filtros: aba, status e busca
  // a busca procura no titulo ou no endereco, sem diferenciar maiuscula
  // (quem pode ver cada evento o servidor ja decide: GET /eventos so devolve os
  // publicados e, para o organizador, tambem os dele)
  const textoBusca = busca.toLowerCase();
  const eventosFiltrados = eventos.filter((ev) => {
    const matchAba = activeTab === 'painel' || ev.organizador_id === idUsuarioLogado;
    const matchStatus = filtroStatus === 'Todos' || ev.status_publicacao === filtroStatus;
    const matchBusca =
      ev.titulo.toLowerCase().includes(textoBusca) ||
      ev.endereco.toLowerCase().includes(textoBusca);
    return matchAba && matchStatus && matchBusca;
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  // abre o modal ja preenchido com os dados do evento
  function abrirModalEditar(ev) {
    setForm({
      id: ev.id,
      titulo: ev.titulo,
      inicio: ev.data_inicio,
      fim: ev.data_fim,
      endereco: ev.endereco,
      status: ev.status_publicacao,
      ticket: String(ev.primeiro_lote ?? ''),
      segundoLote: String(ev.segundo_lote ?? ''),
    });
  }

  // funcao generica pra atualizar qualquer campo do modal, e so passar o nome dele
  const alterarForm = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  // Atualiza o banco e busca os dados reais para manter o painel sincronizado.
  async function salvarFormulario(e) {
    e.preventDefault();
    setErroApi('');

    try {
      await solicitar(`/eventos/${form.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          titulo: form.titulo,
          inicio: form.inicio,
          fim: form.fim || form.inicio,
          endereco: form.endereco,
          status: form.status,
          ticket: form.ticket,
          segundoLote: form.segundoLote,
        }),
      });

      const atualizados = await solicitar('/eventos');
      setEventos(atualizados);
      setEventoSel(atualizados.find((evento) => evento.id === form.id) ?? null);
      setForm(null);
    } catch (erro) {
      setErroApi(erro.message);
    }
  }

  // remove o evento depois de confirmar e volta pra lista
  async function excluirEvento(id) {
    if (confirm('Tem certeza que deseja remover este evento?')) {
      try {
        await solicitar(`/eventos/${id}`, { method: 'DELETE' });
      } catch (e) {
        setErroApi(e.message);
        return;
      }
      setEventos(eventos.filter((ev) => ev.id !== id));
      setTelaAtual('painel');
      setEventoSel(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const publicados = eventos.filter((e) => e.status_publicacao === 'Publicado').length;

  return (
    <div className="min-h-[calc(100svh-68px)] fundo-luz pb-24">
      {erroApi && (
        <div className={`${containerCls} pt-6`}>
          <Aviso tipo="erro" escuro>{erroApi}</Aviso>
        </div>
      )}

      {/* ── TELA: LISTAGEM ── */}
      {telaAtual === 'painel' && (
        <>
          {/* titulo muda conforme a aba, e embaixo mostra o total e quantos estao publicados */}
          <CabecalhoPagina
            titulo={activeTab === 'meus' ? 'Meus Eventos Criados' : 'Painel de Eventos'}
            sub={`${eventos.length} eventos cadastrados · ${publicados} publicados`}
            acoes={
              perfil === 'organizador' && (
                <Link to="/criar-evento/evento" className={btn('primario', 'lg')}>
                  <IconMais tamanho={18} /> Criar Evento
                </Link>
              )
            }
          />

          {/* Barra de filtros */}
          <div className={`${containerCls} flex flex-wrap items-center gap-3 pt-8`}>
            {/* campo de busca com a lupa dentro */}
            <div className="relative min-w-[220px] flex-[1_1_240px] sm:max-w-[340px]">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50">
                <IconBusca />
              </span>
              <input
                className={`${campoEscuroCls} pl-10`}
                type="search"
                aria-label="Buscar evento"
                placeholder="Buscar evento..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            {/* filtro por status: controle segmentado, o selecionado fica claro */}
            <div className="flex flex-wrap border-[1.5px] border-white/40 bg-palco-2" role="group" aria-label="Filtrar por status">
              {['Todos', 'Publicado', 'Rascunho', 'Encerrado', 'Cancelado'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFiltroStatus(s)}
                  aria-pressed={filtroStatus === s}
                  className={`rounded-none border-r-[1.5px] border-white/20 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.06em] transition-colors last:border-r-0 ${
                    filtroStatus === s ? 'bg-folha text-tinta' : 'text-white/65 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {/* quantidade de resultados, coloca o "s" so se for mais de um */}
            <span className="ml-auto whitespace-nowrap text-xs text-white/55">
              {eventosFiltrados.length} resultado{eventosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Grade de folhas: cabe quantas de 320px der na largura da tela */}
          <main className={`${containerCls} grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-6 pt-6`}>
            {carregando ? (
              <div className="col-span-full"><Spinner text="Carregando eventos…" escuro /></div>
            ) : eventosFiltrados.length === 0 ? (
              <div className="col-span-full rounded-none border border-dashed border-white/15 px-6 py-20 text-center">
                <p className="text-2xl font-black tracking-[-0.015em] text-white">Nenhum evento encontrado</p>
                <p className="mt-2 text-sm text-white/60">Ajuste seus filtros de busca ou crie um novo evento.</p>
              </div>
            ) : (
              eventosFiltrados.map((ev) => {
                // eventos encerrados ou cancelados ficam mais apagados
                const enc = ev.status_publicacao === 'Encerrado' || ev.status_publicacao === 'Cancelado';
                const gel = GELS[gelDoId(ev.id)];
                return (
                  <article
                    key={ev.id}
                    className={`group relative flex flex-col overflow-hidden rounded-none border-[1.5px] border-black bg-folha text-tinta shadow-folha transition duration-200 ease-saida hover:-translate-y-1 ${enc ? '[&>div:first-child]:saturate-[.3] [&_dd]:text-tinta/60' : ''}`}
                  >
                    {/* faixa da gelatina do evento: o mesmo id sempre tem a mesma cor */}
                    <div className={`relative flex h-24 items-end justify-between px-5 pb-3 ${gel.bg}`}>
                      <span className="rebite left-5 top-4" aria-hidden="true" />
                      <span className={`font-mono text-[11px] font-semibold tracking-[0.06em] opacity-85 ${gel.sobre}`}>{gel.codigo} · {gel.nome}</span>
                      <Badge label={ev.status_publicacao} />
                    </div>

                    {/* conteudo: titulo, organizador, data, local, lote e itens de custo */}
                    <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                      <h2 className="line-clamp-2 text-lg font-extrabold leading-tight">{ev.titulo}</h2>
                      <p className="mt-1 text-xs text-tinta/60">
                        Por: <strong className="font-semibold text-tinta/80">{ev.organizador_nome}</strong>
                      </p>

                      <div className="mt-4 flex flex-col gap-1.5 text-[13px] text-tinta/70">
                        <span className="flex items-center gap-2">
                          <span className="text-tinta/45"><IconCalendario tamanho={15} /></span>
                          {/* se for um dia so mostra uma data, senao mostra inicio → fim */}
                          <span className="truncate">
                            {ev.data_inicio === ev.data_fim
                              ? formatDate(ev.data_inicio)
                              : `${formatDate(ev.data_inicio)} → ${formatDate(ev.data_fim)}`}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-tinta/45"><IconLocal tamanho={15} /></span>
                          <span className="truncate">{ev.endereco}</span>
                        </span>
                      </div>

                      {/* grade de dados: lote inicial e itens de custo */}
                      <dl className="mt-5 grid grid-cols-[1fr_auto] gap-4 border-t border-tinta/10 pt-4">
                        <div>
                          <dt className={dadoRotuloCls}>Lote inicial</dt>
                          <dd className="tabular mt-1 text-xl font-black tracking-[-0.015em]">{formatCurrency(ev.primeiro_lote)}</dd>
                          {ev.segundo_lote != null && (
                            <dd className="tabular mt-0.5 text-xs text-tinta/60">2º lote: {formatCurrency(ev.segundo_lote)}</dd>
                          )}
                        </div>
                        <div className="text-right">
                          <dt className={dadoRotuloCls}>Itens de custo</dt>
                          <dd className="tabular mt-1 text-xl font-black">{ev.quantidade_itens}</dd>
                        </div>
                      </dl>

                      {/* abre a tela de detalhes desse evento */}
                      <button
                        onClick={() => {
                          setEventoSel(ev);
                          setTelaAtual('detalhes');
                        }}
                        className={`${btn('tinta')} mt-5 w-full group-hover:bg-gel-indigo group-hover:text-tinta`}
                      >
                        {perfil === 'fornecedor' ? 'Ver custos e enviar proposta' : 'Ver detalhes'} <IconSeta />
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </main>
        </>
      )}

      {/* ── TELA: DETALHES ── */}
      {/* so aparece se tiver um evento selecionado */}
      {telaAtual === 'detalhes' && eventoSelecionado && (() => {
        const gel = GELS[gelDoId(eventoSelecionado.id)];
        const ehDono = perfil === 'organizador' && eventoSelecionado.organizador_id === idUsuarioLogado;
        return (
          <div className="mx-auto max-w-[860px] px-4 pt-8 sm:px-6">
            {/* volta pra lista e limpa o evento selecionado */}
            <button
              onClick={() => {
                setTelaAtual('painel');
                setEventoSel(null);
              }}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition-colors hover:text-white"
            >
              <IconVoltar /> Voltar para a lista
            </button>

            <article className="overflow-hidden rounded-none border-[1.5px] border-black bg-folha text-tinta shadow-folha">
              {/* faixa grande com a gelatina do evento e o status */}
              <div className={`relative flex h-36 items-end justify-between px-6 pb-4 sm:px-9 ${gel.bg}`}>
                <span className="rebite left-6 top-5 sm:left-9" aria-hidden="true" />
                <span className={`font-mono text-xs font-semibold tracking-[0.06em] opacity-85 ${gel.sobre}`}>{gel.codigo} · {gel.nome}</span>
                <Badge label={eventoSelecionado.status_publicacao} />
              </div>

              <div className="px-6 py-8 sm:px-9">
                <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black leading-[1.02] tracking-[-0.025em]">
                  {eventoSelecionado.titulo}
                </h1>
                <p className="mt-2 text-sm text-tinta/65">
                  Organizado por: <span className="font-semibold text-tinta">{eventoSelecionado.organizador_nome}</span>
                </p>

                {/* grade de dados do evento (1 coluna no celular e 2 em tela maior) */}
                <dl className="my-8 grid gap-px overflow-hidden rounded-none border border-tinta/10 bg-tinta/10 sm:grid-cols-2">
                  {[
                    {
                      Icone: IconCalendario,
                      rotulo: 'Data do Evento',
                      valor: eventoSelecionado.data_inicio === eventoSelecionado.data_fim
                        ? formatDate(eventoSelecionado.data_inicio)
                        : `${formatDate(eventoSelecionado.data_inicio)} até ${formatDate(eventoSelecionado.data_fim)}`,
                    },
                    { Icone: IconLocal, rotulo: 'Localização', valor: eventoSelecionado.endereco },
                    {
                      Icone: IconIngresso,
                      rotulo: 'Lote inicial',
                      valor: formatCurrency(eventoSelecionado.primeiro_lote),
                      extra: eventoSelecionado.segundo_lote != null && `Segundo lote: ${formatCurrency(eventoSelecionado.segundo_lote)}`,
                    },
                    { Icone: IconLista, rotulo: 'Itens de custo', valor: `${eventoSelecionado.quantidade_itens} itens registrados` },
                  ].map(({ Icone, rotulo, valor, extra }) => (
                    <div key={rotulo} className="flex gap-3 bg-papel px-5 py-4">
                      <span className="mt-0.5 text-tinta/45"><Icone tamanho={18} /></span>
                      <div className="min-w-0">
                        <dt className={dadoRotuloCls}>{rotulo}</dt>
                        <dd className="tabular mt-1 break-words font-semibold">{valor}</dd>
                        {extra && <dd className="tabular mt-0.5 text-sm text-tinta/60">{extra}</dd>}
                      </div>
                    </div>
                  ))}
                </dl>

                {['organizador', 'fornecedor'].includes(perfil) && <FornecedoresConfirmados key={`fornecedores-${eventoSelecionado.id}`} eventoId={eventoSelecionado.id} />}
                {perfil === 'fornecedor' && (
                  <CustosFornecedor
                    key={`custos-${eventoSelecionado.id}`}
                    evento={eventoSelecionado}
                  />
                )}
                {/* ticket estimado (RF13): so o organizador dono do evento */}
                {ehDono && (
                  <TicketEstimado
                    key={`ticket-${eventoSelecionado.id}`}
                    eventoId={eventoSelecionado.id}
                  />
                )}
                {/* botoes de excluir e editar */}
                {ehDono && (
                  <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-tinta/10 pt-6">
                    <button onClick={() => excluirEvento(eventoSelecionado.id)} className={btn('perigo')}>
                      <IconLixeira /> Excluir Evento
                    </button>
                    <button onClick={() => abrirModalEditar(eventoSelecionado)} className={btn('primario')}>
                      <IconLapis /> Editar Evento
                    </button>
                  </div>
                )}
              </div>
            </article>
          </div>
        );
      })()}

      {/* ── MODAL EDITAR ── */}
      {/* fundo escuro por cima da tela toda com o formulario no meio */}
      {form && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-palco/75 p-4 backdrop-blur-[3px]">
          <div role="dialog" aria-modal="true" aria-labelledby="titulo-editar" className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-none bg-folha text-tinta shadow-folha">
            <div className="h-2.5 bg-gel-indigo" aria-hidden="true" />
            <div className="px-6 py-7">
              <h2 id="titulo-editar" className="mb-6 text-2xl font-black tracking-[-0.015em]">
                Editar Dados do Evento
              </h2>
              {/* ao enviar chama o salvarFormulario */}
              <form onSubmit={salvarFormulario} className="space-y-4">
                <label className="flex flex-col gap-2">
                  <span className={rotuloCls}>Título do Evento *</span>
                  <input type="text" required value={form.titulo} onChange={alterarForm('titulo')} className={campoCls()} placeholder="Ex: Lollapalooza 2026" />
                </label>
                {/* datas lado a lado, so a de inicio e obrigatoria */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2">
                    <span className={rotuloCls}>Data Início *</span>
                    <input type="date" required value={form.inicio} onChange={alterarForm('inicio')} className={campoCls()} />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className={rotuloCls}>Data Fim</span>
                    <input type="date" value={form.fim} onChange={alterarForm('fim')} className={campoCls()} />
                  </label>
                </div>
                <label className="flex flex-col gap-2">
                  <span className={rotuloCls}>Endereço / Local *</span>
                  <input type="text" required value={form.endereco} onChange={alterarForm('endereco')} className={campoCls()} placeholder="Ex: Allianz Parque, São Paulo" />
                </label>
                {/* status e ticket lado a lado */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2">
                    <span className={rotuloCls}>Status de Publicação</span>
                    <select value={form.status} onChange={alterarForm('status')} className={campoCls()}>
                      <option value="Publicado">Publicado</option>
                      <option value="Rascunho">Rascunho</option>
                      <option value="Encerrado">Encerrado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className={rotuloCls}>Preço do lote inicial (R$)</span>
                    <input type="number" required min="0" max="99999999.99" step="0.01" value={form.ticket} onChange={alterarForm('ticket')} className={`${campoCls()} tabular`} placeholder="890" />
                  </label>
                </div>
                <label className="flex flex-col gap-2">
                  <span className={rotuloCls}>Preço do segundo lote (R$) — opcional</span>
                  <input type="number" min="0" max="99999999.99" step="0.01" value={form.segundoLote} onChange={alterarForm('segundoLote')} className={`${campoCls()} tabular`} placeholder="Deixe vazio se não houver segundo lote" />
                </label>
                {/* cancelar fecha sem salvar / salvar envia o form */}
                <div className="flex justify-end gap-3 border-t border-tinta/10 pt-5">
                  <button type="button" onClick={() => setForm(null)} className={btn('claro')}>
                    Cancelar
                  </button>
                  <button type="submit" className={btn('primario')}>
                    Salvar Mudanças
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

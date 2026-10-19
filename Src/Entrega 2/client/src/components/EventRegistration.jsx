import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
// as 4 etapas do cadastro de evento
import { EventBasics } from '../pages/EventBasics.jsx';
import { AudienceLots } from '../pages/AudienceLots.jsx';
import { IndependentCosts } from '../pages/IndependentCosts.jsx';
import { CostItems } from '../pages/CostItems.jsx';
import './eventRegistration.css';
import { solicitar } from '../services/api';
import { useAuth } from '../services/AuthContext';

// nome de cada etapa na url, na ordem (ex: /criar-evento/publico-lotes)
const steps = [
  'evento',
  'publico-lotes',
  'custos-independentes',
  'itens-custos',
];

// pagina que controla o formulario de criar evento
// guarda os dados de todas as etapas aqui, pra nao perder quando troca de etapa
export default function EventRegistration() {
  // pega a etapa da url (o :etapa da rota)
  const { etapa } = useParams();
  const { perfil } = useAuth();
  const navigate = useNavigate();

  // descobre o numero da etapa, se a url nao bater com nenhuma cai na etapa 1
  const index = steps.indexOf(etapa);
  const step = index < 0 ? 1 : index + 1;
  const [etapaMaisAvancada, setEtapaMaisAvancada] = useState(step);
  const [revisao, setRevisao] = useState(null);
  const dialogo = useRef(null);
  const envioEmAndamento = useRef(false);

  useEffect(() => {
    if (!dialogo.current) return;
    if (revisao && !dialogo.current.open) dialogo.current.showModal();
    if (!revisao && dialogo.current.open) dialogo.current.close();
  }, [revisao]);
  // dados de cada etapa
  const [eventData, setEventData] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    city: '',
  });
  const [lotData, setLotData] = useState({
    firstLot: '',
    secondLot: '',
    minAudience: '',
    maxAudience: '',
  });
  const [independentCosts, setIndependentCosts] = useState([]);
  const [groups, setGroups] = useState(() =>
    ['Iluminação', 'Alimentação', 'Bebidas', 'Segurança', 'Estrutura'].map(
      (name) => ({ name, items: [] }),
    ),
  );
  // true quando clica em finalizar, mostra a mensagem de concluido
  const [finished, setFinished] = useState(false);
  const [resumo, setResumo] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  // A etapa 4 apenas abre a revisão; não envia nada para a API.
  function revisar(dados) {
    if (step !== 4 || salvando || finished) return;
    setErro('');
    setRevisao(dados);
  }

  // Somente o botão explícito do diálogo pode persistir o evento.
  async function confirmarSalvar() {
    if (step !== 4 || !revisao || finished || envioEmAndamento.current) return;
    envioEmAndamento.current = true;
    const gruposFinais = revisao.groups;

    setSalvando(true);
    setErro('');

    const money = (value) => Number(String(value).replace(',', '.'));

    try {
      const resultado = await solicitar('/eventos', {
        method: 'POST',
        body: JSON.stringify({
          eventData,
          lotData,
          groups: gruposFinais,
          independentCosts: independentCosts.map((cost) => ({
            ...cost,
            numericValue: money(cost.value),
          })),
        }),
      });

      // O resumo usa o retorno do servidor, depois do commit no banco.
      setResumo(resultado);
      setFinished(true);
      setRevisao(null);
    } catch (erro) {
      setErro(erro.message);
    } finally {
      envioEmAndamento.current = false;
      setSalvando(false);
    }
  }

  // so organizador pode criar evento, qualquer outro perfil (ou deslogado) volta pro painel
  // fica em useEffect pra nao chamar navigate() durante o render (e manter os hooks sempre na mesma ordem)
  useEffect(() => {
    if (perfil !== 'organizador') {
      navigate('/PainelDeEventos');
    }
  }, [navigate, perfil]);

  if (perfil !== 'organizador') return null;

  // vai pra etapa pelo numero, esconde a mensagem de concluido e volta pro topo
  function goTo(number) {
    if (finished || salvando || revisao || number < 1 || number > 4) return;
    setEtapaMaisAvancada((anterior) => Math.max(anterior, number));
    setErro('');
    navigate(`/criar-evento/${steps[number - 1]}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    // essa classe ativa o css do eventRegistration.css (por causa do @scope)
    <div className="event-registration">
      <main className="main-content">
        {/* faixa do topo com o titulo */}
        <section className="hero-strip">
          <div>
            <span className="hero-kicker">Área do organizador</span>
            <h2>Crie seu evento no TrocaTicket</h2>
            <p>Configure informações, lotes e custos em poucos passos.</p>
          </div>
        </section>
        <nav
          aria-label="Etapas do cadastro"
          className="mx-auto my-7 w-full max-w-4xl px-4"
        >
          <ol className="grid grid-cols-4">
            {[
              {
                label: 'Evento',
                circle: 'border-tt-azul-principal bg-tt-azul-principal',
                line: 'bg-tt-azul-principal',
              },
              {
                label: 'Público e lotes',
                circle: 'border-tt-roxo-principal bg-tt-roxo-principal',
                line: 'bg-tt-roxo-principal',
              },
              {
                label: 'Custos independentes',
                circle: 'border-tt-rosa-principal bg-tt-rosa-principal',
                line: 'bg-tt-rosa-principal',
              },
              {
                label: 'Itens de custos',
                circle: 'border-tt-laranja-principal bg-tt-laranja-principal',
                line: 'bg-tt-laranja-principal',
              },
            ].map(({ label, circle, line }, position) => {
              const number = position + 1;
              const visitada = number <= etapaMaisAvancada;
              const ativa = step === number;
              const bloqueada =
                finished || salvando || Boolean(revisao) || !visitada;

              return (
                <li key={label} className="relative min-w-0">
                  {number < 4 && (
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute left-1/2 top-[18px] h-1 w-full sm:top-5 ${number < etapaMaisAvancada ? line : 'bg-tt-azul-marinho/15'}`}
                    />
                  )}
                  <button
                    type="button"
                    disabled={bloqueada}
                    aria-current={ativa ? 'step' : undefined}
                    onClick={() => goTo(number)}
                    className="relative z-10 flex w-full flex-col items-center gap-3 rounded-lg px-1 text-center text-[10px] font-semibold text-tt-azul-marinho outline-none focus-visible:ring-2 focus-visible:ring-tt-azul-principal disabled:cursor-default sm:text-xs"
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-full border-2 text-sm font-bold ring-4 ring-tt-branco transition duration-200 sm:size-11 ${visitada ? `${circle} text-tt-branco` : 'border-tt-azul-marinho/20 bg-tt-cinza-claro text-tt-grafite/50'} ${ativa ? 'scale-110 shadow-md' : ''}`}
                    >
                      {number}
                    </span>
                    <span className={ativa ? 'font-extrabold' : 'font-medium'}>
                      {label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="content-wrap">
          {/* Confirma os preços e a contagem retornados pelo servidor. */}
          {finished && (
            <div className="success-banner">
              <strong>Evento Cadastrado!</strong>
              <span>
                Evento cadastrado com sucesso! ele já pode ser acessado e consultado
                no painel.
              </span>
            </div>
          )}
          {erro && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-tt-rosa-claro p-4 text-tt-rosa-principal"
            >
              {erro}
            </p>
          )}
          {salvando && <p role="status">Salvando evento…</p>}
          {finished && resumo && (
            <div
              role="status"
              className="mb-4 grid gap-3 rounded-xl bg-tt-azul-marinho p-5 text-tt-branco sm:grid-cols-3"
            >
              <div>
                <p className="text-xs text-tt-branco/70">Lote inicial</p>
                <strong>
                  {Number(resumo.primeiro_lote).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </strong>
              </div>
              <div>
                <p className="text-xs text-tt-branco/70">Segundo lote</p>
                <strong>
                  {resumo.segundo_lote == null
                    ? 'Não informado'
                    : Number(resumo.segundo_lote).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                </strong>
              </div>
              <div>
                <p className="text-xs text-tt-branco/70">
                  Itens de custo salvos
                </p>
                <strong>{resumo.quantidade_itens}</strong>
              </div>
            </div>
          )}
          {finished && (
            <Link
              to="/PainelDeEventos?tab=meus"
              className="block p-4 font-bold text-tt-azul-principal"
            >
              Ver meus eventos →
            </Link>
          )}
          {!finished && (
            <fieldset disabled={salvando}>
              {/* mostra so a etapa atual, cada uma recebe seus dados e as funcoes de voltar/avancar */}
              {/* na etapa 1 o voltar leva pro painel de eventos */}
              {step === 1 && (
                <EventBasics
                  data={eventData}
                  setData={setEventData}
                  onBack={() => navigate('/PainelDeEventos')}
                  onNext={() => goTo(2)}
                />
              )}
              {step === 2 && (
                <AudienceLots
                  data={lotData}
                  setData={setLotData}
                  onBack={() => goTo(1)}
                  onNext={() => goTo(3)}
                />
              )}
              {step === 3 && (
                <IndependentCosts
                  costs={independentCosts}
                  setCosts={setIndependentCosts}
                  onBack={() => goTo(2)}
                  onNext={() => goTo(4)}
                />
              )}
              {/* etapa 4 recebe os custos da etapa 3 pra somar no total */}
              {step === 4 && (
                <CostItems
                  groups={groups}
                  setGroups={setGroups}
                  independentCosts={independentCosts}
                  onBack={() => goTo(3)}
                  onFinish={revisar}
                />
              )}
            </fieldset>
          )}
          <dialog
            ref={dialogo}
            aria-labelledby="titulo-revisao"
            onCancel={(event) => {
              event.preventDefault();
              if (!envioEmAndamento.current) setRevisao(null);
            }}
            className="m-auto max-h-[90vh] w-[calc(100%_-_32px)] max-w-[650px] overflow-y-auto rounded-2xl border-0 bg-tt-branco p-6 text-tt-azul-marinho shadow-2xl backdrop:bg-tt-azul-marinho/60"
          >
            {revisao && (
              <>
                <h2 id="titulo-revisao" className="text-xl font-bold">
                  Revise antes de salvar o evento
                </h2>
                <p className="mt-2 text-sm text-tt-grafite/70">
                  O evento só será publicado ao clicar em Confirmar e salvar.
                </p>
                <p className="mt-4 font-bold">{eventData.name}</p>
                <p className="text-sm">
                  {eventData.date} · {eventData.startTime} às{' '}
                  {eventData.endTime}
                </p>
                <p className="mt-3 text-sm">
                  Lote inicial:{' '}
                  {Number(
                    String(lotData.firstLot).replace(',', '.'),
                  ).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
                <p className="text-sm">
                  Custos independentes adicionados: {independentCosts.length}
                </p>
                <p className="mt-3 font-bold">
                  Itens de custo:{' '}
                  {revisao.groups.reduce(
                    (sum, group) => sum + group.items.length,
                    0,
                  )}
                </p>
                <ul className="my-3 divide-y divide-tt-azul-marinho/10">
                  {revisao.groups.flatMap((group) =>
                    group.items.map((item) => (
                      <li key={item.id} className="py-2 text-sm">
                        {group.name} — {item.description} · {item.qty} ×{' '}
                        {Number(item.unit).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </li>
                    )),
                  )}
                </ul>
                {revisao.groups.every((group) => group.items.length === 0) && (
                  <p className="rounded-xl bg-tt-laranja-claro p-3 text-sm">
                    Nenhum item de fornecimento foi adicionado. Volte para
                    preencher os itens se deseja receber propostas.
                  </p>
                )}
                {erro && (
                  <p
                    role="alert"
                    className="mt-3 text-sm text-tt-rosa-principal"
                  >
                    {erro}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    autoFocus
                    disabled={salvando}
                    onClick={() => setRevisao(null)}
                    className="rounded-xl border border-tt-azul-marinho/20 px-4 py-3 text-sm font-bold"
                  >
                    Voltar e continuar preenchendo
                  </button>
                  <button
                    type="button"
                    disabled={salvando}
                    onClick={confirmarSalvar}
                    className="rounded-xl bg-tt-azul-marinho px-4 py-3 text-sm font-bold text-tt-branco disabled:opacity-50"
                  >
                    {salvando ? 'Salvando…' : 'Confirmar e salvar'}
                  </button>
                </div>
              </>
            )}
          </dialog>
        </div>
      </main>
    </div>
  );
}

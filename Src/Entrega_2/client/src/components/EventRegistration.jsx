import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
// as 4 etapas do cadastro de evento
import { EventBasics } from '../pages/EventBasics.jsx';
import { AudienceLots } from '../pages/AudienceLots.jsx';
import { IndependentCosts } from '../pages/IndependentCosts.jsx';
import { CostItems } from '../pages/CostItems.jsx';
import { solicitar } from '../services/api';
import { useAuth } from '../services/AuthContext';
import Aviso from './ui/Aviso';
import CabecalhoPagina from './ui/CabecalhoPagina';
import Etapas from './ui/Etapas';
import Folha from './ui/Folha';
import Semicirculos from './ui/Semicirculos';
import { IconSeta } from './ui/Icones';
import { GELS, btn, dadoRotuloCls } from './ui/estilos';

// nome de cada etapa na url, na ordem (ex: /criar-evento/publico-lotes)
const steps = [
  'evento',
  'publico-lotes',
  'custos-independentes',
  'itens-custos',
];

// rotulo e gelatina de cada etapa (a mesma cor aparece na linha de etapas e na faixa da folha)
const ETAPAS = [
  { label: 'Evento', gel: 'indigo' },
  { label: 'Público e lotes', gel: 'magenta' },
  { label: 'Custos independentes', gel: 'ceu' },
  { label: 'Itens de custos', gel: 'indigo' },
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
    margin: '',
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
  // true = salva como rascunho em vez de publicar
  const [rascunho, setRascunho] = useState(false);
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
          status: rascunho ? 'rascunho' : 'publicado',
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

  const brlTexto = (valor) => Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <main className="relative min-h-[calc(100svh-68px)] overflow-x-clip fundo-luz pb-24">
      <Semicirculos />
      {/* faixa do topo com o titulo */}
      <CabecalhoPagina
        titulo="Crie seu evento no TrocaTicket"
        sub="Configure informações, lotes e custos em poucos passos."
        gels={ETAPAS.map((e) => GELS[e.gel].bg)}
      />

      <div className="mx-auto w-full max-w-[900px] px-4 sm:px-6">
        {/* linha de etapas: as ja visitadas viram botoes pra voltar nelas */}
        <div className="py-8">
          <Etapas
            itens={ETAPAS}
            atual={step - 1}
            maisAvancada={etapaMaisAvancada - 1}
            onIr={(i) => goTo(i + 1)}
            bloqueado={finished || salvando || Boolean(revisao)}
            escuro
            rotulo="Etapas do cadastro"
          />
        </div>

        {/* Confirma os preços e a contagem retornados pelo servidor. */}
        {finished && (
          <Aviso tipo="sucesso" escuro className="mb-4">
            <strong>Evento Cadastrado!</strong>{' '}
            Evento cadastrado com sucesso! ele já pode ser acessado e consultado no painel.
          </Aviso>
        )}
        {erro && <Aviso tipo="erro" escuro className="mb-4">{erro}</Aviso>}
        {salvando && <p role="status" className="mb-4 text-sm text-white/70">Salvando evento…</p>}
        {finished && resumo && (
          <Folha gel="verde" className="mb-6" role="status">
            <dl className="grid gap-px bg-tinta/10 sm:grid-cols-3">
              {[
                ['Lote inicial', brlTexto(resumo.primeiro_lote)],
                ['Segundo lote', resumo.segundo_lote == null ? 'Não informado' : brlTexto(resumo.segundo_lote)],
                ['Itens de custo salvos', resumo.quantidade_itens],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} className="bg-folha px-6 py-5">
                  <dt className={dadoRotuloCls}>{rotulo}</dt>
                  <dd className="tabular mt-1.5 text-2xl font-black tracking-[-0.015em]">{valor}</dd>
                </div>
              ))}
            </dl>
          </Folha>
        )}
        {finished && (
          <Link to="/PainelDeEventos?tab=meus" className={btn('primario', 'lg')}>
            Ver meus eventos <IconSeta />
          </Link>
        )}
        {!finished && (
          <fieldset disabled={salvando} className="m-0 min-w-0 border-0 p-0">
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

        {/* revisao antes de salvar: dialogo nativo (prende o foco e fecha com Esc) */}
        <dialog
          ref={dialogo}
          aria-labelledby="titulo-revisao"
          onCancel={(event) => {
            event.preventDefault();
            if (!envioEmAndamento.current) setRevisao(null);
          }}
          className="m-auto max-h-[90vh] w-[calc(100%_-_32px)] max-w-[650px] overflow-hidden rounded-none border-0 bg-folha p-0 text-tinta shadow-folha"
        >
          {revisao && (
            <div className="flex max-h-[90vh] flex-col">
              <div className="flex h-2.5 shrink-0" aria-hidden="true">
                {ETAPAS.map((e) => <span key={e.gel} className={`flex-1 ${GELS[e.gel].bg}`} />)}
              </div>
              <div className="overflow-y-auto px-6 py-7 sm:px-8">
                <h2 id="titulo-revisao" className="text-2xl font-black tracking-[-0.015em]">
                  Revise antes de salvar o evento
                </h2>
                <p className="mt-2 text-sm text-tinta/65">
                  {rascunho
                    ? 'O evento será salvo como rascunho e só você poderá vê-lo.'
                    : 'O evento só será publicado ao clicar em Confirmar e salvar.'}
                </p>
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={rascunho}
                    disabled={salvando}
                    onChange={(e) => setRascunho(e.target.checked)}
                  />
                  Salvar como rascunho (não publicar ainda)
                </label>

                <div className="mt-6 border-t border-tinta/10 pt-5">
                  <p className="text-lg font-extrabold">{eventData.name}</p>
                  <p className="mt-1 text-sm text-tinta/70">
                    {eventData.date} · {eventData.startTime} às {eventData.endTime}
                  </p>
                </div>

                <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-3">
                  <div>
                    <dt className={dadoRotuloCls}>Lote inicial</dt>
                    <dd className="tabular mt-1 font-bold">{brlTexto(String(lotData.firstLot).replace(',', '.'))}</dd>
                  </div>
                  <div>
                    <dt className={dadoRotuloCls}>Margem de lucro</dt>
                    <dd className="mt-1 font-bold">{lotData.margin?.trim() ? `${lotData.margin}%` : 'não informada (0%)'}</dd>
                  </div>
                  <div>
                    <dt className={dadoRotuloCls}>Custos independentes</dt>
                    <dd className="mt-1 font-bold">{independentCosts.length} adicionados</dd>
                  </div>
                </dl>

                <p className="mt-6 font-bold">
                  Itens de custo: {revisao.groups.reduce((sum, group) => sum + group.items.length, 0)}
                </p>
                <ul className="mt-2 divide-y divide-tinta/10 border-y border-tinta/10">
                  {revisao.groups.flatMap((group) =>
                    group.items.map((item) => (
                      <li key={item.id} className="flex flex-wrap justify-between gap-2 py-2.5 text-sm">
                        <span><span className="text-tinta/55">{group.name} —</span> {item.description}</span>
                        <span className="tabular text-tinta/80">{item.qty} × {brlTexto(item.unit)}</span>
                      </li>
                    )),
                  )}
                </ul>
                {revisao.groups.every((group) => group.items.length === 0) && (
                  <Aviso tipo="atencao" className="mt-4">
                    Nenhum item de fornecimento foi adicionado. Volte para
                    preencher os itens se deseja receber propostas.
                  </Aviso>
                )}
                {erro && <Aviso tipo="erro" className="mt-4">{erro}</Aviso>}
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-tinta/10 bg-tinta/[0.03] px-6 py-4 sm:px-8">
                <button type="button" autoFocus disabled={salvando} onClick={() => setRevisao(null)} className={btn('claro')}>
                  Voltar e continuar preenchendo
                </button>
                <button type="button" disabled={salvando} onClick={confirmarSalvar} className={btn('primario')}>
                  {salvando ? 'Salvando…' : 'Confirmar e salvar'}
                </button>
              </div>
            </div>
          )}
        </dialog>
      </div>
    </main>
  );
}

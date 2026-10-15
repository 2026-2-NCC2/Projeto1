// useState = guarda os dados que a pessoa digita em cada etapa
import { useState } from 'react';
// useNavigate = troca de pagina pelo codigo / useParams = le a parte variavel da url (a etapa)
// (o Link nao e usado aqui, por isso o lint avisa)
import { Link, useNavigate, useParams } from 'react-router-dom';
// barra de etapas (1 - 2 - 3 - 4)
import { Wizard } from './Wizard.jsx';
// as 4 etapas do cadastro de evento
import { EventBasics } from '../pages/EventBasics.jsx';
import { AudienceLots } from '../pages/AudienceLots.jsx';
import { IndependentCosts } from '../pages/IndependentCosts.jsx';
import { CostItems } from '../pages/CostItems.jsx';
// estilos dessa area
import './eventRegistration.css';

// nome de cada etapa na url, na ordem (ex: /criar-evento/publico-lotes)
const steps = ['evento', 'publico-lotes', 'custos-independentes', 'itens-custos'];

// pagina que controla o formulario de criar evento
// guarda os dados de todas as etapas aqui, pra nao perder quando troca de etapa
export default function EventRegistration() {
  // pega a etapa da url (o :etapa da rota)
  const { etapa } = useParams();
  // funcao pra trocar de pagina
  const navigate = useNavigate();
  // descobre o numero da etapa, se a url nao bater com nenhuma cai na etapa 1
  const index = steps.indexOf(etapa);
  const step = index < 0 ? 1 : index + 1;
  // dados de cada etapa
  // etapa 1: nome, data, horarios, local e cidade
  const [eventData, setEventData] = useState({ name: '', date: '', startTime: '', endTime: '', location: '', city: '' });
  // etapa 2: precos dos lotes e publico
  const [lotData, setLotData] = useState({ firstLot: '', secondLot: '', minAudience: '', maxAudience: '' });
  // etapa 3: lista de custos independentes
  const [independentCosts, setIndependentCosts] = useState([]);
  // true quando clica em finalizar, mostra a mensagem de concluido
  const [finished, setFinished] = useState(false);

  // vai pra etapa pelo numero, esconde a mensagem de concluido e volta pro topo
  function goTo(number) {
    // esconde a mensagem de concluido
    setFinished(false);
    // muda a url pra etapa escolhida (o numero vira o nome da lista steps)
    navigate(`/criar-evento/${steps[number - 1]}`);
    // rola a pagina suavemente pro topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    // essa classe ativa o css do eventRegistration.css (por causa do @scope)
    <div className="event-registration">
      {/* conteudo principal */}
      <main className="main-content">
        {/* faixa do topo com o titulo */}
        <section className="hero-strip">
          {/* etiqueta, titulo e subtitulo */}
          <div>
            <span className="hero-kicker">Área do organizador</span>
            <h2>Crie seu evento no TrocaTicket</h2>
            <p>Configure informações, lotes e custos em poucos passos.</p>
          </div>
        </section>
        {/* barra de etapas, so deixa clicar pra voltar (nao pula pra frente) */}
        <Wizard currentStep={step} onStepClick={(target) => target <= step && goTo(target)} />
        {/* area do card da etapa */}
        <div className="content-wrap">
          {/* mensagem depois de finalizar, avisando que por enquanto nada e salvo */}
          {finished && <div className="success-banner"><strong>Fluxo concluído!</strong><span>Esta é uma demonstração visual. Nenhum evento foi enviado ou salvo.</span></div>}
          {/* mostra so a etapa atual, cada uma recebe seus dados e as funcoes de voltar/avancar */}
          {/* na etapa 1 o voltar leva pro painel de eventos */}
          {step === 1 && <EventBasics data={eventData} setData={setEventData} onBack={() => navigate('/PainelDeEventos')} onNext={() => goTo(2)} />}
          {step === 2 && <AudienceLots data={lotData} setData={setLotData} onBack={() => goTo(1)} onNext={() => goTo(3)} />}
          {step === 3 && <IndependentCosts costs={independentCosts} setCosts={setIndependentCosts} onBack={() => goTo(2)} onNext={() => goTo(4)} />}
          {/* etapa 4 recebe os custos da etapa 3 pra somar no total */}
          {step === 4 && <CostItems independentCosts={independentCosts} onBack={() => goTo(3)} onFinish={() => { setFinished(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
        </div>
      </main>
    </div>
  );
}
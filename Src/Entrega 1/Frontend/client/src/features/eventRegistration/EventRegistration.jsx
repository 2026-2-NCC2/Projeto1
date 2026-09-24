import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Wizard } from './components/Wizard.jsx';
import { EventBasics } from './pages/EventBasics.jsx';
import { AudienceLots } from './pages/AudienceLots.jsx';
import { IndependentCosts } from './pages/IndependentCosts.jsx';
import { CostItems } from './pages/CostItems.jsx';
import './eventRegistration.css';

const steps = ['evento', 'publico-lotes', 'custos-independentes', 'itens-custos'];

export default function EventRegistration() {
  const { etapa } = useParams();
  const navigate = useNavigate();
  const index = steps.indexOf(etapa);
  const step = index < 0 ? 1 : index + 1;
  const [eventData, setEventData] = useState({ name: '', date: '', startTime: '', endTime: '', location: '', city: '' });
  const [lotData, setLotData] = useState({ firstLot: '', secondLot: '', minAudience: '', maxAudience: '' });
  const [independentCosts, setIndependentCosts] = useState([]);
  const [finished, setFinished] = useState(false);

  function goTo(number) {
    setFinished(false);
    navigate(`/criar-evento/${steps[number - 1]}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="event-registration">
      <main className="main-content">
        <section className="hero-strip">
          <div>
            <span className="hero-kicker">Área do organizador</span>
            <h2>Crie seu evento no TrocaTicket</h2>
            <p>Configure informações, lotes e custos em poucos passos.</p>
          </div>
        </section>
        <Wizard currentStep={step} onStepClick={(target) => target <= step && goTo(target)} />
        <div className="content-wrap">
          {finished && <div className="success-banner"><strong>Fluxo concluído!</strong><span>Esta é uma demonstração visual. Nenhum evento foi enviado ou salvo.</span></div>}
          {step === 1 && <EventBasics data={eventData} setData={setEventData} onBack={() => navigate('/PainelDeEventos')} onNext={() => goTo(2)} />}
          {step === 2 && <AudienceLots data={lotData} setData={setLotData} onBack={() => goTo(1)} onNext={() => goTo(3)} />}
          {step === 3 && <IndependentCosts costs={independentCosts} setCosts={setIndependentCosts} onBack={() => goTo(2)} onNext={() => goTo(4)} />}
          {step === 4 && <CostItems independentCosts={independentCosts} onBack={() => goTo(3)} onFinish={() => { setFinished(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
        </div>
      </main>
    </div>
  );
}

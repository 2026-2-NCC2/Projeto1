import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { PageShell } from '../components/Layout.jsx';
import { Wizard } from '../components/Wizard.jsx';

// as 4 etapas do cadastro de evento
import { EventBasics } from './EventBasics.jsx';
import { AudienceLots } from './AudienceLots.jsx';
import { IndependentCosts } from './IndependentCosts.jsx';
import { CostItems } from './CostItems.jsx';

// rota de cada etapa, na ordem (posicao 0 = etapa 1)
const routes = [
  '/evento',
  '/publico-lotes',
  '/custos-independentes',
  '/itens-custos',
];

// pagina que controla o fluxo inteiro de criar evento
// guarda os dados de todas as etapas aqui, pra nao perder quando troca de etapa
export default function EventFlow() {
  const navigate = useNavigate();
  const location = useLocation();

  // descobre a etapa atual pela rota, se a rota nao estiver na lista cai na etapa 1
  const currentIndex = routes.indexOf(location.pathname);
  const step = currentIndex >= 0 ? currentIndex + 1 : 1;

  // dados da etapa 1 (informacoes basicas)
  const [eventData, setEventData] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    city: '',
  });

  // dados da etapa 2 (publico e lotes)
  const [lotData, setLotData] = useState({
    firstLot: '',
    secondLot: '',
    minAudience: '',
    maxAudience: '',
  });

  // lista de custos da etapa 3, tambem e usada na etapa 4 pra somar o total
  const [independentCosts, setIndependentCosts] = useState([]);

  const [success, setSuccess] = useState(false);   // mostra a mensagem de evento criado
  const [hasDraft, setHasDraft] = useState(false); // mostra o aviso de rascunho salvo

  // vai pra uma etapa especifica
  function goTo(nextStep) {
    // garante que o numero fica entre 1 e 4
    const bounded = Math.min(4, Math.max(1, nextStep));

    // esconde a mensagem de sucesso se voltar pra alguma etapa
    setSuccess(false);

    navigate(routes[bounded - 1]);

    // volta pro topo da pagina com animacao
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  // roda quando clica em "Finalizar cadastro" na ultima etapa
  function handleFinish() {
    setSuccess(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  return (
    <PageShell>
      {/* topo com fundo em degrade, titulo e aviso de rascunho */}
      {/* no celular fica um embaixo do outro, a partir de 761px fica lado a lado */}
      <section className="flex min-h-[150px] flex-col items-start justify-between gap-6 bg-[linear-gradient(125deg,#331166_0%,#12275c_62%,#07082e_100%)] px-[18px] pb-11 pt-[26px] text-white min-[461px]:px-[max(24px,calc((100vw-1132px)/2))] min-[761px]:min-h-[170px] min-[761px]:flex-row min-[761px]:items-center min-[761px]:py-[34px]">
        <div>
          <span className="text-[.72rem] font-extrabold uppercase tracking-[.13em] text-[#e6c896]">
            Área do organizador
          </span>

          <h2 className="mb-1.5 mt-1 text-[clamp(1.6rem,3vw,2.35rem)] font-bold leading-[1.1] tracking-[-.045em]">
            Crie seu evento no TrocaTicket
          </h2>

          <p className="m-0 text-white/70">
            Configure informações, lotes e custos em poucos passos.
          </p>
        </div>

        {/* aviso de rascunho, aparece depois que a pessoa mexe em algum campo (some no celular) */}
        {hasDraft && (
          <div className="hidden whitespace-nowrap rounded-full border border-white/15 bg-white/[.07] px-3.5 py-2.5 text-[.76rem] font-bold min-[761px]:block">
            <span className="mr-1 text-[#3f8a5b]">●</span>
            Rascunho salvo
          </div>
        )}
      </section>

      {/* barra de etapas, so deixa clicar pra voltar (nao pula pra frente) */}
      <Wizard
        currentStep={step}
        onStepClick={(target) => {
          if (target <= step) {
            goTo(target);
          }
        }}
      />

      {/* area das etapas */}
      {/* onChangeCapture pega qualquer mudanca nos campos de dentro e marca como rascunho */}
      <div
        className="mx-auto mb-20 w-[min(900px,calc(100%-20px))] min-[461px]:w-[min(900px,calc(100%-36px))]"
        onChangeCapture={() => setHasDraft(true)}
      >
        {/* mensagem de sucesso depois de finalizar */}
        {success && (
          <div className="mb-[18px] flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-xl border border-[rgba(63,138,91,.32)] bg-[#edf8f0] px-[15px] py-[13px] text-[.77rem] text-[#285f3b]">
            <strong>
              Evento configurado!
            </strong>

            <span>
              Seu evento já pode ser visualizado na página "Meus Eventos".
            </span>
          </div>
        )}

        {/* mostra so a etapa atual, cada uma recebe seus dados e as funcoes de voltar/avancar */}

        {/* etapa 1: primeira etapa, entao nao tem voltar */}
        {step === 1 && (
          <EventBasics
            data={eventData}
            setData={setEventData}
            onNext={() => goTo(2)}
          />
        )}

        {/* etapa 2: publico e lotes */}
        {step === 2 && (
          <AudienceLots
            data={lotData}
            setData={setLotData}
            onBack={() => goTo(1)}
            onNext={() => goTo(3)}
          />
        )}

        {/* etapa 3: custos independentes */}
        {step === 3 && (
          <IndependentCosts
            costs={independentCosts}
            setCosts={setIndependentCosts}
            onBack={() => goTo(2)}
            onNext={() => goTo(4)}
          />
        )}

        {/* etapa 4: itens de custo, recebe os custos da etapa 3 pra somar no total */}
        {step === 4 && (
          <CostItems
            independentCosts={independentCosts}
            onBack={() => goTo(3)}
            onFinish={handleFinish}
          />
        )}
      </div>
    </PageShell>
  );
}
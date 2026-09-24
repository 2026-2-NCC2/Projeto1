const labels = ['Evento', 'Público e lotes', 'Custos', 'Resumo'];

export function Wizard({ currentStep, onStepClick }) {
  return (
    <nav className="relative z-[5] mx-auto -mt-[22px] mb-5 grid w-[calc(100%-20px)] max-w-[760px] grid-cols-4 rounded-[18px] border border-[#07082e]/[.06] bg-white px-2.5 pb-4 pt-[18px] shadow-[0_16px_45px_rgba(7,8,46,.12)] min-[461px]:-mt-6 min-[461px]:mb-9 min-[461px]:w-[calc(100%-36px)] min-[761px]:px-[22px]" aria-label="Etapas do cadastro">
      {labels.map((label, index) => {
        const step = index + 1;
        const state = step < currentStep ? 'done' : step === currentStep ? 'active' : 'idle';
        const done = state === 'done';
        const active = state === 'active';
        return (
          <div className="relative flex flex-col items-center gap-2" key={label}>
            <button
              type="button"
              className={`relative z-[2] grid size-7 place-items-center rounded-full border-2 bg-white text-[.75rem] font-extrabold min-[461px]:size-8 ${done ? 'cursor-pointer border-[#ffa400] bg-[#ffa400] text-[#07082e]' : active ? 'border-[#ffa400] text-[#07082e] shadow-[0_0_0_6px_rgba(255,164,0,.13)]' : 'cursor-default border-[#c9c3b6] text-[#6b6455]'}`}
              onClick={() => onStepClick?.(step)}
              aria-label={`Ir para ${label}`}
              aria-current={active ? 'step' : undefined}
            >
              {done ? '✓' : step}
            </button>
            <span className={`text-center text-[.6rem] font-bold min-[761px]:text-[.69rem] ${done || active ? 'text-[#060c1c]' : 'text-[#8a8374]'}`}>{label}</span>
            {index < labels.length - 1 && <span className={`absolute left-[calc(50%+18px)] top-[13px] z-[1] h-0.5 w-[calc(100%-36px)] min-[461px]:left-[calc(50%+22px)] min-[461px]:top-[15px] min-[461px]:w-[calc(100%-44px)] ${step < currentStep ? 'bg-[#ffa400]' : 'bg-[#e7dfcd]'}`} />}
          </div>
        );
      })}
    </nav>
  );
}

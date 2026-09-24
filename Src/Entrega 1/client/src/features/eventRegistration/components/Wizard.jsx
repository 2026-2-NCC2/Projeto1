const labels = ['Evento', 'Público e lotes', 'Custos', 'Itens de custos'];

export function Wizard({ currentStep, onStepClick }) {
  return (
    <nav className="wizard" aria-label="Etapas do cadastro">
      {labels.map((label, index) => {
        const step = index + 1;
        const state = step < currentStep ? 'done' : step === currentStep ? 'active' : 'idle';
        return (
          <div className="wizard-item" key={label}>
            <button
              type="button"
              className={`wizard-dot ${state}`}
              onClick={() => onStepClick?.(step)}
              aria-label={`Ir para ${label}`}
              aria-current={state === 'active' ? 'step' : undefined}
            >
              {state === 'done' ? '✓' : step}
            </button>
            <span className={`wizard-label ${state}`}>{label}</span>
            {index < labels.length - 1 && <span className={`wizard-line ${step < currentStep ? 'done' : ''}`} />}
          </div>
        );
      })}
    </nav>
  );
}

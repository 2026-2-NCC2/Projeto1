export function Field({ label, children, hint, required }) {
  return (
    <label className="field">
      <span className="field-label">
        {label}{required && <span className="required">*</span>}
      </span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return <input className="control" {...props} />;
}

export function Select({ children, ...props }) {
  return <select className="control" {...props}>{children}</select>;
}

export function Textarea(props) {
  return <textarea className="control textarea" {...props} />;
}

export function CurrencyInput({ value, onChange, placeholder = '0,00' }) {
  return (
    <div className="money-input">
      <span>R$</span>
      <input
        value={value}
        onChange={onChange}
        inputMode="decimal"
        placeholder={placeholder}
        aria-label="Valor em reais"
      />
    </div>
  );
}

export function FormCard({ eyebrow, title, subtitle, children, footer }) {
  return (
    <section className="form-card">
      <div className="card-accent" />
      <div className="form-card-header">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="form-card-body">{children}</div>
      {footer && <div className="form-card-footer">{footer}</div>}
    </section>
  );
}

export function ActionRow({ onBack, onNext, backLabel = 'Cancelar', nextLabel = 'Salvar e próximo', nextType = 'button' }) {
  return (
    <div className="action-row">
      <button type="button" className="btn btn-secondary" onClick={onBack}>{backLabel}</button>
      <button type={nextType} className="btn btn-primary" onClick={onNext}>{nextLabel}<span aria-hidden="true">→</span></button>
    </div>
  );
}

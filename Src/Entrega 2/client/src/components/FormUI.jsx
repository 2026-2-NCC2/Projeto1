// componentes reutilizados nas 4 etapas do formulario de criar evento

// campo com label, asterisco de obrigatorio, erro e dica
// usa <label> por fora, entao clicar no texto ja foca no campo de dentro
export function Field({ label, children, hint, required, error }) {
  return (
    // o label envolve tudo: texto, campo, erro e dica
    <label className="field">
      {/* texto do campo e o * se for obrigatorio */}
      <span className="field-label">
        {label}{required && <span className="required">*</span>}
      </span>
      {/* aqui entra o input, select, textarea... */}
      {children}
      {/* role="alert" faz o leitor de tela ler o erro assim que aparece */}
      {error && <span className="field-error" role="alert">{error}</span>}
      {/* dica embaixo do campo (se tiver) */}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

// input com o estilo padrao, o resto das props passa direto
export function Input(props) {
  // {...props} = passa tudo que receber (value, onChange, type...) pro input
  return <input className="control" {...props} />;
}

// select com o estilo padrao, as <option> vem pelo children
export function Select({ children, ...props }) {
  return <select className="control" {...props}>{children}</select>;
}

// caixa de texto maior com o estilo padrao
export function Textarea(props) {
  return <textarea className="control textarea" {...props} />;
}

// campo de dinheiro com o "R$" na esquerda
// inputMode decimal abre o teclado numerico no celular
export function CurrencyInput({ value, onChange, placeholder = '0,00' }) {
  return (
    // caixa com o R$ grudado no campo
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

// card de cada etapa: faixinha colorida, cabecalho, conteudo e rodape
// eyebrow, subtitle e footer so aparecem se forem passados
export function FormCard({ eyebrow, title, subtitle, children, footer }) {
  return (
    <section className="form-card">
      {/* faixinha colorida no topo do card (hoje escondida pelo css) */}
      <div className="card-accent" />
      {/* cabecalho: etiqueta (ex: "Etapa 1 de 4"), titulo e subtitulo */}
      <div className="form-card-header">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {/* conteudo da etapa (os campos) */}
      <div className="form-card-body">{children}</div>
      {/* rodape com os botoes (se tiver) */}
      {footer && <div className="form-card-footer">{footer}</div>}
    </section>
  );
}

// botoes de voltar e avancar do rodape do card
// os textos tem valor padrao, mas cada etapa pode trocar
export function ActionRow({ onBack, onNext, backLabel = 'Cancelar', nextLabel = 'Salvar e próximo', nextType = 'button' }) {
  return (
    <div className="action-row">
      {/* botao de voltar/cancelar */}
      <button type="button" className="btn btn-secondary" onClick={onBack}>{backLabel}</button>
      {/* seta so decorativa, aria-hidden esconde do leitor de tela */}
      <button type={nextType} className="btn btn-primary" onClick={onNext}>{nextLabel}<span aria-hidden="true">→</span></button>
    </div>
  );
}
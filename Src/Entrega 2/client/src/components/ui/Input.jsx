/**
 * Input — Campo de formulário com label e erro
 *
 * CONCEITO: Componentes controlados
 * O valor do input é controlado pelo estado React (value + onChange).
 * React é a "fonte de verdade" — não o DOM.
 */
import React from 'react';
import './Input.css';

// campo reutilizavel com label, dica e mensagem de erro
// o ...props pega o resto (value, onChange, type, placeholder...) e passa direto pro <input>
export default function Input({
  label,
  id,
  error,
  hint,
  required,
  className = '',
  ...props
}) {
  return (
    // se tiver erro ganha a classe field--error, que deixa a borda vermelha
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {/* label so aparece se for passado, com asterisco se o campo for obrigatorio */}
      {label && (
        <label htmlFor={id} className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true"> *</span>}
        </label>
      )}
      {/* aria-describedby liga o input ao texto de erro ou dica, pra leitores de tela */}
      {/* aria-invalid avisa que o campo ta com erro */}
      <input
        id={id}
        className="field__input"
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {/* dica so aparece se nao tiver erro, o erro tem prioridade */}
      {hint && !error && <p id={`${id}-hint`} className="field__hint">{hint}</p>}
      {/* role="alert" faz o leitor de tela ler o erro assim que ele aparece */}
      {error && <p id={`${id}-error`} className="field__error" role="alert">{error}</p>}
    </div>
  );
}
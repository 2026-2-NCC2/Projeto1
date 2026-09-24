/**
 * Input — Campo de formulário com label e erro
 *
 * CONCEITO: Componentes controlados
 * O valor do input é controlado pelo estado React (value + onChange).
 * React é a "fonte de verdade" — não o DOM.
 */
import React from 'react';
import './Input.css';

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
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true"> *</span>}
        </label>
      )}
      <input
        id={id}
        className="field__input"
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {hint && !error && <p id={`${id}-hint`} className="field__hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field__error" role="alert">{error}</p>}
    </div>
  );
}

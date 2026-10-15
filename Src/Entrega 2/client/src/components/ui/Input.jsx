/**
 * Input — Campo de formulário com label e erro
 *
 * CONCEITO: Componentes controlados
 * O valor do input é controlado pelo estado React (value + onChange).
 * React é a "fonte de verdade" — não o DOM.
 */
// React = biblioteca usada pra montar as telas
import React from 'react';
// estilos do campo
import './Input.css';

// campo reutilizavel com label, dica e mensagem de erro
// o ...props pega o resto (value, onChange, type, placeholder...) e passa direto pro <input>
export default function Input({
  // texto em cima do campo
  label,
  // id do campo (liga o label ao input)
  id,
  // mensagem de erro (se tiver)
  error,
  // dica embaixo do campo (se tiver)
  hint,
  // true = campo obrigatorio (mostra o *)
  required,
  // classes extras se precisar
  className = '',
  // todo o resto (value, onChange, type...)
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
      {/* o campo em si; o {...props} passa value, onChange etc. direto pra ele */}
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
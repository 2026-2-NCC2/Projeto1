/**
 * Button — Componente de botão reutilizável
 *
 * CONCEITO: Props e Composição
 * Componentes recebem "props" — dados externos.
 * Um componente bem projetado é flexível via props.
 */
import React from 'react';
import './Button.css';

export default function Button({
  children,
  variant = 'primary',   // 'primary' | 'secondary' | 'ghost' | 'danger'
  size    = 'md',        // 'sm' | 'md' | 'lg'
  loading = false,
  disabled,
  fullWidth,
  type = 'button',
  onClick,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      className={[
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth  ? 'btn--full' : '',
        loading    ? 'btn--loading' : '',
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <>
          <span className="btn__spinner" aria-hidden="true" />
          <span>Aguarde...</span>
        </>
      ) : children}
    </button>
  );
}

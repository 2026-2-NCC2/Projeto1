/**
 * Button — Componente de botão reutilizável
 *
 * CONCEITO: Props e Composição
 * Componentes recebem "props" — dados externos.
 * Um componente bem projetado é flexível via props.
 */
import React from 'react';
import './Button.css';

// botao usado no site todo, o visual muda conforme as props
// os valores depois do = sao o padrao caso nao passe nada
export default function Button({
  children,              // o que vai dentro do botao (texto, icone...)
  variant = 'primary',   // 'primary' | 'secondary' | 'ghost' | 'danger'
  size    = 'md',        // 'sm' | 'md' | 'lg'
  loading = false,       // mostra o spinner e bloqueia o clique
  disabled,
  fullWidth,             // ocupa a largura toda
  type = 'button',       // 'button' evita enviar formulario sem querer
  onClick,
  className = '',        // classes extras se precisar
  ...rest                // qualquer outra prop passa direto pro <button>
}) {
  return (
    <button
      type={type}
      // junta as classes numa string so, o filter(Boolean) tira as vazias
      className={[
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth  ? 'btn--full' : '',
        loading    ? 'btn--loading' : '',
        className,
      ].filter(Boolean).join(' ')}
      // fica desativado se passar disabled ou se estiver carregando
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {/* carregando mostra o spinner + "Aguarde...", senao mostra o conteudo normal */}
      {loading ? (
        <>
          <span className="btn__spinner" aria-hidden="true" />
          <span>Aguarde...</span>
        </>
      ) : children}
    </button>
  );
}
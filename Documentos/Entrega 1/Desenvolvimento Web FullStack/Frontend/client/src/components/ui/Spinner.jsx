import React from 'react';
import './Spinner.css';

// indicador de carregamento, o texto padrao e "Carregando..."
export default function Spinner({ text = 'Carregando...' }) {
  return (
    // role="status" avisa pro leitor de tela que algo ta carregando
    <div className="spinner-wrap" role="status" aria-label={text}>
      {/* bolinha girando */}
      <div className="spinner" />
      {/* texto embaixo, so aparece se tiver algum */}
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}
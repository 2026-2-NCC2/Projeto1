import React from 'react';
import './Spinner.css';

export default function Spinner({ text = 'Carregando...' }) {
  return (
    <div className="spinner-wrap" role="status" aria-label={text}>
      <div className="spinner" />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}

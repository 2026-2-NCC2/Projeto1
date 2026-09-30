import React from 'react';
import './Badge.css';

// liga cada status/tipo a uma cor do Badge.css
// pra adicionar um novo e so colocar mais um item aqui
const VARIANTS = {
  pendente:  'badge--pending',
  aprovado:  'badge--success',
  rejeitado: 'badge--danger',
  ativo:     'badge--success',
  inativo:   'badge--muted',
  admin:     'badge--primary',
  organizador: 'badge--primary',
  fornecedor:  'badge--accent',
};

// etiqueta colorida reutilizavel
// label = texto que aparece / variant = qual cor usar
export default function Badge({ label, variant }) {
  // procura a cor pelo variant, se nao achar tenta pelo proprio texto, e se nada der certo fica cinza
  const cls = VARIANTS[variant] || VARIANTS[label?.toLowerCase()] || 'badge--muted';
  return <span className={`badge ${cls}`}>{label}</span>;
}
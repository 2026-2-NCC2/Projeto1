import React from 'react';
import './Badge.css';

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

export default function Badge({ label, variant }) {
  const cls = VARIANTS[variant] || VARIANTS[label?.toLowerCase()] || 'badge--muted';
  return <span className={`badge ${cls}`}>{label}</span>;
}

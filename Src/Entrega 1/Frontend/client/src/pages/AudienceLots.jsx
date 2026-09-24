import { useState } from 'react';
import { ActionRow, CurrencyInput, Field, FormCard, Input } from '../components/FormUI.jsx';

export function AudienceLots({ data, setData, onBack, onNext }) {
  const [errors, setErrors] = useState({});
  const patch = (key) => (e) => {
    setData((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleNext = () => {
    const nextErrors = {};
    if (!String(data.firstLot ?? '').trim()) nextErrors.firstLot = 'Campo obrigatório';
    if (!String(data.maxAudience ?? '').trim()) nextErrors.maxAudience = 'Campo obrigatório';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onNext();
  };

  return (
    <FormCard
      eyebrow="Etapa 2 de 4"
      title="Público e Lotes"
      subtitle="Defina capacidade, quantidade disponível e o preço inicial dos ingressos."
      footer={<ActionRow onBack={onBack} onNext={handleNext} backLabel="Voltar" />}
    >
      <div className="form-grid two-cols">
        <Field label="Lote inicial" required error={errors.firstLot} hint="Preço de abertura das vendas.">
          <CurrencyInput value={data.firstLot} onChange={patch('firstLot')} placeholder="50,00" />
        </Field>
        <Field label="Segundo lote" hint="Opcional. Você pode ajustar depois.">
          <CurrencyInput value={data.secondLot} onChange={patch('secondLot')} placeholder="100,00" />
        </Field>
        <Field label="Público mínimo">
          <Input type="number" min="0" value={data.minAudience} onChange={patch('minAudience')} placeholder="Ex: 300" />
        </Field>
        <Field label="Público máximo" required error={errors.maxAudience}>
          <Input type="number" min="1" value={data.maxAudience} onChange={patch('maxAudience')} placeholder="Ex: 2.000" />
        </Field>
      </div>
      <div className="info-banner">
        <span className="info-icon">i</span>
        <p>O público máximo também pode ser usado como limite inicial de ingressos. Depois você poderá dividir a quantidade por lotes e setores.</p>
      </div>
    </FormCard>
  );
}

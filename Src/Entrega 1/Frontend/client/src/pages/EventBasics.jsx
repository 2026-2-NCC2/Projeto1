import { useState } from 'react';
import { ActionRow, Field, FormCard, Input } from '../components/FormUI.jsx';

export function EventBasics({ data, setData, onBack, onNext }) {
  const [errors, setErrors] = useState({});
  const patch = (key) => (e) => {
    setData((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleNext = () => {
    const nextErrors = {};
    if (!data.name.trim()) nextErrors.name = 'Campo obrigatório';
    if (!data.date) nextErrors.date = 'Campo obrigatório';
    if (!data.startTime) nextErrors.startTime = 'Campo obrigatório';
    if (!data.location.trim()) nextErrors.location = 'Campo obrigatório';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onNext();
  };

  return (
    <FormCard
      eyebrow="Etapa 1 de 4"
      title="Cadastro de Eventos"
      subtitle="Comece pelas informações essenciais que aparecerão para o comprador."
      footer={<ActionRow onBack={onBack} onNext={handleNext} />}
    >
      <div className="form-grid two-cols">
        <Field label="Nome do evento" required error={errors.name}>
          <Input value={data.name} onChange={patch('name')} placeholder="Ex: Festival TrocaTicket 2026" />
        </Field>
        <Field label="Data" required error={errors.date}>
          <Input type="date" value={data.date} onChange={patch('date')} />
        </Field>
        <Field label="Horário de início" required error={errors.startTime}>
          <Input type="time" value={data.startTime} onChange={patch('startTime')} />
        </Field>
        <Field label="Horário de término">
          <Input type="time" value={data.endTime} onChange={patch('endTime')} />
        </Field>
        <Field label="Local" required error={errors.location}>
          <Input value={data.location} onChange={patch('location')} placeholder="Estádio, clube ou teatro" />
        </Field>
        <Field label="Cidade / UF">
          <Input value={data.city} onChange={patch('city')} placeholder="São Paulo, SP" />
        </Field>
      </div>
    </FormCard>
  );
}

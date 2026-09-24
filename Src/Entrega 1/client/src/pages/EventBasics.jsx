import { useState } from 'react';
import { ActionRow, Field, FormCard, Input } from '../components/FormUI.jsx';

export function EventBasics({ data, setData, onChange, onNext }) {
  const [errors, setErrors] = useState({});
  const patch = (key) => (e) => {
  setData((prev) => ({
    ...prev,
    [key]: e.target.value,
  }));

  setErrors((prev) => ({
    ...prev,
    [key]: '',
  }));

  onChange?.();
};

const handleNext = () => {
  const newErrors = {};

  if (!data.name.trim()) {
    newErrors.name = 'Campo obrigatório';
  }

  if (!data.date) {
    newErrors.date = 'Campo obrigatório';
  }

  if (!data.startTime) {
    newErrors.startTime = 'Campo obrigatório';
  }

  if (!data.location.trim()) {
    newErrors.location = 'Campo obrigatório';
  }

  if (!data.city.trim()) {
    newErrors.city = 'Campo obrigatório';
  }

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    return;
  }

  onNext();
};

  return (
    <FormCard
      eyebrow="Etapa 1 de 4"
      title="Cadastro de Eventos"
      subtitle="Comece pelas informações essenciais que aparecerão para o comprador."
      scrollable
      footer={<ActionRow onBack={() => history.back()}onNext={handleNext}/>}
    >
      <div className="grid grid-cols-1 gap-5 min-[761px]:grid-cols-2">
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
        <Field label="Cidade / UF" required error={errors.city}>
          <Input value={data.city} onChange={patch('city')} placeholder="São Paulo, SP" />
        </Field>
      </div>
    </FormCard>
  );
}

import { ActionRow, Field, FormCard, Input } from '../components/FormUI.jsx';

export function EventBasics({ data, setData, onBack, onNext }) {
  const patch = (key) => (e) => setData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <FormCard
      eyebrow="Etapa 1 de 4"
      title="Cadastro de Eventos"
      subtitle="Comece pelas informações essenciais que aparecerão para o comprador."
      footer={<ActionRow onBack={onBack} onNext={onNext} />}
    >
      <div className="form-grid two-cols">
        <Field label="Nome do evento" required>
          <Input value={data.name} onChange={patch('name')} placeholder="Ex: Festival TrocaTicket 2026" />
        </Field>
        <Field label="Data" required>
          <Input type="date" value={data.date} onChange={patch('date')} />
        </Field>
        <Field label="Horário de início" required>
          <Input type="time" value={data.startTime} onChange={patch('startTime')} />
        </Field>
        <Field label="Horário de término">
          <Input type="time" value={data.endTime} onChange={patch('endTime')} />
        </Field>
        <Field label="Local" required>
          <Input value={data.location} onChange={patch('location')} placeholder="Estádio, clube ou teatro" />
        </Field>
        <Field label="Cidade / UF">
          <Input value={data.city} onChange={patch('city')} placeholder="São Paulo, SP" />
        </Field>
      </div>
    </FormCard>
  );
}

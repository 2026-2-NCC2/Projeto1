import { useState } from 'react';
import { ActionRow, Field, FormCard, Input } from '../components/FormUI.jsx';

// etapa 1 do formulario de criar evento: informacoes basicas
// data/setData = dados do form que vem do componente pai / onBack e onNext = voltar e avancar etapa
export function EventBasics({ data, setData, onBack, onNext }) {
  // guarda as mensagens de erro de cada campo
  const [errors, setErrors] = useState({});

  // funcao generica pra atualizar qualquer campo, e so passar o nome dele
  // quando o usuario digita, ja limpa o erro daquele campo
  const patch = (key) => (e) => {
    setData((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  // valida os campos obrigatorios antes de ir pra proxima etapa
  const handleNext = () => {
    const nextErrors = {};
    if (!data.name.trim()) nextErrors.name = 'Campo obrigatório';
    if (!data.date) nextErrors.date = 'Campo obrigatório';
    if (!data.startTime) nextErrors.startTime = 'Campo obrigatório';
    if (!data.location.trim()) nextErrors.location = 'Campo obrigatório';
    setErrors(nextErrors);
    // so avanca se nao tiver nenhum erro
    if (Object.keys(nextErrors).length === 0) onNext();
  };

  return (
    // card padrao das etapas do formulario
    <FormCard
      eyebrow="Etapa 1 de 4"
      title="Cadastro de Eventos"
      subtitle="Comece pelas informações essenciais que aparecerão para o comprador."
      footer={<ActionRow onBack={onBack} onNext={handleNext} />}
    >
      {/* campos em 2 colunas */}
      <div className="form-grid two-cols">
        <Field label="Nome do evento" required error={errors.name}>
          <Input value={data.name} onChange={patch('name')} placeholder="Ex: Festival TrocaTicket 2026" />
        </Field>

        {/* data e horarios usam os seletores nativos do navegador */}
        <Field label="Data" required error={errors.date}>
          <Input type="date" value={data.date} onChange={patch('date')} />
        </Field>
        <Field label="Horário de início" required error={errors.startTime}>
          <Input type="time" value={data.startTime} onChange={patch('startTime')} />
        </Field>
        {/* horario de termino e opcional */}
        <Field label="Horário de término">
          <Input type="time" value={data.endTime} onChange={patch('endTime')} />
        </Field>

        {/* onde vai ser o evento, so o local e obrigatorio */}
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
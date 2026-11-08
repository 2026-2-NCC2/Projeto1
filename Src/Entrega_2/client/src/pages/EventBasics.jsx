import { useState } from 'react';
import { ActionRow, Field, FormCard, Input } from '../components/FormUI.jsx';

// etapa 1 do formulario de criar evento: informacoes basicas
// data/setData = dados do form que vem do componente pai / onBack e onNext = voltar e avancar etapa
export function EventBasics({ data, setData, onBack, onNext }) {
  // guarda as mensagens de erro de cada campo
  const [errors, setErrors] = useState({});
  // data de hoje no formato YYYY-MM-DD, usando o horário local
  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

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

    if (!data.date) {
      nextErrors.date = 'Campo obrigatório';
    } else if (data.date < getToday()) {
      nextErrors.date = 'A data do evento não pode estar no passado';
    }

    // o servidor (POST /eventos) exige todos estes campos, entao o front avisa logo aqui
    if (!data.startTime) nextErrors.startTime = 'Campo obrigatório';
    if (!data.endTime) nextErrors.endTime = 'Campo obrigatório';
    if (!data.location.trim()) nextErrors.location = 'Campo obrigatório';
    if (!data.city.trim()) nextErrors.city = 'Campo obrigatório';

    setErrors(nextErrors);

    // só avança se não tiver nenhum erro
    if (Object.keys(nextErrors).length === 0) onNext();
  };

  return (
    // card padrao das etapas do formulario
    <FormCard
      gel="indigo"
      title="Cadastro de Eventos"
      subtitle="Comece pelas informações essenciais que aparecerão para o comprador."
      footer={<ActionRow onBack={onBack} onNext={handleNext} />}
    >
      {/* campos em 2 colunas */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome do evento" required error={errors.name}>
          <Input value={data.name} onChange={patch('name')} placeholder="Ex: Festival TrocaTicket 2026" maxLength={150} />
        </Field>

        {/* data e horarios usam os seletores nativos do navegador */}
        <Field label="Data" required error={errors.date}>
           <Input type="date" min={getToday()} value={data.date} onChange={patch('date')} />
        </Field>
        <Field label="Horário de início" required error={errors.startTime}>
          <Input type="time" value={data.startTime} onChange={patch('startTime')} />
        </Field>
        {/* se o termino for antes do inicio (ex: 22:00 ate 02:00), o servidor entende que acaba no dia seguinte */}
        <Field label="Horário de término" required error={errors.endTime}>
          <Input type="time" value={data.endTime} onChange={patch('endTime')} />
        </Field>

        {/* onde vai ser o evento */}
        <Field label="Local" required error={errors.location}>
          <Input value={data.location} onChange={patch('location')} placeholder="Estádio, clube ou teatro" maxLength={150} />
        </Field>
        <Field label="Cidade / UF" required error={errors.city}>
          <Input value={data.city} onChange={patch('city')} placeholder="São Paulo, SP" maxLength={45} />
        </Field>
      </div>
    </FormCard>
  );
}
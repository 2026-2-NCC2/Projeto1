import { useState } from 'react';
import { ActionRow, CurrencyInput, Field, FormCard, Input } from '../components/FormUI.jsx';

// etapa do formulario de criar evento: publico e lotes
// data/setData = dados do form que vem do componente pai / onBack e onNext = voltar e avancar etapa
export function AudienceLots({ data, setData, onBack, onNext }) {
  // guarda as mensagens de erro de cada campo
  const [errors, setErrors] = useState({});

  // funcao generica pra atualizar qualquer campo, e so passar o nome dele
  // quando o usuario digita, ja limpa o erro daquele campo
  const patch = (key) => (e) => {
    setData((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  // valida antes de ir pra proxima etapa
  const handleNext = () => {
    const nextErrors = {};
    // String + trim pra nao aceitar campo vazio ou so com espaco
    if (!String(data.firstLot ?? '').trim()) nextErrors.firstLot = 'Campo obrigatório';
    if (!String(data.maxAudience ?? '').trim()) nextErrors.maxAudience = 'Campo obrigatório';
    setErrors(nextErrors);
    // so avanca se nao tiver nenhum erro
    if (Object.keys(nextErrors).length === 0) onNext();
  };

  return (
    // card padrao das etapas do formulario
    // footer = botoes de voltar e avancar (o avancar passa pela validacao)
    <FormCard
      eyebrow="Etapa 2 de 4"
      title="Público e Lotes"
      subtitle="Defina capacidade, quantidade disponível e o preço inicial dos ingressos."
      footer={<ActionRow onBack={onBack} onNext={handleNext} backLabel="Voltar" />}
    >
      {/* campos em 2 colunas */}
      <div className="form-grid two-cols">
        {/* precos dos lotes, so o primeiro e obrigatorio */}
        <Field label="Lote inicial" required error={errors.firstLot} hint="Preço de abertura das vendas.">
          <CurrencyInput value={data.firstLot} onChange={patch('firstLot')} placeholder="50,00" />
        </Field>
        <Field label="Segundo lote" hint="Opcional. Você pode ajustar depois.">
          <CurrencyInput value={data.secondLot} onChange={patch('secondLot')} placeholder="100,00" />
        </Field>
        {/* capacidade do evento, so o maximo e obrigatorio */}
        <Field label="Público mínimo">
          <Input type="number" min="0" value={data.minAudience} onChange={patch('minAudience')} placeholder="Ex: 300" />
        </Field>
        <Field label="Público máximo" required error={errors.maxAudience}>
          <Input type="number" min="1" value={data.maxAudience} onChange={patch('maxAudience')} placeholder="Ex: 2.000" />
        </Field>
      </div>
      {/* aviso explicando pra que serve o publico maximo */}
      <div className="info-banner">
        <span className="info-icon">i</span>
        <p>O público máximo também pode ser usado como limite inicial de ingressos. Depois você poderá dividir a quantidade por lotes e setores.</p>
      </div>
    </FormCard>
  );
}

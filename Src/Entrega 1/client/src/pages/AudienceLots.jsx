import { useState } from 'react';
import {
  ActionRow,
  CurrencyInput,
  Field,
  FormCard,
  Input
} from '../components/FormUI.jsx';

export function AudienceLots({ data, setData, onChange, onNext }) {
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

    if (!String(data.firstLot ?? '').trim()) {
      newErrors.firstLot = 'Campo obrigatório';
    }

    if (!String(data.maxAudience ?? '').trim()) {
      newErrors.maxAudience = 'Campo obrigatório';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    onNext();
  };

  return (
    <FormCard
      eyebrow="Etapa 2 de 4"
      title="Público e Lotes"
      subtitle="Defina capacidade, quantidade disponível e o preço inicial dos ingressos."
      scrollable
      footer={
        <ActionRow
          onBack={() => history.back()}
          onNext={handleNext}
        />
      }
    >
      <div className="grid grid-cols-1 gap-5 min-[761px]:grid-cols-2">

        <Field
          label="Lote inicial"
          required
          error={errors.firstLot}
          hint="Preço de abertura das vendas."
        >
          <CurrencyInput
            value={data.firstLot}
            onChange={patch('firstLot')}
            placeholder="50,00"
          />
        </Field>

        <Field
          label="Segundo lote"
          hint="Opcional. Você pode ajustar depois."
        >
          <CurrencyInput
            value={data.secondLot}
            onChange={patch('secondLot')}
            placeholder="100,00"
          />
        </Field>

        <Field label="Público mínimo">
          <Input
            type="number"
            min="0"
            value={data.minAudience}
            onChange={patch('minAudience')}
            placeholder="Ex: 300"
          />
        </Field>

        <Field
          label="Público máximo"
          required
          error={errors.maxAudience}
        >
          <Input
            type="number"
            min="1"
            value={data.maxAudience}
            onChange={patch('maxAudience')}
            placeholder="Ex: 2.000"
          />
        </Field>

      </div>

      <div className="mt-[22px] flex gap-3 rounded-xl border border-[#f2dba9] bg-[#fff8e9] px-4 py-3.5 text-[#685c43]">
        <span className="grid size-[23px] shrink-0 place-items-center rounded-full bg-[#ffa400] font-serif font-black text-[#07082e]">i</span>

        <p className="m-0 text-[.78rem] leading-[1.5]">
          O público máximo também pode ser usado como limite inicial de
          ingressos. Depois você poderá dividir a quantidade por lotes e setores.
        </p>
      </div>
    </FormCard>
  );
}
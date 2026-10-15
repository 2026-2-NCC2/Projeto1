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

    const validate = (value, required, pattern) => {
      const text = String(value ?? '').trim();

      if (!text) return required ? 'Campo obrigatório.' : null;
      if (!pattern.test(text)) return 'caractere invalido.';

      return null;
    };

    // Preços: aceita 50, 50,00 ou 50.00
    const pricePattern = /^\d+(?:[.,]\d{1,2})?$/;

    // Público: aceita apenas números inteiros
    const audiencePattern = /^\d+$/;

    const validations = {
      firstLot: validate(data.firstLot, true, pricePattern),
      secondLot: validate(data.secondLot, false, pricePattern),
      minAudience: validate(data.minAudience, false, audiencePattern),
      maxAudience: validate(data.maxAudience, true, audiencePattern),
    };

    Object.entries(validations).forEach(([field, error]) => {
      if (error) nextErrors[field] = error;
    });

    if (!nextErrors.maxAudience && Number(data.maxAudience) < 1) {
      nextErrors.maxAudience = 'O público máximo deve ser pelo menos 1.';
    }

    const hasMinAudience = String(data.minAudience ?? '').trim() !== '';

    if (
      hasMinAudience &&
      !nextErrors.minAudience &&
      !nextErrors.maxAudience &&
      Number(data.minAudience) > Number(data.maxAudience)
    ) {
      nextErrors.minAudience =
        'O público mínimo não pode ser maior que o público máximo.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) onNext();
  };

  return (
    <FormCard
      eyebrow="Etapa 2 de 4"
      title="Público e Lotes"
      subtitle="Defina capacidade, quantidade disponível e o preço inicial dos ingressos."
      footer={
        <ActionRow
          onBack={onBack}
          onNext={handleNext}
          backLabel="Voltar"
        />
      }
    >
      <div className="form-grid two-cols">
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
          error={errors.secondLot}
          hint="Opcional. Você pode ajustar depois."
        >
          <CurrencyInput
            value={data.secondLot}
            onChange={patch('secondLot')}
            placeholder="100,00"
          />
        </Field>

        <Field label="Público mínimo" error={errors.minAudience}>
          <Input
            type="text"
            inputMode="numeric"
            value={data.minAudience ?? ''}
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
            type="text"
            inputMode="numeric"
            value={data.maxAudience ?? ''}
            onChange={patch('maxAudience')}
            placeholder="Ex: 2000"
          />
        </Field>
      </div>

      <div className="info-banner">
        <span className="info-icon">i</span>
        <p>
          O público máximo também pode ser usado como limite inicial de
          ingressos. Depois você poderá dividir a quantidade por lotes e setores.
        </p>
      </div>
    </FormCard>
  );
}
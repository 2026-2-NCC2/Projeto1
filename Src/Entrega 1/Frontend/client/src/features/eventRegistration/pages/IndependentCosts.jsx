import { useState } from 'react';
import { ActionRow, CurrencyInput, Field, FormCard, Select, Textarea } from '../components/FormUI.jsx';

const initialDraft = { type: 'Fiscal', description: '', value: '' };

export function IndependentCosts({ costs, setCosts, onBack, onNext }) {
  const [draft, setDraft] = useState(initialDraft);
  const patch = (key) => (e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }));

  function addCost() {
    if (!draft.description.trim() || !draft.value.trim()) return;
    setCosts((prev) => [...prev, { ...draft, id: crypto.randomUUID() }]);
    setDraft(initialDraft);
  }

  function removeCost(id) {
    setCosts((prev) => prev.filter((cost) => cost.id !== id));
  }

  return (
    <FormCard
      eyebrow="Etapa 3 de 4"
      title="Custos Independentes"
      subtitle="Registre taxas, licenças e despesas que não pertencem a uma categoria operacional."
      footer={<ActionRow onBack={onBack} onNext={onNext} backLabel="Voltar" />}
    >
      <div className="form-grid">
        <Field label="Tipo de custo">
          <Select value={draft.type} onChange={patch('type')}>
            <option>Fiscal</option>
            <option>Licença</option>
            <option>Taxa</option>
            <option>Serviço</option>
            <option>Outro</option>
          </Select>
        </Field>
        <Field label="Descrição">
          <Textarea rows="4" value={draft.description} onChange={patch('description')} placeholder="Ex: Taxa municipal para realização do evento" />
        </Field>
        <Field label="Valor da despesa">
          <CurrencyInput value={draft.value} onChange={patch('value')} />
        </Field>
        <button type="button" className="btn btn-ghost add-button" onClick={addCost}>+ Adicionar outro tipo de custo</button>
      </div>

      {costs.length > 0 && (
        <div className="cost-list compact-list">
          <h2>Custos adicionados</h2>
          {costs.map((cost) => (
            <div className="cost-row" key={cost.id}>
              <div>
                <strong>{cost.type}</strong>
                <span>{cost.description}</span>
              </div>
              <div className="cost-row-right">
                <strong>R$ {cost.value}</strong>
                <button type="button" className="icon-button" onClick={() => removeCost(cost.id)} aria-label="Remover custo">×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </FormCard>
  );
}

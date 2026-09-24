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
      <div className="grid gap-5">
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
        <button type="button" className="-mt-1 min-h-[42px] cursor-pointer justify-self-end rounded-[10px] border-0 bg-[#12275c] px-4 py-2.5 text-[.78rem] font-extrabold text-white transition-transform duration-150 hover:-translate-y-px" onClick={addCost}>+ Adicionar outro tipo de custo</button>
      </div>

      {costs.length > 0 && (
        <div className="mt-7 border-t border-[#e7dfcd] pt-6">
          <h2 className="mb-3 mt-0 text-[.95rem] text-[#07082e]">Custos adicionados</h2>
          {costs.map((cost) => (
            <div className="flex items-center justify-between gap-[18px] border-b border-[#e7dfcd] py-3 max-[460px]:items-start" key={cost.id}>
              <div className="grid gap-[3px]">
                <strong>{cost.type}</strong>
                <span className="text-[.75rem] text-[#6b6455]">{cost.description}</span>
              </div>
              <div className="flex items-center gap-2.5 whitespace-nowrap max-[460px]:flex-col max-[460px]:items-end">
                <strong className="text-[.8rem]">R$ {cost.value}</strong>
                <button type="button" className="size-[30px] cursor-pointer rounded-lg border-0 bg-[#f5efe3] font-black text-[#786e5c] hover:bg-[#f2dfd9] hover:text-[#a53c30]" onClick={() => removeCost(cost.id)} aria-label="Remover custo">×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </FormCard>
  );
}

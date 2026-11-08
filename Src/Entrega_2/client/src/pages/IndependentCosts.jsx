import { useState } from 'react';
import {
  ActionRow,
  CurrencyInput,
  Field,
  FormCard,
  Select,
  Textarea,
} from '../components/FormUI.jsx';
import { IconMais, IconX } from '../components/ui/Icones';
import { btn } from '../components/ui/estilos';

// valores iniciais do formulario, usado tambem pra limpar depois de adicionar
const initialDraft = { type: 'Fiscal', description: '', value: '' };

// etapa 3 do formulario de criar evento: custos que nao entram em nenhuma categoria
// costs/setCosts = lista de custos que fica no componente pai / onBack e onNext = voltar e avancar etapa
export function IndependentCosts({ costs, setCosts, onBack, onNext }) {
  // o que ta sendo digitado antes de adicionar
  const [draft, setDraft] = useState(initialDraft);
  const [errors, setErrors] = useState({});
  // atualiza qualquer campo do rascunho pelo nome
  const patch = (key) => (e) => {
    setDraft((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  // adiciona o custo na lista
  function addCost() {
    const value = String(draft.value ?? '').trim();

    // Só valida se o valor estiver preenchido
    if (value && !/^\d+(?:[.,]\d{1,2})?$/.test(value)) {
      setErrors({ value: 'caractere invalido.' });
      return;
    }

    setErrors({});

    // Sem descrição ou valor, não adiciona nada e não mostra erro
    if (!draft.description.trim() || !value) return;

    setCosts((prev) => [...prev, { ...draft, value, id: crypto.randomUUID() }]);

    setDraft(initialDraft);
  }
  // remove um custo da lista pelo id
  function removeCost(id) {
    setCosts((prev) => prev.filter((cost) => cost.id !== id));
  }

  return (
    // card padrao das etapas do formulario
    <FormCard
      gel="ceu"
      title="Custos Independentes"
      subtitle="Registre taxas, licenças e despesas que não pertencem a uma categoria operacional."
      footer={
        <ActionRow
          onBack={onBack}
          onNext={onNext}
          backLabel="Voltar"
          nextLabel="Ir para itens de custos"
        />
      }
    >
      {/* formulario pra adicionar um custo */}
      <div className="grid gap-5">
        {/* tipo do custo, comeca em "Fiscal" */}
        <Field label="Tipo de custo">
          <Select value={draft.type} onChange={patch('type')}>
            <option>Fiscal</option>
            <option>Operacional</option>
            <option>Variável</option>
            <option>Licença</option>
            <option>Taxa</option>
            <option>Serviço</option>
            <option>Outro</option>
          </Select>
        </Field>
        <Field label="Descrição" error={errors.description}>
          <Textarea
            rows="4"
            value={draft.description}
            onChange={patch('description')}
            placeholder="Ex: Taxa municipal para realização do evento"
          />
        </Field>
        <Field
          label={draft.type === 'Variável' ? 'Valor por participante (R$)' : 'Valor da despesa'}
          error={errors.value}
          hint={draft.type === 'Variável' ? 'Custo que cresce com o público (ex.: copo, kit, seguro por pessoa). Entra no ticket multiplicado pelo número de participantes.' : undefined}
        >
          <CurrencyInput value={draft.value} onChange={patch('value')} />
        </Field>
        {/* botao de adicionar, fica alinhado na direita */}
        <button
          type="button"
          className={`${btn('tinta')} justify-self-end max-sm:w-full`}
          onClick={addCost}
        >
          <IconMais /> Adicionar outro tipo de custo
        </button>
      </div>

      {/* lista dos custos ja adicionados, so aparece se tiver algum */}
      {costs.length > 0 && (
        <div className="mt-8 border-t border-tinta/10 pt-6">
          <h2 className="mb-2 text-base font-extrabold">
            Custos adicionados
          </h2>
          {costs.map((cost) => (
            // no celular o valor e o botao ficam um embaixo do outro
            <div
              className="flex items-center justify-between gap-5 border-b border-tinta/10 py-3.5 last:border-b-0 max-[460px]:items-start"
              key={cost.id}
            >
              {/* tipo e descricao na esquerda */}
              <div className="grid min-w-0 gap-1">
                <span className="w-fit rounded-none bg-gel-indigo/30 px-2 py-0.5 text-xs font-semibold text-gel-indigo-forte">{cost.type}</span>
                <span className="break-words text-sm text-tinta/70">
                  {cost.description}
                </span>
              </div>
              {/* valor e botao de remover na direita */}
              <div className="flex items-center gap-2.5 whitespace-nowrap max-[460px]:flex-col max-[460px]:items-end">
                <strong className="tabular text-[15px]">R$ {cost.value}</strong>
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-none text-tinta/55 transition-colors hover:bg-gel-rubi hover:text-white"
                  onClick={() => removeCost(cost.id)}
                  aria-label="Remover custo"
                >
                  <IconX />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </FormCard>
  );
}

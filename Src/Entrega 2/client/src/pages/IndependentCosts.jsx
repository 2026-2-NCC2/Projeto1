// useState = guarda o que a pessoa esta digitando
import { useState } from 'react';
// pecas prontas do formulario (botoes, campo de dinheiro, campo, card, lista de opcoes e caixa de texto)
import { ActionRow, CurrencyInput, Field, FormCard, Select, Textarea } from '../components/FormUI.jsx';

// valores iniciais do formulario, usado tambem pra limpar depois de adicionar
const initialDraft = { type: 'Fiscal', description: '', value: '' };

// etapa 3 do formulario de criar evento: custos que nao entram em nenhuma categoria
// costs/setCosts = lista de custos que fica no componente pai / onBack e onNext = voltar e avancar etapa
export function IndependentCosts({ costs, setCosts, onBack, onNext }) {
  // o que ta sendo digitado antes de adicionar
  const [draft, setDraft] = useState(initialDraft);
  // atualiza qualquer campo do rascunho pelo nome
  const patch = (key) => (e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }));

  // adiciona o custo na lista
  function addCost() {
    // nao adiciona se faltar descricao ou valor
    if (!draft.description.trim() || !draft.value.trim()) return;
    // coloca o custo novo no fim da lista com um id unico
    setCosts((prev) => [...prev, { ...draft, id: crypto.randomUUID() }]);
    // limpa o formulario
    setDraft(initialDraft);
  }

  // remove um custo da lista pelo id
  function removeCost(id) {
    // filter = fica com todos os custos menos o do id que foi removido
    setCosts((prev) => prev.filter((cost) => cost.id !== id));
  }

  return (
    // card padrao das etapas do formulario
    <FormCard
      eyebrow="Etapa 3 de 4"
      title="Custos Independentes"
      subtitle="Registre taxas, licenças e despesas que não pertencem a uma categoria operacional."
      footer={<ActionRow onBack={onBack} onNext={onNext} backLabel="Voltar" />}
    >
      {/* formulario pra adicionar um custo */}
      <div className="grid gap-5">
        {/* tipo do custo, comeca em "Fiscal" */}
        <Field label="Tipo de custo">
          <Select value={draft.type} onChange={patch('type')}>
            <option>Fiscal</option>
            <option>Licença</option>
            <option>Taxa</option>
            <option>Serviço</option>
            <option>Outro</option>
          </Select>
        </Field>
        {/* explicacao do custo */}
        <Field label="Descrição">
          <Textarea rows="4" value={draft.description} onChange={patch('description')} placeholder="Ex: Taxa municipal para realização do evento" />
        </Field>
        {/* quanto custa */}
        <Field label="Valor da despesa">
          <CurrencyInput value={draft.value} onChange={patch('value')} />
        </Field>
        {/* botao de adicionar, fica alinhado na direita */}
        <button type="button" className="-mt-1 min-h-[42px] cursor-pointer justify-self-end rounded-lg border-0 bg-[image:var(--tt-gradiente-botao)] px-5 py-2.5 text-[.78rem] font-bold text-tt-branco transition duration-150 hover:brightness-110 hover:shadow-[0_8px_20px_color-mix(in_srgb,var(--tt-rosa-principal)_30%,transparent)]" onClick={addCost}>+ Adicionar outro tipo de custo</button>
      </div>

      {/* lista dos custos ja adicionados, so aparece se tiver algum */}
      {costs.length > 0 && (
        <div className="mt-7 border-t border-tt-azul-marinho/12 pt-6">
          {/* titulo da lista */}
          <h2 className="mb-3 mt-0 text-[.95rem] text-tt-azul-marinho">Custos adicionados</h2>
          {/* uma linha pra cada custo adicionado */}
          {costs.map((cost) => (
            // no celular o valor e o botao ficam um embaixo do outro
            <div className="flex items-center justify-between gap-[18px] border-b border-tt-azul-marinho/12 py-3 max-[460px]:items-start" key={cost.id}>
              {/* tipo e descricao na esquerda */}
              <div className="grid gap-[3px]">
                <strong>{cost.type}</strong>
                <span className="text-[.75rem] text-tt-grafite/70">{cost.description}</span>
              </div>
              {/* valor e botao de remover na direita */}
              <div className="flex items-center gap-2.5 whitespace-nowrap max-[460px]:flex-col max-[460px]:items-end">
                <strong className="text-[.8rem]">R$ {cost.value}</strong>
                {/* botao × que remove esse custo */}
                <button type="button" className="size-[30px] cursor-pointer rounded-lg border-0 bg-tt-cinza-claro font-black text-tt-grafite/70 hover:bg-tt-rosa-claro hover:text-tt-rosa-principal" onClick={() => removeCost(cost.id)} aria-label="Remover custo">×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </FormCard>
  );
}
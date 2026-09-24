import { useMemo, useState } from 'react';
import { ActionRow, FormCard } from '../components/FormUI.jsx';

const money = (value) => Number(String(value).replace('.', '').replace(',', '.')) || 0;
const formatBRL = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const seed = [
  {
    name: 'Iluminação',
    items: [
      { id: 'l1', description: 'Painel LED RGB', qty: 4, unit: 250 },
      { id: 'l2', description: 'Bola de Discoteca LED', qty: 2, unit: 300 },
    ],
  },
  { name: 'Alimentação', items: [{ id: 'a1', description: 'Camarim / equipe', qty: 1, unit: 1600 }] },
  { name: 'Bebidas', items: [{ id: 'b1', description: 'Bar e estoque inicial', qty: 1, unit: 3200 }] },
  { name: 'Segurança', items: [] },
  { name: 'Estrutura', items: [{ id: 'e1', description: 'Palco, grades e apoio', qty: 1, unit: 11200 }] },
];

export function CostItems({ independentCosts, onBack, onFinish }) {
  const [groups, setGroups] = useState(seed);
  const [open, setOpen] = useState('Iluminação');
  const [drafts, setDrafts] = useState({});

  const independentTotal = useMemo(() => independentCosts.reduce((sum, item) => sum + money(item.value), 0), [independentCosts]);
  const categoryTotal = useMemo(
    () => groups.reduce((sum, group) => sum + group.items.reduce((s, item) => s + item.qty * item.unit, 0), 0),
    [groups],
  );

  function groupTotal(group) {
    return group.items.reduce((sum, item) => sum + item.qty * item.unit, 0);
  }

  function changeDraft(group, key, value) {
    setDrafts((prev) => ({ ...prev, [group]: { description: '', qty: '1', unit: '', ...prev[group], [key]: value } }));
  }

  function addItem(groupName) {
    const draft = { description: '', qty: '1', unit: '', ...drafts[groupName] };
    if (!draft.description.trim() || !draft.unit) return;
    setGroups((prev) => prev.map((group) => group.name === groupName ? {
      ...group,
      items: [...group.items, {
        id: crypto.randomUUID(),
        description: draft.description,
        qty: Math.max(1, Number(draft.qty) || 1),
        unit: money(draft.unit),
      }],
    } : group));
    setDrafts((prev) => ({ ...prev, [groupName]: { description: '', qty: '1', unit: '' } }));
  }

  function removeItem(groupName, id) {
    setGroups((prev) => prev.map((group) => group.name === groupName ? { ...group, items: group.items.filter((item) => item.id !== id) } : group));
  }

  const footer = (
    <ActionRow onBack={onBack} onNext={() => onFinish?.({ groups, total: categoryTotal + independentTotal })} backLabel="Voltar" nextLabel="Finalizar cadastro" />
  );

  return (
    <FormCard
      eyebrow="Etapa 4 de 4"
      title="Itens de custos"
      subtitle="Detalhe os gastos por categoria e acompanhe o total estimado do evento."
      footer={footer}
    >
      <div className="budget-summary">
        <div><span>Custos categorizados</span><strong>{formatBRL(categoryTotal)}</strong></div>
        <div><span>Custos independentes</span><strong>{formatBRL(independentTotal)}</strong></div>
        <div className="budget-total"><span>Total estimado</span><strong>{formatBRL(categoryTotal + independentTotal)}</strong></div>
      </div>

      <div className="accordion-list">
        {groups.map((group) => {
          const isOpen = open === group.name;
          const draft = { description: '', qty: '1', unit: '', ...drafts[group.name] };
          return (
            <section className={`cost-group ${isOpen ? 'open' : ''}`} key={group.name}>
              <button className="cost-group-head" type="button" onClick={() => setOpen(isOpen ? '' : group.name)}>
                <span><strong>{group.name}</strong><small>{group.items.length} {group.items.length === 1 ? 'item' : 'itens'}</small></span>
                <span><b>{formatBRL(groupTotal(group))}</b><i>{isOpen ? '−' : '+'}</i></span>
              </button>

              {isOpen && (
                <div className="cost-group-body">
                  {group.items.length > 0 && (
                    <div className="cost-table">
                      <div className="cost-table-head"><span>Descrição</span><span>Qtd.</span><span>Unitário</span><span>Total</span><span /></div>
                      {group.items.map((item) => (
                        <div className="cost-table-row" key={item.id}>
                          <span>{item.description}</span>
                          <span>{item.qty}</span>
                          <span>{formatBRL(item.unit)}</span>
                          <span><strong>{formatBRL(item.qty * item.unit)}</strong></span>
                          <span><button className="icon-button" onClick={() => removeItem(group.name, item.id)} aria-label="Remover item">×</button></span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="inline-add">
                    <input placeholder={`Adicionar item de ${group.name.toLowerCase()}`} value={draft.description} onChange={(e) => changeDraft(group.name, 'description', e.target.value)} />
                    <input className="qty" type="number" min="1" placeholder="Qtd." value={draft.qty} onChange={(e) => changeDraft(group.name, 'qty', e.target.value)} />
                    <div className="inline-money"><span>R$</span><input inputMode="decimal" placeholder="0,00" value={draft.unit} onChange={(e) => changeDraft(group.name, 'unit', e.target.value)} /></div>
                    <button type="button" className="btn btn-small" onClick={() => addItem(group.name)}>Adicionar</button>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </FormCard>
  );
}

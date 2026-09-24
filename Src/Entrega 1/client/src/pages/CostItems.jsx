import { useMemo, useState } from 'react';
import { ActionRow, FormCard } from '../components/FormUI.jsx';

const money = (value) => Number(String(value).replace('.', '').replace(',', '.')) || 0;
const formatBRL = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const seed = [
  { name: 'Iluminação', items: [] },
  { name: 'Alimentação', items: [] },
  { name: 'Bebidas', items: [] },
  { name: 'Segurança', items: [] },
  { name: 'Estrutura', items: [] },
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
      <div className="mb-6 grid grid-cols-1 gap-3 min-[761px]:grid-cols-3">
        <div className="grid gap-1 rounded-xl border border-[#e7dfcd] bg-[#faf7f0] px-4 py-[15px]"><span className="text-[.68rem] font-bold text-[#6b6455]">Custos categorizados</span><strong className="text-base text-[#07082e]">{formatBRL(categoryTotal)}</strong></div>
        <div className="grid gap-1 rounded-xl border border-[#e7dfcd] bg-[#faf7f0] px-4 py-[15px]"><span className="text-[.68rem] font-bold text-[#6b6455]">Custos independentes</span><strong className="text-base text-[#07082e]">{formatBRL(independentTotal)}</strong></div>
        <div className="grid gap-1 rounded-xl border border-[#07082e] bg-[#07082e] px-4 py-[15px]"><span className="text-[.68rem] font-bold text-white/65">Total estimado</span><strong className="text-base text-[#ffa400]">{formatBRL(categoryTotal + independentTotal)}</strong></div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-[#e7dfcd]">
        {groups.map((group) => {
          const isOpen = open === group.name;
          const draft = { description: '', qty: '1', unit: '', ...drafts[group.name] };
          return (
            <section className="border-t border-[#e7dfcd] first:border-t-0" key={group.name}>
              <button className={`flex w-full cursor-pointer items-center justify-between gap-4 border-0 px-4 py-[15px] text-left ${isOpen ? 'bg-[#fffaf0]' : 'bg-white'}`} type="button" onClick={() => setOpen(isOpen ? '' : group.name)}>
                <span className="flex items-center gap-2.5"><strong className="text-[.84rem] text-[#07082e]">{group.name}</strong><small className="text-[.65rem] text-[#6b6455]">{group.items.length} {group.items.length === 1 ? 'item' : 'itens'}</small></span>
                <span className="flex items-center gap-2.5"><b className="text-[.77rem] text-[#07082e]">{formatBRL(groupTotal(group))}</b><i className="grid size-6 place-items-center rounded-full bg-[#f2eadb] not-italic font-black text-[#331166]">{isOpen ? '−' : '+'}</i></span>
              </button>

              {isOpen && (
                <div className="bg-[#fffaf0] px-4 pb-4">
                  {group.items.length > 0 && (
                    <div className="mb-2.5 grid overflow-hidden rounded-[10px] border border-[#e7dfcd]">
                      <div className="grid grid-cols-[minmax(150px,2fr)_.45fr_.85fr_.85fr_34px] items-center gap-2.5 bg-[#f4eddf] px-2.5 py-[9px] text-[.61rem] font-extrabold uppercase tracking-[.03em] text-[#6b6455] max-[760px]:hidden"><span>Descrição</span><span>Qtd.</span><span>Unitário</span><span>Total</span><span /></div>
                      {group.items.map((item) => (
                        <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border-t border-[#e7dfcd] bg-white p-3 text-[.72rem] first:border-t-0 min-[761px]:grid-cols-[minmax(150px,2fr)_.45fr_.85fr_.85fr_34px] min-[761px]:gap-2.5 min-[761px]:px-2.5 min-[761px]:py-[9px] [&>span:nth-child(5)]:col-start-2 [&>span:nth-child(5)]:row-[1/span_2] min-[761px]:[&>span:nth-child(5)]:col-auto min-[761px]:[&>span:nth-child(5)]:row-auto" key={item.id}>
                          <span>{item.description}</span>
                          <span>{item.qty}</span>
                          <span>{formatBRL(item.unit)}</span>
                          <span><strong>{formatBRL(item.qty * item.unit)}</strong></span>
                          <span><button className="size-[30px] cursor-pointer rounded-lg border-0 bg-[#f5efe3] font-black text-[#786e5c] hover:bg-[#f2dfd9] hover:text-[#a53c30]" onClick={() => removeItem(group.name, item.id)} aria-label="Remover item">×</button></span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-[1fr_80px] gap-2 min-[761px]:grid-cols-[minmax(160px,2fr)_82px_150px_auto]">
                    <input className="min-h-[38px] rounded-[10px] border border-[#d9d2c4] bg-white px-2.5 py-2 text-[.72rem] text-[#060c1c] outline-0 placeholder:text-[#b3aa99] focus:border-[#ffa400] focus:shadow-[0_0_0_4px_rgba(255,164,0,.12)]" placeholder={`Adicionar item de ${group.name.toLowerCase()}`} value={draft.description} onChange={(e) => changeDraft(group.name, 'description', e.target.value)} />
                    <input className="min-h-[38px] rounded-[10px] border border-[#d9d2c4] bg-white px-2.5 py-2 text-[.72rem] text-[#060c1c] outline-0 placeholder:text-[#b3aa99] focus:border-[#ffa400] focus:shadow-[0_0_0_4px_rgba(255,164,0,.12)]" type="number" min="1" placeholder="Qtd." value={draft.qty} onChange={(e) => changeDraft(group.name, 'qty', e.target.value)} />
                    <div className="col-start-1 flex min-h-[38px] overflow-hidden rounded-[10px] border border-[#d9d2c4] bg-white focus-within:border-[#ffa400] focus-within:shadow-[0_0_0_4px_rgba(255,164,0,.12)] min-[761px]:col-auto"><span className="grid self-stretch place-items-center border-r border-[#e7dfcd] bg-[#faf6ed] px-[9px] text-[.68rem] font-extrabold text-[#6b6455]">R$</span><input className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 outline-0 placeholder:text-[#b3aa99]" inputMode="decimal" placeholder="0,00" value={draft.unit} onChange={(e) => changeDraft(group.name, 'unit', e.target.value)} /></div>
                    <button type="button" className="col-start-2 min-h-[38px] cursor-pointer rounded-[10px] border-0 bg-[#ffa400] px-[13px] py-2.5 text-[.78rem] font-extrabold text-[#07082e] transition-transform duration-150 hover:-translate-y-px min-[761px]:col-auto" onClick={() => addItem(group.name)}>Adicionar</button>
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

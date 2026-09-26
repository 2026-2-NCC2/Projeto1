import { useMemo, useState } from 'react';
import { ActionRow, FormCard } from '../components/FormUI.jsx';

// converte o texto do valor em numero (ex: "1.500,00" vira 1500)
// tira o ponto do milhar e troca a virgula por ponto, se der erro vira 0
const money = (value) => Number(String(value).replace('.', '').replace(',', '.')) || 0;
// formata numero como dinheiro (ex: 1500 vira "R$ 1.500,00")
const formatBRL = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// categorias de custo que ja comecam na tela, todas vazias
const seed = [
  { name: 'Iluminação', items: [] },
  { name: 'Alimentação', items: [] },
  { name: 'Bebidas', items: [] },
  { name: 'Segurança', items: [] },
  { name: 'Estrutura', items: [] },
];

// etapa do formulario de criar evento: itens de custo
// independentCosts = custos avulsos que vem da etapa anterior / onBack e onFinish = voltar e finalizar
export function CostItems({ independentCosts, onBack, onFinish }) {
  const [groups, setGroups] = useState(seed);         // categorias com os itens de cada uma
  const [open, setOpen] = useState('Iluminação');     // categoria aberta no momento
  const [drafts, setDrafts] = useState({});           // o que ta sendo digitado antes de adicionar o item

  // soma dos custos avulsos
  const independentTotal = useMemo(() => independentCosts.reduce((sum, item) => sum + money(item.value), 0), [independentCosts]);

  // soma de todos os itens de todas as categorias (quantidade x valor unitario)
  const categoryTotal = useMemo(
    () => groups.reduce((sum, group) => sum + group.items.reduce((s, item) => s + item.qty * item.unit, 0), 0),
    [groups],
  );

  // soma dos itens de uma categoria so (quantidade x valor unitario)
  function groupTotal(group) {
    return group.items.reduce((sum, item) => sum + item.qty * item.unit, 0);
  }

  // atualiza o que ta sendo digitado no formulario de uma categoria
  // cada categoria tem seu proprio rascunho, e os valores padrao evitam campo undefined
  function changeDraft(group, key, value) {
    setDrafts((prev) => ({ ...prev, [group]: { description: '', qty: '1', unit: '', ...prev[group], [key]: value } }));
  }

  // adiciona o item digitado na categoria
  function addItem(groupName) {
    const draft = { description: '', qty: '1', unit: '', ...drafts[groupName] };
    // nao adiciona se faltar descricao ou valor
    if (!draft.description.trim() || !draft.unit) return;

    // coloca o item novo so na categoria certa, as outras ficam iguais
    setGroups((prev) => prev.map((group) => group.name === groupName ? {
      ...group,
      items: [...group.items, {
        id: crypto.randomUUID(),                      // id unico pro item
        description: draft.description,
        qty: Math.max(1, Number(draft.qty) || 1),     // quantidade minima e 1
        unit: money(draft.unit),                      // converte o valor digitado pra numero
      }],
    } : group));

    // limpa o formulario depois de adicionar
    setDrafts((prev) => ({ ...prev, [groupName]: { description: '', qty: '1', unit: '' } }));
  }

  // remove um item de uma categoria pelo id
  function removeItem(groupName, id) {
    setGroups((prev) => prev.map((group) => group.name === groupName ? { ...group, items: group.items.filter((item) => item.id !== id) } : group));
  }

  // botoes de voltar e finalizar
  // ao finalizar manda as categorias e o total geral (categorias + custos avulsos) pro componente pai
  // o ?. evita erro caso o onFinish nao tenha sido passado
  const footer = (
    <ActionRow onBack={onBack} onNext={() => onFinish?.({ groups, total: categoryTotal + independentTotal })} backLabel="Voltar" nextLabel="Finalizar cadastro" />
  );

  return (
    // card padrao das etapas, essa e a ultima
    <FormCard
      eyebrow="Etapa 4 de 4"
      title="Itens de custos"
      subtitle="Detalhe os gastos por categoria e acompanhe o total estimado do evento."
      footer={footer}
    >
      {/* resumo dos totais: 1 coluna no celular e 3 a partir de 761px */}
      <div className="mb-6 grid grid-cols-1 gap-3 min-[761px]:grid-cols-3">
        {/* total das categorias */}
        <div className="grid gap-1 rounded-xl border border-[#e7dfcd] bg-[#faf7f0] px-4 py-[15px]">
          <span className="text-[.68rem] font-bold text-[#6b6455]">Custos categorizados</span>
          <strong className="text-base text-[#07082e]">{formatBRL(categoryTotal)}</strong>
        </div>
        {/* total dos custos avulsos */}
        <div className="grid gap-1 rounded-xl border border-[#e7dfcd] bg-[#faf7f0] px-4 py-[15px]">
          <span className="text-[.68rem] font-bold text-[#6b6455]">Custos independentes</span>
          <strong className="text-base text-[#07082e]">{formatBRL(independentTotal)}</strong>
        </div>
        {/* total geral, com fundo escuro pra destacar */}
        <div className="grid gap-1 rounded-xl border border-[#07082e] bg-[#07082e] px-4 py-[15px]">
          <span className="text-[.68rem] font-bold text-white/65">Total estimado</span>
          <strong className="text-base text-[#ffa400]">{formatBRL(categoryTotal + independentTotal)}</strong>
        </div>
      </div>

      {/* lista de categorias em formato sanfona (abre uma por vez) */}
      <div className="overflow-hidden rounded-[14px] border border-[#e7dfcd]">
        {groups.map((group) => {
          const isOpen = open === group.name; // ve se essa categoria e a que ta aberta
          // rascunho da categoria, com valores padrao caso ainda nao tenha nada digitado
          const draft = { description: '', qty: '1', unit: '', ...drafts[group.name] };

          return (
            // first:border-t-0 tira a borda de cima da primeira categoria
            <section className="border-t border-[#e7dfcd] first:border-t-0" key={group.name}>
              {/* cabecalho da categoria, clicando abre ou fecha */}
              {/* se ja ta aberta fecha, senao abre essa */}
              <button className={`flex w-full cursor-pointer items-center justify-between gap-4 border-0 px-4 py-[15px] text-left ${isOpen ? 'bg-[#fffaf0]' : 'bg-white'}`} type="button" onClick={() => setOpen(isOpen ? '' : group.name)}>
                {/* nome da categoria e quantidade de itens (item/itens no singular ou plural) */}
                <span className="flex items-center gap-2.5">
                  <strong className="text-[.84rem] text-[#07082e]">{group.name}</strong>
                  <small className="text-[.65rem] text-[#6b6455]">{group.items.length} {group.items.length === 1 ? 'item' : 'itens'}</small>
                </span>
                {/* total da categoria e o icone de + ou - */}
                <span className="flex items-center gap-2.5">
                  <b className="text-[.77rem] text-[#07082e]">{formatBRL(groupTotal(group))}</b>
                  <i className="grid size-6 place-items-center rounded-full bg-[#f2eadb] not-italic font-black text-[#331166]">{isOpen ? '−' : '+'}</i>
                </span>
              </button>

              {/* conteudo da categoria, so aparece se ela estiver aberta */}
              {isOpen && (
                <div className="bg-[#fffaf0] px-4 pb-4">
                  {/* tabela de itens, so aparece se a categoria ja tiver algum item */}
                  {group.items.length > 0 && (
                    <div className="mb-2.5 grid overflow-hidden rounded-[10px] border border-[#e7dfcd]">
                      {/* cabecalho da tabela, some no celular (max-[760px]:hidden) */}
                      <div className="grid grid-cols-[minmax(150px,2fr)_.45fr_.85fr_.85fr_34px] items-center gap-2.5 bg-[#f4eddf] px-2.5 py-[9px] text-[.61rem] font-extrabold uppercase tracking-[.03em] text-[#6b6455] max-[760px]:hidden">
                        <span>Descrição</span>
                        <span>Qtd.</span>
                        <span>Unitário</span>
                        <span>Total</span>
                        <span />
                      </div>

                      {/* uma linha pra cada item */}
                      {/* no celular fica em 2 colunas com o botao de remover na direita, no desktop vira as 5 colunas da tabela */}
                      {group.items.map((item) => (
                        <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border-t border-[#e7dfcd] bg-white p-3 text-[.72rem] first:border-t-0 min-[761px]:grid-cols-[minmax(150px,2fr)_.45fr_.85fr_.85fr_34px] min-[761px]:gap-2.5 min-[761px]:px-2.5 min-[761px]:py-[9px] [&>span:nth-child(5)]:col-start-2 [&>span:nth-child(5)]:row-[1/span_2] min-[761px]:[&>span:nth-child(5)]:col-auto min-[761px]:[&>span:nth-child(5)]:row-auto" key={item.id}>
                          <span>{item.description}</span>
                          <span>{item.qty}</span>
                          <span>{formatBRL(item.unit)}</span>
                          {/* total do item (quantidade x valor unitario) */}
                          <span><strong>{formatBRL(item.qty * item.unit)}</strong></span>
                          {/* botao de remover o item */}
                          <span><button className="size-[30px] cursor-pointer rounded-lg border-0 bg-[#f5efe3] font-black text-[#786e5c] hover:bg-[#f2dfd9] hover:text-[#a53c30]" onClick={() => removeItem(group.name, item.id)} aria-label="Remover item">×</button></span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* formulario pra adicionar item novo */}
                  {/* no celular: descricao e qtd em cima, valor e botao embaixo / no desktop fica tudo numa linha so */}
                  <div className="grid grid-cols-[1fr_80px] gap-2 min-[761px]:grid-cols-[minmax(160px,2fr)_82px_150px_auto]">
                    {/* descricao, o placeholder muda conforme a categoria */}
                    <input className="min-h-[38px] rounded-[10px] border border-[#d9d2c4] bg-white px-2.5 py-2 text-[.72rem] text-[#060c1c] outline-0 placeholder:text-[#b3aa99] focus:border-[#ffa400] focus:shadow-[0_0_0_4px_rgba(255,164,0,.12)]" placeholder={`Adicionar item de ${group.name.toLowerCase()}`} value={draft.description} onChange={(e) => changeDraft(group.name, 'description', e.target.value)} />
                    {/* quantidade */}
                    <input className="min-h-[38px] rounded-[10px] border border-[#d9d2c4] bg-white px-2.5 py-2 text-[.72rem] text-[#060c1c] outline-0 placeholder:text-[#b3aa99] focus:border-[#ffa400] focus:shadow-[0_0_0_4px_rgba(255,164,0,.12)]" type="number" min="1" placeholder="Qtd." value={draft.qty} onChange={(e) => changeDraft(group.name, 'qty', e.target.value)} />
                    {/* valor unitario com o "R$" grudado na esquerda */}
                    {/* focus-within deixa a borda laranja quando o input de dentro ta em foco */}
                    <div className="col-start-1 flex min-h-[38px] overflow-hidden rounded-[10px] border border-[#d9d2c4] bg-white focus-within:border-[#ffa400] focus-within:shadow-[0_0_0_4px_rgba(255,164,0,.12)] min-[761px]:col-auto">
                      <span className="grid self-stretch place-items-center border-r border-[#e7dfcd] bg-[#faf6ed] px-[9px] text-[.68rem] font-extrabold text-[#6b6455]">R$</span>
                      {/* inputMode decimal abre o teclado numerico no celular */}
                      <input className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 outline-0 placeholder:text-[#b3aa99]" inputMode="decimal" placeholder="0,00" value={draft.unit} onChange={(e) => changeDraft(group.name, 'unit', e.target.value)} />
                    </div>
                    {/* botao de adicionar o item na categoria */}
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

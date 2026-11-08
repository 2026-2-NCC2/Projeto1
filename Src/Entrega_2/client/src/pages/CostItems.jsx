import { useMemo, useState } from 'react';
import { ActionRow, FormCard } from '../components/FormUI.jsx';
import Aviso from '../components/ui/Aviso';
import { IconChevron, IconX } from '../components/ui/Icones';
import { btn, dadoRotuloCls } from '../components/ui/estilos';

// gelatina de cada categoria, na ordem em que aparecem
const CORES_GRUPO = ['bg-gel-indigo', 'bg-gel-ceu', 'bg-gel-magenta'];

// converte o texto do valor em numero (ex: "1.500,00" vira 1500)
// tira o ponto do milhar e troca a virgula por ponto, se der erro vira 0
const money = (value) =>
  Number(
    String(value).includes(',')
      ? String(value).replace(/\./g, '').replace(',', '.')
      : value,
  ) || 0;
// formata numero como dinheiro (ex: 1500 vira "R$ 1.500,00")
const formatBRL = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// etapa do formulario de criar evento: itens de custo
// independentCosts = custos avulsos que vem da etapa anterior / onBack e onFinish = voltar e finalizar
// groups/setGroups = categorias com os itens de cada uma (o estado fica no componente pai, que ja cria as categorias iniciais)
export function CostItems({ independentCosts, onBack, onFinish, groups, setGroups }) {
  const [open, setOpen] = useState('Iluminação'); // categoria aberta no momento
  const [erro, setErro] = useState('');
  const [drafts, setDrafts] = useState({}); // o que ta sendo digitado antes de adicionar o item

  // soma dos custos avulsos FIXOS (o tipo "Variável" é valor por participante e só entra no cálculo do ticket)
  const independentTotal = useMemo(
    () =>
      independentCosts
        .filter((item) => item.type !== 'Variável')
        .reduce((sum, item) => sum + money(item.value), 0),
    [independentCosts],
  );

  // soma de todos os itens de todas as categorias (quantidade x valor unitario)
  const categoryTotal = useMemo(
    () =>
      groups.reduce(
        (sum, group) =>
          sum + group.items.reduce((s, item) => s + item.qty * item.unit, 0),
        0,
      ),
    [groups],
  );

  // soma dos itens de uma categoria so (quantidade x valor unitario)
  function groupTotal(group) {
    return group.items.reduce((sum, item) => sum + item.qty * item.unit, 0);
  }

  // atualiza o que ta sendo digitado no formulario de uma categoria
  // cada categoria tem seu proprio rascunho, e os valores padrao evitam campo undefined
  function changeDraft(group, key, value) {
    setErro('');
    setDrafts((prev) => ({
      ...prev,
      [group]: {
        description: '',
        qty: '1',
        unit: '',
        ...prev[group],
        [key]: value,
      },
    }));
  }

  // adiciona o item digitado na categoria
  function addItem(groupName) {
    const draft = { description: '', qty: '1', unit: '', ...drafts[groupName] };
    const quantidade = Number(draft.qty);
    const valorTexto = String(draft.unit).trim();

    if (!draft.description.trim() || draft.description.trim().length > 255) {
      setErro('Informe uma descrição de até 255 caracteres para o item.');
      return;
    }

    if (
      !Number.isInteger(quantidade) ||
      quantidade < 1 ||
      quantidade > 1000000
    ) {
      setErro('A quantidade deve ser um número inteiro entre 1 e 1.000.000.');
      return;
    }

    if (
      !/^\d+(?:[.,]\d{1,2})?$/.test(valorTexto) ||
      money(valorTexto) > 9999999999
    ) {
      setErro(
        'Informe o valor unitário com até duas casas decimais, sem separador de milhar.',
      );
      return;
    }

    setErro('');

    // coloca o item novo so na categoria certa, as outras ficam iguais
    setGroups((prev) =>
      prev.map((group) =>
        group.name === groupName
          ? {
              ...group,
              items: [
                ...group.items,
                {
                  id: crypto.randomUUID(), // id unico pro item
                  description: draft.description.trim(),
                  qty: quantidade, // quantidade minima e 1
                  unit: money(draft.unit), // converte o valor digitado pra numero
                },
              ],
            }
          : group,
      ),
    );

    // limpa o formulario depois de adicionar
    setDrafts((prev) => ({
      ...prev,
      [groupName]: { description: '', qty: '1', unit: '' },
    }));
  }

  // remove um item de uma categoria pelo id
  function removeItem(groupName, id) {
    setGroups((prev) =>
      prev.map((group) =>
        group.name === groupName
          ? { ...group, items: group.items.filter((item) => item.id !== id) }
          : group,
      ),
    );
  }

  // Evita finalizar com um item digitado que ainda não entrou na lista.
  function finalizar() {
    const temItemNaoAdicionado = Object.values(drafts).some(
      (draft) =>
        String(draft.description ?? '').trim() !== '' ||
        String(draft.unit ?? '').trim() !== '' ||
        (String(draft.qty ?? '1').trim() !== '' &&
          Number(draft.qty ?? 1) !== 1),
    );

    if (temItemNaoAdicionado) {
      setErro(
        'Há um item preenchido ainda não adicionado. Clique em Adicionar na categoria correspondente ou limpe os campos antes de finalizar.',
      );
      return;
    }

    setErro('');
    onFinish?.({ groups, total: categoryTotal + independentTotal });
  }

  const footer = (
    <div>
      {erro && <Aviso tipo="erro" className="mb-4">{erro}</Aviso>}
      <ActionRow
        onBack={onBack}
        onNext={finalizar}
        backLabel="Voltar"
        nextLabel="Revisar e finalizar"
      />
    </div>
  );

  const totalGeral = categoryTotal + independentTotal;
  // quanto de cada parte entra no total (pra barra de camadas); sem total nenhuma aparece
  const parteCategorias = totalGeral > 0 ? (categoryTotal / totalGeral) * 100 : 0;

  // classe dos campos pequenos da linha de adicionar item
  const campoItem =
    'min-h-10 w-full rounded-none border border-tinta/20 bg-papel px-3 py-2 text-sm text-tinta outline-none transition duration-150 placeholder:text-tinta/45 hover:border-tinta/35 focus:border-gel-indigo-forte focus:ring-3 focus:ring-gel-indigo/35';

  return (
    // folha padrao das etapas, essa e a ultima
    <FormCard
      gel="indigo"
      title="Itens de custos"
      subtitle="Detalhe os gastos por categoria. Clique em Adicionar para incluir cada item antes de finalizar."
      footer={footer}
    >
      {/* resumo dos totais: o total geral e o numero grande, as partes ficam menores do lado */}
      <div className="mb-8 grid items-end gap-6 border-b border-tinta/10 pb-7 min-[761px]:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className={dadoRotuloCls}>Total fixo estimado</p>
          <p className="tabular mt-1 text-[clamp(2rem,4.4vw,2.75rem)] font-black leading-none tracking-[-0.025em]">
            {formatBRL(totalGeral)}
          </p>
        </div>
        <div>
          <p className={`${dadoRotuloCls} flex items-center gap-1.5`}><span className="size-2.5 rounded-none bg-gel-ceu" aria-hidden="true" />Custos categorizados</p>
          <p className="tabular mt-1 text-lg font-bold">{formatBRL(categoryTotal)}</p>
        </div>
        <div>
          <p className={`${dadoRotuloCls} flex items-center gap-1.5`}><span className="size-2.5 rounded-none bg-gel-indigo" aria-hidden="true" />Custos independentes fixos</p>
          <p className="tabular mt-1 text-lg font-bold">{formatBRL(independentTotal)}</p>
        </div>
        {/* barra de camadas: cada parte e uma gelatina, a largura e quanto ela pesa no total */}
        <div className="flex h-3 overflow-hidden rounded-none bg-tinta/8 min-[761px]:col-span-3" aria-hidden="true">
          {totalGeral > 0 && (
            <>
              <span className="h-full bg-gel-ceu transition-[width] duration-500 ease-saida" style={{ width: `${parteCategorias}%` }} />
              <span className="h-full flex-1 bg-gel-indigo" />
            </>
          )}
        </div>
      </div>

      {/* lista de categorias em formato sanfona (abre uma por vez) */}
      <div className="divide-y divide-tinta/10 overflow-hidden rounded-none border border-tinta/15 bg-papel">
        {groups.map((group, indice) => {
          const isOpen = open === group.name; // ve se essa categoria e a que ta aberta
          const corGrupo = CORES_GRUPO[indice % CORES_GRUPO.length];
          // rascunho da categoria, com valores padrao caso ainda nao tenha nada digitado
          const draft = {
            description: '',
            qty: '1',
            unit: '',
            ...drafts[group.name],
          };
          const idPainel = `grupo-${indice}`;

          return (
            <section key={group.name}>
              {/* cabecalho da categoria, clicando abre ou fecha (se ja ta aberta fecha, senao abre essa) */}
              <button
                className={`flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors ${isOpen ? 'bg-tinta/[0.04]' : 'hover:bg-tinta/[0.03]'}`}
                type="button"
                aria-expanded={isOpen}
                aria-controls={idPainel}
                onClick={() => setOpen(isOpen ? '' : group.name)}
              >
                {/* nome da categoria e quantidade de itens (item/itens no singular ou plural) */}
                <span className="flex min-w-0 items-center gap-3">
                  <span className={`h-7 w-2 shrink-0 rounded-none ${corGrupo}`} aria-hidden="true" />
                  <strong className="truncate text-[15px] font-bold">{group.name}</strong>
                  <small className="shrink-0 text-xs text-tinta/55">
                    {group.items.length}{' '}
                    {group.items.length === 1 ? 'item' : 'itens'}
                  </small>
                </span>
                {/* total da categoria e a seta que gira quando abre */}
                <span className="flex shrink-0 items-center gap-3">
                  <b className="tabular text-sm">{formatBRL(groupTotal(group))}</b>
                  <span className={`text-tinta/55 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}><IconChevron /></span>
                </span>
              </button>

              {/* conteudo da categoria, so aparece se ela estiver aberta */}
              {isOpen && (
                <div id={idPainel} className="bg-tinta/[0.04] px-4 pb-4">
                  {/* tabela de itens, so aparece se a categoria ja tiver algum item */}
                  {group.items.length > 0 && (
                    <div className="mb-3 overflow-hidden rounded-none border border-tinta/12 bg-papel">
                      {/* cabecalho da tabela, some no celular */}
                      <div className={`grid grid-cols-[minmax(150px,2fr)_.45fr_.85fr_.85fr_34px] items-center gap-2.5 border-b border-tinta/10 px-3 py-2 max-[760px]:hidden ${dadoRotuloCls}`}>
                        <span>Descrição</span>
                        <span>Qtd.</span>
                        <span>Unitário</span>
                        <span>Total</span>
                        <span />
                      </div>

                      {/* uma linha pra cada item: no celular fica em 2 colunas, no desktop vira as 5 colunas da tabela */}
                      {group.items.map((item) => (
                        <div
                          className="tabular grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border-t border-tinta/8 p-3 text-sm first:border-t-0 min-[761px]:grid-cols-[minmax(150px,2fr)_.45fr_.85fr_.85fr_34px] min-[761px]:gap-2.5 min-[761px]:py-2.5"
                          key={item.id}
                        >
                          <span className="break-words">{item.description}</span>
                          <span className="text-tinta/70">{item.qty}</span>
                          <span className="text-tinta/70">{formatBRL(item.unit)}</span>
                          {/* total do item (quantidade x valor unitario) */}
                          <span>
                            <strong>{formatBRL(item.qty * item.unit)}</strong>
                          </span>
                          {/* botao de remover o item: no celular fica na direita ocupando as duas linhas */}
                          <span className="col-start-2 row-[1/span_2] min-[761px]:col-auto min-[761px]:row-auto">
                            <button
                              className="grid size-8 place-items-center rounded-none text-tinta/55 transition-colors hover:bg-gel-rubi hover:text-white"
                              onClick={() => removeItem(group.name, item.id)}
                              aria-label="Remover item"
                            >
                              <IconX />
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* formulario pra adicionar item novo */}
                  {/* no celular: descricao e qtd em cima, valor e botao embaixo / no desktop fica tudo numa linha so */}
                  <div className="grid grid-cols-[1fr_84px] gap-2 pt-1 min-[761px]:grid-cols-[minmax(160px,2fr)_84px_150px_auto]">
                    {/* descricao, o placeholder muda conforme a categoria */}
                    <input
                      className={campoItem}
                      placeholder={`Adicionar item de ${group.name.toLowerCase()}`}
                      aria-label={`Descrição do item de ${group.name.toLowerCase()}`}
                      value={draft.description}
                      onChange={(e) =>
                        changeDraft(group.name, 'description', e.target.value)
                      }
                    />
                    {/* quantidade */}
                    <input
                      className={`${campoItem} tabular`}
                      type="number"
                      min="1"
                      placeholder="Qtd."
                      aria-label="Quantidade"
                      value={draft.qty}
                      onChange={(e) =>
                        changeDraft(group.name, 'qty', e.target.value)
                      }
                    />
                    {/* valor unitario com o "R$" grudado na esquerda */}
                    <div className="col-start-1 flex min-h-10 overflow-hidden rounded-none border border-tinta/20 bg-papel transition duration-150 hover:border-tinta/35 focus-within:border-gel-indigo-forte focus-within:ring-3 focus-within:ring-gel-indigo/35 min-[761px]:col-auto">
                      <span className="grid place-items-center border-r border-tinta/10 bg-tinta/5 px-2.5 font-mono text-[11px] font-semibold text-tinta/60">
                        R$
                      </span>
                      {/* inputMode decimal abre o teclado numerico no celular */}
                      <input
                        className="tabular min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-tinta/45"
                        inputMode="decimal"
                        placeholder="0,00"
                        aria-label="Valor unitário"
                        value={draft.unit}
                        onChange={(e) =>
                          changeDraft(group.name, 'unit', e.target.value)
                        }
                      />
                    </div>
                    {/* botao de adicionar o item na categoria */}
                    <button
                      type="button"
                      className={`${btn('tinta', 'sm')} col-start-2 min-h-10 min-[761px]:col-auto`}
                      onClick={() => addItem(group.name)}
                    >
                      Adicionar
                    </button>
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

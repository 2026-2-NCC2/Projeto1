// Cálculo do ticket (RF13) e consolidação dos custos (RF07/RF12).
// A fórmula e as premissas estão explicadas em FORMULA-TICKET.md.
// Todo o cálculo fica aqui, no servidor: o front só mostra o resultado.

export const TIPO_CUSTO_VARIAVEL = 'Variável' // valor POR PARTICIPANTE (os outros tipos são custos fixos)

// Arredonda para 2 casas (usado nos valores que vão para a resposta)
const arredondar = (valor) => Math.round(valor * 100) / 100

// Arredonda PARA CIMA no centavo (para baixo o evento fecharia no prejuízo).
// O toFixed tira o "ruído" do ponto flutuante: 55.75 * 100 dá 5575.000000000001 e subiria um centavo à toa.
const arredondarParaCima = (valor) => Math.ceil(Number((valor * 100).toFixed(4))) / 100

// Lê a margem de lucro em % (0 a 99,99). Aceita vírgula ou ponto.
// Devolve o número, 0 se estiver em branco (e `opcional`), ou NaN se for inválida.
export function lerMargem(valor, opcional = true) {
    const texto = String(valor ?? '').trim().replace(',', '.')
    if (texto === '') return opcional ? 0 : NaN
    if (!/^\d+(\.\d{1,2})?$/.test(texto)) return NaN
    return Number(texto) < 100 ? Number(texto) : NaN
}

// Ticket = Custo total / [Público × (1 − Margem)]    (margem sobre a receita)
//   Custo total = custo fixo + custo variável por participante × Público
//   Ticket de equilíbrio = a mesma conta com margem 0
export function calcularTicket({ custoFixo, custoVariavel, margem, publico }) {
    if (!Number.isInteger(publico) || publico < 1) throw new RangeError('O público precisa ser um número inteiro de pelo menos 1.')
    if (!(margem >= 0 && margem < 100)) throw new RangeError('A margem de lucro precisa estar entre 0 e 99,99%.')

    const custoTotal = custoFixo + custoVariavel * publico

    return {
        publico,
        custo_total: arredondar(custoTotal),
        ticket_equilibrio: arredondarParaCima(custoTotal / publico),
        ticket_alvo: arredondarParaCima(custoTotal / (publico * (1 - margem / 100))),
    }
}

// Custos do evento:
//  - item com proposta aceita: a quantidade coberta custa o preço da proposta;
//    o que sobrar da quantidade pedida continua na estimativa do organizador;
//  - item sem proposta: estimativa (quantidade × valor unitário);
//  - custos independentes: fixos, exceto o tipo "Variável" (valor por participante).
export async function consolidarCustos(sql, eventoId) {
    const itens = await sql`
        SELECT i.quantidade, i.valor_unitario,
            COALESCE(c.quantidade_coberta, 0) AS quantidade_coberta,
            COALESCE(c.valor_coberto, 0) AS valor_coberto
        FROM itemcusto i
        LEFT JOIN (
            SELECT p.id_item_custo_fk,
                SUM(p.quantidade) AS quantidade_coberta,
                SUM(p.quantidade * p.valor_unitario) AS valor_coberto
            FROM produto_solicitacao p
            JOIN solicitacao_fornecimento s ON s.id = p.id_solicitacao_fk
            WHERE s.id_evento_fk = ${eventoId} AND s.status = 'aceita'
            GROUP BY p.id_item_custo_fk
        ) c ON c.id_item_custo_fk = i.id_item_custo
        WHERE i.id_evento_fk = ${eventoId}
        ORDER BY i.id_item_custo
    `
    const independentes = await sql`
        SELECT tipo_custo, valor FROM custoindependente
        WHERE id_evento_fk = ${eventoId}
        ORDER BY id_custo_independente
    `

    let totalItens = 0
    for (const i of itens) {
        const coberta = Math.min(Number(i.quantidade_coberta), i.quantidade)
        totalItens += Number(i.valor_coberto) + (i.quantidade - coberta) * Number(i.valor_unitario)
    }

    let independentesFixos = 0
    let variavelPorPessoa = 0
    for (const c of independentes) {
        if (c.tipo_custo === TIPO_CUSTO_VARIAVEL) variavelPorPessoa += Number(c.valor)
        else independentesFixos += Number(c.valor)
    }

    return {
        total_itens: arredondar(totalItens),
        independentes_fixos: arredondar(independentesFixos),
        variavel_por_participante: arredondar(variavelPorPessoa),
        custo_fixo_total: arredondar(totalItens + independentesFixos),
    }
}

// Monta a resposta do ticket do evento: custos consolidados + cenários de público (mínimo e máximo).
export async function montarTicketDoEvento(sql, evento) {
    const custos = await consolidarCustos(sql, evento.id_evento)
    const margem = Number(evento.margem_lucro_percentual ?? 0)

    const cenario = (rotulo, publico) => {
        publico = Number(publico ?? 0) || 0
        if (!Number.isInteger(publico) || publico < 1) {
            return { publico, disponivel: false, motivo: `Informe o ${rotulo} do evento para calcular este cenário.` }
        }
        return { disponivel: true, ...calcularTicket({ custoFixo: custos.custo_fixo_total, custoVariavel: custos.variavel_por_participante, margem, publico }) }
    }

    return {
        evento: { id: evento.id_evento, titulo: evento.titulo_evento },
        margem_percentual: margem,
        custos,
        cenarios: {
            minimo: cenario('público mínimo', evento.publico_minimo),
            maximo: cenario('público máximo', evento.publico_maximo),
        },
        formula: 'Ticket = Custo total / [Público × (1 − Margem)], com Custo total = custo fixo + custo variável por participante × Público. Arredondado para cima no centavo.',
    }
}

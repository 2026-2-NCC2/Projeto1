// useState = guarda quais propostas ja foram enviadas
import { useState } from "react";

// ─── Dados de exemplo ─────────────────────────────────────────────────────────
// oportunidades falsas (eventos procurando fornecedores) ate a API ficar pronta
// servico usa os mesmos ids das areas do cadastro de fornecedor
const OPORTUNIDADES = [
  { id: 1, evento: "Lollapalooza 2026",     data: "28/03/2026", local: "Autódromo de Interlagos, SP",   servico: "som_luz",    detalhe: "Sonorização do palco secundário (3 dias).",          orcamento: 48000 },
  { id: 2, evento: "Show Maroon 5",         data: "05/11/2026", local: "Allianz Parque, São Paulo",     servico: "seguranca",  detalhe: "Equipe de 40 seguranças para entrada e camarote.",   orcamento: 22000 },
  { id: 3, evento: "Tomorrowland Brasil",   data: "30/10/2026", local: "Parque Maeda, Itu — SP",        servico: "catering",   detalhe: "Buffet para 300 pessoas da equipe técnica.",         orcamento: 35000 },
  { id: 4, evento: "GP de Interlagos 2026", data: "13/11/2026", local: "Autódromo José Carlos Pace, SP", servico: "transporte", detalhe: "Vans de traslado entre hotel e autódromo.",           orcamento: 18000 },
  { id: 5, evento: "Rock in Rio — Dia 1",   data: "12/09/2026", local: "Cidade do Rock, Rio de Janeiro", servico: "foto_video", detalhe: "Cobertura em foto e vídeo para redes sociais.",       orcamento: 15000 },
];

// nome e emoji de cada tipo de servico (iguais ao cadastro de fornecedor)
const SERVICOS = {
  som_luz:    { emoji: "🔊", label: "Som e Luz" },
  seguranca:  { emoji: "🛡️", label: "Segurança" },
  catering:   { emoji: "🍽️", label: "Catering / Buffet" },
  transporte: { emoji: "🚌", label: "Transporte" },
  foto_video: { emoji: "📸", label: "Foto e Vídeo" },
};

// formata numero como dinheiro (ex: 15000 vira "R$ 15.000,00")
function formatCurrency(val) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

// pagina do fornecedor: lista de eventos que procuram servicos, com botao de enviar proposta
export default function PainelFornecedor() {
  // ids das oportunidades que ja receberam proposta (por enquanto so na tela)
  const [enviadas, setEnviadas] = useState([]);

  return (
    // pagina inteira com fundo cinza claro
    <div className="min-h-full bg-tt-cinza-claro text-tt-azul-marinho">
      {/* topo com o degrade suave, igual as outras paginas */}
      <section className="border-b border-tt-azul-marinho/12 bg-[image:var(--tt-gradiente-suave)]">
        {/* conteudo centralizado */}
        <div className="mx-auto w-[calc(100%_-_48px)] max-w-[1180px] py-10 max-[760px]:w-[calc(100%_-_36px)] max-[760px]:py-8">
          {/* etiqueta, titulo e o resumo (quantas oportunidades e quantas propostas enviadas) */}
          <span className="inline-block text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-tt-roxo-principal">Área do fornecedor</span>
          <h1 className="mb-0 mt-2 text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.1] tracking-[-0.045em] text-tt-azul-marinho">Oportunidades</h1>
          <p className="mt-2 text-sm text-tt-grafite/75">
            {/* o "s" so aparece quando e mais de uma */}
            {OPORTUNIDADES.length} eventos procurando fornecedores · {enviadas.length} proposta{enviadas.length !== 1 ? "s" : ""} enviada{enviadas.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* lista de oportunidades em cards */}
      <div className="mx-auto grid w-[calc(100%_-_48px)] max-w-[1180px] grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[18px] pb-[72px] pt-7 max-[760px]:w-[calc(100%_-_36px)]">
        {/* cria um card pra cada oportunidade */}
        {OPORTUNIDADES.map((op) => {
          // nome e emoji do servico dessa oportunidade
          const servico = SERVICOS[op.servico];
          // true se ja enviou proposta pra essa
          const enviada = enviadas.includes(op.id);
          return (
            // card da oportunidade
            <article key={op.id} className="flex flex-col gap-3 rounded-[18px] border border-tt-azul-marinho/12 bg-tt-branco p-5 shadow-[0_1px_2px_color-mix(in_srgb,var(--tt-azul-marinho)_4%,transparent)]">
              {/* tipo de servico procurado */}
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-tt-lilas-claro px-2.5 py-1 text-[11px] font-bold text-tt-roxo-principal">
                <span aria-hidden="true">{servico.emoji}</span>{servico.label}
              </span>
              {/* nome do evento, data e local */}
              <div>
                <h2 className="text-base font-bold leading-tight text-tt-azul-marinho">{op.evento}</h2>
                <p className="mt-1 text-xs text-tt-grafite/60">{op.data} · {op.local}</p>
              </div>
              {/* o que o evento precisa */}
              <p className="text-[13px] leading-[1.55] text-tt-grafite/75">{op.detalhe}</p>
              {/* rodape do card: orcamento na esquerda e botao na direita */}
              <div className="mt-auto flex items-end justify-between border-t border-tt-azul-marinho/12 pt-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.5px] text-tt-grafite/60">Orçamento estimado</p>
                  <p className="text-sm font-bold text-tt-azul-principal">{formatCurrency(op.orcamento)}</p>
                </div>
                {/* depois de enviar, o botao vira um aviso verde */}
                {enviada ? (
                  <span className="rounded-lg bg-tt-verde-claro px-3 py-2 text-xs font-bold text-tt-verde-sucesso">Proposta enviada ✓</span>
                ) : (
                  // ao clicar, acrescenta o id dessa oportunidade na lista de enviadas
                  <button
                    type="button"
                    onClick={() => setEnviadas([...enviadas, op.id])}
                    className="cursor-pointer rounded-lg bg-[image:var(--tt-gradiente-botao)] px-4 py-2 text-xs font-bold text-tt-branco transition hover:brightness-110"
                  >
                    Enviar proposta
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// Breadcrumb ("caminho de pao") — faixa pequena embaixo da navbar mostrando onde a pessoa esta
// ex: Inicio › Eventos › Criar evento › Publico e lotes
// o caminho sai da url; telas sem url propria (ex: detalhes do evento) adicionam o ultimo item pelo contexto
// createContext/useContext = jeito de compartilhar uma informacao entre componentes sem passar de um pro outro
// useEffect = roda um codigo quando algo muda / useState = guarda uma informacao que muda
import { createContext, useContext, useEffect, useState } from 'react';
// Link = link sem recarregar / useLocation = diz em qual pagina a pessoa esta
import { Link, useLocation } from 'react-router-dom';

// contexto pra uma pagina acrescentar um item no fim do caminho
const BreadcrumbContext = createContext({ extra: null, setExtra: () => {} });

// "caixa" que guarda o item extra e deixa todo mundo de dentro ler e mudar
export function BreadcrumbProvider({ children }) {
  // extra = { label, voltar } ou null quando nao tem item extra
  const [extra, setExtra] = useState(null);
  return <BreadcrumbContext.Provider value={{ extra, setExtra }}>{children}</BreadcrumbContext.Provider>;
}

// usado pela pagina: useBreadcrumbExtra('Lollapalooza 2026', voltar) coloca o nome no fim do caminho
// "voltar" roda ao clicar no item anterior (a url e a mesma, entao so o link nao bastaria)
// passando null tira o item; ao sair da pagina ele some sozinho
// a linha abaixo so desliga um aviso do lint (esse arquivo exporta componente e funcao juntos)
// eslint-disable-next-line react-refresh/only-export-components
export function useBreadcrumbExtra(label, voltar) {
  // pega a funcao que muda o item extra
  const { setExtra } = useContext(BreadcrumbContext);
  useEffect(() => {
    // coloca o item (ou tira, se label for vazio)
    setExtra(label ? { label, voltar } : null);
    // quando a pagina sai da tela, tira o item
    return () => setExtra(null);
  // roda de novo sempre que o nome ou a funcao voltar mudarem
  }, [label, voltar, setExtra]);
}

// nome de cada etapa do formulario de criar evento (igual ao Wizard)
const ETAPAS = {
  'evento': 'Evento',
  'publico-lotes': 'Público e lotes',
  'custos-independentes': 'Custos',
  'itens-custos': 'Resumo',
};

// monta a lista de itens { label, to } a partir da url atual
function montarCaminho(pathname, search) {
  // pagina atual em minusculo
  const path = pathname.toLowerCase();
  // itens que se repetem em varios caminhos
  const inicio = { label: 'Início', to: '/' };
  const eventos = { label: 'Eventos', to: '/PainelDeEventos' };
  const admin = { label: 'Administração', to: '/AdminDashboard' };

  // na pagina inicial nao tem caminho
  if (path === '/') return [];
  // painel de eventos: se tiver ?tab=meus acrescenta "Meus eventos"
  if (path === '/paineldeeventos') {
    const meus = new URLSearchParams(search).get('tab') === 'meus';
    return meus ? [inicio, eventos, { label: 'Meus eventos', to: '/PainelDeEventos?tab=meus' }] : [inicio, eventos];
  }
  // criar evento: pega a etapa que vem depois de /criar-evento/ (ex: publico-lotes)
  if (path.startsWith('/criar-evento')) {
    const etapa = path.split('/')[2] || 'evento';
    return [inicio, eventos, { label: 'Criar evento', to: '/criar-evento/evento' }, { label: ETAPAS[etapa] || 'Evento', to: pathname }];
  }
  // outras paginas, uma por linha
  if (path === '/login') return [inicio, { label: 'Entrar', to: '/Login' }];
  if (path === '/cadastro') return [inicio, { label: 'Criar conta', to: '/Cadastro' }];
  if (path === '/validation') return [inicio, { label: 'Validação de e-mail', to: '/validation' }];
  if (path === '/admindashboard') return [inicio, admin];
  if (path === '/painelfornecedor') return [inicio, { label: 'Oportunidades', to: '/PainelFornecedor' }];
  if (path === '/aprovarcadastros') return [inicio, admin, { label: 'Aprovar cadastros', to: '/AprovarCadastros' }];
  // qualquer outro endereco = pagina que nao existe
  return [inicio, { label: 'Página não encontrada', to: pathname }];
}

// o caminho de pao que aparece na tela
export default function Breadcrumb() {
  // pagina atual e o que vem depois do ?
  const { pathname, search } = useLocation();
  // item extra mandado pela pagina (se tiver)
  const { extra } = useContext(BreadcrumbContext);
  // monta os itens a partir da url
  const itens = montarCaminho(pathname, search);
  if (extra) {
    // o item anterior ao extra tambem fecha a tela atual (ex: volta dos detalhes pra lista)
    if (itens.length) itens[itens.length - 1] = { ...itens[itens.length - 1], onClick: extra.voltar };
    // acrescenta o nome no fim (ex: nome do evento)
    itens.push({ label: extra.label });
  }

  // na pagina inicial nao mostra nada
  if (itens.length === 0) return null;

  return (
    // faixa branca fininha embaixo da navbar
    <nav aria-label="Caminho de navegação" className="border-b border-tt-azul-marinho/8 bg-tt-branco/80">
      {/* lista dos itens, lado a lado, com letra pequena (11px) */}
      <ol className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-1.5 gap-y-0.5 px-6 py-1.5 text-[11px] leading-5 text-tt-grafite/60">
        {/* cria um item pra cada parte do caminho */}
        {itens.map((item, i) => {
          // true se for o ultimo item (a pagina atual)
          const ultimo = i === itens.length - 1;
          return (
            // cada parte do caminho
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
              {/* setinha entre os itens */}
              {i > 0 && <span aria-hidden="true" className="text-tt-roxo-suave">›</span>}
              {/* o ultimo item e a pagina atual: sem link e em destaque */}
              {ultimo || !item.to ? (
                <span aria-current="page" className="max-w-[220px] truncate font-semibold text-tt-roxo-principal">{item.label}</span>
              ) : (
                // os outros itens sao links que levam pra pagina
                <Link to={item.to} onClick={item.onClick} className="no-underline transition-colors hover:text-tt-rosa-principal">{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

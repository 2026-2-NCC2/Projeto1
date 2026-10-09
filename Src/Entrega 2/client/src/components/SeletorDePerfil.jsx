// SeletorDePerfil — botao flutuante "Ver como" pra trocar de visao sem cadastro (modo demonstracao)
// fica no canto de baixo da tela, em todas as paginas; abre uma listinha com os perfis
// useState = guarda se a lista esta aberta
import { useState } from 'react';
// useNavigate = troca de pagina pelo codigo
import { useNavigate } from 'react-router-dom';
// lista de perfis de teste e funcoes de entrar/ler o perfil (services/perfil.js)
import { PERFIS_DEMO, entrarComoDemo, lerPerfil } from '../services/perfil';

// "Visitante" = ninguem logado (como quem acabou de abrir o site)
const OPCOES = [...PERFIS_DEMO, { perfil: 'visitante', label: 'Visitante', emoji: '🚪', home: '/' }];

// botao flutuante "Ver como"
export default function SeletorDePerfil() {
  // funcao pra trocar de pagina
  const navigate = useNavigate();
  // lista comeca fechada
  const [aberto, setAberto] = useState(false);
  // perfil que esta ativo agora
  const perfilAtual = lerPerfil();
  // acha a opcao do perfil atual (se nao achar, usa "Visitante", que e a ultima)
  const atual = OPCOES.find((o) => o.perfil === perfilAtual) || OPCOES[OPCOES.length - 1];

  // entra como o perfil escolhido e vai pra pagina principal dele
  function escolher(opcao) {
    // salva o usuario de teste
    entrarComoDemo(opcao.perfil);
    // fecha a lista
    setAberto(false);
    // vai pra pagina principal do perfil
    navigate(opcao.home);
  }

  return (
    // fixed = fica parado no canto de baixo da tela mesmo rolando a pagina
    <div className="fixed bottom-4 right-4 z-[150] flex flex-col items-end gap-2">
      {/* lista de perfis, so aparece quando o botao ta aberto */}
      {aberto && (
        <div
          id="seletor-perfil-lista"
          className="w-[230px] overflow-hidden rounded-xl border border-tt-azul-marinho/12 bg-tt-branco shadow-[0_16px_40px_color-mix(in_srgb,var(--tt-roxo-principal)_25%,transparent)]"
        >
          {/* cabecalho da lista com o degrade suave */}
          <div className="bg-[image:var(--tt-gradiente-suave)] px-4 py-2.5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-tt-roxo-principal">Modo demonstração</p>
            <p className="text-[11px] text-tt-grafite/75">Veja o site como cada perfil, sem cadastro.</p>
          </div>
          {/* um botao pra cada perfil */}
          <ul className="py-1">
            {OPCOES.map((opcao) => {
              // true se essa opcao for o perfil atual
              const ativo = opcao.perfil === atual.perfil;
              return (
                <li key={opcao.perfil}>
                  {/* o perfil atual fica com fundo lilas e um ✓ */}
                  <button
                    type="button"
                    onClick={() => escolher(opcao)}
                    aria-pressed={ativo}
                    className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-left text-[13px] transition-colors ${
                      ativo ? 'bg-tt-lilas-claro font-bold text-tt-roxo-principal' : 'text-tt-azul-marinho hover:bg-tt-cinza-claro'
                    }`}
                  >
                    {/* emoji, nome do perfil e o ✓ se for o atual */}
                    <span aria-hidden="true">{opcao.emoji}</span>
                    <span className="flex-1">{opcao.label}</span>
                    {ativo && <span aria-hidden="true" className="text-xs">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* botao que abre/fecha a lista, mostra o perfil atual */}
      <button
        type="button"
        // inverte: se esta aberta fecha, se esta fechada abre
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        aria-controls="seletor-perfil-lista"
        className="flex cursor-pointer items-center gap-2 rounded-full bg-[image:var(--tt-gradiente-botao)] px-4 py-2.5 text-xs font-bold text-tt-branco shadow-[0_8px_24px_color-mix(in_srgb,var(--tt-rosa-principal)_35%,transparent)] transition hover:brightness-110"
      >
        {/* olhinho, texto com o perfil atual e a setinha (gira quando abre) */}
        <span aria-hidden="true">👁</span>
        Ver como: {atual.label}
        <span aria-hidden="true" className={`transition-transform ${aberto ? 'rotate-180' : ''}`}>▾</span>
      </button>
    </div>
  );
}

// Navbar — barra de navegacao principal (fixa no topo, no degrade azul -> roxo -> rosa)
// mostra links diferentes conforme o perfil do usuario logado
// e no celular troca os links por um menu hamburguer
// useState = guarda se o menu do celular esta aberto ou fechado
import { useState } from 'react';
// Link = link sem recarregar / useLocation = pagina atual / useNavigate = troca de pagina pelo codigo
import { Link, useLocation, useNavigate } from 'react-router-dom';
// imagem do simbolo da logo
import logo from '../assets/branding/logos/logo_navbar_web.png';
// funcoes que leem o usuario logado e fazem o logout (ficam em services/perfil.js)
import { lerUsuario, sair } from '../services/perfil';
// estilos da navbar
import './Navbar.css';


export default function Navbar() {
  // funcao pra mandar a pessoa pra outra pagina
  const navigate = useNavigate();
  // informacoes da pagina atual (caminho e o que vem depois do ?)
  const location = useLocation();
  // menu do celular: comeca fechado (false)
  const [menuOpen, setMenuOpen] = useState(false);
  // le de novo a cada troca de pagina (ex: logo depois de fazer login)
  const user = lerUsuario();
  // perfil em minusculo: 'admin', 'organizador', 'cliente' ou 'fornecedor' (vazio se ninguem entrou)
  const perfil = user?.perfil?.toLowerCase();
  // pagina atual em minusculo, pra comparar sem se preocupar com maiusculas
  const path = location.pathname.toLowerCase();
  // true se a pessoa estiver numa pagina de administracao
  const naAreaAdmin = path === '/admindashboard' || path === '/aprovarcadastros';

  // sai da conta: apaga o usuario salvo e volta pro inicio
  function handleLogout() {
    // apaga o usuario salvo
    sair();
    // volta pra pagina inicial
    navigate('/');
    // fecha o menu do celular
    setMenuOpen(false);
  }

  // links por perfil: admin ve a administracao, organizador os eventos dele,
  // fornecedor as oportunidades e usuario/visitante so os eventos
  const navLinks = perfil === 'admin' || naAreaAdmin ? [
    // links do administrador
    { to: '/AdminDashboard', label: 'Painel' },
    { to: '/AprovarCadastros', label: 'Cadastros' },
    { to: '/PainelDeEventos', label: 'Eventos' },
  ] : perfil === 'organizador' ? [
    // links do organizador
    { to: '/', label: 'Início' },
    { to: '/PainelDeEventos', label: 'Eventos' },
    { to: '/PainelDeEventos?tab=meus', label: 'Meus Eventos' },
    { to: '/criar-evento/evento', label: 'Criar evento' },
  ] : perfil === 'fornecedor' ? [
    // links do fornecedor
    { to: '/', label: 'Início' },
    { to: '/PainelFornecedor', label: 'Oportunidades' },
    { to: '/PainelDeEventos', label: 'Eventos' },
  ] : [
    // links do usuario comum e de quem nao entrou
    { to: '/', label: 'Início' },
    { to: '/PainelDeEventos', label: 'Eventos' },
  ];

  // link ativo: compara o caminho e a aba (?tab=meus) com a url atual
  function isActive(to) {
    // separa o link em caminho e parametros (ex: "/paineldeeventos" e "tab=meus")
    const [linkPath, linkQuery = ''] = to.toLowerCase().split('?');
    // aba que esta na url agora
    const atual = new URLSearchParams(location.search).get('tab') || '';
    // aba que o link quer abrir
    const abaDoLink = new URLSearchParams(linkQuery).get('tab') || '';
    // o link esta ativo se a pagina e a aba forem as mesmas
    return path === linkPath && atual === abaDoLink;
  }

  // primeiro nome do usuario pra mostrar no canto
  const primeiroNome = user?.nome?.split(' ')[0];

  // o que aparece na tela
  return (
    // a barra inteira
    <header className="navbar">
      {/* parte de dentro da barra (centralizada) */}
      <div className="navbar__inner">
        {/* Logo */}
        {/* clicar na logo leva pro inicio e fecha o menu do celular */}
        <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
          {/* simbolo da logo num quadradinho branco, pra aparecer bem em cima do degrade */}
          <span className="navbar__logo-icon"><img src={logo} alt="" /></span>
          {/* nome do site */}
          <span className="navbar__logo-name">TrocaTicket</span>
        </Link>

        {/* Links de navegacao — desktop */}
        <nav className="navbar__nav" aria-label="Navegação principal">
          {/* cria um link pra cada item da lista navLinks */}
          {navLinks.map((l) => (
            // o link da pagina atual ganha a classe navbar__link--active (fica destacado)
            <Link
              key={l.to}
              to={l.to}
              className={`navbar__link ${isActive(l.to) ? 'navbar__link--active' : ''}`}
              aria-current={isActive(l.to) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Acoes a direita */}
        <div className="navbar__actions">
          {/* se tiver alguem logado mostra o nome e o Sair, senao mostra Entrar e Criar conta */}
          {user ? (
            // usuario logado
            <div className="navbar__user">
              <span className="navbar__user-name">{primeiroNome}</span>
              <button className="navbar__logout" onClick={handleLogout}>
                Sair
              </button>
            </div>
          ) : (
            // ninguem logado
            <>
              <Link to="/Login" className="navbar__btn navbar__btn--ghost">
                Entrar
              </Link>
              <Link to="/Cadastro" className="navbar__btn navbar__btn--primary">
                Criar conta
              </Link>
            </>
          )}

          {/* Botao hamburguer — mobile */}
          {/* abre e fecha o menu do celular; vira um X quando aberto */}
          <button
            className={`navbar__hamburger ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
          >
            {/* os 3 risquinhos do botao */}
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {/* so aparece quando o menu do celular esta aberto */}
      {menuOpen && (
        <div className="navbar__mobile fade-in">
          {/* os mesmos links do computador, um embaixo do outro */}
          {navLinks.map((l) => (
            // clicar num link fecha o menu
            <Link
              key={l.to}
              to={l.to}
              className={`navbar__mobile-link ${isActive(l.to) ? 'navbar__link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {/* no fim do menu: Sair (se logado) ou Entrar e Criar conta */}
          {user ? (
            <button className="navbar__mobile-link navbar__mobile-logout" onClick={handleLogout}>
              Sair ({primeiroNome})
            </button>
          ) : (
            <>
              <Link to="/Login" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Entrar</Link>
              <Link to="/Cadastro" className="navbar__mobile-link navbar__mobile-cta" onClick={() => setMenuOpen(false)}>Criar conta</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

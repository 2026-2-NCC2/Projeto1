// Navbar — barra de navegacao principal (fixa no topo, azul da marca)
// mostra links diferentes conforme o perfil do usuario logado
// e no celular troca os links por um menu hamburguer
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/branding/logos/logo_navbar_web.png';
import './Navbar.css';

// le o usuario salvo pelo Login no localStorage ({ id_usuario, nome, email, perfil })
function lerUsuario() {
  try {
    return JSON.parse(localStorage.getItem('usuario'));
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  // le de novo a cada troca de pagina (ex: logo depois de fazer login)
  const user = lerUsuario();
  const perfil = user?.perfil?.toLowerCase();
  const path = location.pathname.toLowerCase();
  const naAreaAdmin = path === '/admindashboard' || path === '/aprovarcadastros';

  // sai da conta: apaga o usuario salvo e volta pro inicio
  function handleLogout() {
    localStorage.removeItem('usuario');
    navigate('/');
    setMenuOpen(false);
  }

  // links por perfil (admin ve as paginas de administracao)
  const navLinks = perfil === 'admin' || naAreaAdmin ? [
    { to: '/AdminDashboard', label: 'Painel' },
    { to: '/AprovarCadastros', label: 'Cadastros' },
    { to: '/PainelDeEventos', label: 'Eventos' },
  ] : [
    { to: '/', label: 'Início' },
    { to: '/PainelDeEventos', label: 'Eventos' },
    { to: '/PainelDeEventos?tab=meus', label: 'Meus Eventos' },
  ];

  // link ativo: compara o caminho e a aba (?tab=meus) com a url atual
  function isActive(to) {
    const [linkPath, linkQuery = ''] = to.toLowerCase().split('?');
    const atual = new URLSearchParams(location.search).get('tab') || '';
    const abaDoLink = new URLSearchParams(linkQuery).get('tab') || '';
    return path === linkPath && atual === abaDoLink;
  }

  // primeiro nome do usuario pra mostrar no canto
  const primeiroNome = user?.nome?.split(' ')[0];

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
          {/* simbolo da logo num quadradinho branco, pra aparecer bem em cima do degrade */}
          <span className="navbar__logo-icon"><img src={logo} alt="" /></span>
          <span className="navbar__logo-name">TrocaTicket</span>
        </Link>

        {/* Links de navegacao — desktop */}
        <nav className="navbar__nav" aria-label="Navegação principal">
          {navLinks.map((l) => (
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
          {user ? (
            <div className="navbar__user">
              <span className="navbar__user-name">{primeiroNome}</span>
              <button className="navbar__logout" onClick={handleLogout}>
                Sair
              </button>
            </div>
          ) : (
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
          <button
            className={`navbar__hamburger ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="navbar__mobile fade-in">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`navbar__mobile-link ${isActive(l.to) ? 'navbar__link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
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

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#/evento" aria-label="TrocaTicket - início">
          <span className="brand-mark" aria-hidden="true">T</span>
          <span>TrocaTicket</span>
        </a>
        <a className="account-link" href="#conta">Entrar / Conta</a>
      </div>
    </header>
  );
}

export function PageShell({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">{children}</main>
    </div>
  );
}

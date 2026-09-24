export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-[#07082e] text-white shadow-[0_1px_0_rgba(255,255,255,.08)]">
      <div className="mx-auto flex min-h-16 max-w-[1180px] items-center justify-between px-4 min-[461px]:min-h-[72px] min-[461px]:px-6">
        <a className="flex items-center gap-2.5 text-base font-extrabold tracking-[-.025em] text-white no-underline min-[461px]:text-[1.15rem]" href="/evento" aria-label="TrocaTicket - início">
          <span className="grid size-[30px] place-items-center rounded-full bg-[linear-gradient(135deg,#ffa400,#e6c896)] text-[#07082e] shadow-[inset_0_0_0_4px_rgba(255,255,255,.18)] min-[461px]:size-[34px]" aria-hidden="true">T</span>
          <span>TrocaTicket</span>
        </a>
        <a className="border-b border-white/35 text-[.72rem] font-bold text-[#fffaef] no-underline hover:text-[#ffa400] min-[461px]:text-[.84rem]" href="#conta">Entrar / Conta</a>
      </div>
    </header>
  );
}

export function PageShell({ children }) {
  return (
    <div>
      <Header />
      <main className="min-h-[calc(100vh-72px)]">{children}</main>
    </div>
  );
}

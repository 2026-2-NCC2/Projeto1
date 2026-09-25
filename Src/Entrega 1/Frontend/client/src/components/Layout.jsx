export function PageShell({ children }) {
  return (
    <div>
      <Header />
      <main className="min-h-[calc(100vh-72px)]">{children}</main>
    </div>
  );
}

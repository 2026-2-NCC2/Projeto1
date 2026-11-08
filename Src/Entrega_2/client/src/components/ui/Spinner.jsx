// indicador de carregamento: tres gelatinas acendendo em sequencia
// escuro = versao pra usar sobre o palco
export default function Spinner({ text = 'Carregando...', escuro = false }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8" role="status" aria-label={text || 'Carregando'}>
      <div className="flex gap-1.5" aria-hidden="true">
        {['bg-gel-indigo', 'bg-gel-magenta', 'bg-gel-ceu'].map((cor, i) => (
          <span
            key={cor}
            className={`h-6 w-2.5 rounded-none ${cor} animate-pulse`}
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </div>
      {text && <p className={`text-sm ${escuro ? 'text-white/70' : 'text-tinta/65'}`}>{text}</p>}
    </div>
  )
}

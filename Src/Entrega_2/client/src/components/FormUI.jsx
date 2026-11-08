// componentes reutilizados nas 4 etapas do formulario de criar evento
import Folha from './ui/Folha'
import { IconChevron, IconSeta } from './ui/Icones'
import { btn, campoCls, dicaCls, erroCls, rotuloCls } from './ui/estilos'

// campo com label, asterisco de obrigatorio, erro e dica
// usa <label> por fora, entao clicar no texto ja foca no campo de dentro
export function Field({ label, children, hint, required, error }) {
  return (
    <label className="flex flex-col gap-2">
      <span className={rotuloCls}>
        {label}
        {required && <span className="ml-0.5 text-gel-indigo-forte" aria-hidden="true">*</span>}
      </span>
      {/* aqui entra o input, select, textarea... */}
      {children}
      {/* role="alert" faz o leitor de tela ler o erro assim que aparece */}
      {error && <span className={erroCls} role="alert">{error}</span>}
      {hint && <span className={dicaCls}>{hint}</span>}
    </label>
  )
}

// input com o estilo padrao, o resto das props passa direto
export function Input({ className = '', ...props }) {
  return <input className={`${campoCls()} ${className}`} {...props} />
}

// select com o estilo padrao, as <option> vem pelo children
export function Select({ children, className = '', ...props }) {
  return (
    <span className="relative block">
      <select className={`${campoCls()} appearance-none pr-10 ${className}`} {...props}>
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tinta/60"><IconChevron /></span>
    </span>
  )
}

// caixa de texto maior com o estilo padrao
export function Textarea({ className = '', ...props }) {
  return <textarea className={`${campoCls()} min-h-[110px] resize-y ${className}`} {...props} />
}

// campo de dinheiro com o "R$" na esquerda
// inputMode decimal abre o teclado numerico no celular
export function CurrencyInput({ value, onChange, placeholder = '0,00' }) {
  return (
    <div className="flex min-h-11 overflow-hidden rounded-none border border-tinta/20 bg-papel transition duration-150 hover:border-tinta/35 focus-within:border-gel-indigo-forte focus-within:ring-3 focus-within:ring-gel-indigo/35">
      <span className="grid place-items-center border-r border-tinta/10 bg-tinta/5 px-3 font-mono text-xs font-semibold text-tinta/60">R$</span>
      <input
        className="tabular min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] text-tinta outline-none placeholder:text-tinta/45"
        value={value}
        onChange={onChange}
        inputMode="decimal"
        placeholder={placeholder}
        aria-label="Valor em reais"
      />
    </div>
  )
}

// folha de cada etapa: faixa da gelatina da etapa, cabecalho, conteudo e rodape
// gel = cor da etapa / subtitle e footer so aparecem se forem passados
export function FormCard({ gel = 'indigo', title, subtitle, children, footer }) {
  return (
    <Folha gel={gel} faixa="h-2.5">
      <div className="border-b border-tinta/10 px-6 pb-6 pt-7 sm:px-9">
        <h1 className="pr-8 text-[clamp(1.6rem,3vw,2.1rem)] font-black leading-none tracking-[-0.025em]">{title}</h1>
        {subtitle && <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-tinta/65">{subtitle}</p>}
      </div>
      <div className="px-6 py-7 sm:px-9">{children}</div>
      {footer && <div className="border-t border-tinta/10 bg-tinta/[0.03] px-6 py-5 sm:px-9">{footer}</div>}
    </Folha>
  )
}

// botoes de voltar e avancar do rodape da folha
// os textos tem valor padrao, mas cada etapa pode trocar
export function ActionRow({
  onBack,
  onNext,
  backLabel = 'Cancelar',
  nextLabel = 'Salvar e próximo',
  nextType = 'button',
}) {
  return (
    <div className="flex items-center justify-between gap-3 max-sm:flex-col-reverse max-sm:items-stretch">
      <button type="button" className={btn('claro')} onClick={onBack}>
        {backLabel}
      </button>
      <button
        key={nextLabel}
        type={nextType}
        className={btn('primario')}
        onClick={(event) => {
          if (event.detail > 1) return
          onNext?.(event)
        }}
      >
        {nextLabel}
        <IconSeta />
      </button>
    </div>
  )
}

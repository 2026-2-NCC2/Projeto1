const controlClass = "w-full min-h-11 rounded-[10px] border border-[#d9d2c4] bg-white px-3 py-2.5 text-[#060c1c] outline-none transition-[border-color,box-shadow,transform] duration-[180ms] placeholder:text-[#b3aa99] focus:border-[#ffa400] focus:shadow-[0_0_0_4px_rgba(255,164,0,.12)]";

const buttonBase = "min-h-[42px] cursor-pointer rounded-[10px] border-0 px-4 py-2.5 text-[.78rem] font-extrabold transition-[transform,box-shadow,filter] duration-150 hover:-translate-y-px";

export function Field({ label, children, hint, required, error }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[.76rem] font-extrabold text-[#07082e]">
        {label}{required && <span className="ml-[3px] text-[#de942d]">*</span>}
      </span>
      {children}
      {error && <span className="-mt-0.5 text-[.72rem] font-bold text-[#d62828]">{error}</span>}
      {hint && <span className="text-[.72rem] leading-[1.35] text-[#8b8476]">{hint}</span>}
    </label>
  );
}

export function Input({ className = '', ...props }) {
  return <input className={`${controlClass} ${className}`} {...props} />;
}

export function Select({ children, className = '', ...props }) {
  return <select className={`${controlClass} ${className}`} {...props}>{children}</select>;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${controlClass} min-h-[110px] resize-y ${className}`} {...props} />;
}

export function CurrencyInput({ value, onChange, placeholder = '0,00' }) {
  return (
    <div className="flex min-h-11 w-full items-center overflow-hidden rounded-[10px] border border-[#d9d2c4] bg-white text-[#060c1c] transition-[border-color,box-shadow,transform] duration-[180ms] focus-within:border-[#ffa400] focus-within:shadow-[0_0_0_4px_rgba(255,164,0,.12)]">
      <span className="grid self-stretch place-items-center border-r border-[#e7dfcd] bg-[#faf6ed] px-3 text-[.8rem] font-extrabold text-[#6b6455]">R$</span>
      <input
        className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 outline-0 placeholder:text-[#b3aa99]"
        value={value}
        onChange={onChange}
        inputMode="decimal"
        placeholder={placeholder}
        aria-label="Valor em reais"
      />
    </div>
  );
}

export function FormCard({ eyebrow, title, subtitle, children, footer, scrollable = false }) {
  return (
    <section className={`relative overflow-hidden rounded-2xl border border-[#e7dfcd] bg-white/[.94] shadow-[0_22px_60px_rgba(7,8,46,.12)] min-[461px]:rounded-[22px] ${scrollable ? 'flex h-[min(620px,calc(100dvh-150px))] max-[760px]:max-h-[calc(100dvh-92px)] flex-col' : ''}`}>
      <div className={`h-[5px] shrink-0 bg-[linear-gradient(90deg,#ffa400,#331166_55%,#07082e)]`} />
      <div className={`${scrollable ? 'shrink-0' : ''} border-b border-[#e7dfcd] px-5 pb-[22px] pt-6 min-[461px]:pt-[30px] min-[761px]:px-[34px]`}>
        {eyebrow && <span className="text-[.7rem] font-extrabold uppercase tracking-[.12em] text-[#de942d]">{eyebrow}</span>}
        <h1 className="my-[5px] mb-2 text-[clamp(1.55rem,3vw,2rem)] font-bold tracking-[-.04em] text-[#07082e]">{title}</h1>
        {subtitle && <p className="m-0 text-[.94rem] leading-[1.55] text-[#6b6455]">{subtitle}</p>}
      </div>
      <div className={`${scrollable ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:#ffa400_#f2eadb] [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[9px] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#f2eadb] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#f2eadb] [&::-webkit-scrollbar-thumb]:bg-[#ffa400]' : ''} px-5 py-[30px] max-[760px]:pr-[14px] min-[761px]:px-[34px]`}>
        {children}
      </div>
      {footer && <div className={`${scrollable ? 'shrink-0' : ''} border-t border-[#e7dfcd] bg-[#fffdf8] px-5 pb-7 pt-5 min-[761px]:px-[34px]`}>{footer}</div>}
    </section>
  );
}

export function ActionRow({ onBack, onNext, backLabel = 'Cancelar', nextLabel = 'Salvar e próximo', nextType = 'button' }) {
  return (
    <div className="flex items-center justify-between gap-3 max-[460px]:flex-col-reverse">
      <button type="button" className={`${buttonBase} border border-[#cfc7b6] bg-white text-[#07082e] hover:border-[#331166] max-[460px]:w-full`} onClick={onBack}>{backLabel}</button>
      <button type={nextType} className={`${buttonBase} inline-flex items-center gap-[9px] bg-[linear-gradient(135deg,#ffa400_0%,#ffc047_100%)] text-[#07082e] shadow-[0_8px_20px_rgba(222,148,45,.26)] hover:saturate-[1.08] hover:shadow-[0_10px_24px_rgba(222,148,45,.34)] max-[460px]:w-full max-[460px]:justify-center`} onClick={onNext}>{nextLabel}<span aria-hidden="true">→</span></button>
    </div>
  );
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

const ROLES = [
  { id: 'usuario', emoji: '👤', titulo: 'Usuário', desc: 'Compre e troque ingressos de eventos.' },
  { id: 'organizador', emoji: '🎪', titulo: 'Organizador', desc: 'Crie e gerencie seus eventos.' },
  { id: 'fornecedor', emoji: '🏢', titulo: 'Fornecedor', desc: 'Ofereça serviços para organizadores.' }
]

const SERVICES = [
  { id: 'som_luz', emoji: '🔊', label: 'Som e Luz' },
  { id: 'seguranca', emoji: '🛡️', label: 'Segurança' },
  { id: 'catering', emoji: '🍽️', label: 'Catering / Buffet' },
  { id: 'decoracao', emoji: '🎨', label: 'Decoração' },
  { id: 'foto_video', emoji: '📸', label: 'Foto e Vídeo' },
  { id: 'transporte', emoji: '🚌', label: 'Transporte' },
  { id: 'estrutura', emoji: '🏗️', label: 'Estrutura / Palco' },
  { id: 'outro', emoji: '➕', label: 'Outro' }
]

function StepDots({ current, total }) {
  const items = []
  for (let i = 0; i < total; i++) {
    const isActive = i === current
    const isDone = i < current
    items.push(
      <div key={`d${i}`} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${isDone || isActive ? 'bg-[#1A2E4A] text-white' : 'bg-slate-200 text-slate-500'} ${isActive ? 'ring-4 ring-indigo-100' : ''}`}>{isDone ? '✓' : i + 1}</div>
    )
    if (i < total - 1) {
      items.push(<div key={`l${i}`} className={`flex-1 h-[3px] mx-2 transition-all duration-200 ${isDone ? 'bg-[#1A2E4A]' : 'bg-slate-200'}`} />)
    }
  }
  return <div className="flex items-center justify-between mb-10">{items}</div>
}

function Campo({ id, label, type, placeholder, value, onChange, error }) {
  return (
    <div className="mb-6 flex flex-col">
      <label htmlFor={id} className="text-sm font-semibold text-[#1A2E4A] mb-2">{label}</label>
      <input id={id} type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className={`w-full px-4 py-3 text-[15px] border rounded-xl outline-none transition-all duration-200 ${error ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-slate-200 bg-slate-50 focus:border-[#1A2E4A] focus:bg-white focus:ring-4 focus:ring-indigo-100'}`} />
      {error && <span className="text-red-500 font-medium mt-1.5 text-xs">{error}</span>}
    </div>
  )
}

export default function Cadastro() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [role, setRole] = useState('')
  const [done, setDone] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmSenha, setConfirmSenha] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [areas, setAreas] = useState([''])
  const [services, setServices] = useState([])
  const [errors, setErrors] = useState({})
  const [code] = useState(() => 'TT-' + Math.random().toString(36).substr(2, 6).toUpperCase())
  const [areaFor, setAreaFor] = useState('')

  const totalSteps = role === 'fornecedor' ? 4 : role === 'organizador' ? 3 : 2

  function validate() {
    const e = {}
    if (step === 0) {
      if (!nome.trim()) e.nome = 'Nome obrigatório.'
      if (!email.trim()) e.email = 'E-mail obrigatório.'
      else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido.'
      if (!senha) e.senha = 'Senha obrigatória.'
      else if (senha.length < 6) e.senha = 'Mínimo 6 caracteres.'
      if (!confirmSenha) e.confirmSenha = 'Confirme sua senha.'
      else if (senha !== confirmSenha) e.confirmSenha = 'As senhas não coincidem.'
    }
    if (step === 2 && role !== 'usuario') {
      if (!empresa.trim()) e.empresa = 'Nome da empresa obrigatório.'
      if (!cnpj.trim()) e.cnpj = 'CNPJ obrigatório.'
      if (role === 'organizador' && !areas.some(a => a.trim())) e.area = 'Informe ao menos uma área de atuação.'
    }
    if (step === 3 && role === 'fornecedor') {
      if (services.length === 0) e.services = 'Selecione ao menos um serviço.'
    }
    return e
  }

  function handleNext() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    if (step === 1 && role === 'usuario') { setDone(true); return }
    if (step === 2 && role === 'organizador') { setDone(true); return }
    if (step === 3 && role === 'fornecedor') { setDone(true); return }
    setStep(s => s + 1)
  }

  const toggleService = id => setServices(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id])
  const addArea = () => setAreas(p => [...p, ''])
  const removeArea = i => setAreas(p => p.filter((_, idx) => idx !== i))
  const updateArea = (i, v) => setAreas(p => p.map((a, idx) => idx === i ? v : a))

  if (done) {
    const isUser = role === 'usuario'
    return (
      <div className="min-h-screen bg-[#00193b] flex items-center justify-center px-4 py-8 font-sans text-slate-800">
        <div className="w-full max-w-[540px]">
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-xl border border-slate-200 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-emerald-500 stroke-2 stroke-linecap-round stroke-linejoin-round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Cadastro Realizado!</h2>
            <p className="text-slate-500 text-[15px] mb-6">{isUser ? 'Bem-vindo ao TrocaTicket! Sua conta está pronta.' : <><strong>{role === 'organizador' ? 'Organizador' : 'Fornecedor'}</strong>: sua solicitação foi enviada.</>}</p>
            {!isUser && <span className="font-mono text-xl font-bold bg-slate-100 px-5 py-2 rounded-xl tracking-[2px] mb-8 border border-dashed border-slate-200">{code}</span>}
            {!isUser && (
              <div className="w-full mb-10">
                <div className="flex items-center justify-between px-[10%]">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-white stroke-2"><polyline points="20 6 9 17 4 12" /></svg></div>
                  <div className="flex-1 h-[2px] bg-slate-200" /><div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 text-xs font-semibold flex items-center justify-center">2</div>
                  <div className="flex-1 h-[2px] bg-slate-200" /><div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 text-xs font-semibold flex items-center justify-center">3</div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[11px] font-semibold text-emerald-500 w-[70px] leading-tight">Cadastro<br />Enviado</span><div className="flex-1" />
                  <span className="text-[11px] font-semibold text-slate-400 w-[70px] leading-tight">Em<br />Análise</span><div className="flex-1" />
                  <span className="text-[11px] font-semibold text-slate-400 w-[70px] leading-tight">Conta<br />Aprovada</span>
                </div>
              </div>
            )}
            <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-[400px]">{isUser ? 'Você já pode comprar e trocar ingressos na plataforma.' : 'Um administrador irá revisar sua conta. Você receberá um e-mail quando for aprovada.'}</p>
            <button className="w-full py-3 px-6 text-[15px] font-semibold rounded-xl bg-[#1A2E4A] text-white hover:bg-indigo-600" onClick={() => navigate('/')}>{isUser ? 'Ir para a plataforma' : 'Voltar ao início'}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#00193b]">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[540px]">
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-xl border border-slate-200 text-slate-800">
            {step === 0 && (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-[#1A2E4A] mb-2">Criar conta</h1>
                <p className="text-slate-500 text-[15px] mb-8">Preencha seus dados para acessar o TrocaTicket.</p>
                <StepDots current={step} total={totalSteps} />
                <Campo id="nome" label="Nome completo" type="text" placeholder="Seu nome completo" value={nome} onChange={setNome} error={errors.nome} />
                <Campo id="email" label="E-mail" type="email" placeholder="seuemail@exemplo.com" value={email} onChange={setEmail} error={errors.email} />
                <Campo id="senha" label="Senha" type="password" placeholder="••••••••" value={senha} onChange={setSenha} error={errors.senha} />
                <Campo id="csenha" label="Confirmar senha" type="password" placeholder="••••••••" value={confirmSenha} onChange={setConfirmSenha} error={errors.confirmSenha} />
                <div className="flex justify-end gap-4 mt-8">
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-[#1A2E4A] text-white hover:bg-indigo-600" onClick={handleNext}>Próximo</button>
                </div>
                <p className="text-center text-sm text-slate-500 mt-6">Já tem conta? <Link to="/login" className="text-[#1A2E4A] font-semibold no-underline hover:underline">Entrar</Link></p>
              </>
            )}
            {step === 1 && (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-[#1A2E4A] mb-2">Tipo de conta</h1>
                <p className="text-slate-500 text-[15px] mb-8">Como você quer participar do TrocaTicket?</p>
                <StepDots current={step} total={totalSteps} />
                <div className="flex flex-col gap-4 mb-8">
                  {ROLES.map(r => (
                    <button key={r.id} type="button" className={`w-full flex items-center gap-5 p-5 border-2 rounded-xl text-left transition-all duration-200 hover:border-slate-300 hover:-translate-y-px ${role === r.id ? 'border-[#1A2E4A] bg-indigo-50/50' : 'border-slate-200 bg-white'}`} onClick={() => setRole(r.id)}>
                      <span className="text-3xl bg-slate-100 w-12 h-12 flex items-center justify-center rounded-xl">{r.emoji}</span>
                      <div className="flex flex-col gap-1"><strong className="text-base text-slate-900">{r.titulo}</strong><span className="text-sm text-slate-500">{r.desc}</span></div>
                    </button>
                  ))}
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8">
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-white text-slate-500 border border-slate-200" onClick={() => setStep(s => s - 1)}>Voltar</button>
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-[#1A2E4A] text-white hover:bg-indigo-600 disabled:bg-slate-200 disabled:cursor-not-allowed" onClick={handleNext} disabled={!role}>{role === 'usuario' ? 'Concluir' : 'Próximo'}</button>
                </div>
              </>
            )}
            {step === 2 && role === 'organizador' && (
              <>
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold mb-4">🎪 Organizador</span>
                <h1 className="text-3xl font-bold tracking-tight text-[#1A2E4A] mb-2">Dados da Empresa</h1>
                <p className="text-slate-500 text-[15px] mb-8">Informações para sua conta de organizador.</p>
                <StepDots current={step} total={totalSteps} />
                <Campo id="empresa" label="Nome da empresa" type="text" placeholder="Razão social" value={empresa} onChange={setEmpresa} error={errors.empresa} />
                <Campo id="cnpj" label="CNPJ" type="text" placeholder="XX.XXX.XXX/XXXX-XX" value={cnpj} onChange={setCnpj} error={errors.cnpj} />
                <label className="text-sm font-semibold text-[#1A2E4A] mb-2">Área de atuação <span className="font-normal text-slate-500">— tipo de evento</span></label>
                <div className="flex flex-col gap-2 mb-2">
                  {areas.map((a, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" placeholder="Ex: Shows" value={a} onChange={e => updateArea(i, e.target.value)} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl outline-none focus:border-[#1A2E4A] focus:bg-white" />
                      {areas.length > 1 && <button type="button" className="border border-slate-200 text-slate-500 rounded-xl w-11 hover:bg-red-100 hover:text-red-500" onClick={() => removeArea(i)}>×</button>}
                    </div>
                  ))}
                </div>
                {errors.area && <span className="text-red-500 text-xs font-medium mt-1 mb-2 block">{errors.area}</span>}
                <button type="button" className="border border-dashed border-[#1A2E4A] text-[#1A2E4A] p-2.5 rounded-xl font-semibold text-sm mt-2 w-full" onClick={addArea}>+ Outra área</button>
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8">
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-white text-slate-500 border border-slate-200" onClick={() => setStep(s => s - 1)}>Voltar</button>
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-[#1A2E4A] text-white" onClick={handleNext}>Criar solicitação</button>
                </div>
              </>
            )}
            {step === 2 && role === 'fornecedor' && (
              <>
                <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-semibold mb-4">🏢 Fornecedor</span>
                <h1 className="text-3xl font-bold tracking-tight text-[#1A2E4A] mb-2">Dados da Empresa</h1>
                <p className="text-slate-500 text-[15px] mb-8">Identificação corporativa do seu negócio.</p>
                <StepDots current={step} total={totalSteps} />
                <Campo id="empresa" label="Nome da empresa" type="text" placeholder="Razão social" value={empresa} onChange={setEmpresa} error={errors.empresa} />
                <Campo id="cnpj" label="CNPJ" type="text" placeholder="XX.XXX.XXX/XXXX-XX" value={cnpj} onChange={setCnpj} error={errors.cnpj} />
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8">
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-white text-slate-500 border border-slate-200" onClick={() => setStep(s => s - 1)}>Voltar</button>
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-[#1A2E4A] text-white" onClick={handleNext}>Próximo</button>
                </div>
              </>
            )}
            {step === 3 && role === 'fornecedor' && (
            <>
              <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-semibold mb-4">🏢 Fornecedor</span>
              <h1 className="text-3xl font-bold tracking-tight text-[#1A2E4A] mb-2">Serviços Oferecidos</h1>
              <p className="text-slate-500 text-[15px] mb-8">Selecione os serviços que você oferece para eventos.</p>
              <StepDots current={step} total={totalSteps} />

              <label className="text-sm font-semibold text-[#1A2E4A] mb-2">Serviços <span className="font-normal text-slate-500">— selecione todos que se aplicam</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                {SERVICES.map(sv => (
                  <button 
                    key={sv.id} 
                    type="button" 
                    className={
                      "flex " +
                      "items-center " +
                      "gap-3 " +
                      "p-3 " +
                      "border " +
                      "rounded-xl " +
                      "text-left " +
                      "text-sm " +
                      (services.includes(sv.id) 
                        ? "border-[#1A2E4A] bg-indigo-50/50" 
                        : "border-slate-200 bg-white")
                    } 
                    onClick={() => toggleService(sv.id)}
                  >
                    <span 
                      className={
                        "w-[18px] " +
                        "h-[18px] " +
                        "border-2 " +
                        "rounded " +
                        "flex-shrink-0 " +
                        "relative " +
                        (services.includes(sv.id) 
                          ? "border-[#1A2E4A] bg-[#1A2E4A] after:content-[\"✓\"] after:text-white after:text-[11px] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2" 
                          : "border-slate-200")
                      } 
                    />
                    <span>{sv.emoji} {sv.label}</span>
                  </button>
                ))}
              </div>
              {errors.services && <span className="text-red-500 text-xs font-medium mt-2 block">{errors.services}</span>}
              
              <div className="my-6">
                <Campo 
                  id="areaFor" 
                  label="Área de atuação geográfica" 
                  type="text" 
                  placeholder="Ex: São Paulo e Grande SP" 
                  value={areaFor} 
                  onChange={setAreaFor} 
                />
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8">
                <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-white text-slate-500 border border-slate-200" onClick={() => setStep(s => s - 1)}>Voltar</button>
                <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-[#1A2E4A] text-white" onClick={handleNext}>Criar solicitação</button>
              </div>
            </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

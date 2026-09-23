import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/CadastroUnificado.css'
import Footer from '../components/Footer'

/* ─────────────────────────────────────────
   Constantes
───────────────────────────────────────── */
const ROLES = [
  {
    id: 'usuario',
    emoji: '👤',
    titulo: 'Usuário',
    desc: 'Compre e troque ingressos de eventos.',
  },
  {
    id: 'organizador',
    emoji: '🎪',
    titulo: 'Organizador',
    desc: 'Crie e gerencie seus eventos.',
  },
  {
    id: 'fornecedor',
    emoji: '🏢',
    titulo: 'Fornecedor',
    desc: 'Ofereça serviços para organizadores.',
  },
]

const SERVICES = [
  { id: 'som_luz',    emoji: '🔊', label: 'Som e Luz'         },
  { id: 'seguranca',  emoji: '🛡️', label: 'Segurança'          },
  { id: 'catering',   emoji: '🍽️', label: 'Catering / Buffet'  },
  { id: 'decoracao',  emoji: '🎨', label: 'Decoração'          },
  { id: 'foto_video', emoji: '📸', label: 'Foto e Vídeo'       },
  { id: 'transporte', emoji: '🚌', label: 'Transporte'         },
  { id: 'estrutura',  emoji: '🏗️', label: 'Estrutura / Palco'  },
  { id: 'outro',      emoji: '➕', label: 'Outro'              },
]

/* ─────────────────────────────────────────
   Sub-componentes
───────────────────────────────────────── */

/** Barra de progresso reutilizável */
function StepDots({ current, total }) {
  const items = []
  for (let i = 0; i < total; i++) {
    const cls = i < current ? 'done' : i === current ? 'active' : 'pending'
    items.push(
      <div key={`d${i}`} className={`cu-dot ${cls}`}>
        {i < current ? '✓' : i + 1}
      </div>
    )
    if (i < total - 1) {
      items.push(
        <div key={`l${i}`} className={`cu-line ${i < current ? 'done' : ''}`} />
      )
    }
  }
  return <div className="cu-steps">{items}</div>
}

/** Campo de formulário com label e mensagem de erro */
function Campo({ id, label, type, placeholder, value, onChange, error }) {
  return (
    <div className="cu-campo">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={error ? 'cu-input--erro' : ''}
      />
      {error && <span className="cu-erro-msg">{error}</span>}
    </div>
  )
}

/* ─────────────────────────────────────────
   Componente Principal
───────────────────────────────────────── */
export default function CadastroUnificado() {
  const navigate = useNavigate()

  /* ── Controle de fluxo ── */
  const [step, setStep] = useState(0)
  const [role, setRole] = useState('')
  const [done, setDone] = useState(false)

  /* ── Step 0 — Dados pessoais ── */
  const [nome,         setNome]         = useState('')
  const [email,        setEmail]        = useState('')
  const [senha,        setSenha]        = useState('')
  const [confirmSenha, setConfirmSenha] = useState('')

  /* ── Step 2 — Dados da empresa (org + for) ── */
  const [empresa, setEmpresa] = useState('')
  const [cnpj,    setCnpj]    = useState('')

  /* ── Step 2 extra — Área de atuação (organizador) ── */
  const [areas, setAreas] = useState([''])

  /* ── Step 3 — Serviços (fornecedor) ── */
  const [services, setServices] = useState([])
  const [areaFor,  setAreaFor]  = useState('')

  const [errors, setErrors] = useState({})

  /* Código único gerado uma vez */
  const [code] = useState(
    () => 'TT-' + Math.random().toString(36).substr(2, 6).toUpperCase()
  )

  /* ── Número total de steps por role ── */
  const totalSteps =
    role === 'fornecedor'  ? 4 :
    role === 'organizador' ? 3 : 2

  /* ─────────────────────────────────────────
     Validação
  ───────────────────────────────────────── */
  function validate() {
    const e = {}

    if (step === 0) {
      if (!nome.trim())               e.nome         = 'Nome obrigatório.'
      if (!email.trim())              e.email        = 'E-mail obrigatório.'
      else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido.'
      if (!senha)                     e.senha        = 'Senha obrigatória.'
      else if (senha.length < 6)      e.senha        = 'Mínimo 6 caracteres.'
      if (!confirmSenha)              e.confirmSenha = 'Confirme sua senha.'
      else if (senha !== confirmSenha) e.confirmSenha = 'As senhas não coincidem.'
    }

    if (step === 2 && role !== 'usuario') {
      if (!empresa.trim()) e.empresa = 'Nome da empresa obrigatório.'
      if (!cnpj.trim())    e.cnpj    = 'CNPJ obrigatório.'
      if (role === 'organizador' && !areas.some(a => a.trim()))
        e.area = 'Informe ao menos uma área de atuação.'
    }

    if (step === 3 && role === 'fornecedor') {
      if (services.length === 0) e.services = 'Selecione ao menos um serviço.'
    }

    return e
  }

  /* ─────────────────────────────────────────
     Handlers
  ───────────────────────────────────────── */
  function handleNext() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})

    if (step === 1 && role === 'usuario')     { setDone(true); return }
    if (step === 2 && role === 'organizador') { setDone(true); return }
    if (step === 3 && role === 'fornecedor')  { setDone(true); return }
    setStep(s => s + 1)
  }

  function handleBack() {
    setErrors({})
    setStep(s => s - 1)
  }

  function toggleService(id) {
    setServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const addArea    = ()      => setAreas(prev => [...prev, ''])
  const removeArea = i       => setAreas(prev => prev.filter((_, idx) => idx !== i))
  const updateArea = (i, v)  => setAreas(prev => prev.map((a, idx) => idx === i ? v : a))

  /* ─────────────────────────────────────────
     Tela de Sucesso
  ───────────────────────────────────────── */
  if (done) {
    const isUser    = role === 'usuario'
    const roleLabel = role === 'organizador' ? 'Organizador' : 'Fornecedor'

    return (
      <div className="cu-page">
        <div className="cu-container">
          <div className="cu-card cu-card--sucesso">

            <div className="cu-ok-icone">
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 className="cu-ok-titulo">Cadastro Realizado!</h2>

            <p className="cu-ok-sub">
              {isUser
                ? 'Bem-vindo ao TrocaTicket! Sua conta está pronta.'
                : <><strong>{roleLabel}</strong>: sua solicitação foi enviada.</>}
            </p>

            {!isUser && <span className="cu-ok-code">{code}</span>}

            {!isUser && (
              <div className="cu-timeline">
                {/* Linha 1 — dots + conectores */}
                <div className="cu-tl-dots">
                  <div className="cu-tl-dot done">
                    <svg viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="cu-tl-conn" />
                  <div className="cu-tl-dot">2</div>
                  <div className="cu-tl-conn" />
                  <div className="cu-tl-dot">3</div>
                </div>

                {/* Linha 2 — labels alinhados aos dots */}
                <div className="cu-tl-labels">
                  <span className="cu-tl-label done">Cadastro<br />Enviado</span>
                  <span className="cu-tl-spacer" />
                  <span className="cu-tl-label">Em<br />Análise</span>
                  <span className="cu-tl-spacer" />
                  <span className="cu-tl-label">Conta<br />Aprovada</span>
                </div>
              </div>
            )}

            <p className="cu-wait-msg">
              {isUser
                ? 'Você já pode comprar e trocar ingressos na plataforma.'
                : 'Um administrador irá revisar sua conta. Você receberá um e-mail quando for aprovada.'}
            </p>

            <button className="cu-btn-primario" onClick={() => navigate('/')}>
              {isUser ? 'Ir para a plataforma' : 'Voltar ao início'}
            </button>

          </div>
        </div>
      </div>
    )
  }

  /* ─────────────────────────────────────────
     Tela principal (steps)
  ───────────────────────────────────────── */
  return (
    <>
    <div className="cu-page">
      <div className="cu-container">
        <div className="cu-card">

          {/* ══ STEP 0 — Dados pessoais ══ */}
          {step === 0 && (
            <>
              <h1>Criar conta</h1>
              <p className="cu-sub">Preencha seus dados para acessar o TrocaTicket.</p>

              <StepDots current={step} total={totalSteps} />

              <Campo id="nome"   label="Nome completo"   type="text"
                placeholder="Seu nome completo"    value={nome}         onChange={setNome}         error={errors.nome} />
              <Campo id="email"  label="E-mail"          type="email"
                placeholder="seuemail@exemplo.com" value={email}        onChange={setEmail}        error={errors.email} />
              <Campo id="senha"  label="Senha"           type="password"
                placeholder="••••••••"             value={senha}        onChange={setSenha}        error={errors.senha} />
              <Campo id="csenha" label="Confirmar senha" type="password"
                placeholder="••••••••"             value={confirmSenha} onChange={setConfirmSenha} error={errors.confirmSenha} />

              <div className="cu-acoes cu-acoes--unico">
                <button className="cu-btn-primario" onClick={handleNext}>Próximo</button>
              </div>

              <p className="cu-hint">
                Já tem conta? <Link to="/login">Entrar</Link>
              </p>
            </>
          )}

          {/* ══ STEP 1 — Tipo de conta ══ */}
          {step === 1 && (
            <>
              <h1>Tipo de conta</h1>
              <p className="cu-sub">Como você quer participar do TrocaTicket?</p>

              <StepDots current={step} total={totalSteps} />

              <div className="cu-roles">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    className={`cu-role-card ${role === r.id ? 'selecionado' : ''}`}
                    onClick={() => setRole(r.id)}
                  >
                    <span className="cu-role-emoji">{r.emoji}</span>
                    <div className="cu-role-info">
                      <strong>{r.titulo}</strong>
                      <span>{r.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="cu-acoes">
                <button className="cu-btn-voltar" onClick={handleBack}>Voltar</button>
                <button className="cu-btn-primario" onClick={handleNext} disabled={!role}>
                  {role === 'usuario' ? 'Concluir' : 'Próximo'}
                </button>
              </div>
            </>
          )}

          {/* ══ STEP 2A — Dados Organizador ══ */}
          {step === 2 && role === 'organizador' && (
            <>
              <span className="cu-badge cu-badge--org">🎪 Organizador</span>
              <h1>Dados da Empresa</h1>
              <p className="cu-sub">Informações para sua conta de organizador.</p>

              <StepDots current={step} total={totalSteps} />

              <Campo id="empresa" label="Nome da empresa" type="text"
                placeholder="Razão social ou nome fantasia"
                value={empresa} onChange={setEmpresa} error={errors.empresa} />
              <Campo id="cnpj" label="CNPJ" type="text"
                placeholder="XX.XXX.XXX/XXXX-XX"
                value={cnpj} onChange={setCnpj} error={errors.cnpj} />

              <div className="cu-campo">
                <label>
                  Área de atuação
                  <span className="cu-label-hint"> — que tipo de evento você organiza?</span>
                </label>

                {areas.map((a, i) => (
                  <div key={i} className="cu-area-row">
                    <input
                      type="text"
                      placeholder="Ex: Shows e Festivais"
                      value={a}
                      onChange={e => updateArea(i, e.target.value)}
                    />
                    {areas.length > 1 && (
                      <button type="button" className="cu-btn-rm" onClick={() => removeArea(i)}>×</button>
                    )}
                  </div>
                ))}

                {errors.area && <span className="cu-erro-msg">{errors.area}</span>}

                <button type="button" className="cu-btn-add" onClick={addArea}>
                  <span>+</span> Adicionar outra área
                </button>
              </div>

              <div className="cu-acoes">
                <button className="cu-btn-voltar" onClick={handleBack}>Voltar</button>
                <button className="cu-btn-primario" onClick={handleNext}>Criar solicitação</button>
              </div>
            </>
          )}

          {/* ══ STEP 2B — Dados Fornecedor (empresa) ══ */}
          {step === 2 && role === 'fornecedor' && (
            <>
              <span className="cu-badge cu-badge--for">🏢 Fornecedor</span>
              <h1>Dados da Empresa</h1>
              <p className="cu-sub">Identificação corporativa do seu negócio.</p>

              <StepDots current={step} total={totalSteps} />

              <Campo id="empresa" label="Nome da empresa" type="text"
                placeholder="Razão social ou nome fantasia"
                value={empresa} onChange={setEmpresa} error={errors.empresa} />
              <Campo id="cnpj" label="CNPJ" type="text"
                placeholder="XX.XXX.XXX/XXXX-XX"
                value={cnpj} onChange={setCnpj} error={errors.cnpj} />

              <div className="cu-acoes">
                <button className="cu-btn-voltar" onClick={handleBack}>Voltar</button>
                <button className="cu-btn-primario" onClick={handleNext}>Próximo</button>
              </div>
            </>
          )}

          {/* ══ STEP 3 — Serviços Fornecedor ══ */}
          {step === 3 && role === 'fornecedor' && (
            <>
              <span className="cu-badge cu-badge--for">🏢 Fornecedor</span>
              <h1>Serviços Oferecidos</h1>
              <p className="cu-sub">Selecione os serviços que você oferece para eventos.</p>

              <StepDots current={step} total={totalSteps} />

              <div className="cu-campo">
                <label>
                  Serviços
                  <span className="cu-label-hint"> — selecione todos que se aplicam</span>
                </label>

                <div className="cu-srv-grid">
                  {SERVICES.map(sv => (
                    <button
                      key={sv.id}
                      type="button"
                      className={`cu-srv-btn ${services.includes(sv.id) ? 'selecionado' : ''}`}
                      onClick={() => toggleService(sv.id)}
                    >
                      <span className="cu-srv-check" />
                      <span>{sv.emoji} {sv.label}</span>
                    </button>
                  ))}
                </div>

                {errors.services && <span className="cu-erro-msg">{errors.services}</span>}
              </div>

              <hr className="cu-divider" />

              <Campo
                id="areaFor"
                label="Área de atuação geográfica"
                type="text"
                placeholder="Ex: São Paulo e Grande SP"
                value={areaFor}
                onChange={setAreaFor}
              />

              <div className="cu-acoes">
                <button className="cu-btn-voltar" onClick={handleBack}>Voltar</button>
                <button className="cu-btn-primario" onClick={handleNext}>Criar solicitação</button>
              </div>
            </>
          )}
        
        </div>
      </div>
    </div>
    
    <Footer/>
    </>
  )
}

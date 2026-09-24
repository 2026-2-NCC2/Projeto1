import React, { useState } from 'react'
import { ui, inputClass } from '../styles/ui'

const ROLES = [
  { id: 'usuario',     icon: '👤', titulo: 'Usuário',     desc: 'Compre e troque ingressos.' },
  { id: 'organizador', icon: '🎪', titulo: 'Organizador', desc: 'Crie e gerencie eventos.' },
  { id: 'fornecedor',  icon: '🏢', titulo: 'Fornecedor',  desc: 'Ofereça serviços a eventos.' },
]

const STEPS = ['Dados pessoais', 'Tipo de conta', 'Detalhes']

export default function TelaDeEscolha() {
  const [step, setStep] = useState(0)
  const [finalizado, setFinalizado] = useState(false)
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', confirmSenha: '',
    role: '',
    empresa: '', cnpj: '', areaAtuacao: '',
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  function nextStep() {
    if (step === 1 && form.role === 'usuario') setFinalizado(true)
    else if (step < STEPS.length - 1) setStep((s) => s + 1)
    else setFinalizado(true)
  }

  function prevStep() {
    setStep((s) => s - 1)
  }

  if (finalizado) {
    return (
      <div className={ui.page}>
        <div className={ui.container}>
          <div className={`${ui.card} text-center`}>
            <span className="block text-5xl mb-4">🎉</span>
            <h1 className={ui.title}>Cadastro Realizado!</h1>
            <p className={ui.subtitle}>
              Sua solicitação como <strong>{form.role.toUpperCase()}</strong> foi recebida com sucesso.
            </p>
            <button className={ui.btnVoltar} onClick={() => { setStep(0); setFinalizado(false) }}>
              Recomeçar
            </button>
          </div>
        </div>
      </div>
    )
  }

  const subtituloEtapa = 'text-sm font-medium text-navy mb-3'

  return (
    <div className={ui.page}>
      <div className={ui.container}>
        <div className={ui.card}>
          <h1 className={ui.title}>Criar conta</h1>
          <p className={ui.subtitle}>Preencha as informações para acessar o TrocaTicket</p>

          {/* Indicador de etapas */}
          <div className="flex flex-col min-[480px]:flex-row min-[480px]:justify-between gap-1 min-[480px]:gap-0 mb-6 pb-3 border-b border-borda">
            {STEPS.map((s, i) => (
              <div key={s}
                className={`text-[13px] transition-colors ${i === step ? 'text-navy font-bold' : 'text-muted font-medium'}`}>
                {i + 1}. {s}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div>
              <div className={ui.campo}>
                <label htmlFor="nome" className={ui.label}>Nome completo</label>
                <input id="nome" name="nome" type="text" placeholder="Seu nome completo"
                  value={form.nome} onChange={handleChange} className={inputClass()} />
              </div>
              <div className={ui.campo}>
                <label htmlFor="email" className={ui.label}>E-mail</label>
                <input id="email" name="email" type="email" placeholder="seuemail@exemplo.com"
                  value={form.email} onChange={handleChange} className={inputClass()} />
              </div>
              <div className={ui.campo}>
                <label htmlFor="senha" className={ui.label}>Senha</label>
                <input id="senha" name="senha" type="password" placeholder="••••••••"
                  value={form.senha} onChange={handleChange} className={inputClass()} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className={subtituloEtapa}>Como quer participar?</p>
              <div className="flex flex-col gap-3 mb-5">
                {ROLES.map((r) => (
                  <button key={r.id} type="button"
                    onClick={() => setForm((p) => ({ ...p, role: r.id }))}
                    className={`flex items-center w-full p-4 border-[1.5px] rounded-lg cursor-pointer text-left transition-all hover:border-navy ${
                      form.role === r.id ? 'border-navy bg-[#EBF1FA]' : 'border-borda bg-white hover:bg-[#F8FAFC]'
                    }`}>
                    <span className="text-2xl mr-3.5">{r.icon}</span>
                    <div className="flex flex-col">
                      <strong className="text-[15px] font-bold text-navy">{r.titulo}</strong>
                      <span className="mt-0.5 text-xs text-muted">{r.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className={subtituloEtapa}>Dados corporativos ({form.role})</p>
              <div className={ui.campo}>
                <label htmlFor="empresa" className={ui.label}>Nome da empresa</label>
                <input id="empresa" name="empresa" type="text" placeholder="Razão social ou fantasia"
                  value={form.empresa} onChange={handleChange} className={inputClass()} />
              </div>
              <div className={ui.campo}>
                <label htmlFor="cnpj" className={ui.label}>CNPJ</label>
                <input id="cnpj" name="cnpj" type="text" placeholder="00.000.000/0001-00"
                  value={form.cnpj} onChange={handleChange} className={inputClass()} />
              </div>
            </div>
          )}

          <div className={`grid gap-4 items-center mt-6 ${step === 0 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {step > 0 && (
              <button type="button" className={ui.btnVoltar} onClick={prevStep}>Voltar</button>
            )}
            <button type="button" className={ui.btnPrimary} onClick={nextStep}
              disabled={step === 1 && !form.role}>
              {step === STEPS.length - 1 || (step === 1 && form.role === 'usuario') ? 'Concluir' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

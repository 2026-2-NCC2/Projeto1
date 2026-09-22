import React, { useState } from 'react';
import '../styles/TelaDeEscolha.css'

const ROLES = [
  { id: 'usuario',     icon: '👤', titulo: 'Usuário',     desc: 'Compre e troque ingressos.' },
  { id: 'organizador', icon: '🎪', titulo: 'Organizador', desc: 'Crie e gerencie eventos.' },
  { id: 'fornecedor',  icon: '🏢', titulo: 'Fornecedor',  desc: 'Ofereça serviços a eventos.' },
];

const STEPS = ['Dados pessoais', 'Tipo de conta', 'Detalhes'];

export default function TelaDeEscolha() {
  const [step, setStep] = useState(0);
  const [finalizado, setFinalizado] = useState(false);
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', confirmSenha: '',
    role: '',
    empresa: '', cnpj: '', areaAtuacao: '',
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  }

  function nextStep() {
    // Se for usuário comum na etapa 1, vai direto para o fim
    if (step === 1 && form.role === 'usuario') {
      setFinalizado(true);
    } else if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      setFinalizado(true);
    }
  }

  function prevStep() {
    setStep(s => s - 1);
  }

  // Tela de Sucesso Isolada
  if (finalizado) {
    return (
      <div className="cadastro-page">
        <div className="cadastro-container">
          <div className="cadastro-card sucesso-container">
            <span className="sucesso-icon">🎉</span>
            <h1>Cadastro Realizado!</h1>
            <p className="subtitulo">
              Sua solicitação como <strong>{form.role.toUpperCase()}</strong> foi recebida com sucesso.
            </p>
            <button 
              className="btn-voltar" 
              onClick={() => { setStep(0); setFinalizado(false); }}
            >
              Recomeçar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cadastro-page">
      <div className="cadastro-container">
        <div className="cadastro-card">
          <h1>Criar conta</h1>
          <p className="subtitulo">Preencha as informações para acessar o TrocaTicket</p>

          {/* Indicador de Etapas */}
          <div className="etapas-indicador">
            {STEPS.map((s, i) => (
              <div key={s} className={`etapa-item ${i === step ? 'ativa' : ''}`}>
                {i + 1}. {s}
              </div>
            ))}
          </div>

          {/* Formulários por Etapa */}
          <div>
            {/* Etapa 0: Dados pessoais */}
            {step === 0 && (
              <div>
                <div className="campo">
                  <label htmlFor="nome">Nome completo</label>
                  <input id="nome" name="nome" type="text" placeholder="Seu nome completo" value={form.nome} onChange={handleChange} />
                </div>
                <div className="campo">
                  <label htmlFor="email">E-mail</label>
                  <input id="email" name="email" type="email" placeholder="seuemail@exemplo.com" value={form.email} onChange={handleChange} />
                </div>
                <div className="campo">
                  <label htmlFor="senha">Senha</label>
                  <input id="senha" name="senha" type="password" placeholder="••••••••" value={form.senha} onChange={handleChange} />
                </div>
              </div>
            )}

            {/* Etapa 1: Seleção de Tipo de Conta */}
            {step === 1 && (
              <div>
                <p className="campo" style={{ fontWeight: '500', color: '#1A2E4A', fontSize: '14px', marginBottom: '12px' }}>
                  Como quer participar?
                </p>
                <div className="role-container">
                  {ROLES.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      className={`role-card ${form.role === r.id ? 'selecionado' : ''}`}
                      onClick={() => setForm(p => ({ ...p, role: r.id }))}
                    >
                      <span className="role-icon">{r.icon}</span>
                      <div className="role-info">
                        <strong className="role-titulo">{r.titulo}</strong>
                        <span className="role-desc">{r.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Etapa 2: Detalhes da Empresa */}
            {step === 2 && (
              <div>
                <p className="campo" style={{ fontWeight: '500', color: '#1A2E4A', fontSize: '14px', marginBottom: '12px' }}>
                  Dados corporativos ({form.role})
                </p>
                <div className="campo">
                  <label htmlFor="empresa">Nome da empresa</label>
                  <input id="empresa" name="empresa" type="text" placeholder="Razão social ou fantasia" value={form.empresa} onChange={handleChange} />
                </div>
                <div className="campo">
                  <label htmlFor="cnpj">CNPJ</label>
                  <input id="cnpj" name="cnpj" type="text" placeholder="00.000.000/0001-00" value={form.cnpj} onChange={handleChange} />
                </div>
              </div>
            )}

            {/* Grid Dinâmico de Botões de Ação */}
            <div className={`botoes-inferiores ${step === 0 ? 'unico' : ''}`}>
              {step > 0 && (
                <button type="button" className="btn-voltar" onClick={prevStep}>
                  Voltar
                </button>
              )}
              
              <button 
                type="button" 
                className="btn-cadastrar" 
                onClick={nextStep} 
                disabled={step === 1 && !form.role}
              >
                {step === STEPS.length - 1 || (step === 1 && form.role === 'usuario') ? 'Concluir' : 'Próximo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
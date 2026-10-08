import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import { cadastrarUsuario } from '../services/api'

// tipos de conta que a pessoa pode escolher no cadastro
// id = valor que vai pro back-end (bate com o ENUM da tabela usuario.perfil) / emoji, titulo e desc = o que aparece no card
const ROLES = [
  { id: 'cliente', emoji: '👤', titulo: 'Usuário', desc: 'Compre e troque ingressos de eventos.' },
  { id: 'organizador', emoji: '🎪', titulo: 'Organizador', desc: 'Crie e gerencie seus eventos.' },
  { id: 'fornecedor', emoji: '🏢', titulo: 'Fornecedor', desc: 'Ofereça serviços para organizadores.' }
]

// servicos que o fornecedor pode marcar (so aparece se escolher fornecedor)
// pra adicionar um servico novo e so colocar mais um item aqui
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

// bolinhas de progresso do cadastro (1 --- 2 --- 3)
// current = etapa atual (comeca do 0) / total = quantas etapas tem
function StepDots({ current, total }) {
  const items = []
  for (let i = 0; i < total; i++) {
    const isActive = i === current // etapa que ta agora
    const isDone = i < current     // etapas que ja passaram
    // bolinha: ja feita ou atual fica azul, as proximas ficam cinza
    // a atual ganha um anel em volta, e as feitas mostram ✓ no lugar do numero
    items.push(
      <div key={`d${i}`} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${isDone || isActive ? 'bg-tt-azul-principal text-tt-branco' : 'bg-tt-azul-marinho/10 text-tt-grafite/70'} ${isActive ? 'ring-4 ring-tt-azul-suave' : ''}`}>{isDone ? '✓' : i + 1}</div>
    )
    // linha entre as bolinhas (menos depois da ultima), fica azul quando a etapa ja foi feita
    if (i < total - 1) {
      items.push(<div key={`l${i}`} className={`flex-1 h-[3px] mx-2 transition-all duration-200 ${isDone ? 'bg-tt-azul-principal' : 'bg-tt-azul-marinho/10'}`} />)
    }
  }
  return <div className="flex items-center justify-between mb-10">{items}</div>
}

// campo de texto reutilizavel do cadastro (label + input + erro)
// onChange ja devolve so o valor digitado, sem o evento
function Campo({ id, label, type, placeholder, value, onChange, error }) {
  return (
    <div className="mb-6 flex flex-col">
      {/* htmlFor liga o label ao input, clicando no texto ja foca no campo */}
      <label htmlFor={id} className="text-sm font-semibold text-tt-azul-principal mb-2">{label}</label>
      {/* se tiver erro a borda fica vermelha, senao fica cinza e azul no foco */}
      <input id={id} type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className={`w-full px-4 py-3 text-[15px] border rounded-xl outline-none transition-all duration-200 ${error ? 'border-tt-rosa-principal bg-tt-rosa-claro/30 focus:border-tt-rosa-principal focus:ring-4 focus:ring-tt-rosa-claro' : 'border-tt-azul-marinho/12 bg-tt-cinza-claro focus:border-tt-azul-principal focus:bg-tt-branco focus:ring-4 focus:ring-tt-azul-suave'}`} />
      {/* mensagem de erro embaixo, so aparece se tiver */}
      {error && <span className="text-tt-rosa-principal font-medium mt-1.5 text-xs">{error}</span>}
    </div>
  )
}

// pagina de cadastro, dividida em etapas
export default function Cadastro() {
  const navigate = useNavigate() // pra mudar de pagina pelo codigo

  // controle das etapas
  const [step, setStep] = useState(0)   // etapa atual
  const [role, setRole] = useState('')  // tipo de conta escolhido
  const [done, setDone] = useState(false) // true quando termina o cadastro

  // dados basicos
  const [nome, setNome] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [idade, setIdade] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmSenha, setConfirmSenha] = useState('')

  // dados da empresa (organizador e fornecedor)
  const [empresa, setEmpresa] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [areas, setAreas] = useState(['']) // comeca com um campo vazio
  const [services, setServices] = useState([]) // servicos marcados pelo fornecedor

  const [errors, setErrors] = useState({}) // mensagens de erro dos campos

  // estado da chamada pro backend
  const [apiLoading, setApiLoading] = useState(false) // true enquanto espera a resposta do /api/cadastro
  const [apiError, setApiError] = useState('')        // mensagem de erro geral da API (ex: erro 500)

  // codigo aleatorio do cadastro (ex: TT-A1B2C3), a funcao no useState faz ele ser gerado so uma vez
  const [code] = useState(() => 'TT-' + Math.random().toString(36).substr(2, 6).toUpperCase())
  const [areaFor, setAreaFor] = useState('')

  // quantidade de etapas muda conforme o tipo de conta
  // fornecedor tem a etapa de servicos a mais
  const totalSteps = role === 'fornecedor' ? 4 : role === 'organizador' ? 3 : 2

  // valida os campos da etapa atual e devolve um objeto com os erros
  // se voltar vazio e porque ta tudo certo
  function validate() {
    // comeca vazio, e cada campo com problema ganha uma chave aqui (ex: e.email = 'E-mail inválido.')
    const e = {}

    // etapa 0: dados basicos
    if (step === 0) {
      if (!nome.trim()) e.nome = 'Nome obrigatório.'
      if (!username.trim()) e.username = 'Username obrigatório.'

      // idade: obrigatoria, nao pode ser negativa e tem que ser um numero plausivel
      if (!idade.trim()) e.idade = 'Idade obrigatória.'
      else if (Number.isNaN(Number(idade))) e.idade = 'Idade inválida.'
      else if (Number(idade) < 0) e.idade = 'Idade não pode ser negativa.'
      else if (Number(idade) > 120) e.idade = 'Idade inválida.'

      // regex simples, so confere se tem algo@algo.algo
      if (!email.trim()) e.email = 'E-mail obrigatório.'
      else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido.'
      if (!senha) e.senha = 'Senha obrigatória.'
      else if (senha.length < 6) e.senha = 'Mínimo 6 caracteres.'
      if (!confirmSenha) e.confirmSenha = 'Confirme sua senha.'
      else if (senha !== confirmSenha) e.confirmSenha = 'As senhas não coincidem.'
    }

    // etapa 2: dados da empresa (cliente nao passa por aqui)
    if (step === 2 && role !== 'cliente') {
      if (!empresa.trim()) e.empresa = 'Nome da empresa obrigatório.'
      if (!cnpj.trim()) e.cnpj = 'CNPJ obrigatório.'
      // organizador precisa preencher pelo menos uma area
      if (role === 'organizador' && !areas.some(a => a.trim())) e.area = 'Informe ao menos uma área de atuação.'
    }

    // etapa 3: servicos, so pro fornecedor
    if (step === 3 && role === 'fornecedor') {
      if (services.length === 0) e.services = 'Selecione ao menos um serviço.'
    }

    // devolve os erros pra quem chamou o validate()
    // se voltar {} vazio pode avancar, senao mostra as mensagens nos campos
    return e
  }

  // envia os dados pro backend (POST /api/cadastro) e so marca como concluido se der certo
  async function finalizarCadastro() {
    setApiError('')
    setApiLoading(true)
    try {
      await cadastrarUsuario({
        nome,
        username,
        email,
        idade: Number(idade),
        senha,
        perfil: role, // 'cliente' | 'organizador' | 'fornecedor'
      })
      setDone(true)
    } catch (err) {
      if (err.status === 409) {
        // e-mail ja cadastrado: volta pra etapa 0 e mostra o erro no campo certo
        setStep(0)
        setErrors((prev) => ({ ...prev, email: 'E-mail já cadastrado.' }))
      } else {
        setApiError('Não foi possível concluir o cadastro. Tente novamente em instantes.')
      }
    } finally {
      setApiLoading(false)
    }
  }

  // roda quando clica no botao de continuar
  function handleNext() {
    const errs = validate()
    // se tiver algum erro, mostra nos campos e para aqui
    if (Object.keys(errs).length) { setErrors(errs); return }
    // se passou, limpa os erros antigos
    setErrors({})

    // se for a ultima etapa daquele tipo de conta, finaliza o cadastro (chama a API)
    if (step === 1 && role === 'cliente') { finalizarCadastro(); return }
    if (step === 2 && role === 'organizador') { finalizarCadastro(); return }
    if (step === 3 && role === 'fornecedor') { finalizarCadastro(); return }

    // senao vai pra proxima etapa
    setStep(s => s + 1)
  }

  // marca ou desmarca um servico (se ja ta na lista tira, se nao ta adiciona)
  const toggleService = id => setServices(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id])

  // funcoes dos campos de area de atuacao
  const addArea = () => setAreas(p => [...p, ''])                                        // adiciona um campo novo vazio
  const removeArea = i => setAreas(p => p.filter((_, idx) => idx !== i))                 // remove o campo da posicao i
  const updateArea = (i, v) => setAreas(p => p.map((a, idx) => idx === i ? v : a))       // atualiza o texto do campo i

  // tela final, aparece depois que termina o cadastro
  if (done) {
    const isUser = role === 'cliente' // cliente ja entra direto, os outros precisam de aprovacao

    return (
      // fundo azul escuro ocupando a tela toda, com o card centralizado
      <div className="min-h-screen bg-tt-azul-marinho flex items-center justify-center px-4 py-8 font-sans text-tt-grafite">
        <div className="w-full max-w-[540px]">
          <div className="bg-tt-branco rounded-2xl p-6 md:p-10 shadow-xl border border-tt-azul-marinho/12 flex flex-col items-center text-center">

            {/* bolinha verde com o check */}
            <div className="w-16 h-16 bg-tt-verde-claro rounded-full flex items-center justify-center mb-6">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-tt-verde-sucesso stroke-2 stroke-linecap-round stroke-linejoin-round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>

            <h2 className="text-3xl font-bold tracking-tight mb-2">Cadastro Realizado!</h2>

            {/* mensagem muda: cliente ja ta pronto, organizador/fornecedor ficou pendente */}
            <p className="text-tt-grafite/70 text-[15px] mb-6">
              {isUser ? 'Bem-vindo ao TrocaTicket! Sua conta está pronta.' : <><strong>{role === 'organizador' ? 'Organizador' : 'Fornecedor'}</strong>: sua solicitação foi enviada.</>}
            </p>

            {/* codigo do cadastro, so pra quem precisa de aprovacao */}
            {!isUser && <span className="font-mono text-xl font-bold bg-tt-cinza-claro px-5 py-2 rounded-xl tracking-[2px] mb-8 border border-dashed border-tt-azul-marinho/12">{code}</span>}

            {/* linha do tempo da aprovacao: enviado -> em analise -> aprovado */}
            {!isUser && (
              <div className="w-full mb-10">
                {/* bolinhas e linhas, so a primeira ta verde porque o cadastro acabou de ser enviado */}
                <div className="flex items-center justify-between px-[10%]">
                  <div className="w-7 h-7 rounded-full bg-tt-verde-sucesso text-tt-branco text-xs font-semibold flex items-center justify-center"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-tt-branco stroke-2"><polyline points="20 6 9 17 4 12" /></svg></div>
                  <div className="flex-1 h-[2px] bg-tt-azul-marinho/10" />
                  <div className="w-7 h-7 rounded-full bg-tt-azul-marinho/10 text-tt-grafite/70 text-xs font-semibold flex items-center justify-center">2</div>
                  <div className="flex-1 h-[2px] bg-tt-azul-marinho/10" />
                  <div className="w-7 h-7 rounded-full bg-tt-azul-marinho/10 text-tt-grafite/70 text-xs font-semibold flex items-center justify-center">3</div>
                </div>

                {/* nomes embaixo de cada bolinha */}
                <div className="flex justify-between mt-2">
                  <span className="text-[11px] font-semibold text-tt-verde-sucesso w-[70px] leading-tight">Cadastro<br />Enviado</span>
                  <div className="flex-1" />
                  <span className="text-[11px] font-semibold text-tt-grafite/50 w-[70px] leading-tight">Em<br />Análise</span>
                  <div className="flex-1" />
                  <span className="text-[11px] font-semibold text-tt-grafite/50 w-[70px] leading-tight">Conta<br />Aprovada</span>
                </div>
              </div>
            )}
            {/* texto explicando o proximo passo, muda conforme o tipo de conta */}
            <p className="text-sm text-tt-grafite/70 leading-relaxed mb-8 max-w-[400px]">
              {isUser ? 'Você já pode comprar e trocar ingressos na plataforma.' : 'Um administrador irá revisar sua conta. Você receberá um e-mail quando for aprovada.'}
            </p>

            {/* botao que volta pra home, so o texto muda */}
            <button className="w-full py-3 px-6 text-[15px] font-semibold rounded-xl bg-tt-azul-principal text-tt-branco hover:bg-tt-azul-principal" onClick={() => navigate('/')}>
              {isUser ? 'Ir para a plataforma' : 'Voltar ao início'}
            </button>

          </div>
        </div>
      </div>
    )
  }
  // fim da tela final

  // formulario normal (enquanto o cadastro nao terminou)
  return (
    // fundo azul escuro com o card centralizado
    <div className="flex flex-col min-h-screen bg-tt-azul-marinho">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[540px]">
          <div className="bg-tt-branco rounded-2xl p-6 md:p-10 shadow-xl border border-tt-azul-marinho/12 text-tt-grafite">

            {/* ETAPA 0: dados basicos */}
            {step === 0 && (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-tt-azul-principal mb-2">Criar conta</h1>
                <p className="text-tt-grafite/70 text-[15px] mb-8">Preencha seus dados para acessar o TrocaTicket.</p>

                {/* bolinhas de progresso */}
                <StepDots current={step} total={totalSteps} />

                {/* campos, cada um mostra o proprio erro se tiver */}
                <Campo id="nome" label="Nome completo" type="text" placeholder="Seu nome completo" value={nome} onChange={setNome} error={errors.nome} />
                <Campo id="username" label="Username" type="text" placeholder="Seu nome para a plataforma" value={username} onChange={setUsername} error={errors.username} />
                <Campo id="email" label="E-mail" type="email" placeholder="seuemail@exemplo.com" value={email} onChange={setEmail} error={errors.email} />
                <Campo id="idade" label="Idade" type="number" placeholder="20" min="0" max="100" value={idade} onChange={setIdade} error={errors.idade} />
                <Campo id="senha" label="Senha" type="password" placeholder="••••••••" value={senha} onChange={setSenha} error={errors.senha} />
                <Campo id="csenha" label="Confirmar senha" type="password" placeholder="••••••••" value={confirmSenha} onChange={setConfirmSenha} error={errors.confirmSenha} />

                {/* botao de avancar, passa pela validacao antes */}
                <div className="flex justify-end gap-4 mt-8">
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-tt-azul-principal text-tt-branco hover:bg-tt-azul-principal" onClick={handleNext}>Próximo</button>
                </div>

                {/* link pra quem ja tem conta */}
                <p className="text-center text-sm text-tt-grafite/70 mt-6">
                  Já tem conta? <Link to="/login" className="text-tt-azul-principal font-semibold no-underline hover:underline">Entrar</Link>
                </p>
              </>
            )}
            {/* ETAPA 1: escolher o tipo de conta */}
            {step === 1 && (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-tt-azul-principal mb-2">Tipo de conta</h1>
                <p className="text-tt-grafite/70 text-[15px] mb-8">Como você quer participar do TrocaTicket?</p>

                <StepDots current={step} total={totalSteps} />

                {/* um card pra cada opcao do ROLES */}
                <div className="flex flex-col gap-4 mb-8">
                  {ROLES.map(r => (
                    // o selecionado fica com borda azul e fundo clarinho
                    <button key={r.id} type="button" className={`w-full flex items-center gap-5 p-5 border-2 rounded-xl text-left transition-all duration-200 hover:border-tt-azul-marinho/20 hover:-translate-y-px ${role === r.id ? 'border-tt-azul-principal bg-tt-azul-suave/50' : 'border-tt-azul-marinho/12 bg-tt-branco'}`} onClick={() => setRole(r.id)}>
                      {/* emoji do tipo de conta */}
                      <span className="text-3xl bg-tt-cinza-claro w-12 h-12 flex items-center justify-center rounded-xl">{r.emoji}</span>
                      {/* titulo e descricao */}
                      <div className="flex flex-col gap-1">
                        <strong className="text-base text-tt-azul-marinho">{r.titulo}</strong>
                        <span className="text-sm text-tt-grafite/70">{r.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* erro geral da API (ex: backend fora do ar) */}
                {apiError && <p className="text-tt-rosa-principal font-medium text-sm mb-4">{apiError}</p>}

                {/* botoes de voltar e avancar, no celular o avancar fica em cima */}
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8">
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-tt-branco text-tt-grafite/70 border border-tt-azul-marinho/12" onClick={() => setStep(s => s - 1)} disabled={apiLoading}>Voltar</button>
                  {/* fica desativado ate escolher um tipo ou enquanto envia, e pro cliente ja vira "Concluir" */}
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-tt-azul-principal text-tt-branco hover:bg-tt-azul-principal disabled:bg-tt-azul-marinho/10 disabled:cursor-not-allowed" onClick={handleNext} disabled={!role || apiLoading}>
                    {apiLoading ? 'Enviando...' : (role === 'cliente' ? 'Concluir' : 'Próximo')}
                  </button>
                </div>
              </>
            )}            
            
            {/* ETAPA 2 (organizador): dados da empresa */}
            {step === 2 && role === 'organizador' && (
              <>
                {/* etiqueta mostrando qual tipo de conta foi escolhido */}
                <span className="inline-block px-3 py-1 bg-tt-laranja-claro text-tt-azul-marinho rounded-full text-xs font-semibold mb-4">🎪 Organizador</span>
                <h1 className="text-3xl font-bold tracking-tight text-tt-azul-principal mb-2">Dados da Empresa</h1>
                <p className="text-tt-grafite/70 text-[15px] mb-8">Informações para sua conta de organizador.</p>

                <StepDots current={step} total={totalSteps} />

                <Campo id="empresa" label="Nome da empresa" type="text" placeholder="Razão social" value={empresa} onChange={setEmpresa} error={errors.empresa} />
                <Campo id="cnpj" label="CNPJ" type="text" placeholder="XX.XXX.XXX/XXXX-XX" value={cnpj} onChange={setCnpj} error={errors.cnpj} />

                {/* areas de atuacao: da pra adicionar mais de uma */}
                <label className="text-sm font-semibold text-tt-azul-principal mb-2">Área de atuação <span className="font-normal text-tt-grafite/70">— tipo de evento</span></label>
                <div className="flex flex-col gap-2 mb-2">
                  {/* um input pra cada area da lista */}
                  {areas.map((a, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" placeholder="Ex: Shows" value={a} onChange={e => updateArea(i, e.target.value)} className="w-full px-4 py-3 border border-tt-azul-marinho/12 bg-tt-cinza-claro rounded-xl outline-none focus:border-tt-azul-principal focus:bg-tt-branco" />
                      {/* botao de remover, so aparece se tiver mais de uma area */}
                      {areas.length > 1 && <button type="button" className="border border-tt-azul-marinho/12 text-tt-grafite/70 rounded-xl w-11 hover:bg-tt-rosa-claro hover:text-tt-rosa-principal" onClick={() => removeArea(i)}>×</button>}
                    </div>
                  ))}
                </div>

                {/* erro das areas fica embaixo da lista */}
                {errors.area && <span className="text-tt-rosa-principal text-xs font-medium mt-1 mb-2 block">{errors.area}</span>}

                {/* adiciona mais um campo de area */}
                <button type="button" className="border border-dashed border-tt-azul-principal text-tt-azul-principal p-2.5 rounded-xl font-semibold text-sm mt-2 w-full" onClick={addArea}>+ Outra área</button>

                {/* erro geral da API */}
                {apiError && <p className="text-tt-rosa-principal font-medium text-sm mt-4">{apiError}</p>}

                {/* voltar e finalizar (organizador termina aqui) */}
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8">
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-tt-branco text-tt-grafite/70 border border-tt-azul-marinho/12" onClick={() => setStep(s => s - 1)} disabled={apiLoading}>Voltar</button>
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-tt-azul-principal text-tt-branco disabled:bg-tt-azul-marinho/10 disabled:cursor-not-allowed" onClick={handleNext} disabled={apiLoading}>
                    {apiLoading ? 'Enviando...' : 'Criar solicitação'}
                  </button>
                </div>
              </>
            )}
            
            {/* ETAPA 2 (fornecedor): dados da empresa */}
            {/* parecida com a do organizador, mas sem as areas de atuacao */}
            {step === 2 && role === 'fornecedor' && (
              <>
                {/* etiqueta do tipo de conta */}
                <span className="inline-block px-3 py-1 bg-tt-azul-suave text-tt-azul-principal rounded-full text-xs font-semibold mb-4">🏢 Fornecedor</span>
                <h1 className="text-3xl font-bold tracking-tight text-tt-azul-principal mb-2">Dados da Empresa</h1>
                <p className="text-tt-grafite/70 text-[15px] mb-8">Identificação corporativa do seu negócio.</p>

                <StepDots current={step} total={totalSteps} />

                <Campo id="empresa" label="Nome da empresa" type="text" placeholder="Razão social" value={empresa} onChange={setEmpresa} error={errors.empresa} />
                <Campo id="cnpj" label="CNPJ" type="text" placeholder="XX.XXX.XXX/XXXX-XX" value={cnpj} onChange={setCnpj} error={errors.cnpj} />

                {/* voltar e avancar (fornecedor ainda tem a etapa de servicos) */}
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8">
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-tt-branco text-tt-grafite/70 border border-tt-azul-marinho/12" onClick={() => setStep(s => s - 1)}>Voltar</button>
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-tt-azul-principal text-tt-branco" onClick={handleNext}>Próximo</button>
                </div>
              </>
            )}
            
            {/* ETAPA 3 (fornecedor): escolher os servicos */}
            {step === 3 && role === 'fornecedor' && (
              <>
                {/* etiqueta do tipo de conta */}
                <span className="inline-block px-3 py-1 bg-tt-azul-suave text-tt-azul-principal rounded-full text-xs font-semibold mb-4">🏢 Fornecedor</span>
                <h1 className="text-3xl font-bold tracking-tight text-tt-azul-principal mb-2">Serviços Oferecidos</h1>
                <p className="text-tt-grafite/70 text-[15px] mb-8">Selecione os serviços que você oferece para eventos.</p>

                <StepDots current={step} total={totalSteps} />

                <label className="text-sm font-semibold text-tt-azul-principal mb-2">Serviços <span className="font-normal text-tt-grafite/70">— selecione todos que se aplicam</span></label>

                {/* grade de servicos, 1 coluna no celular e 2 em tela maior */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                  {/* um botao pra cada servico do SERVICES */}
                  {SERVICES.map(sv => (
                    <button
                      key={sv.id}
                      type="button"
                      // classes fixas + borda azul se o servico estiver marcado
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
                          ? "border-tt-azul-principal bg-tt-azul-suave/50"
                          : "border-tt-azul-marinho/12 bg-tt-branco")
                      }
                      // clicou marca, clicou de novo desmarca
                      onClick={() => toggleService(sv.id)}
                    >
                      {/* quadradinho de checkbox feito na mao */}
                      <span
                        className={
                          "w-[18px] " +
                          "h-[18px] " +
                          "border-2 " +
                          "rounded " +
                          "flex-shrink-0 " +
                          "relative " +
                          // marcado: fica azul e o after coloca o ✓ branco no meio
                          (services.includes(sv.id)
                            ? "border-tt-azul-principal bg-tt-azul-principal after:content-[\"✓\"] after:text-tt-branco after:text-[11px] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2"
                            : "border-tt-azul-marinho/12")
                        }
                      />
                      {/* emoji e nome do servico */}
                      <span>{sv.emoji} {sv.label}</span>
                    </button>
                  ))}
                </div>

                {/* erro se nao marcar nenhum servico */}
                {errors.services && <span className="text-tt-rosa-principal text-xs font-medium mt-2 block">{errors.services}</span>}              
              
                {/* regiao onde o fornecedor atende, esse campo nao e obrigatorio */}
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

                {/* erro geral da API */}
                {apiError && <p className="text-tt-rosa-principal font-medium text-sm mb-2">{apiError}</p>}

                {/* voltar e finalizar (fornecedor termina aqui) */}
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8">
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-tt-branco text-tt-grafite/70 border border-tt-azul-marinho/12" onClick={() => setStep(s => s - 1)} disabled={apiLoading}>Voltar</button>
                  <button className="w-full sm:w-auto py-3 px-6 text-[15px] font-semibold rounded-xl bg-tt-azul-principal text-tt-branco disabled:bg-tt-azul-marinho/10 disabled:cursor-not-allowed" onClick={handleNext} disabled={apiLoading}>
                    {apiLoading ? 'Enviando...' : 'Criar solicitação'}
                  </button>
                </div>
              </>
            )}
            {/* fim das etapas */}

          </div>
        </div>
      </div>

      {/* rodape do site */}
      <Footer />
    </div>
  )
}
// fim do Cadastro

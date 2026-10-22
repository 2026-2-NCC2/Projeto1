import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Sticker from '../components/Sticker'
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

// classes que se repetem nos botoes e campos do cadastro (mesmo visual do Login: cantos retos, linha preta fina e sombra dura)
const BTN_BASE = 'w-full sm:w-auto cursor-pointer rounded-none border-[1.5px] border-tt-azul-marinho px-7 py-3 text-[15px] font-bold transition duration-150 disabled:cursor-not-allowed disabled:border-tt-azul-marinho/20 disabled:bg-tt-azul-marinho/10 disabled:text-tt-grafite/45 disabled:shadow-none disabled:translate-y-0'
// botao principal (magenta) e botao de voltar (escuro)
const BTN_PRIMARIO = `${BTN_BASE} bg-tt-laranja-principal text-tt-azul-marinho hover:-translate-y-px hover:bg-tt-laranja-vivo hover:shadow-[4px_4px_0_var(--tt-azul-marinho)]`
const BTN_VOLTAR = `${BTN_BASE} bg-tt-branco text-tt-azul-marinho hover:-translate-y-px hover:bg-tt-lilas-claro hover:shadow-[4px_4px_0_var(--tt-azul-marinho)]`
// input de texto, a borda fica rosa se tiver erro e ganha sombra roxa no foco
const inputCls = (erro) =>
  `w-full rounded-none border-[1.5px] px-3.5 py-3 text-[15px] text-tt-azul-marinho outline-none transition duration-150 placeholder:text-tt-grafite/45 focus:border-tt-roxo-vivo focus:shadow-[3px_3px_0_var(--tt-roxo-vivo)] ${
    erro ? 'border-tt-rosa-principal bg-tt-rosa-claro/40' : 'border-tt-azul-marinho bg-tt-branco'
  }`
// legenda de campo
const LABEL_CLS = 'mb-2 block text-sm font-bold text-tt-azul-marinho'

// moldura da pagina de cadastro: fundo escuro com manchas de luz, o card no meio e os adesivos em volta
// children = o conteudo do card / adesivos mudam um pouco entre o formulario e a tela final (done)
function Cena({ children, done = false }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-tt-azul-marinho bg-[radial-gradient(ellipse_60%_50%_at_85%_8%,color-mix(in_srgb,var(--tt-roxo-vivo)_55%,transparent),transparent),radial-gradient(ellipse_50%_45%_at_10%_95%,color-mix(in_srgb,var(--tt-rosa-vivo)_40%,transparent),transparent)]">
      <div className="relative z-[1] flex flex-1 items-center justify-center px-4 py-14 sm:py-16">
        {/* o relative aqui e o que prende os adesivos no card */}
        <div className="relative w-full max-w-[540px]">
          {children}

          {/* adesivo pequeno na quina do card, vale pra celular e tablet */}
          <Sticker nome={done ? 'estrela' : 'cd'} tamanho={done ? 78 : 70} rotate={done ? -14 : 14} className="-right-2 -top-9 z-[3] lg:hidden" />
          {/* adesivos grandes nas laterais, so aparecem quando ha espaco (tela larga) */}
          {/* ficam por cima do card (z-[3]) e entram so uns 26px nele, na parte do padding, entao nao cobrem nenhum campo */}
          {done ? (
            <>
              <Sticker nome="estrela" tamanho={128} rotate={-14} delay={0.3} className="-left-[102px] -top-8 z-[3] hidden lg:block" />
              <Sticker nome="cd" tamanho={140} rotate={10} delay={1} className="-right-[114px] top-[8%] z-[3] hidden lg:block" />
              <Sticker nome="vinil" tamanho={150} rotate={-8} delay={1.8} className="-left-[124px] bottom-[6%] z-[3] hidden lg:block" />
              <Sticker nome="tv" tamanho={150} rotate={6} delay={0.6} className="-right-[124px] bottom-[10%] z-[3] hidden lg:block" />
            </>
          ) : (
            <>
              <Sticker nome="vinil" tamanho={150} rotate={-12} delay={0.3} className="-left-[124px] top-[6%] z-[3] hidden lg:block" />
              <Sticker nome="fita" tamanho={160} rotate={8} delay={1.4} className="-left-[134px] bottom-[8%] z-[3] hidden lg:block" />
              <Sticker nome="tv" tamanho={160} rotate={7} delay={0.8} className="-right-[134px] top-[3%] z-[3] hidden lg:block" />
              <Sticker nome="estrela" tamanho={104} rotate={-14} delay={2} className="-right-[78px] top-[40%] z-[3] hidden lg:block" />
              <Sticker nome="globo" tamanho={110} rotate={10} delay={1} className="-right-[84px] bottom-[6%] z-[3] hidden lg:block" />
            </>
          )}
        </div>
      </div>

      {/* rodape do site */}
      <Footer />
    </div>
  )
}

// card branco onde fica o formulario: canto reto, linha preta e sombra roxa dura
function Card({ children, className = '' }) {
  return (
    <div className={`relative z-[2] border-[1.5px] border-tt-azul-marinho bg-tt-branco p-6 text-tt-grafite shadow-[10px_10px_0_var(--tt-roxo-vivo)] sm:p-10 ${className}`}>
      {children}
    </div>
  )
}

// cabecalho de cada etapa: legenda "Etapa x de y", titulo grande e subtitulo
// destaque = palavra do titulo que fica so com contorno (opcional)
function Titulo({ etapa, total, titulo, destaque, sub, children }) {
  return (
    <header className="mb-7">
      {children}
      <span className="tt-eyebrow text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em]">Etapa {etapa + 1} de {total}</span>
      <h1 className="tt-display mb-3 mt-3 text-[clamp(30px,6vw,42px)] text-tt-azul-marinho">
        {titulo}{destaque && <> <span className="tt-outline">{destaque}</span></>}
      </h1>
      <p className="m-0 text-[15px] leading-[1.55] text-tt-grafite/75">{sub}</p>
    </header>
  )
}

// etiqueta com o tipo de conta escolhido (aparece nas etapas da empresa)
function Etiqueta({ children, fundo }) {
  return <span className={`mb-4 inline-block rounded-full border-[1.5px] border-tt-azul-marinho px-3 py-1 text-xs font-bold text-tt-azul-marinho ${fundo}`}>{children}</span>
}

// indicador de progresso do cadastro (1 --- 2 --- 3), agora com quadrados e linha preta
// current = etapa atual (comeca do 0) / total = quantas etapas tem
function StepDots({ current, total }) {
  const items = []
  for (let i = 0; i < total; i++) {
    const isActive = i === current // etapa que ta agora
    const isDone = i < current     // etapas que ja passaram
    // atual = preto com sombra roxa / feitas = roxo com ✓ no lugar do numero / proximas = branco
    items.push(
      <div key={`d${i}`} className={`flex size-9 shrink-0 items-center justify-center border-[1.5px] border-tt-azul-marinho text-sm font-extrabold transition duration-150 ${isActive ? 'bg-tt-azul-marinho text-tt-branco shadow-[3px_3px_0_var(--tt-roxo-vivo)]' : isDone ? 'bg-tt-roxo-vivo text-tt-branco' : 'bg-tt-branco text-tt-grafite/60'}`}>{isDone ? '✓' : i + 1}</div>
    )
    // linha entre os quadrados (menos depois do ultimo), fica preta quando a etapa ja foi feita
    if (i < total - 1) {
      items.push(<div key={`l${i}`} className={`mx-2 h-[1.5px] flex-1 transition duration-150 ${isDone ? 'bg-tt-azul-marinho' : 'bg-tt-azul-marinho/20'}`} />)
    }
  }
  return <div className="mb-9 flex items-center justify-between">{items}</div>
}

// campo de texto reutilizavel do cadastro (label + input + erro)
// onChange ja devolve so o valor digitado, sem o evento
function Campo({ id, label, type, placeholder, value, onChange, error }) {
  return (
    <div className="mb-5 flex flex-col">
      {/* htmlFor liga o label ao input, clicando no texto ja foca no campo */}
      <label htmlFor={id} className={LABEL_CLS}>{label}</label>
      <input id={id} type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className={inputCls(error)} />
      {/* mensagem de erro embaixo, so aparece se tiver */}
      {error && <span className="mt-1.5 text-xs font-bold text-tt-rosa-principal">{error}</span>}
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
      const payload = {
        nome,
        username,
        email,
        idade: Number(idade),
        senha,
        perfil: role, // 'cliente' | 'organizador' | 'fornecedor'
      }

      // organizador e fornecedor tem tabela propria no banco, precisam de empresa/cnpj
      if (role === 'organizador' || role === 'fornecedor') {
        payload.empresa = empresa
        payload.cnpj = cnpj
      }

      // fornecedor.area_atuacao no banco e preenchido com os servicos marcados
      // (o campo "areaFor" do form e geografico e nao tem coluna no banco ainda, entao nao e enviado)
      if (role === 'fornecedor') {
        payload.areaAtuacao = services
          .map((id) => SERVICES.find((s) => s.id === id)?.label)
          .filter(Boolean)
          .join(', ')
      }

      await cadastrarUsuario(payload)
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
      <Cena done>
        <Card className="flex flex-col items-center text-center">

          {/* circulo preto com o check, no lugar da bolinha verde */}
          <div className="mb-6 grid size-16 place-items-center rounded-full border-[1.5px] border-tt-azul-marinho bg-tt-verde-claro shadow-[4px_4px_0_var(--tt-azul-marinho)]">
            <svg viewBox="0 0 24 24" className="size-8 fill-none stroke-tt-verde-sucesso stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round]"><polyline points="20 6 9 17 4 12" /></svg>
          </div>

          <h2 className="tt-display mb-3 text-[clamp(28px,6vw,40px)] text-tt-azul-marinho">Cadastro <span className="tt-outline">Realizado!</span></h2>

          {/* mensagem muda: cliente ja ta pronto, organizador/fornecedor ficou pendente */}
          <p className="mb-6 text-[15px] text-tt-grafite/75">
            {isUser ? 'Bem-vindo ao TrocaTicket! Sua conta está pronta.' : <><strong>{role === 'organizador' ? 'Organizador' : 'Fornecedor'}</strong>: sua solicitação foi enviada.</>}
          </p>

          {/* codigo do cadastro, so pra quem precisa de aprovacao */}
          {!isUser && <span className="mb-8 border-[1.5px] border-dashed border-tt-azul-marinho bg-tt-lilas-claro px-5 py-2 font-mono text-xl font-bold tracking-[2px] text-tt-azul-marinho">{code}</span>}

          {/* linha do tempo da aprovacao: enviado -> em analise -> aprovado */}
          {!isUser && (
            <div className="mb-10 w-full">
              {/* quadrados e linhas, so o primeiro ta preenchido porque o cadastro acabou de ser enviado */}
              <div className="flex items-center justify-between px-[10%]">
                <div className="flex size-8 items-center justify-center border-[1.5px] border-tt-azul-marinho bg-tt-verde-sucesso text-xs font-semibold text-tt-branco"><svg viewBox="0 0 24 24" className="size-4 fill-none stroke-tt-branco stroke-[2.5]"><polyline points="20 6 9 17 4 12" /></svg></div>
                <div className="h-[1.5px] flex-1 bg-tt-azul-marinho/25" />
                <div className="flex size-8 items-center justify-center border-[1.5px] border-tt-azul-marinho/40 bg-tt-branco text-xs font-bold text-tt-grafite/60">2</div>
                <div className="h-[1.5px] flex-1 bg-tt-azul-marinho/25" />
                <div className="flex size-8 items-center justify-center border-[1.5px] border-tt-azul-marinho/40 bg-tt-branco text-xs font-bold text-tt-grafite/60">3</div>
              </div>

              {/* nomes embaixo de cada quadrado */}
              <div className="mt-2 flex justify-between">
                <span className="w-[70px] text-[11px] font-bold leading-tight text-tt-verde-sucesso">Cadastro<br />Enviado</span>
                <div className="flex-1" />
                <span className="w-[70px] text-[11px] font-semibold leading-tight text-tt-grafite/60">Em<br />Análise</span>
                <div className="flex-1" />
                <span className="w-[70px] text-[11px] font-semibold leading-tight text-tt-grafite/60">Conta<br />Aprovada</span>
              </div>
            </div>
          )}
          {/* texto explicando o proximo passo, muda conforme o tipo de conta */}
          <p className="mb-8 max-w-[400px] text-sm leading-relaxed text-tt-grafite/75">
            {isUser ? 'Você já pode comprar e trocar ingressos na plataforma.' : 'Um administrador irá revisar sua conta. Você receberá um e-mail quando for aprovada.'}
          </p>

          {/* botao que volta pra home, so o texto muda */}
          <button className={`${BTN_PRIMARIO} sm:w-full`} onClick={() => navigate('/')}>
            {isUser ? 'Ir para a plataforma' : 'Voltar ao início'}
          </button>

        </Card>
      </Cena>
    )
  }
  // fim da tela final

  // formulario normal (enquanto o cadastro nao terminou)
  return (
    <Cena>
      <Card>

        {/* ETAPA 0: dados basicos */}
        {step === 0 && (
          <>
            <Titulo etapa={step} total={totalSteps} titulo="Criar" destaque="conta" sub="Preencha seus dados para acessar o TrocaTicket." />

            {/* progresso */}
            <StepDots current={step} total={totalSteps} />

            {/* campos, cada um mostra o proprio erro se tiver */}
            <Campo id="nome" label="Nome completo" type="text" placeholder="Seu nome completo" value={nome} onChange={setNome} error={errors.nome} />
            <Campo id="username" label="Username" type="text" placeholder="Seu nome para a plataforma" value={username} onChange={setUsername} error={errors.username} />
            <Campo id="email" label="E-mail" type="email" placeholder="seuemail@exemplo.com" value={email} onChange={setEmail} error={errors.email} />
            <Campo id="idade" label="Idade" type="number" placeholder="20" min="0" max="100" value={idade} onChange={setIdade} error={errors.idade} />
            <Campo id="senha" label="Senha" type="password" placeholder="••••••••" value={senha} onChange={setSenha} error={errors.senha} />
            <Campo id="csenha" label="Confirmar senha" type="password" placeholder="••••••••" value={confirmSenha} onChange={setConfirmSenha} error={errors.confirmSenha} />

            {/* botao de avancar, passa pela validacao antes */}
            <div className="mt-8 flex justify-end gap-4">
              <button className={BTN_PRIMARIO} onClick={handleNext}>Próximo</button>
            </div>

            {/* link pra quem ja tem conta */}
            <p className="mt-6 text-center text-sm text-tt-grafite/75">
              Já tem conta? <Link to="/login" className="font-bold text-tt-azul-marinho underline decoration-tt-roxo-vivo decoration-2 underline-offset-4">Entrar</Link>
            </p>
          </>
        )}
        {/* ETAPA 1: escolher o tipo de conta */}
        {step === 1 && (
          <>
            <Titulo etapa={step} total={totalSteps} titulo="Tipo de" destaque="conta" sub="Como você quer participar do TrocaTicket?" />

            <StepDots current={step} total={totalSteps} />

            {/* um card pra cada opcao do ROLES */}
            <div className="mb-8 flex flex-col gap-3.5">
              {ROLES.map(r => (
                // o selecionado ganha fundo lilas e sombra roxa dura
                <button key={r.id} type="button" aria-pressed={role === r.id} className={`flex w-full cursor-pointer items-center gap-4 border-[1.5px] border-tt-azul-marinho p-4 text-left transition duration-150 hover:-translate-y-px ${role === r.id ? 'bg-tt-lilas-claro shadow-[5px_5px_0_var(--tt-roxo-vivo)]' : 'bg-tt-branco hover:shadow-[4px_4px_0_var(--tt-azul-marinho)]'}`} onClick={() => setRole(r.id)}>
                  {/* emoji do tipo de conta */}
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-tt-azul-marinho text-2xl">{r.emoji}</span>
                  {/* titulo e descricao */}
                  <div className="flex flex-1 flex-col gap-0.5">
                    <strong className="font-display text-base font-extrabold text-tt-azul-marinho">{r.titulo}</strong>
                    <span className="text-[13px] leading-[1.45] text-tt-grafite/75">{r.desc}</span>
                  </div>
                  {/* quadradinho que marca qual esta escolhido */}
                  <span className={`grid size-5 shrink-0 place-items-center border-[1.5px] border-tt-azul-marinho text-[11px] font-black text-tt-branco ${role === r.id ? 'bg-tt-azul-marinho' : 'bg-tt-branco'}`} aria-hidden="true">{role === r.id ? '✓' : ''}</span>
                </button>
              ))}
            </div>

            {/* erro geral da API (ex: backend fora do ar) */}
            {apiError && <p className="mb-4 text-sm font-bold text-tt-rosa-principal">{apiError}</p>}

            {/* botoes de voltar e avancar, no celular o avancar fica em cima */}
            <div className="mt-8 flex flex-col-reverse justify-between gap-4 sm:flex-row">
              <button className={BTN_VOLTAR} onClick={() => setStep(s => s - 1)} disabled={apiLoading}>Voltar</button>
              {/* fica desativado ate escolher um tipo ou enquanto envia, e pro cliente ja vira "Concluir" */}
              <button className={BTN_PRIMARIO} onClick={handleNext} disabled={!role || apiLoading}>
                {apiLoading ? 'Enviando...' : (role === 'cliente' ? 'Concluir' : 'Próximo')}
              </button>
            </div>
          </>
        )}

        {/* ETAPA 2 (organizador): dados da empresa */}
        {step === 2 && role === 'organizador' && (
          <>
            <Titulo etapa={step} total={totalSteps} titulo="Dados da" destaque="Empresa" sub="Informações para sua conta de organizador.">
              {/* etiqueta mostrando qual tipo de conta foi escolhido */}
              <Etiqueta fundo="bg-tt-laranja-claro">🎪 Organizador</Etiqueta>
            </Titulo>

            <StepDots current={step} total={totalSteps} />

            <Campo id="empresa" label="Nome da empresa" type="text" placeholder="Razão social" value={empresa} onChange={setEmpresa} error={errors.empresa} />
            <Campo id="cnpj" label="CNPJ" type="text" placeholder="XX.XXX.XXX/XXXX-XX" value={cnpj} onChange={setCnpj} error={errors.cnpj} />

            {/* areas de atuacao: da pra adicionar mais de uma */}
            <label className={LABEL_CLS}>Área de atuação <span className="font-normal text-tt-grafite/70">— tipo de evento</span></label>
            <div className="mb-2 flex flex-col gap-2">
              {/* um input pra cada area da lista */}
              {areas.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" placeholder="Ex: Shows" value={a} onChange={e => updateArea(i, e.target.value)} className={inputCls(false)} />
                  {/* botao de remover, so aparece se tiver mais de uma area */}
                  {areas.length > 1 && <button type="button" className="w-11 shrink-0 cursor-pointer rounded-none border-[1.5px] border-tt-azul-marinho bg-tt-branco text-lg font-bold text-tt-azul-marinho transition-colors hover:bg-tt-rosa-claro hover:text-tt-rosa-principal" aria-label="Remover área" onClick={() => removeArea(i)}>×</button>}
                </div>
              ))}
            </div>

            {/* erro das areas fica embaixo da lista */}
            {errors.area && <span className="mb-2 mt-1 block text-xs font-bold text-tt-rosa-principal">{errors.area}</span>}

            {/* adiciona mais um campo de area */}
            <button type="button" className="mt-2 w-full cursor-pointer rounded-none border-[1.5px] border-dashed border-tt-azul-marinho bg-transparent p-2.5 text-sm font-bold text-tt-azul-marinho transition-colors hover:bg-tt-lilas-claro" onClick={addArea}>+ Outra área</button>

            {/* erro geral da API */}
            {apiError && <p className="mt-4 text-sm font-bold text-tt-rosa-principal">{apiError}</p>}

            {/* voltar e finalizar (organizador termina aqui) */}
            <div className="mt-8 flex flex-col-reverse justify-between gap-4 sm:flex-row">
              <button className={BTN_VOLTAR} onClick={() => setStep(s => s - 1)} disabled={apiLoading}>Voltar</button>
              <button className={BTN_PRIMARIO} onClick={handleNext} disabled={apiLoading}>
                {apiLoading ? 'Enviando...' : 'Criar solicitação'}
              </button>
            </div>
          </>
        )}

        {/* ETAPA 2 (fornecedor): dados da empresa */}
        {/* parecida com a do organizador, mas sem as areas de atuacao */}
        {step === 2 && role === 'fornecedor' && (
          <>
            <Titulo etapa={step} total={totalSteps} titulo="Dados da" destaque="Empresa" sub="Identificação corporativa do seu negócio.">
              {/* etiqueta do tipo de conta */}
              <Etiqueta fundo="bg-tt-azul-suave">🏢 Fornecedor</Etiqueta>
            </Titulo>

            <StepDots current={step} total={totalSteps} />

            <Campo id="empresa" label="Nome da empresa" type="text" placeholder="Razão social" value={empresa} onChange={setEmpresa} error={errors.empresa} />
            <Campo id="cnpj" label="CNPJ" type="text" placeholder="XX.XXX.XXX/XXXX-XX" value={cnpj} onChange={setCnpj} error={errors.cnpj} />

            {/* voltar e avancar (fornecedor ainda tem a etapa de servicos) */}
            <div className="mt-8 flex flex-col-reverse justify-between gap-4 sm:flex-row">
              <button className={BTN_VOLTAR} onClick={() => setStep(s => s - 1)}>Voltar</button>
              <button className={BTN_PRIMARIO} onClick={handleNext}>Próximo</button>
            </div>
          </>
        )}

        {/* ETAPA 3 (fornecedor): escolher os servicos */}
        {step === 3 && role === 'fornecedor' && (
          <>
            <Titulo etapa={step} total={totalSteps} titulo="Serviços" destaque="Oferecidos" sub="Selecione os serviços que você oferece para eventos.">
              {/* etiqueta do tipo de conta */}
              <Etiqueta fundo="bg-tt-azul-suave">🏢 Fornecedor</Etiqueta>
            </Titulo>

            <StepDots current={step} total={totalSteps} />

            <label className={LABEL_CLS}>Serviços <span className="font-normal text-tt-grafite/70">— selecione todos que se aplicam</span></label>

            {/* grade de servicos, 1 coluna no celular e 2 em tela maior */}
            <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* um botao pra cada servico do SERVICES */}
              {SERVICES.map(sv => {
                const marcado = services.includes(sv.id)
                return (
                  <button
                    key={sv.id}
                    type="button"
                    aria-pressed={marcado}
                    // borda preta fina, marcado ganha fundo lilas e sombra roxa
                    className={`flex cursor-pointer items-center gap-3 border-[1.5px] border-tt-azul-marinho p-3 text-left text-sm font-semibold text-tt-azul-marinho transition duration-150 hover:-translate-y-px ${marcado ? 'bg-tt-lilas-claro shadow-[3px_3px_0_var(--tt-roxo-vivo)]' : 'bg-tt-branco hover:shadow-[3px_3px_0_var(--tt-azul-marinho)]'}`}
                    // clicou marca, clicou de novo desmarca
                    onClick={() => toggleService(sv.id)}
                  >
                    {/* quadradinho de checkbox feito na mao */}
                    <span className={`grid size-[18px] shrink-0 place-items-center border-[1.5px] border-tt-azul-marinho text-[11px] font-black text-tt-branco ${marcado ? 'bg-tt-azul-marinho' : 'bg-tt-branco'}`} aria-hidden="true">{marcado ? '✓' : ''}</span>
                    {/* emoji e nome do servico */}
                    <span>{sv.emoji} {sv.label}</span>
                  </button>
                )
              })}
            </div>

            {/* erro se nao marcar nenhum servico */}
            {errors.services && <span className="mt-2 block text-xs font-bold text-tt-rosa-principal">{errors.services}</span>}

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
            {apiError && <p className="mb-2 text-sm font-bold text-tt-rosa-principal">{apiError}</p>}

            {/* voltar e finalizar (fornecedor termina aqui) */}
            <div className="mt-8 flex flex-col-reverse justify-between gap-4 sm:flex-row">
              <button className={BTN_VOLTAR} onClick={() => setStep(s => s - 1)} disabled={apiLoading}>Voltar</button>
              <button className={BTN_PRIMARIO} onClick={handleNext} disabled={apiLoading}>
                {apiLoading ? 'Enviando...' : 'Criar solicitação'}
              </button>
            </div>
          </>
        )}
        {/* fim das etapas */}

      </Card>
    </Cena>
  )
}
// fim do Cadastro

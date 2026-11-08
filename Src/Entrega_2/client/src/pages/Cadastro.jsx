import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CenaConta from '../components/ui/CenaConta'
import Etapas from '../components/ui/Etapas'
import Folha from '../components/ui/Folha'
import Aviso from '../components/ui/Aviso'
import {
  IconCamera, IconCheck, IconEscudo, IconMais, IconOnibus, IconPalco, IconPessoa, IconPincel, IconPrato, IconPredio, IconSom, IconX,
} from '../components/ui/Icones'
import { GELS, btn, campoCls, erroCls, linkClaroCls, rotuloCls } from '../components/ui/estilos'
import { cadastrarUsuario, loginUsuario } from '../services/api'
import { useAuth } from '../services/AuthContext'
import {
  LIMITES, erroCnpj, erroConfirmacaoSenha, erroEmail, erroIdade, erroSenha, erroTexto,
  formatarCnpj, normalizarCnpj,
} from '../utils/validacao'

// tipos de conta que a pessoa pode escolher no cadastro
// id = valor que vai pro back-end (bate com o ENUM da tabela usuario.perfil) / gel e icone = como aparece na tela
const ROLES = [
  {
    id: "cliente",
    gel: "magenta",
    Icone: IconPessoa,
    titulo: "Usuário",
    desc: "Compre e troque ingressos de eventos.",
  },
  {
    id: "organizador",
    gel: "indigo",
    Icone: IconPalco,
    titulo: "Organizador",
    desc: "Crie e gerencie seus eventos.",
  },
  {
    id: "fornecedor",
    gel: "ceu",
    Icone: IconPredio,
    titulo: "Fornecedor",
    desc: "Ofereça serviços para organizadores.",
  },
];

// servicos que o fornecedor pode marcar (so aparece se escolher fornecedor)
// pra adicionar um servico novo e so colocar mais um item aqui
const SERVICES = [
  { id: "som_luz", Icone: IconSom, label: "Som e Luz" },
  { id: "seguranca", Icone: IconEscudo, label: "Segurança" },
  { id: "catering", Icone: IconPrato, label: "Catering / Buffet" },
  { id: "decoracao", Icone: IconPincel, label: "Decoração" },
  { id: "foto_video", Icone: IconCamera, label: "Foto e Vídeo" },
  { id: "transporte", Icone: IconOnibus, label: "Transporte" },
  { id: "estrutura", Icone: IconPalco, label: "Estrutura / Palco" },
  { id: "outro", Icone: IconMais, label: "Outro" },
];

// adesivos em volta da folha (so em tela larga); mudam um pouco na tela final
const ADESIVOS_FORM = [
  { nome: 'tv', tamanho: 150, rotate: 7, delay: 0.8, className: '-right-[128px] top-[4%] z-[3] hidden lg:block' },
  { nome: 'fita', tamanho: 150, rotate: 8, delay: 1.4, className: '-left-[130px] bottom-[10%] z-[3] hidden lg:block' },
]
const ADESIVOS_FIM = [
  { nome: 'estrela', tamanho: 120, rotate: -14, delay: 0.3, className: '-left-[96px] -top-8 z-[3] hidden lg:block' },
  { nome: 'cd', tamanho: 130, rotate: 10, delay: 1, className: '-right-[108px] bottom-[10%] z-[3] hidden lg:block' },
]

// cabecalho de cada etapa: titulo grande e subtitulo (a linha de etapas fica embaixo)
function Titulo({ titulo, sub, children }) {
  return (
    <header className="mb-8">
      {children}
      <h1 className="text-[clamp(2rem,6vw,2.75rem)] font-black leading-none tracking-[-0.025em]">{titulo}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-tinta/65">{sub}</p>
    </header>
  )
}

// etiqueta com o tipo de conta escolhido (aparece nas etapas da empresa)
function Etiqueta({ role }) {
  const r = ROLES.find((x) => x.id === role)
  return (
    <span className="mb-5 inline-flex items-center gap-2 rounded-none border border-tinta/15 bg-papel py-1 pl-1 pr-3 text-xs font-semibold">
      <span className={`grid size-6 place-items-center rounded-none ${GELS[r.gel].bg} ${GELS[r.gel].sobre}`}><r.Icone tamanho={13} /></span>
      {r.titulo}
    </span>
  )
}

// progresso do cadastro: a mesma linha de etapas do resto do site
// a gelatina de cada trecho segue o tipo de conta escolhido
function Progresso({ current, total, role }) {
  const corConta = ROLES.find((r) => r.id === role)?.gel || 'indigo'
  const nomes = ['Dados', 'Tipo de conta', 'Empresa', 'Serviços'].slice(0, total)
  const itens = nomes.map((label, i) => ({ label, gel: i === 0 ? 'indigo' : corConta }))
  return (
    <div className="mb-8">
      <Etapas itens={itens} atual={current} rotulo="Etapas do cadastro" />
    </div>
  )
}

// campo de texto reutilizavel do cadastro (label + input + erro)
// onChange ja devolve so o valor digitado, sem o evento
function Campo({ id, label, type, placeholder, value, onChange, error, autoComplete }) {
  return (
    <div className="mb-5 flex flex-col gap-2">
      {/* htmlFor liga o label ao input, clicando no texto ja foca no campo */}
      <label htmlFor={id} className={rotuloCls}>{label}</label>
      <input id={id} type={type} placeholder={placeholder} value={value} autoComplete={autoComplete} onChange={e => onChange(e.target.value)} className={campoCls(error)} aria-invalid={Boolean(error)} />
      {/* mensagem de erro embaixo, so aparece se tiver */}
      {error && <span className={erroCls} role="alert">{error}</span>}
    </div>
  );
}

// linha de botoes voltar / avancar (no celular o avancar fica em cima)
function Botoes({ children }) {
  return <div className="mt-8 flex flex-col-reverse justify-between gap-3 sm:flex-row">{children}</div>
}

// etapa do formulario onde cada campo e preenchido (pra voltar nela quando o servidor recusa o campo)
const ETAPA_DO_CAMPO = {
  nome: 0, username: 0, email: 0, idade: 0, senha: 0, confirmarSenha: 0,
  empresa: 2, cnpj: 2, areaAtuacao: 3,
};

// pagina de cadastro, dividida em etapas
export default function Cadastro() {
  const navigate = useNavigate(); // pra mudar de pagina pelo codigo
  const { login, logado } = useAuth();

  // controle das etapas
  const [step, setStep] = useState(0); // etapa atual
  const [role, setRole] = useState(""); // tipo de conta escolhido
  const [done, setDone] = useState(false); // true quando termina o cadastro

  // dados basicos
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [idade, setIdade] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");

  // dados da empresa (organizador e fornecedor)
  const [empresa, setEmpresa] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [areas, setAreas] = useState([""]); // comeca com um campo vazio
  const [services, setServices] = useState([]); // servicos marcados pelo fornecedor

  const [errors, setErrors] = useState({}); // mensagens de erro dos campos

  // estado da chamada pro backend
  const [apiLoading, setApiLoading] = useState(false); // true enquanto espera a resposta do /api/cadastro
  const [apiError, setApiError] = useState(""); // mensagem de erro geral da API (ex: erro 500)

  // codigo aleatorio do cadastro (ex: TT-A1B2C3), a funcao no useState faz ele ser gerado so uma vez
  const [code] = useState(
    () => "TT-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
  );
  const [areaFor, setAreaFor] = useState("");

  // quantidade de etapas muda conforme o tipo de conta
  // fornecedor tem a etapa de servicos a mais
  const totalSteps = role === "fornecedor" ? 4 : role === "organizador" ? 3 : 2;

  // texto que vai pra coluna fornecedor.area_atuacao (os servicos marcados, separados por virgula)
  function areaAtuacaoDosServicos() {
    return services
      .map((id) => SERVICES.find((s) => s.id === id)?.label)
      .filter(Boolean)
      .join(", ");
  }

  // valida os campos da etapa atual e devolve um objeto com os erros
  // se voltar vazio e porque ta tudo certo
  function validate() {
    // comeca vazio, e cada campo com problema ganha uma chave aqui (ex: e.email = 'E-mail inválido.')
    const e = {};

    // etapa 0: dados basicos
    if (step === 0) {
      // as regras ficam em utils/validacao.js (o servidor repete todas elas)
      const regras = {
        nome: erroTexto(nome, "Nome", LIMITES.nome),
        username: erroTexto(username, "Username", LIMITES.username),
        idade: erroIdade(idade),
        email: erroEmail(email),
        senha: erroSenha(senha),
        confirmarSenha: erroConfirmacaoSenha(senha, confirmSenha), // mesmo nome de campo que o servidor usa
      };
      for (const [campo, mensagem] of Object.entries(regras)) {
        if (mensagem) e[campo] = mensagem;
      }
    }

    // etapa 2: dados da empresa (cliente nao passa por aqui)
    if (step === 2 && role !== "cliente") {
      const erroEmpresa = erroTexto(empresa, "Nome da empresa", LIMITES.empresa);
      if (erroEmpresa) e.empresa = erroEmpresa;
      const erroDoCnpj = erroCnpj(cnpj); // formato e dígitos verificadores
      if (erroDoCnpj) e.cnpj = erroDoCnpj;
      // organizador precisa preencher pelo menos uma area
      if (role === "organizador" && !areas.some((a) => a.trim()))
        e.area = "Informe ao menos uma área de atuação.";
    }

    // etapa 3: servicos, so pro fornecedor
    if (step === 3 && role === "fornecedor") {
      if (services.length === 0) e.services = "Selecione ao menos um serviço.";
      else if (areaAtuacaoDosServicos().length > LIMITES.areaAtuacao)
        e.services = `Os serviços escolhidos passam de ${LIMITES.areaAtuacao} caracteres. Escolha menos opções.`;
    }

    // devolve os erros pra quem chamou o validate()
    // se voltar {} vazio pode avancar, senao mostra as mensagens nos campos
    return e;
  }

  // envia os dados pro backend (POST /api/cadastro) e so marca como concluido se der certo
  async function finalizarCadastro() {
    setApiError("");
    setApiLoading(true);
    try {
      const payload = {
        nome,
        username,
        email,
        idade: Number(idade),
        senha,
        confirmarSenha: confirmSenha,
        perfil: role, // 'cliente' | 'organizador' | 'fornecedor'
      };

      // organizador e fornecedor tem tabela propria no banco, precisam de empresa/cnpj
      if (role === "organizador" || role === "fornecedor") {
        payload.empresa = empresa.trim();
        payload.cnpj = normalizarCnpj(cnpj); // o banco guarda só os 14 dígitos (CHAR(14))
      }

      // fornecedor.area_atuacao no banco e preenchido com os servicos marcados
      // (o campo "areaFor" do form e geografico e nao tem coluna no banco ainda, entao nao e enviado)
      if (role === "fornecedor") {
        payload.areaAtuacao = areaAtuacaoDosServicos();
      }

      await cadastrarUsuario(payload);

      // cliente nao precisa de aprovacao: ja entra logado (organizador/fornecedor esperam o admin)
      if (role === "cliente") {
        try {
          login(await loginUsuario({ email, senha }));
        } catch {
          // conta criada; se o login automatico falhar, a pessoa entra pela tela de login
        }
      }
      setDone(true);
    } catch (err) {
      // 400 = o servidor recusou algum campo / 409 = e-mail, username ou CNPJ já existem
      const camposComErro =
        err.status === 400 && err.campos
          ? err.campos
          : err.status === 409 && err.campo
            ? { [err.campo]: err.message }
            : null;
      const etapas = camposComErro
        ? Object.keys(camposComErro)
            .map((campo) => ETAPA_DO_CAMPO[campo])
            .filter((n) => n !== undefined)
        : [];

      if (etapas.length) {
        setErrors(
          Object.fromEntries(
            Object.entries(camposComErro).map(([campo, msg]) => [
              campo === "areaAtuacao" ? "services" : campo,
              msg,
            ]),
          ),
        );
        setStep(Math.min(...etapas)); // volta pra primeira etapa que tem erro
      } else if (err.status === 400 || err.status === 409) {
        setApiError(err.message);
      } else {
        setApiError(
          "Não foi possível concluir o cadastro. Tente novamente em instantes.",
        );
      }
    } finally {
      setApiLoading(false);
    }
  }

  // roda quando clica no botao de continuar
  function handleNext() {
    const errs = validate();
    // se tiver algum erro, mostra nos campos e para aqui
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    // se passou, limpa os erros antigos
    setErrors({});

    // se for a ultima etapa daquele tipo de conta, finaliza o cadastro (chama a API)
    const ultimaEtapa = { cliente: 1, organizador: 2, fornecedor: 3 };
    if (step === ultimaEtapa[role]) {
      finalizarCadastro();
      return;
    }

    // senao vai pra proxima etapa
    setStep((s) => s + 1);
  }

  // marca ou desmarca um servico (se ja ta na lista tira, se nao ta adiciona)
  const toggleService = (id) =>
    setServices((p) =>
      p.includes(id) ? p.filter((s) => s !== id) : [...p, id],
    );

  // funcoes dos campos de area de atuacao
  const addArea = () => setAreas((p) => [...p, ""]); // adiciona um campo novo vazio
  const removeArea = (i) => setAreas((p) => p.filter((_, idx) => idx !== i)); // remove o campo da posicao i
  const updateArea = (i, v) =>
    setAreas((p) => p.map((a, idx) => (idx === i ? v : a))); // atualiza o texto do campo i

  // tela final, aparece depois que termina o cadastro
  if (done) {
    const isUser = role === "cliente"; // cliente ja entra direto, os outros precisam de aprovacao
    // linha do tempo da aprovacao: so a primeira etapa ja aconteceu
    const linhaDoTempo = [
      { label: 'Cadastro enviado', gel: 'verde' },
      { label: 'Em análise', gel: 'ambar' },
      { label: 'Conta aprovada', gel: 'verde' },
    ]

    return (
      <CenaConta largura="max-w-[540px]" adesivos={ADESIVOS_FIM}>
        <Folha gel="verde" faixa="h-2.5" className="z-[2]">
          <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10">
            <div className="mb-6 grid size-16 place-items-center rounded-none bg-gel-verde text-tinta">
              <IconCheck tamanho={30} strokeWidth="2.4" />
            </div>

            <h2 className="text-[clamp(2rem,6vw,2.75rem)] font-black leading-none tracking-[-0.025em]">Cadastro Realizado!</h2>

            {/* mensagem muda: cliente ja ta pronto, organizador/fornecedor ficou pendente */}
            <p className="mt-4 text-[15px] text-tinta/70">
              {isUser ? 'Bem-vindo ao TrocaTicket! Sua conta está pronta.' : <><strong className="text-tinta">{role === 'organizador' ? 'Organizador' : 'Fornecedor'}</strong>: sua solicitação foi enviada.</>}
            </p>

            {/* codigo do cadastro, so pra quem precisa de aprovacao */}
            {!isUser && <span className="mt-6 rounded-none border border-dashed border-tinta/30 bg-papel px-5 py-2 font-mono text-xl font-semibold tracking-[0.12em]">{code}</span>}

            {/* linha do tempo da aprovacao: enviado -> em analise -> aprovado */}
            {!isUser && (
              <div className="mt-8 w-full text-left">
                <Etapas itens={linhaDoTempo} atual={0} maisAvancada={0} rotulo="Andamento da aprovação" />
              </div>
            )}

            {/* texto explicando o proximo passo, muda conforme o tipo de conta */}
            <p className="mt-8 max-w-[400px] text-sm leading-relaxed text-tinta/65">
              {isUser ? 'Você já pode comprar e trocar ingressos na plataforma.' : 'Um administrador irá revisar sua conta. Logo ela deverá ser aprovada ou rejeitada.'}
            </p>

            {/* botao que volta pra home, so o texto muda */}
            <button className={`${btn('primario', 'lg')} mt-8 w-full`} onClick={() => navigate(isUser && logado ? '/PainelDeEventos' : isUser ? '/Login' : '/')}>
              {isUser ? 'Ir para a plataforma' : 'Voltar ao início'}
            </button>
          </div>
        </Folha>
      </CenaConta>
    )
  }
  // fim da tela final

  // formulario normal (enquanto o cadastro nao terminou)
  const corDaConta = ROLES.find((r) => r.id === role)?.gel || 'indigo'

  return (
    <CenaConta largura="max-w-[560px]" adesivos={ADESIVOS_FORM}>
      <Folha gel={step === 0 ? 'indigo' : corDaConta} faixa="h-2.5" className="z-[2]">
        <div className="px-6 pb-8 pt-8 sm:px-10 sm:pb-10">

        {/* ETAPA 0: dados basicos */}
        {step === 0 && (
          <>
            <Titulo titulo="Criar conta" sub="Preencha seus dados para acessar o TrocaTicket." />
            <Progresso current={step} total={totalSteps} role={role} />

            {/* campos, cada um mostra o proprio erro se tiver */}
            <Campo id="nome" label="Nome completo" type="text" placeholder="Seu nome completo" autoComplete="name" value={nome} onChange={setNome} error={errors.nome} />
            <Campo id="username" label="Username" type="text" placeholder="Seu nome para a plataforma" autoComplete="username" value={username} onChange={setUsername} error={errors.username} />
            <Campo id="email" label="E-mail" type="email" placeholder="seuemail@exemplo.com" autoComplete="email" value={email} onChange={setEmail} error={errors.email} />
            <Campo id="idade" label="Idade" type="number" placeholder="20" value={idade} onChange={setIdade} error={errors.idade} />
            <div className="grid gap-x-4 sm:grid-cols-2">
              <Campo id="senha" label="Senha" type="password" placeholder="••••••••" autoComplete="new-password" value={senha} onChange={setSenha} error={errors.senha} />
              <Campo id="csenha" label="Confirmar senha" type="password" placeholder="••••••••" autoComplete="new-password" value={confirmSenha} onChange={setConfirmSenha} error={errors.confirmarSenha} />
            </div>

            {/* botao de avancar, passa pela validacao antes */}
            <div className="mt-6 flex justify-end">
              <button className={`${btn('primario', 'lg')} max-sm:w-full`} onClick={handleNext}>Próximo</button>
            </div>

            {/* link pra quem ja tem conta */}
            <p className="mt-7 border-t border-tinta/10 pt-6 text-center text-sm text-tinta/65">
              Já tem conta? <Link to="/login" className={linkClaroCls}>Entrar</Link>
            </p>
          </>
        )}

        {/* ETAPA 1: escolher o tipo de conta */}
        {step === 1 && (
          <>
            <Titulo titulo="Tipo de conta" sub="Como você quer participar do TrocaTicket?" />
            <Progresso current={step} total={totalSteps} role={role} />

            {/* uma opcao pra cada tipo de conta; a escolhida acende na cor da sua gelatina */}
            <div className="flex flex-col gap-3" role="group" aria-label="Tipo de conta">
              {ROLES.map(r => {
                const escolhido = role === r.id
                return (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={escolhido}
                    onClick={() => setRole(r.id)}
                    className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-none border p-4 text-left transition duration-150 ${escolhido ? `${GELS[r.gel].borda} bg-papel shadow-gel` : 'border-tinta/15 bg-papel/60 hover:border-tinta/35 hover:bg-papel'}`}
                  >
                    {/* amostra da gelatina com o icone do tipo de conta */}
                    <span className={`grid size-12 shrink-0 place-items-center rounded-none transition-opacity ${GELS[r.gel].bg} ${GELS[r.gel].sobre} ${escolhido ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                      <r.Icone tamanho={22} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <strong className="text-base font-extrabold">{r.titulo}</strong>
                      <span className="text-[13px] leading-snug text-tinta/65">{r.desc}</span>
                    </span>
                    {/* bolinha que marca a escolhida */}
                    <span className={`grid size-6 shrink-0 place-items-center rounded-none border transition-colors ${escolhido ? 'border-tinta bg-tinta text-white' : 'border-tinta/25'}`} aria-hidden="true">
                      {escolhido && <IconCheck tamanho={14} strokeWidth="2.6" />}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* erro geral da API (ex: backend fora do ar) */}
            {apiError && <Aviso tipo="erro" className="mt-5">{apiError}</Aviso>}

            <Botoes>
              <button className={btn('claro', 'lg')} onClick={() => setStep(s => s - 1)} disabled={apiLoading}>Voltar</button>
              {/* fica desativado ate escolher um tipo ou enquanto envia, e pro cliente ja vira "Concluir" */}
              <button className={btn('primario', 'lg')} onClick={handleNext} disabled={!role || apiLoading}>
                {apiLoading ? 'Enviando...' : (role === 'cliente' ? 'Concluir' : 'Próximo')}
              </button>
            </Botoes>
          </>
        )}

        {/* ETAPA 2 (organizador): dados da empresa */}
        {step === 2 && role === 'organizador' && (
          <>
            <Titulo titulo="Dados da empresa" sub="Informações para sua conta de organizador.">
              <Etiqueta role="organizador" />
            </Titulo>
            <Progresso current={step} total={totalSteps} role={role} />

            <Campo id="empresa" label="Nome da empresa" type="text" placeholder="Razão social" autoComplete="organization" value={empresa} onChange={setEmpresa} error={errors.empresa} />
            <Campo id="cnpj" label="CNPJ" type="text" placeholder="XX.XXX.XXX/XXXX-XX" value={cnpj} onChange={(v) => setCnpj(formatarCnpj(v))} error={errors.cnpj} />

            {/* areas de atuacao: da pra adicionar mais de uma */}
            <p className={`${rotuloCls} mb-2`}>Área de atuação <span className="font-normal text-tinta/60">— tipo de evento</span></p>
            <div className="flex flex-col gap-2">
              {areas.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" placeholder="Ex: Shows" value={a} onChange={e => updateArea(i, e.target.value)} className={campoCls(false)} aria-label={`Área de atuação ${i + 1}`} />
                  {/* botao de remover, so aparece se tiver mais de uma area */}
                  {areas.length > 1 && (
                    <button type="button" className="grid w-11 shrink-0 place-items-center rounded-none border border-tinta/20 bg-papel text-tinta/70 transition-colors hover:border-gel-rubi hover:bg-gel-rubi hover:text-white" aria-label="Remover área" onClick={() => removeArea(i)}>
                      <IconX />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* erro das areas fica embaixo da lista */}
            {errors.area && <span className={`${erroCls} mt-2 block`} role="alert">{errors.area}</span>}

            {/* adiciona mais um campo de area */}
            <button type="button" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-none border border-dashed border-tinta/30 p-2.5 text-sm font-semibold text-tinta transition-colors hover:border-tinta/60 hover:bg-papel" onClick={addArea}>
              <IconMais /> Outra área
            </button>

            {/* erro geral da API */}
            {apiError && <Aviso tipo="erro" className="mt-5">{apiError}</Aviso>}

            {/* voltar e finalizar (organizador termina aqui) */}
            <Botoes>
              <button className={btn('claro', 'lg')} onClick={() => setStep(s => s - 1)} disabled={apiLoading}>Voltar</button>
              <button className={btn('primario', 'lg')} onClick={handleNext} disabled={apiLoading}>
                {apiLoading ? 'Enviando...' : 'Criar solicitação'}
              </button>
            </Botoes>
          </>
        )}

        {/* ETAPA 2 (fornecedor): dados da empresa (parecida com a do organizador, mas sem as areas) */}
        {step === 2 && role === 'fornecedor' && (
          <>
            <Titulo titulo="Dados da empresa" sub="Identificação corporativa do seu negócio.">
              <Etiqueta role="fornecedor" />
            </Titulo>
            <Progresso current={step} total={totalSteps} role={role} />

            <Campo id="empresa" label="Nome da empresa" type="text" placeholder="Razão social" autoComplete="organization" value={empresa} onChange={setEmpresa} error={errors.empresa} />
            <Campo id="cnpj" label="CNPJ" type="text" placeholder="XX.XXX.XXX/XXXX-XX" value={cnpj} onChange={(v) => setCnpj(formatarCnpj(v))} error={errors.cnpj} />

            {/* voltar e avancar (fornecedor ainda tem a etapa de servicos) */}
            <Botoes>
              <button className={btn('claro', 'lg')} onClick={() => setStep(s => s - 1)}>Voltar</button>
              <button className={btn('primario', 'lg')} onClick={handleNext}>Próximo</button>
            </Botoes>
          </>
        )}

        {/* ETAPA 3 (fornecedor): escolher os servicos */}
        {step === 3 && role === 'fornecedor' && (
          <>
            <Titulo titulo="Serviços oferecidos" sub="Selecione os serviços que você oferece para eventos.">
              <Etiqueta role="fornecedor" />
            </Titulo>
            <Progresso current={step} total={totalSteps} role={role} />

            <p className={rotuloCls}>Serviços <span className="font-normal text-tinta/60">— selecione todos que se aplicam</span></p>

            {/* grade de servicos, 1 coluna no celular e 2 em tela maior */}
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Serviços oferecidos">
              {SERVICES.map(sv => {
                const marcado = services.includes(sv.id)
                return (
                  <button
                    key={sv.id}
                    type="button"
                    aria-pressed={marcado}
                    onClick={() => toggleService(sv.id)}
                    className={`flex items-center gap-3 rounded-none border p-3 text-left text-sm font-semibold transition duration-150 ${marcado ? 'border-gel-indigo-forte bg-gel-indigo/25' : 'border-tinta/15 bg-papel/60 hover:border-tinta/35 hover:bg-papel'}`}
                  >
                    {/* caixinha de marcar */}
                    <span className={`grid size-5 shrink-0 place-items-center rounded-none border transition-colors ${marcado ? 'border-gel-indigo-forte bg-gel-indigo text-tinta' : 'border-tinta/30 bg-papel'}`} aria-hidden="true">
                      {marcado && <IconCheck tamanho={13} strokeWidth="2.8" />}
                    </span>
                    <span className="text-tinta/60"><sv.Icone /></span>
                    <span>{sv.label}</span>
                  </button>
                )
              })}
            </div>

            {/* erro se nao marcar nenhum servico */}
            {errors.services && <span className={`${erroCls} mt-3 block`} role="alert">{errors.services}</span>}

            {/* regiao onde o fornecedor atende, esse campo nao e obrigatorio */}
            <div className="mt-6">
              <Campo id="areaFor" label="Área de atuação geográfica" type="text" placeholder="Ex: São Paulo e Grande SP" value={areaFor} onChange={setAreaFor} />
            </div>

            {/* erro geral da API */}
            {apiError && <Aviso tipo="erro">{apiError}</Aviso>}

            {/* voltar e finalizar (fornecedor termina aqui) */}
            <Botoes>
              <button className={btn('claro', 'lg')} onClick={() => setStep(s => s - 1)} disabled={apiLoading}>Voltar</button>
              <button className={btn('primario', 'lg')} onClick={handleNext} disabled={apiLoading}>
                {apiLoading ? 'Enviando...' : 'Criar solicitação'}
              </button>
            </Botoes>
          </>
        )}
        {/* fim das etapas */}

        </div>
      </Folha>
    </CenaConta>
  )
}
// fim do Cadastro

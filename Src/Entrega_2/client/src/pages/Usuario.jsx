import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { solicitar } from '../services/api'
import { brl } from '../styles/propostas'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

// ---------------------------------------------------------------------------
// PONTO DE INTEGRACAO COM O BACKEND (ainda nao existe)
// Hoje o login so devolve { id_usuario, nome, email, perfil }, entao o perfil vem da sessao.
// Quando existir um endpoint de perfil (ex: GET /usuario/me), e so trocar o corpo desta funcao
// por `return solicitar('/usuario/me')`. A tela ja usa estes campos, todos opcionais:
//   username, empresa, cnpj, area_atuacao, data_criacao, saldo
// Campo ausente = a linha/valor simplesmente nao aparece.
// ---------------------------------------------------------------------------
function montarPerfil(usuario) {
  return { ...usuario }
}

// segue o mesmo padrao dos cards do site: borda marinho 1.5px + sombra roxa chapada
const card = 'border-[1.5px] border-tt-azul-marinho bg-tt-branco p-5 shadow-[6px_6px_0_var(--tt-roxo-vivo)] sm:p-6'
const cardTitulo = 'mb-4 font-display text-lg font-black text-tt-azul-marinho'
const linkAcao = 'inline-block border-[1.5px] border-tt-azul-marinho bg-tt-laranja-principal px-4 py-2 text-sm font-bold text-tt-azul-marinho no-underline transition-colors hover:bg-tt-laranja-vivo'

const ROTULO_STATUS = {
  enviada: 'Aguardando resposta',
  aceita: 'Aceita',
  recusada: 'Recusada',
}

function formatarData(valor) {
  if (!valor) return null
  const data = new Date(valor)
  return Number.isNaN(data.getTime()) ? null : data.toLocaleDateString('pt-BR')
}

// uma linha "rotulo: valor" do card de dados (some se nao tiver valor)
function Linha({ rotulo, valor }) {
  if (!valor) return null
  return (
    <div className="flex flex-col gap-0.5 border-b border-tt-azul-marinho/10 py-2.5 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-tt-grafite/60">{rotulo}</dt>
      <dd className="m-0 break-words text-sm font-medium text-tt-azul-marinho">{valor}</dd>
    </div>
  )
}

function Vazio({ titulo, texto, acao }) {
  return (
    <div className="py-6 text-center">
      <p className="font-bold text-tt-azul-marinho">{titulo}</p>
      <p className="mx-auto mt-1 mb-4 max-w-xs text-sm text-tt-grafite/70">{texto}</p>
      {acao}
    </div>
  )
}

export default function Usuario() {
  const { usuario, perfil } = useAuth()
  const dadosPerfil = montarPerfil(usuario)

  // organizador -> eventos dele (GET /eventos, filtrado pelo id); fornecedor -> propostas (GET /propostas)
  // cliente e administrador nao tem lista para buscar
  const rota = perfil === 'organizador' ? '/eventos' : perfil === 'fornecedor' ? '/propostas' : null
  const [lista, setLista] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!rota) return
    let ativo = true
    solicitar(rota)
      .then((dados) => {
        if (!ativo) return
        setLista(rota === '/eventos' ? dados.filter((e) => e.organizador_id === usuario.id_usuario) : dados)
      })
      .catch((e) => { if (ativo) setErro(e.message) })
    return () => { ativo = false }
  }, [rota, usuario.id_usuario])

  const carregando = Boolean(rota) && lista === null && !erro

  // sem username no login: usa o comeco do e-mail ate o endpoint de perfil existir
  const username = dadosPerfil.username || dadosPerfil.email?.split('@')[0] || dadosPerfil.nome
  const iniciais = (dadosPerfil.nome || username || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

  // ---- card de baixo (esquerda): depende do perfil ----
  function conteudoLista() {
    if (carregando) return <Spinner text="Carregando..." />
    if (erro) return <p role="alert" className="bg-tt-rosa-claro p-4 text-sm text-tt-rosa-principal">{erro}</p>

    if (perfil === 'organizador') {
      if (!lista.length) {
        return <Vazio titulo="Nenhum evento ainda" texto="Crie seu primeiro evento para começar a receber propostas." acao={<Link to="/criar-evento/evento" className={linkAcao}>Criar evento</Link>} />
      }
      return (
        <ul className="m-0 list-none divide-y divide-tt-azul-marinho/10 p-0">
          {lista.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span><strong>{e.titulo}</strong><br /><span className="text-tt-grafite/70">{formatarData(e.data_inicio)}</span></span>
              <Badge label={e.status_publicacao} variant={e.status_publicacao === 'Publicado' ? 'ativo' : 'pendente'} />
            </li>
          ))}
        </ul>
      )
    }

    if (perfil === 'fornecedor') {
      if (!lista.length) {
        return <Vazio titulo="Nenhuma proposta enviada" texto="Acesse os custos de um evento para enviar sua primeira proposta." acao={<Link to="/PainelDeEventos" className={linkAcao}>Ver eventos</Link>} />
      }
      return (
        <ul className="m-0 list-none divide-y divide-tt-azul-marinho/10 p-0">
          {lista.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span><strong>{p.titulo_evento}</strong><br /><span className="text-tt-grafite/70">Para: {p.organizador}</span></span>
              <Badge label={ROTULO_STATUS[p.status] || p.status} variant={p.status === 'aceita' ? 'ativo' : p.status === 'recusada' ? 'rejeitado' : 'pendente'} />
            </li>
          ))}
        </ul>
      )
    }

    if (perfil === 'administrador') {
      return (
        <div className="flex flex-wrap gap-3">
          <Link to="/AdminDashboard" className={linkAcao}>Painel</Link>
          <Link to="/AprovarCadastros" className={linkAcao}>Aprovações</Link>
        </div>
      )
    }

    // cliente: ainda nao existe endpoint de ingressos
    return <Vazio titulo="Você ainda não tem ingressos" texto="Os ingressos que você comprar aparecerão aqui." acao={<Link to="/PainelDeEventos" className={linkAcao}>Ver eventos</Link>} />
  }

  const tituloLista = { organizador: 'Meus eventos', fornecedor: 'Propostas enviadas', administrador: 'Administração' }[perfil] || 'Meus ingressos'

  // ---- card da direita (alto): saldo (cliente) ou resumo (demais) ----
  function conteudoLateral() {
    if (perfil === 'cliente') {
      const temSaldo = typeof dadosPerfil.saldo === 'number'
      return (
        <>
          <h2 className={cardTitulo}>Saldo na plataforma</h2>
          <p className="m-0 font-display text-4xl font-black text-tt-azul-marinho">{temSaldo ? brl(dadosPerfil.saldo) : '—'}</p>
          <p className="mt-2 mb-5 text-sm text-tt-grafite/70">
            {temSaldo ? 'Disponível para usar na compra de ingressos.' : 'O saldo para usar em eventos ainda não está disponível.'}
          </p>
          <button type="button" disabled className="w-full cursor-not-allowed border-[1.5px] border-tt-azul-marinho bg-tt-azul-marinho/12 py-3 text-[15px] font-bold text-tt-grafite/45">
            Adicionar saldo (em breve)
          </button>
        </>
      )
    }

    const resumo = perfil === 'organizador'
      ? [
          ['Eventos', lista?.length],
          ['Publicados', lista?.filter((e) => e.status_publicacao === 'Publicado').length],
          ['Rascunhos', lista?.filter((e) => e.status_publicacao === 'Rascunho').length],
        ]
      : perfil === 'fornecedor'
        ? [
            ['Propostas', lista?.length],
            ['Aguardando', lista?.filter((p) => p.status === 'enviada').length],
            ['Aceitas', lista?.filter((p) => p.status === 'aceita').length],
          ]
        : []

    return (
      <>
        <h2 className={cardTitulo}>Resumo</h2>
        {resumo.length === 0 ? (
          <p className="text-sm text-tt-grafite/70">Sem indicadores para este perfil.</p>
        ) : carregando ? (
          <Spinner text="" />
        ) : (
          <dl className="m-0 grid grid-cols-1 gap-3">
            {resumo.map(([rotulo, valor]) => (
              <div key={rotulo} className="border-[1.5px] border-tt-azul-marinho bg-tt-cinza-claro p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-tt-grafite/60">{rotulo}</dt>
                <dd className="m-0 font-display text-3xl font-black text-tt-azul-marinho">{valor ?? 0}</dd>
              </div>
            ))}
          </dl>
        )}
      </>
    )
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-tt-cinza-claro text-tt-azul-marinho">
      <div className="mx-auto grid w-[calc(100%_-_48px)] max-w-[1180px] gap-x-8 gap-y-6 py-8 max-[540px]:w-[calc(100%_-_28px)] md:grid-cols-[200px_1fr]">
        {/* avatar + @user (placeholder: ainda nao ha upload de foto) */}
        <aside className="flex flex-col items-center gap-3 md:pt-2">
          <div
            className="flex size-32 items-center justify-center rounded-full border-[1.5px] border-tt-azul-marinho bg-tt-lilas-claro font-display text-4xl font-black text-tt-roxo-vivo md:size-[170px] md:text-5xl"
            role="img"
            aria-label={`Foto de perfil de ${dadosPerfil.nome}`}
          >
            {iniciais}
          </div>
          <p className="m-0 break-all text-center text-lg font-bold">@{username}</p>
          <Badge label={perfil} variant={perfil === 'administrador' ? 'admin' : perfil} />
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          {/* banner (placeholder com o gradiente da marca) */}
          <div
            className="flex h-[120px] items-end border-[1.5px] border-tt-azul-marinho p-4 md:h-[145px]"
            style={{ background: 'var(--tt-gradiente-azul-roxo)' }}
          >
            <h1 className="m-0 font-display text-2xl font-black text-tt-branco md:text-3xl">{dadosPerfil.nome}</h1>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[1fr_minmax(240px,340px)]">
            <div className="flex min-w-0 flex-col gap-6">
              <section className={card} aria-labelledby="dados-titulo">
                <h2 id="dados-titulo" className={cardTitulo}>Dados da conta</h2>
                <dl className="m-0">
                  <Linha rotulo="Nome" valor={dadosPerfil.nome} />
                  <Linha rotulo="E-mail" valor={dadosPerfil.email} />
                  <Linha rotulo="Empresa" valor={dadosPerfil.empresa} />
                  <Linha rotulo="CNPJ" valor={dadosPerfil.cnpj} />
                  <Linha rotulo="Área de atuação" valor={dadosPerfil.area_atuacao} />
                  <Linha rotulo="Membro desde" valor={formatarData(dadosPerfil.data_criacao)} />
                </dl>
              </section>

              <section className={card} aria-labelledby="lista-titulo">
                <h2 id="lista-titulo" className={cardTitulo}>{tituloLista}</h2>
                {conteudoLista()}
              </section>
            </div>

            <section className={card} aria-label={perfil === 'cliente' ? 'Saldo' : 'Resumo'}>
              {conteudoLateral()}
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

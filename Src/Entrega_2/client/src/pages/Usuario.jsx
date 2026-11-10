import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { solicitar } from '../services/api'
import { brl, dataCurta } from '../utils/formato'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import Aviso from '../components/ui/Aviso'
import Folha from '../components/ui/Folha'
import Semicirculos from '../components/ui/Semicirculos'
import { GELS, btn, dadoRotuloCls } from '../components/ui/estilos'

// ---------------------------------------------------------------------------
// PONTO DE INTEGRACAO COM O BACKEND (ainda nao existe)
// Hoje o login so devolve { id_usuario, nome, email, perfil }, entao os dados vem da sessao.
// Quando existir um endpoint de perfil (ex: GET /usuario/me), basta buscar os dados dele e
// usar no lugar de `dadosPerfil`. A tela ja usa estes campos, todos opcionais:
//   username, empresa, cnpj, area_atuacao, data_criacao, saldo
// Campo ausente = a linha/valor simplesmente nao aparece.
// ---------------------------------------------------------------------------

// conteudo das folhas do perfil
const cardCorpo = 'px-6 pb-6 pt-6 sm:px-7'
const cardTitulo = 'mb-4 pr-8 text-lg font-extrabold'
const linkAcao = btn('tinta', 'sm')

// gelatina de cada perfil (a mesma do cadastro)
const GEL_PERFIL = { cliente: 'magenta', organizador: 'indigo', fornecedor: 'ceu', administrador: 'indigo' }

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
    <div className="grid gap-1 border-b border-tinta/10 py-3 last:border-b-0 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className={dadoRotuloCls}>{rotulo}</dt>
      <dd className="m-0 break-words text-sm font-medium">{valor}</dd>
    </div>
  )
}

function Vazio({ titulo, texto, acao }) {
  return (
    <div className="py-6 text-center">
      <p className="font-bold">{titulo}</p>
      <p className="mx-auto mb-4 mt-1 max-w-xs text-sm text-tinta/65">{texto}</p>
      {acao}
    </div>
  )
}

export default function Usuario() {
  const { usuario, perfil } = useAuth()
  const dadosPerfil = usuario // veja o comentario "PONTO DE INTEGRACAO" no topo

  // organizador -> eventos dele (GET /eventos, filtrado pelo id); fornecedor -> propostas (GET /propostas)
  // cliente -> ingressos comprados (GET /compras); administrador nao tem lista para buscar
  const rota = perfil === 'organizador' ? '/eventos' : perfil === 'fornecedor' ? '/propostas' : perfil === 'cliente' ? '/compras' : null
  const [lista, setLista] = useState(null)
  const [erro, setErro] = useState('')
  const [saldo, setSaldo] = useState(null) // so cliente: vem do servidor (GET /saldo), nunca e calculado aqui

  useEffect(() => {
    if (perfil !== 'cliente') return
    solicitar('/saldo').then((d) => setSaldo(d.saldo)).catch(() => {}) // sem saldo disponivel, o card mostra "—"
  }, [perfil])

  useEffect(() => {
    if (!rota) return
    async function carregar() {
      try {
        const dados = await solicitar(rota)
        setLista(rota === '/eventos' ? dados.filter((e) => e.organizador_id === usuario.id_usuario) : dados)
      } catch (e) {
        setErro(e.message)
      }
    }
    carregar()
  }, [rota, usuario.id_usuario])

  const carregando = Boolean(rota) && lista === null && !erro

  // sem username no login: usa o comeco do e-mail ate o endpoint de perfil existir
  const username = dadosPerfil.username || dadosPerfil.email?.split('@')[0] || dadosPerfil.nome
  const iniciais = (dadosPerfil.nome || username || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

  // ---- card de baixo (esquerda): depende do perfil ----
  function conteudoLista() {
    if (carregando) return <Spinner text="Carregando..." />
    if (erro) return <Aviso tipo={perfil === 'cliente' ? 'atencao' : 'erro'}>{erro}</Aviso>

    if (perfil === 'organizador') {
      if (!lista.length) {
        return <Vazio titulo="Nenhum evento ainda" texto="Crie seu primeiro evento para começar a receber propostas." acao={<Link to="/criar-evento/evento" className={linkAcao}>Criar evento</Link>} />
      }
      return (
        <ul className="m-0 list-none divide-y divide-tinta/10 p-0">
          {lista.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span><strong>{e.titulo}</strong><br /><span className="text-tinta/60">{formatarData(e.data_inicio)}</span></span>
              <Badge label={e.status_publicacao} />
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
        <ul className="m-0 list-none divide-y divide-tinta/10 p-0">
          {lista.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span><strong>{p.titulo_evento}</strong><br /><span className="text-tinta/60">Para: {p.organizador}</span></span>
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

    // cliente: ingressos comprados (os 5 mais recentes; a lista completa fica em /ingressos)
    if (!lista.length) {
      return <Vazio titulo="Você ainda não tem ingressos" texto="Os ingressos que você comprar aparecerão aqui." acao={<Link to="/PainelDeEventos" className={linkAcao}>Ver eventos</Link>} />
    }
    return (
      <>
        <ul className="m-0 list-none divide-y divide-tinta/10 p-0">
          {lista.slice(0, 5).map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span><strong>{c.evento_titulo}</strong><br /><span className="text-tinta/60">{dataCurta(c.evento_data)} · {c.quantidade} × {c.tipo_nome}</span></span>
              <span className="font-mono text-xs tracking-[0.1em]">{c.codigo}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4"><Link to="/ingressos" className={linkAcao}>Ver todos os ingressos</Link></div>
      </>
    )
  }

  const tituloLista = { organizador: 'Meus eventos', fornecedor: 'Propostas enviadas', administrador: 'Administração' }[perfil] || 'Meus ingressos'

  // ---- card da direita (alto): saldo (cliente) ou resumo (demais) ----
  function conteudoLateral() {
    if (perfil === 'cliente') {
      const temSaldo = typeof saldo === 'number'
      return (
        <>
          <h2 className={cardTitulo}>Saldo na plataforma</h2>
          <p className="tabular m-0 text-4xl font-black tracking-[-0.025em]">{temSaldo ? brl(saldo) : '—'}</p>
          <p className="mb-5 mt-2 text-sm text-tinta/65">
            {temSaldo ? 'Disponível para usar na compra de ingressos.' : 'O saldo ainda não está disponível.'}
          </p>
          <Link to="/saldo" className={`${btn('claro')} w-full`}>
            Adicionar saldo
          </Link>
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
          <p className="text-sm text-tinta/65">Sem indicadores para este perfil.</p>
        ) : carregando ? (
          <Spinner text="" />
        ) : (
          <dl className="m-0 divide-y divide-tinta/10">
            {resumo.map(([rotulo, valor], i) => (
              <div key={rotulo} className="flex items-baseline justify-between gap-4 py-3 first:pt-0">
                <dt className={i === 0 ? 'text-sm font-semibold' : 'text-sm text-tinta/65'}>{rotulo}</dt>
                <dd className={`tabular m-0 font-black tracking-[-0.025em] ${i === 0 ? 'text-4xl' : 'text-2xl'}`}>{valor ?? 0}</dd>
              </div>
            ))}
          </dl>
        )}
      </>
    )
  }

  const gelPerfil = GEL_PERFIL[perfil] || 'indigo'

  return (
    <main className="relative min-h-[calc(100svh-68px)] overflow-x-clip fundo-luz pb-24">
      <Semicirculos posicoes={[{ lado: 'esq', topo: 'top-[520px]', cor: 'bg-gel-fogo', tamanho: 'm' }, { lado: 'dir', topo: 'top-[820px]', cor: 'bg-gel-ceu', tamanho: 'p' }]} />
      {/* faixa do topo: a gelatina do perfil ocupa a largura toda, com o nome por cima */}
      <div className={`relative ${GELS[gelPerfil].bg}`}>
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-end gap-6 px-5 pb-8 pt-14 sm:px-8 sm:pt-20">
          {/* iniciais no lugar da foto (ainda nao ha upload de foto) */}
          <div
            className="grid size-28 shrink-0 place-items-center rounded-none bg-palco text-4xl font-black text-white shadow-folha sm:size-36 sm:text-5xl"
            role="img"
            aria-label={`Foto de perfil de ${dadosPerfil.nome}`}
          >
            {iniciais}
          </div>
          <div className={`min-w-0 pb-1 ${GELS[gelPerfil].sobre}`}>
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black leading-[0.95] tracking-[-0.025em]">{dadosPerfil.nome}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-3 text-[15px] font-semibold">
              <span className="break-all">@{username}</span>
              <Badge label={perfil} variant={perfil} />
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1180px] items-start gap-6 px-5 pt-8 sm:px-8 lg:grid-cols-[1fr_minmax(260px,340px)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Folha aria-labelledby="dados-titulo">
            <div className={cardCorpo}>
              <h2 id="dados-titulo" className={cardTitulo}>Dados da conta</h2>
              <dl className="m-0">
                <Linha rotulo="Nome" valor={dadosPerfil.nome} />
                <Linha rotulo="E-mail" valor={dadosPerfil.email} />
                <Linha rotulo="Empresa" valor={dadosPerfil.empresa} />
                <Linha rotulo="CNPJ" valor={dadosPerfil.cnpj} />
                <Linha rotulo="Área de atuação" valor={dadosPerfil.area_atuacao} />
                <Linha rotulo="Membro desde" valor={formatarData(dadosPerfil.data_criacao)} />
              </dl>
            </div>
          </Folha>

          <Folha aria-labelledby="lista-titulo">
            <div className={cardCorpo}>
              <h2 id="lista-titulo" className={cardTitulo}>{tituloLista}</h2>
              {conteudoLista()}
            </div>
          </Folha>
        </div>

        <Folha gel={gelPerfil} aria-label={perfil === 'cliente' ? 'Saldo' : 'Resumo'}>
          <div className={cardCorpo}>
            {conteudoLateral()}
          </div>
        </Folha>
      </div>
    </main>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import IngressoCard from '../components/IngressoCard'
import Aviso from '../components/ui/Aviso'
import CabecalhoPagina from '../components/ui/CabecalhoPagina'
import Semicirculos from '../components/ui/Semicirculos'
import Spinner from '../components/ui/Spinner'
import { btn, containerCls } from '../components/ui/estilos'
import { solicitar } from '../services/api'

// area do cliente: todos os ingressos que ele comprou (so os dele; o servidor filtra pelo token)
export default function MeusIngressos() {
  const [ingressos, setIngressos] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const controle = new AbortController()
    solicitar('/compras', { signal: controle.signal }, 'Não foi possível carregar seus ingressos.')
      .then(setIngressos)
      .catch((e) => { if (e.name !== 'AbortError') setErro(e.message) })
    return () => controle.abort()
  }, [])

  const total = ingressos?.reduce((soma, c) => soma + c.quantidade, 0) ?? 0

  function conteudo() {
    if (erro) return <Aviso tipo="erro" escuro>{erro}</Aviso>
    if (!ingressos) return <Spinner text="Carregando ingressos..." escuro />
    if (ingressos.length === 0) {
      return (
        <div className="py-12 text-center text-white">
          <p className="text-2xl font-black tracking-[-0.015em]">Você ainda não tem ingressos</p>
          <p className="mx-auto mb-6 mt-2 max-w-sm text-sm text-white/60">Os ingressos que você comprar aparecerão aqui.</p>
          <Link to="/PainelDeEventos" className={btn('primario')}>Ver eventos</Link>
        </div>
      )
    }
    return (
      <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-2">
        {ingressos.map((c) => <li key={c.id}><IngressoCard compra={c} /></li>)}
      </ul>
    )
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Meus ingressos"
        sub={total ? `${total} ingresso${total > 1 ? 's' : ''} adquirido${total > 1 ? 's' : ''}.` : 'Os ingressos comprados na plataforma.'}
        acoes={<Link to="/saldo" className={btn('escuro')}>Meu saldo</Link>}
        gels={['bg-gel-magenta', 'bg-gel-indigo']}
      />
      <main className="relative min-h-[calc(100svh-68px)] overflow-x-clip fundo-luz pb-24">
        <Semicirculos posicoes={[{ lado: 'esq', topo: 'top-[420px]', cor: 'bg-gel-fogo', tamanho: 'm' }, { lado: 'dir', topo: 'top-[260px]', cor: 'bg-gel-ceu', tamanho: 'p' }]} />
        <div className={`${containerCls} relative pt-10`}>{conteudo()}</div>
      </main>
    </>
  )
}

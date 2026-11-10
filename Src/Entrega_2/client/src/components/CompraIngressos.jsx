import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { solicitar } from '../services/api'
import { useAuth } from '../services/AuthContext'
import { brl } from '../utils/formato'
import Aviso from './ui/Aviso'
import Spinner from './ui/Spinner'
import { IconIngresso } from './ui/Icones'
import { btn, dadoRotuloCls, linkClaroCls } from './ui/estilos'

// botao de - e + da quantidade
const botaoQtd = 'grid size-9 place-items-center border-[1.5px] border-tinta bg-papel text-lg font-bold leading-none transition-colors hover:bg-gel-indigo disabled:pointer-events-none disabled:opacity-40'

// selecao de ingressos na pagina do evento (so cliente): escolhe o tipo e a quantidade e segue para o pagamento.
// O preco e o total aqui sao so exibicao: o servidor recalcula tudo com o preco do banco quando a compra e confirmada.
export default function CompraIngressos({ evento }) {
  const { logado, perfil } = useAuth()
  const navigate = useNavigate()
  const [info, setInfo] = useState(null)
  const [erro, setErro] = useState('')
  const [tipo, setTipo] = useState('') // tipo escolhido
  const [quantidade, setQuantidade] = useState(1)

  const ehCliente = logado && perfil === 'cliente'

  useEffect(() => {
    if (!ehCliente) return
    const controle = new AbortController()
    solicitar(`/eventos/${evento.id}/ingressos`, { signal: controle.signal }, 'Não foi possível carregar os ingressos.')
      .then((dados) => { setInfo(dados); setTipo(dados.tipos[0]?.tipo ?? '') })
      .catch((e) => { if (e.name !== 'AbortError') setErro(e.message) })
    return () => controle.abort()
  }, [evento.id, ehCliente])

  // visitante: convite pra entrar
  if (!logado) {
    return (
      <section className="mb-8 border-[1.5px] border-tinta/40 bg-papel p-5" aria-label="Comprar ingressos">
        <p className="m-0 flex items-center gap-2 font-bold"><IconIngresso tamanho={18} /> Quer ir?</p>
        <p className="mb-0 mt-1 text-sm text-tinta/70">
          <Link to="/Login" className={linkClaroCls}>Entre</Link> ou <Link to="/Cadastro" className={linkClaroCls}>crie uma conta de cliente</Link> para comprar ingressos.
        </p>
      </section>
    )
  }
  if (!ehCliente) return null

  const escolhido = info?.tipos.find((t) => t.tipo === tipo)
  const total = escolhido ? escolhido.preco * quantidade : 0

  // os dados da compra vao pela navegacao; a compra so e criada (no servidor) quando o pagamento e confirmado
  function continuar() {
    navigate('/checkout', { state: { evento: { id: evento.id, titulo: evento.titulo, data: evento.data_inicio }, tipo, tipoNome: escolhido.nome, preco: escolhido.preco, quantidade } })
  }

  function conteudo() {
    if (erro) return <Aviso tipo="atencao">{erro}</Aviso>
    if (!info) return <Spinner text="Carregando ingressos..." />
    if (!info.venda_aberta) return <Aviso tipo="info">{info.motivo}</Aviso>

    return (
      <>
        <fieldset className="m-0 border-0 p-0">
          <legend className="sr-only">Tipo de ingresso</legend>
          <div className="flex flex-col gap-2">
            {info.tipos.map((t) => (
              <label key={t.tipo} className="flex cursor-pointer items-center gap-3 border-[1.5px] border-tinta/40 px-4 py-3 transition-colors hover:border-tinta has-[:checked]:border-tinta has-[:checked]:bg-gel-indigo/20 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foco">
                <input type="radio" name={`tipo-${evento.id}`} value={t.tipo} checked={tipo === t.tipo} onChange={() => setTipo(t.tipo)} />
                <span className="font-bold">{t.nome}</span>
                <span className="tabular ml-auto text-sm text-tinta/70">{brl(t.preco)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="font-semibold">Quantidade</span>
          <div className="flex items-center gap-3" role="group" aria-label="Quantidade de ingressos">
            <button type="button" className={botaoQtd} onClick={() => setQuantidade((q) => q - 1)} disabled={quantidade <= 1} aria-label="Diminuir quantidade">−</button>
            <output className="tabular w-8 text-center text-lg font-black" aria-live="polite">{quantidade}</output>
            <button type="button" className={botaoQtd} onClick={() => setQuantidade((q) => q + 1)} disabled={quantidade >= info.max_por_compra} aria-label="Aumentar quantidade">+</button>
          </div>
        </div>
        <p className="mb-0 mt-2 text-xs text-tinta/60">
          {info.disponiveis} ingresso{info.disponiveis === 1 ? '' : 's'} disponíve{info.disponiveis === 1 ? 'l' : 'is'} · máximo de {info.max_por_compra} por compra
        </p>

        {/* resumo da compra */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 bg-tinta/[0.04] px-5 py-4">
          <div>
            <p className={`${dadoRotuloCls} m-0`}>Resumo</p>
            <p className="m-0 mt-1 text-sm">{quantidade} × {escolhido?.nome}</p>
            <p className="tabular m-0 text-2xl font-black tracking-[-0.015em]">{brl(total)}</p>
          </div>
          <button type="button" className={btn('primario', 'lg')} onClick={continuar}>Continuar para o pagamento</button>
        </div>
      </>
    )
  }

  return (
    <section className="mb-8" aria-labelledby={`ingressos-${evento.id}`}>
      <h2 id={`ingressos-${evento.id}`} className="mb-3 flex items-center gap-2 text-xl font-extrabold"><IconIngresso tamanho={20} /> Ingressos</h2>
      {conteudo()}
    </section>
  )
}

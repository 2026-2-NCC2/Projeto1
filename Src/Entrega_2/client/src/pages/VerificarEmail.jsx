import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CenaConta from '../components/ui/CenaConta'
import Folha from '../components/ui/Folha'
import Spinner from '../components/ui/Spinner'
import { IconAlerta, IconCheck } from '../components/ui/Icones'
import { btn } from '../components/ui/estilos'
import { verificarEmail } from '../services/api'

// adesivos em volta da folha, so em tela larga (mesmo jeito do login e do cadastro)
const ADESIVOS = [
  { nome: 'estrela', tamanho: 110, rotate: -14, delay: 0.3, className: '-left-[96px] -top-8 z-[3] hidden lg:block' },
  { nome: 'cd', tamanho: 120, rotate: 10, delay: 1, className: '-right-[100px] bottom-[8%] z-[3] hidden lg:block' },
]

// cor da faixa do topo da folha conforme o resultado
const GEL_DO_ESTADO = { carregando: 'indigo', ok: 'verde', erro: 'rubi' }

// pagina aberta pelo link do e-mail de confirmacao: /verificar-email?token=...
export default function VerificarEmail() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  // 'carregando' | 'ok' | 'erro'
  const [estado, setEstado] = useState(token ? 'carregando' : 'erro')
  const [mensagem, setMensagem] = useState(token ? '' : 'Link de confirmação inválido.')
  const [perfil, setPerfil] = useState('')

  // o token so vale uma vez: no modo dev o React roda o efeito 2x, e a 2a chamada daria "link invalido"
  const jaConfirmou = useRef(false)

  useEffect(() => {
    if (!token || jaConfirmou.current) return
    jaConfirmou.current = true
    verificarEmail(token)
      .then((r) => {
        setPerfil(r.perfil)
        setEstado('ok')
      })
      .catch((err) => {
        setMensagem(err.message)
        setEstado('erro')
      })
  }, [token])

  const precisaAprovacao = perfil === 'organizador' || perfil === 'fornecedor'

  return (
    <CenaConta largura="max-w-[500px]" adesivos={ADESIVOS}>
      <Folha gel={GEL_DO_ESTADO[estado]} faixa="h-2.5" className="z-[2]">
        <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10" aria-live="polite">
          {estado === 'carregando' && (
            <>
              <Spinner text="" />
              <h1 className="text-[clamp(2rem,6vw,2.6rem)] font-black leading-none tracking-[-0.025em]">Confirmando…</h1>
              <p className="mt-4 text-[15px] text-tinta/70">Só um instante, estamos confirmando seu e-mail.</p>
            </>
          )}

          {estado === 'ok' && (
            <>
              <div className="mb-6 grid size-16 place-items-center border-[1.5px] border-black bg-gel-verde text-tinta">
                <IconCheck tamanho={30} strokeWidth="2.4" />
              </div>
              <h1 className="text-[clamp(2rem,6vw,2.6rem)] font-black leading-none tracking-[-0.025em]">E-mail confirmado!</h1>
              <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-tinta/70">
                {precisaAprovacao
                  ? 'Agora seu cadastro segue para análise de um administrador. Você poderá entrar assim que ele for aprovado.'
                  : 'Sua conta está ativa. Já pode entrar no TrocaTicket.'}
              </p>
              <Link to="/login" className={`${btn('primario', 'lg')} mt-8 w-full`}>Ir para o login</Link>
            </>
          )}

          {estado === 'erro' && (
            <>
              <div className="mb-6 grid size-16 place-items-center border-[1.5px] border-black bg-gel-rubi text-tinta">
                <IconAlerta tamanho={30} strokeWidth="2.2" />
              </div>
              <h1 className="text-[clamp(2rem,6vw,2.6rem)] font-black leading-none tracking-[-0.025em]">Não foi possível confirmar</h1>
              <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-tinta/70" role="alert">{mensagem}</p>
              <Link to="/login" className={`${btn('primario', 'lg')} mt-8 w-full`}>Ir para o login</Link>
            </>
          )}
        </div>
      </Folha>
    </CenaConta>
  )
}

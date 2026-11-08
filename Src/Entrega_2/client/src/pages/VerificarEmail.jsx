import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Footer from '../components/Footer'
import { ui } from '../styles/ui'
import { verificarEmail } from '../services/api'

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
    <div className={`${ui.page} relative overflow-x-clip`}>
      <div className={ui.container}>
        <div className={`${ui.card} relative z-[2] text-center`}>
          {estado === 'carregando' && (
            <>
              <h1 className={ui.title}>Confirmando…</h1>
              <p className={ui.subtitle}>Só um instante, estamos confirmando seu e-mail.</p>
            </>
          )}

          {estado === 'ok' && (
            <>
              <h1 className={ui.title}>E-mail confirmado!</h1>
              <p className={ui.subtitle}>
                {precisaAprovacao
                  ? 'Agora seu cadastro segue para análise de um administrador. Você poderá entrar assim que ele for aprovado.'
                  : 'Sua conta está ativa. Já pode entrar no TrocaTicket.'}
              </p>
              <Link to="/login" className={ui.btnPrimary + ' block'}>Ir para o login</Link>
            </>
          )}

          {estado === 'erro' && (
            <>
              <h1 className={ui.title}>Não foi possível confirmar</h1>
              <p className={ui.subtitle}>{mensagem}</p>
              <Link to="/login" className={ui.btnPrimary + ' block'}>Ir para o login</Link>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'

// protege uma rota por perfil
// roles omitido ou [] = so exige estar logado, qualquer perfil
// roles=['administrador'] = so esse(s) perfil(is) passam
export default function ProtectedRoute({ roles, children }) {
  const { logado, perfil } = useAuth()
  const location = useLocation()

  if (!logado) {
    return <Navigate to="/Login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(perfil)) {
    // logado, mas sem permissao pra essa area -> manda pro painel dele
    return <Navigate to="/PainelDeEventos" replace />
  }

  return children
}
// useState = guarda o que foi digitado
import { useState } from 'react'
// yup = biblioteca que confere se os dados seguem regras (ex: formato de e-mail)
import * as yup from 'yup'

// componente de teste pra validar email usando a biblioteca yup
function ValidacaoEmail() {
  // guarda o que foi digitado no formulario
  const [formData, setFormData] = useState({ email: '' })

  // regras de validacao: email tem que ter formato valido e e obrigatorio
  const verify = yup.object({
    email: yup.string().email().required(),
  })

  // atualiza o campo pelo name do input (assim serve pra mais campos depois)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // roda quando envia o formulario (apertando enter no campo)
  const enviarValidacao = async (e) => {
    // impede o form de recarregar a pagina
    e.preventDefault()
    // tenta validar, se der erro cai no catch e mostra no console
    try {
      // confere o formData com as regras; se passar, mostra 'validado' no console
      await verify.validate(formData)
      console.log('validado')
    } catch (err) { // corrigido: "err" não estava declarado
      console.error(err.errors)
    }
  }

  return (
    // formulario ocupando a tela toda com o campo centralizado
    <form onSubmit={enviarValidacao} className="min-h-screen bg-tt-cinza-claro flex items-center justify-center p-4">
      {/* campo de email, o name precisa ser igual a chave do formData */}
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full max-w-[440px] px-4 py-3 rounded-full border border-tt-azul-marinho/12 text-sm text-tt-azul-marinho bg-tt-branco outline-none focus:border-tt-azul-principal"
      />
    </form>
  )
}

// deixa a pagina disponivel pras rotas
export default ValidacaoEmail
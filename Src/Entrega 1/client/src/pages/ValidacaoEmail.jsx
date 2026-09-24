import { useState } from 'react'
import * as yup from 'yup'

function ValidacaoEmail() {
  const [formData, setFormData] = useState({ email: '' })

  const verify = yup.object({
    email: yup.string().email().required(),
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const enviarValidacao = async (e) => {
    e.preventDefault()
    try {
      await verify.validate(formData)
      console.log('validado')
    } catch (err) { // corrigido: "err" não estava declarado
      console.error(err.errors)
    }
  }

  return (
    <form onSubmit={enviarValidacao} className="min-h-screen bg-navy flex items-center justify-center p-4">
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full max-w-[440px] px-3.5 py-2.5 rounded-md text-sm text-navy bg-white outline-none"
      />
    </form>
  )
}

export default ValidacaoEmail

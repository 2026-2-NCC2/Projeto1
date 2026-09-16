import { useState } from 'react'
import * as yup from 'yup'

function Cadastro(){

    const [formData, setFormData] = useState({email: ''})

    const verify = yup.object({
        email: yup.string().email().required()
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value})
    }

    const enviarValidacao = async (e) => {
        e.preventDefault()
        try {
            await verify.validate(formData)
            console.log("validado")
        } catch {
            console.error(err.errors)
        }
    }

    return (
        <form onSubmit={enviarValidacao}>
            <input 
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange} 
                required/>
        </form>
    )
}

export default Cadastro
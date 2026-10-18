import jwt from "jsonwebtoken";

export function autenticar(req,res,next){
    const cabecalho = req.headers.authorization

    if(!cabecalho || !cabecalho.startsWith("Bearer ")){
        return res.status(401).json({erro: "Token de autenticação ausente."})
    }

    const token = cabecalho.slice("Bearer ".length)

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.usuario = payload
        next()
    } catch{
        return res.status(401).json({erro: "Token de autenticação inválido ou expirado"})
    }
}

export function permitir(...perfisPermitidos) {
    return (req, res, next) => {
        if (!perfisPermitidos.includes(req.usuario?.perfil)) {
            return res.status(403).json({ erro: 'Acesso negado para o seu perfil.' })
        }
        next()
    }
}
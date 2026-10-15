import jwt from "jsonwebtoken";

export function autenticar(req,res,next){
    const cabecalho = req.headers.authorization

    if(!cabecalho || !cabecalho.startsWith("Bearer")){
        return res.status(401).json({erro: "Token de autenticação ausente."})
    }
}
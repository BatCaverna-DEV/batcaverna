import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET;

const auth = (req, res, next) => {

    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({message:"Acesso negado"});
    }
    try{
        const decoded = jwt.verify(token.replace('Bearer ', ''), secret)
        req.userId = decoded.id
        next()
    }catch(err){
        return res.status(401).json({message:"Erro: "+err});
    }

}

export default auth
import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

/**
 * Middleware das rotas de integração (/integracao/v1).
 *
 * Outros sistemas (o GradeIF, por exemplo) se identificam com um token de serviço
 * no cabeçalho X-Integracao-Token, igual ao INTEGRACAO_TOKEN do .env.
 * Sem INTEGRACAO_TOKEN configurado, a integração fica desligada (503).
 * Ver INTEGRACAO.md.
 */

// Compara pelos hashes: mesmo tamanho sempre, e o tempo não depende do conteúdo.
const resumo = (valor) => crypto.createHash('sha256').update(String(valor)).digest()

const integracao = (req, res, next) => {
    const esperado = process.env.INTEGRACAO_TOKEN
    if (!esperado) {
        return res.status(503).json({ message: 'Integração desligada neste servidor.' })
    }

    const recebido = req.get('X-Integracao-Token')
    if (!recebido || !crypto.timingSafeEqual(resumo(recebido), resumo(esperado))) {
        return res.status(401).json({ message: 'Token de integração ausente ou inválido.' })
    }
    next()
}

export default integracao

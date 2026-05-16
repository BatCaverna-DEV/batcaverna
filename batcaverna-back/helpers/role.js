/**
 * Middlewares de controle de acesso por papel (role).
 *
 * Papéis:
 *   categoria 1 → Supremo  (acesso total)
 *   categoria 2 → Coordenador (acesso restrito)
 *
 * Uso após o middleware `auth` (que popula req.userCategoria):
 *   router.post('/cadastro', auth, ehSupremo, controller.cadastrar)
 */

/** Permite apenas o Supremo (categoria 1). */
export const ehSupremo = (req, res, next) => {
    if (req.userCategoria !== 1) {
        return res.status(403).json({ message: 'Acesso restrito ao Supremo.' })
    }
    next()
}

/** Permite Supremo (categoria 1) ou Coordenador (categoria 2). */
export const ehGestor = (req, res, next) => {
    if (req.userCategoria !== 1 && req.userCategoria !== 2) {
        return res.status(403).json({ message: 'Acesso restrito ao Supremo ou Coordenador.' })
    }
    next()
}

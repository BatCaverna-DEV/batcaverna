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

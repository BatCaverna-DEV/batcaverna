export function statusCalendario(status){
    if(status === 0){
        return 'Fechado'
    }else{
        return 'Ativo'
    }
}

export function statusUsuario(categoria){
    if(categoria === 1) return 'Supremo'
    if(categoria === 2) return 'Coordenador'
    return 'Sem acesso'
}

export function statusProfessor(status){
    if(status === 1) return 'Ativo'
    if(status === 2) return 'Afastado'
    if(status === 3) return 'Inativo'
    return '—'
}

export function classStatusProfessor(status){
    if(status === 1) return 'badge-prof-ativo'
    if(status === 2) return 'badge-prof-afastado'
    return 'badge-prof-inativo'
}

export function tipoProfessor(tipo){
    if(tipo === 1) return 'Docente'
    if(tipo === 2) return 'Administrador'
    return '—'
}
/* ── Plano de Ensino ─────────────────────────────────────────────────────────
 * Campo `plano` do diário: 6 etapas em ordem, de Pendente a Inserido no Diário.
 * ────────────────────────────────────────────────────────────────────────── */

export const PLANO_ETAPAS = [
    { valor: 1, rotulo: 'Pendente',                 curto: 'Pendente',   icone: 'fa-hourglass-start',  cor: 'plano-1' },
    { valor: 2, rotulo: 'Entregue ao Pedagógico',   curto: 'Entregue',   icone: 'fa-paper-plane',      cor: 'plano-2' },
    { valor: 3, rotulo: 'Revisado pelo Pedagógico', curto: 'Revisado',   icone: 'fa-pen-to-square',    cor: 'plano-3' },
    { valor: 4, rotulo: 'Entregue ao Conselho',     curto: 'No Conselho', icone: 'fa-people-group',    cor: 'plano-4' },
    { valor: 5, rotulo: 'Aprovado pelo Conselho',   curto: 'Aprovado',   icone: 'fa-circle-check',     cor: 'plano-5' },
    { valor: 6, rotulo: 'Inserido no Diário',       curto: 'Inserido',   icone: 'fa-book-bookmark',    cor: 'plano-6' },
]

export const PLANO_MIN = 1
export const PLANO_MAX = PLANO_ETAPAS.length

/** Diários antigos podem ter `plano` nulo — tratados como Pendente. */
export function planoNormalizado(valor) {
    return Number(valor) || PLANO_MIN
}

export function etapaPlano(valor) {
    return PLANO_ETAPAS.find(e => e.valor === planoNormalizado(valor)) ?? PLANO_ETAPAS[0]
}

export function statusPlano(valor) {
    return etapaPlano(valor).rotulo
}

export function statusPlanoCurto(valor) {
    return etapaPlano(valor).curto
}

export function classStatusPlano(valor) {
    return `badge-${etapaPlano(valor).cor}`
}

export function iconePlano(valor) {
    return etapaPlano(valor).icone
}

/** Percentual de conclusão da etapa (1 → 0%, 6 → 100%). */
export function progressoPlano(valor) {
    return Math.round(((planoNormalizado(valor) - PLANO_MIN) / (PLANO_MAX - PLANO_MIN)) * 100)
}

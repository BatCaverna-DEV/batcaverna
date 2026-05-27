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
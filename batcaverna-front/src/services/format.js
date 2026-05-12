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
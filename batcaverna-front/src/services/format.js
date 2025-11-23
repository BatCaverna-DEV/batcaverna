export function statusCalendario(status){
    if(status === 0){
        return 'Fechado'
    }else{
        return 'Ativo'
    }
}

export function statusUsuario(status){
    if(status === 1){
        return 'Professor'
    }else if(status === 2){
        return 'Coordenador'
    }
}
/** Retorna true se o usuário logado é Supremo (categoria 1). */
export function ehSupremo() {
    const user = getUser()
    return user?.categoria === 1
}

/** Retorna true se o usuário logado é Supremo (1) ou Coordenador (2). */
export function ehGestor() {
    const user = getUser()
    return user?.categoria === 1 || user?.categoria === 2
}

export function getUser() {
    const token = localStorage.getItem("bat_token");

    if (!token || token === 'null' || token === 'undefined') return null

    try {
        // Pega a parte do payload (segunda parte do JWT)
        const [, payloadBase64] = token.split('.')
        if (!payloadBase64) return null

        // Converte Base64URL → JSON
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/')

        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        // Retorna o objeto do payload
        return JSON.parse(jsonPayload)
    } catch (e) {
        console.error('Erro ao decodificar token:', e)
        return null
    }
}

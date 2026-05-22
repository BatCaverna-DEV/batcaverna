import {getToken} from "./auth.js";

// Ajuste via .env: VITE_API_BASE="http://localhost:3000"
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

export async function apiFetch(path, options = {}) {
    const token = getToken();
    const body = options.body || '';
    const method = options.method || 'GET';
    const url = `${API_BASE}${path}`

    const resposta = await fetch(url, {
        method: method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    });

    return resposta

}//Fim do apiFetch

/**
 * Envia um FormData (multipart/form-data) com autenticação JWT.
 * Não define Content-Type — o browser o define automaticamente com o boundary correto.
 */
export async function apiFetchFile(path, formData) {
    const token = getToken()
    return await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
    })
}//Fim do apiFetchFile
<script setup>
import { ref } from 'vue'
import { apiFetch } from '@/services/http.js'

const siape    = ref('')
const loading  = ref(false)
const enviado  = ref(false)
const erro     = ref('')

async function solicitar() {
    erro.value = ''
    loading.value = true
    try {
        const res  = await apiFetch('/usuario/recuperar', {
            method: 'POST',
            body: { siape: siape.value },
        })
        const data = await res.json()
        if (res.ok) {
            enviado.value = true
        } else {
            erro.value = data.message
        }
    } catch {
        erro.value = 'Erro de conexão. Tente novamente.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="tela-login">
        <div class="login-card">

            <div class="logo-wrap">
                <img src="../../assets/batman.png" alt="Logo">
            </div>

            <h5>Recuperar Senha</h5>

            <!-- Confirmação de envio -->
            <div v-if="enviado" class="text-center">
                <div class="mb-3" style="font-size:2.5rem">📧</div>
                <p class="text-muted" style="font-size:.9rem">
                    Se o SIAPE estiver cadastrado, você receberá um e-mail com o link para redefinir sua senha.
                </p>
                <p class="text-muted" style="font-size:.82rem">Verifique também a caixa de spam.</p>
                <a href="/login" class="btn btn-dark w-100 mt-2">
                    <i class="fa-solid fa-arrow-left me-2"></i>Voltar ao login
                </a>
            </div>

            <!-- Formulário -->
            <template v-else>
                <p class="text-muted mb-3" style="font-size:.85rem;text-align:center">
                    Informe seu SIAPE e enviaremos um link para redefinição de senha.
                </p>

                <div v-if="erro" class="alert alert-danger py-2 mb-3" role="alert">
                    <i class="fa-solid fa-circle-exclamation me-2"></i>{{ erro }}
                </div>

                <form @submit.prevent="solicitar">
                    <div class="mb-4">
                        <label class="form-label">SIAPE</label>
                        <input v-model="siape" type="text" class="form-control"
                               placeholder="Digite seu SIAPE" required autocomplete="username">
                    </div>

                    <button type="submit" class="btn btn-dark w-100 mb-3" :disabled="loading">
                        <span v-if="loading">
                            <span class="spinner-border spinner-border-sm me-2"></span>Enviando…
                        </span>
                        <span v-else>
                            <i class="fa-solid fa-paper-plane me-2"></i>Enviar link de redefinição
                        </span>
                    </button>

                    <div class="text-center">
                        <a href="/login" class="text-muted" style="font-size:.82rem">
                            <i class="fa-solid fa-arrow-left me-1"></i>Voltar ao login
                        </a>
                    </div>
                </form>
            </template>

        </div>
    </div>
</template>

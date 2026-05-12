<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiFetch } from '@/services/http.js'

const router = useRouter()
const route  = useRoute()

const novaSenha   = ref('')
const confirmacao = ref('')
const loading     = ref(false)
const sucesso     = ref(false)
const erro        = ref('')
const linkValido  = ref(true)

const mostrarNova  = ref(false)
const mostrarConf  = ref(false)

const id     = route.query.id
const codigo = route.query.codigo

onMounted(() => {
    if (!id || !codigo) {
        linkValido.value = false
        erro.value = 'Link inválido. Solicite uma nova redefinição de senha.'
    }
})

async function redefinir() {
    erro.value = ''

    if (novaSenha.value.length < 6) {
        erro.value = 'A senha deve ter no mínimo 6 caracteres.'
        return
    }
    if (novaSenha.value !== confirmacao.value) {
        erro.value = 'As senhas não coincidem.'
        return
    }

    loading.value = true
    try {
        const res  = await apiFetch('/usuario/redefinir', {
            method: 'POST',
            body: { id, codigo, novaSenha: novaSenha.value },
        })
        const data = await res.json()
        if (res.ok) {
            sucesso.value = true
            setTimeout(() => router.push('/login'), 2500)
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

            <h5>Redefinir Senha</h5>

            <!-- Link inválido -->
            <div v-if="!linkValido" class="text-center">
                <div class="mb-3" style="font-size:2.5rem">⚠️</div>
                <p class="text-danger" style="font-size:.9rem">{{ erro }}</p>
                <RouterLink to="/usuario/recuperar" class="btn btn-dark w-100 mt-2">
                    <i class="fa-solid fa-rotate-left me-2"></i>Solicitar novo link
                </RouterLink>
            </div>

            <!-- Sucesso -->
            <div v-else-if="sucesso" class="text-center">
                <div class="mb-3" style="font-size:2.5rem">✅</div>
                <p class="text-success fw-semibold">Senha redefinida com sucesso!</p>
                <p class="text-muted" style="font-size:.85rem">Redirecionando para o login…</p>
            </div>

            <!-- Formulário -->
            <template v-else>
                <p class="text-muted mb-3" style="font-size:.85rem;text-align:center">
                    Crie uma nova senha para o seu acesso.
                </p>

                <div v-if="erro" class="alert alert-danger py-2 mb-3">
                    <i class="fa-solid fa-circle-exclamation me-2"></i>{{ erro }}
                </div>

                <form @submit.prevent="redefinir">
                    <!-- Nova senha -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Nova senha</label>
                        <div class="input-group">
                            <input v-model="novaSenha"
                                   :type="mostrarNova ? 'text' : 'password'"
                                   class="form-control"
                                   :class="novaSenha && novaSenha.length < 6 ? 'is-invalid' : ''"
                                   placeholder="Mínimo 6 caracteres"
                                   required autocomplete="new-password">
                            <button type="button" class="btn btn-outline-secondary"
                                    @click="mostrarNova = !mostrarNova" tabindex="-1">
                                <i :class="mostrarNova ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                            </button>
                            <div class="invalid-feedback">Mínimo 6 caracteres.</div>
                        </div>
                    </div>

                    <!-- Confirmação -->
                    <div class="mb-4">
                        <label class="form-label fw-semibold">Confirmar nova senha</label>
                        <div class="input-group">
                            <input v-model="confirmacao"
                                   :type="mostrarConf ? 'text' : 'password'"
                                   class="form-control"
                                   :class="confirmacao && confirmacao !== novaSenha ? 'is-invalid' : ''"
                                   placeholder="Repita a nova senha"
                                   required autocomplete="new-password">
                            <button type="button" class="btn btn-outline-secondary"
                                    @click="mostrarConf = !mostrarConf" tabindex="-1">
                                <i :class="mostrarConf ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                            </button>
                            <div class="invalid-feedback">As senhas não coincidem.</div>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-dark w-100" :disabled="loading">
                        <span v-if="loading">
                            <span class="spinner-border spinner-border-sm me-2"></span>Salvando…
                        </span>
                        <span v-else>
                            <i class="fa-solid fa-floppy-disk me-2"></i>Salvar nova senha
                        </span>
                    </button>
                </form>
            </template>

        </div>
    </div>
</template>

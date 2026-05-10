<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/services/http.js'
import NavAdmin from '@/components/NavAdmin.vue'

const router = useRouter()

const senhaAtual   = ref('')
const novaSenha    = ref('')
const confirmacao  = ref('')
const loading      = ref(false)
const erro         = ref('')
const sucesso      = ref(false)

const mostrarAtual  = ref(false)
const mostrarNova   = ref(false)
const mostrarConf   = ref(false)

async function alterar() {
    erro.value    = ''
    sucesso.value = false

    if (novaSenha.value.length < 6) {
        erro.value = 'A nova senha deve ter no mínimo 6 caracteres.'
        return
    }
    if (novaSenha.value !== confirmacao.value) {
        erro.value = 'A nova senha e a confirmação não coincidem.'
        return
    }

    loading.value = true
    try {
        const res = await apiFetch('/usuario/senha', {
            method: 'PUT',
            body: { senhaAtual: senhaAtual.value, novaSenha: novaSenha.value },
        })
        const data = await res.json()
        if (res.ok) {
            sucesso.value = true
            senhaAtual.value  = ''
            novaSenha.value   = ''
            confirmacao.value = ''
            setTimeout(() => router.push('/admin'), 2000)
        } else {
            erro.value = data.message
        }
    } catch (err) {
        erro.value = 'Erro de conexão. Tente novamente.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <NavAdmin/>
    <div class="container pagina">

        <div class="pagina-header">
            <h4><i class="fa-solid fa-key me-2"></i>Alterar Senha</h4>
            <a class="btn btn-outline-secondary btn-sm" href="/admin">
                <i class="fa-solid fa-arrow-left me-1"></i>Voltar
            </a>
        </div>

        <div class="pagina-body">
            <div class="row justify-content-center">
                <div class="col-md-5">

                    <div v-if="sucesso" class="alert alert-success d-flex align-items-center gap-2 py-2">
                        <i class="fa-solid fa-circle-check"></i>
                        Senha alterada com sucesso! Redirecionando…
                    </div>

                    <div v-if="erro" class="alert alert-danger d-flex align-items-center gap-2 py-2">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        {{ erro }}
                    </div>

                    <form @submit.prevent="alterar" class="card border-0 shadow-sm p-4">

                        <!-- Senha atual -->
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Senha atual</label>
                            <div class="input-group">
                                <input
                                    v-model="senhaAtual"
                                    :type="mostrarAtual ? 'text' : 'password'"
                                    class="form-control"
                                    placeholder="Digite sua senha atual"
                                    required
                                    autocomplete="current-password"
                                >
                                <button type="button" class="btn btn-outline-secondary"
                                        @click="mostrarAtual = !mostrarAtual" tabindex="-1">
                                    <i :class="mostrarAtual ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                                </button>
                            </div>
                        </div>

                        <hr class="my-3">

                        <!-- Nova senha -->
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Nova senha</label>
                            <div class="input-group">
                                <input
                                    v-model="novaSenha"
                                    :type="mostrarNova ? 'text' : 'password'"
                                    class="form-control"
                                    :class="novaSenha && novaSenha.length < 6 ? 'is-invalid' : ''"
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    autocomplete="new-password"
                                >
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
                                <input
                                    v-model="confirmacao"
                                    :type="mostrarConf ? 'text' : 'password'"
                                    class="form-control"
                                    :class="confirmacao && confirmacao !== novaSenha ? 'is-invalid' : ''"
                                    placeholder="Repita a nova senha"
                                    required
                                    autocomplete="new-password"
                                >
                                <button type="button" class="btn btn-outline-secondary"
                                        @click="mostrarConf = !mostrarConf" tabindex="-1">
                                    <i :class="mostrarConf ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                                </button>
                                <div class="invalid-feedback">As senhas não coincidem.</div>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-dark w-100" :disabled="loading || sucesso">
                            <span v-if="loading">
                                <span class="spinner-border spinner-border-sm me-2"></span>Salvando…
                            </span>
                            <span v-else>
                                <i class="fa-solid fa-floppy-disk me-2"></i>Salvar nova senha
                            </span>
                        </button>

                    </form>

                </div>
            </div>
        </div>

    </div>
</template>

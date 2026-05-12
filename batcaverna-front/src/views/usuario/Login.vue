<script setup>
  import { ref } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { apiFetch } from "@/services/http.js"
  import { setToken } from '@/services/auth.js'

  const router = useRouter()
  const route  = useRoute()

  const username = ref('')
  const password = ref('')
  const loading  = ref(false)
  const erro     = ref('')

  async function login() {
    erro.value = ''
    loading.value = true
    try {
      const resposta = await apiFetch('/usuario/login', {
        method: 'POST',
        body: { username: username.value, password: password.value },
      })
      const token = await resposta.json()
      if (resposta.ok) {
        setToken(token.value)
        router.replace(route.query.redirect ?? '/admin')
      } else {
        erro.value = token.message
      }
    } catch (err) {
      erro.value = err.message || 'Falha no login!'
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

      <h5>Acesso ao Sistema</h5>

      <div v-if="erro" class="alert alert-danger py-2 mb-3" role="alert">
        <i class="fa-solid fa-circle-exclamation me-2"></i>{{ erro }}
      </div>

      <form @submit.prevent="login">
        <div class="mb-3">
          <label for="username" class="form-label">Usuário</label>
          <input v-model="username" type="text" id="username" name="username" required
                 class="form-control" placeholder="Digite seu SIAPE" autocomplete="username">
        </div>

        <div class="mb-4">
          <label for="password" class="form-label">Senha</label>
          <input v-model="password" type="password" id="password" name="password" required
                 class="form-control" placeholder="••••••••" autocomplete="current-password">
        </div>

        <button :disabled="loading" class="btn btn-dark w-100 mb-3">
          <span v-if="loading">
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>Entrando…
          </span>
          <span v-else>
            <i class="fa-solid fa-right-to-bracket me-2"></i>Entrar
          </span>
        </button>

        <div class="text-center">
          <RouterLink to="/usuario/recuperar" class="text-muted" style="font-size:.82rem">Esqueci a senha / Primeiro acesso</RouterLink>
        </div>
      </form>

    </div>
  </div>
</template>

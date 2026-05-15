<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { apiFetch } from "@/services/http.js"
  import { setToken } from '@/services/auth.js'

  const router = useRouter()
  const route  = useRoute()

  const loading = ref(false)
  const erro    = ref('')

  async function handleGoogleCredential(response) {
    erro.value = ''
    loading.value = true
    try {
      const resposta = await apiFetch('/usuario/login-google', {
        method: 'POST',
        body: { credential: response.credential },
      })
      const token = await resposta.json()
      if (resposta.ok) {
        setToken(token.value)
        router.replace(route.query.redirect ?? '/admin')
      } else {
        erro.value = token.message
      }
    } catch (err) {
      erro.value = err.message || 'Falha na autenticação com Google.'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !window.google) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback:  handleGoogleCredential,
    })

    window.google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { theme: 'outline', size: 'large', width: 336, locale: 'pt-BR' }
    )
  })
</script>

<template>
  <div class="tela-login">
    <div class="login-card">

      <div class="logo-wrap">
        <img src="../../assets/batman.png" alt="Logo">
      </div>

      <h5>Acesso ao Sistema</h5>

      <p class="instrucao">
        Use seu e-mail institucional <strong>@ifma.edu.br</strong> para entrar.
      </p>

      <div v-if="erro" class="alert alert-danger py-2 mb-3" role="alert">
        <i class="fa-solid fa-circle-exclamation me-2"></i>{{ erro }}
      </div>

      <div v-if="loading" class="text-center my-3 text-muted">
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>Entrando…
      </div>

      <div id="google-btn" class="d-flex justify-content-center mb-2"></div>

      <div class="text-center mt-3">
        <RouterLink to="/" class="text-muted d-inline-flex align-items-center gap-1" style="font-size:.82rem">
          <i class="fa-solid fa-arrow-left" style="font-size:.72rem"></i>Voltar para a página inicial
        </RouterLink>
      </div>

    </div>
  </div>
</template>

<style scoped>
.instrucao {
  text-align: center;
  font-size: .82rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
}
</style>

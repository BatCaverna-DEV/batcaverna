<script setup>

  import {ref} from 'vue'
  import {useRouter, useRoute} from 'vue-router'
  import {apiFetch} from "@/services/http.js";
  import {setToken} from '@/services/auth.js'
  import Navbar from "@/components/Navbar.vue";

  const router = useRouter()
  const route = useRoute()

  const username = ref('')
  const password = ref('')
  const loading = ref(false)
  const erro = ref('')

  async function login() {
    erro.value = ''
    loading.value = true
    try{

      const resposta = await apiFetch('/usuario/login', {
        method: 'POST',
        body: {username: username.value, password: password.value},
      })

      const token = await resposta.json()
      if(resposta.ok){
        setToken(token.value)
        const redirectTo = (route.query.redirect ?? '/admin');
        router.replace(redirectTo);
      }else{
        erro.value = token.message
      }

    }catch(err){
      erro.value = err.message || 'Falha no login!'
    }finally{
      loading.value = false
    }
  }

</script>

<template>
  <Navbar/>
  <div class="col-md-3 mx-auto bg-body-secondary m-2 p-4 rounded rounded-2 shadow">
    <img src="../../assets/batman.png" alt="" class="w-50 d-block mx-auto">
    <h5 class="text-center my-4">Acesso ao Batcaverna</h5>

    <div v-if="erro" class="alert alert-danger" role="alert">
      <strong>ERRO: </strong> {{ erro }}
    </div>

    <form @submit.prevent="login">
      <div class="row">
        <div class="col">
          <label for="username">NOME DE USUÁRIO</label>
          <input v-model="username" type="text" name="username" id="username" required class="form-control mb-4"/>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <label for="password">SENHA</label>
          <input v-model="password" type="password" name="password" id="password" required class="form-control mb-4" />
        </div>
      </div>
      <div class="row mb-3">
        <div class="col">
          <button :disabled="loading" class="btn btn-dark w-100">{{ loading ? 'Entrando…' : 'Entrar' }}</button>
        </div>
      </div>

      <div class="row">
        <div class="col text-center">
          <a class="w-100" href="#">Esqueci a Senha</a>
        </div>
      </div>
    </form>
  </div>

</template>

<style scoped>

</style>
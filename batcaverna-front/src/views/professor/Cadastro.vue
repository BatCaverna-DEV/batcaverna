<script setup>

  import {ref, onMounted} from "vue";
  import { useRouter} from 'vue-router'
  import {apiFetch} from "@/services/http.js";
  import NavAdmin from "@/components/NavAdmin.vue";

  const router = useRouter()

  let professor = ref({nome: '', siape:'', email:''});
  let erro = ref('')

  async function cadastrar(){
    erro.value = ''
    try{
      const resposta = await apiFetch('/professor/cadastro', {
        method: 'POST',
        body: professor.value,
      })
      if(resposta.ok){
        alert('Professor cadastrado com sucesso!')
        router.push('/professor/lista', {query: {sucesso: '1'}})
      }else{
        const msg = await resposta.json()
        erro.value = `${resposta.status} - ${msg.message}`
      }
    }catch(error){
      erro.value = `${error.message}`
    }

  }//Fim do Cadastrar

</script>

<template>
  <!-- As a link -->
  <NavAdmin/>
  <div class="container shadow p-3">
    <nav class="navbar bg-body-tertiary">
      <div class="container-fluid">
        <h4>Cadastro de Professor</h4>
        <a class="btn btn-secondary" href="/professor/lista">Voltar</a>
      </div>
    </nav>

    <div v-if="erro" class="alert alert-danger" role="alert">
      <strong>ERRO: </strong> {{ erro }}
    </div>

    <form @submit.prevent="cadastrar">
      <div class="row mt-3">
        <div class="col-sm-3">
          <label for="siape">SIAPE</label>
          <input v-model="professor.siape" type="text" name="siape" id="siape" required class="form-control"/>
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-sm">
          <label for="nome">NOME</label>
          <input v-model="professor.nome" type="text" name="nome" id="nome" required class="form-control"/>
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-sm-6">
          <label for="email">E-MAIL</label>
          <input v-model="professor.email" type="text" id="email" required class="form-control"/>
        </div>
      </div>

      <div class="d-flex justify-content-end">
        <button type="submit" class="btn btn-success">Salvar</button>
      </div>
    </form>
  </div>

</template>

<style scoped>



</style>
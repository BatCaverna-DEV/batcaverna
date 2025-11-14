<script setup>

import {onMounted, ref} from 'vue'
import {apiFetch} from "@/services/http.js";
import {useRouter} from 'vue-router'
import NavAdmin from "@/components/NavAdmin.vue";

const router = useRouter()
let curso = ref({descricao: '', professor_id: 0})
let professores = ref({})
let erro = ref('')

async function salvar(){
  erro.value = ''
  try{
    const resposta = await apiFetch("/curso/cadastro", {
      method: "POST",
      body: curso.value
    })
    if(resposta.ok){
      alert('Curso cadastrado com sucesso!')
      router.push('/curso/lista')
    }else{
      const msg = await resposta.json()
      erro.value = `${resposta.status} - ${msg.message}`
    }
  }catch(err){
    erro.value = `${err.value}`
  }
}

onMounted(async () => {

  const resposta = await apiFetch('/professor' )
  if(resposta.ok){
    professores.value = await resposta.json()
  }

})

</script>

<template>
  <NavAdmin/>
  <div class="container shadow p-3">
    <nav class="navbar bg-body-tertiary">
      <div class="container-fluid">
        <h4>Cadastro de Curso</h4>
        <a class="btn btn-secondary" href="/curso/lista">Voltar</a>
      </div>
    </nav>

    <div v-if="erro" class="alert alert-danger" role="alert">
      <strong>ERRO: </strong> {{ erro }}
    </div>

    <form @submit.prevent="salvar">
      <div class="row mt-3">
        <div class="col-sm">
          <label for="descricao">DESCRIÇÃO DO CURSO</label>
          <input v-model="curso.descricao" type="text" class="form-control" id="descricao" required>
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-sm">
          <label for="professor_id">COORDENADOR</label>
          <select v-model="curso.professor_id" class="form-select" id="professor_id" required>
            <option v-for="professor in professores"
                    :key="professor.id"
                    :value="professor.id">
              {{ professor.nome }}
            </option>
          </select>
        </div>
      </div>

      <div class="row mt-3 ">
        <div class="col-sm d-flex justify-content-end">
          <button type="submit" class="btn btn-success">Salvar</button>
        </div>
      </div>

    </form>

  </div>
</template>

<style scoped>

</style>
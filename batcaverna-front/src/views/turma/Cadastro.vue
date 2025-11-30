<script setup>

import {onMounted, ref} from 'vue'
import {apiFetch} from "@/services/http.js";
import {useRouter} from 'vue-router'
import NavAdmin from "@/components/NavAdmin.vue";
import {getUser} from "@/services/token.js";

const router = useRouter()
const usuario = ref(getUser())
let turma = ref({descricao: '', codigo: '', calendario_id:0, curso_id:0})
let erro = ref('')
let calendarios = ref([])
let curso = ref({})

onMounted(async () => {
  const resposta = await apiFetch('/calendario')
  if(resposta.ok){
    calendarios.value = await resposta.json()
  }else{
    let msg = await resposta.json()
    erro.value = msg.message
  }
  const resposta2 = await apiFetch('/curso/coordena/'+usuario.value.professor_id)
  if(resposta2.ok){
    curso.value = await resposta2.json()
    turma.value.curso_id = curso.value.id
  }
})

async function salvar(){
  erro.value = ''
  try{
    const resposta = await apiFetch("/turma/cadastro", {
      method: "POST",
      body: turma.value
    })
    if(resposta.ok){
      alert('Turma cadastrada com sucesso!')
      router.push('/turma/lista')
    }else{
      const msg = await resposta.json()
      erro.value = `${resposta.status} - ${msg.message}`
    }
  }catch(e){
    erro.value = `${e.value}`
  }
}

</script>

<template>
  <NavAdmin/>
  <div class="container shadow p-3">
    <nav class="navbar bg-body-tertiary">
      <div class="container-fluid">
        <h4>Cadastro de Turma</h4>
        <a class="btn btn-secondary" href="/turma/lista">Voltar</a>
      </div>
    </nav>

    <div v-if="erro" class="alert alert-danger" role="alert">
      <strong>ERRO: </strong> {{ erro }}
    </div>

    <form @submit.prevent="salvar">

      <div class="row mt-3">
        <div class="col-sm">
          <label for="descricao">DESCRIÇÃO DA TURMA</label>
          <input v-model="turma.descricao" type="text" class="form-control" id="descricao" required>
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-sm-3">
          <label for="descricao">CÓDIGO DA TURMA</label>
          <input v-model="turma.codigo" type="text" class="form-control" id="descricao" required>
        </div>
        <div class="col-sm-4">
          <label for="calendario_id">CALENDÁRIO</label>
          <select v-model="turma.calendario_id" class="form-select" id="calendario_id" required>
            <option v-for="calendario in calendarios.filter(c => c.status === 1)"
                    :key="calendario.id"
                    :value="calendario.id">
              {{ `${calendario.descricao} - ${calendario.ano}.${calendario.semestre}` }}
            </option>
          </select>
        </div>
        <div class="col-sm-5">
          <label for="curso_id">CURSO</label>
          <input v-model="curso.descricao" type="text" class="form-control" id="curso_id" required readonly/>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-sm d-flex justify-content-end">
          <button type="submit" class="btn btn-success">Salvar</button>
        </div>
      </div>
    </form>

  </div>
</template>

<style scoped>

</style>
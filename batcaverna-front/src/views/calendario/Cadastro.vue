<script setup>

  import NavAdmin from "@/components/NavAdmin.vue";
  import {ref} from "vue";
  import { useRouter} from 'vue-router'
  import {apiFetch} from "@/services/http.js";

  const router = useRouter()
  let calendario = ref({descricao: '', ano:0, semestre:0, inicio: '', fim:''});
  let erro = ref('')

  async function salvar(){

    erro.value = ''
    try {
      const resposta = await apiFetch('/calendario/cadastro', {
        method: 'POST',
        body: calendario.value,
      })
      if(resposta.ok){
        alert('Calendário cadastrado com sucesso!')
        router.push('/calendario/lista')
      }else{
        const msg = await resposta.json()
        erro.value = `${resposta.status} - ${msg.message}`
      }
    }catch(err){
      erro.value = `${err.message}`
    }

  }

</script>

<template>

  <NavAdmin/>
  <div class="container shadow p-3">
    <nav class="navbar bg-body-tertiary">
      <div class="container-fluid">
        <h4>Cadastro de Calendário</h4>
        <a class="btn btn-secondary" href="/calendario/lista">Voltar</a>
      </div>
    </nav>

    <form @submit.prevent="salvar">

      <div class="row mt-3">
        <div class="col-sm">
          <label for="descricao">DESCRICAO</label>
          <input v-model="calendario.descricao" type="text" name="descricao" id="descricao" required class="form-control"/>
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-sm">
          <label for="ano">ANO</label>
          <input v-model="calendario.ano" type="number" name="ano" id="ano" required class="form-control"/>
        </div>
        <div class="col-sm">
          <label for="semestre">SEMESTRE</label>
          <input v-model="calendario.semestre" type="number" name="semestre" id="semestre" required class="form-control"/>
        </div>
        <div class="col-sm">
          <label for="inicio">INÍCIO</label>
          <input v-model="calendario.inicio" type="date" name="inicio" id="inicio" required class="form-control"/>
        </div>
        <div class="col-sm">
          <label for="fim">FIM</label>
          <input v-model="calendario.fim" type="date" name="fim" id="fim" required class="form-control"/>
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
<script setup>

import NavAdmin from "@/components/NavAdmin.vue";
import {ref, onMounted} from "vue";
import { useRouter, useRoute} from 'vue-router'
import {apiFetch} from "@/services/http.js";
import {statusCalendario} from "@/services/format.js";

const router = useRouter()

const calendarios = ref([])

onMounted(async () => {
  let resposta = await apiFetch('/calendario')

  if(resposta.ok){
    calendarios.value = await resposta.json()
  }else{
    let msg = await resposta.json()
    alert('ERRO '+resposta.status+': '+msg.message)
    router.push('/admin')
  }
})

</script>

<template>

  <NavAdmin/>
  <div class="container shadow p-3">
    <nav class="navbar bg-body-tertiary">
      <div class="container-fluid">
        <h4>Calendários</h4>
        <span>
          <a class="btn btn-primary mx-1" href="/calendario/cadastro">Novo</a>
          <a class="btn btn-secondary mx-1" href="/admin">Voltar</a>
        </span>

      </div>
    </nav>

    <div class="row my-3 p-2">
      <div class="col-sm-4 fw-bolder">DESCRICAO</div>
      <div class="col-sm-1 fw-bolder text-center">ANO</div>
      <div class="col-sm-1 fw-bolder text-center">SEMESTRE</div>
      <div class="col-sm-2 fw-bolder text-center">INÍCIO</div>
      <div class="col-sm-2 fw-bolder text-center">FIM</div>
      <div class="col-sm-1 fw-bolder text-center">STATUS</div>
      <div class="col-sm-1"></div>
    </div>

    <div class="row mt-1 bg-body-tertiary p-2 selecionado" v-for="calendario in calendarios">
      <div class="col-sm-4">{{ calendario.descricao }}</div>
      <div class="col-sm-1 text-center">{{ calendario.ano }}</div>
      <div class="col-sm-1 text-center">{{ calendario.semestre }}</div>
      <div class="col-sm-2 text-center">{{ calendario.inicio }}</div>
      <div class="col-sm-2 text-center">{{ calendario.fim }}</div>
      <div class="col-sm-1 text-center">{{ statusCalendario(calendario.status) }}</div>
      <div class="col-sm-1 text-center d-flex justify-content-end">

        <div class="dropdown">
          <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fa-solid fa-bars"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="#">Finalizar</a></li>
            <li><a class="dropdown-item" href="#">Excluir</a></li>
          </ul>
        </div>

      </div>
    </div>

  </div>

</template>

<style scoped>

.selecionado:hover{
  background-color: darkgray !important;
}

</style>
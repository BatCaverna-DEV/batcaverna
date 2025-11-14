<script setup>

import NavAdmin from "@/components/NavAdmin.vue";
import {ref, onMounted} from "vue";
import {apiFetch} from "@/services/http.js";

const cursos = ref({})

onMounted(async () => {
  let resposta = await apiFetch('/curso');
  if(resposta.ok){
    cursos.value = await resposta.json();
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
        <h4>Cursos</h4>
        <span>
          <a class="btn btn-primary mx-1" href="/curso/cadastro">Novo</a>
          <a class="btn btn-secondary mx-1" href="/admin">Voltar</a>
        </span>

      </div>
    </nav>

    <div class="row my-3 p-1">
      <div class="col-sm-6 fw-bolder">DESCRIÇÃO</div>
      <div class="col-sm-5 fw-bolder ">COORDENADOR</div>
      <div class="col-sm-1 fw-bolder text-center"></div>
    </div>

    <div class="row mt-1 bg-body-tertiary p-2 selecionado" v-for="curso in cursos">
      <div class="col-sm-6">{{ curso.descricao }}</div>
      <div class="col-sm-5 ">{{ curso.professor?.nome }}</div>

      <div class="col-sm-1 text-center d-flex justify-content-end">
        <div class="dropdown">
          <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fa-solid fa-bars"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="#">Editar</a></li>
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
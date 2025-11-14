<script setup>

import NavAdmin from "@/components/NavAdmin.vue";
import {ref, onMounted} from "vue";
import {apiFetch} from "@/services/http.js";
import {getUser} from "@/services/token.js";

const usuario = getUser()

const turmas = ref({})

onMounted(async () => {

  let resposta = await apiFetch('/turma/'+usuario.id);
  if(resposta.ok){
    turmas.value = await resposta.json();
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
        <h4>Turmas</h4>
        <span>
          <a class="btn btn-primary mx-1" href="/turma/cadastro">Novo</a>
          <a class="btn btn-secondary mx-1" href="/admin">Voltar</a>
        </span>
      </div>
    </nav>

    <div class="row my-3 p-1">
      <div class="col-sm-2 fw-bolder">CÓDIGO</div>
      <div class="col-sm-2 fw-bolder">DESCRIÇÃO</div>
      <div class="col-sm-4 fw-bolder">CURSO</div>
      <div class="col-sm-3 fw-bolder">CALENDÁRIO</div>
      <div class="col-sm-1"></div>
    </div>

    <div class="row mt-1 bg-body-tertiary p-2 selecionado" v-for="turma in turmas">

      <div class="col-sm-2">{{ turma.codigo }}</div>
      <div class="col-sm-2">{{ turma.descricao }}</div>
      <div class="col-sm-4">{{turma.curso.descricao}}</div>
      <div class="col-sm-3">{{`${turma.calendario.descricao} - ${turma.calendario.ano}.${turma.calendario.semestre}`}}</div>

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

  </div> <!-- FIM DA DIV MAIOR -->
</template>

<style scoped>

.selecionado:hover{
  background-color: darkgray !important;
}

</style>
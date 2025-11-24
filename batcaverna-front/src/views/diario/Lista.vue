<script setup>

  import NavAdmin from "@/components/NavAdmin.vue";
  import {ref, onMounted} from "vue";
  import {apiFetch} from "@/services/http.js";
  import {getUser} from "@/services/token.js";

  const usuario = getUser()
  const diarios = ref({})

  onMounted(async () => {

    let resposta = await apiFetch('/diario/'+usuario.professor_id);
    if(resposta.ok){
      diarios.value = await resposta.json();
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
        <h4>Diários</h4>
        <span>
          <a class="btn btn-primary mx-1" href="/diario/cadastro">Novo</a>
          <a class="btn btn-secondary mx-1" href="/admin">Voltar</a>
        </span>
      </div>
    </nav>

    <div class="row my-3 p-1">
      <div class="col-sm-3 fw-bolder">DESCRIÇÃO</div>
      <div class="col-sm-3 fw-bolder">PROFESSOR</div>
      <div class="col-sm-1 fw-bolder">TURMA</div>
      <div class="col-sm-2 fw-bolder">HORÁRIO</div>
      <div class="col-sm-1 fw-bolder text-center">H/A</div>
      <div class="col-sm-1 fw-bolder text-center">MINISTRADA</div>
      <div class="col-sm-1"></div>
    </div>

    <div class="row mt-1 bg-body-tertiary p-2 selecionado" v-for="diario in diarios">

      <div class="col-sm-3">{{ diario.codigo +' - '+ diario.descricao }}</div>
      <div class="col-sm-3">{{diario.professor.nome}}</div>
      <div class="col-sm-1">{{diario.turma.descricao}}</div>
      <div class="col-sm-2">{{diario.horario}}</div>
      <div class="col-sm-1 text-center">{{diario.carga}}</div>
      <div class="col-sm-1 text-center">{{diario.ministrada}}</div>

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
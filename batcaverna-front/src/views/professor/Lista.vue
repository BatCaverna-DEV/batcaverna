<script setup>

  import {ref, onMounted} from "vue";
  import { useRouter, useRoute} from 'vue-router'
  import {apiFetch} from "@/services/http.js";
  import NavAdmin from "@/components/NavAdmin.vue";
  import {statusCalendario, statusUsuario} from "@/services/format.js";

  const router = useRouter()
  const route = useRoute()

  const professores = ref([])
  const cadastrou = ref(false)

  onMounted(async () => {
    // let resposta = await fetch('http://localhost:3000/professor', {
    //   method: 'GET',
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   }
    // })
    let resposta = await apiFetch('/professor')

    if(resposta.ok){
       professores.value = await resposta.json()
       if(route.query.sucesso){
         cadastrou.value = true
       }
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
        <h4>Professores</h4>
        <span>
          <a class="btn btn-primary mx-1" href="/professor/cadastro">Novo</a>
          <a class="btn btn-secondary mx-1" href="/admin">Voltar</a>
        </span>

      </div>
    </nav>

    <div v-if="cadastrou" class="alert alert-success alert-dismissible fade show" role="alert">
      <strong>Atenção: </strong> Professor cadastrado com sucesso!
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>

    <div class="row my-3 p-1">
      <div class="col-sm-2 fw-bolder">SIAPE</div>
      <div class="col-sm-4 fw-bolder ">NOME</div>
      <div class="col-sm-3 fw-bolder ">E-MAIL</div>
      <div class="col-sm-2 fw-bolder text-center">CATEGORIA</div>
      <div class="col-sm-1 fw-bolder text-center"></div>
    </div>

    <div class="row mt-1 bg-body-tertiary p-2 selecionado" v-for="professor in professores">
      <div class="col-sm-2">{{ professor.siape }}</div>
      <div class="col-sm-4 ">{{ professor.nome }}</div>
      <div class="col-sm-3 ">{{ professor.email }}</div>
      <div class="col-sm-2 text-center">{{ statusUsuario(professor.usuario?.categoria) }}</div>
      <div class="col-sm-1 text-center d-flex justify-content-end">
        <div class="dropdown">
          <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fa-solid fa-bars"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="#">Promover</a></li>
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
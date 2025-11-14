<script setup>
  import { RouterLink } from "vue-router";
  import {onMounted, ref} from "vue";
  import {getUser} from "@/services/token.js";

  const playload = getUser();
  const user = ref({username: playload.username, nome: playload.nome, email: playload.email});


</script>

<template>
  <div class="container-fluid p-0 m-0">
  <nav class="navbar bg-secondary p-2 navbar-expand-lg navbar-dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">
        <img src="../assets/batman.png" alt="Logo" width="30" height="24" class="d-inline-block align-text-top">
        BatCaverna
      </a>
      <div class="">
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fa-regular fa-circle-user"></i> {{user.nome.split(' ')[0]}}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="#">Meus Dados</a></li>
            <li><a class="dropdown-item" href="#">Esqueceu a senha</a></li>
            <hr class="dropdown-divider">
            <li><a class="dropdown-item" href="/logout">Sair</a></li>
          </ul>
        </div>

      </div>
    </div>
  </nav>
  </div>

</template>


<script setup>

  import {getUser} from "@/services/token.js";
  import {ref} from "vue";

  const playload = getUser()
  const user = ref({username: playload.username, email: playload.email, nome: playload.nome});

</script>

<template>
    <div class="mx-auto p-3 shadow rounded rounded-2 content">
      <img src="../assets/perfil.png" alt="" class="d-block mx-auto w-50 rounded rounded-circle">
      <h3 class="text-center mt-5" >{{user.nome}}</h3>
      <h5 class="text-center mt-2">Coordenador</h5>
    </div>
</template>

<style scoped>

</style>
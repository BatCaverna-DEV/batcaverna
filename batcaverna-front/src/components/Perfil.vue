<script setup>
  import { getUser } from "@/services/token.js";

  const playload = getUser();
  const user = { username: playload.username, email: playload.email, nome: playload.nome };
</script>

<template>
  <div class="perfil-card">
    <div class="perfil-avatar">
      <i class="fa-solid fa-user"></i>
    </div>
    <div class="perfil-nome">{{ user.nome }}</div>
    <div class="perfil-cargo">Coordenador</div>
    <div class="perfil-info">
      <div><i class="fa-solid fa-at me-2"></i>{{ user.username }}</div>
      <div><i class="fa-solid fa-envelope me-2"></i>{{ user.email }}</div>
    </div>
  </div>
</template>

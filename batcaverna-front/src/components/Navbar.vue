<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="navbar bg-dark navbar-dark px-3" style="min-height:52px">
    <div class="d-flex align-items-center gap-2">
      <img src="../assets/batman.png" alt="Logo" width="28" height="22">
      <span class="fw-bold text-white" style="letter-spacing:.06em;font-size:.95rem">BATCAVERNA</span>
    </div>
    <div class="d-flex align-items-center gap-2">
      <RouterLink class="btn btn-outline-light btn-sm" to="/demanda">
        <i class="fa-solid fa-list-check me-2"></i>Demanda
      </RouterLink>
      <RouterLink class="btn btn-outline-light btn-sm px-3" to="/login">
        <i class="fa-solid fa-right-to-bracket me-2"></i>Entrar
      </RouterLink>
    </div>
  </nav>
</template>

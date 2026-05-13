<script setup>
  import { RouterLink } from "vue-router";
  import { getUser } from "@/services/token.js";

  const playload = getUser();
  const user = { username: playload.username, nome: playload.nome, email: playload.email };
</script>

<template>
  <div>
    <nav class="navbar bg-dark navbar-dark px-3" style="min-height:52px">
      <div class="d-flex align-items-center gap-2">
        <img src="../assets/batman.png" alt="Logo" width="28" height="22">
        <span class="fw-bold text-white" style="letter-spacing:.06em;font-size:.95rem">BATCAVERNA</span>
      </div>
      <div class="dropdown">
        <button class="btn btn-dark dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="fa-regular fa-circle-user"></i>
          <span>{{ user.nome.split(' ')[0] }}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow">
          <li class="px-3 py-1">
            <div class="fw-semibold" style="font-size:.85rem">{{ user.nome }}</div>
            <div class="text-muted" style="font-size:.78rem">{{ user.email }}</div>
          </li>
          <li><hr class="dropdown-divider my-1"></li>
          <li><a class="dropdown-item" href="#"><i class="fa-solid fa-user me-2 text-secondary"></i>Meus Dados</a></li>
          <li><RouterLink class="dropdown-item" to="/usuario/senha"><i class="fa-solid fa-key me-2 text-secondary"></i>Alterar Senha</RouterLink></li>
          <li><hr class="dropdown-divider my-1"></li>
          <li><RouterLink class="dropdown-item text-danger" to="/logout"><i class="fa-solid fa-right-from-bracket me-2"></i>Sair</RouterLink></li>
        </ul>
      </div>
    </nav>

    <div class="nav-modulos">
      <RouterLink to="/admin"><i class="fa-solid fa-house"></i> Início</RouterLink>
      <RouterLink to="/professor/lista"><i class="fa-solid fa-person-chalkboard"></i> Professores</RouterLink>
      <RouterLink to="/professor/carga"><i class="fa-solid fa-chart-bar"></i> Carga Horária</RouterLink>
      <RouterLink to="/calendario/lista"><i class="fa-solid fa-calendar-days"></i> Calendários</RouterLink>
      <RouterLink to="/curso/lista"><i class="fa-solid fa-layer-group"></i> Cursos</RouterLink>
      <RouterLink to="/turma/lista"><i class="fa-solid fa-users"></i> Turmas</RouterLink>
      <RouterLink to="/diario/lista"><i class="fa-solid fa-book"></i> Diários</RouterLink>
    </div>
  </div>
</template>

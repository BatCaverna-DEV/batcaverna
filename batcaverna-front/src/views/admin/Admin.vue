<script setup>
  import Perfil from "../../components/Perfil.vue";
  import { RouterLink } from "vue-router";
  import NavAdmin from "@/components/NavAdmin.vue";
  import { getUser } from "@/services/token.js";
  import { apiFetch } from "@/services/http.js";
  import { onMounted, ref } from "vue";

  const usuario = getUser()
  const curso = ref('')

  onMounted(async () => {
    const resposta2 = await apiFetch('/curso/coordena/' + usuario.professor_id)
    if (resposta2.ok) {
      curso.value = await resposta2.json();
    }
  })

  const modulos = [
    { to: '/professor/lista',  icon: 'fa-person-chalkboard', cor: '#0d6efd', bg: '#e7f0ff', titulo: 'Professores',   descricao: 'Gerencie o corpo docente' },
    { to: '/professor/carga',  icon: 'fa-chart-bar',         cor: '#20c997', bg: '#e6fff8', titulo: 'Carga Horária', descricao: 'Distribuição semanal por professor' },
    { to: '/calendario/lista', icon: 'fa-calendar-days',     cor: '#6f42c1', bg: '#f0ebff', titulo: 'Calendários',  descricao: 'Períodos e semestres letivos' },
    { to: '/curso/lista',      icon: 'fa-layer-group',       cor: '#198754', bg: '#e6f4ee', titulo: 'Cursos',       descricao: 'Cursos e coordenações' },
    { to: '/turma/lista',      icon: 'fa-users',             cor: '#fd7e14', bg: '#fff3e6', titulo: 'Turmas',       descricao: 'Turmas por curso e semestre' },
    { to: '/diario/lista',     icon: 'fa-book',              cor: '#dc3545', bg: '#fdecea', titulo: 'Diários',      descricao: 'Registro de aulas e horários' },
  ]
</script>

<template>
  <NavAdmin/>

  <div class="container-fluid px-4">
    <div class="row">

      <div class="col-lg-2 col-md-3 d-none d-md-block">
        <Perfil/>
      </div>

      <div class="col-lg-10 col-md-9">
        <div class="mt-4 mb-2">
          <h6 class="text-muted fw-semibold" style="letter-spacing:.04em;font-size:.8rem;text-transform:uppercase">
            <i class="fa-solid fa-house me-2"></i>Dashboard
          </h6>
          <h4 class="fw-bold mb-0" style="color:#212529">
            Bem-vindo, {{ usuario.nome?.split(' ')[0] }}
          </h4>
          <p class="text-muted mb-0" style="font-size:.85rem" v-if="curso">
            Coordenador — {{ curso.descricao }}
          </p>
        </div>

        <hr class="my-3">

        <div class="row g-3">
          <div class="col-sm-6 col-lg-4" v-for="m in modulos" :key="m.to">
            <RouterLink :to="m.to" class="card-modulo">
              <div class="card shadow-sm border-0 p-3">
                <div class="icone-modulo" :style="`background:${m.bg}`">
                  <i :class="`fa-solid ${m.icon}`" :style="`color:${m.cor}`"></i>
                </div>
                <div class="card-title text-center">{{ m.titulo }}</div>
                <div class="card-text text-center">{{ m.descricao }}</div>
              </div>
            </RouterLink>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

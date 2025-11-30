<script setup>
  import Perfil from "../../components/Perfil.vue";
  import {RouterLink} from "vue-router";
  import NavAdmin from "@/components/NavAdmin.vue";
  import {getUser} from "@/services/token.js";
  import {apiFetch} from "@/services/http.js";
  import {onMounted, ref} from "vue";

  const usuario = getUser();
  const curso = ref('')

  onMounted(async () => {
    const resposta2 = await apiFetch('/curso/coordena/'+usuario.professor_id)
    if(resposta2.ok){
      curso.value = await resposta2.json();
    }
  })
</script>

<template>

  <NavAdmin/>

  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-2">
        <Perfil/>
      </div>
      <div class="col-sm-10">
        <h3>Bem Vindo ao Sistema ({{curso.descricao}})</h3>

        <nav class="navbar navbar-expand-lg bg-body-tertiary">
          <div class="container-fluid">
            <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
              <ul class="navbar-nav">

                <li class="nav-item">
                  <RouterLink to="/professor/lista" class="btn btn-sm btn-outline-dark p-2 m-1 shadow-sm">
                    <i class="fa-solid fa-person-chalkboard fa-lg"></i>
                    <span class="d-block">Professor</span>
                  </RouterLink>
                </li>

                <li class="nav-item">
                  <RouterLink to="/calendario/lista" class="btn btn-sm btn-outline-dark p-2 m-1 shadow-sm">
                    <i class="fa-solid fa-calendar-days"></i>
                    <span class="d-block">Calendario</span>
                  </RouterLink>
                </li>

                <li class="nav-item">
                  <RouterLink to="/curso/lista" class="btn btn-sm btn-outline-dark p-2 m-1 shadow-sm">
                    <i class="fa-solid fa-layer-group"></i>
                    <span class="d-block">Curso</span>
                  </RouterLink>
                </li>

                <li class="nav-item">
                  <RouterLink to="/turma/lista" class="btn btn-sm btn-outline-dark p-2 m-1 shadow-sm">
                    <i class="fa-solid fa-award"></i>
                    <span class="d-block">Turma</span>
                  </RouterLink>
                </li>

                <li class="nav-item">
                  <RouterLink to="/diario/lista" class="btn btn-sm btn-outline-dark p-2 m-1 shadow-sm">
                    <i class="fa-solid fa-book"></i>
                    <span class="d-block">Diário</span>
                  </RouterLink>
                </li>

              </ul>
            </div>
          </div>
        </nav>

      </div> <!-- DIV DA COLUNA -->
    </div>
  </div>


</template>

<style scoped>

</style>
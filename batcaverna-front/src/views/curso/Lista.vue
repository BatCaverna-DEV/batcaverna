<script setup>
  import NavAdmin from "@/components/NavAdmin.vue";
  import { ref, onMounted } from "vue";
  import { apiFetch } from "@/services/http.js";
  import { ehSupremo, getUser } from "@/services/token.js";

  const supremo = ehSupremo()
  const usuario = getUser()
  const cursos  = ref([])

  onMounted(async () => {
    // Supremo vê todos os cursos; Coordenador vê apenas o seu
    const url = supremo ? '/curso' : '/curso/coordena/' + usuario.professor_id
    let resposta = await apiFetch(url)
    if (resposta.ok) {
      const data = await resposta.json()
      // getCurso retorna um único objeto; normalizamos para array
      cursos.value = Array.isArray(data) ? data : (data ? [data] : [])
    } else {
      let msg = await resposta.json()
      alert('ERRO ' + resposta.status + ': ' + msg.message)
    }
  })
</script>

<template>
  <NavAdmin/>
  <div class="container pagina">

    <div class="pagina-header">
      <h4><i class="fa-solid fa-layer-group me-2"></i>Cursos</h4>
      <div class="d-flex gap-2">
        <RouterLink v-if="supremo" class="btn btn-dark btn-sm px-3" to="/curso/cadastro">
          <i class="fa-solid fa-plus me-1"></i>Novo
        </RouterLink>
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/admin">
          <i class="fa-solid fa-arrow-left me-1"></i>Voltar
        </RouterLink>
      </div>
    </div>

    <div class="pagina-body">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Coordenador</th>
              <th style="width:5%"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="curso in cursos" :key="curso.id">
              <td class="fw-semibold">{{ curso.descricao }}</td>
              <td>{{ curso.professor?.nome }}</td>
              <td class="text-end">
                <div v-if="supremo" class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                    <li><a class="dropdown-item" href="#"><i class="fa-solid fa-pen me-2 text-secondary"></i>Editar</a></li>
                    <li><hr class="dropdown-divider my-1"></li>
                    <li><a class="dropdown-item text-danger" href="#"><i class="fa-solid fa-trash me-2"></i>Excluir</a></li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="cursos.length === 0">
              <td colspan="3" class="text-center text-muted py-4">Nenhum curso cadastrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

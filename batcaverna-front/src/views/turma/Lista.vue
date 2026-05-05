<script setup>
  import NavAdmin from "@/components/NavAdmin.vue";
  import { ref, onMounted } from "vue";
  import { apiFetch } from "@/services/http.js";
  import { getUser } from "@/services/token.js";

  const usuario = getUser()
  const turmas  = ref([])

  onMounted(async () => {
    let resposta = await apiFetch('/turma/' + usuario.professor_id);
    if (resposta.ok) {
      turmas.value = await resposta.json();
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
      <h4><i class="fa-solid fa-users me-2"></i>Turmas</h4>
      <div class="d-flex gap-2">
        <a class="btn btn-dark btn-sm px-3" href="/turma/cadastro">
          <i class="fa-solid fa-plus me-1"></i>Nova
        </a>
        <a class="btn btn-outline-secondary btn-sm" href="/admin">
          <i class="fa-solid fa-arrow-left me-1"></i>Voltar
        </a>
      </div>
    </div>

    <div class="pagina-body">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th style="width:12%">Código</th>
              <th style="width:18%">Descrição</th>
              <th>Curso</th>
              <th style="width:22%">Calendário</th>
              <th style="width:5%"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="turma in turmas" :key="turma.id">
              <td><span class="badge bg-secondary">{{ turma.codigo }}</span></td>
              <td class="fw-semibold">{{ turma.descricao }}</td>
              <td>{{ turma.curso.descricao }}</td>
              <td class="text-muted">
                {{ turma.calendario.descricao }} —
                {{ turma.calendario.ano }}.{{ turma.calendario.semestre }}
              </td>
              <td class="text-end">
                <div class="dropdown">
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
            <tr v-if="turmas.length === 0">
              <td colspan="5" class="text-center text-muted py-4">Nenhuma turma cadastrada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

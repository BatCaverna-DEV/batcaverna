<script setup>
  import NavAdmin from "@/components/NavAdmin.vue";
  import { ref, onMounted } from "vue";
  import { apiFetch } from "@/services/http.js";
  import { getUser, ehSupremo } from "@/services/token.js";

  const supremo = ehSupremo()

  const usuario = getUser()
  const diarios = ref([])

  onMounted(async () => {
    let resposta = await apiFetch('/diario/' + usuario.professor_id);
    if (resposta.ok) {
      diarios.value = await resposta.json();
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
      <h4><i class="fa-solid fa-book me-2"></i>Diários</h4>
      <div class="d-flex gap-2">
        <RouterLink class="btn btn-dark btn-sm px-3" to="/diario/cadastro">
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
              <th style="width: 20%;">Descrição</th>
              <th style="width: 20%;">Professor</th>
              <th style="width:20%">Turma</th>
              <th style="width:17%">Horário</th>
              <th class="text-center" style="width:8%">H/A</th>
              <th class="text-center" style="width:10%">Ministrada</th>
              <th style="width:5%"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="diario in diarios" :key="diario.id">
              <td>
                <span class="badge bg-secondary me-2" style="font-family:monospace">{{ diario.codigo }}</span>
                <span class="fw-semibold">{{ diario.descricao }}</span>
              </td>
              <td>{{ diario.professor?.nome ?? '—' }}</td>
              <td>{{ diario.turma.descricao }}</td>
              <td><code class="text-dark">{{ diario.horario }}</code></td>
              <td class="text-center">{{ diario.carga }}</td>
              <td class="text-center">
                <span :class="diario.ministrada >= diario.carga ? 'text-success fw-bold' : ''">
                  {{ diario.ministrada }}
                </span>
              </td>
              <td class="text-end">
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                    <li><a class="dropdown-item" href="#"><i class="fa-solid fa-pen me-2 text-secondary"></i>Editar</a></li>
                    <li v-if="supremo"><hr class="dropdown-divider my-1"></li>
                    <li v-if="supremo"><a class="dropdown-item text-danger" href="#"><i class="fa-solid fa-trash me-2"></i>Excluir</a></li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="diarios.length === 0">
              <td colspan="7" class="text-center text-muted py-4">Nenhum diário cadastrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

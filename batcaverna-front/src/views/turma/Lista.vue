<script setup>
  import NavAdmin from "@/components/NavAdmin.vue";
  import { ref, onMounted } from "vue";
  import { apiFetch } from "@/services/http.js";
  import { getUser, ehGestor } from "@/services/token.js";

  const gestor  = ehGestor()
  const usuario = getUser()
  const turmas  = ref([])

  // --- edição ---
  const editando    = ref(null)
  const erroEdicao  = ref('')
  const cursos      = ref([])
  const calendarios = ref([])

  // --- exclusão ---
  const excluindo        = ref(null)   // turma sendo confirmada
  const excluindoLoading = ref(false)

  async function abrirEdicao(turma) {
    erroEdicao.value = ''
    editando.value = {
      id:            turma.id,
      codigo:        turma.codigo,
      descricao:     turma.descricao,
      curso_id:      turma.curso.id,
      calendario_id: turma.calendario.id,
    }

    if (cursos.value.length === 0) {
      const r = await apiFetch('/curso')
      if (r.ok) cursos.value = await r.json()
    }
    if (calendarios.value.length === 0) {
      const r = await apiFetch('/calendario')
      if (r.ok) calendarios.value = await r.json()
    }
  }

  function fecharEdicao() {
    editando.value = null
    erroEdicao.value = ''
  }

  async function salvarEdicao() {
    erroEdicao.value = ''
    const payload = {
      codigo:        editando.value.codigo,
      descricao:     editando.value.descricao,
      curso_id:      editando.value.curso_id,
      calendario_id: editando.value.calendario_id,
    }
    const r = await apiFetch('/turma/' + editando.value.id, { method: 'PUT', body: payload })
    if (r.ok) {
      const idx = turmas.value.findIndex(t => t.id === editando.value.id)
      if (idx !== -1) {
        turmas.value[idx] = {
          ...turmas.value[idx],
          codigo:     payload.codigo,
          descricao:  payload.descricao,
          curso:      cursos.value.find(c => c.id === payload.curso_id) ?? turmas.value[idx].curso,
          calendario: calendarios.value.find(c => c.id === payload.calendario_id) ?? turmas.value[idx].calendario,
        }
      }
      fecharEdicao()
    } else {
      const msg = await r.json()
      erroEdicao.value = msg.message
    }
  }

  function confirmarExclusao(turma) {
    excluindo.value = turma
  }

  function cancelarExclusao() {
    excluindo.value = null
  }

  async function excluirTurma() {
    excluindoLoading.value = true
    const r = await apiFetch('/turma/' + excluindo.value.id, { method: 'DELETE' })
    const data = await r.json()
    excluindoLoading.value = false

    if (r.ok) {
      turmas.value = turmas.value.filter(t => t.id !== excluindo.value.id)
      excluindo.value = null
    } else {
      alert('ERRO: ' + data.message)
      excluindo.value = null
    }
  }

  onMounted(async () => {
    const resposta = await apiFetch('/turma/' + usuario.professor_id)
    if (resposta.ok) {
      turmas.value = await resposta.json()
    } else {
      const msg = await resposta.json()
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
        <RouterLink v-if="gestor" class="btn btn-dark btn-sm px-3" to="/turma/cadastro">
          <i class="fa-solid fa-plus me-1"></i>Nova
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
                <div v-if="gestor" class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                    <li><a class="dropdown-item" href="#" @click.prevent="abrirEdicao(turma)"><i class="fa-solid fa-pen me-2 text-secondary"></i>Editar</a></li>
                    <li><hr class="dropdown-divider my-1"></li>
                    <li><a class="dropdown-item text-danger" href="#" @click.prevent="confirmarExclusao(turma)"><i class="fa-solid fa-trash me-2"></i>Excluir</a></li>
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

  <!-- Modal Confirmar Exclusão -->
  <Teleport to="body">
    <div v-if="excluindo" class="modal-backdrop-vue" @click.self="cancelarExclusao">
      <div class="modal-dialog m-auto" style="max-width: 460px;">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>Excluir Turma
            </h5>
            <button type="button" class="btn-close" @click="cancelarExclusao" :disabled="excluindoLoading"></button>
          </div>

          <div class="modal-body">
            <p class="mb-2">
              Você está prestes a excluir a turma:
            </p>
            <p class="fw-semibold mb-1">
              <span class="badge bg-secondary font-monospace me-2">{{ excluindo.codigo }}</span>
              {{ excluindo.descricao }}
            </p>

            <div v-if="excluindo.qtd_diarios > 0" class="alert alert-warning py-2 mt-3 mb-0">
              <i class="fa-solid fa-circle-exclamation me-2"></i>
              Esta turma possui
              <strong>{{ excluindo.qtd_diarios }} diário{{ excluindo.qtd_diarios !== 1 ? 's' : '' }}</strong>
              vinculado{{ excluindo.qtd_diarios !== 1 ? 's' : '' }}, que
              <strong>também será{{ excluindo.qtd_diarios !== 1 ? 'ão' : '' }} excluído{{ excluindo.qtd_diarios !== 1 ? 's' : '' }}</strong>.
            </div>
            <div v-else class="alert alert-secondary py-2 mt-3 mb-0">
              <i class="fa-solid fa-circle-info me-2"></i>
              Esta turma não possui diários vinculados.
            </div>

            <p class="text-muted small mt-3 mb-0">Esta ação não pode ser desfeita.</p>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="cancelarExclusao" :disabled="excluindoLoading">
              Cancelar
            </button>
            <button type="button" class="btn btn-danger px-4" @click="excluirTurma" :disabled="excluindoLoading">
              <span v-if="excluindoLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="fa-solid fa-trash me-2"></i>
              {{ excluindoLoading ? 'Excluindo…' : 'Excluir' }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </Teleport>

  <!-- Modal Editar Turma -->
  <Teleport to="body">
    <div v-if="editando" class="modal-backdrop-vue" @click.self="fecharEdicao">
      <div class="modal-dialog modal-lg m-auto">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-pen me-2"></i>Editar Turma
            </h5>
            <button type="button" class="btn-close" @click="fecharEdicao"></button>
          </div>
          <form @submit.prevent="salvarEdicao">
            <div class="modal-body">

              <div v-if="erroEdicao" class="alert alert-danger py-2 mb-3">
                <i class="fa-solid fa-circle-exclamation me-2"></i>{{ erroEdicao }}
              </div>

              <div class="row g-3">

                <div class="col-sm-5">
                  <label class="form-label">Código</label>
                  <input v-model="editando.codigo" type="text" required class="form-control font-monospace">
                </div>

                <div class="col-sm-7">
                  <label class="form-label">Descrição</label>
                  <input v-model="editando.descricao" type="text" required class="form-control">
                </div>

                <div class="col-sm-6">
                  <label class="form-label">Curso</label>
                  <select v-model="editando.curso_id" required class="form-select">
                    <option v-for="c in cursos" :key="c.id" :value="c.id">
                      {{ c.descricao }}
                    </option>
                  </select>
                </div>

                <div class="col-sm-6">
                  <label class="form-label">Calendário</label>
                  <select v-model="editando.calendario_id" required class="form-select">
                    <option v-for="c in calendarios" :key="c.id" :value="c.id">
                      {{ c.descricao }}
                    </option>
                  </select>
                </div>

              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="fecharEdicao">Cancelar</button>
              <button type="submit" class="btn btn-dark px-4">
                <i class="fa-solid fa-floppy-disk me-2"></i>Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>

</template>

<style scoped>
.modal-backdrop-vue {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  z-index: 1055;
  display: flex;
  align-items: flex-start;
  padding: 60px 16px 40px;
  overflow-y: auto;
}
.modal-backdrop-vue :deep(.modal-content) {
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, .175);
  border-radius: .5rem;
}
.modal-backdrop-vue :deep(.modal-header) {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
}
.modal-backdrop-vue :deep(.modal-body) {
  padding: 1.5rem;
}
.modal-backdrop-vue :deep(.modal-footer) {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  gap: .5rem;
}
</style>

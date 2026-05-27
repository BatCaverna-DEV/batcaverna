<script setup>
  import NavAdmin from "@/components/NavAdmin.vue";
  import { ref, onMounted, computed } from "vue";
  import { apiFetch, apiFetchFile } from "@/services/http.js";
  import { getUser, ehSupremo, ehGestor } from "@/services/token.js";

  const supremo = ehSupremo()
  const gestor  = ehGestor()
  const usuario = getUser()
  const diarios = ref([])
  const turmaSelecionada = ref('')

  // --- edição ---
  const editando    = ref(null)
  const erroEdicao  = ref('')
  const turmasEdit  = ref([])
  const professores = ref([])

  // --- importação ---
  const importandoModal  = ref(false)
  const importandoArquivo = ref(false)
  const arquivoImportar  = ref(null)
  const erroImportar     = ref('')
  const resultadoImportar = ref(null)

  function abrirImportar() {
    importandoModal.value   = true
    arquivoImportar.value   = null
    erroImportar.value      = ''
    resultadoImportar.value = null
  }

  function fecharImportar() {
    importandoModal.value   = false
    arquivoImportar.value   = null
    erroImportar.value      = ''
    resultadoImportar.value = null
  }

  function onArquivoSelecionado(e) {
    arquivoImportar.value = e.target.files[0] ?? null
    erroImportar.value    = ''
  }

  async function executarImportacao() {
    if (!arquivoImportar.value) return
    erroImportar.value      = ''
    resultadoImportar.value = null
    importandoArquivo.value = true

    const form = new FormData()
    form.append('arquivo', arquivoImportar.value)

    const r = await apiFetchFile('/diario/importar', form)
    const data = await r.json()

    if (r.ok) {
      resultadoImportar.value = data
      // Recarrega a lista para refletir novos diários
      const resposta = await apiFetch('/diario/' + usuario.professor_id)
      if (resposta.ok) diarios.value = await resposta.json()
    } else {
      erroImportar.value = data.message ?? 'Erro ao importar.'
    }
    importandoArquivo.value = false
  }

  // --- exclusão ---
  const excluindo = ref(null)

  function confirmarExclusao(diario) {
    excluindo.value = diario
  }

  function cancelarExclusao() {
    excluindo.value = null
  }

  async function excluirDiario() {
    const r = await apiFetch('/diario/' + excluindo.value.id, { method: 'DELETE' })
    if (r.ok) {
      diarios.value = diarios.value.filter(d => d.id !== excluindo.value.id)
      excluindo.value = null
    } else {
      const msg = await r.json()
      alert('ERRO: ' + msg.message)
      excluindo.value = null
    }
  }

  async function abrirEdicao(diario) {
    erroEdicao.value = ''
    editando.value = {
      id:           diario.id,
      descricao:    diario.descricao,
      carga:        diario.carga,
      turma_id:     diario.turma.id,
      professor_id: diario.professor?.id ?? '',
      ministrada:   diario.ministrada ?? 0,
      aulas_semana: diario.aulas_semana ?? '',
    }

    if (turmasEdit.value.length === 0) {
      const r = await apiFetch('/turma/' + usuario.professor_id)
      if (r.ok) turmasEdit.value = await r.json()
    }
    if (professores.value.length === 0) {
      const r = await apiFetch('/professor')
      if (r.ok) professores.value = await r.json()
    }
  }

  function fecharEdicao() {
    editando.value = null
    erroEdicao.value = ''
  }

  async function salvarEdicao() {
    erroEdicao.value = ''
    const payload = {
      descricao:    editando.value.descricao,
      carga:        editando.value.carga,
      turma_id:     editando.value.turma_id,
      professor_id: editando.value.professor_id || null,
      ministrada:   editando.value.ministrada,
      aulas_semana: editando.value.aulas_semana || null,
    }
    const r = await apiFetch('/diario/' + editando.value.id, { method: 'PUT', body: payload })
    if (r.ok) {
      const atualizado = await r.json()
      const idx = diarios.value.findIndex(d => d.id === editando.value.id)
      if (idx !== -1) {
        diarios.value[idx] = {
          ...diarios.value[idx],
          descricao:    payload.descricao,
          carga:        payload.carga,
          turma_id:     payload.turma_id,
          ministrada:   payload.ministrada,
          aulas_semana: payload.aulas_semana ?? atualizado.aulas_semana,
          professor:    professores.value.find(p => p.id === payload.professor_id) ?? null,
        }
      }
      fecharEdicao()
    } else {
      const msg = await r.json()
      erroEdicao.value = msg.message
    }
  }

  onMounted(async () => {
    const resposta = await apiFetch('/diario/' + usuario.professor_id)
    if (resposta.ok) {
      diarios.value = await resposta.json()
    } else {
      const msg = await resposta.json()
      alert('ERRO ' + resposta.status + ': ' + msg.message)
    }
  })

  const turmas = computed(() => {
    const map = new Map()
    diarios.value.forEach(d => {
      if (d.turma && !map.has(d.turma.id)) map.set(d.turma.id, d.turma)
    })
    return [...map.values()]
  })

  const diariosAgrupados = computed(() => {
    const lista = turmaSelecionada.value
      ? diarios.value.filter(d => d.turma?.id === turmaSelecionada.value)
      : diarios.value.filter(d => d.turma)

    const grupos = new Map()
    lista.forEach(d => {
      if (!grupos.has(d.turma.id)) grupos.set(d.turma.id, { turma: d.turma, itens: [] })
      grupos.get(d.turma.id).itens.push(d)
    })
    return [...grupos.values()]
  })
</script>

<template>
  <NavAdmin/>
  <div class="container pagina">

    <div class="pagina-header">
      <h4><i class="fa-solid fa-book me-2"></i>Diários</h4>
      <div class="d-flex gap-2">
        <button v-if="gestor" class="btn btn-outline-dark btn-sm px-3" @click="abrirImportar">
          <i class="fa-solid fa-file-arrow-up me-1"></i>Importar
        </button>
        <RouterLink class="btn btn-dark btn-sm px-3" to="/diario/cadastro">
          <i class="fa-solid fa-plus me-1"></i>Novo
        </RouterLink>
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/admin">
          <i class="fa-solid fa-arrow-left me-1"></i>Voltar
        </RouterLink>
      </div>
    </div>

    <div class="pagina-body">

      <div class="mb-3 d-flex align-items-center gap-2">
        <label class="form-label mb-0 fw-semibold text-nowrap">
          <i class="fa-solid fa-filter me-1"></i>Turma:
        </label>
        <select class="form-select form-select-sm w-auto" v-model="turmaSelecionada">
          <option value="">Todas</option>
          <option v-for="t in turmas" :key="t.id" :value="t.id">{{ t.descricao }}</option>
        </select>
        <span v-if="turmaSelecionada" class="text-muted small">
          {{ diariosAgrupados[0]?.itens.length ?? 0 }} diário(s)
        </span>
      </div>

      <div v-if="diariosAgrupados.length === 0" class="text-center text-muted py-4">
        Nenhum diário cadastrado.
      </div>

      <div v-for="grupo in diariosAgrupados" :key="grupo.turma.id" class="mb-4">
        <div class="d-flex align-items-center gap-2 mb-2 border-bottom pb-1">
          <span class="badge bg-dark" style="font-family:monospace">{{ grupo.turma.codigo }}</span>
          <span class="fw-semibold">{{ grupo.turma.descricao }}</span>
          <span class="badge bg-secondary rounded-pill ms-1">{{ grupo.itens.length }}</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th style="width: 35%;">Descrição</th>
                <th style="width: 30%;">Professor</th>
                <th style="width: 15%;">SEMANAL</th>
                <th class="text-center" style="width: 15%;">H/A</th>
                <th style="width: 5%;"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="diario in grupo.itens" :key="diario.id">
                <td>
                  <span class="badge bg-secondary me-2" style="font-family:monospace">{{ diario.codigo }}</span>
                  <span class="fw-semibold">{{ diario.descricao }}</span>
                </td>
                <td>{{ diario.professor?.nome ?? '—' }}</td>
                <td><code class="text-dark">{{ diario.aulas_semana }}</code></td>
                <td class="text-center">{{ diario.carga }}</td>
                <td class="text-end">
                  <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                      <li><a class="dropdown-item" href="#" @click.prevent="abrirEdicao(diario)"><i class="fa-solid fa-pen me-2 text-secondary"></i>Editar</a></li>
                      <li v-if="gestor"><hr class="dropdown-divider my-1"></li>
                      <li v-if="gestor"><a class="dropdown-item text-danger" href="#" @click.prevent="confirmarExclusao(diario)"><i class="fa-solid fa-trash me-2"></i>Excluir</a></li>
                    </ul>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>

  <!-- Modal Importar Planilha -->
  <Teleport to="body">
    <div v-if="importandoModal" class="modal-backdrop-vue" @click.self="fecharImportar">
      <div class="modal-dialog modal-md m-auto">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-file-arrow-up me-2"></i>Importar Diários
            </h5>
            <button type="button" class="btn-close" @click="fecharImportar"></button>
          </div>

          <div class="modal-body">

            <!-- Resultado da importação -->
            <template v-if="resultadoImportar">
              <div class="alert alert-success py-2 mb-3">
                <i class="fa-solid fa-circle-check me-2"></i>{{ resultadoImportar.message }}
              </div>
              <div class="mb-2 small text-muted">
                <i class="fa-solid fa-calendar-days me-1"></i>
                Calendário <strong>{{ resultadoImportar.calendario }}</strong>
                &nbsp;·&nbsp;
                <i class="fa-solid fa-graduation-cap me-1"></i>{{ resultadoImportar.curso }}
              </div>
              <table class="table table-sm mb-0">
                <tbody>
                  <tr>
                    <td><i class="fa-solid fa-users-rectangle me-2 text-success"></i>Turmas criadas</td>
                    <td class="text-end fw-bold text-success">{{ resultadoImportar.turmasCriadas }}</td>
                  </tr>
                  <tr>
                    <td><i class="fa-solid fa-users-rectangle me-2 text-muted"></i>Turmas já existentes</td>
                    <td class="text-end text-muted">{{ resultadoImportar.turmasExistentes }}</td>
                  </tr>
                  <tr>
                    <td><i class="fa-solid fa-book me-2 text-success"></i>Diários criados</td>
                    <td class="text-end fw-bold text-success">{{ resultadoImportar.diariosCriados }}</td>
                  </tr>
                  <tr>
                    <td><i class="fa-solid fa-book me-2 text-muted"></i>Diários já existentes</td>
                    <td class="text-end text-muted">{{ resultadoImportar.diariosExistentes }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="resultadoImportar.erros?.length" class="mt-3">
                <p class="small text-warning fw-semibold mb-1">
                  <i class="fa-solid fa-triangle-exclamation me-1"></i>Linhas ignoradas:
                </p>
                <ul class="small text-muted mb-0 ps-3">
                  <li v-for="(e, i) in resultadoImportar.erros" :key="i">{{ e }}</li>
                </ul>
              </div>
            </template>

            <!-- Formulário de upload -->
            <template v-else>
              <p class="text-muted small mb-3">
                Selecione uma planilha <strong>.xls</strong> ou <strong>.xlsx</strong> com as colunas:
                <strong>TURMA</strong>, <strong>COMPONENTE CURRICULAR</strong>, <strong>ANO LETIVO</strong>,
                <strong>PERIODO LETIVO</strong> e <strong>HORARIO AULAS</strong>.
              </p>
              <div v-if="erroImportar" class="alert alert-danger py-2 mb-3">
                <i class="fa-solid fa-circle-exclamation me-2"></i>{{ erroImportar }}
              </div>
              <div class="mb-0">
                <label class="form-label fw-semibold">Arquivo</label>
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  class="form-control"
                  @change="onArquivoSelecionado"
                  :disabled="importandoArquivo"
                />
              </div>
            </template>

          </div>

          <div class="modal-footer">
            <template v-if="resultadoImportar">
              <button type="button" class="btn btn-dark px-4" @click="fecharImportar">
                <i class="fa-solid fa-check me-1"></i>Concluir
              </button>
            </template>
            <template v-else>
              <button type="button" class="btn btn-outline-secondary" @click="fecharImportar">Cancelar</button>
              <button
                type="button"
                class="btn btn-dark px-4"
                :disabled="!arquivoImportar || importandoArquivo"
                @click="executarImportacao"
              >
                <span v-if="importandoArquivo" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i v-else class="fa-solid fa-file-arrow-up me-2"></i>
                {{ importandoArquivo ? 'Importando…' : 'Importar' }}
              </button>
            </template>
          </div>

        </div>
      </div>
    </div>
  </Teleport>

  <!-- Modal Confirmar Exclusão -->
  <Teleport to="body">
    <div v-if="excluindo" class="modal-backdrop-vue" @click.self="cancelarExclusao">
      <div class="modal-dialog m-auto" style="max-width: 440px;">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>Excluir Diário
            </h5>
            <button type="button" class="btn-close" @click="cancelarExclusao"></button>
          </div>
          <div class="modal-body">
            <p class="mb-1">Tem certeza que deseja excluir o diário:</p>
            <p class="fw-semibold mb-1">{{ excluindo.descricao }}</p>
            <p class="text-muted small mb-0">Esta ação não pode ser desfeita.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="cancelarExclusao">Cancelar</button>
            <button type="button" class="btn btn-danger px-4" @click="excluirDiario">
              <i class="fa-solid fa-trash me-2"></i>Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Modal Editar Diário (controlado por Vue, sem JS do Bootstrap) -->
  <Teleport to="body">
    <div v-if="editando" class="modal-backdrop-vue" @click.self="fecharEdicao">
      <div class="modal-dialog modal-lg m-auto">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-pen me-2"></i>Editar Diário
            </h5>
            <button type="button" class="btn-close" @click="fecharEdicao"></button>
          </div>
          <form @submit.prevent="salvarEdicao">
            <div class="modal-body">

              <div v-if="erroEdicao" class="alert alert-danger py-2 mb-3">
                <i class="fa-solid fa-circle-exclamation me-2"></i>{{ erroEdicao }}
              </div>

              <div class="row g-3">

                <div class="col-sm-8">
                  <label class="form-label">Descrição</label>
                  <input v-model="editando.descricao" type="text" required class="form-control">
                </div>

                <div class="col-sm-4">
                  <label class="form-label">Carga Horária</label>
                  <div class="input-group">
                    <input v-model.number="editando.carga" type="number" required min="1" class="form-control">
                    <span class="input-group-text text-muted">h/a</span>
                  </div>
                </div>

                <div class="col-sm-6">
                  <label class="form-label">Turma</label>
                  <select v-model="editando.turma_id" required class="form-select">
                    <option v-for="t in turmasEdit" :key="t.id" :value="t.id">
                      {{ t.codigo }} — {{ t.descricao }}
                    </option>
                  </select>
                </div>

                <div class="col-sm-6">
                  <label class="form-label">Professor</label>
                  <select v-model="editando.professor_id" class="form-select">
                    <option value="">— Sem professor —</option>
                    <option v-for="p in professores" :key="p.id" :value="p.id">
                      {{ p.nome }}
                    </option>
                  </select>
                </div>

                <div class="col-sm-4">
                  <label class="form-label">Horas Ministradas</label>
                  <div class="input-group">
                    <input v-model.number="editando.ministrada" type="number" min="0" class="form-control">
                    <span class="input-group-text text-muted">h/a</span>
                  </div>
                </div>

                <div class="col-sm-4">
                  <label class="form-label">Aulas Semanais</label>
                  <input v-model.number="editando.aulas_semana" type="number" min="0" class="form-control">
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

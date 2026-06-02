<script setup>
import Navbar from '@/components/Navbar.vue'
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '@/services/http.js'

// ── Cursos (etapa 1) ──────────────────────────────────────────────────────────
const cursos           = ref([])
const cursoSelecionado = ref(null)
const carregandoCursos = ref(true)
const erroCursos       = ref('')

// ── Turmas + diários (etapa 2) ────────────────────────────────────────────────
const turmas           = ref([])
const abaAtiva         = ref(null)
const carregandoTurmas = ref(false)

// ── Professor identificado ────────────────────────────────────────────────────
const siapeInput    = ref('')
const professor     = ref(null)
const identificando = ref(false)
const erroIdent     = ref('')

// ── Ações na tabela principal ─────────────────────────────────────────────────
const processando = ref(null)

// ── Modal "Meus Diários" ──────────────────────────────────────────────────────
const modalAberto      = ref(false)
const diariosProfessor = ref([])
const carregandoModal  = ref(false)
const processandoModal = ref(null)

/** Diários do professor agrupados por turma (para exibição no modal) */
const diariosPorTurma = computed(() => {
  const map = new Map()
  for (const d of diariosProfessor.value) {
    const key = d.turma.id
    if (!map.has(key)) map.set(key, { turma: d.turma, diarios: [] })
    map.get(key).diarios.push(d)
  }
  return [...map.values()]
})

/** Soma da carga horária total assumida */
const totalCarga = computed(() =>
  diariosProfessor.value.reduce((soma, d) => soma + (d.carga ?? 0), 0)
)

// ── Agrupamento de cursos por categoria ──────────────────────────────────────
const CATEGORIAS = { 1: 'Integrado', 2: 'Subsequente', 3: 'Superior' }

const cursosAgrupados = computed(() => {
  const map = new Map()
  for (const curso of cursos.value) {
    const cat = curso.categoria
    if (!map.has(cat)) map.set(cat, { categoria: cat, label: CATEGORIAS[cat] ?? `Categoria ${cat}`, cursos: [] })
    map.get(cat).cursos.push(curso)
  }
  return [...map.values()].sort((a, b) => a.categoria - b.categoria)
})

// ── Carrega a lista de cursos ao montar ───────────────────────────────────────
onMounted(async () => {
  const resp = await apiFetch('/painel/cursos')
  if (resp.ok) {
    cursos.value = await resp.json()
  } else {
    erroCursos.value = 'Não foi possível carregar os cursos.'
  }
  carregandoCursos.value = false
})

// ── Navegação entre cursos e turmas ──────────────────────────────────────────
async function selecionarCurso(curso) {
  cursoSelecionado.value = curso
  turmas.value = []
  abaAtiva.value = null
  carregandoTurmas.value = true
  const resp = await apiFetch(`/painel/demanda?curso_id=${curso.id}`)
  if (resp.ok) {
    turmas.value = await resp.json()
    if (turmas.value.length) abaAtiva.value = turmas.value[0].id
  }
  carregandoTurmas.value = false
}

function voltarParaCursos() {
  cursoSelecionado.value = null
  turmas.value = []
}

// ── Identificação por SIAPE ───────────────────────────────────────────────────
async function identificar() {
  erroIdent.value = ''
  const siape = siapeInput.value.trim()
  if (!siape) return
  identificando.value = true
  const resp = await apiFetch(`/painel/professor/${siape}`)
  if (resp.ok) {
    professor.value = await resp.json()
    carregarDiariosProfessor()   // pré-carrega em background para exibir o contador
  } else {
    const msg = await resp.json()
    erroIdent.value = msg.message || 'SIAPE não encontrado.'
    professor.value = null
  }
  identificando.value = false
}

function sair() {
  professor.value    = null
  siapeInput.value   = ''
  erroIdent.value    = ''
  diariosProfessor.value = []
  modalAberto.value  = false
}

// ── Modal: Meus Diários ───────────────────────────────────────────────────────
async function carregarDiariosProfessor() {
  const resp = await apiFetch(`/painel/meus-diarios/${professor.value.siape}`)
  if (resp.ok) diariosProfessor.value = await resp.json()
}

async function abrirResumo() {
  modalAberto.value = true
  carregandoModal.value = true
  await carregarDiariosProfessor()
  carregandoModal.value = false
}

function fecharModal() {
  modalAberto.value = false
}

async function liberarDoModal(diarioId) {
  processandoModal.value = diarioId

  const resp = await apiFetch('/painel/liberar', {
    method: 'POST',
    body: { siape: professor.value.siape, diario_id: diarioId },
  })

  if (resp.ok) {
    // Remove da lista do modal
    const idx = diariosProfessor.value.findIndex(d => d.id === diarioId)
    if (idx !== -1) diariosProfessor.value.splice(idx, 1)

    // Reflete na tabela principal se o diário estiver no curso atual
    for (const turma of turmas.value) {
      const dIdx = turma.diarios.findIndex(d => d.id === diarioId)
      if (dIdx !== -1) {
        turma.diarios[dIdx].professor    = null
        turma.diarios[dIdx].professor_id = null
        break
      }
    }
  } else {
    const msg = await resp.json()
    alert('Erro: ' + msg.message)
  }

  processandoModal.value = null
}

// ── Helpers de exibição ───────────────────────────────────────────────────────
function labelTurma(codigo) {
  const p = codigo.split('.')
  return `${p[1]}° Período`
}

function eDoProfessor(diario) {
  return professor.value && diario.professor?.id === professor.value.id
}

// ── Assumir/Liberar na tabela principal ───────────────────────────────────────
async function assumir(tIdx, dIdx, diarioId) {
  processando.value = diarioId
  const resp = await apiFetch('/painel/assumir', {
    method: 'POST',
    body: { siape: professor.value.siape, diario_id: diarioId },
  })
  if (resp.ok) {
    const data = await resp.json()
    turmas.value[tIdx].diarios[dIdx].professor    = data.professor
    turmas.value[tIdx].diarios[dIdx].professor_id = data.professor.id
    carregarDiariosProfessor()   // atualiza o contador e dados do modal
  } else {
    const msg = await resp.json()
    alert('Erro: ' + msg.message)
  }
  processando.value = null
}

async function liberar(tIdx, dIdx, diarioId) {
  processando.value = diarioId
  const resp = await apiFetch('/painel/liberar', {
    method: 'POST',
    body: { siape: professor.value.siape, diario_id: diarioId },
  })
  if (resp.ok) {
    turmas.value[tIdx].diarios[dIdx].professor    = null
    turmas.value[tIdx].diarios[dIdx].professor_id = null
    // Sincroniza lista do modal
    const idx = diariosProfessor.value.findIndex(d => d.id === diarioId)
    if (idx !== -1) diariosProfessor.value.splice(idx, 1)
  } else {
    const msg = await resp.json()
    alert('Erro: ' + msg.message)
  }
  processando.value = null
}
</script>

<template>
  <Navbar />

  <div class="container pagina">

    <!-- ── Cabeçalho ───────────────────────────────────────────────────────── -->
    <div class="pagina-header">
      <h4>
        <i class="fa-solid fa-list-check me-2"></i>
        <span
          class="breadcrumb-link"
          :class="{ clicavel: cursoSelecionado }"
          @click="cursoSelecionado ? voltarParaCursos() : null"
          :title="cursoSelecionado ? 'Voltar para cursos' : ''"
        >Demanda</span>
        <template v-if="cursoSelecionado">
          <i class="fa-solid fa-chevron-right mx-2 text-muted" style="font-size:.7rem"></i>
          <span class="text-muted fw-normal">{{ cursoSelecionado.descricao }}</span>
        </template>
      </h4>
      <button
        v-if="cursoSelecionado"
        class="btn btn-sm btn-outline-secondary"
        @click="voltarParaCursos"
      >
        <i class="fa-solid fa-arrow-left me-1"></i>Cursos
      </button>
    </div>

    <div class="pagina-body">

      <!-- ── Painel de identificação (oculto no modo gestor) ──────────────────── -->
      <div class="ident-card mb-4" :class="{ 'ident-card--ok': professor }">

        <!-- Não identificado -->
        <template v-if="!professor">
          <p class="mb-2 text-muted small fw-semibold">
            <i class="fa-solid fa-circle-info me-1"></i>
            Informe seu SIAPE para assumir ou liberar diários.
          </p>
          <div class="d-flex gap-2 align-items-start flex-wrap">
            <div style="min-width:180px; flex:1">
              <input
                v-model="siapeInput"
                type="text"
                class="form-control"
                :class="erroIdent ? 'is-invalid' : ''"
                placeholder="Seu SIAPE"
                @keyup.enter="identificar"
                :disabled="identificando"
                maxlength="20"
              />
              <div v-if="erroIdent" class="invalid-feedback d-block">{{ erroIdent }}</div>
            </div>
            <button
              class="btn btn-dark"
              @click="identificar"
              :disabled="identificando || !siapeInput.trim()"
            >
              <span v-if="identificando" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else class="fa-solid fa-right-to-bracket me-1"></i>
              Identificar-se
            </button>
          </div>
        </template>

        <!-- Identificado -->
        <template v-else>
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-3">
              <div class="avatar-ic">
                <i class="fa-solid fa-user-check"></i>
              </div>
              <div>
                <div class="fw-bold" style="font-size:.95rem">{{ professor.nome }}</div>
                <div class="text-muted small">SIAPE {{ professor.siape }} · {{ professor.email }}</div>
              </div>
            </div>
            <div class="d-flex gap-2">
              <!-- Botão que abre o modal de resumo -->
              <button class="btn btn-sm btn-dark" @click="abrirResumo">
                <i class="fa-solid fa-clipboard-list me-1"></i>
                Meus Diários
                <span
                  v-if="diariosProfessor.length"
                  class="badge bg-light text-dark ms-1"
                >{{ diariosProfessor.length }}</span>
              </button>
              <button class="btn btn-sm btn-outline-secondary" @click="sair">
                <i class="fa-solid fa-right-from-bracket me-1"></i>Sair
              </button>
            </div>
          </div>
        </template>

      </div>

      <!-- ════════════════════════════════════════════════════════════════════ -->
      <!-- ETAPA 1 — Seleção de Curso                                          -->
      <!-- ════════════════════════════════════════════════════════════════════ -->
      <template v-if="!cursoSelecionado">

        <div v-if="carregandoCursos" class="text-center py-5 text-muted">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          Carregando cursos…
        </div>

        <div v-else-if="erroCursos" class="alert alert-danger">
          <i class="fa-solid fa-triangle-exclamation me-2"></i>{{ erroCursos }}
        </div>

        <template v-else>
          <p class="text-muted small mb-4">
            Selecione o curso para visualizar as turmas e diários disponíveis:
          </p>

          <div v-if="!cursos.length" class="text-center text-muted py-4">
            Nenhum curso cadastrado.
          </div>

          <div v-for="grupo in cursosAgrupados" :key="grupo.categoria" class="grupo-categoria mb-5">
            <div class="grupo-categoria__header mb-3">
              <span class="grupo-categoria__label">{{ grupo.label }}</span>
              <span class="grupo-categoria__count">
                {{ grupo.cursos.length }} curso{{ grupo.cursos.length !== 1 ? 's' : '' }}
              </span>
            </div>
            <div class="row g-3">
              <div v-for="curso in grupo.cursos" :key="curso.id" class="col-12 col-sm-6 col-lg-4">
                <div class="card-curso" @click="selecionarCurso(curso)" role="button">
                  <div class="card-curso__titulo">
                    <div class="card-curso__icone">
                      <i class="fa-solid fa-graduation-cap"></i>
                    </div>
                    <div class="card-curso__nome">{{ curso.descricao }}</div>
                  </div>
                  <div class="card-curso__coord">
                    <i class="fa-solid fa-user-tie me-1"></i>
                    {{ curso.professor?.nome ?? 'Sem coordenador' }}
                  </div>
                  <div class="card-curso__rodape">
                    <div class="card-curso__stats">
                      <span><i class="fa-solid fa-users-rectangle me-1"></i>{{ curso.qtdTurmas }} turma{{ curso.qtdTurmas !== 1 ? 's' : '' }}</span>
                      <span><i class="fa-solid fa-book me-1"></i>{{ curso.qtdDiarios }} diário{{ curso.qtdDiarios !== 1 ? 's' : '' }}</span>
                    </div>
                    <div class="card-curso__acao">
                      Ver diários <i class="fa-solid fa-arrow-right ms-1"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

      </template>

      <!-- ════════════════════════════════════════════════════════════════════ -->
      <!-- ETAPA 2 — Turmas e Diários do Curso Selecionado                     -->
      <!-- ════════════════════════════════════════════════════════════════════ -->
      <template v-else>

        <div v-if="carregandoTurmas" class="text-center py-5 text-muted">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          Carregando turmas…
        </div>

        <template v-else>
          <!-- Abas por turma -->
          <ul class="nav nav-tabs">
            <li v-for="turma in turmas" :key="turma.id" class="nav-item">
              <button
                class="nav-link d-flex align-items-center gap-2"
                :class="{ active: abaAtiva === turma.id }"
                @click="abaAtiva = turma.id"
              >
                <i class="fa-solid fa-users-rectangle small"></i>
                {{ turma.descricao }}
                <span
                  class="badge rounded-pill"
                  :class="abaAtiva === turma.id ? 'bg-dark' : 'bg-secondary'"
                >{{ turma.diarios.length }}</span>
              </button>
            </li>
          </ul>

          <!-- Conteúdo de cada aba -->
          <template v-for="(turma, tIdx) in turmas" :key="turma.id">
            <div v-show="abaAtiva === turma.id" class="aba-body">

              <div class="turma-meta mb-3">
                <span class="badge bg-secondary font-mono me-2" style="font-size:.72rem">
                  {{ turma.codigo }}
                </span>
                <span class="text-muted small">{{ turma.descricao }}</span>
              </div>

              <div v-if="professor" class="legenda mb-3">
                <span><i class="fa-solid fa-circle text-success"></i> Meus diários</span>
                <span><i class="fa-solid fa-circle text-warning-custom"></i> Disponível</span>
                <span><i class="fa-solid fa-circle text-muted"></i> Outro professor</span>
              </div>

              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Componente Curricular</th>
                      <th class="text-center" style="width:5%">CH</th>
                      <th class="text-center" style="width:8%">Aulas/sem.</th>
                      <th style="width:24%">Professor</th>
                      <th v-if="professor" style="width:10%"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(diario, dIdx) in turma.diarios"
                      :key="diario.id"
                      :class="{
                        'tr-meu':   eDoProfessor(diario),
                        'tr-livre': !diario.professor,
                      }"
                    >
                      <td>
                        <span class="badge bg-secondary font-mono me-2" style="font-size:.68rem">
                          SUP.{{ String(diario.codigo).padStart(5, '0') }}
                        </span>
                        <span class="fw-semibold">{{ diario.descricao }}</span>
                      </td>
                      <td class="text-center text-muted">{{ diario.carga }}h</td>
                      <td class="text-center">
                        <code class="text-dark">{{ diario.aulas_semana ?? '—' }}</code>
                      </td>
                      <td>
                        <template v-if="diario.professor">
                          <i
                            class="fa-solid fa-circle small me-1"
                            :class="eDoProfessor(diario) ? 'text-success' : 'text-secondary'"
                          ></i>
                          <span :class="eDoProfessor(diario) ? 'fw-bold text-success' : 'text-muted'">
                            {{ diario.professor.nome }}
                          </span>
                        </template>
                        <template v-else>
                          <span class="badge-livre">
                            <i class="fa-solid fa-circle-plus me-1"></i>Disponível
                          </span>
                        </template>
                      </td>
                      <td v-if="professor" class="text-end">
                        <button
                          v-if="eDoProfessor(diario)"
                          class="btn btn-sm btn-outline-danger"
                          @click="liberar(tIdx, dIdx, diario.id)"
                          :disabled="processando === diario.id"
                        >
                          <span v-if="processando === diario.id" class="spinner-border spinner-border-sm" role="status"></span>
                          <template v-else><i class="fa-solid fa-xmark me-1"></i>Liberar</template>
                        </button>
                        <button
                          v-else
                          class="btn btn-sm"
                          :class="diario.professor ? 'btn-outline-warning' : 'btn-outline-success'"
                          @click="assumir(tIdx, dIdx, diario.id)"
                          :disabled="processando === diario.id"
                          :title="diario.professor ? 'Assumir de ' + diario.professor.nome : 'Assumir este diário'"
                        >
                          <span v-if="processando === diario.id" class="spinner-border spinner-border-sm" role="status"></span>
                          <template v-else><i class="fa-solid fa-check me-1"></i>Assumir</template>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="!turma.diarios.length">
                      <td :colspan="professor ? 5 : 4" class="text-center text-muted py-4">
                        Nenhum diário cadastrado para esta turma.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </template>

          <div v-if="!turmas.length" class="text-center text-muted py-4">
            Nenhuma turma encontrada para este curso.
          </div>
        </template>

      </template>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════════ -->
  <!-- MODAL — Meus Diários                                                      -->
  <!-- ══════════════════════════════════════════════════════════════════════════ -->
  <Transition name="fade-modal">
    <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-box">

        <!-- Cabeçalho do modal -->
        <div class="modal-box__header">
          <div>
            <h5 class="mb-0">
              <i class="fa-solid fa-clipboard-list me-2"></i>Meus Diários
            </h5>
            <div class="text-muted small mt-1">{{ professor?.nome }}</div>
          </div>
          <button class="btn btn-sm btn-outline-secondary" @click="fecharModal">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Corpo do modal -->
        <div class="modal-box__body">

          <!-- Carregando -->
          <div v-if="carregandoModal" class="text-center py-5 text-muted">
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            Carregando…
          </div>

          <!-- Sem diários -->
          <div v-else-if="!diariosProfessor.length" class="text-center py-5 text-muted">
            <i class="fa-solid fa-inbox fa-2x mb-3 d-block"></i>
            Você não está assumindo nenhum diário no momento.
          </div>

          <!-- Diários agrupados por turma -->
          <template v-else>
            <div v-for="grupo in diariosPorTurma" :key="grupo.turma.id" class="grupo-turma">

              <!-- Cabeçalho do grupo -->
              <div class="grupo-turma__header">
                <div class="d-flex align-items-center gap-2">
                  <i class="fa-solid fa-users-rectangle text-muted small"></i>
                  <span class="fw-bold">{{ grupo.turma.descricao }}</span>
                  <span class="badge bg-secondary font-mono" style="font-size:.68rem">
                    {{ grupo.turma.codigo }}
                  </span>
                </div>
                <span class="text-muted small">
                  {{ grupo.diarios.length }} diário{{ grupo.diarios.length !== 1 ? 's' : '' }}
                </span>
              </div>

              <!-- Tabela de diários da turma -->
              <table class="table table-hover mb-0">
                <tbody>
                  <tr v-for="diario in grupo.diarios" :key="diario.id">
                    <td>
                      <span class="badge bg-secondary font-mono me-2" style="font-size:.67rem">
                        SUP.{{ String(diario.codigo).padStart(5, '0') }}
                      </span>
                      <span class="fw-semibold">{{ diario.descricao }}</span>
                    </td>
                    <td class="text-center text-muted" style="width:6%">
                      {{ diario.carga }}h
                    </td>
                    <td class="text-end" style="width:10%">
                      <button
                        class="btn btn-sm btn-outline-danger"
                        @click="liberarDoModal(diario.id)"
                        :disabled="processandoModal === diario.id"
                        title="Liberar este diário"
                      >
                        <span
                          v-if="processandoModal === diario.id"
                          class="spinner-border spinner-border-sm"
                          role="status"
                        ></span>
                        <template v-else>
                          <i class="fa-solid fa-xmark me-1"></i>Liberar
                        </template>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>
          </template>

        </div>

        <!-- Rodapé com totais -->
        <div v-if="!carregandoModal" class="modal-box__footer">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <p class="text-muted small mb-0">
              <i class="fa-solid fa-circle-info me-1"></i>
              Clique em <strong>Liberar</strong> para disponibilizar um diário a outros professores.
            </p>
            <div class="d-flex gap-3 small">
              <span class="text-muted">
                <i class="fa-solid fa-book me-1"></i>
                {{ diariosProfessor.length }} diário{{ diariosProfessor.length !== 1 ? 's' : '' }}
              </span>
              <span class="fw-bold">
                <i class="fa-solid fa-clock me-1"></i>
                {{ totalCarga }}h totais
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Painel de identificação ──────────────────────────────────────────────── */
.ident-card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: .5rem;
  padding: 1rem 1.25rem;
  transition: background .25s, border-color .25s;
}
.ident-card--ok { background: #d1e7dd; border-color: #a3cfbb; }

.avatar-ic {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: #198754; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; flex-shrink: 0;
}

/* ── Breadcrumb ───────────────────────────────────────────────────────────── */
.breadcrumb-link.clicavel {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color .15s;
}
.breadcrumb-link.clicavel:hover { text-decoration-color: currentColor; }

/* ── Grupos de categoria ──────────────────────────────────────────────────── */
.grupo-categoria__header {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding-bottom: .5rem;
  border-bottom: 2px solid #212529;
}
.grupo-categoria__label {
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #212529;
}
.grupo-categoria__count {
  font-size: .72rem;
  color: #6c757d;
}

/* ── Cards de curso ───────────────────────────────────────────────────────── */
.card-curso {
  background: #fff; border: 1px solid #dee2e6; border-radius: .5rem;
  padding: .7rem .9rem; cursor: pointer; height: 100%;
  display: flex; flex-direction: column; gap: .25rem;
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s;
}
.card-curso:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0,0,0,.09);
  border-color: #adb5bd;
}
.card-curso__titulo {
  display: flex; align-items: center; gap: .55rem;
}
.card-curso__icone {
  width: 26px; height: 26px; border-radius: 50%;
  background: #212529; color: #fff; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: .65rem;
}
.card-curso__nome {
  font-weight: 700; font-size: .8rem;
  text-transform: uppercase; letter-spacing: .03em;
  color: #212529; line-height: 1.3;
}
.card-curso__coord {
  font-size: .72rem; color: #6c757d;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  padding-left: calc(26px + .55rem);
}
.card-curso__rodape {
  display: flex; align-items: center; justify-content: space-between;
  padding-left: calc(26px + .55rem); margin-top: .1rem;
}
.card-curso__stats {
  display: flex; gap: .65rem; font-size: .7rem; color: #6c757d;
}
.card-curso__acao {
  font-size: .7rem; font-weight: 600; color: #212529;
  opacity: 0; transition: opacity .15s; white-space: nowrap;
}
.card-curso:hover .card-curso__acao { opacity: 1; }

/* ── Abas ─────────────────────────────────────────────────────────────────── */
.nav-tabs .nav-link {
  color: #495057; font-size: .82rem; font-weight: 600;
  letter-spacing: .04em; padding: .5rem 1.1rem; border-bottom: none;
}
.nav-tabs .nav-link:hover:not(.active) { color: #212529; background: #f8f9fa; }
.nav-tabs .nav-link.active {
  color: #212529; background: #fff;
  border-color: #dee2e6 #dee2e6 #fff; font-weight: 700;
}

/* ── Conteúdo da aba ──────────────────────────────────────────────────────── */
.aba-body {
  border: 1px solid #dee2e6; border-top: none;
  border-radius: 0 0 .5rem .5rem;
  padding: 1rem 1.1rem; background: #fff;
}
.font-mono { font-family: monospace; }

/* ── Legenda ──────────────────────────────────────────────────────────────── */
.legenda { display: flex; gap: 1.25rem; font-size: .78rem; color: #6c757d; }
.legenda span { display: flex; align-items: center; gap: .35rem; }
.text-warning-custom { color: #d4a017; }

/* ── Linhas coloridas ─────────────────────────────────────────────────────── */
.tr-meu  td { background-color: #f0fff4 !important; }
.tr-livre td { background-color: #fffdf0 !important; }

/* ── Badge "Disponível" ───────────────────────────────────────────────────── */
.badge-livre {
  display: inline-flex; align-items: center;
  background: #ffc107; color: #212529;
  font-size: .72rem; font-weight: 600;
  padding: .2rem .55rem; border-radius: 1rem;
}

/* ── Modal overlay ────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* ── Caixa do modal ───────────────────────────────────────────────────────── */
.modal-box {
  background: #fff;
  border-radius: .6rem;
  width: 100%;
  max-width: 760px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0, 0, 0, .35);
}
.modal-box__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #dee2e6;
  flex-shrink: 0;
}
.modal-box__body {
  padding: 0;
  overflow-y: auto;
  flex: 1;
}
.modal-box__footer {
  padding: .875rem 1.25rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
  border-radius: 0 0 .6rem .6rem;
  flex-shrink: 0;
}

/* ── Grupos de turma dentro do modal ─────────────────────────────────────── */
.grupo-turma { border-bottom: 1px solid #f0f2f5; }
.grupo-turma:last-child { border-bottom: none; }

.grupo-turma__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .65rem 1.25rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  position: sticky;
  top: 0;
  z-index: 1;
}

.grupo-turma .table tbody td {
  padding: .55rem 1.25rem;
}

/* ── Transição do modal ───────────────────────────────────────────────────── */
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity .2s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
.fade-modal-enter-active .modal-box,
.fade-modal-leave-active .modal-box {
  transition: transform .2s ease;
}
.fade-modal-enter-from .modal-box {
  transform: translateY(-16px) scale(.98);
}
.fade-modal-leave-to .modal-box {
  transform: translateY(-8px) scale(.99);
}
</style>

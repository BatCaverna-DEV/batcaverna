<script setup>
import Navbar from '@/components/Navbar.vue'
import { ref, onMounted } from 'vue'
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

// ── Identificação do professor ────────────────────────────────────────────────
const siapeInput    = ref('')
const professor     = ref(null)
const identificando = ref(false)
const erroIdent     = ref('')

// ── Ações por linha ───────────────────────────────────────────────────────────
const processando = ref(null)

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

// ── Seleciona curso e carrega suas turmas ─────────────────────────────────────
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
  } else {
    const msg = await resp.json()
    erroIdent.value = msg.message || 'SIAPE não encontrado.'
    professor.value = null
  }
  identificando.value = false
}

function sair() {
  professor.value = null
  siapeInput.value = ''
  erroIdent.value = ''
}

// ── Helpers de exibição ───────────────────────────────────────────────────────
function labelTurma(codigo) {
  const p = codigo.split('.')
  return `${p[1]}° Período`
}

function eDoProfessor(diario) {
  return professor.value && diario.professor?.id === professor.value.id
}

// ── Ação: Assumir ─────────────────────────────────────────────────────────────
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
  } else {
    const msg = await resp.json()
    alert('Erro: ' + msg.message)
  }
  processando.value = null
}

// ── Ação: Liberar ─────────────────────────────────────────────────────────────
async function liberar(tIdx, dIdx, diarioId) {
  processando.value = diarioId
  const resp = await apiFetch('/painel/liberar', {
    method: 'POST',
    body: { siape: professor.value.siape, diario_id: diarioId },
  })
  if (resp.ok) {
    turmas.value[tIdx].diarios[dIdx].professor    = null
    turmas.value[tIdx].diarios[dIdx].professor_id = null
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
      <!-- Breadcrumb dinâmico -->
      <h4>
        <i class="fa-solid fa-list-check me-2"></i>
        <span
          class="breadcrumb-item-link"
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

      <!-- ── Painel de identificação (sempre visível) ───────────────────────── -->
      <div class="ident-card mb-4" :class="{ 'ident-card--ok': professor }">
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
            <button class="btn btn-sm btn-outline-secondary" @click="sair">
              <i class="fa-solid fa-right-from-bracket me-1"></i>Sair
            </button>
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
          <p class="text-muted small mb-3">
            Selecione o curso para visualizar as turmas e diários disponíveis:
          </p>

          <div class="row g-3">
            <div
              v-for="curso in cursos"
              :key="curso.id"
              class="col-12 col-sm-6 col-lg-4"
            >
              <div class="card-curso" @click="selecionarCurso(curso)" role="button">
                <div class="card-curso__icone">
                  <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <div class="card-curso__nome">{{ curso.descricao }}</div>
                <div class="card-curso__coord">
                  <i class="fa-solid fa-user-tie me-1"></i>
                  {{ curso.professor?.nome ?? 'Sem coordenador' }}
                </div>
                <div class="card-curso__stats">
                  <span>
                    <i class="fa-solid fa-users-rectangle me-1"></i>
                    {{ curso.qtdTurmas }} turma{{ curso.qtdTurmas !== 1 ? 's' : '' }}
                  </span>
                  <span>
                    <i class="fa-solid fa-book me-1"></i>
                    {{ curso.qtdDiarios }} diário{{ curso.qtdDiarios !== 1 ? 's' : '' }}
                  </span>
                </div>
                <div class="card-curso__acao">
                  Ver diários <i class="fa-solid fa-arrow-right ms-1"></i>
                </div>
              </div>
            </div>

            <div v-if="!cursos.length" class="col-12 text-center text-muted py-4">
              Nenhum curso cadastrado.
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
                {{ labelTurma(turma.codigo) }}
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

              <!-- Identificação da turma -->
              <div class="turma-meta mb-3">
                <span class="badge bg-secondary font-mono me-2" style="font-size:.72rem">
                  {{ turma.codigo }}
                </span>
                <span class="text-muted small">{{ turma.descricao }}</span>
              </div>

              <!-- Legenda de cores (apenas quando identificado) -->
              <div v-if="professor" class="legenda mb-3">
                <span><i class="fa-solid fa-circle text-success"></i> Meus diários</span>
                <span><i class="fa-solid fa-circle text-warning-custom"></i> Disponível</span>
                <span><i class="fa-solid fa-circle text-muted"></i> Outro professor</span>
              </div>

              <!-- Tabela de diários -->
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Componente Curricular</th>
                      <th style="width:15%">Horário</th>
                      <th class="text-center" style="width:5%">CH</th>
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
                      <!-- Componente -->
                      <td>
                        <span class="badge bg-secondary font-mono me-2" style="font-size:.68rem">
                          SUP.{{ String(diario.codigo).padStart(5, '0') }}
                        </span>
                        <span class="fw-semibold">{{ diario.descricao }}</span>
                      </td>

                      <!-- Horário -->
                      <td><code class="text-dark small">{{ diario.horario }}</code></td>

                      <!-- Carga horária -->
                      <td class="text-center text-muted">{{ diario.carga }}h</td>

                      <!-- Professor atual -->
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

                      <!-- Botão de ação -->
                      <td v-if="professor" class="text-end">
                        <button
                          v-if="eDoProfessor(diario)"
                          class="btn btn-sm btn-outline-danger"
                          @click="liberar(tIdx, dIdx, diario.id)"
                          :disabled="processando === diario.id"
                          title="Liberar este diário"
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
.ident-card--ok {
  background: #d1e7dd;
  border-color: #a3cfbb;
}
.avatar-ic {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #198754;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* ── Breadcrumb no header ─────────────────────────────────────────────────── */
.breadcrumb-item-link.clicavel {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color .15s;
}
.breadcrumb-item-link.clicavel:hover {
  text-decoration-color: currentColor;
}

/* ── Cards de curso ───────────────────────────────────────────────────────── */
.card-curso {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: .6rem;
  padding: 1.4rem 1.25rem 1.1rem;
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s;
  height: 100%;
}
.card-curso:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, .1);
  border-color: #adb5bd;
}
.card-curso__icone {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #212529;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-bottom: .875rem;
}
.card-curso__nome {
  font-weight: 700;
  font-size: .9rem;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: #212529;
  margin-bottom: .35rem;
  line-height: 1.35;
}
.card-curso__coord {
  font-size: .78rem;
  color: #6c757d;
  margin-bottom: .75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-curso__stats {
  display: flex;
  gap: 1rem;
  font-size: .78rem;
  color: #495057;
  margin-bottom: .75rem;
}
.card-curso__acao {
  font-size: .78rem;
  font-weight: 600;
  color: #212529;
  opacity: 0;
  transition: opacity .18s;
}
.card-curso:hover .card-curso__acao {
  opacity: 1;
}

/* ── Abas ─────────────────────────────────────────────────────────────────── */
.nav-tabs .nav-link {
  color: #495057;
  font-size: .82rem;
  font-weight: 600;
  letter-spacing: .04em;
  padding: .5rem 1.1rem;
  border-bottom: none;
  transition: color .15s;
}
.nav-tabs .nav-link:hover:not(.active) {
  color: #212529;
  background: #f8f9fa;
}
.nav-tabs .nav-link.active {
  color: #212529;
  background: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
  font-weight: 700;
}

/* ── Conteúdo da aba ──────────────────────────────────────────────────────── */
.aba-body {
  border: 1px solid #dee2e6;
  border-top: none;
  border-radius: 0 0 .5rem .5rem;
  padding: 1rem 1.1rem;
  background: #fff;
}
.font-mono { font-family: monospace; }

/* ── Legenda ──────────────────────────────────────────────────────────────── */
.legenda {
  display: flex;
  gap: 1.25rem;
  font-size: .78rem;
  color: #6c757d;
}
.legenda span { display: flex; align-items: center; gap: .35rem; }
.text-warning-custom { color: #d4a017; }

/* ── Linhas coloridas ─────────────────────────────────────────────────────── */
.tr-meu  td { background-color: #f0fff4 !important; }
.tr-livre td { background-color: #fffdf0 !important; }

/* ── Badge "Disponível" ───────────────────────────────────────────────────── */
.badge-livre {
  display: inline-flex;
  align-items: center;
  background: #ffc107;
  color: #212529;
  font-size: .72rem;
  font-weight: 600;
  padding: .2rem .55rem;
  border-radius: 1rem;
}
</style>

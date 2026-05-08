<script setup>
import Navbar from '@/components/Navbar.vue'
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/services/http.js'

// ── Estado principal ──────────────────────────────────────────────────────────
const turmas        = ref([])
const abaAtiva      = ref(null)
const carregando    = ref(true)
const erroPainel    = ref('')

// ── Identificação do professor ────────────────────────────────────────────────
const siapeInput    = ref('')
const professor     = ref(null)   // { id, nome, siape, email }
const identificando = ref(false)
const erroIdent     = ref('')

// ── Controle de ações por linha ───────────────────────────────────────────────
const processando   = ref(null)   // id do diário sendo processado

// ── Carrega todos os diários agrupados por turma ──────────────────────────────
onMounted(async () => {
  const resp = await apiFetch('/painel/demanda')
  if (resp.ok) {
    turmas.value = await resp.json()
    if (turmas.value.length) abaAtiva.value = turmas.value[0].id
  } else {
    erroPainel.value = 'Não foi possível carregar os diários.'
  }
  carregando.value = false
})

// ── Helpers de exibição ───────────────────────────────────────────────────────

/** Extrai "Xº Período" do código da turma (ex: "20261.3.ADS.CNT..." → "3° Período") */
function labelTurma(codigo) {
  const partes = codigo.split('.')
  return `${partes[1]}° Período`
}

/** Verifica se o diário pertence ao professor identificado */
function eDoProfessor(diario) {
  return professor.value && diario.professor?.id === professor.value.id
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

// ── Assumir diário ────────────────────────────────────────────────────────────
async function assumir(tIdx, dIdx, diarioId) {
  processando.value = diarioId
  const resp = await apiFetch('/painel/assumir', {
    method: 'POST',
    body: { siape: professor.value.siape, diario_id: diarioId },
  })
  if (resp.ok) {
    const data = await resp.json()
    // Atualiza o estado local sem recarregar a página
    turmas.value[tIdx].diarios[dIdx].professor    = data.professor
    turmas.value[tIdx].diarios[dIdx].professor_id = data.professor.id
  } else {
    const msg = await resp.json()
    alert('Erro: ' + msg.message)
  }
  processando.value = null
}

// ── Liberar diário ────────────────────────────────────────────────────────────
async function liberar(tIdx, dIdx, diarioId) {
  processando.value = diarioId
  const resp = await apiFetch('/painel/liberar', {
    method: 'POST',
    body: { siape: professor.value.siape, diario_id: diarioId },
  })
  if (resp.ok) {
    // Remove atribuição no estado local
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
      <h4><i class="fa-solid fa-list-check me-2"></i>Gerenciamento de Demanda</h4>
    </div>

    <div class="pagina-body">

      <!-- ── Painel de identificação ────────────────────────────────────────── -->
      <div class="ident-card mb-4" :class="{ 'ident-card--ok': professor }">

        <template v-if="!professor">
          <p class="mb-2 text-muted small fw-semibold">
            <i class="fa-solid fa-circle-info me-1"></i>
            Informe seu SIAPE para selecionar os diários que deseja assumir.
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

      <!-- ── Carregando ──────────────────────────────────────────────────────── -->
      <div v-if="carregando" class="text-center py-5 text-muted">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        Carregando diários…
      </div>

      <div v-else-if="erroPainel" class="alert alert-danger">
        <i class="fa-solid fa-triangle-exclamation me-2"></i>{{ erroPainel }}
      </div>

      <template v-else>

        <!-- ── Abas por turma ────────────────────────────────────────────────── -->
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

        <!-- ── Conteúdo de cada aba ──────────────────────────────────────────── -->
        <template v-for="(turma, tIdx) in turmas" :key="turma.id">
          <div v-show="abaAtiva === turma.id" class="aba-body">

            <!-- Info resumida da turma -->
            <div class="turma-meta">
              <span class="badge bg-secondary me-2 font-mono">{{ turma.codigo }}</span>
              <span class="text-muted small">{{ turma.descricao }}</span>
            </div>

            <!-- Legenda de cores (visível só quando identificado) -->
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
                      'tr-meu':       eDoProfessor(diario),
                      'tr-livre':     !diario.professor,
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
                    <td>
                      <code class="text-dark small">{{ diario.horario }}</code>
                    </td>

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

                    <!-- Botão de ação (só quando identificado) -->
                    <td v-if="professor" class="text-end">
                      <!-- Liberar: professor é o dono -->
                      <button
                        v-if="eDoProfessor(diario)"
                        class="btn btn-sm btn-outline-danger"
                        @click="liberar(tIdx, dIdx, diario.id)"
                        :disabled="processando === diario.id"
                        title="Liberar este diário"
                      >
                        <span
                          v-if="processando === diario.id"
                          class="spinner-border spinner-border-sm"
                          role="status"
                        ></span>
                        <template v-else>
                          <i class="fa-solid fa-xmark me-1"></i>Liberar
                        </template>
                      </button>

                      <!-- Assumir: disponível ou de outro professor -->
                      <button
                        v-else
                        class="btn btn-sm"
                        :class="diario.professor ? 'btn-outline-warning' : 'btn-outline-success'"
                        @click="assumir(tIdx, dIdx, diario.id)"
                        :disabled="processando === diario.id"
                        :title="diario.professor ? 'Assumir de ' + diario.professor.nome : 'Assumir este diário'"
                      >
                        <span
                          v-if="processando === diario.id"
                          class="spinner-border spinner-border-sm"
                          role="status"
                        ></span>
                        <template v-else>
                          <i class="fa-solid fa-check me-1"></i>Assumir
                        </template>
                      </button>
                    </td>

                  </tr>

                  <!-- Estado vazio -->
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

.turma-meta {
  margin-bottom: .75rem;
}

.font-mono {
  font-family: monospace;
}

/* ── Legenda ──────────────────────────────────────────────────────────────── */
.legenda {
  display: flex;
  gap: 1.25rem;
  font-size: .78rem;
  color: #6c757d;
}
.legenda span {
  display: flex;
  align-items: center;
  gap: .35rem;
}
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

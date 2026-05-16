<script setup>
import Navbar from '@/components/Navbar.vue'
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '@/services/http.js'

const semestres     = ref([])
const semestreAtual = ref('')
const horariosRuins = ref([])
const professores   = ref([])
const carregando    = ref(true)
const erro          = ref('')

onMounted(async () => {
  const resp = await apiFetch('/fila')
  if (resp.ok) {
    const data       = await resp.json()
    semestres.value     = data.semestres
    semestreAtual.value = data.semestreAtual
    horariosRuins.value = data.horariosRuins
    professores.value   = data.professores
  } else {
    erro.value = 'Não foi possível carregar a fila.'
  }
  carregando.value = false
})

const servindoAgora = computed(() =>
  professores.value.filter(p => p.historico[semestreAtual.value])
)

const naFila = computed(() =>
  professores.value.filter(p => !p.historico[semestreAtual.value])
)

function corUltimaVez(s) {
  if (!s) return 'bg-secondary'
  const ano = parseInt(s)
  if (ano <= 2022) return 'badge-fila-frente'
  if (ano === 2023) return 'badge-fila-medio'
  if (ano === 2024) return 'badge-fila-recente'
  if (ano === 2025) return 'badge-fila-quase'
  return 'badge-fila-servindo'
}

const iconeHorario = {
  'Segunda - 07:00': 'fa-sun',
  'Sexta - 18:00':   'fa-moon',
  'Sexta - Noite':   'fa-star',
  'Três Noites':     'fa-calendar-week',
}
</script>

<template>
  <Navbar />

  <div class="container pagina">

    <!-- Cabeçalho -->
    <div class="pagina-header">
      <h4>
        <i class="fa-solid fa-list-ol me-2"></i>Fila de Horários Ruins
      </h4>
      <span class="badge bg-secondary text-white" style="font-size:.72rem; font-weight:600; letter-spacing:.05em">
        Semestre Atual: {{ semestreAtual }}
      </span>
    </div>

    <div class="pagina-body">

      <!-- Carregando -->
      <div v-if="carregando" class="text-center py-5 text-muted">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        Carregando fila…
      </div>

      <!-- Erro -->
      <div v-else-if="erro" class="alert alert-danger">
        <i class="fa-solid fa-triangle-exclamation me-2"></i>{{ erro }}
      </div>

      <template v-else>

        <!-- Descrição + Horários Ruins -->
        <div class="info-block mb-4">
          <p class="text-muted small mb-3">
            Para garantir equidade entre os docentes, os horários abaixo são distribuídos
            em regime de rodízio semestral. A fila determina a ordem de quem ficará com
            cada situação — quem foi escalado há mais tempo tem prioridade para as próximas
            alocações.
          </p>
          <div class="d-flex flex-wrap gap-2">
            <span
              v-for="h in horariosRuins"
              :key="h"
              class="horario-ruim-badge"
            >
              <i :class="`fa-solid ${iconeHorario[h] ?? 'fa-clock'} me-1`"></i>
              {{ h }}
            </span>
          </div>
        </div>

        <!-- Servindo este semestre -->
        <div class="secao-bloco mb-4">
          <div class="secao-titulo">
            <i class="fa-solid fa-circle-dot me-2 text-danger"></i>
            Servindo este semestre
            <span class="badge bg-danger ms-2">{{ servindoAgora.length }}</span>
          </div>
          <div class="d-flex flex-wrap gap-2 mt-3">
            <div
              v-for="p in servindoAgora"
              :key="p.nome"
              class="professor-chip professor-chip--servindo"
            >
              <i class="fa-solid fa-user me-1 opacity-75"></i>
              {{ p.nome }}
            </div>
            <div v-if="!servindoAgora.length" class="text-muted small">
              Ninguém escalado para este semestre ainda.
            </div>
          </div>
        </div>

        <!-- Tabela da fila -->
        <div class="secao-bloco">
          <div class="secao-titulo">
            <i class="fa-solid fa-arrow-down-1-9 me-2"></i>
            Posição na fila
            <span class="badge bg-secondary ms-2">{{ naFila.length }}</span>
          </div>

          <div class="legenda-historico mt-3 mb-2">
            <span><i class="fa-solid fa-circle hist-sim"></i> Ficou com horário ruim</span>
            <span><i class="fa-regular fa-circle hist-nao"></i> Não ficou</span>
            <span class="ms-2 text-muted small fst-italic">Posição 1 = próximo a ser escalado</span>
          </div>

          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th style="width:4%">#</th>
                  <th>Professor</th>
                  <th
                    v-for="s in semestres"
                    :key="s"
                    class="text-center"
                    style="width:6%"
                    :class="{ 'th-atual': s === semestreAtual }"
                  >
                    {{ s }}
                  </th>
                  <th style="width:9%">Última vez</th>
                </tr>
              </thead>
              <tbody>
                <!-- Professores na fila (sem X no semestre atual) -->
                <tr
                  v-for="p in naFila"
                  :key="p.nome"
                  class="tr-fila"
                >
                  <td>
                    <span class="posicao-num">{{ p.posicao }}</span>
                  </td>
                  <td class="fw-semibold">{{ p.nome }}</td>
                  <td
                    v-for="s in semestres"
                    :key="s"
                    class="text-center"
                    :class="{ 'td-atual': s === semestreAtual }"
                  >
                    <i
                      v-if="p.historico[s]"
                      class="fa-solid fa-circle hist-sim"
                      title="Ficou com horário ruim"
                    ></i>
                    <i
                      v-else
                      class="fa-regular fa-circle hist-nao"
                      title="Não ficou"
                    ></i>
                  </td>
                  <td>
                    <span :class="['badge-ultima-vez', corUltimaVez(p.ultimaVez)]">
                      {{ p.ultimaVez ?? '—' }}
                    </span>
                  </td>
                </tr>

                <!-- Separador -->
                <tr v-if="servindoAgora.length" class="tr-separador">
                  <td :colspan="semestres.length + 3" class="py-1 px-3">
                    <span class="separador-label">
                      <i class="fa-solid fa-circle-dot me-1"></i>
                      Servindo este semestre — voltam ao final da fila
                    </span>
                  </td>
                </tr>

                <!-- Professores servindo agora (aparecem ao final com indicador especial) -->
                <tr
                  v-for="p in servindoAgora"
                  :key="p.nome"
                  class="tr-servindo"
                >
                  <td>
                    <span class="badge badge-servindo">
                      <i class="fa-solid fa-circle-dot"></i>
                    </span>
                  </td>
                  <td class="fw-semibold">{{ p.nome }}</td>
                  <td
                    v-for="s in semestres"
                    :key="s"
                    class="text-center"
                    :class="{ 'td-atual': s === semestreAtual }"
                  >
                    <i
                      v-if="p.historico[s]"
                      class="fa-solid fa-circle"
                      :class="s === semestreAtual ? 'hist-atual' : 'hist-sim'"
                      :title="s === semestreAtual ? 'Servindo agora' : 'Ficou com horário ruim'"
                    ></i>
                    <i
                      v-else
                      class="fa-regular fa-circle hist-nao"
                      title="Não ficou"
                    ></i>
                  </td>
                  <td>
                    <span :class="['badge-ultima-vez', corUltimaVez(p.ultimaVez)]">
                      {{ p.ultimaVez ?? '—' }}
                    </span>
                  </td>
                </tr>

                <tr v-if="!professores.length">
                  <td :colspan="semestres.length + 3" class="text-center text-muted py-4">
                    Nenhum professor cadastrado na fila.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<style scoped>
/* ── Info block ───────────────────────────────────────────────────────────── */
.info-block {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: .5rem;
  padding: 1rem 1.25rem;
}

.horario-ruim-badge {
  display: inline-flex;
  align-items: center;
  background: #212529;
  color: #fff;
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: .04em;
  padding: .35rem .75rem;
  border-radius: 2rem;
}

/* ── Blocos de seção ──────────────────────────────────────────────────────── */
.secao-bloco {
  border: 1px solid #dee2e6;
  border-radius: .5rem;
  padding: 1rem 1.25rem;
  background: #fff;
}

.secao-titulo {
  font-size: .82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #212529;
  display: flex;
  align-items: center;
}

/* ── Chips dos professores servindo ───────────────────────────────────────── */
.professor-chip {
  display: inline-flex;
  align-items: center;
  padding: .35rem .85rem;
  border-radius: 2rem;
  font-size: .8rem;
  font-weight: 600;
}

.professor-chip--servindo {
  background: #fff5f5;
  border: 1px solid #f5c6cb;
  color: #842029;
}

/* ── Legenda do histórico ─────────────────────────────────────────────────── */
.legenda-historico {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: .75rem;
  color: #6c757d;
  align-items: center;
}

.legenda-historico span {
  display: flex;
  align-items: center;
  gap: .3rem;
}

/* ── Ícones de histórico ──────────────────────────────────────────────────── */
.hist-sim  { color: #212529; font-size: .7rem; }
.hist-nao  { color: #dee2e6; font-size: .7rem; }
.hist-atual { color: #dc3545; font-size: .7rem; }

/* ── Coluna do semestre atual (destaque) ──────────────────────────────────── */
.th-atual {
  background: #343a40 !important;
  border-color: #343a40 !important;
  position: relative;
}

.td-atual {
  background: #f8f9fa;
}

/* ── Linhas da tabela ─────────────────────────────────────────────────────── */
.tr-fila:hover td { background-color: #f8f9fa !important; }

.tr-servindo td {
  background-color: #fff8f8 !important;
  color: #6c757d;
}
.tr-servindo:hover td { background-color: #fff0f0 !important; }

.tr-separador td {
  background: #fff3cd !important;
  padding: .3rem .75rem !important;
  border: none;
}

.separador-label {
  font-size: .72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #856404;
}

/* ── Número de posição ────────────────────────────────────────────────────── */
.posicao-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: #212529;
  color: #fff;
  border-radius: 50%;
  font-size: .7rem;
  font-weight: 700;
}

/* ── Badge de "servindo" no lugar do número ───────────────────────────────── */
.badge-servindo {
  background: #dc3545;
  color: #fff;
  font-size: .6rem;
  padding: .2rem .4rem;
  border-radius: .25rem;
}

/* ── Badges de última vez (gradiente de prioridade) ──────────────────────── */
.badge-ultima-vez {
  display: inline-block;
  padding: .25rem .6rem;
  border-radius: .9rem;
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .02em;
}

.badge-fila-frente  { background: #d1e7dd; color: #0a3622; }   /* verde  – frente da fila */
.badge-fila-medio   { background: #cfe2ff; color: #084298; }   /* azul   – 2023 */
.badge-fila-recente { background: #fff3cd; color: #664d03; }   /* amarelo – 2024 */
.badge-fila-quase   { background: #ffe5d0; color: #7a3200; }   /* laranja – 2025 */
.badge-fila-servindo { background: #f8d7da; color: #58151c; }  /* vermelho – servindo */
</style>

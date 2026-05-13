<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Modal } from 'bootstrap'
import NavAdmin from '@/components/NavAdmin.vue'
import { apiFetch } from '@/services/http.js'
import { ehSupremo } from '@/services/token.js'

const supremo = ehSupremo()

// ── Estado principal ──────────────────────────────────────────
const tipos        = ref([])
const semestres    = ref([])
const semestreId   = ref('')
const fila         = ref([])   // [{ tipo, escalas[] }]
const filaGeral    = ref([])
const carregando   = ref(false)
const erro         = ref('')

// ── Refs dos elementos modais ─────────────────────────────────
const elModalSemestre = ref(null)
const elModalEscala   = ref(null)
const elModalStatus   = ref(null)
let mSemestre = null
let mEscala   = null
let mStatus   = null

// ── Formulário: novo semestre ──────────────────────────────────
const formSemestre  = ref({ ano: new Date().getFullYear(), periodo: 1, data_inicio: '', data_fim: '' })
const errSemestre   = ref('')
const salvandoSem   = ref(false)

// ── Formulário: adicionar escala ───────────────────────────────
const tipoAlvo      = ref(null)
const formEscala    = ref({ professor_id: '', foi_voluntario: false })
const errEscala     = ref('')
const salvandoEsc   = ref(false)

// ── Formulário: editar status ──────────────────────────────────
const escalaAlvo    = ref(null)
const formStatus    = ref({ status: 'agendado', data_realizado: '', observacao: '', foi_voluntario: false })
const errStatus     = ref('')
const salvandoSta   = ref(false)

// ── Professores disponíveis para o tipo selecionado ───────────
const professoresDisponiveis = computed(() => {
    if (!tipoAlvo.value || !fila.value.length) return filaGeral.value
    const entrada = fila.value.find(t => t.tipo.id === tipoAlvo.value.id)
    if (!entrada) return filaGeral.value
    const jaEscalados = new Set(entrada.escalas.map(e => e.professor_id))
    return filaGeral.value.filter(p => !jaEscalados.has(p.professor_id))
})

const labelSemestre = (s) => `${s.ano}/${s.periodo}`

// ── Badges ────────────────────────────────────────────────────
const statusBadge = {
    agendado: 'bg-warning text-dark',
    cumprido: 'bg-success',
    trocado:  'bg-info text-dark',
    abonado:  'bg-secondary',
}
const statusLabel = {
    agendado: 'Agendado',
    cumprido: 'Cumprido',
    trocado:  'Trocado',
    abonado:  'Abonado',
}

const iconeTipo = (nome) => {
    if (nome.includes('Manhã'))  return 'fa-sun'
    if (nome.includes('Tarde'))  return 'fa-cloud-sun'
    if (nome.includes('Noite'))  return 'fa-moon'
    return 'fa-calendar-check'
}

// ── Carregar dados ────────────────────────────────────────────
const carregarTipos = async () => {
    const r = await apiFetch('/plantao/tipos')
    if (r.ok) tipos.value = await r.json()
}

const carregarSemestres = async () => {
    const r = await apiFetch('/plantao/semestres')
    if (r.ok) {
        semestres.value = await r.json()
        if (!semestreId.value && semestres.value.length) {
            const aberto = semestres.value.find(s => !s.encerrado)
            semestreId.value = aberto ? aberto.id : semestres.value[0].id
        }
    }
}

const carregarFila = async () => {
    if (!semestreId.value) return
    carregando.value = true
    const r = await apiFetch(`/plantao/fila/${semestreId.value}`)
    if (r.ok) fila.value = await r.json()
    carregando.value = false
}

const carregarFilaGeral = async () => {
    const r = await apiFetch('/plantao/fila-geral')
    if (r.ok) filaGeral.value = await r.json()
}

watch(semestreId, carregarFila)

onMounted(async () => {
    mSemestre = new Modal(elModalSemestre.value)
    mEscala   = new Modal(elModalEscala.value)
    mStatus   = new Modal(elModalStatus.value)
    await Promise.all([carregarTipos(), carregarSemestres(), carregarFilaGeral()])
    if (semestreId.value) await carregarFila()
})

// ── Modal: Novo Semestre ──────────────────────────────────────
const abrirModalSemestre = () => {
    errSemestre.value = ''
    mSemestre.show()
}

const salvarSemestre = async () => {
    const { ano, periodo } = formSemestre.value
    if (!ano || !periodo) {
        errSemestre.value = 'Preencha todos os campos.'
        return
    }
    salvandoSem.value = true
    const r = await apiFetch('/plantao/semestres', {
        method: 'POST',
        body: { ano: Number(ano), periodo: Number(periodo) },
    })
    salvandoSem.value = false
    if (r.ok) {
        const novo = await r.json()
        await carregarSemestres()
        semestreId.value = novo.id
        mSemestre.hide()
    } else {
        const d = await r.json()
        errSemestre.value = d.message || 'Erro ao salvar semestre.'
    }
}

// ── Modal: Adicionar Escala ───────────────────────────────────
const abrirModalEscala = (tipo) => {
    tipoAlvo.value = tipo
    formEscala.value = { professor_id: '', foi_voluntario: false }
    errEscala.value  = ''
    mEscala.show()
}

const salvarEscala = async () => {
    if (!formEscala.value.professor_id) {
        errEscala.value = 'Selecione um professor.'
        return
    }
    salvandoEsc.value = true
    const r = await apiFetch('/plantao/escala', {
        method: 'POST',
        body: {
            professor_id:    formEscala.value.professor_id,
            tipo_plantao_id: tipoAlvo.value.id,
            semestre_id:     semestreId.value,
            foi_voluntario:  formEscala.value.foi_voluntario,
        },
    })
    salvandoEsc.value = false
    if (r.ok) {
        await Promise.all([carregarFila(), carregarFilaGeral()])
        mEscala.hide()
    } else {
        const d = await r.json()
        errEscala.value = d.message || 'Erro ao adicionar.'
    }
}

// ── Modal: Editar Status ──────────────────────────────────────
const abrirModalStatus = (escala) => {
    escalaAlvo.value  = escala
    formStatus.value  = {
        status:         escala.status,
        data_realizado: escala.data_realizado ?? '',
        observacao:     escala.observacao ?? '',
        foi_voluntario: !!escala.foi_voluntario,
    }
    errStatus.value = ''
    mStatus.show()
}

const salvarStatus = async () => {
    salvandoSta.value = true
    const r = await apiFetch(`/plantao/escala/${escalaAlvo.value.id}`, {
        method: 'PUT',
        body: { ...formStatus.value },
    })
    salvandoSta.value = false
    if (r.ok) {
        await Promise.all([carregarFila(), carregarFilaGeral()])
        mStatus.hide()
    } else {
        const d = await r.json()
        errStatus.value = d.message || 'Erro ao atualizar.'
    }
}

const removerEscala = async (escala) => {
    if (!confirm(`Remover ${escala.nome} desta escala?`)) return
    const r = await apiFetch(`/plantao/escala/${escala.id}`, { method: 'DELETE' })
    if (r.ok) await carregarFila()
}

const contarStatus = (escalas, s) => escalas.filter(e => e.status === s).length
</script>

<template>
  <NavAdmin/>

  <div class="container-fluid px-4">

    <!-- ── Cabeçalho ─────────────────────────────────────────── -->
    <div class="pagina mt-3 mb-3">
      <div class="pagina-header">
        <h4><i class="fa-solid fa-clipboard-list me-2"></i>Fila de Plantões</h4>
        <div class="d-flex align-items-center gap-2">
          <select v-model="semestreId" class="form-select form-select-sm" style="width:auto">
            <option value="" disabled>Selecione o semestre</option>
            <option v-for="s in semestres" :key="s.id" :value="s.id">
              {{ labelSemestre(s) }}
            </option>
          </select>
          <button v-if="supremo" class="btn btn-sm btn-dark" @click="abrirModalSemestre">
            <i class="fa-solid fa-plus me-1"></i>Novo Semestre
          </button>
        </div>
      </div>

      <!-- ── Cards dos tipos ──────────────────────────────────── -->
      <div class="pagina-body">
        <div v-if="!semestreId" class="text-center text-muted py-5">
          <i class="fa-regular fa-calendar fa-2x mb-2 d-block"></i>
          Selecione ou crie um semestre para gerenciar a fila.
        </div>

        <div v-else-if="carregando" class="text-center py-5">
          <div class="spinner-border text-secondary" role="status"></div>
        </div>

        <div v-else class="row g-3">
          <div class="col-lg-4 col-md-6" v-for="entrada in fila" :key="entrada.tipo.id">
            <div class="card border-0 shadow-sm h-100">

              <!-- Card header -->
              <div class="card-header d-flex align-items-center justify-content-between bg-dark text-white py-2">
                <span class="fw-bold" style="font-size:.85rem;letter-spacing:.04em;text-transform:uppercase">
                  <i :class="`fa-solid ${iconeTipo(entrada.tipo.nome)} me-2`"></i>
                  {{ entrada.tipo.nome }}
                </span>
                <button v-if="supremo" class="btn btn-sm btn-outline-light py-0 px-2"
                        @click="abrirModalEscala(entrada.tipo)">
                  <i class="fa-solid fa-plus me-1"></i>Add
                </button>
              </div>

              <!-- Resumo -->
              <div class="px-3 pt-2 pb-1 d-flex gap-2" style="font-size:.75rem">
                <span class="badge bg-warning text-dark">{{ contarStatus(entrada.escalas,'agendado') }} agend.</span>
                <span class="badge bg-success">{{ contarStatus(entrada.escalas,'cumprido') }} cumpr.</span>
                <span class="badge bg-info text-dark">{{ contarStatus(entrada.escalas,'trocado') }} troc.</span>
                <span class="badge bg-secondary">{{ contarStatus(entrada.escalas,'abonado') }} abon.</span>
              </div>

              <!-- Tabela de escalas -->
              <div class="card-body p-0">
                <div v-if="!entrada.escalas.length" class="text-center text-muted py-4" style="font-size:.83rem">
                  Nenhum professor escalado.
                </div>
                <table v-else class="table table-hover mb-0" style="font-size:.83rem">
                  <thead>
                    <tr>
                      <th>Professor</th>
                      <th class="text-center">Vol.</th>
                      <th>Status</th>
                      <th v-if="supremo"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="e in entrada.escalas" :key="e.id">
                      <td>
                        <div class="fw-semibold">{{ e.nome }}</div>
                        <div class="text-muted" style="font-size:.75rem">{{ e.siape }}</div>
                        <div v-if="e.data_realizado" class="text-muted" style="font-size:.72rem">
                          {{ new Date(e.data_realizado + 'T00:00:00').toLocaleDateString('pt-BR') }}
                        </div>
                      </td>
                      <td class="text-center">
                        <i v-if="e.foi_voluntario" class="fa-solid fa-star text-warning" title="Voluntário"></i>
                        <span v-else class="text-muted">—</span>
                      </td>
                      <td>
                        <span class="badge" :class="statusBadge[e.status]">{{ statusLabel[e.status] }}</span>
                        <div v-if="e.observacao" class="text-muted mt-1" style="font-size:.72rem;max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" :title="e.observacao">
                          {{ e.observacao }}
                        </div>
                      </td>
                      <td v-if="supremo" class="text-end">
                        <button class="btn btn-sm btn-outline-secondary me-1 py-0"
                                @click="abrirModalStatus(e)" title="Editar status">
                          <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger py-0"
                                @click="removerEscala(e)" title="Remover">
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Fila Geral ─────────────────────────────────────────── -->
    <div class="pagina mb-4">
      <div class="pagina-header">
        <h4><i class="fa-solid fa-list-ol me-2"></i>Ordem da Fila Geral</h4>
        <span class="text-muted" style="font-size:.78rem">Menos plantões = próximo na fila</span>
      </div>
      <div class="pagina-body p-0">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th style="width:48px">#</th>
              <th>Professor</th>
              <th>SIAPE</th>
              <th class="text-center">Plantões</th>
              <th class="text-center">Créditos Vol.</th>
              <th>Último Semestre</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filaGeral.length">
              <td colspan="6" class="text-center text-muted py-4">Nenhum professor na fila.</td>
            </tr>
            <tr v-for="(p, idx) in filaGeral" :key="p.professor_id">
              <td>
                <span v-if="idx === 0" class="badge bg-warning text-dark">1º</span>
                <span v-else-if="idx === 1" class="badge bg-secondary">2º</span>
                <span v-else-if="idx === 2" class="badge bg-secondary" style="background:#cd7f32!important">3º</span>
                <span v-else class="text-muted">{{ idx + 1 }}º</span>
              </td>
              <td class="fw-semibold">{{ p.nome }}</td>
              <td class="text-muted">{{ p.siape }}</td>
              <td class="text-center">
                <span class="badge" :class="p.total_plantoes === 0 ? 'bg-warning text-dark' : 'bg-light text-dark border'">
                  {{ p.total_plantoes }}
                </span>
              </td>
              <td class="text-center">
                <span v-if="p.creditos_voluntariado > 0" class="badge bg-warning text-dark">
                  <i class="fa-solid fa-star me-1"></i>{{ p.creditos_voluntariado }}
                </span>
                <span v-else class="text-muted">—</span>
              </td>
              <td class="text-muted">{{ p.ultimo_semestre ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <!-- ════════════════════════════════════════════════════════ -->
  <!-- Modal: Novo Semestre                                      -->
  <!-- ════════════════════════════════════════════════════════ -->
  <div class="modal fade" ref="elModalSemestre" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-dark text-white">
          <h5 class="modal-title"><i class="fa-solid fa-calendar-plus me-2"></i>Novo Semestre</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="errSemestre" class="alert alert-danger py-2">{{ errSemestre }}</div>
          <div class="row g-3">
            <div class="col-6">
              <label class="form-label">Ano</label>
              <input v-model="formSemestre.ano" type="number" class="form-control" placeholder="2025">
            </div>
            <div class="col-6">
              <label class="form-label">Período</label>
              <select v-model="formSemestre.periodo" class="form-select">
                <option :value="1">1º Semestre</option>
                <option :value="2">2º Semestre</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button class="btn btn-dark" @click="salvarSemestre" :disabled="salvandoSem">
            <span v-if="salvandoSem" class="spinner-border spinner-border-sm me-1"></span>
            Criar Semestre
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ════════════════════════════════════════════════════════ -->
  <!-- Modal: Adicionar Professor à Escala                       -->
  <!-- ════════════════════════════════════════════════════════ -->
  <div class="modal fade" ref="elModalEscala" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-dark text-white">
          <h5 class="modal-title">
            <i class="fa-solid fa-person-chalkboard me-2"></i>
            Adicionar — {{ tipoAlvo?.nome }}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="errEscala" class="alert alert-danger py-2">{{ errEscala }}</div>

          <label class="form-label">Professor</label>
          <select v-model="formEscala.professor_id" class="form-select mb-3">
            <option value="" disabled>Selecione (ordem da fila)</option>
            <option v-for="(p, idx) in professoresDisponiveis" :key="p.professor_id" :value="p.professor_id">
              {{ idx + 1 }}º — {{ p.nome }} ({{ p.total_plantoes }} plantão{{ p.total_plantoes !== 1 ? 'es' : '' }})
            </option>
          </select>

          <div class="form-check">
            <input v-model="formEscala.foi_voluntario" class="form-check-input" type="checkbox" id="chkVol">
            <label class="form-check-label" for="chkVol">
              <i class="fa-solid fa-star text-warning me-1"></i>Voluntário (gera crédito)
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button class="btn btn-dark" @click="salvarEscala" :disabled="salvandoEsc">
            <span v-if="salvandoEsc" class="spinner-border spinner-border-sm me-1"></span>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ════════════════════════════════════════════════════════ -->
  <!-- Modal: Editar Status da Escala                            -->
  <!-- ════════════════════════════════════════════════════════ -->
  <div class="modal fade" ref="elModalStatus" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-dark text-white">
          <h5 class="modal-title">
            <i class="fa-solid fa-pen me-2"></i>
            Editar — {{ escalaAlvo?.nome }}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="errStatus" class="alert alert-danger py-2">{{ errStatus }}</div>
          <div class="row g-3">
            <div class="col-6">
              <label class="form-label">Status</label>
              <select v-model="formStatus.status" class="form-select">
                <option value="agendado">Agendado</option>
                <option value="cumprido">Cumprido</option>
                <option value="trocado">Trocado</option>
                <option value="abonado">Abonado</option>
              </select>
            </div>
            <div class="col-6">
              <label class="form-label">Data realizado</label>
              <input v-model="formStatus.data_realizado" type="date" class="form-control">
            </div>
            <div class="col-12">
              <label class="form-label">Observação</label>
              <textarea v-model="formStatus.observacao" class="form-control" rows="2" placeholder="Opcional"></textarea>
            </div>
            <div class="col-12">
              <div class="form-check">
                <input v-model="formStatus.foi_voluntario" class="form-check-input" type="checkbox" id="chkVolEdit">
                <label class="form-check-label" for="chkVolEdit">
                  <i class="fa-solid fa-star text-warning me-1"></i>Foi voluntário
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button class="btn btn-dark" @click="salvarStatus" :disabled="salvandoSta">
            <span v-if="salvandoSta" class="spinner-border spinner-border-sm me-1"></span>
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '@/services/http.js'
import NavAdmin from '@/components/NavAdmin.vue'

const professores  = ref([])
const carregando   = ref(true)
const expandidos   = ref(new Set())

onMounted(async () => {
    const res = await apiFetch('/professor/carga')
    if (res.ok) {
        professores.value = await res.json()
    } else {
        const msg = await res.json()
        alert('ERRO ' + res.status + ': ' + msg.message)
    }
    carregando.value = false
})

const maxAulas = computed(() =>
    Math.max(1, ...professores.value.map(p => p.aulas_semana))
)

const totalAulas   = computed(() => professores.value.reduce((s, p) => s + p.aulas_semana, 0))
const totalDiarios = computed(() => professores.value.reduce((s, p) => s + p.qtd_diarios, 0))
const comDiarios   = computed(() => professores.value.filter(p => p.qtd_diarios > 0).length)

function toggleExpand(id) {
    if (expandidos.value.has(id)) expandidos.value.delete(id)
    else expandidos.value.add(id)
}

function corCarga(aulas) {
    if (aulas === 0)  return 'text-muted'
    if (aulas <= 4)   return 'text-success'
    if (aulas <= 8)   return 'text-primary'
    if (aulas <= 12)  return 'text-warning'
    return 'text-danger'
}

function corBarra(aulas) {
    if (aulas === 0)  return 'bg-secondary'
    if (aulas <= 4)   return 'bg-success'
    if (aulas <= 8)   return 'bg-primary'
    if (aulas <= 12)  return 'bg-warning'
    return 'bg-danger'
}
</script>

<template>
    <NavAdmin/>
    <div class="container pagina">

        <div class="pagina-header">
            <h4><i class="fa-solid fa-chart-bar me-2"></i>Carga Horária Semanal</h4>
            <a class="btn btn-outline-secondary btn-sm" href="/admin">
                <i class="fa-solid fa-arrow-left me-1"></i>Voltar
            </a>
        </div>

        <div class="pagina-body">

            <!-- Cards de resumo -->
            <div class="row g-3 mb-4">
                <div class="col-sm-4">
                    <div class="card border-0 shadow-sm text-center p-3">
                        <div class="fs-2 fw-bold text-primary">{{ comDiarios }}</div>
                        <div class="text-muted small">Professores com diários</div>
                    </div>
                </div>
                <div class="col-sm-4">
                    <div class="card border-0 shadow-sm text-center p-3">
                        <div class="fs-2 fw-bold text-success">{{ totalDiarios }}</div>
                        <div class="text-muted small">Total de diários ativos</div>
                    </div>
                </div>
                <div class="col-sm-4">
                    <div class="card border-0 shadow-sm text-center p-3">
                        <div class="fs-2 fw-bold text-warning">{{ totalAulas }}</div>
                        <div class="text-muted small">Total de aulas/semana</div>
                    </div>
                </div>
            </div>

            <!-- Indicador de carregamento -->
            <div v-if="carregando" class="text-center py-5 text-muted">
                <i class="fa-solid fa-spinner fa-spin fa-lg me-2"></i>Carregando...
            </div>

            <!-- Tabela -->
            <div v-else class="table-responsive">
                <table class="table table-hover mb-0 align-middle">
                    <thead>
                        <tr>
                            <th style="width:2%"></th>
                            <th style="width:35%">Professor</th>
                            <th style="width:12%">SIAPE</th>
                            <th class="text-center" style="width:10%">Diários</th>
                            <th class="text-center" style="width:10%">Aulas/sem.</th>
                            <th style="width:31%">Distribuição</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="p in professores" :key="p.id">

                            <!-- Linha principal -->
                            <tr
                                :class="p.qtd_diarios > 0 ? 'cursor-pointer' : ''"
                                @click="p.qtd_diarios > 0 && toggleExpand(p.id)"
                            >
                                <td class="text-muted text-center pe-0" style="font-size:.8rem">
                                    <i v-if="p.qtd_diarios > 0"
                                       :class="expandidos.has(p.id)
                                           ? 'fa-solid fa-chevron-down'
                                           : 'fa-solid fa-chevron-right'">
                                    </i>
                                </td>
                                <td class="fw-semibold">{{ p.nome }}</td>
                                <td class="text-muted" style="font-family:monospace;font-size:.9rem">
                                    {{ p.siape }}
                                </td>
                                <td class="text-center">
                                    <span v-if="p.qtd_diarios > 0"
                                          class="badge rounded-pill bg-secondary bg-opacity-25 text-dark"
                                          style="font-size:.8rem">
                                        {{ p.qtd_diarios }}
                                    </span>
                                    <span v-else class="text-muted small">—</span>
                                </td>
                                <td class="text-center">
                                    <span class="fw-bold" :class="corCarga(p.aulas_semana)"
                                          style="font-size:1rem">
                                        {{ p.aulas_semana > 0 ? p.aulas_semana : '—' }}
                                    </span>
                                </td>
                                <td>
                                    <div v-if="p.aulas_semana > 0" class="d-flex align-items-center gap-2">
                                        <div class="flex-grow-1" style="height:8px;background:#e9ecef;border-radius:4px;overflow:hidden">
                                            <div
                                                :class="corBarra(p.aulas_semana)"
                                                :style="`width:${Math.round(p.aulas_semana / maxAulas * 100)}%;height:100%;border-radius:4px;transition:width .4s`">
                                            </div>
                                        </div>
                                        <small class="text-muted" style="min-width:28px">
                                            {{ Math.round(p.aulas_semana / maxAulas * 100) }}%
                                        </small>
                                    </div>
                                </td>
                            </tr>

                            <!-- Linhas de detalhe (expansível) -->
                            <tr v-if="expandidos.has(p.id)" v-for="d in p.diarios" :key="d.id"
                                class="table-light" style="font-size:.85rem">
                                <td></td>
                                <td class="ps-4 text-muted">
                                    <i class="fa-solid fa-book me-2 opacity-50"></i>
                                    <span class="badge bg-secondary me-1" style="font-family:monospace;font-size:.72rem">
                                        {{ d.codigo }}
                                    </span>
                                    {{ d.descricao }}
                                </td>
                                <td class="text-muted small">{{ d.turma?.codigo }}</td>
                                <td></td>
                                <td class="text-center fw-semibold" :class="corCarga(d.aulas_semana)">
                                    {{ d.aulas_semana ?? '—' }}
                                </td>
                                <td>
                                    <code class="text-secondary" style="font-size:.8rem">{{ d.horario }}</code>
                                </td>
                            </tr>

                        </template>

                        <tr v-if="!carregando && professores.length === 0">
                            <td colspan="6" class="text-center text-muted py-4">
                                Nenhum professor encontrado.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</template>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>

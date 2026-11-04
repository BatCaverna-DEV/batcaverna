<script setup>
  import NavAdmin from "@/components/NavAdmin.vue";
  import { ref, computed, onMounted } from "vue";
  import { apiFetch } from "@/services/http.js";
  import { ehSupremo } from "@/services/token.js";
  import {
    PLANO_ETAPAS, PLANO_MIN, PLANO_MAX,
    planoNormalizado, statusPlano,
    classStatusPlano, iconePlano,
  } from "@/services/format.js";

  const supremo = ehSupremo()

  const diarios    = ref([])
  const carregando = ref(true)
  const erro       = ref('')
  const salvando   = ref(null)   // id do diário em gravação

  // --- filtros ---
  const turmaSelecionada = ref('')
  const etapaSelecionada = ref('')
  const busca            = ref('')

  const etapas = PLANO_ETAPAS

  /* ── Carregamento ─────────────────────────────────────────────────────── */

  onMounted(async () => {
    const r = await apiFetch('/plano')
    carregando.value = false

    if (r.ok) {
      const dados = await r.json()
      diarios.value = dados.diarios
    } else {
      const msg = await r.json().catch(() => ({}))
      erro.value = msg.message ?? `Não foi possível carregar os planos (erro ${r.status}).`
    }
  })

  /* ── Filtros ──────────────────────────────────────────────────────────── */

  const turmas = computed(() => {
    const map = new Map()
    diarios.value.forEach(d => {
      if (d.turma && !map.has(d.turma.id)) map.set(d.turma.id, d.turma)
    })
    return [...map.values()]
  })

  /** Filtro por turma e busca — base para os contadores. */
  const base = computed(() => {
    const termo = busca.value.trim().toLowerCase()
    return diarios.value.filter(d => {
      if (turmaSelecionada.value && d.turma?.id !== turmaSelecionada.value) return false
      if (!termo) return true
      return (d.descricao ?? '').toLowerCase().includes(termo)
          || (d.professor?.nome ?? '').toLowerCase().includes(termo)
          || (d.turma?.codigo ?? '').toLowerCase().includes(termo)
    })
  })

  /** Lista exibida — base + filtro de etapa. */
  const lista = computed(() => {
    if (!etapaSelecionada.value) return base.value
    return base.value.filter(d => planoNormalizado(d.plano) === etapaSelecionada.value)
  })

  const contagens = computed(() => {
    const c = Object.fromEntries(etapas.map(e => [e.valor, 0]))
    base.value.forEach(d => { c[planoNormalizado(d.plano)]++ })
    return c
  })

  const concluidos = computed(() => contagens.value[PLANO_MAX] ?? 0)

  const percentual = computed(() => {
    if (!base.value.length) return 0
    return Math.round((concluidos.value / base.value.length) * 100)
  })

  function alternarEtapa(valor) {
    etapaSelecionada.value = etapaSelecionada.value === valor ? '' : valor
  }

  function limparFiltros() {
    turmaSelecionada.value = ''
    etapaSelecionada.value = ''
    busca.value = ''
  }

  const temFiltro = computed(() =>
    !!turmaSelecionada.value || !!etapaSelecionada.value || !!busca.value.trim()
  )

  /* ── Alteração de etapa ───────────────────────────────────────────────── */

  async function gravar(diario, novaEtapa) {
    if (novaEtapa < PLANO_MIN || novaEtapa > PLANO_MAX) return
    if (novaEtapa === planoNormalizado(diario.plano)) return

    erro.value = ''
    salvando.value = diario.id

    const r = await apiFetch('/plano/' + diario.id, {
      method: 'PUT',
      body: { plano: novaEtapa },
    })

    salvando.value = null

    if (r.ok) {
      const idx = diarios.value.findIndex(d => d.id === diario.id)
      if (idx !== -1) diarios.value[idx] = { ...diarios.value[idx], plano: novaEtapa }
    } else {
      const msg = await r.json().catch(() => ({}))
      erro.value = msg.message ?? `Não foi possível alterar a etapa (erro ${r.status}).`
    }
  }

  const mover   = (diario, delta) => gravar(diario, planoNormalizado(diario.plano) + delta)
  const definir = (diario, valor) => gravar(diario, Number(valor))

  const podeAvancar    = (diario) => planoNormalizado(diario.plano) < PLANO_MAX
  const podeRetroceder = (diario) => planoNormalizado(diario.plano) > PLANO_MIN

  const proximaEtapa = (diario) =>
    podeAvancar(diario) ? statusPlano(planoNormalizado(diario.plano) + 1) : 'Fluxo concluído'

  const etapaAnterior = (diario) =>
    podeRetroceder(diario) ? statusPlano(planoNormalizado(diario.plano) - 1) : 'Já está na primeira etapa'
</script>

<template>
  <NavAdmin/>
  <div class="container pagina">

    <div class="pagina-header">
      <h4><i class="fa-solid fa-clipboard-check me-2"></i>Planos de Ensino</h4>
      <div class="d-flex gap-2">
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/admin">
          <i class="fa-solid fa-arrow-left me-1"></i>Voltar
        </RouterLink>
      </div>
    </div>

    <div class="pagina-body">

      <div v-if="erro" class="alert alert-danger alert-dismissible py-2 mb-3" role="alert">
        <i class="fa-solid fa-circle-exclamation me-2"></i>{{ erro }}
        <button type="button" class="btn-close" @click="erro = ''"></button>
      </div>

      <div v-if="carregando" class="text-center text-muted py-5">
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>Carregando planos…
      </div>

      <template v-else>

        <!-- ── Progresso geral ───────────────────────────────────────────── -->
        <div class="d-flex align-items-center gap-3 mb-2">
          <span class="fw-semibold text-nowrap" style="font-size:.85rem">
            {{ concluidos }} de {{ base.length }} inseridos no diário
          </span>
          <div class="progress flex-grow-1" style="height:8px">
            <div
              class="progress-bar bg-success"
              role="progressbar"
              :style="{ width: percentual + '%' }"
              :aria-valuenow="percentual"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <span class="text-muted text-nowrap" style="font-size:.85rem">{{ percentual }}%</span>
        </div>

        <!-- ── Contadores por etapa (clicáveis) ──────────────────────────── -->
        <div class="plano-resumo mb-3">
          <button
            v-for="e in etapas"
            :key="e.valor"
            type="button"
            class="plano-chip"
            :class="{ ativo: etapaSelecionada === e.valor }"
            @click="alternarEtapa(e.valor)"
            :title="'Filtrar por: ' + e.rotulo"
          >
            <div class="chip-valor">{{ contagens[e.valor] }}</div>
            <div class="chip-rotulo">
              <i class="fa-solid" :class="e.icone"></i>
              {{ e.curto }}
            </div>
            <div class="chip-barra" :class="'badge-' + e.cor"></div>
          </button>
        </div>

        <!-- ── Filtros ───────────────────────────────────────────────────── -->
        <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
          <label class="form-label mb-0 fw-semibold text-nowrap">
            <i class="fa-solid fa-filter me-1"></i>Turma:
          </label>
          <select class="form-select form-select-sm w-auto" v-model="turmaSelecionada">
            <option value="">Todas</option>
            <option v-for="t in turmas" :key="t.id" :value="t.id">
              {{ t.codigo }} — {{ t.descricao }}
            </option>
          </select>

          <div class="input-group input-group-sm" style="max-width:280px">
            <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
            <input
              type="search"
              class="form-control"
              placeholder="Disciplina ou professor…"
              v-model="busca"
            >
          </div>

          <button
            v-if="temFiltro"
            class="btn btn-sm btn-outline-secondary"
            @click="limparFiltros"
          >
            <i class="fa-solid fa-xmark me-1"></i>Limpar
          </button>

          <span class="text-muted small ms-auto">
            {{ lista.length }} diário(s)
          </span>
        </div>

        <!-- ── Tabela ────────────────────────────────────────────────────── -->
        <div v-if="lista.length === 0" class="text-center text-muted py-4">
          <i class="fa-regular fa-folder-open me-2"></i>
          Nenhum diário encontrado com os filtros atuais.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th style="width:10%">Turma</th>
                <th style="width:27%">Disciplina</th>
                <th style="width:20%">Professor</th>
                <th style="width:26%">Etapa do plano</th>
                <th class="text-end" style="width:17%">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="diario in lista" :key="diario.id">
                <td>
                  <span class="badge bg-dark" style="font-family:monospace">
                    {{ diario.turma?.codigo }}
                  </span>
                </td>

                <td class="fw-semibold">{{ diario.descricao }}</td>

                <td>
                  <span v-if="diario.professor">{{ diario.professor.nome }}</span>
                  <span v-else class="plano-sem-professor">sem professor</span>
                </td>

                <td>
                  <span class="badge" :class="classStatusPlano(diario.plano)">
                    <i class="fa-solid me-1" :class="iconePlano(diario.plano)"></i>
                    {{ statusPlano(diario.plano) }}
                  </span>
                  <span class="plano-trilha ms-2" :title="'Etapa ' + planoNormalizado(diario.plano) + ' de 6'">
                    <span
                      v-for="e in etapas"
                      :key="e.valor"
                      :class="{
                        cumprida: e.valor < planoNormalizado(diario.plano),
                        atual:    e.valor === planoNormalizado(diario.plano),
                      }"
                    ></span>
                  </span>
                </td>

                <td class="text-end">
                  <div class="d-inline-flex align-items-center gap-2">
                    <!-- Supremo escolhe qualquer etapa -->
                    <select
                      v-if="supremo"
                      class="form-select form-select-sm w-auto"
                      :value="planoNormalizado(diario.plano)"
                      :disabled="salvando === diario.id"
                      @change="definir(diario, $event.target.value)"
                    >
                      <option v-for="e in etapas" :key="e.valor" :value="e.valor">
                        {{ e.valor }}. {{ e.curto }}
                      </option>
                    </select>

                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-secondary"
                        :disabled="!podeRetroceder(diario) || salvando === diario.id"
                        :title="etapaAnterior(diario)"
                        @click="mover(diario, -1)"
                      >
                        <i class="fa-solid fa-chevron-left"></i>
                      </button>
                      <button
                        class="btn btn-dark"
                        :disabled="!podeAvancar(diario) || salvando === diario.id"
                        :title="proximaEtapa(diario)"
                        @click="mover(diario, 1)"
                      >
                        <span
                          v-if="salvando === diario.id"
                          class="spinner-border spinner-border-sm"
                          role="status"
                        ></span>
                        <i v-else class="fa-solid fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </template>

    </div>
  </div>
</template>

<script setup>
  import NavAdmin from "@/components/NavAdmin.vue";
  import { ref, onMounted, computed } from "vue";
  import { apiFetch } from "@/services/http.js";
  import { getUser, ehSupremo } from "@/services/token.js";

  const supremo = ehSupremo()
  const usuario = getUser()
  const diarios = ref([])
  const turmaSelecionada = ref('')

  onMounted(async () => {
    let resposta = await apiFetch('/diario/' + usuario.professor_id);
    if (resposta.ok) {
      diarios.value = await resposta.json();
    } else {
      let msg = await resposta.json()
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
                <th style="width: 32%;">Descrição</th>
                <th style="width: 24%;">Professor</th>
                <th style="width: 15%;">Horário</th>
                <th class="text-center" style="width: 8%;">H/A</th>
                <th class="text-center" style="width: 12%;">Ministrada</th>
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
            </tbody>
          </table>
        </div>
      </div>

    </div>

  </div>
</template>

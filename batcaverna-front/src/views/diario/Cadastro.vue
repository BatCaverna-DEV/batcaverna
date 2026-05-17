<script setup>
  import { onMounted, ref } from 'vue'
  import { apiFetch } from "@/services/http.js";
  import { useRouter } from 'vue-router'
  import NavAdmin from "@/components/NavAdmin.vue";
  import { getUser } from "@/services/token.js";

  const router  = useRouter()
  const usuario = getUser()
  const diario  = ref({ descricao: '', carga: '', turma_id: '' })
  const turmas  = ref([])
  const erro    = ref('')

  onMounted(async () => {
    const resp = await apiFetch(`/turma/${usuario.professor_id}`)
    if (resp.ok) {
      turmas.value = await resp.json()
    } else {
      const msg = await resp.json()
      erro.value = msg.message
    }
  })

  async function salvar() {
    erro.value = ''
    try {
      const resposta = await apiFetch('/diario/cadastro', {
        method: 'POST',
        body: diario.value,
      })
      if (resposta.ok) {
        router.push('/diario/lista')
      } else {
        const msg = await resposta.json()
        erro.value = msg.message
      }
    } catch (e) {
      erro.value = 'Erro inesperado. Tente novamente.'
    }
  }
</script>

<template>
  <NavAdmin/>
  <div class="container pagina">

    <div class="pagina-header">
      <h4><i class="fa-solid fa-book me-2"></i>Novo Diário</h4>
      <RouterLink class="btn btn-outline-secondary btn-sm" to="/diario/lista">
        <i class="fa-solid fa-arrow-left me-1"></i>Voltar
      </RouterLink>
    </div>

    <div class="pagina-body">

      <div v-if="erro" class="alert alert-danger py-2" role="alert">
        <i class="fa-solid fa-circle-exclamation me-2"></i>{{ erro }}
      </div>

      <form @submit.prevent="salvar">
        <div class="row g-3">

          <div class="col-sm-8">
            <label for="descricao" class="form-label">Descrição da Disciplina</label>
            <input v-model="diario.descricao" type="text" id="descricao" required class="form-control" placeholder="Nome da disciplina">
          </div>

          <div class="col-sm-4">
            <label for="carga" class="form-label">Carga Horária</label>
            <div class="input-group">
              <input v-model.number="diario.carga" type="number" id="carga" required min="1" class="form-control" placeholder="60">
              <span class="input-group-text text-muted">h/a</span>
            </div>
          </div>

          <div class="col-12">
            <label for="turma" class="form-label">Turma</label>
            <select v-model="diario.turma_id" id="turma" required class="form-select">
              <option value="" disabled>Selecione a turma...</option>
              <option v-for="turma in turmas" :key="turma.id" :value="turma.id">
                {{ turma.codigo }} — {{ turma.descricao }}
              </option>
            </select>
            <div v-if="turmas.length === 0 && !erro" class="form-text text-muted">
              Nenhuma turma encontrada para o seu vínculo de coordenação.
            </div>
          </div>

        </div>

        <div class="form-footer">
          <RouterLink class="btn btn-outline-secondary" to="/diario/lista">Cancelar</RouterLink>
          <button type="submit" class="btn btn-dark px-4" :disabled="turmas.length === 0">
            <i class="fa-solid fa-floppy-disk me-2"></i>Salvar
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

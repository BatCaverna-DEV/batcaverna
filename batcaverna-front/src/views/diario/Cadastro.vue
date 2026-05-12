<script setup>
  import { onMounted, ref } from 'vue'
  import { apiFetch } from "@/services/http.js";
  import { useRouter } from 'vue-router'
  import NavAdmin from "@/components/NavAdmin.vue";
  import { getUser } from "@/services/token.js";

  const router  = useRouter()
  let usuario   = getUser()
  let diario    = ref({ codigo: 0, descricao: '', carga: 0, professor_id: 0, turma_id: 0, horario: '' })
  let professores = ref({})
  let turmas    = ref({})
  let erro      = ref('')

  onMounted(async () => {
    let resposta = await apiFetch('/professor')
    if (resposta.ok) {
      professores.value = await resposta.json()
    } else {
      let msg = await resposta.json()
      erro.value = msg.message
    }
    let resposta2 = await apiFetch(`/turma/${usuario.professor_id}`)
    if (resposta2.ok) {
      turmas.value = await resposta2.json()
    }
  })

  async function salvar() {
    erro.value = ''
    try {
      const resposta = await apiFetch("/diario/cadastro", {
        method: "POST",
        body: diario.value
      })
      if (resposta.ok) {
        router.push('/diario/lista')
      } else {
        const msg = await resposta.json()
        erro.value = `${resposta.status} - ${msg.message}`
      }
    } catch (e) {
      erro.value = `${e.value}`
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
          <div class="col-sm-2">
            <label for="codigo" class="form-label">Código</label>
            <input v-model="diario.codigo" type="number" id="codigo" required class="form-control" placeholder="0">
          </div>
          <div class="col-sm-7">
            <label for="descricao" class="form-label">Descrição da Disciplina</label>
            <input v-model="diario.descricao" type="text" id="descricao" required class="form-control" placeholder="Nome da disciplina">
          </div>
          <div class="col-sm-3">
            <label for="carga" class="form-label">Carga Horária</label>
            <div class="input-group">
              <input v-model="diario.carga" type="number" id="carga" required class="form-control" placeholder="60">
              <span class="input-group-text text-muted">h/a</span>
            </div>
          </div>
          <div class="col-sm-6">
            <label for="professor" class="form-label">Professor</label>
            <select v-model="diario.professor_id" id="professor" required class="form-select">
              <option value="0" disabled>Selecione o professor...</option>
              <option v-for="professor in professores" :key="professor.id" :value="professor.id">
                {{ professor.siape }} — {{ professor.nome }}
              </option>
            </select>
          </div>
          <div class="col-sm-4">
            <label for="turma" class="form-label">Turma</label>
            <select v-model="diario.turma_id" id="turma" required class="form-select">
              <option value="0" disabled>Selecione a turma...</option>
              <option v-for="turma in turmas" :key="turma.id" :value="turma.id">
                {{ turma.descricao }}
              </option>
            </select>
          </div>
          <div class="col-sm-2">
            <label for="horario" class="form-label">Horário</label>
            <input v-model="diario.horario" type="text" id="horario" required class="form-control" placeholder="2M12/3T34">
          </div>
        </div>

        <div class="form-footer">
          <RouterLink class="btn btn-outline-secondary" to="/diario/lista">Cancelar</RouterLink>
          <button type="submit" class="btn btn-dark px-4">
            <i class="fa-solid fa-floppy-disk me-2"></i>Salvar
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

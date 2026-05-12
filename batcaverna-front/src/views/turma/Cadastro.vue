<script setup>
  import { onMounted, ref } from 'vue'
  import { apiFetch } from "@/services/http.js";
  import { useRouter } from 'vue-router'
  import NavAdmin from "@/components/NavAdmin.vue";
  import { getUser } from "@/services/token.js";

  const router  = useRouter()
  const usuario = ref(getUser())

  let turma      = ref({ descricao: '', codigo: '', calendario_id: '', curso_id: '' })
  let erro       = ref('')
  let calendarios = ref([])
  let curso      = ref({})

  onMounted(async () => {
    const resposta = await apiFetch('/calendario')
    if (resposta.ok) {
      calendarios.value = await resposta.json()
    } else {
      let msg = await resposta.json()
      erro.value = msg.message
    }
    const resposta2 = await apiFetch('/curso/coordena/' + usuario.value.professor_id)
    if (resposta2.ok) {
      curso.value = await resposta2.json()
      turma.value.curso_id = curso.value.id
    }
  })

  async function salvar() {
    erro.value = ''
    try {
      const resposta = await apiFetch("/turma/cadastro", {
        method: "POST",
        body: turma.value
      })
      if (resposta.ok) {
        router.push('/turma/lista')
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
      <h4><i class="fa-solid fa-users me-2"></i>Nova Turma</h4>
      <RouterLink class="btn btn-outline-secondary btn-sm" to="/turma/lista">
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
            <label for="descricao" class="form-label">Descrição da Turma</label>
            <input v-model="turma.descricao" type="text" id="descricao" required class="form-control" placeholder="Nome da turma">
          </div>
          <div class="col-sm-4">
            <label for="codigo" class="form-label">Código</label>
            <input v-model="turma.codigo" type="text" id="codigo" required class="form-control" placeholder="Ex: 2025.1-TI">
          </div>
          <div class="col-sm-6">
            <label for="calendario_id" class="form-label">Calendário</label>
            <select v-model="turma.calendario_id" id="calendario_id" required class="form-select">
              <option value="" disabled>Selecione o calendário...</option>
              <option v-for="calendario in calendarios.filter(c => c.status === 1)"
                      :key="calendario.id" :value="calendario.id">
                {{ `${calendario.descricao} — ${calendario.ano}.${calendario.semestre}` }}
              </option>
            </select>
          </div>
          <div class="col-sm-6">
            <label class="form-label">Curso</label>
            <input :value="curso.descricao" type="text" class="form-control" readonly>
          </div>
        </div>

        <div class="form-footer">
          <RouterLink class="btn btn-outline-secondary" to="/turma/lista">Cancelar</RouterLink>
          <button type="submit" class="btn btn-dark px-4">
            <i class="fa-solid fa-floppy-disk me-2"></i>Salvar
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { apiFetch } from "@/services/http.js";
  import { useRouter } from 'vue-router'
  import NavAdmin from "@/components/NavAdmin.vue";

  const router = useRouter()
  let curso       = ref({ descricao: '', categoria: '', professor_id: '' })
  let professores = ref({})
  let erro        = ref('')

  async function salvar() {
    erro.value = ''
    try {
      const resposta = await apiFetch("/curso/cadastro", {
        method: "POST",
        body: curso.value
      })
      if (resposta.ok) {
        router.push('/curso/lista')
      } else {
        const msg = await resposta.json()
        erro.value = `${resposta.status} - ${msg.message}`
      }
    } catch (err) {
      erro.value = `${err.value}`
    }
  }

  onMounted(async () => {
    const resposta = await apiFetch('/professor')
    if (resposta.ok) {
      professores.value = await resposta.json()
    }
  })
</script>

<template>
  <NavAdmin/>
  <div class="container pagina">

    <div class="pagina-header">
      <h4><i class="fa-solid fa-layer-group me-2"></i>Novo Curso</h4>
      <RouterLink class="btn btn-outline-secondary btn-sm" to="/curso/lista">
        <i class="fa-solid fa-arrow-left me-1"></i>Voltar
      </RouterLink>
    </div>

    <div class="pagina-body">

      <div v-if="erro" class="alert alert-danger py-2" role="alert">
        <i class="fa-solid fa-circle-exclamation me-2"></i>{{ erro }}
      </div>

      <form @submit.prevent="salvar">
        <div class="row g-3">
          <div class="col-12">
            <label for="descricao" class="form-label">Descrição do Curso</label>
            <input v-model="curso.descricao" type="text" id="descricao" required class="form-control" placeholder="Nome completo do curso">
          </div>
          <div class="col-sm-4">
            <label for="categoria" class="form-label">Categoria</label>
            <select v-model.number="curso.categoria" id="categoria" required class="form-select">
              <option value="" disabled>Selecione a categoria...</option>
              <option :value="1">Integrado</option>
              <option :value="2">Subsequente</option>
              <option :value="3">Superior</option>
            </select>
          </div>
          <div class="col-sm-8">
            <label for="professor_id" class="form-label">Coordenador</label>
            <select v-model="curso.professor_id" id="professor_id" required class="form-select">
              <option value="" disabled>Selecione o coordenador...</option>
              <option v-for="professor in professores" :key="professor.id" :value="professor.id">
                {{ professor.nome }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-footer">
          <RouterLink class="btn btn-outline-secondary" to="/curso/lista">Cancelar</RouterLink>
          <button type="submit" class="btn btn-dark px-4">
            <i class="fa-solid fa-floppy-disk me-2"></i>Salvar
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

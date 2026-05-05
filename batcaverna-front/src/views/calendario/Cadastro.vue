<script setup>
  import NavAdmin from "@/components/NavAdmin.vue";
  import { ref } from "vue";
  import { useRouter } from 'vue-router'
  import { apiFetch } from "@/services/http.js";

  const router = useRouter()
  let calendario = ref({ descricao: '', ano: 0, semestre: 0, inicio: '', fim: '' });
  let erro = ref('')

  async function salvar() {
    erro.value = ''
    try {
      const resposta = await apiFetch('/calendario/cadastro', {
        method: 'POST',
        body: calendario.value,
      })
      if (resposta.ok) {
        router.push('/calendario/lista')
      } else {
        const msg = await resposta.json()
        erro.value = `${resposta.status} - ${msg.message}`
      }
    } catch (err) {
      erro.value = `${err.message}`
    }
  }
</script>

<template>
  <NavAdmin/>
  <div class="container pagina">

    <div class="pagina-header">
      <h4><i class="fa-solid fa-calendar-days me-2"></i>Novo Calendário</h4>
      <a class="btn btn-outline-secondary btn-sm" href="/calendario/lista">
        <i class="fa-solid fa-arrow-left me-1"></i>Voltar
      </a>
    </div>

    <div class="pagina-body">

      <div v-if="erro" class="alert alert-danger py-2" role="alert">
        <i class="fa-solid fa-circle-exclamation me-2"></i>{{ erro }}
      </div>

      <form @submit.prevent="salvar">
        <div class="row g-3">
          <div class="col-12">
            <label for="descricao" class="form-label">Descrição</label>
            <input v-model="calendario.descricao" type="text" id="descricao" required class="form-control" placeholder="Ex: 1º Semestre 2025">
          </div>
          <div class="col-sm-3">
            <label for="ano" class="form-label">Ano</label>
            <input v-model="calendario.ano" type="number" id="ano" required class="form-control" placeholder="2025">
          </div>
          <div class="col-sm-3">
            <label for="semestre" class="form-label">Semestre</label>
            <input v-model="calendario.semestre" type="number" id="semestre" required class="form-control" min="1" max="2" placeholder="1 ou 2">
          </div>
          <div class="col-sm-3">
            <label for="inicio" class="form-label">Data de Início</label>
            <input v-model="calendario.inicio" type="date" id="inicio" required class="form-control">
          </div>
          <div class="col-sm-3">
            <label for="fim" class="form-label">Data de Fim</label>
            <input v-model="calendario.fim" type="date" id="fim" required class="form-control">
          </div>
        </div>

        <div class="form-footer">
          <a class="btn btn-outline-secondary" href="/calendario/lista">Cancelar</a>
          <button type="submit" class="btn btn-dark px-4">
            <i class="fa-solid fa-floppy-disk me-2"></i>Salvar
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

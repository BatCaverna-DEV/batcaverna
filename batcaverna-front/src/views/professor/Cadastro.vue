<script setup>
  import { ref } from "vue";
  import { useRouter } from 'vue-router'
  import { apiFetch } from "@/services/http.js";
  import NavAdmin from "@/components/NavAdmin.vue";

  const router = useRouter()
  let professor = ref({ nome: '', siape: '', email: '' });
  let erro = ref('')

  async function cadastrar() {
    erro.value = ''
    try {
      const resposta = await apiFetch('/professor/cadastro', {
        method: 'POST',
        body: professor.value,
      })
      if (resposta.ok) {
        router.push('/professor/lista?sucesso=1')
      } else {
        const msg = await resposta.json()
        erro.value = `${resposta.status} - ${msg.message}`
      }
    } catch (error) {
      erro.value = `${error.message}`
    }
  }
</script>

<template>
  <NavAdmin/>
  <div class="container pagina">

    <div class="pagina-header">
      <h4><i class="fa-solid fa-person-chalkboard me-2"></i>Novo Professor</h4>
      <a class="btn btn-outline-secondary btn-sm" href="/professor/lista">
        <i class="fa-solid fa-arrow-left me-1"></i>Voltar
      </a>
    </div>

    <div class="pagina-body">

      <div v-if="erro" class="alert alert-danger py-2" role="alert">
        <i class="fa-solid fa-circle-exclamation me-2"></i>{{ erro }}
      </div>

      <form @submit.prevent="cadastrar">
        <div class="row g-3">
          <div class="col-sm-3">
            <label for="siape" class="form-label">SIAPE</label>
            <input v-model="professor.siape" type="text" id="siape" required class="form-control" placeholder="Ex: 1234567">
          </div>
          <div class="col-sm-9">
            <label for="nome" class="form-label">Nome Completo</label>
            <input v-model="professor.nome" type="text" id="nome" required class="form-control" placeholder="Nome do professor">
          </div>
          <div class="col-sm-6">
            <label for="email" class="form-label">E-mail Institucional</label>
            <input v-model="professor.email" type="email" id="email" required class="form-control" placeholder="nome@ifma.edu.br">
          </div>
        </div>

        <div class="form-footer">
          <a class="btn btn-outline-secondary" href="/professor/lista">Cancelar</a>
          <button type="submit" class="btn btn-dark px-4">
            <i class="fa-solid fa-floppy-disk me-2"></i>Salvar
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

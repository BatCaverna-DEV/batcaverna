<script setup>

  import {onMounted, ref} from 'vue'
  import {apiFetch} from "@/services/http.js";
  import {useRouter} from 'vue-router'
  import NavAdmin from "@/components/NavAdmin.vue";
  import {getUser} from "@/services/token.js";

  const router = useRouter()

  let usuario = getUser()
  let diario = ref({codigo: 0, descricao: '', carga: 0, professor_id:0, turma_id:0})
  let professores = ref({})
  let turmas = ref({})
  let erro = ref('')

  onMounted(async () => {
    let resposta = await apiFetch('/professor')
    if(resposta.ok){
      professores.value = await resposta.json()
    }else{
      let msg = await resposta.json()
      erro.value = msg.message
    }

    let resposta2 = await apiFetch(`/turma/${usuario.professor_id}`)
    if(resposta2.ok){
      turmas.value = await resposta2.json()
    }
  })

  async function salvar(){
    erro.value = ''
    try{
      const resposta = await apiFetch("/diario/cadastro", {
        method: "POST",
        body: diario.value
      })
      if(resposta.ok){
        alert('Diário cadastrado com sucesso!')
        router.push('/diario/lista')
      }else{
        const msg = await resposta.json()
        erro.value = `${resposta.status} - ${msg.message}`
      }
    }catch(e){
      erro.value = `${e.value}`
    }
  }

</script>

<template>

  <NavAdmin/>
  <div class="container shadow p-3">
    <nav class="navbar bg-body-tertiary">
      <div class="container-fluid">
        <h4>Cadastro de Diário</h4>
        <a class="btn btn-secondary" href="/diario/lista">Voltar</a>
      </div>
    </nav>

    <div v-if="erro" class="alert alert-danger" role="alert">
      <strong>ERRO: </strong> {{ erro }}
    </div>

    <form @submit.prevent="salvar">
      <div class="row mt-3">
        <div class="col-sm-2">
          <label for="codigo">CÓDIGO</label>
          <input v-model="diario.codigo" type="number" class="form-control" id="codigo" required>
        </div>
        <div class="col-sm-8">
          <label for="descricao">DESCRIÇÃO</label>
          <input v-model="diario.descricao" type="text" class="form-control" id="descricao" required>
        </div>
        <div class="col-sm-2">
          <label for="carga">CARGA HORÁRIA</label>
          <input v-model="diario.carga" type="number" class="form-control" id="carga" required>
        </div>
      </div>

      <div class="row mt-3">

        <div class="col-sm-6">
          <label for="professor">PROFESSOR</label>
          <select v-model="diario.professor_id" class="form-select" id="professor" required>
            <option v-for="professor in professores"
                    :key="professor.id"
                    :value="professor.id">
              {{ `${professor.siape} - ${professor.nome}` }}
            </option>
          </select>
        </div>

        <div class="col-sm-6">
          <label for="turma">TURMA</label>
          <select v-model="diario.turma_id" class="form-select" id="turma" required>
            <option v-for="turma in turmas"
                    :key="turma.id"
                    :value="turma.id">
              {{ turma.descricao }}
            </option>
          </select>
        </div>

      </div>

      <div class="row mt-3">
        <div class="col-sm d-flex justify-content-end">
          <button type="submit" class="btn btn-success">Salvar</button>
        </div>
      </div>

    </form>

  </div> <!-- Fim da DIV maior -->

</template>

<style scoped>

</style>
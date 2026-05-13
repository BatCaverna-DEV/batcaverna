<script setup>
  import { ref, onMounted } from "vue";
  import { useRouter, useRoute } from 'vue-router'
  import { apiFetch } from "@/services/http.js";
  import NavAdmin from "@/components/NavAdmin.vue";
  import { statusUsuario } from "@/services/format.js";
  import { ehSupremo } from "@/services/token.js";

  const supremo = ehSupremo()

  const router = useRouter()
  const route  = useRoute()

  const professores  = ref([])
  const cadastrou    = ref(false)
  const mensagem     = ref('')
  const carregando   = ref(null) // id do professor em operação

  const carregar = async () => {
    const resposta = await apiFetch('/professor')
    if (resposta.ok) {
      professores.value = await resposta.json()
    } else {
      const msg = await resposta.json()
      alert('ERRO ' + resposta.status + ': ' + msg.message)
      router.push('/admin')
    }
  }

  onMounted(async () => {
    await carregar()
    if (route.query.sucesso) cadastrou.value = true
  })

  const promover = async (professor) => {
    const ehCoordenador = professor.usuario?.categoria === 2
    const acao = ehCoordenador ? 'rebaixar' : 'promover'
    const descricao = ehCoordenador
      ? `rebaixar ${professor.nome} de Coordenador para Sem Acesso`
      : `promover ${professor.nome} a Coordenador`

    if (!confirm(`Deseja ${descricao}?`)) return

    carregando.value = professor.id
    mensagem.value = ''

    const resposta = await apiFetch(`/professor/${professor.id}/promover`, { method: 'PUT' })
    const dados = await resposta.json()
    carregando.value = null

    if (resposta.ok) {
      mensagem.value = dados.message
      await carregar()
    } else {
      alert('ERRO ' + resposta.status + ': ' + dados.message)
    }
  }
</script>

<template>
  <NavAdmin/>
  <div class="container pagina">

    <div class="pagina-header">
      <h4><i class="fa-solid fa-person-chalkboard me-2"></i>Professores</h4>
      <div class="d-flex gap-2">
        <RouterLink v-if="supremo" class="btn btn-dark btn-sm px-3" to="/professor/cadastro">
          <i class="fa-solid fa-plus me-1"></i>Novo
        </RouterLink>
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/admin">
          <i class="fa-solid fa-arrow-left me-1"></i>Voltar
        </RouterLink>
      </div>
    </div>

    <div class="pagina-body">

      <div v-if="cadastrou" class="alert alert-success alert-dismissible fade show py-2" role="alert">
        <i class="fa-solid fa-circle-check me-2"></i>Professor cadastrado com sucesso!
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>

      <div v-if="mensagem" class="alert alert-success alert-dismissible fade show py-2" role="alert">
        <i class="fa-solid fa-circle-check me-2"></i>{{ mensagem }}
        <button type="button" class="btn-close" @click="mensagem = ''" aria-label="Close"></button>
      </div>

      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th style="width:12%">SIAPE</th>
              <th style="width:35%">Nome</th>
              <th>E-mail</th>
              <th class="text-center" style="width:12%">Categoria</th>
              <th style="width:5%"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="professor in professores" :key="professor.id">
              <td class="text-muted" style="font-family:monospace">{{ professor.siape }}</td>
              <td class="fw-semibold">{{ professor.nome }}</td>
              <td>{{ professor.email }}</td>
              <td class="text-center">
                <span class="badge rounded-pill"
                      :class="professor.usuario?.categoria === 2 ? 'badge-ativo' : 'badge-inativo'">
                  {{ statusUsuario(professor.usuario?.categoria) }}
                </span>
              </td>
              <td class="text-end">
                <div v-if="supremo" class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                    <li v-if="professor.usuario?.categoria !== 1">
                      <button class="dropdown-item" :disabled="carregando === professor.id" @click="promover(professor)">
                        <span v-if="carregando === professor.id" class="spinner-border spinner-border-sm me-2"></span>
                        <template v-else>
                          <i v-if="professor.usuario?.categoria === 2" class="fa-solid fa-arrow-down me-2 text-warning"></i>
                          <i v-else class="fa-solid fa-arrow-up me-2 text-primary"></i>
                        </template>
                        {{ professor.usuario?.categoria === 2 ? 'Rebaixar' : 'Promover' }}
                      </button>
                    </li>
                    <li><a class="dropdown-item" href="#"><i class="fa-solid fa-pen me-2 text-secondary"></i>Editar</a></li>
                    <li><hr class="dropdown-divider my-1"></li>
                    <li><a class="dropdown-item text-danger" href="#"><i class="fa-solid fa-trash me-2"></i>Excluir</a></li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="professores.length === 0">
              <td colspan="5" class="text-center text-muted py-4">Nenhum professor cadastrado.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

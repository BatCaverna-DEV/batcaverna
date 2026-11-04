<script setup>
  import NavAdmin from "@/components/NavAdmin.vue";
  import { ref, onMounted } from "vue";
  import { useRouter } from 'vue-router'
  import { apiFetch } from "@/services/http.js";
  import { statusCalendario } from "@/services/format.js";
  import { ehSupremo } from "@/services/token.js";

  const supremo = ehSupremo()

  const router = useRouter()
  const calendarios = ref([])
  const mensagem    = ref('')
  const carregando  = ref(null) // id do calendário em operação

  const carregar = async () => {
    let resposta = await apiFetch('/calendario')
    if (resposta.ok) {
      calendarios.value = await resposta.json()
    } else {
      let msg = await resposta.json()
      alert('ERRO ' + resposta.status + ': ' + msg.message)
      router.push('/admin')
    }
  }

  const finalizar = async (calendario) => {
    if (!confirm(`Finalizar o ${calendario.descricao}? Todas as turmas e diários dele também ficarão inativos.`)) return

    carregando.value = calendario.id
    mensagem.value = ''

    const resposta = await apiFetch(`/calendario/${calendario.id}/finalizar`, { method: 'PUT' })
    const dados = await resposta.json()
    carregando.value = null

    if (resposta.ok) {
      mensagem.value = dados.message
      await carregar()
    } else {
      alert('ERRO ' + resposta.status + ': ' + dados.message)
    }
  }

  onMounted(carregar)
</script>

<template>
  <NavAdmin/>
  <div class="container pagina">

    <div class="pagina-header">
      <h4><i class="fa-solid fa-calendar-days me-2"></i>Calendários</h4>
      <div class="d-flex gap-2">
        <RouterLink v-if="supremo" class="btn btn-dark btn-sm px-3" to="/calendario/cadastro">
          <i class="fa-solid fa-plus me-1"></i>Novo
        </RouterLink>
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/admin">
          <i class="fa-solid fa-arrow-left me-1"></i>Voltar
        </RouterLink>
      </div>
    </div>

    <div v-if="mensagem" class="alert alert-success alert-dismissible fade show py-2" role="alert">
      <i class="fa-solid fa-circle-check me-2"></i>{{ mensagem }}
      <button type="button" class="btn-close" @click="mensagem = ''" aria-label="Close"></button>
    </div>

    <div class="pagina-body">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Descrição</th>
              <th class="text-center" style="width:8%">Ano</th>
              <th class="text-center" style="width:10%">Semestre</th>
              <th class="text-center" style="width:13%">Início</th>
              <th class="text-center" style="width:13%">Fim</th>
              <th class="text-center" style="width:10%">Status</th>
              <th style="width:5%"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="calendario in calendarios" :key="calendario.id">
              <td class="fw-semibold">{{ calendario.descricao }}</td>
              <td class="text-center">{{ calendario.ano }}</td>
              <td class="text-center">{{ calendario.semestre }}º</td>
              <td class="text-center text-muted">{{ calendario.inicio }}</td>
              <td class="text-center text-muted">{{ calendario.fim }}</td>
              <td class="text-center">
                <span class="badge rounded-pill"
                      :class="calendario.status === 1 ? 'badge-ativo' : 'badge-fechado'">
                  {{ statusCalendario(calendario.status) }}
                </span>
              </td>
              <td class="text-end">
                <div v-if="supremo" class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                    <template v-if="calendario.status === 1">
                      <li>
                        <button class="dropdown-item" type="button" :disabled="carregando === calendario.id" @click="finalizar(calendario)">
                          <span v-if="carregando === calendario.id" class="spinner-border spinner-border-sm me-2"></span>
                          <i v-else class="fa-solid fa-flag-checkered me-2 text-secondary"></i>Finalizar
                        </button>
                      </li>
                      <li><hr class="dropdown-divider my-1"></li>
                    </template>
                    <li><a class="dropdown-item text-danger" href="#"><i class="fa-solid fa-trash me-2"></i>Excluir</a></li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="calendarios.length === 0">
              <td colspan="7" class="text-center text-muted py-4">Nenhum calendário cadastrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

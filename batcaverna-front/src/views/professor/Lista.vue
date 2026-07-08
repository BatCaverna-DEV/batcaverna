<script setup>
  import { ref, onMounted } from "vue";
  import { useRouter, useRoute } from 'vue-router'
  import { apiFetch } from "@/services/http.js";
  import NavAdmin from "@/components/NavAdmin.vue";
  import { statusUsuario, statusProfessor, classStatusProfessor, tipoProfessor } from "@/services/format.js";
  import { ehSupremo, ehGestor } from "@/services/token.js";

  const supremo = ehSupremo()
  const gestor  = ehGestor()

  const router = useRouter()
  const route  = useRoute()

  const professores    = ref([])
  const cadastrou      = ref(false)
  const mensagem       = ref('')
  const carregando     = ref(null) // id do professor em operação
  const mostrarInativos = ref(false)

  // --- edição ---
  const editando   = ref(null)
  const erroEdicao = ref('')

  const carregar = async () => {
    const query = mostrarInativos.value ? '?inativos=true' : ''
    const resposta = await apiFetch(`/professor${query}`)
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

  const STATUS_OPCOES = [
    { valor: 1, label: 'Ativo' },
    { valor: 2, label: 'Afastado' },
    { valor: 3, label: 'Inativo' },
  ]

  const alterarStatus = async (professor, novoStatus) => {
    if (professor.status === novoStatus) return

    const opcao = STATUS_OPCOES.find(o => o.valor === novoStatus)
    if (!confirm(`Alterar status de ${professor.nome} para "${opcao.label}"?`)) return

    carregando.value = professor.id
    mensagem.value = ''

    const resposta = await apiFetch(`/professor/${professor.id}/status`, {
      method: 'PUT',
      body: { status: novoStatus },
    })
    const dados = await resposta.json()
    carregando.value = null

    if (resposta.ok) {
      mensagem.value = dados.message
      await carregar()
    } else {
      alert('ERRO ' + resposta.status + ': ' + dados.message)
    }
  }

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

  function abrirEdicao(professor) {
    erroEdicao.value = ''
    editando.value = {
      id:    professor.id,
      nome:  professor.nome,
      siape: professor.siape,
      email: professor.email,
      tipo:  professor.tipo,
    }
  }

  function fecharEdicao() {
    editando.value = null
    erroEdicao.value = ''
  }

  async function salvarEdicao() {
    erroEdicao.value = ''
    const payload = {
      nome:  editando.value.nome,
      siape: editando.value.siape,
      email: editando.value.email,
      tipo:  editando.value.tipo,
    }
    const resposta = await apiFetch(`/professor/${editando.value.id}`, {
      method: 'PUT',
      body: payload,
    })
    if (resposta.ok) {
      await carregar()
      fecharEdicao()
    } else {
      const dados = await resposta.json()
      erroEdicao.value = dados.message
    }
  }
</script>

<template>
  <NavAdmin/>
  <div class="container pagina">

    <div class="pagina-header">
      <h4><i class="fa-solid fa-person-chalkboard me-2"></i>Professores</h4>
      <div class="d-flex gap-2">
        <button
          class="btn btn-sm"
          :class="mostrarInativos ? 'btn-secondary' : 'btn-outline-secondary'"
          @click="mostrarInativos = !mostrarInativos; carregar()"
        >
          <i class="fa-solid fa-eye me-1"></i>
          {{ mostrarInativos ? 'Ocultar inativos' : 'Mostrar inativos' }}
        </button>
        <RouterLink v-if="gestor" class="btn btn-dark btn-sm px-3" to="/professor/cadastro">
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
              <th style="width:30%">Nome</th>
              <th>E-mail</th>
              <th class="text-center" style="width:9%">Tipo</th>
              <th class="text-center" style="width:9%">Status</th>
              <th class="text-center" style="width:12%">Categoria</th>
              <th style="width:5%"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="professor in professores" :key="professor.id" :class="{ 'tr-inativo': professor.status === 3 }">
              <td class="text-muted" style="font-family:monospace">{{ professor.siape }}</td>
              <td class="fw-semibold">{{ professor.nome }}</td>
              <td>{{ professor.email }}</td>
              <td class="text-center">
                <span class="badge rounded-pill" :class="professor.tipo === 2 ? 'badge-tipo-admin' : 'badge-tipo-docente'">
                  {{ tipoProfessor(professor.tipo) }}
                </span>
              </td>
              <td class="text-center">
                <span class="badge rounded-pill" :class="classStatusProfessor(professor.status)">
                  {{ statusProfessor(professor.status) }}
                </span>
              </td>
              <td class="text-center">
                <span class="badge rounded-pill"
                      :class="professor.usuario?.categoria === 2 ? 'badge-ativo' : 'badge-inativo'">
                  {{ statusUsuario(professor.usuario?.categoria) }}
                </span>
              </td>
              <td class="text-end">
                <div v-if="gestor" class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-sm">

                    <!-- Alterar status (Gestor + Supremo) -->
                    <li><h6 class="dropdown-header">Status</h6></li>
                    <li v-for="opcao in STATUS_OPCOES" :key="opcao.valor">
                      <button
                        class="dropdown-item d-flex align-items-center gap-2"
                        :disabled="carregando === professor.id || professor.status === opcao.valor || professor.usuario?.categoria === 1"
                        @click="alterarStatus(professor, opcao.valor)"
                      >
                        <i
                          class="fa-solid fa-circle fa-xs"
                          :class="{
                            'text-success':   opcao.valor === 1,
                            'text-warning':   opcao.valor === 2,
                            'text-secondary': opcao.valor === 3,
                          }"
                        ></i>
                        {{ opcao.label }}
                        <i v-if="professor.status === opcao.valor" class="fa-solid fa-check ms-auto text-muted"></i>
                      </button>
                    </li>

                    <!-- Promover / Rebaixar (apenas Supremo) -->
                    <template v-if="supremo && professor.usuario?.categoria !== 1">
                      <li><hr class="dropdown-divider my-1"></li>
                      <li>
                        <button class="dropdown-item" :disabled="carregando === professor.id" @click="promover(professor)">
                          <span v-if="carregando === professor.id" class="spinner-border spinner-border-sm me-2"></span>
                          <template v-else>
                            <i v-if="professor.usuario?.categoria === 2" class="fa-solid fa-arrow-down me-2 text-warning"></i>
                            <i v-else class="fa-solid fa-arrow-up me-2 text-primary"></i>
                          </template>
                          {{ professor.usuario?.categoria === 2 ? 'Rebaixar' : 'Promover' }}
                        </button>
                      </li>
                    </template>

                    <!-- Editar (Gestor + Supremo) -->
                    <li><hr class="dropdown-divider my-1"></li>
                    <li><a class="dropdown-item" href="#" @click.prevent="abrirEdicao(professor)"><i class="fa-solid fa-pen me-2 text-secondary"></i>Editar</a></li>

                    <!-- Excluir (apenas Supremo) -->
                    <template v-if="supremo">
                      <li><a class="dropdown-item text-danger" href="#"><i class="fa-solid fa-trash me-2"></i>Excluir</a></li>
                    </template>

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

  <!-- Modal Editar Professor -->
  <Teleport to="body">
    <div v-if="editando" class="modal-backdrop-vue" @click.self="fecharEdicao">
      <div class="modal-dialog modal-lg m-auto">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-pen me-2"></i>Editar Professor
            </h5>
            <button type="button" class="btn-close" @click="fecharEdicao"></button>
          </div>
          <form @submit.prevent="salvarEdicao">
            <div class="modal-body">

              <div v-if="erroEdicao" class="alert alert-danger py-2 mb-3">
                <i class="fa-solid fa-circle-exclamation me-2"></i>{{ erroEdicao }}
              </div>

              <div class="row g-3">

                <div class="col-sm-3">
                  <label class="form-label">SIAPE</label>
                  <input v-model="editando.siape" type="text" required class="form-control font-monospace">
                </div>

                <div class="col-sm-9">
                  <label class="form-label">Nome Completo</label>
                  <input v-model="editando.nome" type="text" required class="form-control">
                </div>

                <div class="col-sm-8">
                  <label class="form-label">E-mail</label>
                  <input v-model="editando.email" type="email" required class="form-control">
                </div>

                <div class="col-sm-4">
                  <label class="form-label">Tipo</label>
                  <select v-model="editando.tipo" required class="form-select">
                    <option :value="1">Docente</option>
                    <option :value="2">Administrador</option>
                  </select>
                </div>

              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="fecharEdicao">Cancelar</button>
              <button type="submit" class="btn btn-dark px-4">
                <i class="fa-solid fa-floppy-disk me-2"></i>Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>

</template>

<style scoped>
.badge-prof-ativo     { background: #d1e7dd; color: #0a3622; }
.badge-prof-afastado  { background: #fff3cd; color: #664d03; }
.badge-prof-inativo   { background: #e2e3e5; color: #41464b; }

.badge-tipo-docente   { background: #cfe2ff; color: #084298; }
.badge-tipo-admin     { background: #e2d9f3; color: #3d1f72; }

.tr-inativo td        { opacity: .5; }

.modal-backdrop-vue {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  z-index: 1055;
  display: flex;
  align-items: flex-start;
  padding: 60px 16px 40px;
  overflow-y: auto;
}
.modal-backdrop-vue :deep(.modal-content) {
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, .175);
  border-radius: .5rem;
}
.modal-backdrop-vue :deep(.modal-header) {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
}
.modal-backdrop-vue :deep(.modal-body) {
  padding: 1.5rem;
}
.modal-backdrop-vue :deep(.modal-footer) {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  gap: .5rem;
}
</style>

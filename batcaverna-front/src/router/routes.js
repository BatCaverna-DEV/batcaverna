import { createRouter, createWebHistory } from 'vue-router'
import { h, resolveComponent } from 'vue'

//Professor
import CadastroProfessor from '../views/professor/Cadastro.vue'
import ListaProfessor from '../views/professor/Lista.vue'

//Usuário
import Login from '../views/usuario/Login.vue'

//Calendário
import ListaCalendario from '@/views/calendario/Lista.vue'
import CadastroCalendario from '@/views/calendario/Cadastro.vue'

//Turma
import ListaTurma from '@/views/turma/Lista.vue'
import CadastroTurma from '@/views/turma/Cadastro.vue'

//Curso
import ListaCurso from '@/views/curso/Lista.vue'
import CadastroCurso from '@/views/curso/Cadastro.vue'

//Diário
import ListaDiario from '@/views/diario/Lista.vue'
import CadastroDiario from '@/views/diario/Cadastro.vue'

//Padrões
import Admin from '../views/admin/Admin.vue'
import NotFound from "@/views/admin/NotFound.vue";
import Painel from '@/views/admin/Painel.vue'



const RouterViewOnly = {
    render(){
        return h(resolveComponent('router-view'))
    }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
      {
          path: '/',
          name: 'painel',
          component: () => Painel,
      },
      {
          path: '/admin',
          name: 'admin',
          component: () => Admin,
          meta: { requiresAuth: true },
      },
      //GRUPO DE ROTAS: PROFESSOR
      {
          path: '/professor',
          component: RouterViewOnly,
          meta: { group: 'professor', requiresAuth: true },
          children: [
              {
                  path: 'cadastro',
                  name: 'professor.cadastro',
                  component: CadastroProfessor,
                  meta: { title: 'Cad-Professor' },
              },
              {
                  path: 'lista',
                  name: 'professor.lista',
                  component: ListaProfessor,
                  meta: { title: 'Lis-Professor' },
              }
          ]
      },
      {
          path: '/calendario',
          component: RouterViewOnly,
          meta: { group: 'calendario', requiresAuth: true},
          children: [
              {
                  path: 'cadastro',
                  name: 'calendario.cadastro',
                  component: CadastroCalendario,
                  meta: { title: 'Cad-calendario' },
              },
              {
                  path: 'lista',
                  name: 'calendario.lista',
                  component: ListaCalendario,
                  meta: { title: 'Lis-Calendario' },
              }
          ]
      },
      {
          path: '/curso',
          component: RouterViewOnly,
          meta: { group: 'curso', requiresAuth: true },
          children: [
              {
                  path: 'lista',
                  name: 'curso.lista',
                  component: ListaCurso,
                  meta: { title: 'Lis-Curso' },
              },
              {
                  path: 'cadastro',
                  name: 'curso.cadastro',
                  component: CadastroCurso,
                  meta: { title: 'Cad-Curso' },
              }
          ]
      },
      {
          path: '/turma',
          component: RouterViewOnly,
          meta: { group: 'turma', requiresAuth: true },
          children: [
              {
                  path: 'lista',
                  name: 'turma.lista',
                  component: ListaTurma,
                  meta: { title: 'Lis-Turma' },
              },
              {
                  path: 'cadastro',
                  name: 'turma.cadastro',
                  component: CadastroTurma,
                  meta: { title: 'Cad-Turma' },
              }
          ]
      },
      {
          path: '/diario',
          component: RouterViewOnly,
          meta: { group: 'diario', requiresAuth: true },
          children: [
              {
                  path: 'lista',
                  name: 'diario.lista',
                  component: ListaDiario,
                  meta: { title: 'Lis-Diario' },
              },
              {
                  path: 'cadastro',
                  name: 'diario.cadastro',
                  component: CadastroDiario,
                  meta: { title: 'Cad-Diario' },
              }
          ]
      },
      {
          path: '/login',
          name: 'login',
          component: Login,
          meta: { guestOnly: true },
      },
      {
          path: '/logout',
          name: 'logout',
          beforeEnter: (to, from, next) => {
              localStorage.removeItem('bat_token');
              next('/login')
          }
      },
      // ⚠️ esta rota precisa ser a última
      {
          path: '/:pathMatch(.*)*',
          name: 'notfound',
          component: NotFound
      }
  ],
})

function isTokenExpired(token) {
    if (!token || token === 'null' || token === 'undefined') return true

    try {
        // JWT tem formato: header.payload.signature
        const [, payloadBase64] = token.split('.')
        if (!payloadBase64) return true

        // Converte Base64URL → JSON
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        const payload = JSON.parse(jsonPayload)

        // Verifica expiração (exp em segundos)
        if (!payload.exp) return true
        const now = Math.floor(Date.now() / 1000)
        return now >= payload.exp
    } catch (e) {
        console.error('Erro ao validar token:', e)
        return true // se deu erro, trata como expirado
    }
}

function isLoggedIn () {
    const token = localStorage.getItem('bat_token')

    if(!token) return false

    if(isTokenExpired(token)) {
        localStorage.removeItem('bat_token')
        return false
    }
    return true
    //  if (!token || token === 'null' || token === 'undefined') return false
    //  // opcional: validar formato de JWT
    //  const parts = token.split('.')
    //  return parts.length === 3 // se seu token não for JWT, troque por `return !!token`
}

router.beforeEach((to) => {
    const logged = isLoggedIn()

    // bloquear páginas só para visitantes se já logado
    if (to.meta?.guestOnly && logged) {
        return { path: '/admin' }
    }

    // checar meta.requiresAuth inclusive em rotas filhas/pais
    const needsAuth = to.matched.some(r => r.meta?.requiresAuth)
    if (needsAuth && !logged) {
        //return { name: 'login', query: { redirect: to.fullPath } }
        return {path: '/login'}
    }

    return true
})

export default router

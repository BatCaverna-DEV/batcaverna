<script setup>
import { RouterLink } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
</script>

<template>
  <Navbar />

  <!-- ── Hero ──────────────────────────────────────────────────────────────── -->
  <section class="hero">
    <div class="hero__inner container">
      <div class="hero__logo-wrap">
        <img src="@/assets/batman.png" alt="Batcaverna" class="hero__logo" />
      </div>
      <h1 class="hero__title">BATCAVERNA</h1>
      <p class="hero__subtitle">GestãoEdu — IFMA Campus Coelho Neto</p>
      <p class="hero__desc">
        Sistema de gerenciamento interno para coordenadores do IFMA Campus Coelho Neto.
        Centralize a demanda de horários, controle as filas de segunda e sexta-feira
        e gerencie professores, turmas e calendário acadêmico em um só lugar.
      </p>
      <div class="hero__actions">
        <RouterLink to="/demanda" class="btn btn-light btn-lg px-4">
          <i class="fa-solid fa-list-check me-2"></i>Ver Demanda
        </RouterLink>
        <RouterLink to="/login" class="btn btn-outline-light btn-lg px-4">
          <i class="fa-solid fa-right-to-bracket me-2"></i>Entrar no Sistema
        </RouterLink>
      </div>
    </div>
  </section>

  <!-- ── Funcionalidades ──────────────────────────────────────────────────── -->
  <section class="funcionalidades container">
    <p class="funcionalidades__label">O QUE O SISTEMA OFERECE</p>
    <div class="row g-4">

      <div class="col-12 col-sm-6 col-lg-4">
        <div class="feat-card">
          <div class="feat-card__icone" style="background:#212529">
            <i class="fa-solid fa-list-check"></i>
          </div>
          <h5 class="feat-card__titulo">Demanda de Horários</h5>
          <p class="feat-card__desc">
            Visualize os diários disponíveis por curso e turma. Professores assumem
            ou liberam diários diretamente pelo painel público, sem necessidade de login.
          </p>
          <RouterLink to="/demanda" class="feat-card__link">
            Acessar demanda <i class="fa-solid fa-arrow-right ms-1"></i>
          </RouterLink>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-4">
        <div class="feat-card">
          <div class="feat-card__icone" style="background:#343a40">
            <i class="fa-solid fa-calendar-week"></i>
          </div>
          <h5 class="feat-card__titulo">Fila de Segunda e Sexta</h5>
          <p class="feat-card__desc">
            Controle organizado das filas dos dias de segunda e sexta-feira,
            garantindo equidade na distribuição de atividades entre os docentes.
          </p>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-4">
        <div class="feat-card">
          <div class="feat-card__icone" style="background:#495057">
            <i class="fa-solid fa-chalkboard-user"></i>
          </div>
          <h5 class="feat-card__titulo">Gestão de Professores</h5>
          <p class="feat-card__desc">
            Cadastro completo do corpo docente com SIAPE, e-mail e status.
            Acompanhe a carga horária distribuída por professor e por período.
          </p>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-4">
        <div class="feat-card">
          <div class="feat-card__icone" style="background:#212529">
            <i class="fa-solid fa-calendar-days"></i>
          </div>
          <h5 class="feat-card__titulo">Calendário Acadêmico</h5>
          <p class="feat-card__desc">
            Organize os períodos letivos do campus. O calendário serve de base
            para a criação e controle de turmas e diários de classe.
          </p>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-4">
        <div class="feat-card">
          <div class="feat-card__icone" style="background:#343a40">
            <i class="fa-solid fa-book-open"></i>
          </div>
          <h5 class="feat-card__titulo">Diários de Turma</h5>
          <p class="feat-card__desc">
            Registro e acompanhamento dos diários de classe por turma e componente
            curricular, com atribuição de horários e cargas horárias.
          </p>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-4">
        <div class="feat-card">
          <div class="feat-card__icone" style="background:#495057">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <h5 class="feat-card__titulo">Cursos e Turmas</h5>
          <p class="feat-card__desc">
            Gerencie os cursos técnicos e superiores do campus, suas turmas e
            períodos, mantendo a estrutura curricular sempre atualizada.
          </p>
        </div>
      </div>

    </div>
  </section>

  <!-- ── Sobre ─────────────────────────────────────────────────────────────── -->
  <section class="sobre">
    <div class="container sobre__inner">
      <div class="sobre__texto">
        <p class="funcionalidades__label" style="color:rgba(255,255,255,.45)">SOBRE O SISTEMA</p>
        <h2 class="sobre__titulo">Feito para coordenadores do IFMA Coelho Neto</h2>
        <p class="sobre__desc">
          O Batcaverna nasceu da necessidade de centralizar e simplificar as demandas
          administrativas da coordenação do campus. Em vez de planilhas e e-mails dispersos,
          tudo passa por um único sistema: desde a montagem dos horários até o controle
          das filas semanais.
        </p>
        <p class="sobre__desc">
          O acesso ao painel de demanda é público — qualquer professor pode consultar
          e assumir diários sem precisar de conta. As funções administrativas ficam
          restritas ao time de coordenação com login.
        </p>
      </div>
      <div class="sobre__destaques">
        <div class="destaque-item">
          <i class="fa-solid fa-lock-open"></i>
          <div>
            <strong>Demanda pública</strong>
            <span>Qualquer docente acessa sem login</span>
          </div>
        </div>
        <div class="destaque-item">
          <i class="fa-solid fa-shield-halved"></i>
          <div>
            <strong>Área restrita</strong>
            <span>Administração exige autenticação</span>
          </div>
        </div>
        <div class="destaque-item">
          <i class="fa-solid fa-school"></i>
          <div>
            <strong>IFMA Campus Coelho Neto</strong>
            <span>Sistema exclusivo do campus</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Rodapé ─────────────────────────────────────────────────────────────── -->
  <footer class="rodape">
    <img src="@/assets/batman.png" alt="Batcaverna" width="22" height="17" class="opacity-50" />
    <span>Batcaverna · GestãoEdu · IFMA Campus Coelho Neto</span>
  </footer>
</template>

<style scoped>
/* ── Hero ─────────────────────────────────────────────────────────────────── */
.hero {
  background: #212529;
  background-image:
    radial-gradient(circle at 20% 60%, rgba(108, 117, 125, .22) 0%, transparent 55%),
    radial-gradient(circle at 80% 20%, rgba(52, 58, 64, .45) 0%, transparent 50%);
  padding: 5rem 1rem 4.5rem;
  text-align: center;
  color: #fff;
}

.hero__inner { max-width: 680px; margin: 0 auto; }

.hero__logo-wrap {
  width: 72px; height: 72px; border-radius: 50%;
  background: rgba(255, 255, 255, .08);
  border: 2px solid rgba(255, 255, 255, .15);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.5rem;
}
.hero__logo { width: 38px; opacity: .9; }

.hero__title {
  font-size: 2.4rem; font-weight: 900;
  letter-spacing: .12em; margin-bottom: .4rem;
}

.hero__subtitle {
  font-size: .9rem; font-weight: 600; letter-spacing: .18em;
  color: rgba(255, 255, 255, .5); text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.hero__desc {
  color: rgba(255, 255, 255, .72); font-size: .95rem;
  line-height: 1.7; margin-bottom: 2.25rem;
}

.hero__actions {
  display: flex; gap: .875rem; justify-content: center; flex-wrap: wrap;
}

/* ── Funcionalidades ─────────────────────────────────────────────────────── */
.funcionalidades {
  padding: 4rem 1rem;
}

.funcionalidades__label {
  font-size: .72rem; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; color: #6c757d;
  margin-bottom: 2rem; text-align: center;
}

.feat-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: .6rem;
  padding: 1.75rem 1.5rem 1.5rem;
  height: 100%;
  transition: transform .18s ease, box-shadow .18s ease;
}

.feat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, .1);
}

.feat-card__icone {
  width: 52px; height: 52px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem; color: #fff;
  margin-bottom: 1.1rem;
}

.feat-card__titulo {
  font-size: .9rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .05em;
  color: #212529; margin-bottom: .6rem;
}

.feat-card__desc {
  font-size: .82rem; color: #6c757d;
  line-height: 1.65; margin-bottom: .875rem;
}

.feat-card__link {
  font-size: .8rem; font-weight: 600;
  color: #212529; text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color .15s;
}
.feat-card__link:hover { border-color: #212529; }

/* ── Sobre ───────────────────────────────────────────────────────────────── */
.sobre {
  background: #212529;
  padding: 4rem 1rem;
  color: #fff;
}

.sobre__inner {
  display: flex; gap: 3.5rem;
  flex-wrap: wrap; align-items: flex-start;
}

.sobre__texto { flex: 1; min-width: 280px; }

.sobre__titulo {
  font-size: 1.5rem; font-weight: 800;
  letter-spacing: .02em; margin-bottom: 1rem;
  line-height: 1.3;
}

.sobre__desc {
  font-size: .88rem; color: rgba(255, 255, 255, .65);
  line-height: 1.75; margin-bottom: .875rem;
}

.sobre__destaques {
  display: flex; flex-direction: column; gap: 1.25rem;
  min-width: 240px; padding-top: 2.5rem;
}

.destaque-item {
  display: flex; align-items: flex-start; gap: 1rem;
}

.destaque-item > i {
  font-size: 1.1rem; color: rgba(255, 255, 255, .5);
  margin-top: .1rem; flex-shrink: 0; width: 20px;
}

.destaque-item > div {
  display: flex; flex-direction: column; gap: .15rem;
}

.destaque-item strong {
  font-size: .88rem; font-weight: 700;
  color: #fff;
}

.destaque-item span {
  font-size: .78rem; color: rgba(255, 255, 255, .5);
}

/* ── Rodapé ──────────────────────────────────────────────────────────────── */
.rodape {
  background: #191c1f;
  border-top: 1px solid rgba(255, 255, 255, .06);
  padding: 1.25rem;
  display: flex; align-items: center; justify-content: center;
  gap: .75rem;
  font-size: .78rem; color: rgba(255, 255, 255, .35);
}
</style>

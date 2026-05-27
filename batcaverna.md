# Batcaverna — Estado do Sistema

Sistema de gerenciamento acadêmico voltado à alocação de docentes para disciplinas no IFMA. Permite que coordenadores gerenciem turmas, diários e calendários, e que professores assumam aulas via painel público sem necessidade de login.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Vue.js 3.5 + Vite 7 + Bootstrap 5 |
| Estado/Roteamento | Pinia 3 + Vue Router 4 |
| Backend | Node.js + Express 5 |
| ORM | Sequelize 6 + mysql2 |
| Banco de Dados | MySQL (utf8mb4, timezone -03:00) |
| Autenticação | JWT (jsonwebtoken) + bcrypt |
| OAuth | Google Auth Library |
| Email | Nodemailer (SMTP Hostinger) |
| Importação XLS | xlsx 0.18.5 |

---

## Arquitetura

Monorepo com dois pacotes independentes:

```
batcaverna/
├── batcaverna-back/    Node.js REST API (porta 3000)
└── batcaverna-front/   Vue.js SPA (base path: /batcaverna/)
```

**Fluxo geral:**

```
Vue SPA  →  HTTP/JSON + Bearer JWT  →  Express API  →  MySQL
```

O frontend é uma SPA pura; o backend expõe uma REST API stateless. Autenticação por JWT com expiração de 1 hora; token armazenado em `localStorage` (chave `bat_token`).

---

## Papéis de Usuário

| Categoria | Papel | Permissões |
|-----------|-------|-----------|
| 1 | Supremo | Acesso total: cria usuários, cursos, calendários, promove coordenadores |
| 2 | Coordenador | Gerencia turmas e diários dos cursos que coordena |
| 0 | Professor | Sem acesso administrativo; assume/libera diários via painel público |

Middleware de autorização: `auth` (valida JWT) → `ehSupremo` (cat=1) / `ehGestor` (cat=1 ou 2).

---

## Módulos e Rotas

### Autenticação (`/usuario`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/usuario/login` | — | Login por username/senha |
| POST | `/usuario/login-google` | — | OAuth Google |
| POST | `/usuario/recuperar` | — | Gera código de reset e envia e-mail |
| POST | `/usuario/redefinir` | — | Redefine senha com código |
| PUT | `/usuario/senha` | auth | Altera a própria senha |

### Professores (`/professor`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/professor` | auth | Lista professores ativos |
| GET | `/professor/carga` | auth | Lista com carga horária calculada |
| POST | `/professor/cadastro` | supremo | Novo professor |
| PUT | `/professor/:id/promover` | supremo | Promove/rebaixa para coordenador |

### Cursos (`/curso`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/curso` | auth | Lista cursos ativos |
| GET | `/curso/coordena/:id` | auth | Cursos coordenados por professor |
| POST | `/curso/cadastro` | supremo | Novo curso |

### Turmas (`/turma`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/turma/:id` | auth | Turmas do coordenador |
| POST | `/turma/cadastro` | gestor | Nova turma |

### Diários (`/diario`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/diario/:id` | auth | Diários do coordenador |
| POST | `/diario/cadastro` | auth | Novo diário (calcula aulas/semana) |
| POST | `/diario/horario` | auth | Interpreta padrão de horário |

### Calendários (`/calendario`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/calendario` | auth | Lista calendários |
| POST | `/calendario/cadastro` | supremo | Novo calendário |
| POST | `/calendario/gerar` | supremo | Gera dias úteis do período |
| GET | `/calendario/semana/:data` | auth | Retorna semana (seg–sáb) |

### Painel Público (`/painel`) — sem autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/painel/cursos` | Lista cursos com contagens de turmas/diários |
| GET | `/painel/demanda?curso_id=` | Turmas e diários por curso |
| GET | `/painel/professor/:siape` | Identifica professor pelo SIAPE |
| GET | `/painel/meus-diarios/:siape` | Diários assumidos pelo professor |
| POST | `/painel/assumir` | Aloca professor a um diário |
| POST | `/painel/liberar` | Remove alocação de professor |

### Fila (`/fila`) — sem autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/fila` | Diários não alocados |

---

## Modelos de Dados

### Usuario
```
id            UUID PK
username      STRING(100)    SIAPE do professor
password      STRING(250)    Hash bcrypt
categoria     INTEGER        0=professor, 1=supremo, 2=coordenador
status        INTEGER        0=inativo, 1=ativo
codigo        STRING(20)     Código one-time para reset de senha
professor_id  FK → Professor
```

### Professor
```
id      UUID PK
nome    STRING(100)
siape   STRING(20)    Identificador único
email   STRING(100)
status  INTEGER       1=ativo, 2=afastado, 3=inativo
tipo    INTEGER       1=docente, 2=administrador
```

### Curso
```
id           UUID PK
descricao    STRING(100)
categoria    INTEGER       1=40h/aula, 2=20h/aula
status       INTEGER
professor_id FK → Professor   (coordenador)
```

### Turma
```
id            UUID PK
codigo        STRING(50)
descricao     STRING(100)
status        INTEGER
curso_id      FK → Curso
calendario_id FK → Calendario
```

### Diario
```
id           UUID PK
codigo       INTEGER        Categoria do curso
descricao    STRING(100)    Nome da disciplina
carga        INTEGER        Carga horária total
ministrada   INTEGER        Horas já ministradas
horario      STRING(50)     Padrão codificado ex: "23M12/34T1"
aulas_semana INTEGER        Calculado: carga / horas_por_aula
status       INTEGER
professor_id FK → Professor  (nullable; null = sem alocação)
turma_id     FK → Turma
```

### Calendario
```
id        UUID PK
descricao STRING(100)   Ex: "2024.1"
ano       INTEGER
semestre  INTEGER
inicio    DATEONLY
fim       DATEONLY
status    INTEGER
```

### Dia
```
id            UUID PK
data          DATE
dia           STRING(100)   Nome do dia da semana
calendario_id FK → Calendario
```

### Horario
```
id        UUID PK
ordem     INTEGER
status    INTEGER
turno     INTEGER     0=matutino, 1=vespertino, 2=noturno
diario_id FK → Diario
dia_id    FK → Dia
```

### Relacionamentos

```
Professor  1:1 ──► Usuario
Professor  1:N ──► Curso         (coordena)
Professor  1:N ──► Diario        (ministra)

Curso      1:N ──► Turma
Calendario 1:N ──► Dia
Calendario 1:N ──► Turma
Turma      1:N ──► Diario
Diario     1:N ──► Horario
Dia        1:N ──► Horario
```

---

## Lógica de Negócio Relevante

### Cálculo de aulas por semana

Na criação de um diário, `aulas_semana` é calculado automaticamente:

```
categoria_curso = 1  →  horas_por_aula = 40
categoria_curso = 2  →  horas_por_aula = 20
aulas_semana = round(carga / horas_por_aula)
```

### Padrão de horário

Campo `horario` usa codificação compacta herdada de sistemas acadêmicos:

```
"23M12/34T1"
 ↑↑ ↑↑  ↑↑ ↑
 || ||  || └─ blocos no turno T
 || ||  |└── turno: M/T/N
 || ||  └─── dias: 2=seg, 3=ter, 4=qua, 5=qui, 6=sex
 || |└─────── blocos no turno M
 || └──────── turno M
 └┴─────────── dias 2 e 3
```

O controller `/diario/horario` interpreta esse padrão e gera os registros `Horario` correspondentes.

### Geração de calendário

Dado `inicio` e `fim`, o sistema gera automaticamente todos os dias úteis (seg–sex), criando um registro `Dia` para cada um, associado ao calendário.

### Soft delete

Nenhuma entidade é removida fisicamente. Todas as listagens filtram por `status=1`.

> **Status do Professor** diferem das demais entidades:
> `1` = Ativo, `2` = Afastado, `3` = Inativo.
> As demais entidades (Curso, Turma, Diário, etc.) seguem o padrão `1` = ativo / `0` = inativo.
> Regras de exibição:
> - Painel admin (`/professor`): mostra Ativos e Afastados (`status != 3`)
> - Carga horária, Fila, Painel público: apenas Ativos (`status = 1`)

---

## Configuração

### Backend (`batcaverna-back/.env`)

```env
PORTA=3000
DB_DIALECT=mysql
HOST=localhost
DB_NAME=batcaverna
DB_USER=root
DB_PASSWORD=
JWT_SECRET=<chave_secreta>
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USER=batcaverna@batcaverna.tech
MAIL_FROM="Batcaverna <batcaverna@batcaverna.tech>"
GOOGLE_CLIENT_ID=<id_oauth>
APP_URL=https://batcaverna.site/batcaverna
```

### Frontend (`batcaverna-front/.env`)

```env
VITE_API_BASE=http://localhost:3000
```

### Scripts úteis (backend)

```bash
npm start            # nodemon (hot reload)
npm run db:sync      # sincroniza modelos (mantém dados)
npm run db:alter     # altera colunas sem recriar
npm run db:force     # recria banco do zero (DESTRUTIVO)
npm run db:migrar    # executa migrations
```

### Scripts úteis (frontend)

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção (dist/)
npm run preview      # visualiza build localmente
```

---

## Estrutura de Arquivos

```
batcaverna-back/
├── config/
│   ├── banco.js          conexão Sequelize
│   ├── gerador.js        sync/force do banco
│   ├── mailer.js         configuração SMTP
│   └── migrar.js         runner de migrations
├── controllers/          lógica de negócio por módulo
├── models/               definição de entidades Sequelize
├── routes/               roteamento Express por módulo
├── helpers/
│   ├── auth.js           middleware JWT
│   ├── role.js           middleware de papéis
│   └── data.js           utilitários de data/hora
└── index.js              servidor Express

batcaverna-front/
├── src/
│   ├── views/
│   │   ├── usuario/      login, senha, recuperação
│   │   ├── professor/    cadastro, lista, carga horária
│   │   ├── curso/        cadastro, lista
│   │   ├── turma/        cadastro, lista
│   │   ├── diario/       cadastro, lista
│   │   ├── calendario/   cadastro, lista
│   │   ├── painel/       demanda, fila pública
│   │   └── admin/        painel administrativo
│   ├── components/
│   │   ├── Navbar.vue    navegação de usuário
│   │   ├── NavAdmin.vue  navegação de admin
│   │   └── Perfil.vue    dados do usuário logado
│   ├── services/
│   │   ├── http.js       cliente HTTP com JWT automático
│   │   ├── auth.js       gerenciamento de token
│   │   └── format.js     formatações de data/valor
│   └── router/routes.js  definição de rotas SPA
└── vite.config.js        base: /batcaverna/, alias @→src
```

---

## Segurança

- Senhas hashadas com bcrypt (salt=10)
- JWT com expiração de 1 hora; sem refresh token
- Código de reset de senha é one-time (anulado após uso)
- Google OAuth restringe domínio a `@ifma.edu.br` (supremo aceita `@gmail.com`)
- Rotas administrativas protegidas por middleware duplo: `auth` + `ehSupremo`/`ehGestor`
- Painel e fila são intencionalmente públicos para facilitar auto-alocação de professores

---

## Observações e Limitações Conhecidas

- Sem paginação: listagens retornam todos os registros (assume conjuntos pequenos)
- Sem validação client-side customizada: validação ocorre apenas no backend
- Sem refresh token: após 1 hora o usuário precisa fazer login novamente
- `npm run db:force` recria o banco do zero — uso apenas em desenvolvimento
- Importação de dados via arquivos XLS (`diarios.xls`, `turmas.xls`, `professores.xls`) na raiz do repositório, processados pela biblioteca `xlsx`

# Integração — API de leitura para outros sistemas

Rotas só de leitura para que outros sistemas do campus (o primeiro é o GradeIF)
consultem calendários, turmas, diários e professores do Batcaverna. Nenhuma rota
daqui altera dados.

## Acesso

- Prefixo: `/integracao/v1`. Uma mudança incompatível no formato ganha um novo
  prefixo (`/v2`); o `/v1` continua respondendo enquanto houver quem o use.
- Autenticação por **token de serviço**, no cabeçalho `X-Integracao-Token`.
  O valor fica em `INTEGRACAO_TOKEN` no `.env` do Batcaverna e de quem consome.
  Não é o JWT dos usuários (que expira em 1 hora e pertence a uma pessoa).
- Sem `INTEGRACAO_TOKEN` configurado, as rotas respondem `503` (integração desligada).
- Token ausente ou errado: `401`.
- O consumidor chama pelo servidor, nunca pelo navegador: o token não pode chegar
  ao front. Na VPS a chamada vai direto em `http://localhost:3003`.

Gerar um token: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## Convenções das respostas

- JSON com campos em `camelCase`; datas `AAAA-MM-DD`; instantes em ISO 8601.
- `id` é o UUID do Batcaverna: é o único identificador estável. Códigos de turma
  podem se repetir e nomes podem mudar.
- Os textos vêm **como estão no banco** (com espaços sobrando, maiúsculas etc.).
  Normalizar e comparar é papel de quem consome.
- Registros inativos **também vêm**, com o `status`. Assim o consumidor distingue
  "foi desativado" de "nunca existiu".
- `atualizadoEm` é o instante da última alteração do registro.

Status:

| Entidade | Valores |
|---|---|
| Professor | `1` ativo, `2` afastado, `3` inativo |
| Calendário, curso, turma, diário | `1` ativo, `0` inativo |

Categoria do curso (`curso.categoria`), como cadastrada: `1` = 40 h/aula,
`2` = 20 h/aula; os cursos superiores estão cadastrados com `3`.
Tipo do professor (`professor.tipo`): `1` docente, `2` administrador.

## Rotas

### `GET /integracao/v1/calendarios`

Todos os calendários, do mais recente para o mais antigo.

```json
[
  {
    "id": "5b0c9c3e-0d7e-4c2b-9d43-1f0e6a3c2a10",
    "descricao": "Calendario - 2026.2",
    "ano": 2026,
    "semestre": 2,
    "inicio": "2026-08-18",
    "fim": "2027-01-08",
    "status": 1,
    "atualizadoEm": "2026-08-01T13:00:00.000Z"
  }
]
```

### `GET /integracao/v1/calendarios/:id/oferta`

Tudo o que é ofertado no calendário, numa resposta só (uma fotografia coerente):
os cursos das turmas, as turmas do calendário e os diários dessas turmas, cada um
com o professor que o assumiu (ou `null`). Calendário inexistente: `404`.

```json
{
  "geradoEm": "2026-11-24T14:00:00.000Z",
  "calendario": { "id": "5b0c9c3e-…", "descricao": "Calendario - 2026.2", "ano": 2026, "semestre": 2, "inicio": "2026-08-18", "fim": "2027-01-08", "status": 1, "atualizadoEm": "…" },
  "cursos": [
    { "id": "a1d0…", "descricao": "Técnico em Desenvolvimento de Sistemas", "categoria": 1, "status": 1, "atualizadoEm": "…" }
  ],
  "turmas": [
    { "id": "7c2e…", "codigo": "20261.1.TDS.CNT.1191.1V", "descricao": "1º TDS", "status": 1, "cursoId": "a1d0…", "atualizadoEm": "…" }
  ],
  "diarios": [
    {
      "id": "e93f…",
      "descricao": "Fundamentos de Programação ",
      "carga": 160,
      "aulasSemana": 4,
      "status": 1,
      "turmaId": "7c2e…",
      "professor": { "id": "44b1…", "siape": "1234567", "nome": "Fulana de Tal" },
      "atualizadoEm": "…"
    },
    {
      "id": "0b8a…",
      "descricao": "Química I",
      "carga": 80,
      "aulasSemana": 2,
      "status": 1,
      "turmaId": "7c2e…",
      "professor": null,
      "atualizadoEm": "…"
    }
  ]
}
```

Ordem: turmas por código; diários por turma e descrição.

### `GET /integracao/v1/professores`

Todos os professores, de qualquer status, por nome.

```json
[
  {
    "id": "44b1…",
    "nome": "Fulana de Tal",
    "siape": "1234567",
    "email": "fulana@ifma.edu.br",
    "status": 1,
    "tipo": 1,
    "atualizadoEm": "…"
  }
]
```

## Exemplo de chamada

```bash
curl -H "X-Integracao-Token: $INTEGRACAO_TOKEN" http://localhost:3003/integracao/v1/calendarios
```

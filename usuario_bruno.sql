-- Usuário para Bruno Vicente Alves de Lima
-- username = siape = 1226388
-- senha inicial = 1226388 (deve ser trocada no primeiro acesso)
-- categoria 2 = Coordenador

INSERT INTO usuarios (id, username, password, categoria, status, codigo, professor_id, createdAt, updatedAt)
SELECT
    UUID(),
    '1226388',
    '$2b$10$8WdI2Iok9q3XSJxPG5YsgOX4FkXZZCV81ATN3vk5b2WXCbi6R7Gs.',
    2,
    1,
    NULL,
    id,
    NOW(),
    NOW()
FROM professores
WHERE siape = '1226388'
LIMIT 1;

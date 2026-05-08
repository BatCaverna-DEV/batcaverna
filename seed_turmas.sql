SET NAMES utf8mb4;

SET @cal_id = UUID();

INSERT INTO calendarios (id, descricao, ano, semestre, status, inicio, fim, createdAt, updatedAt)
VALUES (@cal_id, '1º Semestre 2025', 2025, 1, 1, '2025-03-10', '2025-07-18', NOW(), NOW());

SET @ads = 'e89a6cc2-8973-4768-ab3e-4de4819cd97e';
SET @bad = '13364ac6-1a18-4890-82d4-8e4f380b8b64';
SET @tca = 'd7028f39-14ed-49dd-8cce-ce6f76873e12';
SET @tds = '98ec5a3b-a8c7-4b4d-bda8-f8c32dab440f';

-- Análise e Desenvolvimento de Sistemas
INSERT INTO turmas (id, codigo, descricao, status, curso_id, calendario_id, createdAt, updatedAt) VALUES
(UUID(), 'ADS-2025.1-1P', 'ADS — 1º Período 2025.1', 1, @ads, @cal_id, NOW(), NOW()),
(UUID(), 'ADS-2025.1-3P', 'ADS — 3º Período 2025.1', 1, @ads, @cal_id, NOW(), NOW()),
(UUID(), 'ADS-2025.1-5P', 'ADS — 5º Período 2025.1', 1, @ads, @cal_id, NOW(), NOW());

-- Bacharelado em Administração
INSERT INTO turmas (id, codigo, descricao, status, curso_id, calendario_id, createdAt, updatedAt) VALUES
(UUID(), 'BAD-2025.1-1P', 'Administração — 1º Período 2025.1', 1, @bad, @cal_id, NOW(), NOW()),
(UUID(), 'BAD-2025.1-3P', 'Administração — 3º Período 2025.1', 1, @bad, @cal_id, NOW(), NOW()),
(UUID(), 'BAD-2025.1-5P', 'Administração — 5º Período 2025.1', 1, @bad, @cal_id, NOW(), NOW());

-- Técnico em Administração
INSERT INTO turmas (id, codigo, descricao, status, curso_id, calendario_id, createdAt, updatedAt) VALUES
(UUID(), 'TCA-2025.1-1P', 'Técnico em Administração — 1º Período 2025.1', 1, @tca, @cal_id, NOW(), NOW()),
(UUID(), 'TCA-2025.1-2P', 'Técnico em Administração — 2º Período 2025.1', 1, @tca, @cal_id, NOW(), NOW()),
(UUID(), 'TCA-2025.1-3P', 'Técnico em Administração — 3º Período 2025.1', 1, @tca, @cal_id, NOW(), NOW());

-- Técnico em Desenvolvimento de Sistemas
INSERT INTO turmas (id, codigo, descricao, status, curso_id, calendario_id, createdAt, updatedAt) VALUES
(UUID(), 'TDS-2025.1-1P', 'Técnico em Desenvolvimento de Sistemas — 1º Período 2025.1', 1, @tds, @cal_id, NOW(), NOW()),
(UUID(), 'TDS-2025.1-2P', 'Técnico em Desenvolvimento de Sistemas — 2º Período 2025.1', 1, @tds, @cal_id, NOW(), NOW()),
(UUID(), 'TDS-2025.1-3P', 'Técnico em Desenvolvimento de Sistemas — 3º Período 2025.1', 1, @tds, @cal_id, NOW(), NOW());

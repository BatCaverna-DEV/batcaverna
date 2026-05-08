SET NAMES utf8mb4;

-- IDs das turmas
SET @ads1 = 'dcf6eea5-48ed-11f1-992c-d8cb8ad7fcbf'; -- ADS 1º Período
SET @ads3 = 'dcf6fc88-48ed-11f1-992c-d8cb8ad7fcbf'; -- ADS 3º Período
SET @ads5 = 'dcf6fd0c-48ed-11f1-992c-d8cb8ad7fcbf'; -- ADS 5º Período
SET @bad1 = 'dcf7b1bf-48ed-11f1-992c-d8cb8ad7fcbf'; -- BAD 1º Período
SET @bad3 = 'dcf7c157-48ed-11f1-992c-d8cb8ad7fcbf'; -- BAD 3º Período
SET @bad5 = 'dcf7c20b-48ed-11f1-992c-d8cb8ad7fcbf'; -- BAD 5º Período
SET @tca1 = 'dcf885b5-48ed-11f1-992c-d8cb8ad7fcbf'; -- TCA 1º Período
SET @tca2 = 'dcf8925d-48ed-11f1-992c-d8cb8ad7fcbf'; -- TCA 2º Período
SET @tca3 = 'dcf89323-48ed-11f1-992c-d8cb8ad7fcbf'; -- TCA 3º Período
SET @tds1 = 'dcf95fc2-48ed-11f1-992c-d8cb8ad7fcbf'; -- TDS 1º Período
SET @tds2 = 'dcf96e1a-48ed-11f1-992c-d8cb8ad7fcbf'; -- TDS 2º Período
SET @tds3 = 'dcf96ed3-48ed-11f1-992c-d8cb8ad7fcbf'; -- TDS 3º Período

-- IDs dos professores
SET @p01 = 'd541a369-48af-11f1-992c-d8cb8ad7fcbf'; -- Aecio da Silva Martins
SET @p02 = 'd54977b5-48af-11f1-992c-d8cb8ad7fcbf'; -- Alanny Silva Luz
SET @p03 = 'd5497a7c-48af-11f1-992c-d8cb8ad7fcbf'; -- Ana Karoline de Olivera Goncalves
SET @p04 = 'd5497bad-48af-11f1-992c-d8cb8ad7fcbf'; -- Ana Patricia de Andrade Ferreira
SET @p05 = 'd5497c2b-48af-11f1-992c-d8cb8ad7fcbf'; -- Ana Rayonara de Sousa Albuquerque
SET @p06 = 'd5497b28-48af-11f1-992c-d8cb8ad7fcbf'; -- Ananda Veloso Amorim Oliveira
SET @p07 = 'd5497c9c-48af-11f1-992c-d8cb8ad7fcbf'; -- Anderson Oliveira da Silva
SET @p08 = 'd5497f4e-48af-11f1-992c-d8cb8ad7fcbf'; -- Andre Wallas da Silva Sousa
SET @p09 = 'd5497e06-48af-11f1-992c-d8cb8ad7fcbf'; -- Andrea Lima Barros
SET @p10 = 'd5497e80-48af-11f1-992c-d8cb8ad7fcbf'; -- Andreia Mariana Araujo Machado
SET @p11 = 'd5497fc1-48af-11f1-992c-d8cb8ad7fcbf'; -- Annaya Assuncao Pereira Ribeiro
SET @p12 = 'd5498033-48af-11f1-992c-d8cb8ad7fcbf'; -- Bruno Vicente Alves de Lima
SET @p13 = 'd54980a2-48af-11f1-992c-d8cb8ad7fcbf'; -- Clarissa Maria Brito Lima
SET @p14 = 'd5498117-48af-11f1-992c-d8cb8ad7fcbf'; -- Diego Roberto Rodrigues Orsano
SET @p15 = 'd549818b-48af-11f1-992c-d8cb8ad7fcbf'; -- Diogo Vinicius de Sousa Silva
SET @p16 = 'd5498206-48af-11f1-992c-d8cb8ad7fcbf'; -- Douglas dos Santos Silva
SET @p17 = 'd5498278-48af-11f1-992c-d8cb8ad7fcbf'; -- Elcio Daniel Sousa Barros
SET @p18 = 'd54982f5-48af-11f1-992c-d8cb8ad7fcbf'; -- Erlan de Araujo Silva
SET @p19 = 'd5498365-48af-11f1-992c-d8cb8ad7fcbf'; -- Francicleia Vieira Ribeiro de Oliveira
SET @p20 = 'd54983fa-48af-11f1-992c-d8cb8ad7fcbf'; -- Francilio Benicio Santos de Moraes Trindade

-- ═══════════════════════════════════════════════════════════
-- ADS — 1º Período (disciplinas introdutórias)
-- ═══════════════════════════════════════════════════════════
INSERT INTO diarios (id, codigo, descricao, status, carga, ministrada, horario, professor_id, turma_id, createdAt, updatedAt) VALUES
(UUID(), 101, 'Algoritmos e Lógica de Programação',   1, 80, 30, '2M12/4M12', @p15, @ads1, NOW(), NOW()),
(UUID(), 102, 'Fundamentos de Sistemas de Informação',1, 40, 15, '3T12',      @p12, @ads1, NOW(), NOW()),
(UUID(), 103, 'Matemática Aplicada à Computação',     1, 80, 30, '2T34/5T34', @p01, @ads1, NOW(), NOW()),
(UUID(), 104, 'Comunicação e Expressão',              1, 40, 15, '6M12',      @p11, @ads1, NOW(), NOW()),
(UUID(), 105, 'Arquitetura de Computadores',          1, 60, 20, '3M12/5M12', @p18, @ads1, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════
-- ADS — 3º Período (disciplinas intermediárias)
-- ═══════════════════════════════════════════════════════════
INSERT INTO diarios (id, codigo, descricao, status, carga, ministrada, horario, professor_id, turma_id, createdAt, updatedAt) VALUES
(UUID(), 301, 'Programação Orientada a Objetos',      1, 80, 30, '2M12/4M12', @p15, @ads3, NOW(), NOW()),
(UUID(), 302, 'Banco de Dados',                       1, 80, 30, '3T12/5T12', @p12, @ads3, NOW(), NOW()),
(UUID(), 303, 'Engenharia de Software',               1, 60, 20, '2T34',      @p08, @ads3, NOW(), NOW()),
(UUID(), 304, 'Estruturas de Dados',                  1, 60, 20, '4M34/6M34', @p18, @ads3, NOW(), NOW()),
(UUID(), 305, 'Redes de Computadores',                1, 60, 20, '5T34',      @p07, @ads3, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════
-- ADS — 5º Período (disciplinas avançadas)
-- ═══════════════════════════════════════════════════════════
INSERT INTO diarios (id, codigo, descricao, status, carga, ministrada, horario, professor_id, turma_id, createdAt, updatedAt) VALUES
(UUID(), 501, 'Desenvolvimento Web',                  1, 80, 30, '2M12/4M12', @p12, @ads5, NOW(), NOW()),
(UUID(), 502, 'Sistemas Distribuídos',                1, 60, 20, '3T34',      @p15, @ads5, NOW(), NOW()),
(UUID(), 503, 'Gerência de Projetos de TI',           1, 60, 20, '5M12',      @p08, @ads5, NOW(), NOW()),
(UUID(), 504, 'Inteligência Artificial',              1, 60, 20, '2T12/4T12', @p18, @ads5, NOW(), NOW()),
(UUID(), 505, 'Trabalho de Conclusão de Curso I',     1, 80, 30, '6T12',      @p07, @ads5, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════
-- BAD — 1º Período (disciplinas introdutórias)
-- ═══════════════════════════════════════════════════════════
INSERT INTO diarios (id, codigo, descricao, status, carga, ministrada, horario, professor_id, turma_id, createdAt, updatedAt) VALUES
(UUID(), 110, 'Introdução à Administração',           1, 60, 20, '2M12/4M12', @p17, @bad1, NOW(), NOW()),
(UUID(), 111, 'Matemática para Administração',        1, 80, 30, '3T12/5T12', @p01, @bad1, NOW(), NOW()),
(UUID(), 112, 'Contabilidade Geral',                  1, 80, 30, '2T34',      @p13, @bad1, NOW(), NOW()),
(UUID(), 113, 'Fundamentos de Economia',              1, 60, 20, '5M34',      @p04, @bad1, NOW(), NOW()),
(UUID(), 114, 'Sociologia das Organizações',          1, 40, 15, '6M12',      @p05, @bad1, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════
-- BAD — 3º Período
-- ═══════════════════════════════════════════════════════════
INSERT INTO diarios (id, codigo, descricao, status, carga, ministrada, horario, professor_id, turma_id, createdAt, updatedAt) VALUES
(UUID(), 310, 'Gestão de Pessoas',                    1, 60, 20, '2M12/4M12', @p06, @bad3, NOW(), NOW()),
(UUID(), 311, 'Administração Financeira',             1, 80, 30, '3T12/5T12', @p13, @bad3, NOW(), NOW()),
(UUID(), 312, 'Marketing',                            1, 60, 20, '2T34',      @p04, @bad3, NOW(), NOW()),
(UUID(), 313, 'Direito Empresarial',                  1, 60, 20, '5M12',      @p05, @bad3, NOW(), NOW()),
(UUID(), 314, 'Estatística Aplicada',                 1, 80, 30, '6T12',      @p01, @bad3, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════
-- BAD — 5º Período
-- ═══════════════════════════════════════════════════════════
INSERT INTO diarios (id, codigo, descricao, status, carga, ministrada, horario, professor_id, turma_id, createdAt, updatedAt) VALUES
(UUID(), 510, 'Gestão Estratégica',                   1, 80, 30, '2M12/4M12', @p17, @bad5, NOW(), NOW()),
(UUID(), 511, 'Empreendedorismo e Inovação',          1, 60, 20, '3T12',      @p06, @bad5, NOW(), NOW()),
(UUID(), 512, 'Gestão de Operações e Logística',      1, 80, 30, '5T12/5T34', @p13, @bad5, NOW(), NOW()),
(UUID(), 513, 'Finanças Corporativas',                1, 80, 30, '2T34',      @p04, @bad5, NOW(), NOW()),
(UUID(), 514, 'Responsabilidade Social Empresarial',  1, 40, 15, '6M12',      @p05, @bad5, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════
-- TCA — 1º Período
-- ═══════════════════════════════════════════════════════════
INSERT INTO diarios (id, codigo, descricao, status, carga, ministrada, horario, professor_id, turma_id, createdAt, updatedAt) VALUES
(UUID(), 121, 'Introdução à Administração',           1, 60, 20, '2N12/4N12', @p17, @tca1, NOW(), NOW()),
(UUID(), 122, 'Informática Básica',                   1, 40, 15, '3N12',      @p16, @tca1, NOW(), NOW()),
(UUID(), 123, 'Matemática Financeira',                1, 60, 20, '5N12',      @p01, @tca1, NOW(), NOW()),
(UUID(), 124, 'Comunicação Empresarial',              1, 40, 15, '6N12',      @p11, @tca1, NOW(), NOW()),
(UUID(), 125, 'Técnicas de Atendimento ao Cliente',   1, 40, 15, '2N34',      @p02, @tca1, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════
-- TCA — 2º Período
-- ═══════════════════════════════════════════════════════════
INSERT INTO diarios (id, codigo, descricao, status, carga, ministrada, horario, professor_id, turma_id, createdAt, updatedAt) VALUES
(UUID(), 221, 'Gestão de Recursos Humanos',           1, 60, 20, '2N12/4N12', @p06, @tca2, NOW(), NOW()),
(UUID(), 222, 'Gestão Financeira',                    1, 80, 30, '3N12/5N12', @p13, @tca2, NOW(), NOW()),
(UUID(), 223, 'Legislação Trabalhista',               1, 60, 20, '6N12',      @p05, @tca2, NOW(), NOW()),
(UUID(), 224, 'Marketing e Vendas',                   1, 60, 20, '2N34',      @p04, @tca2, NOW(), NOW()),
(UUID(), 225, 'Empreendedorismo',                     1, 40, 15, '4N34',      @p17, @tca2, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════
-- TCA — 3º Período
-- ═══════════════════════════════════════════════════════════
INSERT INTO diarios (id, codigo, descricao, status, carga, ministrada, horario, professor_id, turma_id, createdAt, updatedAt) VALUES
(UUID(), 321, 'Gestão de Projetos',                   1, 60, 20, '2N12/4N12', @p17, @tca3, NOW(), NOW()),
(UUID(), 322, 'Logística e Cadeia de Suprimentos',    1, 60, 20, '3N12',      @p08, @tca3, NOW(), NOW()),
(UUID(), 323, 'Gestão da Qualidade',                  1, 60, 20, '5N12',      @p06, @tca3, NOW(), NOW()),
(UUID(), 324, 'Ética e Legislação Profissional',      1, 40, 15, '6N12',      @p05, @tca3, NOW(), NOW()),
(UUID(), 325, 'Estágio Supervisionado',               1, 80, 30, '2N34/4N34', @p13, @tca3, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════
-- TDS — 1º Período
-- ═══════════════════════════════════════════════════════════
INSERT INTO diarios (id, codigo, descricao, status, carga, ministrada, horario, professor_id, turma_id, createdAt, updatedAt) VALUES
(UUID(), 131, 'Algoritmos e Programação',             1, 80, 30, '2N12/4N12', @p15, @tds1, NOW(), NOW()),
(UUID(), 132, 'Fundamentos de Informática',           1, 40, 15, '3N12',      @p16, @tds1, NOW(), NOW()),
(UUID(), 133, 'Banco de Dados I',                     1, 60, 20, '5N12',      @p12, @tds1, NOW(), NOW()),
(UUID(), 134, 'Lógica de Programação',                1, 80, 30, '6N12/6N34', @p18, @tds1, NOW(), NOW()),
(UUID(), 135, 'Inglês Técnico',                       1, 40, 15, '2N34',      @p09, @tds1, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════
-- TDS — 2º Período
-- ═══════════════════════════════════════════════════════════
INSERT INTO diarios (id, codigo, descricao, status, carga, ministrada, horario, professor_id, turma_id, createdAt, updatedAt) VALUES
(UUID(), 231, 'Programação Web',                      1, 80, 30, '2N12/4N12', @p12, @tds2, NOW(), NOW()),
(UUID(), 232, 'Banco de Dados II',                    1, 60, 20, '3N12/3N34', @p15, @tds2, NOW(), NOW()),
(UUID(), 233, 'Programação Orientada a Objetos',      1, 80, 30, '5N12/5N34', @p18, @tds2, NOW(), NOW()),
(UUID(), 234, 'Sistemas Operacionais',                1, 60, 20, '6N12',      @p07, @tds2, NOW(), NOW()),
(UUID(), 235, 'Redes de Computadores',                1, 60, 20, '2N34',      @p08, @tds2, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════
-- TDS — 3º Período
-- ═══════════════════════════════════════════════════════════
INSERT INTO diarios (id, codigo, descricao, status, carga, ministrada, horario, professor_id, turma_id, createdAt, updatedAt) VALUES
(UUID(), 331, 'Desenvolvimento de Aplicações Mobile', 1, 80, 30, '2N12/4N12', @p12, @tds3, NOW(), NOW()),
(UUID(), 332, 'Frameworks e Arquitetura Web',         1, 60, 20, '3N12',      @p15, @tds3, NOW(), NOW()),
(UUID(), 333, 'Segurança da Informação',              1, 60, 20, '5N12',      @p07, @tds3, NOW(), NOW()),
(UUID(), 334, 'Gestão de Projetos de Software',       1, 60, 20, '6N12',      @p08, @tds3, NOW(), NOW()),
(UUID(), 335, 'Estágio Supervisionado',               1, 80, 30, '2N34/4N34', @p18, @tds3, NOW(), NOW());

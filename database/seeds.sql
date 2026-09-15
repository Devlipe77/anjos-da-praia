-- ==========================================================
-- PROJETO: Anjos da Praia (Hackathon Anhanguera 2026.2)
-- SCRIPT DE INSERTS EXEMPLARES PARA GUARAPARI - ES
-- ==========================================================

-- 1. Inserção de Tendas / Postos Oficiais na Orla
INSERT INTO tendas (nome, praia, latitude, longitude, responsavel_posto, telefone_posto, ativa)
VALUES
  ('Tenda 01 - Posto Central', 'Praia do Morro', -20.6590, -40.4950, 'Sargento Bombeiro Marcos', '(27) 99777-1001', true),
  ('Tenda 02 - Pedra do Siribeira', 'Praia do Morro', -20.6525, -40.4850, 'Coordenadora Camila Silva', '(27) 99777-1002', true),
  ('Tenda 03 - Posto das Castanheiras', 'Praia das Castanheiras', -20.6720, -40.4975, 'Voluntário Lucas Costa', '(27) 99777-1003', true),
  ('Tenda 04 - Posto Areia Preta', 'Praia da Areia Preta', -20.6765, -40.5005, 'Guarda-Vidas Rafael', '(27) 99777-1004', true)
ON CONFLICT DO NOTHING;

-- 2. Inserção de Pulseiras Cadastradas
INSERT INTO cadastros_pulseiras (numero_pulseira, nome_responsavel, telefone_contato, nome_crianca, praia_origem, observacoes, ativo)
VALUES
  ('1001', 'Mariana Souza', '(27) 99876-5432', 'Lucas Souza (5 anos)', 'Praia do Morro', 'Bermuda azul e camiseta amarela de proteção UV', true),
  ('1002', 'Carlos Eduardo Lima', '(27) 98112-3344', 'Sofia Lima (4 anos)', 'Praia das Castanheiras', 'Maiô rosa com laço e chapéu de sol', true),
  ('1003', 'Renata Vasconcelos', '(27) 99988-7766', 'Bernardo Vasconcelos (6 anos)', 'Praia do Morro', 'Sunga vermelha e boné dos Vingadores', true),
  ('1004', 'Fernanda Ribeiro', '(27) 99765-4321', 'Alice Ribeiro (3 anos)', 'Praia da Areia Preta', 'Biquíni verde água com flores', true),
  ('1005', 'Rodrigo Mendes', '(27) 99222-1133', 'Enzo Gabriel (7 anos)', 'Praia do Morro', 'Sunga azul marinho e óculos de natação', true)
ON CONFLICT (numero_pulseira) DO UPDATE SET
  nome_responsavel = EXCLUDED.nome_responsavel,
  telefone_contato = EXCLUDED.telefone_contato,
  nome_crianca = EXCLUDED.nome_crianca,
  observacoes = EXCLUDED.observacoes;

-- 3. Inserção de Ocorrências com Diferentes Status Operacionais
INSERT INTO ocorrencias (numero_pulseira, latitude, longitude, precisao_metros, status, atendido_por, horario_alerta, finalizada_em)
VALUES
  ('1001', -20.6552, -40.4878, 6.5, 'Criança localizada', NULL, NOW() - INTERVAL '8 minutes', NULL),
  ('1003', -20.6575, -40.4920, 8.0, 'Equipe a caminho', 'Socorrista Marcos', NOW() - INTERVAL '22 minutes', NULL),
  ('1002', -20.6730, -40.4982, 5.0, 'Reencontro realizado', 'Voluntário Lucas', NOW() - INTERVAL '95 minutes', NOW() - INTERVAL '89 minutes')
ON CONFLICT DO NOTHING;

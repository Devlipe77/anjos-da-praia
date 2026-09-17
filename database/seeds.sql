-- ==========================================================
-- PROJETO: Anjos da Praia (Hackathon Anhanguera 2026.2)
-- SCRIPT DE SEED COMPLETO E REALISTA PARA TESTES EM GUARAPARI-ES
-- Atualizado com todas as 5 etapas da operação e histórico auditado
-- ==========================================================

-- 1. Inserção / Atualização de Praias Oficiais de Guarapari
INSERT INTO praias (nome, regiao, latitude_padrao, longitude_padrao)
VALUES
  ('Praia do Morro', 'Norte', -20.6552, -40.4880),
  ('Praia das Castanheiras', 'Centro', -20.6720, -40.4975),
  ('Praia dos Namorados', 'Centro', -20.6710, -40.4960),
  ('Praia da Areia Preta', 'Centro', -20.6765, -40.5005),
  ('Praia de Meaípe', 'Meaípe', -20.7420, -40.5280),
  ('Praia de Bacutia', 'Enseada Azul', -20.7180, -40.5210),
  ('Praia de Peracanga', 'Enseada Azul', -20.7120, -40.5190),
  ('Praia de Setiba', 'Setiba', -20.6120, -40.4500),
  ('Praia de Setibão', 'Setiba', -20.6020, -40.4410)
ON CONFLICT (nome) DO UPDATE SET
  regiao = EXCLUDED.regiao,
  latitude_padrao = EXCLUDED.latitude_padrao,
  longitude_padrao = EXCLUDED.longitude_padrao;

-- 2. Inserção de Postos / Tendas Oficiais na Orla
INSERT INTO tendas (nome, praia, latitude, longitude, responsavel_posto, telefone_posto, ativa)
VALUES
  ('Tenda 01 - Posto Central', 'Praia do Morro', -20.6590, -40.4950, 'Sargento Bombeiro Marcos', '(27) 99777-1001', true),
  ('Tenda 02 - Pedra do Siribeira', 'Praia do Morro', -20.6525, -40.4850, 'Coordenadora Camila Silva', '(27) 99777-1002', true),
  ('Tenda 03 - Posto das Castanheiras', 'Praia das Castanheiras', -20.6720, -40.4975, 'Voluntário Lucas Costa', '(27) 99777-1003', true),
  ('Tenda 04 - Posto Areia Preta', 'Praia da Areia Preta', -20.6765, -40.5005, 'Guarda-Vidas Rafael', '(27) 99777-1004', true),
  ('Tenda 05 - Posto Bacutia', 'Praia de Bacutia', -20.7180, -40.5210, 'Bombeiro Militar Juliana', '(27) 99777-1005', true),
  ('Tenda 06 - Posto Meaípe', 'Praia de Meaípe', -20.7420, -40.5280, 'Voluntário Gabriel Santos', '(27) 99777-1006', true)
ON CONFLICT DO NOTHING;

-- 3. Inserção de Cadastros de Pulseiras
INSERT INTO cadastros_pulseiras (numero_pulseira, nome_responsavel, telefone_contato, nome_crianca, praia_origem, observacoes, ativo)
VALUES
  ('1001', 'Mariana Souza', '(27) 99876-5432', 'Lucas Souza (5 anos)', 'Praia do Morro', 'Bermuda azul e camiseta amarela de proteção UV', true),
  ('1002', 'Carlos Eduardo Lima', '(27) 98112-3344', 'Sofia Lima (4 anos)', 'Praia das Castanheiras', 'Maiô rosa com laço e chapéu de sol', true),
  ('1003', 'Renata Vasconcelos', '(27) 99988-7766', 'Bernardo Vasconcelos (6 anos)', 'Praia do Morro', 'Sunga vermelha e boné dos Vingadores', true),
  ('1004', 'Fernanda Ribeiro', '(27) 99765-4321', 'Alice Ribeiro (3 anos)', 'Praia da Areia Preta', 'Biquíni verde água com flores', true),
  ('1005', 'Rodrigo Mendes', '(27) 99222-1133', 'Enzo Gabriel (7 anos)', 'Praia do Morro', 'Sunga azul marinho e óculos de natação', true),
  ('1006', 'Patrícia Alvarenga', '(27) 99333-4455', 'Manuela Alvarenga (4 anos)', 'Praia de Bacutia', 'Maiô lilás com estampa de sereia', true),
  ('1007', 'Guilherme Peixoto', '(27) 99654-7890', 'Pedro Henrique (8 anos)', 'Praia de Meaípe', 'Bermuda camuflada verde e protetor solar no nariz', true)
ON CONFLICT (numero_pulseira) DO UPDATE SET
  nome_responsavel = EXCLUDED.nome_responsavel,
  telefone_contato = EXCLUDED.telefone_contato,
  nome_crianca = EXCLUDED.nome_crianca,
  praia_origem = EXCLUDED.praia_origem,
  observacoes = EXCLUDED.observacoes;

-- 4. Inserção de Ocorrências cobrindo todas as 5 situações com histórico de auditoria (Trilha)
-- Limpa ocorrências de teste dessas pulseiras antes de recriar com as etapas atualizadas
DELETE FROM ocorrencias WHERE numero_pulseira IN ('1001', '1002', '1003', '1004', '1005', '1006', '1007');

-- 4.1. Situação 1: "Criança localizada" (Alerta recente registrado via QR Code pelo banhista)
INSERT INTO ocorrencias (
  numero_pulseira,
  latitude,
  longitude,
  precisao_metros,
  status,
  horario_alerta,
  atendido_por,
  notas_atendimento,
  historico_status
)
VALUES (
  '1001',
  -20.6552,
  -40.4878,
  5.5,
  'Criança localizada',
  NOW() - INTERVAL '6 minutes',
  NULL,
  'Banhista acionou socorro via QR Code próximo ao quiosque 14.',
  jsonb_build_array(
    jsonb_build_object(
      'status', 'Criança localizada',
      'data', (NOW() - INTERVAL '6 minutes')::text,
      'operador', 'Sistema (QR Code / Banhista)'
    )
  )
);

-- 4.2. Situação 2: "Equipe a caminho" (Guarda-vidas ou voluntário deslocando para o ponto GPS)
INSERT INTO ocorrencias (
  numero_pulseira,
  latitude,
  longitude,
  precisao_metros,
  status,
  horario_alerta,
  atendido_por,
  notas_atendimento,
  historico_status
)
VALUES (
  '1003',
  -20.6575,
  -40.4920,
  7.0,
  'Equipe a caminho',
  NOW() - INTERVAL '18 minutes',
  'Sargento Bombeiro Marcos',
  'Equipe deslocando de quadriciclo pela faixa de areia.',
  jsonb_build_array(
    jsonb_build_object(
      'status', 'Criança localizada',
      'data', (NOW() - INTERVAL '18 minutes')::text,
      'operador', 'Sistema (QR Code / Banhista)'
    ),
    jsonb_build_object(
      'status', 'Equipe a caminho',
      'data', (NOW() - INTERVAL '14 minutes')::text,
      'operador', 'Sargento Bombeiro Marcos'
    )
  )
);

-- 4.3. Situação 3: "Criança recebida" (Criança na tenda em segurança com hidratação)
INSERT INTO ocorrencias (
  numero_pulseira,
  latitude,
  longitude,
  precisao_metros,
  status,
  horario_alerta,
  atendido_por,
  notas_atendimento,
  historico_status
)
VALUES (
  '1004',
  -20.6760,
  -40.5002,
  4.0,
  'Criança recebida',
  NOW() - INTERVAL '35 minutes',
  'Guarda-Vidas Rafael',
  'Menina acolhida na Tenda 04 - Posto Areia Preta, hidratada e calma.',
  jsonb_build_array(
    jsonb_build_object(
      'status', 'Criança localizada',
      'data', (NOW() - INTERVAL '35 minutes')::text,
      'operador', 'Sistema (QR Code / Banhista)'
    ),
    jsonb_build_object(
      'status', 'Equipe a caminho',
      'data', (NOW() - INTERVAL '30 minutes')::text,
      'operador', 'Guarda-Vidas Rafael'
    ),
    jsonb_build_object(
      'status', 'Criança recebida',
      'data', (NOW() - INTERVAL '22 minutes')::text,
      'operador', 'Guarda-Vidas Rafael'
    )
  )
);

-- 4.4. Situação 4: "Responsáveis localizados" (Pais contatados e a caminho do posto)
INSERT INTO ocorrencias (
  numero_pulseira,
  latitude,
  longitude,
  precisao_metros,
  status,
  horario_alerta,
  atendido_por,
  notas_atendimento,
  historico_status
)
VALUES (
  '1006',
  -20.7185,
  -40.5215,
  6.0,
  'Responsáveis localizados',
  NOW() - INTERVAL '45 minutes',
  'Bombeiro Militar Juliana',
  'Mãe contatada por telefone; está a 200 metros caminhando até a tenda.',
  jsonb_build_array(
    jsonb_build_object(
      'status', 'Criança localizada',
      'data', (NOW() - INTERVAL '45 minutes')::text,
      'operador', 'Sistema (QR Code / Banhista)'
    ),
    jsonb_build_object(
      'status', 'Equipe a caminho',
      'data', (NOW() - INTERVAL '40 minutes')::text,
      'operador', 'Bombeiro Militar Juliana'
    ),
    jsonb_build_object(
      'status', 'Criança recebida',
      'data', (NOW() - INTERVAL '32 minutes')::text,
      'operador', 'Bombeiro Militar Juliana'
    ),
    jsonb_build_object(
      'status', 'Responsáveis localizados',
      'data', (NOW() - INTERVAL '20 minutes')::text,
      'operador', 'Bombeiro Militar Juliana'
    )
  )
);

-- 4.5. Situação 5: "Reencontro realizado" (Operação concluída com sucesso com pai/mãe)
INSERT INTO ocorrencias (
  numero_pulseira,
  latitude,
  longitude,
  precisao_metros,
  status,
  horario_alerta,
  finalizada_em,
  atendido_por,
  notas_atendimento,
  historico_status
)
VALUES (
  '1002',
  -20.6728,
  -40.4980,
  4.5,
  'Reencontro realizado',
  NOW() - INTERVAL '80 minutes',
  NOW() - INTERVAL '15 minutes',
  'Voluntário Lucas Costa',
  'Reencontro emocionante concluído com o pai Carlos Eduardo na Tenda 03.',
  jsonb_build_array(
    jsonb_build_object(
      'status', 'Criança localizada',
      'data', (NOW() - INTERVAL '80 minutes')::text,
      'operador', 'Sistema (QR Code / Banhista)'
    ),
    jsonb_build_object(
      'status', 'Equipe a caminho',
      'data', (NOW() - INTERVAL '72 minutes')::text,
      'operador', 'Voluntário Lucas Costa'
    ),
    jsonb_build_object(
      'status', 'Criança recebida',
      'data', (NOW() - INTERVAL '60 minutes')::text,
      'operador', 'Voluntário Lucas Costa'
    ),
    jsonb_build_object(
      'status', 'Responsáveis localizados',
      'data', (NOW() - INTERVAL '40 minutes')::text,
      'operador', 'Voluntário Lucas Costa'
    ),
    jsonb_build_object(
      'status', 'Reencontro realizado',
      'data', (NOW() - INTERVAL '15 minutes')::text,
      'operador', 'Voluntário Lucas Costa'
    )
  )
);

-- 5. Inserção de Convites Temporais de Teste (Ativo e Expirado para teste de validação)
INSERT INTO convites_operador (codigo, tenda_id, role, usos_maximos, usos_atuais, expira_em)
VALUES
  ('ANJOS-TESTE', NULL, 'operador', 5, 1, NOW() + INTERVAL '24 hours'),
  ('ANJOS-EXPIRA', NULL, 'operador', 1, 0, NOW() - INTERVAL '2 hours')
ON CONFLICT (codigo) DO UPDATE SET
  expira_em = EXCLUDED.expira_em,
  usos_maximos = EXCLUDED.usos_maximos;

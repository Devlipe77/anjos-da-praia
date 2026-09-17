-- ==========================================================
-- PROJETO: Anjos da Praia (Hackathon Anhanguera 2026.2)
-- SCRIPT DE SEED COMPLETO E REALISTA PARA TESTES EM GUARAPARI-ES
-- Atualizado com todas as 5 etapas da operação e histórico auditado
-- ==========================================================

-- 1. Inserção / Atualização Completa de Praias Oficiais de Guarapari (31 Praias)
INSERT INTO praias (id, nome, regiao, latitude_padrao, longitude_padrao, criado_em) VALUES 
  ('05564c03-5bab-40b3-b1b1-df2e5b2e82aa', 'Praia da Areia Preta', 'Centro', -20.6765000, -40.5005000, '2026-09-16 02:52:28.164027+00'), 
  ('13942bfa-678c-4726-9754-a1abda8e3bbe', 'Praia de Ubu (Divisa)', 'Sul', -20.7890000, -40.5750000, '2026-09-16 02:52:28.164027+00'), 
  ('16456a11-ba40-4822-86ce-23a24f8ae040', 'Praia do Ermitão', 'Morro da Pescaria', -20.6500000, -40.4740000, '2026-09-16 02:52:28.164027+00'), 
  ('1e82e2fd-c61e-4399-8115-4bff49257185', 'Praia do Riacho', 'Ipiranga', -20.6900000, -40.5120000, '2026-09-16 02:52:28.164027+00'), 
  ('225c02c0-6782-4b53-b928-748cd38aad77', 'Prainha de Muquiçaba', 'Muquiçaba', -20.6610000, -40.5040000, '2026-09-16 02:52:28.164027+00'), 
  ('263dffd4-3e92-4d9f-aab9-0a909e70f8b6', 'Praia de Porto Grande', 'Sul', -20.7620000, -40.5420000, '2026-09-16 02:52:28.164027+00'), 
  ('275217bc-1fbf-43bc-b7e6-d92df9a0e039', 'Praia das Virtudes', 'Centro', -20.6701000, -40.4948000, '2026-09-16 02:52:28.164027+00'), 
  ('2b818a83-a6e2-4507-b018-1d6a569c39c6', 'Praia da Areia Vermelha', 'Morro da Pescaria', -20.6520000, -40.4760000, '2026-09-16 02:52:28.164027+00'), 
  ('2f180d0f-e210-4852-9180-4b73c0d31612', 'Praia de Maimbá', 'Sul', -20.7550000, -40.5350000, '2026-09-16 02:52:28.164027+00'), 
  ('33afd2dd-3a07-415e-bf6c-93128aa68e82', 'Praia de Setibão', 'Setiba', -20.6020000, -40.4410000, '2026-09-16 02:52:28.164027+00'), 
  ('3c0a0a82-4cf3-4a54-b3da-bbc14f2a713e', 'Praia da Cerca', 'Norte', -20.6480000, -40.4820000, '2026-09-16 02:52:28.164027+00'), 
  ('42344c89-d266-4ca7-98cd-c618df85ea08', 'Praia de Mucunã', 'Enseada Azul', -20.7095000, -40.5175000, '2026-09-16 02:52:28.164027+00'), 
  ('4b8ebf4e-d17f-425a-85e9-2ed2ab6c1747', 'Praia de Setiba', 'Setiba', -20.6120000, -40.4500000, '2026-09-16 02:52:28.164027+00'), 
  ('50984e18-eeb8-429e-882e-e25cf61d92dc', 'Praia de Setiba Pina', 'Setiba', -20.6080000, -40.4460000, '2026-09-16 02:52:28.164027+00'), 
  ('5f3282f2-ed4a-4997-bd0a-186cf7f89f2c', 'Praia de Una', 'Norte', -20.6297222, -40.4458333, '2026-09-16 02:52:28.164027+00'), 
  ('6c6be559-32c2-4e14-b084-04c98a95dddb', 'Praia de Mateus Lopes', 'Norte', -20.6360000, -40.4710000, '2026-09-16 02:52:28.164027+00'), 
  ('6fb4eb93-649f-4599-a38c-ac169b9cff4b', 'Prainha dos Pescadores', 'Morro da Pescaria', -20.6560000, -40.4810000, '2026-09-16 02:52:28.164027+00'), 
  ('822c697e-1411-4aa0-8d3f-b03ee83596f4', 'Praia das Castanheiras', 'Centro', -20.6720000, -40.4975000, '2026-09-16 02:52:28.164027+00'), 
  ('8e295970-6350-4ccb-ab55-46dcec8a4264', 'Praia de Peracanga', 'Enseada Azul', -20.7130000, -40.5190000, '2026-09-16 02:52:28.164027+00'), 
  ('941362e7-e344-4239-89e1-ec2869d2820a', 'Praia do Morro', 'Praia do Morro', -20.6552000, -40.4880000, '2026-09-16 02:52:28.164027+00'), 
  ('a3098f73-dc5c-43fc-8b0a-faf5676be85a', 'Praia de Bacutia', 'Enseada Azul', -20.7180000, -40.5210000, '2026-09-16 02:52:28.164027+00'), 
  ('a49b8cde-6c39-4c5e-9eef-7c193ba17956', 'Praia do Meio', 'Centro', -20.6740000, -40.4990000, '2026-09-16 02:52:28.164027+00'), 
  ('aa130629-1043-40b2-8dee-bde5e652db04', 'Praia de Santa Mônica', 'Santa Mônica', -20.6280000, -40.4680000, '2026-09-16 02:52:28.164027+00'), 
  ('af74ea41-bdba-4feb-b384-04d0dfab2484', 'Praia dos Padres', 'Enseada Azul', -20.7230000, -40.5240000, '2026-09-16 02:52:28.164027+00'), 
  ('cb2343a2-1609-4539-8087-3f6af72ebff6', 'Praia dos Adventistas', 'Norte', -20.6330000, -40.4690000, '2026-09-16 02:52:28.164027+00'), 
  ('d630c5b3-8708-45dc-9e96-839b9f7377ec', 'Praia da Fonte', 'Centro', -20.6715000, -40.4935000, '2026-09-16 02:52:28.164027+00'), 
  ('d6ca365b-b837-4b6e-a09b-21097cc8d046', 'Praia de Guaibura', 'Enseada Azul', -20.7070000, -40.5160000, '2026-09-16 02:52:28.164027+00'), 
  ('e4302ca0-e18c-4074-b6da-0317cdcc50ab', 'Praia do Morcego', 'Norte', -20.6410000, -40.4750000, '2026-09-16 02:52:28.164027+00'), 
  ('eb18ce18-1b04-46f0-a579-5d620424fbc6', 'Praia dos Namorados', 'Centro', -20.6708000, -40.4962000, '2026-09-16 02:52:28.164027+00'), 
  ('f1be92ef-3f7a-49b4-98da-85966b8828ff', 'Praia de Meaípe', 'Meaípe', -20.7420000, -40.5280000, '2026-09-16 02:52:28.164027+00'), 
  ('f43c13e4-146f-4ffa-a262-f6499b310c00', 'Praia da Raposa', 'Morro da Pescaria', -20.6540000, -40.4790000, '2026-09-16 02:52:28.164027+00'), 
  ('fc31e6de-1c58-49b0-82f5-26937f0e828a', 'Três Praias', 'Norte', -20.6380000, -40.4720000, '2026-09-16 02:52:28.164027+00')
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
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

-- ==========================================================
-- PROJETO: Anjos da Praia (Desafio 3 - Hackathon Anhanguera 2026.2)
-- SCRIPT DDL OFICIAL DE CRIAÇÃO DO BANCO NO SUPABASE (PRODUÇÃO)
-- Sem dados mockados: cadastros e autenticação 100% reais
-- ==========================================================

-- 1. Tabela de Tendas / Postos de Apoio na Orla
CREATE TABLE IF NOT EXISTS tendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  praia VARCHAR(80) NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  responsavel_posto VARCHAR(100),
  telefone_posto VARCHAR(20),
  ativa BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Cadastros de Pulseiras
CREATE TABLE IF NOT EXISTS cadastros_pulseiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pulseira VARCHAR(20) NOT NULL UNIQUE,
  nome_responsavel VARCHAR(100) NOT NULL,
  telefone_contato VARCHAR(20) NOT NULL,
  nome_crianca VARCHAR(80),
  praia_origem VARCHAR(80) DEFAULT 'Praia do Morro',
  observacoes TEXT,
  tenda_id UUID REFERENCES tendas(id) ON DELETE SET NULL,
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ativo BOOLEAN DEFAULT TRUE
);

-- 3. Tabela de Ocorrências (Disparadas via QR Code pelo banhista)
CREATE TABLE IF NOT EXISTS ocorrencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pulseira VARCHAR(20) NOT NULL REFERENCES cadastros_pulseiras(numero_pulseira) ON DELETE CASCADE,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  precisao_metros NUMERIC(8, 2) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'Criança localizada' CHECK (
    status IN ('Criança localizada', 'Equipe a caminho', 'Criança recebida', 'Responsáveis localizados', 'Reencontro realizado')
  ),
  horario_alerta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finalizada_em TIMESTAMP WITH TIME ZONE,
  atendido_por VARCHAR(100),
  notas_atendimento TEXT,
  tenda_atendimento_id UUID REFERENCES tendas(id) ON DELETE SET NULL
);

-- 4. Tabela de Perfil de Operadores da Tenda (vinculada ao Supabase Auth)
CREATE TABLE IF NOT EXISTS operadores (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120),
  tenda_id UUID REFERENCES tendas(id) ON DELETE SET NULL,
  role VARCHAR(30) DEFAULT 'operador',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Índices para agilidade e buscas instantâneas
CREATE INDEX IF NOT EXISTS idx_pulseira_numero ON cadastros_pulseiras(numero_pulseira);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_pulseira ON ocorrencias(numero_pulseira);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_status ON ocorrencias(status);
CREATE INDEX IF NOT EXISTS idx_tendas_ativa ON tendas(ativa);

-- 6. Habilitar Realtime para escuta em tempo real no dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE ocorrencias;
ALTER PUBLICATION supabase_realtime ADD TABLE cadastros_pulseiras;
ALTER PUBLICATION supabase_realtime ADD TABLE tendas;

-- 7. Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE tendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadastros_pulseiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE operadores ENABLE ROW LEVEL SECURITY;

-- Políticas para Tendas
DROP POLICY IF EXISTS "Leitura de tendas" ON tendas;
CREATE POLICY "Leitura de tendas" ON tendas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gerenciamento de tendas" ON tendas;
CREATE POLICY "Gerenciamento de tendas" ON tendas FOR ALL USING (true);

-- Políticas para Cadastros de Pulseiras (Operadores autenticados e API da tenda)
DROP POLICY IF EXISTS "Acesso a cadastros de pulseiras" ON cadastros_pulseiras;
CREATE POLICY "Acesso a cadastros de pulseiras" ON cadastros_pulseiras FOR ALL USING (true);

-- Políticas para Ocorrências:
-- Banhista anônimo pode inserir chamado via QR Code
DROP POLICY IF EXISTS "Banhista pode inserir ocorrencia" ON ocorrencias;
CREATE POLICY "Banhista pode inserir ocorrencia" ON ocorrencias FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura de ocorrencias" ON ocorrencias;
CREATE POLICY "Leitura de ocorrencias" ON ocorrencias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Atualizacao e exclusao de ocorrencias" ON ocorrencias;
CREATE POLICY "Atualizacao e exclusao de ocorrencias" ON ocorrencias FOR ALL USING (true);

-- Políticas para Operadores
DROP POLICY IF EXISTS "Acesso operadores" ON operadores;
CREATE POLICY "Acesso operadores" ON operadores FOR ALL USING (true);

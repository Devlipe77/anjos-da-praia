-- ==========================================================
-- PROJETO: Anjos da Praia (Desafio 3 - Hackathon Anhanguera 2026.2)
-- SCRIPT DDL OFICIAL DE CRIAÇÃO DO BANCO NO SUPABASE
-- ==========================================================

-- 1. Tabela de Cadastros efetuados pela equipe nas tendas da praia
CREATE TABLE IF NOT EXISTS cadastros_pulseiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pulseira VARCHAR(20) NOT NULL UNIQUE,
  nome_responsavel VARCHAR(100) NOT NULL,
  telefone_contato VARCHAR(20) NOT NULL,
  nome_crianca VARCHAR(80),
  praia_origem VARCHAR(60) DEFAULT 'Praia do Morro - Guarapari',
  observacoes TEXT,
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ativo BOOLEAN DEFAULT TRUE
);

-- 2. Tabela de Ocorrências disparadas pelo banhista via QR Code
CREATE TABLE IF NOT EXISTS ocorrencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pulseira VARCHAR(20) NOT NULL REFERENCES cadastros_pulseiras(numero_pulseira) ON DELETE CASCADE,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  precisao_metros NUMERIC(8, 2) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'Criança localizada' CHECK (
    status IN ('Criança localizada', 'Equipe a caminho', 'Criança recebida', 'Reencontro realizado')
  ),
  horario_alerta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finalizada_em TIMESTAMP WITH TIME ZONE,
  atendido_por VARCHAR(80)
);

-- 3. Índices para agilidade operacional na busca da tenda
CREATE INDEX IF NOT EXISTS idx_pulseira_numero ON cadastros_pulseiras(numero_pulseira);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_pulseira ON ocorrencias(numero_pulseira);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_status ON ocorrencias(status);

-- 4. Habilitar replicação em tempo real no Supabase (Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE ocorrencias;

-- 5. Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE cadastros_pulseiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;

-- O banhista anônimo via QR Code precisa conseguir inserir o alerta sem estar logado
DROP POLICY IF EXISTS "Permitir inserção anônima de alertas" ON ocorrencias;
CREATE POLICY "Permitir inserção anônima de alertas" 
  ON ocorrencias FOR INSERT TO anon 
  WITH CHECK (true);

-- Permitir leitura de ocorrências para usuários da tenda (ou banhista consultar confirmação do seu chamado)
DROP POLICY IF EXISTS "Permitir leitura de ocorrências" ON ocorrencias;
CREATE POLICY "Permitir leitura de ocorrências" 
  ON ocorrencias FOR SELECT 
  USING (true);

-- Permitir atualização de ocorrências para autenticados e operadores da tenda
DROP POLICY IF EXISTS "Permitir atualização de ocorrências" ON ocorrencias;
CREATE POLICY "Permitir atualização de ocorrências" 
  ON ocorrencias FOR UPDATE 
  USING (true);

-- Cadastro de pulseiras: apenas para leitura/escrita da equipe
DROP POLICY IF EXISTS "Acesso total cadastros para anon e autenticados em desenvolvimento" ON cadastros_pulseiras;
CREATE POLICY "Acesso total cadastros para anon e autenticados em desenvolvimento" 
  ON cadastros_pulseiras FOR ALL 
  USING (true);

-- ==========================================================
-- DADOS DE TESTE INICIAIS (Opcional - Praia do Morro, Guarapari)
-- ==========================================================
INSERT INTO cadastros_pulseiras (numero_pulseira, nome_responsavel, telefone_contato, nome_crianca, praia_origem)
VALUES 
  ('1001', 'Mariana Souza', '(27) 99876-5432', 'Lucas Souza', 'Praia do Morro - Guarapari'),
  ('1002', 'Carlos Eduardo Lima', '(27) 98112-3344', 'Sofia Lima', 'Praia das Castanheiras - Guarapari'),
  ('1003', 'Renata Vasconcelos', '(27) 99988-7766', 'Bernardo Vasconcelos', 'Praia de Meaípe - Guarapari')
ON CONFLICT (numero_pulseira) DO NOTHING; 

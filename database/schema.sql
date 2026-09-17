-- ==========================================================
-- PROJETO: Anjos da Praia (Desafio 3 - Hackathon Anhanguera 2026.2)
-- SCRIPT DDL OFICIAL DE CRIAÇÃO DO BANCO NO SUPABASE (PRODUÇÃO)
-- Sem dados mockados: cadastros e autenticação 100% reais
-- ==========================================================

-- 1. Tabela de Praias Oficiais de Guarapari
CREATE TABLE IF NOT EXISTS praias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  regiao VARCHAR(60) NOT NULL DEFAULT 'Centro',
  latitude_padrao NUMERIC(10, 7) NOT NULL,
  longitude_padrao NUMERIC(10, 7) NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Tendas / Postos de Apoio na Orla
CREATE TABLE IF NOT EXISTS tendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  praia VARCHAR(80) NOT NULL,
  praia_id UUID REFERENCES praias(id) ON DELETE SET NULL,
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
  tenda_atendimento_id UUID REFERENCES tendas(id) ON DELETE SET NULL,
  historico_status JSONB DEFAULT '[]'::jsonb
);

-- 4. Tabela de Perfil de Operadores da Tenda (vinculada ao Supabase Auth)
CREATE TABLE IF NOT EXISTS operadores (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120),
  tenda_id UUID REFERENCES tendas(id) ON DELETE SET NULL,
  role VARCHAR(30) DEFAULT 'operador' CHECK (role IN ('admin', 'operador')),
  status VARCHAR(30) DEFAULT 'ativo' CHECK (status IN ('ativo', 'bloqueado', 'pendente')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Se a tabela já existir no Supabase, adiciona as colunas se não existirem:
ALTER TABLE operadores ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'operador';
ALTER TABLE operadores ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ativo';

-- 5. Índices para agilidade e buscas instantâneas
CREATE INDEX IF NOT EXISTS idx_pulseira_numero ON cadastros_pulseiras(numero_pulseira);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_pulseira ON ocorrencias(numero_pulseira);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_status ON ocorrencias(status);
CREATE INDEX IF NOT EXISTS idx_tendas_ativa ON tendas(ativa);
CREATE INDEX IF NOT EXISTS idx_operadores_status ON operadores(status);

-- 6. Habilitar Realtime para escuta em tempo real no dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE ocorrencias;
ALTER PUBLICATION supabase_realtime ADD TABLE cadastros_pulseiras;
ALTER PUBLICATION supabase_realtime ADD TABLE tendas;
ALTER PUBLICATION supabase_realtime ADD TABLE praias;
ALTER PUBLICATION supabase_realtime ADD TABLE operadores;

-- 7. Políticas de Segurança Refinadas (Row Level Security - RLS)
-- Conformidade com a Lei Geral de Proteção de Dados (LGPD) e Edital Anhanguera
ALTER TABLE praias ENABLE ROW LEVEL SECURITY;
ALTER TABLE tendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadastros_pulseiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE operadores ENABLE ROW LEVEL SECURITY;

-- Políticas para Praias (Leitura pública para o mapa, alteração apenas por operadores)
DROP POLICY IF EXISTS "Leitura de praias" ON praias;
CREATE POLICY "Leitura de praias" ON praias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gerenciamento de praias" ON praias;
CREATE POLICY "Gerenciamento de praias" ON praias FOR ALL TO authenticated USING (true);

-- Políticas para Tendas (Leitura pública para localização, alteração apenas por operadores)
DROP POLICY IF EXISTS "Leitura de tendas" ON tendas;
CREATE POLICY "Leitura de tendas" ON tendas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gerenciamento de tendas" ON tendas;
CREATE POLICY "Gerenciamento de tendas" ON tendas FOR ALL TO authenticated USING (true);

-- Políticas para Cadastros de Pulseiras (LGPD: Apenas operadores autenticados podem ver dados de crianças/pais)
DROP POLICY IF EXISTS "Acesso a cadastros de pulseiras" ON cadastros_pulseiras;
CREATE POLICY "Acesso restrito a operadores autenticados" ON cadastros_pulseiras 
  FOR ALL TO authenticated USING (true);

-- Políticas para Ocorrências:
-- Banhista anônimo pode inserir chamado emergencial via QR Code
DROP POLICY IF EXISTS "Banhista pode inserir ocorrencia" ON ocorrencias;
DROP POLICY IF EXISTS "Banhista anônimo pode emitir alerta" ON ocorrencias;
CREATE POLICY "Banhista anônimo pode emitir alerta" ON ocorrencias 
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Apenas operadores autenticados podem visualizar e gerenciar o histórico de ocorrências
DROP POLICY IF EXISTS "Leitura de ocorrencias" ON ocorrencias;
DROP POLICY IF EXISTS "Operador pode visualizar ocorrencias" ON ocorrencias;
CREATE POLICY "Operador pode visualizar ocorrencias" ON ocorrencias 
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Atualizacao e exclusao de ocorrencias" ON ocorrencias;
DROP POLICY IF EXISTS "Operador pode atualizar ocorrencias" ON ocorrencias;
CREATE POLICY "Operador pode atualizar ocorrencias" ON ocorrencias 
  FOR UPDATE TO authenticated USING (true);

-- Políticas para Operadores:
-- Apenas usuários autenticados podem consultar e gerenciar a equipe
DROP POLICY IF EXISTS "Acesso operadores" ON operadores;
DROP POLICY IF EXISTS "Acesso seguro a operadores" ON operadores;
CREATE POLICY "Acesso seguro a operadores" ON operadores 
  FOR ALL TO authenticated USING (true);


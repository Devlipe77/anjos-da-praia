# 🏖️ Anjos da Praia — Sistema de Apoio e Reencontro Infantil

**Hackathon Ciência da Computação 2026.2 • Faculdade Anhanguera de Guarapari**  
**Desafio 3: Tecnologia para auxiliar na localização de crianças perdidas nas praias**

---

## 📌 1. Visão Geral do Problema e Solução

A Associação Anjos da Praia atua há anos no litoral do Espírito Santo oferecendo pulseiras de identificação para crianças durante a alta temporada de verão. Em momentos de grande concentração de pessoas, a perda temporária de crianças gera pânico para as famílias e sobrecarrega os postos de salva-vidas.

### O Desafio Proposto
Construir uma solução ágil, sem necessidade de download de aplicativo em lojas (100% web no celular), que permita a qualquer banhista que encontrar uma criança comunicar a localização GPS exata à equipe da tenda institucional em poucos segundos.

### A Solução "Anjos da Praia"
Uma aplicação web progressiva com duas interfaces integradas:
1. **Visão do Banhista (`/alerta`)**: Acessada apontando a câmera do celular para o QR Code da pulseira. Sem cadastro, sem login. Pede apenas permissão de GPS e dispara o chamado em 1 toque.
2. **Painel Operacional da Tenda (`/admin`)**: Dashboard em tempo real com escuta via WebSockets (Supabase Realtime), mapa interativo Leaflet com camada homologada **Esri World Street Map**, rota com 1 clique para Google Maps e atalhos imediatos para acionar os pais por ligação ou WhatsApp.

---

## 🏗️ 2. Arquitetura e Stack Tecnológica

| Camada | Tecnologia | Justificativa Técnica |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite + TypeScript | SPA ultrarrápida, tipagem estrita e build otimizado |
| **Estilização** | Tailwind CSS | Design responsivo, mobile-first e temas visuais de alta legibilidade ao ar livre |
| **Mapas & GIS** | Leaflet + Esri Tiles | Camada geoespacial aberta sem bloqueio de API Key (ao contrário de CARTO) e sem erro 403 (OpenStreetMap) |
| **Backend / DB** | Supabase (PostgreSQL 15) | Relacional robusto com Row Level Security (RLS) e WebSockets Realtime nativos |
| **Deploy & SSL** | Vercel | Certificado HTTPS automático (imprescindível para ativação da Geolocation API nos smartphones) |

---

## 🔄 3. Fluxo Principal do Sistema

```
[Família chega à Praia]
          │
          ▼
[Cadastro na Tenda] ──▶ Pulseira numerada (#1001) entregue à criança
          │
      (Criança se afasta momentaneamente)
          │
          ▼
[Banhista encontra a criança]
          │
          ▼
[Lê QR Code da pulseira] ──▶ Abre /alerta?pulseira=1001 (Web direta, sem baixar app)
          │
          ▼
[Toca em "ENVIAR LOCALIZAÇÃO"] ──▶ Captura GPS nativo (alta precisão)
          │
          ▼
[Supabase Realtime] ──▶ Alerta sonoro/visual no Painel da Tenda (/admin)
          │
          ├─▶ Visualização do pino exato no mapa Leaflet (Esri)
          ├─▶ Botão "Traçar Rota no Google Maps"
          └─▶ Contato em 1 clique via WhatsApp ou Ligação para os pais
          │
          ▼
[Reencontro Realizado com Sucesso! 🎉]
```

---

## 🔒 4. Privacidade e LGPD

- **Minimização de Dados**: Quem encontra a criança **nunca** visualiza o nome ou telefone dos pais. Apenas transmite o número da pulseira e coordenadas geográficas pontuais.
- **Armazenamento Seguro**: Os dados cadastrais dos responsáveis residem de forma segura no Supabase com políticas RLS restritas aos operadores da tenda.

---

## 🗄️ 5. Modelo do Banco de Dados (PostgreSQL / Supabase)

O script SQL completo está disponível no arquivo [`database/schema.sql`](./database/schema.sql).

### Tabelas Principais:
1. `cadastros_pulseiras`:
   - `id`: UUID (Primary Key)
   - `numero_pulseira`: VARCHAR(20) UNIQUE
   - `nome_responsavel`: VARCHAR(100)
   - `telefone_contato`: VARCHAR(20)
   - `nome_crianca`: VARCHAR(80)
   - `praia_origem`: VARCHAR(60)
   - `observacoes`: TEXT
   - `data_cadastro`: TIMESTAMP

2. `ocorrencias`:
   - `id`: UUID (Primary Key)
   - `numero_pulseira`: VARCHAR(20) FK -> `cadastros_pulseiras.numero_pulseira`
   - `latitude`: NUMERIC(10, 7)
   - `longitude`: NUMERIC(10, 7)
   - `precisao_metros`: NUMERIC(8, 2)
   - `status`: 'Criança localizada' | 'Equipe a caminho' | 'Criança recebida' | 'Reencontro realizado'
   - `horario_alerta`: TIMESTAMP
   - `finalizada_em`: TIMESTAMP

---

## 🚀 6. Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js 18+ instalado.

### Passo 1: Instalar as Dependências
```bash
npm install
```

### Passo 2: Configurar o Supabase (Opcional para Demonstração Inicial)
1. Crie um projeto em [supabase.com](https://supabase.com).
2. No menu **SQL Editor**, cole e execute o conteúdo de `database/schema.sql`.
3. No arquivo `.env.local`, preencha suas credenciais:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
   ```
> *Nota: O projeto conta com um modo de demonstração local automático com dados de exemplo da Praia do Morro, permitindo testar tudo imediatamente mesmo antes de cadastrar as chaves.*

### Passo 3: Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse no navegador: `http://localhost:5173`.

---

## 🌐 7. Deploy na Vercel (Passo a Passo)

1. Suba o código para seu repositório no GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: MVP Anjos da Praia completo"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/anjos-da-praia.git
   git push -u origin main
   ```
2. Acesse [vercel.com](https://vercel.com) e importe o repositório.
3. Configure as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Clique em **Deploy**. O arquivo `vercel.json` já configurado garante que todas as rotas SPA funcionem em HTTPS sem erro 404.

---

## 👥 Equipe do Projeto
- Curso de Ciência da Computação — Faculdade Anhanguera de Guarapari
- Hackathon 2026.2

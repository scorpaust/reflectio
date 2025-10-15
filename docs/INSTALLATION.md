# Guia de Instalação Completo - Reflectio

Este guia fornece instruções detalhadas para configurar o Reflectio do zero.

## Índice

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Instalação Local](#instalação-local)
3. [Configuração do Supabase](#configuração-do-supabase)
4. [Configuração do OpenAI](#configuração-do-openai)
5. [Configuração do Stripe](#configuração-do-stripe)
6. [Variáveis de Ambiente](#variáveis-de-ambiente)
7. [Inicialização da Base de Dados](#inicialização-da-base-de-dados)
8. [Execução do Projeto](#execução-do-projeto)
9. [Troubleshooting](#troubleshooting)

## Requisitos do Sistema

### Software Necessário

- **Node.js**: Versão 20.x ou superior
  - Download: https://nodejs.org/
  - Verificar instalação: `node --version`

- **npm**: Versão 10.x ou superior (incluído com Node.js)
  - Verificar instalação: `npm --version`

- **Git**: Para clonar o repositório
  - Download: https://git-scm.com/
  - Verificar instalação: `git --version`

### Contas de Serviços Necessárias

1. **Supabase** (Backend, Database, Storage)
   - Criar conta gratuita em: https://supabase.com

2. **OpenAI** (Moderação e Transcrição)
   - Criar conta em: https://platform.openai.com/
   - Necessita de créditos (pré-pago)

3. **Stripe** (Pagamentos - Opcional para começar)
   - Criar conta em: https://stripe.com/

### Requisitos de Hardware

- **RAM**: Mínimo 4GB (recomendado 8GB)
- **Espaço em Disco**: Mínimo 500MB livres
- **Processador**: Qualquer processador moderno de 64-bit

## Instalação Local

### 1. Clonar o Repositório

```bash
# Clonar via HTTPS
git clone https://github.com/seu-usuario/reflectio.git

# OU clonar via SSH (se configurado)
git clone git@github.com:seu-usuario/reflectio.git

# Entrar no diretório
cd reflectio
```

### 2. Instalar Dependências

```bash
# Usando npm
npm install

# OU usando yarn
yarn install

# OU usando pnpm
pnpm install

# OU usando bun
bun install
```

**Tempo estimado**: 2-5 minutos dependendo da conexão

## Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse https://app.supabase.com/
2. Clique em "New Project"
3. Preencha:
   - **Name**: reflectio (ou nome de sua escolha)
   - **Database Password**: Escolha uma senha forte e guarde-a
   - **Region**: Escolha a região mais próxima
4. Clique em "Create new project"
5. Aguarde 1-2 minutos até o projeto estar pronto

### 2. Obter Credenciais do Supabase

1. No painel do projeto, vá para **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: Key pública (começa com `eyJ...`)
   - Em **Service role**, copie a **service_role key** (USE COM CUIDADO!)

### 3. Executar Migrações SQL

#### Opção A: Via Dashboard (Recomendado)

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em "New Query"
3. Cole o conteúdo de cada ficheiro em `supabase/migrations/` na ordem:
   - `20240101000000_initial_schema.sql` (se existir)
   - Outros ficheiros por ordem cronológica
4. Clique em "Run" para cada query

#### Opção B: Via CLI do Supabase

```bash
# Instalar CLI do Supabase
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref seu-project-ref

# Executar migrações
supabase db push
```

### 4. Configurar Storage (Buckets)

#### Criar Bucket de Avatares

Execute no SQL Editor:

```sql
-- Conteúdo do ficheiro setup-avatars-bucket.sql
-- (Cole o conteúdo completo do ficheiro)
```

#### Criar Bucket de Áudio

Execute no SQL Editor:

```sql
-- Conteúdo do ficheiro setup-audio-bucket.sql
-- (Cole o conteúdo completo do ficheiro)
```

### 5. Configurar Autenticação

1. Vá para **Authentication** → **Providers**
2. **Email**: Já vem ativado por padrão
3. **Google OAuth** (opcional mas recomendado):
   - Ative o toggle "Google"
   - Siga o guia para criar credenciais no Google Cloud Console
   - Cole Client ID e Client Secret
   - Salve

### 6. Desativar RLS Temporariamente (Desenvolvimento)

⚠️ **APENAS PARA DESENVOLVIMENTO LOCAL**

```sql
-- Execute no SQL Editor
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE reflections DISABLE ROW LEVEL SECURITY;
ALTER TABLE connections DISABLE ROW LEVEL SECURITY;
```

**Nota**: Para produção, configure políticas RLS apropriadas.

## Configuração do OpenAI

### 1. Criar Conta e Adicionar Créditos

1. Acesse https://platform.openai.com/
2. Crie uma conta ou faça login
3. Vá para **Billing** → **Payment methods**
4. Adicione um método de pagamento
5. Adicione créditos (mínimo $5 recomendado)

### 2. Gerar API Key

1. Vá para https://platform.openai.com/api-keys
2. Clique em "Create new secret key"
3. Nome: "Reflectio Dev" (ou nome de sua escolha)
4. Permissões: Deixe padrão (All)
5. Clique em "Create secret key"
6. **COPIE A KEY IMEDIATAMENTE** (ela não será mostrada novamente)
7. Guarde em local seguro

### 3. Configurar Limites (Recomendado)

1. Vá para **Settings** → **Limits**
2. Configure limites mensais para evitar gastos excessivos:
   - **Hard limit**: $20/mês (ajuste conforme necessário)
   - **Soft limit**: $10/mês
3. Adicione email para notificações

## Configuração do Stripe

### 1. Criar Conta Stripe

1. Acesse https://stripe.com/
2. Crie uma conta
3. Complete o processo de verificação

### 2. Obter API Keys

1. No Dashboard, vá para **Developers** → **API keys**
2. **Modo de Teste** (para desenvolvimento):
   - Copie **Publishable key** (começa com `pk_test_...`)
   - Copie **Secret key** (começa com `sk_test_...`)

### 3. Configurar Webhook (Para Produção)

1. Vá para **Developers** → **Webhooks**
2. Clique em "Add endpoint"
3. **Endpoint URL**: `https://seu-dominio.com/api/webhooks/stripe`
4. **Events to send**: Selecione:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copie o **Signing secret** (começa com `whsec_...`)

## Variáveis de Ambiente

### 1. Criar Ficheiro .env.local

Na raiz do projeto:

```bash
# Criar ficheiro
touch .env.local

# OU no Windows
type nul > .env.local
```

### 2. Preencher Variáveis

Cole e edite com seus valores:

```env
# ======================
# SUPABASE
# ======================
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ======================
# OPENAI
# ======================
OPENAI_API_KEY=sk-proj-...

# ======================
# STRIPE
# ======================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ======================
# APLICAÇÃO
# ======================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ======================
# CONFIGURAÇÕES OPCIONAIS
# ======================
# Modo estrito de moderação (true/false)
MODERATION_STRICT_MODE=false

# Bloquear automaticamente conteúdo flagrado (true/false)
MODERATION_AUTO_BLOCK=true

# Ambiente (development/production)
NODE_ENV=development
```

### 3. Verificar Configuração

```bash
# Verificar se variáveis estão carregadas
npm run dev

# Se aparecer erro de variável faltando, verifique .env.local
```

## Inicialização da Base de Dados

### Tabelas Principais

As seguintes tabelas devem ser criadas pelas migrações:

- `profiles` - Perfis de utilizadores
- `posts` - Posts de texto e áudio
- `reflections` - Reflexões (comentários)
- `connections` - Conexões entre utilizadores
- `moderation_logs` - Logs de moderação

### Verificar Tabelas

Execute no SQL Editor do Supabase:

```sql
-- Listar todas as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Verificar estrutura de uma tabela
\d profiles
```

### Popular Dados de Teste (Opcional)

```sql
-- Criar utilizador de teste
INSERT INTO profiles (id, username, email, level)
VALUES (
  uuid_generate_v4(),
  'teste',
  'teste@example.com',
  1
);
```

## Execução do Projeto

### 1. Modo Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# OU com outras ferramentas
yarn dev
pnpm dev
bun dev
```

O servidor estará disponível em: http://localhost:3000

### 2. Build de Produção

```bash
# Criar build otimizado
npm run build

# Iniciar servidor de produção
npm run start
```

### 3. Verificações Pós-Instalação

1. **Página inicial carrega**: http://localhost:3000
2. **Registro funciona**: http://localhost:3000/register
3. **Login funciona**: http://localhost:3000/login
4. **Dashboard carrega após login**: http://localhost:3000/feed
5. **Criação de post funciona**
6. **Moderação está ativa** (teste com palavras inadequadas)

## Troubleshooting

### Problema: "Module not found"

**Solução**:
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problema: "Supabase connection failed"

**Verificações**:
1. URLs corretas em `.env.local`
2. Projeto Supabase está ativo
3. Firewall não está bloqueando

**Solução**:
```bash
# Testar conexão
node test-supabase.js
```

### Problema: "Posts não podem ser criados"

**Causa**: Row Level Security (RLS) bloqueando inserts

**Solução**: Ver [README_URGENTE.md](../README_URGENTE.md)

```sql
-- Desativar RLS temporariamente
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
```

### Problema: "OpenAI rate limit exceeded"

**Causa**: Muitas requisições à API

**Solução**:
1. Verificar limites em https://platform.openai.com/account/limits
2. Adicionar mais créditos
3. Implementar cache para moderation

### Problema: "Build fails with TypeScript errors"

**Solução**:
```bash
# Verificar erros
npm run build

# Limpar e rebuild
rm -rf .next
npm run build
```

### Problema: Variáveis de ambiente não carregam

**Verificações**:
1. Ficheiro chama-se `.env.local` (não `.env`)
2. Ficheiro está na raiz do projeto
3. Variáveis começam com `NEXT_PUBLIC_` para client-side
4. Servidor foi reiniciado após editar `.env.local`

### Problema: Erros de CORS

**Solução no Supabase**:
1. Settings → API → CORS Origins
2. Adicionar: `http://localhost:3000`

### Logs Úteis

```bash
# Logs do Next.js
npm run dev -- --debug

# Logs do Supabase
# Ver em: https://app.supabase.com/project/_/logs

# Verificar variáveis carregadas
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

## Próximos Passos

Após instalação bem-sucedida:

1. Leia [SISTEMA_MODERACAO.md](../SISTEMA_MODERACAO.md) para entender o sistema de moderação
2. Explore [EXEMPLO_USO.md](../EXEMPLO_USO.md) para ver componentes em ação
3. Consulte [CONTRIBUTING.md](../CONTRIBUTING.md) se quiser contribuir
4. Configure RLS para produção (ver documentação do Supabase)

## Suporte

Se encontrar problemas:

1. Verifique a seção [Troubleshooting](#troubleshooting)
2. Consulte Issues no GitHub
3. Crie uma nova Issue com detalhes do problema
4. Entre em contacto via email (se disponível)

---

**Instalação completa!** 🚀 Agora você está pronto para usar o Reflectio.

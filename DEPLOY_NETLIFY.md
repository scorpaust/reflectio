# Deploy no Netlify - Guia de Resolução de Problemas

## Configurações Aplicadas

### 1. Next.js Config (`next.config.ts`)

- Removido `output: "export"` que causava conflito com API routes
- Configurado `serverExternalPackages` para Supabase
- Habilitado `images.unoptimized` para compatibilidade com Netlify

### 2. Netlify Config (`netlify.toml`)

- Removido `publish = ".next"` para deixar o plugin gerenciar
- Configurado Node.js 20 e npm 10
- Adicionado headers CORS para API routes
- Configurado cache otimizado para assets estáticos

### 3. Arquivos Adicionais

- `.nvmrc`: Especifica Node.js 20
- `public/_redirects`: Backup para redirects
- `scripts/deploy-netlify.ps1`: Script automatizado de deploy

## Como Fazer Deploy

### Opção 1: Via Netlify CLI (Recomendado)

```bash
# Instalar Netlify CLI se necessário
npm install -g netlify-cli

# Fazer login no Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Opção 2: Via Script PowerShell

```bash
npm run deploy:netlify
```

### Opção 3: Via Git (Deploy Automático)

1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente no painel do Netlify
3. Push para a branch principal

## Variáveis de Ambiente Necessárias

Configure no painel do Netlify:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MAILJET_API_KEY`
- `MAILJET_SECRET_KEY`
- `OPENAI_API_KEY`

## Problemas Comuns e Soluções

### 1. "Failed publishing static content"

**Causa**: Configuração incorreta do diretório de publicação
**Solução**: Remover `publish = ".next"` do netlify.toml e deixar o plugin gerenciar

### 2. "export const dynamic not configured"

**Causa**: Uso de `output: "export"` com API routes dinâmicas
**Solução**: Remover `output: "export"` do next.config.ts

### 3. Build falha com erros de Supabase

**Causa**: Problemas com Edge Runtime
**Solução**: Configurar `serverExternalPackages: ["@supabase/supabase-js"]`

### 4. API routes não funcionam

**Causa**: Redirects não configurados corretamente
**Solução**: Verificar se os redirects estão configurados no netlify.toml

## Verificação Pós-Deploy

1. Testar páginas estáticas: `/`, `/about`, `/contact`
2. Testar autenticação: `/login`, `/register`
3. Testar API routes: `/api/contact`
4. Verificar CORS headers nas requisições API
5. Testar funcionalidades premium e Stripe

## Debug

Para debug detalhado:

```bash
netlify deploy --prod --debug
```

Para logs do site:

```bash
netlify logs
```

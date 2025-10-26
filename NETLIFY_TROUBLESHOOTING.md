# Deploy no Netlify - Guia de Resolução de Problemas

## Problema: "Failed publishing static content"

Este erro ocorre quando há conflito entre a configuração do plugin Next.js e as configurações de publicação.

## Soluções Testadas

### Solução 1: Configuração Mínima (Recomendada)

Use a configuração mais simples possível:

**netlify.toml:**

```toml
[build]
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**next.config.ts:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### Solução 2: Limpar Cache do Netlify

```bash
# Remover diretório .netlify que pode ter configurações conflitantes
Remove-Item -Recurse -Force .netlify

# Fazer deploy limpo
netlify deploy --prod
```

### Solução 3: Configuração Alternativa (Sem Plugin)

Se o plugin continuar falhando, use os arquivos alternativos:

1. Renomeie `netlify-alternative.toml` para `netlify.toml`
2. Renomeie `next-alternative.config.ts` para `next.config.ts`
3. Adicione script de export no package.json:

```json
{
  "scripts": {
    "export": "next export"
  }
}
```

### Solução 4: Deploy Manual via CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build local
npm run build

# Deploy manual especificando diretório
netlify deploy --prod --dir=.next
```

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

## Problemas Conhecidos e Soluções

### 1. "Failed publishing static content"

**Causas Possíveis:**

- Arquivo `.netlify/netlify.toml` com configuração conflitante
- Plugin Next.js versão incompatível
- Configuração de `publish` definida incorretamente

**Soluções:**

1. Remover diretório `.netlify` completamente
2. Usar configuração mínima no `netlify.toml`
3. Não definir `publish` no netlify.toml

### 2. "export const dynamic not configured"

**Causa**: Uso de `output: "export"` com API routes dinâmicas
**Solução**: Remover `output: "export"` ou usar configuração alternativa

### 3. Build falha com erros de Supabase

**Causa**: Problemas com Edge Runtime
**Solução**: Adicionar `serverExternalPackages: ["@supabase/supabase-js"]`

### 4. Plugin Next.js falha consistentemente

**Solução**: Usar deploy sem plugin (configuração alternativa)

## Comandos de Debug

```bash
# Deploy com debug detalhado
netlify deploy --prod --debug

# Verificar logs do site
netlify logs

# Verificar status do build
netlify status

# Limpar cache local
npm run build -- --no-cache
```

## Verificação Pós-Deploy

1. ✅ Páginas estáticas: `/`, `/about`, `/contact`
2. ✅ Autenticação: `/login`, `/register`
3. ✅ API routes: `/api/contact`
4. ✅ CORS headers nas requisições API
5. ✅ Funcionalidades premium e Stripe

## Contato para Suporte

Se nenhuma solução funcionar:

1. Verifique os logs detalhados com `--debug`
2. Consulte a documentação oficial: https://docs.netlify.com/integrations/frameworks/next-js/
3. Reporte o issue no repositório do plugin: https://github.com/opennextjs/opennextjs-netlify/issues

# 🚀 Configuração de Produção - Reflectio

## 🎯 Objetivo

Preparar o sistema Premium para produção com todas as configurações necessárias para um ambiente seguro e funcional.

## 📋 Checklist de Configuração

### **1. 🔑 Chaves e Credenciais**

#### **Supabase (Obrigatório)**

1. Ir para [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecionar seu projeto
3. Ir para **Settings** → **API**
4. Copiar as chaves:

```env
# Produção - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Stripe (Obrigatório)**

1. Ir para [Stripe Dashboard](https://dashboard.stripe.com)
2. **Ativar modo Live** (sair do Test mode)
3. Ir para **Developers** → **API keys**
4. Copiar as chaves de produção:

```env
# Produção - Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51xxxxx...
STRIPE_SECRET_KEY=sk_live_51xxxxx...
```

#### **OpenAI (Já configurado)**

```env
# OpenAI (mesmo para produção)
OPENAI_API_KEY=sk-proj-xxxxx...
```

### **2. 🏪 Produtos Stripe (Criar em Live Mode)**

#### **Criar Produtos de Produção:**

1. No Stripe Dashboard (Live mode)
2. Ir para **Products** → **Add product**
3. Criar produto "Reflectio Premium"
4. Adicionar preços:
   - **Mensal**: €9,90/mês (recurring)
   - **Anual**: €95,00/ano (recurring)

```env
# Price IDs de produção
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_live_xxxxx...
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_live_xxxxx...
```

### **3. 🔗 Webhooks de Produção**

#### **Configurar Webhook:**

1. Stripe Dashboard → **Developers** → **Webhooks**
2. **Add endpoint**
3. URL: `https://seu-dominio.com/api/stripe/webhooks`
4. Eventos:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`

```env
# Webhook de produção
STRIPE_WEBHOOK_SECRET=whsec_live_xxxxx...
```

### **4. 🌐 Configurações de Domínio**

```env
# URL de produção
NEXT_PUBLIC_APP_URL=https://reflectio.com

# Configurações de moderação
MODERATION_STRICT_MODE=true
MODERATION_AUTO_BLOCK=true

# Chaves de segurança
CRON_SECRET=sua-chave-super-secreta-aqui
ADMIN_SECRET_KEY=sua-chave-admin-super-secreta
```

## 🔧 Arquivo .env.production

Criar arquivo `.env.production` com todas as variáveis:

```env
# Supabase - PRODUÇÃO
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe - PRODUÇÃO (LIVE MODE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51xxxxx...
STRIPE_SECRET_KEY=sk_live_51xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_live_xxxxx...

# Price IDs - PRODUÇÃO
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_live_xxxxx...
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_live_xxxxx...

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxx...

# Aplicação
NEXT_PUBLIC_APP_URL=https://reflectio.com
MODERATION_STRICT_MODE=true
MODERATION_AUTO_BLOCK=true

# Segurança
CRON_SECRET=sua-chave-cron-super-secreta-2024
ADMIN_SECRET_KEY=sua-chave-admin-super-secreta-2024
```

## 🛡️ Configurações de Segurança

### **1. Supabase RLS (Row Level Security)**

Ativar RLS nas tabelas sensíveis:

```sql
-- Ativar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### **2. Stripe Customer Portal**

Configurar portal em Live mode:

1. [Stripe Dashboard → Customer Portal](https://dashboard.stripe.com/settings/billing/portal)
2. **Activate live mode**
3. Configurar funcionalidades:
   - ✅ Update payment method
   - ✅ Download invoices
   - ✅ Cancel subscriptions (Cancel at period end)

### **3. Rate Limiting**

Adicionar middleware de rate limiting:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Rate limiting para APIs sensíveis
  if (request.nextUrl.pathname.startsWith("/api/stripe/")) {
    // Implementar rate limiting
  }

  return NextResponse.next();
}
```

## 🚀 Deploy de Produção

### **1. Vercel (Recomendado)**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configurar variáveis de ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY
# ... todas as outras variáveis
```

### **2. Configurar Domínio**

1. Vercel Dashboard → Seu projeto → **Domains**
2. Adicionar `reflectio.com`
3. Configurar DNS conforme instruções

### **3. Configurar Cron Jobs**

O `vercel.json` já está configurado:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-premium-expirations",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

## 🧪 Testes de Produção

### **1. Teste de Pagamento Real**

⚠️ **CUIDADO**: Use cartão real com valor baixo para teste

```
Cartão de teste real:
- Use seu próprio cartão
- Faça pagamento de €9,90
- Cancele imediatamente após teste
```

### **2. Checklist de Testes**

- [ ] Checkout funciona com cartão real
- [ ] Webhook recebe eventos corretamente
- [ ] Premium é ativado automaticamente
- [ ] Cancelamento mantém acesso até final do período
- [ ] Cron job verifica expirações
- [ ] Customer Portal funciona
- [ ] Emails transacionais (se configurados)

### **3. Monitoramento**

```bash
# Logs do Vercel
vercel logs

# Monitorar webhooks no Stripe
# Dashboard → Developers → Webhooks → Ver eventos
```

## 📊 Configurações Adicionais

### **1. Analytics**

```env
# Google Analytics (opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Vercel Analytics (automático)
```

### **2. Email (Opcional)**

```env
# SendGrid, Mailgun, etc.
EMAIL_API_KEY=xxxxx
EMAIL_FROM=noreply@reflectio.com
```

### **3. Sentry (Monitoramento de Erros)**

```env
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

## ⚠️ Checklist Pré-Deploy

### **Obrigatório:**

- [ ] Chaves Supabase de produção
- [ ] Chaves Stripe LIVE mode
- [ ] Produtos criados no Stripe Live
- [ ] Webhook configurado para domínio real
- [ ] Customer Portal ativado
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio configurado

### **Recomendado:**

- [ ] RLS ativado no Supabase
- [ ] Rate limiting implementado
- [ ] Monitoramento de erros
- [ ] Backup de dados
- [ ] Plano de rollback

## 🎯 Próximos Passos Após Deploy

1. **Teste completo** com pagamento real
2. **Monitorar logs** por 24h
3. **Configurar alertas** para falhas
4. **Documentar** processo de suporte
5. **Preparar** materiais de marketing

## 🆘 Suporte e Troubleshooting

### **Logs Importantes:**

- Vercel: `vercel logs`
- Stripe: Dashboard → Webhooks → Events
- Supabase: Dashboard → Logs

### **Contatos de Emergência:**

- Stripe Support: [support.stripe.com](https://support.stripe.com)
- Supabase Support: [supabase.com/support](https://supabase.com/support)
- Vercel Support: [vercel.com/support](https://vercel.com/support)

---

**🚀 Com essas configurações, o Reflectio estará pronto para produção com um sistema Premium robusto e seguro!**

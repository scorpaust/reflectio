# 🪟 Deploy Netlify no Windows - Passo a Passo

## 🎯 Comandos Manuais (Sem Scripts)

### **1. 📦 Instalar Netlify CLI**

```powershell
npm install -g netlify-cli
```

### **2. 🔑 Login no Netlify**

```powershell
netlify login
```

### **3. ✅ Verificar Configurações (Opcional)**

```powershell
node scripts/deploy-production.js
```

### **4. 🔨 Build do Projeto**

```powershell
npm run build
```

### **5. 🚀 Deploy para Netlify**

```powershell
netlify deploy --prod --dir=.next
```

## 🔧 Alternativa: Deploy via Interface Web

### **1. 🌐 Via Netlify Dashboard**

1. Ir para [netlify.com](https://netlify.com)
2. Fazer login
3. Clicar **"Add new site"** → **"Import an existing project"**
4. Conectar com GitHub
5. Selecionar repositório do Reflectio
6. Configurar:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: 20

### **2. 🔑 Configurar Variáveis de Ambiente**

1. Site settings → Environment variables
2. Adicionar todas as variáveis do `.env.production`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51xxxxx...
STRIPE_SECRET_KEY=sk_live_51xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_live_xxxxx...
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_live_xxxxx...
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_live_xxxxx...
OPENAI_API_KEY=sk-proj-xxxxx...
NEXT_PUBLIC_APP_URL=https://seu-site.netlify.app
MODERATION_STRICT_MODE=true
MODERATION_AUTO_BLOCK=true
CRON_SECRET=sua-chave-cron-super-secreta
ADMIN_SECRET_KEY=sua-chave-admin-super-secreta
```

## 🔄 Script PowerShell Atualizado

Agora você pode usar:

```powershell
npm run deploy:netlify
```

Ou executar diretamente:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/deploy-netlify.ps1
```

## ⚠️ Problemas Comuns no Windows

### **❌ Execution Policy Error:**

```powershell
# Permitir execução de scripts temporariamente
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ou executar diretamente
powershell -ExecutionPolicy Bypass -File scripts/deploy-netlify.ps1
```

### **❌ Netlify CLI não encontrado:**

```powershell
# Verificar se está instalado
netlify --version

# Reinstalar se necessário
npm uninstall -g netlify-cli
npm install -g netlify-cli
```

### **❌ Build falha:**

```powershell
# Limpar cache e reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run build
```

## 🎯 Comandos Rápidos

### **Deploy Completo:**

```powershell
# 1. Verificar
node scripts/deploy-production.js

# 2. Build
npm run build

# 3. Deploy
netlify deploy --prod --dir=.next
```

### **Deploy Rápido (sem verificações):**

```powershell
npm run build && netlify deploy --prod --dir=.next
```

### **Ver Logs:**

```powershell
netlify logs
```

### **Ver Status do Site:**

```powershell
netlify status
```

## 📋 Checklist Windows

- [ ] Node.js 20+ instalado
- [ ] Netlify CLI instalado (`npm install -g netlify-cli`)
- [ ] Login feito (`netlify login`)
- [ ] Variáveis de ambiente configuradas no Netlify Dashboard
- [ ] Build funcionando (`npm run build`)
- [ ] Deploy realizado (`netlify deploy --prod --dir=.next`)

## 🔗 Configurar Webhook

Após deploy bem-sucedido:

1. **Stripe Dashboard** → Developers → Webhooks
2. **Add endpoint**
3. **URL**: `https://seu-site.netlify.app/api/stripe/webhooks`
4. **Eventos**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`

## 🧪 Testar Deploy

```powershell
# Testar API
curl https://seu-site.netlify.app/api/debug/profile

# Testar webhook (substitua pela sua URL)
curl -X POST https://seu-site.netlify.app/api/stripe/webhooks
```

---

**✅ Com esses comandos, o deploy funcionará perfeitamente no Windows!**

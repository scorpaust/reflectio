# 🔗 Como Obter o Webhook Secret do Stripe

## 🎯 Passo a Passo Completo

### **1. 🌐 Acessar o Stripe Dashboard**

1. Ir para [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Fazer login na sua conta
3. **IMPORTANTE**: Certificar que está no modo correto:
   - **Desenvolvimento**: Toggle "Test mode" ATIVADO
   - **Produção**: Toggle "Test mode" DESATIVADO

### **2. 🔗 Navegar para Webhooks**

1. No menu lateral, clicar em **"Developers"**
2. Clicar em **"Webhooks"**
3. Você verá uma lista de webhooks (pode estar vazia)

### **3. ➕ Criar Novo Webhook**

1. Clicar no botão **"Add endpoint"** (ou "Create endpoint")
2. Preencher os campos:

#### **Endpoint URL:**

```
# Para desenvolvimento (localhost)
http://localhost:3000/api/stripe/webhooks

# Para produção (seu domínio real)
https://reflectio.com/api/stripe/webhooks
```

#### **Eventos para Escutar:**

Clicar em **"Select events"** e escolher:

- ✅ `checkout.session.completed`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`
- ✅ `customer.subscription.deleted`
- ✅ `customer.subscription.updated`

Ou simplesmente selecionar **"Select all events"** se preferir.

### **4. 🔑 Obter o Webhook Secret**

1. Após criar o webhook, você será redirecionado para a página de detalhes
2. Na seção **"Signing secret"**, clicar em **"Reveal"**
3. Copiar o valor que aparece (começa com `whsec_`)

#### **Exemplo do Secret:**

```
whsec_1234567890abcdef1234567890abcdef12345678
```

### **5. 📝 Configurar no .env**

Adicionar no seu arquivo `.env.local` (desenvolvimento) ou `.env.production`:

```env
# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef1234567890abcdef12345678
```

## 🧪 Testando o Webhook

### **1. 📡 Teste Local (Desenvolvimento)**

Para testar localmente, você precisa expor seu localhost:

#### **Opção A: Stripe CLI (Recomendado)**

```bash
# Instalar Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: Ver https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks para localhost
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

O Stripe CLI mostrará um webhook secret temporário:

```
> Ready! Your webhook signing secret is whsec_1234... (^C to quit)
```

Use esse secret temporário no `.env.local`.

#### **Opção B: ngrok**

```bash
# Instalar ngrok
npm install -g ngrok

# Expor localhost
ngrok http 3000

# Usar a URL do ngrok no webhook
# Exemplo: https://abc123.ngrok.io/api/stripe/webhooks
```

### **2. 🌐 Teste em Produção**

1. Deploy da aplicação para Vercel/Netlify
2. Usar URL real no webhook: `https://seu-dominio.com/api/stripe/webhooks`
3. Fazer um pagamento de teste
4. Verificar logs no Stripe Dashboard

## 🔍 Verificando se Funciona

### **1. 📊 Logs do Stripe**

No Stripe Dashboard → Webhooks → Seu webhook:

- Ver **"Recent deliveries"**
- Status 200 = ✅ Funcionando
- Status 4xx/5xx = ❌ Erro

### **2. 🖥️ Logs da Aplicação**

```bash
# Vercel
vercel logs

# Desenvolvimento
# Ver console do terminal onde roda npm run dev
```

### **3. 🧪 Teste Manual**

No Stripe Dashboard → Webhooks → Seu webhook:

1. Clicar em **"Send test webhook"**
2. Escolher evento (ex: `checkout.session.completed`)
3. Clicar **"Send test webhook"**
4. Verificar se chegou na aplicação

## ⚠️ Problemas Comuns

### **❌ Webhook não funciona:**

#### **1. URL Incorreta**

```bash
# ❌ Errado
http://localhost:3000/api/webhooks

# ✅ Correto
http://localhost:3000/api/stripe/webhooks
```

#### **2. Secret Incorreto**

- Verificar se copiou o secret completo
- Verificar se não tem espaços extras
- Verificar se está no arquivo .env correto

#### **3. Localhost não Acessível**

- Usar Stripe CLI ou ngrok
- Verificar se aplicação está rodando
- Verificar firewall/antivírus

#### **4. Erro 500 na API**

```bash
# Verificar logs
vercel logs

# Ou no desenvolvimento
# Ver console do terminal
```

## 📋 Checklist Final

### **Desenvolvimento:**

- [ ] Webhook criado no Stripe (Test mode)
- [ ] URL: `http://localhost:3000/api/stripe/webhooks`
- [ ] Eventos selecionados
- [ ] Secret copiado para `.env.local`
- [ ] Stripe CLI ou ngrok configurado
- [ ] Teste realizado

### **Produção:**

- [ ] Webhook criado no Stripe (Live mode)
- [ ] URL: `https://seu-dominio.com/api/stripe/webhooks`
- [ ] Eventos selecionados
- [ ] Secret copiado para `.env.production`
- [ ] Deploy realizado
- [ ] Teste com pagamento real

## 🎯 Exemplo Completo

### **1. Criar Webhook:**

- URL: `https://reflectio.com/api/stripe/webhooks`
- Eventos: Todos relacionados a subscription
- Obter secret: `whsec_abc123...`

### **2. Configurar .env:**

```env
STRIPE_WEBHOOK_SECRET=whsec_abc123def456ghi789jkl012mno345pqr678
```

### **3. Testar:**

- Fazer pagamento de teste
- Verificar logs no Stripe
- Confirmar Premium ativado

## 🆘 Ajuda Adicional

### **Documentação Oficial:**

- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

### **Suporte:**

- [Stripe Support](https://support.stripe.com)
- Discord da comunidade Stripe

---

**🎉 Com esses passos, seu webhook estará funcionando perfeitamente!**

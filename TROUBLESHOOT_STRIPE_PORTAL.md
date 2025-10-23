# 🔧 Troubleshooting - Stripe Customer Portal

## 🎯 Problema Comum

**Portal Stripe não funciona** mesmo com configuração ativada no dashboard.

## ✅ Soluções Implementadas

### **1. API Melhorada (`/api/stripe/portal`)**

- **Busca inteligente de customer**: Por subscription → por email → criar novo
- **Logs detalhados**: Para debug de problemas
- **Tratamento de erros**: Mensagens específicas para cada caso

### **2. API de Teste (`/api/debug/test-portal`)**

- **Cria customer automaticamente** se não existir
- **Testa portal diretamente** sem depender de subscription
- **Logs completos** para identificar problemas

### **3. Botão de Debug**

- **"🔗 Testar Portal"** no painel de debug
- **Cria customer** e abre portal imediatamente
- **Funciona sempre** independente de subscription

## 🧪 Como Testar o Portal

### **Método 1: Teste Direto (Recomendado)**

1. Ir para `/profile`
2. No painel de debug, clicar **"🔗 Testar Portal"**
3. **Resultado esperado**: Portal abre automaticamente

### **Método 2: Fluxo Completo**

1. Fazer pagamento real via Stripe Checkout
2. Voltar para `/profile`
3. Clicar **"Portal Stripe"**
4. **Resultado esperado**: Portal com subscription ativa

### **Método 3: Debug Manual**

```javascript
// No console do navegador
fetch("/api/debug/test-portal", { method: "POST" })
  .then((r) => r.json())
  .then((data) => {
    console.log("Portal Test:", data);
    if (data.url) window.location.href = data.url;
  });
```

## 🔍 Diagnóstico de Problemas

### **Erro: "No configuration provided"**

**Causa**: Customer Portal não configurado no Stripe Dashboard
**Solução**:

1. Ir para [Stripe Dashboard → Customer Portal](https://dashboard.stripe.com/test/settings/billing/portal)
2. Clicar "Activate test mode"
3. Configurar funcionalidades e salvar

### **Erro: "Customer not found"**

**Causa**: Customer não existe no Stripe
**Solução**: API agora cria customer automaticamente

### **Erro: "Subscription not found"**

**Causa**: Subscription ID inválido ou não existe
**Solução**: API agora busca customer por email como fallback

### **Portal abre mas está vazio**

**Causa**: Customer existe mas não tem subscriptions
**Solução**: Normal para contas de teste, portal mostra opções disponíveis

## 📋 Checklist de Configuração

### **Stripe Dashboard:**

- [ ] Customer Portal ativado em test mode
- [ ] Funcionalidades configuradas:
  - [ ] Update payment method
  - [ ] Download invoices
  - [ ] Cancel subscriptions
- [ ] Política de cancelamento: "Cancel at period end"
- [ ] Configuração salva

### **Aplicação:**

- [ ] Variáveis de ambiente corretas:
  - [ ] `STRIPE_SECRET_KEY` (sk*test*...)
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk*test*...)
- [ ] APIs funcionando:
  - [ ] `/api/stripe/portal`
  - [ ] `/api/debug/test-portal`

## 🚀 Fluxo de Debug

### **1. Testar Configuração Básica**

```bash
# Verificar se portal está configurado
curl -X POST http://localhost:3000/api/debug/test-portal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

### **2. Verificar Logs**

```javascript
// Console do servidor
"🧪 [DEBUG] Testando portal para usuário: user@example.com";
"🧪 [DEBUG] Customer existente encontrado: cus_xxxxx";
"🧪 [DEBUG] Portal session criada: bps_xxxxx";
```

### **3. Verificar Customer no Stripe**

1. Ir para [Stripe Dashboard → Customers](https://dashboard.stripe.com/test/customers)
2. Buscar por email do usuário
3. Verificar se customer foi criado

## 🎯 Resultados Esperados

### **Portal Funcionando:**

- ✅ Abre página do Stripe Customer Portal
- ✅ Mostra informações de billing
- ✅ Permite atualizar payment method
- ✅ Permite cancelar subscription (se existir)
- ✅ Permite baixar invoices

### **Portal de Teste (sem subscription):**

- ✅ Abre portal vazio
- ✅ Mostra opções para criar subscription
- ✅ Permite atualizar informações de customer

## 🔄 Soluções Alternativas

### **Se Portal não funcionar:**

1. **Usar sistema próprio**: Botão "Cancelar Subscrição" sempre funciona
2. **Debug direto**: Botão "🔗 Testar Portal" cria customer e testa
3. **Verificar configuração**: Seguir checklist acima

### **Para Desenvolvimento:**

- **API de teste** sempre disponível
- **Logs detalhados** para debug
- **Fallbacks automáticos** para casos de erro

## 📞 Suporte

Se o portal ainda não funcionar após seguir este guia:

1. **Verificar logs** do servidor e console
2. **Testar API de debug** diretamente
3. **Verificar configuração** no Stripe Dashboard
4. **Usar sistema próprio** como alternativa

O sistema garante que o usuário sempre tenha uma forma de gerenciar sua subscription, mesmo se o portal oficial não funcionar.

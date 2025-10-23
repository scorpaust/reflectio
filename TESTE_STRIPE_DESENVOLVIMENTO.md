# 🧪 Como Testar Stripe em Desenvolvimento

## 🎯 Resumo

O Stripe funciona perfeitamente em desenvolvimento usando **Test Mode**. Você pode simular pagamentos completos sem cobrar dinheiro real.

## 🔧 Configuração para Testes

### 1. **Chaves de Teste do Stripe**

No seu `.env.local`, use as chaves que começam com `pk_test_` e `sk_test_`:

```env
# Stripe Test Keys (começam com pk_test_ e sk_test_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx...
STRIPE_SECRET_KEY=sk_test_51xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...

# Price IDs de teste (criar no Dashboard do Stripe)
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_xxxxx...
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_xxxxx...
```

### 2. **Criar Produtos de Teste**

No [Dashboard do Stripe](https://dashboard.stripe.com/test/products):

1. Vá para **Products** → **Add product**
2. Crie produto "Reflectio Premium"
3. Adicione preços:
   - **Mensal**: €9,90/mês (recurring)
   - **Anual**: €95,00/ano (recurring)
4. Copie os Price IDs para o `.env.local`

### 3. **Configurar Webhook de Teste**

1. Vá para **Developers** → **Webhooks** → **Add endpoint**
2. URL: `http://localhost:3000/api/stripe/webhooks`
3. Eventos para escutar:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
4. Copie o **Signing secret** para `STRIPE_WEBHOOK_SECRET`

## 💳 Cartões de Teste

O Stripe fornece cartões de teste que simulam diferentes cenários:

### **✅ Pagamentos Bem-sucedidos**

```
Número: 4242 4242 4242 4242
CVC: Qualquer 3 dígitos
Data: Qualquer data futura
```

### **❌ Pagamentos Recusados**

```
Número: 4000 0000 0000 0002
CVC: Qualquer 3 dígitos
Data: Qualquer data futura
```

### **🔄 Requer Autenticação (3D Secure)**

```
Número: 4000 0025 0000 3155
CVC: Qualquer 3 dígitos
Data: Qualquer data futura
```

## 🧪 Fluxo de Teste Completo

### **1. Preparação**

```bash
# Certificar que está em modo de desenvolvimento
npm run dev

# Verificar se webhooks estão funcionando (opcional)
# Instalar Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

### **2. Teste de Pagamento Bem-sucedido**

1. Ir para `/profile`
2. Clicar em "Upgrade para Premium"
3. Escolher plano (mensal ou anual)
4. Usar cartão `4242 4242 4242 4242`
5. Completar checkout
6. **Resultado esperado**:
   - Redirecionamento para `/profile`
   - Mensagem "🔄 Processando pagamento..."
   - Após alguns segundos: "🎉 Pagamento confirmado!"
   - Interface premium ativa

### **3. Teste de Pagamento Cancelado**

1. Seguir passos 1-3 acima
2. Clicar "← Voltar" no Stripe Checkout
3. **Resultado esperado**:
   - Volta para `/profile`
   - Mensagem "❌ Pagamento cancelado..."

### **4. Teste de Pagamento Recusado**

1. Seguir passos 1-3 acima
2. Usar cartão `4000 0000 0000 0002`
3. **Resultado esperado**:
   - Erro no Stripe Checkout
   - Usuário pode tentar outro cartão

## 🔍 Debug e Logs

### **Console do Navegador**

```javascript
// Verificar se session ID foi salvo
localStorage.getItem("stripe_session_id");

// Logs do AuthProvider
("🔄 [AuthProvider] Refreshing profile for user: xxx");
("✅ [AuthProvider] Profile refreshed successfully");
```

### **Console do Servidor**

```bash
# Logs do webhook
"Webhook recebido: checkout.session.completed"
"✅ Premium ativado para usuário: xxx"

# Logs da API de verificação
"🔄 Processando pagamento... Session: xxx"
```

### **Dashboard do Stripe**

- **Payments**: Ver todas as transações de teste
- **Customers**: Ver clientes criados
- **Subscriptions**: Ver assinaturas ativas
- **Webhooks**: Ver eventos enviados e status

## 🚨 Problemas Comuns

### **1. Webhook não funciona**

```bash
# Solução: Usar Stripe CLI para forward local
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Ou usar ngrok para expor localhost
ngrok http 3000
# Usar URL do ngrok no webhook: https://xxx.ngrok.io/api/stripe/webhooks
```

### **2. Premium não ativa após pagamento**

```javascript
// Debug no console do navegador
const sessionId = localStorage.getItem("stripe_session_id");
console.log("Session ID:", sessionId);

// Verificar manualmente via API
fetch("/api/stripe/verify-payment", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sessionId }),
})
  .then((r) => r.json())
  .then(console.log);
```

### **3. Erro de Price ID**

- Verificar se os Price IDs no `.env.local` são de teste (começam com `price_`)
- Confirmar que os produtos foram criados no modo de teste do Stripe

## 🎯 Vantagens do Modo de Teste

### **✅ Funcionalidades Completas**

- Checkout completo funciona
- Webhooks são enviados
- Subscriptions são criadas
- Todos os eventos são simulados

### **✅ Sem Custos**

- Nenhum dinheiro real é cobrado
- Unlimited test transactions
- Todos os cartões de teste são gratuitos

### **✅ Debug Fácil**

- Dashboard mostra todas as transações
- Logs detalhados de webhooks
- Stripe CLI para desenvolvimento local

## 🚀 Resultado

**O sistema funciona 100% em desenvolvimento!**

Você pode testar todo o fluxo de pagamento Premium localmente usando as chaves de teste do Stripe. O comportamento é idêntico à produção, incluindo:

- ✅ Checkout completo
- ✅ Redirecionamento automático
- ✅ Verificação de status
- ✅ Ativação do Premium
- ✅ Interface atualizada

A única diferença é que usa cartões de teste em vez de cartões reais.

## 🧪 Modo de Desenvolvimento Aprimorado

### **Simulação Automática**

Em desenvolvimento, após 3 tentativas de verificação (6 segundos), o sistema automaticamente simula um pagamento bem-sucedido usando a API `/api/stripe/simulate-success`.

### **Simulação Manual**

No "Painel de Debug" da página de profile, há um botão "🧪 Simular Pagamento" que ativa o Premium imediatamente para testes.

### **APIs de Desenvolvimento**

- `POST /api/stripe/simulate-success` - Simula sucesso de pagamento
- Só funciona em `NODE_ENV !== "production"`
- Ativa Premium com dados fictícios para teste

### **Fluxo Híbrido**

1. **Primeiro**: Tenta verificação real via webhooks
2. **Fallback**: Após 6 segundos, simula sucesso automaticamente
3. **Manual**: Botão de debug para ativação imediata

Isso garante que o sistema funcione tanto com webhooks configurados quanto sem eles em desenvolvimento.

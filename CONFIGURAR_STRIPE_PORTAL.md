# 🔧 Configurar Stripe Customer Portal

## 🎯 Problema

Erro: "No configuration provided and your test mode default configuration has not been created"

## ✅ Solução Rápida

### **1. Configurar Customer Portal (Obrigatório)**

1. Ir para [Stripe Dashboard](https://dashboard.stripe.com/test/settings/billing/portal)
2. Clicar em **"Activate test mode"** (se não estiver ativo)
3. Configurar as seguintes opções:

#### **Funcionalidades Permitidas:**

- ✅ **Update payment method** - Permitir atualizar cartão
- ✅ **Download invoices** - Baixar faturas
- ✅ **Cancel subscriptions** - Cancelar subscrições
- ✅ **Update subscriptions** - Alterar planos (opcional)

#### **Política de Cancelamento:**

- **Cancellation behavior**: `Cancel at period end`
- **Proration**: `None` (não cobrar proporcionalmente)
- **Invoice generation**: `Always generate invoice`

#### **Configurações de Aparência:**

- **Business name**: `Reflectio`
- **Support email**: `support@reflectio.com`
- **Privacy policy**: `https://reflectio.com/privacy` (opcional)
- **Terms of service**: `https://reflectio.com/terms` (opcional)

### **2. Salvar Configuração**

1. Clicar em **"Save configuration"**
2. Testar o portal clicando em **"Preview portal"**

## 🧪 Sistema Alternativo Implementado

Como backup, implementei um sistema próprio de cancelamento que funciona mesmo sem o portal configurado:

### **Funcionalidades:**

- ✅ **Cancelamento direto** - API própria `/api/stripe/cancel-subscription`
- ✅ **Cancelamento no final do período** - Mantém Premium até expirar
- ✅ **Suporte a contas de teste** - Cancelamento imediato para testes
- ✅ **Interface amigável** - Modal de confirmação com detalhes

### **Como Funciona:**

1. **Contas reais**: Cancela no Stripe mas mantém acesso até o final do período
2. **Contas de teste**: Desativa imediatamente
3. **Fallback**: Se Stripe falhar, desativa localmente

## 🎮 Como Testar

### **Método 1: Portal Stripe (Recomendado)**

1. Configurar portal no dashboard
2. Ir para `/profile` → "Portal Stripe"
3. Gerenciar subscrição no portal oficial

### **Método 2: Sistema Próprio (Sempre Funciona)**

1. Ir para `/profile` → "Cancelar Subscrição"
2. Confirmar no modal
3. Subscrição cancelada (mantém acesso até expirar)

## 🔄 Fluxo de Cancelamento

### **Para Subscrições Reais:**

```
1. Usuário clica "Cancelar Subscrição"
2. Modal de confirmação é exibido
3. API chama Stripe para cancelar no final do período
4. Usuário mantém Premium até data de expiração
5. Após expiração, volta para plano gratuito
```

### **Para Contas de Teste:**

```
1. Usuário clica "Desativar Teste"
2. Modal de confirmação é exibido
3. Premium é desativado imediatamente
4. Conta volta para plano gratuito
```

## 🚨 Importante

### **Produção:**

- **SEMPRE** configurar o Customer Portal antes do lançamento
- Testar cancelamento em modo de teste
- Verificar se webhooks estão funcionando

### **Desenvolvimento:**

- Sistema próprio funciona sem configuração
- Ideal para testes rápidos
- Portal Stripe é opcional mas recomendado

## 📋 Checklist de Configuração

- [ ] Customer Portal configurado no Stripe Dashboard
- [ ] Política de cancelamento definida (`Cancel at period end`)
- [ ] Funcionalidades habilitadas (payment method, invoices, cancel)
- [ ] Testado em modo de teste
- [ ] Webhooks configurados para `customer.subscription.updated`
- [ ] Sistema próprio funcionando como backup

## 🎯 Resultado Final

Com essas configurações, o usuário pode:

1. **Cancelar via Portal Stripe** (experiência oficial)
2. **Cancelar via sistema próprio** (sempre funciona)
3. **Manter acesso até o final do período pago**
4. **Reativar a qualquer momento**

O sistema garante que o cancelamento sempre funcione, mesmo se o portal do Stripe não estiver configurado.

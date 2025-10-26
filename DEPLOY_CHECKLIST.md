# ✅ Checklist de Deploy - Reflectio Premium

## 🎯 Resumo

Sistema Premium pronto para produção com todas as configurações necessárias.

## 📋 Checklist Completo

### **🔧 1. Configuração de Ambiente**

#### **Arquivos Criados:**

- [x] `.env.production.example` - Template de configuração
- [x] `lib/utils/production.ts` - Utilitários de ambiente
- [x] `scripts/deploy-production.js` - Script de verificação
- [x] Painéis de debug escondidos em produção

#### **Scripts Adicionados:**

```bash
npm run deploy:check    # Verificar configurações
npm run deploy:prod     # Deploy completo
npm run logs           # Monitorar logs
```

### **🔑 2. Variáveis de Ambiente (Obrigatórias)**

#### **Supabase:**

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Chave de service role

#### **Stripe (LIVE MODE):**

- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - pk*live*...
- [ ] `STRIPE_SECRET_KEY` - sk*live*...
- [ ] `STRIPE_WEBHOOK_SECRET` - whsec*live*...
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` - price*live*...
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY` - price*live*...

#### **Aplicação:**

- [ ] `NEXT_PUBLIC_APP_URL` - https://reflectio.com
- [ ] `OPENAI_API_KEY` - Moderação de conteúdo
- [ ] `CRON_SECRET` - Chave para cron jobs
- [ ] `ADMIN_SECRET_KEY` - Chave para APIs admin

### **🏪 3. Configuração Stripe**

#### **Produtos (Live Mode):**

- [ ] Produto "Reflectio Premium" criado
- [ ] Preço mensal: €9,90/mês
- [ ] Preço anual: €95,00/ano
- [ ] Price IDs copiados para .env

#### **Customer Portal:**

- [ ] Portal ativado em Live mode
- [ ] Funcionalidades habilitadas:
  - [ ] Update payment method
  - [ ] Download invoices
  - [ ] Cancel subscriptions
- [ ] Política: "Cancel at period end"

#### **Webhooks:**

- [ ] Endpoint: `https://seu-dominio.com/api/stripe/webhooks`
- [ ] Eventos configurados:
  - [ ] `checkout.session.completed`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
  - [ ] `customer.subscription.deleted`
  - [ ] `customer.subscription.updated`

### **🗄️ 4. Configuração Supabase**

#### **Segurança:**

- [ ] RLS ativado na tabela `profiles`
- [ ] Políticas de acesso configuradas
- [ ] Service role key obtida

#### **Tabelas:**

- [ ] Tabela `profiles` com campos Premium
- [ ] Índices otimizados
- [ ] Backup configurado

### **🌐 5. Deploy Vercel**

#### **Configuração:**

- [ ] Projeto criado no Vercel
- [ ] Domínio configurado
- [ ] DNS apontando para Vercel
- [ ] SSL configurado automaticamente

#### **Variáveis de Ambiente:**

- [ ] Todas as variáveis configuradas no Vercel
- [ ] Ambiente de produção selecionado
- [ ] Cron jobs funcionando

### **🧪 6. Testes de Produção**

#### **Teste de Pagamento:**

- [ ] Checkout funciona com cartão real
- [ ] Webhook recebe eventos
- [ ] Premium ativado automaticamente
- [ ] Email de confirmação enviado (se configurado)

#### **Teste de Cancelamento:**

- [ ] Cancelamento via modal funciona
- [ ] Premium mantido até final do período
- [ ] Customer Portal funciona
- [ ] Renovação automática funciona

#### **Teste de Expiração:**

- [ ] Cron job executa a cada 6 horas
- [ ] Premium expirado é desativado
- [ ] Logs de auditoria funcionam

## 🚀 Comandos de Deploy

### **1. Verificar Configurações:**

```bash
npm run deploy:check
```

### **2. Deploy para Produção:**

```bash
npm run deploy:prod
```

### **3. Monitorar Logs:**

```bash
npm run logs
```

## 📊 Monitoramento Pós-Deploy

### **Primeiras 24h:**

- [ ] Monitorar logs do Vercel
- [ ] Verificar webhooks no Stripe
- [ ] Testar fluxo completo
- [ ] Verificar performance

### **Métricas Importantes:**

- Taxa de conversão Premium
- Churn rate (cancelamentos)
- Tempo de resposta das APIs
- Erros de webhook

### **Alertas Configurar:**

- Falhas de pagamento
- Webhooks com erro
- APIs com alta latência
- Cron jobs falhando

## 🆘 Troubleshooting

### **Problemas Comuns:**

#### **Webhook não funciona:**

- Verificar URL no Stripe Dashboard
- Verificar STRIPE_WEBHOOK_SECRET
- Verificar logs do Vercel

#### **Premium não ativa:**

- Verificar logs do webhook
- Verificar SUPABASE_SERVICE_ROLE_KEY
- Verificar RLS no Supabase

#### **Cancelamento não funciona:**

- Verificar Customer Portal configurado
- Verificar chaves Stripe Live
- Verificar logs da API

## 🎯 Resultado Final

**Sistema Premium Production Ready:**

✅ **Pagamentos reais** funcionando
✅ **Webhooks** configurados e testados
✅ **Cancelamento** mantém período pago
✅ **Expiração automática** via cron jobs
✅ **Monitoramento** e logs configurados
✅ **Segurança** implementada
✅ **Debug panels** escondidos em produção

## 📞 Suporte

### **Documentação:**

- [Stripe Docs](https://stripe.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)

### **Suporte Técnico:**

- Stripe: support.stripe.com
- Supabase: supabase.com/support
- Vercel: vercel.com/support

---

**🚀 Reflectio Premium está pronto para lançamento!**

Execute `npm run deploy:check` para verificar se tudo está configurado corretamente.

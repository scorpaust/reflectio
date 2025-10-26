# ⏰ Alternativas para Cron Jobs no Netlify

## 🎯 Problema

Netlify não suporta cron jobs nativos como o Vercel. Precisamos de alternativas para executar a verificação de expirações Premium a cada 6 horas.

## 🔧 Soluções Disponíveis

### **1. 🌐 EasyCron (Recomendado - Gratuito)**

#### **Configuração:**

1. Ir para [easycron.com](https://www.easycron.com)
2. Criar conta gratuita
3. Criar novo cron job:
   - **URL**: `https://seu-site.netlify.app/api/cron/check-premium-expirations`
   - **Schedule**: `0 */6 * * *` (a cada 6 horas)
   - **Method**: GET
   - **Headers**: `Authorization: Bearer sua-chave-cron`

#### **Vantagens:**

- ✅ Gratuito até 20 jobs
- ✅ Interface simples
- ✅ Logs detalhados
- ✅ Notificações por email

### **2. 🤖 GitHub Actions (Gratuito)**

#### **Arquivo `.github/workflows/cron.yml`:**

```yaml
name: Premium Expiration Check
on:
  schedule:
    - cron: "0 */6 * * *" # A cada 6 horas
  workflow_dispatch: # Permite execução manual

jobs:
  check-expirations:
    runs-on: ubuntu-latest
    steps:
      - name: Check Premium Expirations
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "User-Agent: GitHub-Actions/1.0" \
            https://seu-site.netlify.app/api/cron/check-premium-expirations
        env:
          CRON_SECRET: ${{ secrets.CRON_SECRET }}
```

#### **Configurar Secret:**

1. GitHub → Repositório → Settings → Secrets and variables → Actions
2. Adicionar `CRON_SECRET` com sua chave

#### **Vantagens:**

- ✅ Totalmente gratuito
- ✅ Integrado ao repositório
- ✅ Logs no GitHub
- ✅ Execução manual disponível

### **3. 📱 Netlify Scheduled Functions (Beta)**

#### **Instalar dependência:**

```bash
npm install @netlify/functions
```

#### **Função agendada já criada:**

```typescript
// netlify/functions/check-expirations.ts
import { schedule } from "@netlify/functions";

const handler = schedule("0 */6 * * *", async (event, context) => {
  // Lógica já implementada no arquivo
});
```

#### **Ativar no Netlify:**

1. Netlify Dashboard → Functions → Scheduled functions
2. Verificar se a função aparece
3. Ativar se necessário

#### **Vantagens:**

- ✅ Nativo do Netlify
- ✅ Sem configuração externa
- ⚠️ Ainda em beta

### **4. 🌍 Cron-job.org (Gratuito)**

#### **Configuração:**

1. Ir para [cron-job.org](https://cron-job.org)
2. Criar conta
3. Adicionar cron job:
   - **URL**: `https://seu-site.netlify.app/api/cron/check-premium-expirations`
   - **Schedule**: A cada 6 horas
   - **Headers**: `Authorization: Bearer sua-chave-cron`

#### **Vantagens:**

- ✅ Gratuito
- ✅ Interface simples
- ✅ Estatísticas detalhadas

### **5. ⚡ Uptime Robot (Criativo)**

#### **Configuração:**

1. Ir para [uptimerobot.com](https://uptimerobot.com)
2. Criar monitor HTTP:
   - **URL**: `https://seu-site.netlify.app/api/cron/check-premium-expirations`
   - **Interval**: 6 horas
   - **Headers**: `Authorization: Bearer sua-chave-cron`

#### **Vantagens:**

- ✅ Gratuito
- ✅ Também monitora uptime
- ✅ Notificações por email

## 🎯 Recomendação

### **Para Produção:**

1. **GitHub Actions** (principal) - gratuito e confiável
2. **EasyCron** (backup) - caso GitHub Actions falhe

### **Configuração Híbrida:**

```yaml
# .github/workflows/cron.yml
name: Premium Checks
on:
  schedule:
    - cron: "0 */6 * * *" # Principal: a cada 6 horas
    - cron: "30 */12 * * *" # Backup: a cada 12 horas (offset)
```

## 🧪 Testando as Alternativas

### **1. Teste Manual:**

```bash
# Testar API diretamente
curl -X GET \
  -H "Authorization: Bearer sua-chave-cron" \
  https://seu-site.netlify.app/api/cron/check-premium-expirations
```

### **2. Verificar Logs:**

- **GitHub Actions**: Actions tab no repositório
- **EasyCron**: Dashboard → Logs
- **Netlify**: Functions → Logs

### **3. Monitorar Execução:**

```bash
# Ver logs do Netlify
netlify logs

# Ver functions específicas
netlify functions:list
```

## 📊 Comparação das Soluções

| Solução           | Custo    | Confiabilidade | Configuração | Logs       |
| ----------------- | -------- | -------------- | ------------ | ---------- |
| GitHub Actions    | Gratuito | ⭐⭐⭐⭐⭐     | Fácil        | ⭐⭐⭐⭐⭐ |
| EasyCron          | Gratuito | ⭐⭐⭐⭐       | Muito Fácil  | ⭐⭐⭐⭐   |
| Netlify Functions | Gratuito | ⭐⭐⭐         | Fácil        | ⭐⭐⭐     |
| Cron-job.org      | Gratuito | ⭐⭐⭐⭐       | Muito Fácil  | ⭐⭐⭐     |
| Uptime Robot      | Gratuito | ⭐⭐⭐         | Fácil        | ⭐⭐⭐     |

## 🔧 Implementação Recomendada

### **1. Configurar GitHub Actions:**

```bash
# Criar arquivo
mkdir -p .github/workflows
# Copiar conteúdo do exemplo acima
```

### **2. Configurar EasyCron como backup:**

- URL: `https://seu-site.netlify.app/api/cron/check-premium-expirations`
- Schedule: `30 */6 * * *` (30 minutos offset)

### **3. Monitorar ambos:**

- GitHub Actions: Logs no repositório
- EasyCron: Dashboard web
- Netlify: Functions logs

## 🆘 Troubleshooting

### **❌ Cron não executa:**

- Verificar URL está correta
- Verificar Authorization header
- Verificar se API responde manualmente

### **❌ Timeout:**

- Otimizar código da API
- Considerar upgrade Netlify
- Usar múltiplas chamadas menores

### **❌ Rate limiting:**

- Adicionar delays entre operações
- Usar batch processing
- Monitorar logs de erro

---

**🎯 Com essas alternativas, o sistema de expiração funcionará perfeitamente no Netlify!**

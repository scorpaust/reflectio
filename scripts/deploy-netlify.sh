#!/bin/bash

# 🚀 Script de Deploy para Netlify - Reflectio

echo "🚀 Preparando deploy para Netlify..."
echo ""

# Verificar se Netlify CLI está instalado
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI não encontrado!"
    echo "📦 Instale com: npm install -g netlify-cli"
    exit 1
fi

# Verificar configurações
echo "🔍 Verificando configurações..."
if [ -f "scripts/deploy-production.js" ]; then
    node scripts/deploy-production.js
    if [ $? -ne 0 ]; then
        echo "❌ Verificação de configurações falhou!"
        exit 1
    fi
else
    echo "⚠️  Script de verificação não encontrado, continuando..."
fi

echo ""
echo "🔨 Fazendo build para produção..."

# Build para produção
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build falhou!"
    exit 1
fi

echo ""
echo "🌐 Fazendo deploy para Netlify..."

# Deploy para produção
netlify deploy --prod --dir=.next

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy concluído com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. 🔗 Configurar webhook do Stripe:"
    echo "   URL: https://seu-site.netlify.app/api/stripe/webhooks"
    echo ""
    echo "2. 🧪 Testar:"
    echo "   - Fazer um pagamento de teste"
    echo "   - Verificar se Premium é ativado"
    echo "   - Testar cancelamento"
    echo ""
    echo "3. 📊 Monitorar:"
    echo "   - Netlify Dashboard → Functions → Logs"
    echo "   - Stripe Dashboard → Webhooks → Recent deliveries"
    echo ""
else
    echo "❌ Deploy falhou!"
    exit 1
fi
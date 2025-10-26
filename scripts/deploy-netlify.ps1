#!/usr/bin/env pwsh

# Script de deploy para Netlify
Write-Host "🚀 Iniciando deploy para Netlify..." -ForegroundColor Green

# Verificar se o Netlify CLI está instalado
if (-not (Get-Command "netlify" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Netlify CLI não encontrado. Instalando..." -ForegroundColor Red
    npm install -g netlify-cli
}

# Limpar cache do Next.js
Write-Host "🧹 Limpando cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .netlify -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

# Verificar versão do Node.js
Write-Host "🔍 Verificando versão do Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan

# Verificar variáveis de ambiente
Write-Host "🔍 Verificando variáveis de ambiente..." -ForegroundColor Yellow
if (-not $env:NEXT_PUBLIC_SUPABASE_URL) {
    Write-Host "⚠️  NEXT_PUBLIC_SUPABASE_URL não definida" -ForegroundColor Yellow
}
if (-not $env:NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    Write-Host "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY não definida" -ForegroundColor Yellow
}

# Verificar dependências
Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow
npm ci

# Build do projeto
Write-Host "🔨 Executando build..." -ForegroundColor Yellow
$env:NETLIFY = "true"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falhou!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green

# Verificar estrutura do build
Write-Host "🔍 Verificando estrutura do build..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Write-Host "✅ Diretório .next encontrado" -ForegroundColor Green
    $buildSize = (Get-ChildItem .next -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Tamanho do build: $([math]::Round($buildSize, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "❌ Diretório .next não encontrado!" -ForegroundColor Red
    exit 1
}

# Deploy para Netlify (deixar o plugin gerenciar o diretório)
Write-Host "🚀 Fazendo deploy..." -ForegroundColor Yellow
netlify deploy --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deploy concluído com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Deploy falhou!" -ForegroundColor Red
    Write-Host "💡 Tente executar 'netlify deploy --prod --debug' para mais informações" -ForegroundColor Yellow
    exit 1
}
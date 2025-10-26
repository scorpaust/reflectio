#!/usr/bin/env node

/**
 * Script de Deploy para Produção - Reflectio
 *
 * Verifica configurações e prepara o ambiente para deploy
 */

const fs = require("fs");
const path = require("path");

console.log("🚀 Preparando deploy para produção...\n");

// Verificar se arquivo .env.production existe
const envProdPath = path.join(__dirname, "..", ".env.production");
if (!fs.existsSync(envProdPath)) {
  console.error("❌ Arquivo .env.production não encontrado!");
  console.log(
    "📋 Copie .env.production.example para .env.production e configure as variáveis."
  );
  process.exit(1);
}

// Ler variáveis de produção
const envContent = fs.readFileSync(envProdPath, "utf8");
const envVars = {};

envContent.split("\n").forEach((line) => {
  if (line.includes("=") && !line.startsWith("#")) {
    const [key, value] = line.split("=");
    envVars[key.trim()] = value.trim();
  }
});

console.log("🔍 Verificando configurações obrigatórias...\n");

// Verificações obrigatórias
const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY",
  "NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY",
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_APP_URL",
  "CRON_SECRET",
  "ADMIN_SECRET_KEY",
];

let missingVars = [];
let warnings = [];

requiredVars.forEach((varName) => {
  if (
    !envVars[varName] ||
    envVars[varName].includes("xxxxx") ||
    envVars[varName].includes("seu-")
  ) {
    missingVars.push(varName);
  }
});

// Verificações específicas
if (
  envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
  !envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_live_")
) {
  warnings.push(
    "⚠️  STRIPE_PUBLISHABLE_KEY não é de produção (deve começar com pk_live_)"
  );
}

if (
  envVars.STRIPE_SECRET_KEY &&
  !envVars.STRIPE_SECRET_KEY.startsWith("sk_live_")
) {
  warnings.push(
    "⚠️  STRIPE_SECRET_KEY não é de produção (deve começar com sk_live_)"
  );
}

if (
  envVars.NEXT_PUBLIC_APP_URL &&
  envVars.NEXT_PUBLIC_APP_URL.includes("localhost")
) {
  warnings.push("⚠️  APP_URL ainda aponta para localhost");
}

if (envVars.MODERATION_STRICT_MODE !== "true") {
  warnings.push("⚠️  MODERATION_STRICT_MODE deveria ser true em produção");
}

// Mostrar resultados
if (missingVars.length > 0) {
  console.error("❌ Variáveis obrigatórias não configuradas:");
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.log(
    "\n📋 Configure essas variáveis em .env.production antes do deploy.\n"
  );
  process.exit(1);
}

if (warnings.length > 0) {
  console.log("⚠️  Avisos:");
  warnings.forEach((warning) => {
    console.log(`   ${warning}`);
  });
  console.log("");
}

console.log("✅ Todas as configurações obrigatórias estão presentes!\n");

// Verificar se vercel.json existe
const vercelJsonPath = path.join(__dirname, "..", "vercel.json");
if (!fs.existsSync(vercelJsonPath)) {
  console.log("📝 Criando vercel.json...");
  const vercelConfig = {
    crons: [
      {
        path: "/api/cron/check-premium-expirations",
        schedule: "0 */6 * * *",
      },
    ],
  };
  fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));
  console.log("✅ vercel.json criado com cron jobs configurados\n");
}

// Checklist final
console.log("📋 Checklist pré-deploy:");
console.log("");
console.log("🔧 Configuração:");
console.log("   ✅ Variáveis de ambiente configuradas");
console.log("   ✅ Cron jobs configurados");
console.log("");
console.log("🏪 Stripe (verifique manualmente):");
console.log("   [ ] Produtos criados em Live mode");
console.log("   [ ] Customer Portal ativado");
console.log("   [ ] Webhook configurado para domínio real");
console.log("");
console.log("🗄️  Supabase (verifique manualmente):");
console.log("   [ ] RLS ativado nas tabelas sensíveis");
console.log("   [ ] Políticas de segurança configuradas");
console.log("");
console.log("🌐 Deploy:");
console.log("   [ ] Domínio configurado");
console.log("   [ ] DNS apontando para Vercel");
console.log("   [ ] SSL configurado");
console.log("");
console.log("🧪 Testes:");
console.log("   [ ] Teste com cartão real (valor baixo)");
console.log("   [ ] Webhook funcionando");
console.log("   [ ] Cancelamento funcionando");
console.log("");

console.log("🚀 Pronto para deploy!");
console.log("");
console.log("Comandos para deploy:");
console.log("   npm run build          # Testar build local");
console.log("   vercel --prod          # Deploy para produção");
console.log("   vercel logs            # Monitorar logs");
console.log("");

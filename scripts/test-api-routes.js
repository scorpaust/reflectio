#!/usr/bin/env node

// Script para testar se as API routes estão funcionando em produção
const https = require("https");
const http = require("http");

const SITE_URL = process.env.SITE_URL || "https://your-site.netlify.app";

const testRoutes = [
  "/api/stripe/portal/test",
  "/api/contact",
  "/api/stripe/checkout",
];

async function testRoute(path) {
  return new Promise((resolve) => {
    const url = `${SITE_URL}${path}`;
    const client = url.startsWith("https") ? https : http;

    console.log(`🧪 Testando: ${url}`);

    const req = client.request(url, { method: "GET" }, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const contentType = res.headers["content-type"] || "";
        const isJson = contentType.includes("application/json");
        const isHtml = contentType.includes("text/html");

        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content-Type: ${contentType}`);

        if (isHtml && data.includes("<!DOCTYPE")) {
          console.log(`   ❌ ERRO: Retornou HTML em vez de JSON`);
          resolve({ path, success: false, error: "HTML_RESPONSE" });
        } else if (isJson) {
          try {
            const parsed = JSON.parse(data);
            console.log(`   ✅ JSON válido recebido`);
            resolve({ path, success: true, data: parsed });
          } catch (e) {
            console.log(`   ❌ ERRO: JSON inválido`);
            resolve({ path, success: false, error: "INVALID_JSON" });
          }
        } else {
          console.log(`   ⚠️  Resposta não é JSON nem HTML`);
          resolve({ path, success: false, error: "UNKNOWN_CONTENT" });
        }
      });
    });

    req.on("error", (error) => {
      console.log(`   ❌ ERRO de conexão: ${error.message}`);
      resolve({ path, success: false, error: error.message });
    });

    req.setTimeout(10000, () => {
      console.log(`   ❌ TIMEOUT`);
      req.destroy();
      resolve({ path, success: false, error: "TIMEOUT" });
    });

    req.end();
  });
}

async function runTests() {
  console.log(`🚀 Testando API routes em: ${SITE_URL}\n`);

  const results = [];

  for (const route of testRoutes) {
    const result = await testRoute(route);
    results.push(result);
    console.log(""); // linha em branco
  }

  console.log("📊 RESUMO DOS TESTES:");
  console.log("=".repeat(50));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Sucessos: ${successful.length}/${results.length}`);
  console.log(`❌ Falhas: ${failed.length}/${results.length}`);

  if (failed.length > 0) {
    console.log("\n❌ ROTAS COM PROBLEMA:");
    failed.forEach((f) => {
      console.log(`   ${f.path} - ${f.error}`);
    });

    if (failed.some((f) => f.error === "HTML_RESPONSE")) {
      console.log("\n💡 DIAGNÓSTICO:");
      console.log("   As API routes estão retornando HTML em vez de JSON.");
      console.log(
        "   Isso indica que o plugin @netlify/plugin-nextjs não está funcionando."
      );
      console.log("   Verifique se o plugin está configurado no netlify.toml");
    }
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

runTests().catch(console.error);

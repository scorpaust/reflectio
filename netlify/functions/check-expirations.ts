import { schedule } from "@netlify/functions";

// Função agendada para verificar expirações Premium
// Executa a cada 6 horas: 0 */6 * * *
const handler = schedule("0 */6 * * *", async (event, context) => {
  console.log("🕒 [NETLIFY CRON] Iniciando verificação de expirações...");

  try {
    // URL da aplicação
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://reflectio.netlify.app";

    // Chamar API interna de verificação
    const response = await fetch(
      `${appUrl}/api/cron/check-premium-expirations`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
          "Content-Type": "application/json",
          "User-Agent": "Netlify-Cron/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("✅ [NETLIFY CRON] Verificação concluída:", {
      checked: data.checked_count,
      expired: data.expired_count,
      timestamp: data.timestamp,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Cron job executado com sucesso",
        data: data,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error: any) {
    console.error("❌ [NETLIFY CRON] Erro na verificação:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
});

export { handler };

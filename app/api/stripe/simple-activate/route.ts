import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  try {
    console.log("=== SIMPLE ACTIVATE API START ===");

    // Usar client-side Supabase (mais simples)
    const supabase = createClient();

    // Simular ativação Premium
    return NextResponse.json({
      success: true,
      message:
        "API funcionando - use o botão Forçar Premium no painel de debug",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro na simple-activate:", error);
    return NextResponse.json(
      {
        error: error.message || "Erro interno do servidor",
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

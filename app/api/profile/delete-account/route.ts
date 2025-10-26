import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { auditService } from "@/lib/services/auditService";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter dados do perfil antes de eliminar
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    // Log da tentativa de eliminação de conta
    await auditService.logSuccessfulAccess(
      user.id,
      "delete_account_request",
      "profile",
      {
        metadata: {
          userEmail: user.email,
          userName: profile.full_name,
          isPremium: profile.is_premium,
          totalPosts: profile.total_posts || 0,
          totalReflections: profile.total_reflections || 0,
          totalConnections: profile.total_connections || 0,
        },
      }
    );

    // Iniciar transação para eliminar todos os dados relacionados
    // Nota: O Supabase não suporta transações explícitas, mas as foreign keys
    // com CASCADE devem cuidar da maioria das eliminações relacionadas

    try {
      // 1. Eliminar reflexões do utilizador
      const { error: reflectionsError } = await supabase
        .from("reflections")
        .delete()
        .eq("author_id", user.id);

      if (reflectionsError) {
        console.error("Erro ao eliminar reflexões:", reflectionsError);
      }

      // 2. Eliminar posts do utilizador
      const { error: postsError } = await supabase
        .from("posts")
        .delete()
        .eq("author_id", user.id);

      if (postsError) {
        console.error("Erro ao eliminar posts:", postsError);
      }

      // 3. Eliminar conexões do utilizador
      const { error: connectionsError } = await supabase
        .from("connections")
        .delete()
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (connectionsError) {
        console.error("Erro ao eliminar conexões:", connectionsError);
      }

      // 4. Eliminar métricas de uso
      const { error: metricsError } = await supabase
        .from("usage_metrics")
        .delete()
        .eq("user_id", user.id);

      if (metricsError) {
        console.error("Erro ao eliminar métricas:", metricsError);
      }

      // 5. Eliminar logs de auditoria
      const { error: auditError } = await supabase
        .from("audit_logs")
        .delete()
        .eq("user_id", user.id);

      if (auditError) {
        console.error("Erro ao eliminar logs de auditoria:", auditError);
      }

      // 6. Eliminar alertas de segurança
      const { error: alertsError } = await supabase
        .from("security_alerts")
        .delete()
        .eq("user_id", user.id);

      if (alertsError) {
        console.error("Erro ao eliminar alertas:", alertsError);
      }

      // 7. Eliminar perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) {
        console.error("Erro ao eliminar perfil:", profileError);
        throw profileError;
      }

      // 8. Finalmente, eliminar o utilizador da autenticação
      // Nota: Isto deve ser feito por último porque elimina a sessão
      const { error: userError } = await supabase.auth.admin.deleteUser(
        user.id
      );

      if (userError) {
        console.error("Erro ao eliminar utilizador da auth:", userError);
        // Não fazer throw aqui porque o perfil já foi eliminado
        // O utilizador pode fazer logout manualmente
      }

      // Log final de sucesso
      console.log(`Conta eliminada com sucesso: ${user.email} (${user.id})`);

      return NextResponse.json({
        success: true,
        message: "Conta eliminada com sucesso",
      });
    } catch (error) {
      console.error("Erro durante eliminação da conta:", error);

      // Log do erro
      await auditService.logPermissionDenial(
        user.id,
        "delete_account_error",
        "profile",
        `Erro durante eliminação: ${error}`,
        {
          metadata: {
            error: error instanceof Error ? error.message : String(error),
          },
        }
      );

      return NextResponse.json(
        {
          error: "Erro interno durante eliminação da conta",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro na API de eliminação de conta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

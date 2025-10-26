import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { permissionService } from "@/lib/services/permissions";

export interface PostPermissionContext {
  user: any;
  postId: string;
  hasAccess: boolean;
  canReflect: boolean;
  upgradePrompt?: boolean;
}

/**
 * Middleware para verificar permissões de acesso a posts
 */
export async function withPostPermissions(
  request: NextRequest,
  postId: string,
  handler: (context: PostPermissionContext) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Não autorizado",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    // Check post access permissions
    const accessResult = await permissionService.checkPostAccess(
      user.id,
      postId
    );

    // Check reflection permissions
    const reflectionResult = await permissionService.checkReflectionPermission(
      user.id,
      postId
    );

    const context: PostPermissionContext = {
      user,
      postId,
      hasAccess: accessResult.allowed,
      canReflect: reflectionResult.allowed,
      upgradePrompt:
        accessResult.upgradePrompt || reflectionResult.upgradePrompt,
    };

    // If no access to post, return 403
    if (!accessResult.allowed) {
      return NextResponse.json(
        {
          error: accessResult.reason || "Acesso negado ao post",
          upgradePrompt: accessResult.upgradePrompt || false,
          code: "POST_ACCESS_DENIED",
        },
        { status: 403 }
      );
    }

    // Call the handler with the context
    return await handler(context);
  } catch (error) {
    console.error("Error in post permissions middleware:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * Middleware específico para verificar permissões de reflexão
 */
export async function withReflectionPermissions(
  request: NextRequest,
  postId: string,
  handler: (context: PostPermissionContext) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Não autorizado",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    // Check reflection permissions
    const reflectionResult = await permissionService.checkReflectionPermission(
      user.id,
      postId
    );

    const context: PostPermissionContext = {
      user,
      postId,
      hasAccess: true, // We assume they can see the post if they're trying to reflect
      canReflect: reflectionResult.allowed,
      upgradePrompt: reflectionResult.upgradePrompt,
    };

    // If no permission to reflect, return 403
    if (!reflectionResult.allowed) {
      return NextResponse.json(
        {
          error:
            reflectionResult.reason ||
            "Não é possível criar reflexão neste post",
          upgradePrompt: reflectionResult.upgradePrompt || false,
          code: "REFLECTION_DENIED",
        },
        { status: 403 }
      );
    }

    // Call the handler with the context
    return await handler(context);
  } catch (error) {
    console.error("Error in reflection permissions middleware:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

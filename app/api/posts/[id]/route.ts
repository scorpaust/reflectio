import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { permissionService } from "@/lib/services/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const resolvedParams = await params;
    const postId = resolvedParams.id;

    // Check if user has access to this post
    const accessResult = await permissionService.checkPostAccess(
      user.id,
      postId
    );

    if (!accessResult.allowed) {
      return NextResponse.json(
        {
          error: accessResult.reason || "Acesso negado",
          upgradePrompt: accessResult.upgradePrompt || false,
          code: "PERMISSION_DENIED",
        },
        { status: 403 }
      );
    }

    // Fetch the post with author information
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:profiles!inner(
          id,
          full_name,
          username,
          avatar_url,
          current_level,
          is_premium
        ),
        reflections(
          id,
          content,
          created_at,
          author:profiles!inner(
            id,
            full_name,
            username,
            avatar_url
          )
        )
      `
      )
      .eq("id", postId)
      .eq("status", "published")
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    // Return the post as is
    const postWithDefaults = post;

    return NextResponse.json({
      post: postWithDefaults,
      canReflect:
        !post.is_premium_content ||
        user.id === post.author_id ||
        (await permissionService.getUserPermissions(user.id))
          .canViewPremiumContent,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

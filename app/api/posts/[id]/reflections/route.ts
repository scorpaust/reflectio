import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withReflectionPermissions } from "@/lib/middleware/postPermissions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const postId = resolvedParams.id;

  return withReflectionPermissions(request, postId, async (context) => {
    try {
      const supabase = await createClient();
      const { content } = await request.json();

      if (!content || content.trim().length === 0) {
        return NextResponse.json(
          { error: "Conteúdo da reflexão é obrigatório" },
          { status: 400 }
        );
      }

      if (content.length > 1000) {
        return NextResponse.json(
          { error: "Reflexão não pode exceder 1000 caracteres" },
          { status: 400 }
        );
      }

      // Create the reflection
      const { data: reflection, error: reflectionError } = await supabase
        .from("reflections")
        .insert({
          post_id: postId,
          author_id: context.user.id,
          content: content.trim(),
        })
        .select(
          `
          *,
          author:profiles!inner(
            id,
            full_name,
            username,
            avatar_url
          )
        `
        )
        .single();

      if (reflectionError) {
        console.error("Error creating reflection:", reflectionError);
        return NextResponse.json(
          { error: "Erro ao criar reflexão" },
          { status: 500 }
        );
      }

      // Update post reflection count
      // TODO: Implement increment_reflection_count function in database
      // const { error: updateError } = await supabase.rpc(
      //   "increment_reflection_count",
      //   { post_id: postId }
      // );

      // if (updateError) {
      //   console.warn("Error updating reflection count:", updateError);
      //   // Don't fail the request for this
      // }

      return NextResponse.json({
        reflection,
        message: "Reflexão criada com sucesso",
      });
    } catch (error) {
      console.error("Error in reflection creation:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const postId = resolvedParams.id;

  return withReflectionPermissions(request, postId, async (context) => {
    try {
      const supabase = await createClient();

      // Fetch reflections for the post
      const { data: reflections, error: reflectionsError } = await supabase
        .from("reflections")
        .select(
          `
          *,
          author:profiles!inner(
            id,
            full_name,
            username,
            avatar_url,
            current_level
          )
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (reflectionsError) {
        console.error("Error fetching reflections:", reflectionsError);
        return NextResponse.json(
          { error: "Erro ao carregar reflexões" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        reflections: reflections || [],
        canReflect: context.canReflect,
      });
    } catch (error) {
      console.error("Error fetching reflections:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }
  });
}

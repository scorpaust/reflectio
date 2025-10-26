import { createClient } from "@/lib/supabase/client";
import { permissionService } from "./permissions";

export interface ReflectionPermissionResult {
  allowed: boolean;
  reason?: string;
  upgradePrompt?: boolean;
}

export class ReflectionPermissionChecker {
  private supabase = createClient();

  /**
   * Verifica se o utilizador pode criar uma reflexão num post específico
   * Regras:
   * - Utilizadores gratuitos só podem criar reflexões em posts públicos de outros utilizadores gratuitos
   * - Utilizadores premium podem criar reflexões em qualquer post
   */
  async canCreateReflection(
    userId: string,
    postId: string
  ): Promise<ReflectionPermissionResult> {
    try {
      // Obter permissões do utilizador
      const userPermissions = await permissionService.getUserPermissions(
        userId
      );

      // Obter dados do post e do autor
      const { data: postData, error: postError } = await this.supabase
        .from("posts")
        .select(
          `
          id,
          is_premium_content,
          author_id,
          author:profiles!posts_author_id_fkey(
            id,
            is_premium,
            premium_expires_at
          )
        `
        )
        .eq("id", postId)
        .single();

      if (postError || !postData) {
        return {
          allowed: false,
          reason: "Post não encontrado",
        };
      }

      // Se é o próprio autor, pode sempre criar reflexões no seu próprio post
      if (postData.author_id === userId) {
        return { allowed: true };
      }

      const post = postData;
      const postAuthor = post.author;

      // Verificar se o autor do post é premium
      const postAuthorIsPremium = this.isAuthorPremium(postAuthor);

      // Verificar se o post é premium
      const postIsPremium = post.is_premium_content || false;

      // Usar a lógica de permissões existente
      const canReflect = userPermissions.canCreateReflectionOnPost(
        postId,
        postAuthorIsPremium,
        postIsPremium
      );

      if (canReflect) {
        return { allowed: true };
      }

      // Determinar a razão específica da restrição
      let reason = "Não é possível criar reflexão neste post";
      let upgradePrompt = false;

      if (postIsPremium) {
        reason =
          "Apenas utilizadores Premium podem criar reflexões em conteúdo Premium";
        upgradePrompt = true;
      } else if (postAuthorIsPremium) {
        reason =
          "Apenas utilizadores Premium podem criar reflexões em posts de utilizadores Premium";
        upgradePrompt = true;
      }

      return {
        allowed: false,
        reason,
        upgradePrompt,
      };
    } catch (error) {
      console.error("Error checking reflection permission:", error);
      return {
        allowed: false,
        reason: "Erro ao verificar permissões de reflexão",
      };
    }
  }

  /**
   * Verifica se um autor é premium baseado no seu perfil
   */
  private isAuthorPremium(author: any): boolean {
    if (!author || !author.is_premium) return false;

    // Se não tem data de expiração, considera ativo
    if (!author.premium_expires_at) return true;

    // Verifica se ainda não expirou
    const expirationDate = new Date(author.premium_expires_at);
    const now = new Date();

    return expirationDate > now;
  }

  /**
   * Obtém informações detalhadas sobre as restrições de reflexão para um post
   */
  async getReflectionRestrictionInfo(
    userId: string,
    postId: string
  ): Promise<{
    canReflect: boolean;
    postIsPremium: boolean;
    authorIsPremium: boolean;
    userIsPremium: boolean;
    restrictionReason?: string;
    upgradeMessage?: string;
  }> {
    try {
      const [userPermissions, postData] = await Promise.all([
        permissionService.getUserPermissions(userId),
        this.supabase
          .from("posts")
          .select(
            `
            id,
            is_premium_content,
            author_id,
            author:profiles!posts_author_id_fkey(
              id,
              is_premium,
              premium_expires_at
            )
          `
          )
          .eq("id", postId)
          .single(),
      ]);

      if (!postData.data) {
        return {
          canReflect: false,
          postIsPremium: false,
          authorIsPremium: false,
          userIsPremium: false,
          restrictionReason: "Post não encontrado",
        };
      }

      const post = postData.data;
      const postAuthor = post.author;
      const postIsPremium = post.is_premium_content || false;
      const authorIsPremium = this.isAuthorPremium(postAuthor);
      const userIsPremium = userPermissions.canViewPremiumContent;

      const canReflect = userPermissions.canCreateReflectionOnPost(
        postId,
        authorIsPremium,
        postIsPremium
      );

      let restrictionReason: string | undefined;
      let upgradeMessage: string | undefined;

      if (!canReflect) {
        if (postIsPremium) {
          restrictionReason = "Conteúdo Premium";
          upgradeMessage =
            "Faça upgrade para Premium para criar reflexões em conteúdo Premium";
        } else if (authorIsPremium) {
          restrictionReason = "Autor Premium";
          upgradeMessage =
            "Faça upgrade para Premium para criar reflexões em posts de utilizadores Premium";
        }
      }

      return {
        canReflect,
        postIsPremium,
        authorIsPremium,
        userIsPremium,
        restrictionReason,
        upgradeMessage,
      };
    } catch (error) {
      console.error("Error getting reflection restriction info:", error);
      return {
        canReflect: false,
        postIsPremium: false,
        authorIsPremium: false,
        userIsPremium: false,
        restrictionReason: "Erro ao verificar permissões",
      };
    }
  }
}

// Instância singleton do serviço
export const reflectionPermissionChecker = new ReflectionPermissionChecker();

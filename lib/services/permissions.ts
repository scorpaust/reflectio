import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/types/user.types";
import { permissionCache } from "./permissionCache";

export interface UserPermissions {
  canViewPremiumContent: boolean;
  canCreatePremiumContent: boolean;
  canCreateReflectionOnPost: (
    postId: string,
    postAuthorIsPremium: boolean,
    postIsPremium: boolean
  ) => boolean;
  canRequestConnection: boolean;
  requiresMandatoryModeration: boolean;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  upgradePrompt?: boolean;
}

export class PermissionService {
  private supabase = createClient();

  /**
   * Verifica se o utilizador tem premium ativo
   */
  private isPremiumActive(profile: UserProfile): boolean {
    if (!profile.is_premium) return false;

    // Se não tem data de expiração, considera ativo
    if (!profile.premium_expires_at) return true;

    // Verifica se ainda não expirou
    const expirationDate = new Date(profile.premium_expires_at);
    const now = new Date();

    return expirationDate > now;
  }

  /**
   * Obtém as permissões do utilizador baseado no seu perfil
   */
  async getUserPermissions(userId: string): Promise<UserPermissions> {
    try {
      // Check cache first
      const cached = permissionCache.get(userId);
      if (cached) {
        return cached.permissions;
      }

      const { data: profile, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !profile) {
        console.error("Error fetching user profile for permissions:", error);
        // Retorna permissões de utilizador gratuito por defeito
        return this.getFreeUserPermissions();
      }

      const isPremium = this.isPremiumActive(profile);
      const permissions = isPremium
        ? this.getPremiumUserPermissions()
        : this.getFreeUserPermissions();

      const premiumStatus = {
        isPremium,
        expiresAt: profile.premium_expires_at,
        since: profile.premium_since,
      };

      // Cache the result
      permissionCache.set(userId, {
        permissions,
        premiumStatus,
      });

      return permissions;
    } catch (error) {
      console.error("Error in getUserPermissions:", error);
      return this.getFreeUserPermissions();
    }
  }

  /**
   * Permissões para utilizadores gratuitos
   */
  private getFreeUserPermissions(): UserPermissions {
    return {
      canViewPremiumContent: false,
      canCreatePremiumContent: false,
      canCreateReflectionOnPost: (
        postId: string,
        postAuthorIsPremium: boolean,
        postIsPremium: boolean
      ) => {
        // Utilizadores gratuitos só podem criar reflexões em posts públicos de outros utilizadores gratuitos
        return !postIsPremium && !postAuthorIsPremium;
      },
      canRequestConnection: false,
      requiresMandatoryModeration: true,
    };
  }

  /**
   * Permissões para utilizadores premium
   */
  private getPremiumUserPermissions(): UserPermissions {
    return {
      canViewPremiumContent: true,
      canCreatePremiumContent: true,
      canCreateReflectionOnPost: () => true, // Premium pode criar reflexões em qualquer post
      canRequestConnection: true,
      requiresMandatoryModeration: false,
    };
  }

  /**
   * Verifica se o utilizador pode aceder a um post específico
   */
  async checkPostAccess(
    userId: string,
    postId: string
  ): Promise<PermissionCheckResult> {
    try {
      const [permissions, postData] = await Promise.all([
        this.getUserPermissions(userId),
        this.supabase
          .from("posts")
          .select("is_premium_content, author_id")
          .eq("id", postId)
          .single(),
      ]);

      if (!postData.data) {
        return {
          allowed: false,
          reason: "Post não encontrado",
        };
      }

      const post = postData.data;

      // Se o post não é premium, todos podem ver
      if (!post.is_premium_content) {
        return { allowed: true };
      }

      // Se é o próprio autor, pode sempre ver
      if (post.author_id === userId) {
        return { allowed: true };
      }

      // Se é premium e o utilizador pode ver conteúdo premium
      if (permissions.canViewPremiumContent) {
        return { allowed: true };
      }

      return {
        allowed: false,
        reason: "Conteúdo premium requer subscrição",
        upgradePrompt: true,
      };
    } catch (error) {
      console.error("Error checking post access:", error);
      return {
        allowed: false,
        reason: "Erro ao verificar acesso",
      };
    }
  }

  /**
   * Verifica se o utilizador pode criar uma reflexão num post específico
   */
  async checkReflectionPermission(
    userId: string,
    postId: string
  ): Promise<PermissionCheckResult> {
    try {
      const [permissions, postData, authorData] = await Promise.all([
        this.getUserPermissions(userId),
        this.supabase
          .from("posts")
          .select("is_premium_content, author_id")
          .eq("id", postId)
          .single(),
        this.supabase
          .from("posts")
          .select(
            `
            author_id,
            profiles!inner(is_premium, premium_expires_at)
          `
          )
          .eq("id", postId)
          .single(),
      ]);

      if (!postData.data || !authorData.data) {
        return {
          allowed: false,
          reason: "Post não encontrado",
        };
      }

      const post = postData.data;
      const authorProfile = authorData.data.profiles;
      const postAuthorIsPremium = this.isPremiumActive(
        authorProfile as UserProfile
      );

      const canReflect = permissions.canCreateReflectionOnPost(
        postId,
        postAuthorIsPremium,
        post.is_premium_content || false
      );

      if (canReflect) {
        return { allowed: true };
      }

      let reason = "Não é possível criar reflexão neste post";
      if (post.is_premium_content) {
        reason = "Não é possível criar reflexões em conteúdo premium";
      } else if (postAuthorIsPremium) {
        reason =
          "Não é possível criar reflexões em posts de utilizadores premium";
      }

      return {
        allowed: false,
        reason,
        upgradePrompt: true,
      };
    } catch (error) {
      console.error("Error checking reflection permission:", error);
      return {
        allowed: false,
        reason: "Erro ao verificar permissões",
      };
    }
  }

  /**
   * Verifica se o utilizador pode realizar uma ação de conexão
   */
  async checkConnectionPermission(
    userId: string,
    action: "request" | "respond"
  ): Promise<PermissionCheckResult> {
    try {
      const permissions = await this.getUserPermissions(userId);

      if (action === "respond") {
        // Todos os utilizadores podem responder a pedidos de conexão
        return { allowed: true };
      }

      if (action === "request") {
        if (permissions.canRequestConnection) {
          return { allowed: true };
        }

        return {
          allowed: false,
          reason: "Apenas utilizadores premium podem solicitar conexões",
          upgradePrompt: true,
        };
      }

      return {
        allowed: false,
        reason: "Ação não reconhecida",
      };
    } catch (error) {
      console.error("Error checking connection permission:", error);
      return {
        allowed: false,
        reason: "Erro ao verificar permissões",
      };
    }
  }

  /**
   * Obtém o status premium de um utilizador específico
   */
  async getUserPremiumStatus(userId: string): Promise<{
    isPremium: boolean;
    expiresAt: string | null;
    since: string | null;
  }> {
    try {
      // Check cache first
      const cached = permissionCache.get(userId);
      if (cached) {
        return cached.premiumStatus;
      }

      const { data: profile, error } = await this.supabase
        .from("profiles")
        .select("is_premium, premium_expires_at, premium_since")
        .eq("id", userId)
        .single();

      if (error || !profile) {
        return {
          isPremium: false,
          expiresAt: null,
          since: null,
        };
      }

      const isPremium = this.isPremiumActive(profile as UserProfile);
      const premiumStatus = {
        isPremium,
        expiresAt: profile.premium_expires_at,
        since: profile.premium_since,
      };

      const permissions = isPremium
        ? this.getPremiumUserPermissions()
        : this.getFreeUserPermissions();

      // Cache the result
      permissionCache.set(userId, {
        permissions,
        premiumStatus,
      });

      return premiumStatus;
    } catch (error) {
      console.error("Error getting user premium status:", error);
      return {
        isPremium: false,
        expiresAt: null,
        since: null,
      };
    }
  }

  /**
   * Invalida o cache de permissões para um utilizador
   * Deve ser chamado quando o status premium do utilizador muda
   */
  invalidateUserCache(userId: string): void {
    permissionCache.invalidate(userId);
  }

  /**
   * Invalida o cache para múltiplos utilizadores
   */
  invalidateMultipleUsersCache(userIds: string[]): void {
    permissionCache.invalidateMultiple(userIds);
  }

  /**
   * Limpa todo o cache de permissões
   */
  clearPermissionCache(): void {
    permissionCache.clear();
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    entries: Array<{
      userId: string;
      age: number;
      ttl: number;
    }>;
  } {
    return permissionCache.getStats();
  }
}

// Instância singleton do serviço
export const permissionService = new PermissionService();

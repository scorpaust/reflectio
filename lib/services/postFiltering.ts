import { createClient } from "@/lib/supabase/client";
import { permissionService } from "./permissions";
import { Post } from "@/types/post.types";
import { optimizedQueryService } from "./optimizedQueries";

export interface PostFilterOptions {
  includeOwnPosts?: boolean;
  limit?: number;
  offset?: number;
}

export interface FilteredPostsResult {
  posts: Post[];
  hasMore: boolean;
  totalCount: number;
}

export class PostFilterService {
  private supabase = createClient();

  /**
   * Filtra posts baseado nas permissões do utilizador
   * Remove posts premium para utilizadores gratuitos
   */
  async filterPostsForUser(
    posts: Post[],
    userId: string,
    options: PostFilterOptions = {}
  ): Promise<Post[]> {
    try {
      const permissions = await permissionService.getUserPermissions(userId);

      return posts.filter((post) => {
        // Se o utilizador é o autor, pode sempre ver o próprio post
        if (options.includeOwnPosts && post.author_id === userId) {
          return true;
        }

        // Se o post não é premium, todos podem ver
        if (!post.is_premium_content) {
          return true;
        }

        // Se é premium e o utilizador pode ver conteúdo premium
        return permissions.canViewPremiumContent;
      });
    } catch (error) {
      console.error("Error filtering posts for user:", error);
      // Em caso de erro, retorna posts não premium por segurança
      return posts.filter((post) => !post.is_premium_content);
    }
  }

  /**
   * Obtém posts visíveis para o utilizador com filtragem a nível de base de dados
   * Mais eficiente que filtrar no cliente - usa queries otimizadas
   */
  async getVisiblePostsForUser(
    userId: string,
    options: PostFilterOptions = {}
  ): Promise<FilteredPostsResult> {
    try {
      const permissions = await permissionService.getUserPermissions(userId);
      const { limit = 20, offset = 0 } = options;

      // Use optimized query service for better performance
      const { posts, totalCount } =
        await optimizedQueryService.getVisiblePostsOptimized(
          userId,
          permissions.canViewPremiumContent,
          { limit, offset }
        );

      return {
        posts: posts.map((post) => ({
          ...post,
          audio_url: null,
          audio_duration: null,
          audio_waveform: null,
          audio_transcript: null,
        })) as Post[],
        hasMore: totalCount > offset + limit,
        totalCount,
      };
    } catch (error) {
      console.error("Error getting visible posts for user:", error);
      return {
        posts: [],
        hasMore: false,
        totalCount: 0,
      };
    }
  }

  /**
   * Obtém posts de um utilizador específico, respeitando permissões
   * Usa queries otimizadas para melhor performance
   */
  async getUserPosts(
    targetUserId: string,
    viewerUserId: string,
    options: PostFilterOptions = {}
  ): Promise<FilteredPostsResult> {
    try {
      const permissions = await permissionService.getUserPermissions(
        viewerUserId
      );
      const { limit = 20, offset = 0 } = options;

      // Use optimized query service
      const { posts, totalCount } =
        await optimizedQueryService.getUserPostsOptimized(
          targetUserId,
          viewerUserId,
          permissions.canViewPremiumContent,
          { limit, offset }
        );

      return {
        posts: posts.map((post) => ({
          ...post,
          audio_url: null,
          audio_duration: null,
          audio_waveform: null,
          audio_transcript: null,
        })) as Post[],
        hasMore: totalCount > offset + limit,
        totalCount,
      };
    } catch (error) {
      console.error("Error getting user posts:", error);
      return {
        posts: [],
        hasMore: false,
        totalCount: 0,
      };
    }
  }

  /**
   * Verifica se um post específico é visível para o utilizador
   */
  async isPostVisibleToUser(postId: string, userId: string): Promise<boolean> {
    try {
      const accessResult = await permissionService.checkPostAccess(
        userId,
        postId
      );
      return accessResult.allowed;
    } catch (error) {
      console.error("Error checking post visibility:", error);
      return false;
    }
  }

  /**
   * Obtém estatísticas de posts para o utilizador
   * Usa queries otimizadas para melhor performance
   */
  async getPostStats(userId: string): Promise<{
    totalPosts: number;
    premiumPosts: number;
    publicPosts: number;
    visibleToUser: number;
  }> {
    try {
      const permissions = await permissionService.getUserPermissions(userId);

      // Use optimized query service for stats
      const stats = await optimizedQueryService.getPostStatsOptimized(
        userId,
        permissions.canViewPremiumContent
      );

      return {
        totalPosts: stats.totalPremium + stats.totalPublic,
        premiumPosts: stats.totalPremium,
        publicPosts: stats.totalPublic,
        visibleToUser: stats.totalVisible,
      };
    } catch (error) {
      console.error("Error getting post stats:", error);
      return {
        totalPosts: 0,
        premiumPosts: 0,
        publicPosts: 0,
        visibleToUser: 0,
      };
    }
  }
}

// Instância singleton do serviço
export const postFilterService = new PostFilterService();

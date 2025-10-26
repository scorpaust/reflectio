import { createClient } from "@/lib/supabase/client";
import { Post } from "@/types/post.types";

export interface OptimizedQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: "created_at" | "updated_at";
  orderDirection?: "asc" | "desc";
}

export interface BatchPermissionCheck {
  userId: string;
  postIds: string[];
}

/**
 * Serviço com queries otimizadas para verificações de permissões
 */
export class OptimizedQueryService {
  private supabase = createClient();

  /**
   * Query otimizada para buscar posts visíveis usando índices
   * Utiliza o índice idx_posts_premium_content_author
   */
  async getVisiblePostsOptimized(
    userId: string,
    isPremium: boolean,
    options: OptimizedQueryOptions = {}
  ): Promise<{ posts: Post[]; totalCount: number }> {
    const {
      limit = 20,
      offset = 0,
      orderBy = "created_at",
      orderDirection = "desc",
    } = options;

    try {
      let query = this.supabase.from("posts").select(
        `
          id,
          title,
          content,
          author_id,
          is_premium_content,
          created_at,
          updated_at,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
            is_premium
          )
        `,
        { count: "exact" }
      );

      if (isPremium) {
        // Premium users can see all posts - no filtering needed
        query = query.order(orderBy, { ascending: orderDirection === "asc" });
      } else {
        // Free users: show non-premium posts OR own posts
        // This leverages the idx_posts_premium_content_author index
        query = query
          .or(`is_premium_content.is.false,author_id.eq.${userId}`)
          .order(orderBy, { ascending: orderDirection === "asc" });
      }

      const { data, error, count } = await query.range(
        offset,
        offset + limit - 1
      );

      if (error) {
        console.error("Error in optimized posts query:", error);
        return { posts: [], totalCount: 0 };
      }

      return {
        posts: data as unknown as Post[],
        totalCount: count || 0,
      };
    } catch (error) {
      console.error("Error in getVisiblePostsOptimized:", error);
      return { posts: [], totalCount: 0 };
    }
  }

  /**
   * Query otimizada para buscar posts de um utilizador específico
   * Utiliza o índice idx_posts_author_created
   */
  async getUserPostsOptimized(
    targetUserId: string,
    viewerUserId: string,
    viewerIsPremium: boolean,
    options: OptimizedQueryOptions = {}
  ): Promise<{ posts: Post[]; totalCount: number }> {
    const {
      limit = 20,
      offset = 0,
      orderBy = "created_at",
      orderDirection = "desc",
    } = options;

    try {
      let query = this.supabase
        .from("posts")
        .select(
          `
          id,
          title,
          content,
          author_id,
          is_premium_content,
          created_at,
          updated_at,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
            is_premium
          )
        `,
          { count: "exact" }
        )
        .eq("author_id", targetUserId);

      // If viewer is not the author and not premium, filter out premium content
      if (targetUserId !== viewerUserId && !viewerIsPremium) {
        query = query.eq("is_premium_content", false);
      }

      const { data, error, count } = await query
        .order(orderBy, { ascending: orderDirection === "asc" })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error in optimized user posts query:", error);
        return { posts: [], totalCount: 0 };
      }

      return {
        posts: data as unknown as Post[],
        totalCount: count || 0,
      };
    } catch (error) {
      console.error("Error in getUserPostsOptimized:", error);
      return { posts: [], totalCount: 0 };
    }
  }

  /**
   * Verificação em lote de permissões de posts
   * Mais eficiente que verificações individuais
   */
  async batchCheckPostPermissions(
    checks: BatchPermissionCheck[]
  ): Promise<Map<string, Set<string>>> {
    const results = new Map<string, Set<string>>();

    try {
      // Get all unique user IDs and post IDs
      const userIds = [...new Set(checks.map((c) => c.userId))];
      const allPostIds = [...new Set(checks.flatMap((c) => c.postIds))];

      // Batch fetch user premium statuses
      const { data: profiles } = await this.supabase
        .from("profiles")
        .select("id, is_premium, premium_expires_at")
        .in("id", userIds);

      // Batch fetch post data
      const { data: posts } = await this.supabase
        .from("posts")
        .select("id, author_id, is_premium_content")
        .in("id", allPostIds);

      if (!profiles || !posts) {
        return results;
      }

      // Create lookup maps
      const profileMap = new Map(profiles.map((p) => [p.id, p]));
      const postMap = new Map(posts.map((p) => [p.id, p]));

      // Process each check
      for (const check of checks) {
        const allowedPosts = new Set<string>();
        const profile = profileMap.get(check.userId);

        if (!profile) {
          results.set(check.userId, allowedPosts);
          continue;
        }

        const isPremium = this.isPremiumActive(profile);

        for (const postId of check.postIds) {
          const post = postMap.get(postId);
          if (!post) continue;

          // Check if user can access this post
          if (
            !post.is_premium_content || // Public post
            post.author_id === check.userId || // Own post
            isPremium // Premium user
          ) {
            allowedPosts.add(postId);
          }
        }

        results.set(check.userId, allowedPosts);
      }

      return results;
    } catch (error) {
      console.error("Error in batch permission check:", error);
      return results;
    }
  }

  /**
   * Query otimizada para estatísticas de posts
   * Utiliza índices para contagens rápidas
   */
  async getPostStatsOptimized(
    userId: string,
    isPremium: boolean
  ): Promise<{
    totalVisible: number;
    totalPremium: number;
    totalPublic: number;
    ownPosts: number;
  }> {
    try {
      const queries = await Promise.all([
        // Count total premium posts
        this.supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("is_premium_content", true),

        // Count total public posts
        this.supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("is_premium_content", false),

        // Count user's own posts
        this.supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("author_id", userId),
      ]);

      const [premiumResult, publicResult, ownResult] = queries;

      const totalPremium = premiumResult.count || 0;
      const totalPublic = publicResult.count || 0;
      const ownPosts = ownResult.count || 0;

      // Calculate visible posts based on premium status
      const totalVisible = isPremium ? totalPremium + totalPublic : totalPublic;

      return {
        totalVisible,
        totalPremium,
        totalPublic,
        ownPosts,
      };
    } catch (error) {
      console.error("Error in getPostStatsOptimized:", error);
      return {
        totalVisible: 0,
        totalPremium: 0,
        totalPublic: 0,
        ownPosts: 0,
      };
    }
  }

  /**
   * Query otimizada para buscar reflexões com permissões
   * Utiliza o índice idx_reflections_post_author
   */
  async getReflectionsWithPermissions(
    postId: string,
    viewerUserId: string,
    viewerIsPremium: boolean,
    options: OptimizedQueryOptions = {}
  ): Promise<any[]> {
    const { limit = 20, offset = 0 } = options;

    try {
      // First check if viewer can see the post
      const { data: post } = await this.supabase
        .from("posts")
        .select("is_premium_content, author_id")
        .eq("id", postId)
        .single();

      if (!post) return [];

      // Check post access
      const canViewPost =
        !post.is_premium_content ||
        post.author_id === viewerUserId ||
        viewerIsPremium;

      if (!canViewPost) return [];

      // Fetch reflections with optimized query
      const { data: reflections } = await this.supabase
        .from("reflections")
        .select(
          `
          id,
          content,
          author_id,
          post_id,
          created_at,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url
          )
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      return reflections || [];
    } catch (error) {
      console.error("Error in getReflectionsWithPermissions:", error);
      return [];
    }
  }

  /**
   * Helper method to check if premium is active
   */
  private isPremiumActive(profile: any): boolean {
    if (!profile.is_premium) return false;
    if (!profile.premium_expires_at) return true;

    const expirationDate = new Date(profile.premium_expires_at);
    return expirationDate > new Date();
  }
}

export const optimizedQueryService = new OptimizedQueryService();

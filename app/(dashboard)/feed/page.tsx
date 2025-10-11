"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PostWithAuthor } from "@/types/post.types";
import { PostCard } from "@/components/feed/PostCard";
import { CreatePost } from "@/components/feed/CreatePost";
import { PremiumModal } from "@/components/premium/PremiumModal";

import { useAuth } from "@/components/providers/AuthProvider";

export default function FeedPage() {
  console.log("🎨 [FeedPage] Component rendering");
  const { profile } = useAuth();
  const supabase = createClient();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  console.log("📊 [FeedPage] Current state:", {
    isLoading,
    postsCount: posts.length,
  });

  const fetchPosts = async () => {
    console.log("🔄 [fetchPosts] Starting...");
    setIsLoading(true);
    try {
      console.log("📡 [fetchPosts] Fetching posts from Supabase...");

      // Simplified query without JOIN to avoid RLS timeout issues
      // We'll fetch author data separately if needed
      const fetchPromise = supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(20);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log("⏱️ [fetchPosts] Timeout reached (5s)");
          reject(new Error("Fetch timeout"));
        }, 5000);
      });

      console.log("⏳ [fetchPosts] Waiting for response (max 5s)...");
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      const { data, error } = result as any;

      console.log("✅ [fetchPosts] Response received:", {
        dataCount: data?.length || 0,
        hasError: !!error,
        errorMessage: error?.message,
      });

      if (error) {
        console.error("❌ [fetchPosts] Posts table error:", error.message);
        setPosts([]);
        return;
      }

      if (!data || data.length === 0) {
        console.log("ℹ️ [fetchPosts] No posts found");
        setPosts([]);
        return;
      }

      // Fetch authors separately to avoid RLS timeout with JOINs
      console.log("👥 [fetchPosts] Fetching authors for", data.length, "posts");
      const authorIds = [
        ...new Set(data.map((post: any) => post.author_id).filter(Boolean)),
      ] as string[];

      const { data: authors, error: authorsError } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, current_level")
        .in("id", authorIds);

      console.log("👥 [fetchPosts] Authors fetched:", {
        count: authors?.length || 0,
        hasError: !!authorsError,
      });

      // Combine posts with author data
      const postsWithAuthors = data.map((post: any) => ({
        ...post,
        author: authors?.find((author) => author.id === post.author_id) || null,
      }));

      console.log(
        "✅ [fetchPosts] Setting posts with authors:",
        postsWithAuthors.length
      );
      setPosts(postsWithAuthors as PostWithAuthor[]);
    } catch (error) {
      console.error("❌ [fetchPosts] Error fetching posts:", error);
      setPosts([]);
    } finally {
      console.log("🏁 [fetchPosts] Setting isLoading to false");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("🎬 [useEffect] Component mounted, calling fetchPosts");
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReflect = (postId: string) => {
    if (!profile?.is_premium) {
      setShowPremiumModal(true);
      return;
    }
    // TODO: Abrir modal de reflexão
    console.log("Refletir sobre post:", postId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar conteúdos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Feed Cultural</h2>
        <p className="text-gray-700">
          Explore reflexões profundas, críticas de livros, filmes e pensamentos
          filosóficos compartilhados pela comunidade.
        </p>
      </div>

      <CreatePost onPostCreated={fetchPosts} />

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-600 mb-4">
            Clique para carregar os conteúdos publicados.
          </p>
          <button
            onClick={fetchPosts}
            disabled={isLoading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? "A carregar..." : "Carregar Posts"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onReflect={handleReflect}
              onUpgrade={() => setShowPremiumModal(true)}
            />
          ))}
        </div>
      )}

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}

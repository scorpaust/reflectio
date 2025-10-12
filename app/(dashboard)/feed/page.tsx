"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PostWithAuthor } from "@/types/post.types";
import { PostCard } from "@/components/feed/PostCard";
import { CreatePost } from "@/components/feed/CreatePost";
import { ReflectionModal } from "@/components/feed/ReflectionModal";
import { PremiumModal } from "@/components/premium/PremiumModal";
import { useAuth } from "@/components/providers/AuthProvider";

export default function FeedPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          author:profiles(id, full_name, username, avatar_url, current_level)
        `
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setPosts(data as PostWithAuthor[]);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleReflect = (postId: string, postTitle: string) => {
    if (!profile?.is_premium) {
      setShowPremiumModal(true);
      return;
    }
    setSelectedPost({ id: postId, title: postTitle });
  };

  const handleReflectionCreated = () => {
    // Atualizar o contador do post específico
    if (selectedPost) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === selectedPost.id
            ? { ...post, reflection_count: post.reflection_count + 1 }
            : post
        )
      );
    }
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
            Ainda não há conteúdos publicados.
          </p>
          {profile?.is_premium && (
            <p className="text-sm text-gray-500">
              Seja o primeiro a compartilhar uma reflexão!
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onReflect={() => handleReflect(post.id, post.title)}
              onUpgrade={() => setShowPremiumModal(true)}
            />
          ))}
        </div>
      )}

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />

      {selectedPost && (
        <ReflectionModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          postId={selectedPost.id}
          postTitle={selectedPost.title}
          onReflectionCreated={handleReflectionCreated}
        />
      )}
    </div>
  );
}

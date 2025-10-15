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
  const [filterType, setFilterType] = useState<"all" | "text" | "audio">("all");

  const fetchPosts = async () => {
    try {
      let query = supabase
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

      // Aplicar filtro
      if (filterType === "audio") {
        query = query.not("audio_url", "is", null);
      } else if (filterType === "text") {
        query = query.is("audio_url", null);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Ensure all posts have the required audio fields with defaults
      const postsWithDefaults = (data || []).map((post) => ({
        ...post,
        audio_url: (post as any).audio_url || null,
        audio_duration: (post as any).audio_duration || null,
        audio_waveform: (post as any).audio_waveform || null,
        audio_transcript: (post as any).audio_transcript || null,
      })) as PostWithAuthor[];

      setPosts(postsWithDefaults);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterType]);

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

  const handleDeletePost = async (postId: string) => {
    const supabase = createClient();

    try {
      // Primeiro, tentar apagar o arquivo de áudio se existir
      const postToDelete = posts.find((p) => p.id === postId);
      if (postToDelete?.audio_url) {
        try {
          // Extrair o caminho do arquivo da URL
          const urlParts = postToDelete.audio_url.split("/");
          const bucketIndex =
            urlParts.findIndex((part) => part === "public") + 1;
          const bucketName = urlParts[bucketIndex];
          const filePath = urlParts.slice(bucketIndex + 1).join("/");

          console.log("Deleting audio file:", { bucketName, filePath });

          const { error: storageError } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

          if (storageError) {
            console.warn("Failed to delete audio file:", storageError);
            // Continuar mesmo se falhar a apagar o áudio
          }
        } catch (error) {
          console.warn("Error deleting audio file:", error);
        }
      }

      // Apagar o post da base de dados
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) throw error;

      // Remover o post da lista local
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

      console.log("Post deleted successfully");
    } catch (error: any) {
      console.error("Error deleting post:", error);
      throw new Error(error.message || "Erro ao apagar o post");
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

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilterType("all")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filterType === "all"
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilterType("text")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filterType === "text"
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          ✍️ Texto
        </button>
        <button
          onClick={() => setFilterType("audio")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filterType === "audio"
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          🎙️ Áudio
        </button>
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
              onDelete={handleDeletePost}
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

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Post } from "@/types/post.types";
import { Book, Film, Image as ImageIcon, MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface UserPostsProps {
  userId: string;
}

export function UserPosts({ userId }: UserPostsProps) {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", userId)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      // Filter and transform data to match Post interface
      const validPosts = (data || [])
        .filter((post) => post.status !== null && post.created_at !== null)
        .map((post) => ({
          ...post,
          sources: Array.isArray(post.sources)
            ? post.sources
            : post.sources
            ? JSON.parse(post.sources as string)
            : [],
          view_count: post.view_count || 0,
          reflection_count: post.reflection_count || 0,
          quality_score: post.quality_score || 0,
          is_moderated: post.is_moderated || false,
          is_premium_content: post.is_premium_content || false,
        })) as Post[];

      setPosts(validPosts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "book":
        return <Book className="w-4 h-4" />;
      case "film":
        return <Film className="w-4 h-4" />;
      case "photo":
        return <ImageIcon className="w-4 h-4" />;
      case "thought":
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-600 text-sm">A carregar posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">Nenhum post publicado ainda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            {getTypeIcon(post.type)}
            <span className="text-xs uppercase font-semibold">{post.type}</span>
            <span className="text-gray-400">•</span>
            <span className="text-xs">{formatDate(post.created_at)}</span>
          </div>

          <h4 className="font-bold text-gray-800 mb-2 line-clamp-2">
            {post.title}
          </h4>

          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {post.content}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {post.reflection_count}
            </span>
            {post.sources && post.sources.length > 0 && (
              <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                {post.sources.length}{" "}
                {post.sources.length === 1 ? "fonte" : "fontes"}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

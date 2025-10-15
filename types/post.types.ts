export type ContentType = "book" | "film" | "photo" | "thought";
export type PostStatus = "draft" | "published" | "archived" | "moderated";

export interface Post {
  id: string;
  author_id: string;
  title: string;
  content: string;
  type: ContentType;
  status: PostStatus;
  is_premium_content: boolean;
  sources: string[];
  view_count: number;
  reflection_count: number;
  quality_score: number;
  is_moderated: boolean;
  moderation_reason: string | null;
  created_at: string;
  updated_at: string;

  // Novos campos de áudio
  audio_url: string | null;
  audio_duration: number | null;
  audio_waveform: number[] | null;
  audio_transcript: string | null;
}

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    full_name: string;
    username: string | null;
    avatar_url: string | null;
    current_level: number;
  };
}

export interface Reflection {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  sources: string[];
  quality_score: number;
  has_sources: boolean;
  is_constructive: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReflectionWithAuthor extends Reflection {
  author: {
    id: string;
    full_name: string;
    username: string | null;
    avatar_url: string | null;
    current_level: number;
  };
}

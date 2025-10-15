export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  current_level: number | null;
  quality_score: number | null;
  is_premium: boolean | null;
  premium_since: string | null;
  premium_expires_at: string | null;
  total_posts: number | null;
  total_reflections: number | null;
  total_connections: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Level {
  id: number;
  name: string;
  icon: string;
  color: string;
  min_quality_score: number;
}

export const LEVELS: Record<number, Level> = {
  1: {
    id: 1,
    name: "Iniciante",
    icon: "🌱",
    color: "text-gray-500",
    min_quality_score: 0,
  },
  2: {
    id: 2,
    name: "Reflexivo",
    icon: "💭",
    color: "text-blue-500",
    min_quality_score: 100,
  },
  3: {
    id: 3,
    name: "Pensador",
    icon: "🧠",
    color: "text-purple-500",
    min_quality_score: 500,
  },
  4: {
    id: 4,
    name: "Filósofo",
    icon: "📜",
    color: "text-amber-500",
    min_quality_score: 1500,
  },
  5: {
    id: 5,
    name: "Sábio",
    icon: "✨",
    color: "text-emerald-500",
    min_quality_score: 3000,
  },
};

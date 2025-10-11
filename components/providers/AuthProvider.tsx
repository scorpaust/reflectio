"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/types/user.types";
import { ROUTES } from "@/lib/constants";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    console.log("🔐 [AuthProvider] useEffect triggered");

    let mounted = true;

    // Set a safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.log("⏱️ [AuthProvider] Safety timeout (3s), stopping loading state");
        setIsLoading(false);
      }
    }, 3000);

    // Primary auth state listener - this is more reliable than getSession
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 [AuthProvider] Auth state changed:", {
        event,
        hasSession: !!session,
        userId: session?.user?.id
      });

      if (!mounted) return;

      clearTimeout(safetyTimeout);

      setUser(session?.user ?? null);

      if (session?.user) {
        console.log("🔐 [AuthProvider] Fetching profile for user:", session.user.id);

        try {
          // Add timeout to profile fetch
          const profilePromise = supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          const profileTimeout = new Promise<{ data: null, error: any }>((resolve) => {
            setTimeout(() => {
              console.log("⏱️ [AuthProvider] Profile fetch timeout (3s)");
              resolve({ data: null, error: { message: "Timeout" } });
            }, 3000);
          });

          const result = await Promise.race([profilePromise, profileTimeout]);
          const { data: profileData, error: profileError } = result;

          console.log("🔐 [AuthProvider] Profile result:", {
            hasProfile: !!profileData,
            error: profileError?.message
          });

          if (mounted && profileData) {
            setProfile(profileData);
          }
        } catch (error) {
          console.error("❌ [AuthProvider] Error fetching profile:", error);
        }
      } else {
        console.log("🔐 [AuthProvider] No session, clearing profile");
        setProfile(null);
      }

      if (mounted) {
        console.log("🔐 [AuthProvider] Setting isLoading to false");
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push(ROUTES.LOGIN);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

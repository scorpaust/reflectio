"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/types/user.types";
import { ROUTES } from "@/lib/constants";
import { checkPremiumExpiration } from "@/lib/utils/premium-expiration";
import { UserPermissions, permissionService } from "@/lib/services/permissions";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  permissions: UserPermissions | null;
  isPremium: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  permissions: null,
  isPremium: false,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  refreshPermissions: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    console.log("🔐 [AuthProvider] useEffect triggered");

    let mounted = true;

    // Set a safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.log(
          "⏱️ [AuthProvider] Safety timeout (3s), stopping loading state"
        );
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
        userId: session?.user?.id,
      });

      if (!mounted) return;

      clearTimeout(safetyTimeout);

      setUser(session?.user ?? null);

      if (session?.user) {
        console.log(
          "🔐 [AuthProvider] Fetching profile for user:",
          session.user.id
        );

        try {
          // Add timeout to profile fetch
          const profilePromise = supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          const profileTimeout = new Promise<{ data: null; error: any }>(
            (resolve) => {
              setTimeout(() => {
                console.log("⏱️ [AuthProvider] Profile fetch timeout (3s)");
                resolve({ data: null, error: { message: "Timeout" } });
              }, 3000);
            }
          );

          const result = await Promise.race([profilePromise, profileTimeout]);
          const { data: profileData, error: profileError } = result;

          console.log("🔐 [AuthProvider] Profile result:", {
            hasProfile: !!profileData,
            error: profileError?.message,
          });

          if (mounted && profileData) {
            // Debug: verificar dados do usuário
            console.log(
              "🔍 [AuthProvider] User metadata:",
              session.user.user_metadata
            );
            console.log(
              "🔍 [AuthProvider] Profile avatar_url:",
              profileData.avatar_url
            );

            // Verificar se precisa atualizar o avatar do Google
            const googleAvatarUrl =
              session.user.user_metadata?.avatar_url ||
              session.user.user_metadata?.picture;
            console.log(
              "🖼️ [AuthProvider] Google avatar URL:",
              googleAvatarUrl
            );

            if (googleAvatarUrl && !profileData.avatar_url) {
              console.log(
                "🖼️ [AuthProvider] Updating avatar from Google:",
                googleAvatarUrl
              );

              // Atualizar avatar no banco
              supabase
                .from("profiles")
                .update({ avatar_url: googleAvatarUrl })
                .eq("id", session.user.id)
                .then(({ error }) => {
                  if (error) {
                    console.error(
                      "❌ [AuthProvider] Error updating avatar:",
                      error
                    );
                  } else {
                    console.log(
                      "✅ [AuthProvider] Avatar updated successfully"
                    );
                    // Atualizar o estado local
                    setProfile((prev) =>
                      prev ? { ...prev, avatar_url: googleAvatarUrl } : null
                    );
                  }
                });
            } else {
              console.log("🖼️ [AuthProvider] No avatar update needed:", {
                hasGoogleAvatar: !!googleAvatarUrl,
                hasProfileAvatar: !!profileData.avatar_url,
              });
            }

            // Verificar expiração do Premium
            if (profileData.is_premium) {
              checkPremiumExpiration(session.user.id).then((result) => {
                if (result.was_expired) {
                  console.log(
                    "🕒 [AuthProvider] Premium expirado, atualizando perfil"
                  );
                  // Atualizar estado local
                  setProfile((prev) =>
                    prev ? { ...prev, is_premium: false } : null
                  );
                }
              });
            }

            setProfile(profileData);

            // Carregar permissões do utilizador
            try {
              console.log("🔐 [AuthProvider] Loading user permissions");
              const userPermissions =
                await permissionService.getUserPermissions(session.user.id);
              const premiumStatus =
                await permissionService.getUserPremiumStatus(session.user.id);

              setPermissions(userPermissions);
              setIsPremium(premiumStatus.isPremium);

              console.log("✅ [AuthProvider] Permissions loaded:", {
                canViewPremium: userPermissions.canViewPremiumContent,
                isPremium: premiumStatus.isPremium,
              });
            } catch (error) {
              console.error(
                "❌ [AuthProvider] Error loading permissions:",
                error
              );
              // Set default free user permissions on error
              setPermissions({
                canViewPremiumContent: false,
                canCreatePremiumContent: false,
                canCreateReflectionOnPost: () => false,
                canRequestConnection: false,
                requiresMandatoryModeration: true,
              });
              setIsPremium(false);
            }
          }
        } catch (error) {
          console.error("❌ [AuthProvider] Error fetching profile:", error);
        }
      } else {
        console.log("🔐 [AuthProvider] No session, clearing profile");
        setProfile(null);
        setPermissions(null);
        setIsPremium(false);
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

  const refreshProfile = async () => {
    if (!user) return;

    try {
      console.log("🔄 [AuthProvider] Refreshing profile for user:", user.id);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(
          "❌ [AuthProvider] Error refreshing profile:",
          profileError
        );
        return;
      }

      if (profileData) {
        console.log("✅ [AuthProvider] Profile refreshed successfully");
        setProfile(profileData);

        // Refresh permissions as well
        await refreshPermissions();
      }
    } catch (error) {
      console.error("❌ [AuthProvider] Error in refreshProfile:", error);
    }
  };

  const refreshPermissions = async () => {
    if (!user) return;

    try {
      console.log(
        "🔄 [AuthProvider] Refreshing permissions for user:",
        user.id
      );

      const [userPermissions, premiumStatus] = await Promise.all([
        permissionService.getUserPermissions(user.id),
        permissionService.getUserPremiumStatus(user.id),
      ]);

      setPermissions(userPermissions);
      setIsPremium(premiumStatus.isPremium);

      console.log("✅ [AuthProvider] Permissions refreshed successfully:", {
        canViewPremium: userPermissions.canViewPremiumContent,
        isPremium: premiumStatus.isPremium,
      });
    } catch (error) {
      console.error("❌ [AuthProvider] Error refreshing permissions:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        permissions,
        isPremium,
        isLoading,
        signOut,
        refreshProfile,
        refreshPermissions,
      }}
    >
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

export const usePermissions = () => {
  const { permissions, isPremium, refreshPermissions } = useAuth();
  return { permissions, isPremium, refreshPermissions };
};

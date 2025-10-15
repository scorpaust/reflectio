import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/database.types";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignore errors during set (pode acontecer em Server Components)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Ignore errors during remove
          }
        },
      },
    }
  );
}

export async function syncGoogleAvatar(userId: string, providerData: any) {
  const supabase = await createServerSupabaseClient();

  try {
    // Verificar se o usuário já tem avatar
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    // Se já tem avatar, não fazer nada
    if (profile?.avatar_url) return;

    // Se veio do Google e tem foto
    const googlePhotoUrl = providerData?.avatar_url || providerData?.picture;

    if (googlePhotoUrl) {
      await supabase
        .from("profiles")
        .update({ avatar_url: googlePhotoUrl })
        .eq("id", userId);
    }
  } catch (error) {
    console.error("Error syncing Google avatar:", error);
  }
}

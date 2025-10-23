import { createClient } from "@/lib/supabase/client";

/**
 * Verifica se o Premium do usuário expirou e atualiza automaticamente
 */
export async function checkPremiumExpiration(userId: string): Promise<{
  is_premium: boolean;
  was_expired: boolean;
  expires_at: string | null;
}> {
  const supabase = createClient();

  try {
    // Buscar dados atuais do usuário
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_premium, premium_expires_at, stripe_subscription_id")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      console.error(
        "Erro ao buscar perfil para verificação de expiração:",
        error
      );
      return { is_premium: false, was_expired: false, expires_at: null };
    }

    // Se não é premium, não há nada para verificar
    if (!profile.is_premium) {
      return {
        is_premium: false,
        was_expired: false,
        expires_at: profile.premium_expires_at,
      };
    }

    // Se não tem data de expiração, manter premium (pode ser conta de teste)
    if (!profile.premium_expires_at) {
      return { is_premium: true, was_expired: false, expires_at: null };
    }

    const now = new Date();
    const expirationDate = new Date(profile.premium_expires_at);

    // Verificar se expirou
    if (now > expirationDate) {
      console.log(
        `🕒 Premium expirado para usuário ${userId}. Expirando em: ${expirationDate}`
      );

      // Desativar Premium
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          // Manter premium_expires_at para histórico
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Erro ao desativar Premium expirado:", updateError);
        return {
          is_premium: true,
          was_expired: false,
          expires_at: profile.premium_expires_at,
        };
      }

      console.log(
        `✅ Premium desativado automaticamente para usuário ${userId}`
      );
      return {
        is_premium: false,
        was_expired: true,
        expires_at: profile.premium_expires_at,
      };
    }

    // Premium ainda válido
    return {
      is_premium: true,
      was_expired: false,
      expires_at: profile.premium_expires_at,
    };
  } catch (error) {
    console.error("Erro na verificação de expiração do Premium:", error);
    return { is_premium: false, was_expired: false, expires_at: null };
  }
}

/**
 * Calcula quantos dias restam até a expiração
 */
export function getDaysUntilExpiration(
  expiresAt: string | null
): number | null {
  if (!expiresAt) return null;

  const now = new Date();
  const expiration = new Date(expiresAt);
  const diffTime = expiration.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Verifica se o Premium expira em breve (próximos 7 dias)
 */
export function isPremiumExpiringSoon(expiresAt: string | null): boolean {
  const daysLeft = getDaysUntilExpiration(expiresAt);
  return daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
}

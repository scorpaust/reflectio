"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { UserPosts } from "@/components/profile/UserPosts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LEVELS } from "@/types/user.types";
import { getInitials, formatDate } from "@/lib/utils";
import {
  Edit,
  Mail,
  Calendar,
  Award,
  BookOpen,
  MessageCircle,
  Users,
  Crown,
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SubscriptionManager } from "@/components/premium/SubscriptionManager";
import { PremiumBanner } from "@/components/premium/PremiumBanner";
import { PremiumModal } from "@/components/premium/PremiumModal";
import { ExpirationWarning } from "@/components/premium/ExpirationWarning";

export default function ProfilePage() {
  const { profile, signOut, refreshProfile } = useAuth();
  const supabase = createClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{
    type: "success" | "canceled" | "processing" | null;
    message: string;
  }>({ type: null, message: "" });

  // useEffect para lidar com retorno do Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const canceled = urlParams.get("canceled");

    if (success) {
      // Limpar URL imediatamente
      window.history.replaceState({}, "", "/profile");

      // Mostrar mensagem de processamento
      setPaymentStatus({
        type: "processing",
        message: "🔄 Processando pagamento... Aguarde alguns segundos.",
      });

      // Verificar status premium periodicamente
      let attempts = 0;
      const maxAttempts = 10;
      const checkInterval = setInterval(async () => {
        attempts++;

        try {
          // Verificar se há session ID salvo
          const sessionId = localStorage.getItem("stripe_session_id");

          if (sessionId) {
            // Em desenvolvimento, tentar simular sucesso após algumas tentativas
            const isDevelopment = process.env.NODE_ENV !== "production";

            if (isDevelopment && attempts >= 3) {
              // Simular sucesso em desenvolvimento
              const simulateResponse = await fetch(
                "/api/stripe/simulate-success",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ sessionId }),
                }
              );

              if (simulateResponse.ok) {
                clearInterval(checkInterval);
                localStorage.removeItem("stripe_session_id");

                setPaymentStatus({
                  type: "success",
                  message:
                    "🧪 [DEV] Pagamento simulado! Bem-vindo ao Reflectio Premium!",
                });

                // Refresh do perfil
                if (refreshProfile) {
                  await refreshProfile();
                }

                setTimeout(() => {
                  setPaymentStatus({ type: null, message: "" });
                }, 5000);

                setTimeout(() => {
                  window.location.reload();
                }, 2000);
                return;
              }
            }

            // Tentar API de verificação normal (funciona se webhooks estiverem configurados)
            const response = await fetch("/api/stripe/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ sessionId }),
            });

            if (response.ok) {
              const data = await response.json();

              if (data.payment_completed) {
                clearInterval(checkInterval);
                localStorage.removeItem("stripe_session_id");

                setPaymentStatus({
                  type: "success",
                  message:
                    "🎉 Pagamento confirmado! Bem-vindo ao Reflectio Premium!",
                });

                // Refresh do perfil
                if (refreshProfile) {
                  await refreshProfile();
                }

                setTimeout(() => {
                  setPaymentStatus({ type: null, message: "" });
                }, 5000);

                setTimeout(() => {
                  window.location.reload();
                }, 2000);
                return;
              }
            }
          }

          // Fallback: verificar diretamente no banco
          const { data: updatedProfile } = await supabase
            .from("profiles")
            .select("is_premium, premium_since")
            .eq("id", profile?.id)
            .single();

          if (updatedProfile?.is_premium) {
            clearInterval(checkInterval);
            localStorage.removeItem("stripe_session_id"); // Limpar session ID

            setPaymentStatus({
              type: "success",
              message:
                "🎉 Pagamento confirmado! Bem-vindo ao Reflectio Premium!",
            });

            // Refresh do perfil
            if (refreshProfile) {
              await refreshProfile();
            }

            // Limpar mensagem após 5 segundos
            setTimeout(() => {
              setPaymentStatus({ type: null, message: "" });
            }, 5000);

            // Recarregar página para mostrar interface premium
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            setPaymentStatus({
              type: "success",
              message:
                "✅ Pagamento processado! Se não vir o Premium ativo, recarregue a página.",
            });

            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
        } catch (error) {
          console.error("Erro ao verificar status premium:", error);
          if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            setPaymentStatus({
              type: "success",
              message: "✅ Pagamento processado! Recarregando página...",
            });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      }, 2000); // Verificar a cada 2 segundos
    } else if (canceled) {
      // Limpar URL
      window.history.replaceState({}, "", "/profile");

      // Mostrar mensagem de cancelamento
      setPaymentStatus({
        type: "canceled",
        message:
          "❌ Pagamento cancelado. Você pode tentar novamente quando quiser.",
      });

      // Limpar mensagem após 5 segundos
      setTimeout(() => {
        setPaymentStatus({ type: null, message: "" });
      }, 5000);
    }
  }, [profile?.id, refreshProfile, supabase]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar perfil...</p>
        </div>
      </div>
    );
  }

  const currentLevel = LEVELS[profile.current_level || 1] ||
    LEVELS[1] || {
      id: 1,
      name: "Iniciante",
      icon: "🌱",
      color: "text-gray-500",
      min_quality_score: 0,
    };

  const handleUpdateProfile = async () => {
    // Recarregar perfil
    window.location.reload();
  };

  const handleCancelPremium = async () => {
    if (!confirm("Tem certeza que deseja cancelar o Premium?")) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          premium_expires_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      window.location.reload();
    } catch (error) {
      console.error("Error canceling premium:", error);
      alert("Erro ao cancelar Premium");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de status do pagamento */}
      {paymentStatus.type && (
        <div
          className={`rounded-lg p-4 text-center font-medium transition-all duration-300 ${
            paymentStatus.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : paymentStatus.type === "canceled"
              ? "bg-red-50 border border-red-200 text-red-800"
              : "bg-blue-50 border border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {paymentStatus.type === "processing" && (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
            {paymentStatus.type === "success" && (
              <CheckCircle className="w-5 h-5" />
            )}
            {paymentStatus.type === "canceled" && (
              <XCircle className="w-5 h-5" />
            )}
            <span>{paymentStatus.message}</span>
          </div>
        </div>
      )}
      {/* Header Card */}
      <Card>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto md:mx-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(profile.full_name)
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                  {profile.full_name}
                </h1>
                {profile.username && (
                  <p className="text-gray-500 mb-2">@{profile.username}</p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`${currentLevel.color} flex items-center gap-1 font-semibold text-lg`}
                  >
                    <span className="text-2xl">{currentLevel.icon}</span>
                    {currentLevel.name}
                  </span>
                  {profile.is_premium && (
                    <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar Perfil
              </Button>
            </div>

            {profile.bio && (
              <p className="text-gray-700 mb-4 leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-purple-600">
                  {profile.total_posts || 0}
                </p>
                <p className="text-sm text-gray-600">Posts</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-blue-600">
                  {profile.total_reflections || 0}
                </p>
                <p className="text-sm text-gray-600">Reflexões</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-emerald-600">
                  {profile.total_connections || 0}
                </p>
                <p className="text-sm text-gray-600">Conexões</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-amber-600">
                  {profile.quality_score || 0}
                </p>
                <p className="text-sm text-gray-600">Pontos</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {profile.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Membro desde{" "}
                {formatDate(profile.created_at || new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Aviso de Expiração */}
      <ExpirationWarning
        premiumExpiresAt={profile.premium_expires_at}
        onRenew={() => setShowPremiumModal(true)}
      />

      {/* Premium Management */}
      {profile.is_premium ? (
        <SubscriptionManager
          isPremium={profile.is_premium}
          premiumSince={profile.premium_since}
          premiumExpiresAt={profile.premium_expires_at}
        />
      ) : (
        <div className="space-y-4">
          <PremiumBanner onUpgrade={() => setShowPremiumModal(true)} />

          {/* Painel de Debug e Testes */}
          <Card>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                🔧 Painel de Debug
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={async () => {
                    try {
                      console.log("🔍 Verificando status do perfil...");

                      const response = await fetch("/api/debug/profile");

                      if (!response.ok) {
                        const errorText = await response.text();
                        console.error("Response error:", errorText);
                        throw new Error(
                          `HTTP ${response.status}: ${errorText}`
                        );
                      }

                      const data = await response.json();
                      console.log("Profile Debug:", data);

                      if (data.success) {
                        alert(
                          `📊 Status do Perfil:\n\n` +
                            `• Premium: ${
                              data.profile?.is_premium
                                ? "✅ Ativo"
                                : "❌ Inativo"
                            }\n` +
                            `• Status: ${data.premium_status}\n` +
                            `• Email: ${data.profile?.email}\n` +
                            `• Nível: ${data.profile?.current_level || 1}\n` +
                            `• Posts: ${data.profile?.total_posts || 0}\n\n` +
                            `Ver console para detalhes completos.`
                        );
                      } else {
                        alert(`❌ Erro: ${data.error}`);
                      }
                    } catch (error) {
                      console.error("Erro completo:", error);
                      alert(`❌ Erro ao verificar perfil: ${error.message}`);
                    }
                  }}
                  variant="secondary"
                  size="sm"
                >
                  🔍 Verificar Status
                </Button>

                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/debug/profile", {
                        method: "POST",
                      });
                      const data = await response.json();
                      console.log("Update Result:", data);

                      if (data.success) {
                        alert("✅ Premium ativado! Recarregando página...");
                        setTimeout(() => window.location.reload(), 1000);
                      } else {
                        alert(`❌ Erro: ${data.error}`);
                      }
                    } catch (error) {
                      console.error("Erro:", error);
                      alert("❌ Erro ao ativar Premium");
                    }
                  }}
                  variant="secondary"
                  size="sm"
                >
                  🚀 Forçar Premium
                </Button>

                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "/api/debug/deactivate-premium",
                        {
                          method: "POST",
                        }
                      );
                      const data = await response.json();
                      console.log("Deactivate Result:", data);

                      if (data.success) {
                        alert("✅ Premium desativado! Recarregando página...");
                        setTimeout(() => window.location.reload(), 1000);
                      } else {
                        alert(`❌ Erro: ${data.error}`);
                      }
                    } catch (error) {
                      console.error("Erro:", error);
                      alert("❌ Erro ao desativar Premium");
                    }
                  }}
                  variant="danger"
                  size="sm"
                >
                  ❌ Desativar Premium
                </Button>

                <Button
                  onClick={() => {
                    const sessionId = localStorage.getItem("stripe_session_id");
                    if (sessionId) {
                      console.log("Session ID encontrado:", sessionId);
                      alert(
                        `Session ID: ${sessionId}\nVer console para detalhes.`
                      );
                    } else {
                      alert("❌ Nenhum Session ID encontrado no localStorage");
                    }
                  }}
                  variant="secondary"
                  size="sm"
                >
                  📋 Ver Session ID
                </Button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                <p>
                  • <strong>Verificar Status:</strong> Mostra o status atual do
                  perfil
                </p>
                <p>
                  • <strong>Simular Local:</strong> Ativa Premium de teste
                  (cancelamento imediato)
                </p>
                <p>
                  • <strong>Simular Real:</strong> Simula subscrição real
                  (cancelamento agendado)
                </p>
                <p>
                  • <strong>Testar Portal:</strong> Cria customer e testa portal
                  do Stripe
                </p>
                <p>
                  • <strong>Portal Direto:</strong> Abre portal mesmo com
                  problemas de auth
                </p>
                <p>
                  • <strong>Forçar Premium:</strong> Ativa Premium diretamente
                  no banco
                </p>
                <p>
                  • <strong>Desativar Premium:</strong> Remove Premium e volta
                  para Free
                </p>
                <p>
                  • <strong>Ver Session ID:</strong> Verifica se há session do
                  Stripe salvo
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Painel de Debug - Sempre visível */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            🔧 Painel de Debug
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-11 gap-3">
            <Button
              onClick={async () => {
                try {
                  const response = await fetch("/api/debug/profile");
                  const data = await response.json();
                  console.log("Profile Debug:", data);
                  alert(
                    `Status atual: ${
                      data.profile?.is_premium ? "Premium ✅" : "Free ❌"
                    }\nVer console para detalhes completos.`
                  );
                } catch (error) {
                  console.error("Erro:", error);
                  alert("❌ Erro ao verificar perfil");
                }
              }}
              variant="secondary"
              size="sm"
            >
              🔍 Verificar Status
            </Button>

            <Button
              onClick={async () => {
                try {
                  const sessionId = `cs_test_${Date.now()}`;
                  localStorage.setItem("stripe_session_id", sessionId);

                  const response = await fetch("/api/stripe/simulate-success", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ sessionId }),
                  });

                  const data = await response.json();
                  console.log("Simulate Result:", data);

                  if (data.success) {
                    alert(
                      "🧪 Pagamento simulado (teste local)! Recarregando página..."
                    );
                    setTimeout(() => window.location.reload(), 1000);
                  } else {
                    alert(`❌ Erro: ${data.error}`);
                  }
                } catch (error) {
                  console.error("Erro:", error);
                  alert("❌ Erro ao simular pagamento");
                }
              }}
              variant="primary"
              size="sm"
            >
              🧪 Simular Local
            </Button>

            <Button
              onClick={async () => {
                try {
                  const response = await fetch(
                    "/api/debug/simulate-real-subscription",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ planType: "monthly" }),
                    }
                  );

                  const data = await response.json();
                  console.log("Real Sim Result:", data);

                  if (data.success) {
                    alert(
                      "🎭 Subscrição REAL simulada (mensal)! Recarregando página..."
                    );
                    setTimeout(() => window.location.reload(), 1000);
                  } else {
                    alert(`❌ Erro: ${data.error}`);
                  }
                } catch (error) {
                  console.error("Erro:", error);
                  alert("❌ Erro ao simular subscrição real");
                }
              }}
              variant="secondary"
              size="sm"
            >
              🎭 Simular Real (Mensal)
            </Button>

            <Button
              onClick={async () => {
                try {
                  const response = await fetch(
                    "/api/debug/simulate-real-subscription",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ planType: "yearly" }),
                    }
                  );

                  const data = await response.json();
                  console.log("Real Sim Result:", data);

                  if (data.success) {
                    alert(
                      "🎭 Subscrição REAL simulada (anual)! Recarregando página..."
                    );
                    setTimeout(() => window.location.reload(), 1000);
                  } else {
                    alert(`❌ Erro: ${data.error}`);
                  }
                } catch (error) {
                  console.error("Erro:", error);
                  alert("❌ Erro ao simular subscrição real");
                }
              }}
              variant="secondary"
              size="sm"
            >
              🎭 Simular Real (Anual)
            </Button>

            <Button
              onClick={async () => {
                try {
                  const response = await fetch("/api/debug/test-portal", {
                    method: "POST",
                  });
                  const data = await response.json();
                  console.log("Portal Test Result:", data);

                  if (data.success && data.url) {
                    alert("🧪 Portal de teste criado! Redirecionando...");
                    window.location.href = data.url;
                  } else {
                    alert(`❌ Erro: ${data.error}`);
                  }
                } catch (error) {
                  console.error("Erro:", error);
                  alert("❌ Erro ao testar portal");
                }
              }}
              variant="secondary"
              size="sm"
            >
              🔗 Testar Portal
            </Button>

            <Button
              onClick={async () => {
                try {
                  const response = await fetch("/api/debug/profile", {
                    method: "POST",
                  });
                  const data = await response.json();
                  console.log("Update Result:", data);

                  if (data.success) {
                    alert("✅ Premium ativado! Recarregando página...");
                    setTimeout(() => window.location.reload(), 1000);
                  } else {
                    alert(`❌ Erro: ${data.error}`);
                  }
                } catch (error) {
                  console.error("Erro:", error);
                  alert("❌ Erro ao ativar Premium");
                }
              }}
              variant="secondary"
              size="sm"
            >
              🚀 Forçar Premium
            </Button>

            <Button
              onClick={async () => {
                try {
                  const response = await fetch(
                    "/api/debug/deactivate-premium",
                    {
                      method: "POST",
                    }
                  );
                  const data = await response.json();
                  console.log("Deactivate Result:", data);

                  if (data.success) {
                    alert("✅ Premium desativado! Recarregando página...");
                    setTimeout(() => window.location.reload(), 1000);
                  } else {
                    alert(`❌ Erro: ${data.error}`);
                  }
                } catch (error) {
                  console.error("Erro:", error);
                  alert("❌ Erro ao desativar Premium");
                }
              }}
              variant="danger"
              size="sm"
            >
              ❌ Desativar Premium
            </Button>

            <Button
              onClick={async () => {
                try {
                  // Portal direto que funciona mesmo com problemas de auth
                  const response = await fetch("/api/debug/test-portal", {
                    method: "POST",
                  });
                  const data = await response.json();
                  console.log("Portal Direto:", data);

                  if (data.success && data.url) {
                    alert("🔗 Portal direto funcionando! Abrindo...");
                    window.open(data.url, "_blank");
                  } else {
                    alert(`❌ Erro: ${data.error}`);
                  }
                } catch (error) {
                  console.error("Erro:", error);
                  alert("❌ Erro ao testar portal direto");
                }
              }}
              variant="primary"
              size="sm"
            >
              🔗 Portal Direto
            </Button>

            <Button
              onClick={async () => {
                try {
                  const response = await fetch(
                    "/api/stripe/cancel-subscription",
                    {
                      method: "POST",
                    }
                  );
                  const data = await response.json();
                  console.log("Cancel Test:", data);

                  if (data.success) {
                    if (data.immediate_cancellation) {
                      alert("🧪 Cancelamento imediato (conta de teste)");
                      setTimeout(() => window.location.reload(), 1000);
                    } else {
                      alert(
                        `✅ Cancelamento agendado! Premium mantido até: ${new Date(
                          data.expires_at
                        ).toLocaleDateString()}`
                      );
                    }
                  } else {
                    alert(`❌ Erro: ${data.error}`);
                  }
                } catch (error) {
                  console.error("Erro:", error);
                  alert("❌ Erro ao testar cancelamento");
                }
              }}
              variant="danger"
              size="sm"
            >
              🧪 Testar Cancelamento
            </Button>

            <Button
              onClick={async () => {
                try {
                  console.log("🔍 Iniciando verificação de expirações...");

                  const response = await fetch(
                    "/api/debug/simulate-expiration-check",
                    {
                      method: "GET",
                    }
                  );

                  console.log("Response status:", response.status);
                  console.log("Response headers:", response.headers);

                  if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Response error:", errorText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                  }

                  const data = await response.json();
                  console.log("Expiration Check:", data);

                  if (data.success) {
                    if (data.expired_count > 0) {
                      alert(
                        `🕒 ${data.expired_count} usuários Premium expirados foram desativados!`
                      );
                      setTimeout(() => window.location.reload(), 1000);
                    } else {
                      // Usar a mensagem detalhada da API
                      alert(`✅ ${data.message}`);
                    }
                  } else {
                    alert(
                      `❌ Erro na verificação: ${
                        data.error || "Erro desconhecido"
                      }`
                    );
                  }
                } catch (error) {
                  console.error("Erro completo:", error);
                  alert(`❌ Erro ao verificar expirações: ${error.message}`);
                }
              }}
              variant="secondary"
              size="sm"
            >
              🕒 Verificar Expirações
            </Button>

            <Button
              onClick={() => {
                const sessionId = localStorage.getItem("stripe_session_id");
                if (sessionId) {
                  console.log("Session ID encontrado:", sessionId);
                  alert(`Session ID: ${sessionId}\nVer console para detalhes.`);
                } else {
                  alert("❌ Nenhum Session ID encontrado no localStorage");
                }
              }}
              variant="secondary"
              size="sm"
            >
              📋 Ver Session ID
            </Button>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            <p>
              • <strong>Verificar Status:</strong> Mostra o status atual do
              perfil
            </p>
            <p>
              • <strong>Forçar Premium:</strong> Ativa Premium diretamente no
              banco
            </p>
            <p>
              • <strong>Desativar Premium:</strong> Remove Premium e volta para
              Free
            </p>
            <p>
              • <strong>Ver Session ID:</strong> Verifica se há session do
              Stripe salvo
            </p>
          </div>
        </div>
      </Card>

      {/* Modal Premium */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progresso Atual</p>
              <p className="text-lg font-bold text-gray-800">
                {LEVELS[(profile.current_level || 1) + 1]
                  ? `${Math.round(
                      (((profile.quality_score || 0) -
                        currentLevel.min_quality_score) /
                        (LEVELS[(profile.current_level || 1) + 1]
                          .min_quality_score -
                          currentLevel.min_quality_score)) *
                        100
                    )}%`
                  : "Máximo"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Média de Reflexões</p>
              <p className="text-lg font-bold text-gray-800">
                {(profile.total_posts || 0) > 0
                  ? (
                      (profile.total_reflections || 0) /
                      (profile.total_posts || 1)
                    ).toFixed(1)
                  : "0"}
                /post
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rank na Comunidade</p>
              <p className="text-lg font-bold text-gray-800">Top 10%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Posts Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Meus Posts</h2>
          <span className="text-sm text-gray-500">
            {profile.total_posts || 0}{" "}
            {(profile.total_posts || 0) === 1 ? "post" : "posts"} publicados
          </span>
        </div>
        <UserPosts userId={profile.id} />
      </Card>

      {/* Danger Zone */}
      <Card>
        <h3 className="text-lg font-bold text-red-600 mb-4">Zona de Perigo</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <p className="font-semibold text-gray-800">Sair da Conta</p>
              <p className="text-sm text-gray-600">
                Você precisará fazer login novamente
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>
      </Card>

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onUpdate={handleUpdateProfile}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserProfile } from "@/types/user.types";
import { UserCard } from "@/components/connections/UserCard";
import { Input } from "@/components/ui/Input";
import { Search, Users, UserPlus, Clock } from "lucide-react";

type TabType = "discover" | "my-connections" | "pending";

interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "rejected" | "blocked" | null;
  created_at: string | null;
}

export default function ConnectionsPage() {
  const { profile } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabType>("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      fetchConnections();
      if (activeTab === "discover") {
        fetchUsers();
      }
    }
  }, [profile, activeTab]);

  const fetchConnections = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`);

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  };

  const fetchUsers = async () => {
    if (!profile) return;

    try {
      setIsLoading(true);
      let query = supabase
        .from("profiles")
        .select("*")
        .neq("id", profile.id)
        .order("quality_score", { ascending: false })
        .limit(20);

      if (searchQuery) {
        query = query.or(
          `full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log("Fetched users:", data);
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionStatus = (
    userId: string
  ): "none" | "pending_sent" | "pending_received" | "connected" | "blocked" => {
    if (!profile) return "none";

    const connection = connections.find(
      (c) =>
        (c.requester_id === profile.id && c.addressee_id === userId) ||
        (c.addressee_id === profile.id && c.requester_id === userId)
    );

    if (!connection || connection.status === null) return "none";

    if (connection.status === "accepted") return "connected";
    if (connection.status === "blocked") return "blocked";
    if (connection.status === "rejected") return "none";

    if (connection.requester_id === profile.id) return "pending_sent";
    return "pending_received";
  };

  const handleConnect = async (userId: string) => {
    if (!profile?.is_premium) {
      alert("Apenas membros Premium podem solicitar conexões");
      return;
    }

    try {
      setActionLoading(userId);

      const targetUser = users.find((u) => u.id === userId);
      if (!targetUser) return;

      // Verificar se pode conectar (mesmo nível ou inferior)
      const targetLevel = targetUser.current_level || 1;
      const currentLevel = profile.current_level || 1;

      if (targetLevel > currentLevel) {
        alert(
          `Você precisa estar no nível ${targetLevel} ou superior para conectar com este usuário`
        );
        return;
      }

      const { error } = await supabase.from("connections").insert({
        requester_id: profile.id,
        addressee_id: userId,
        status: "pending",
        requester_level: currentLevel,
        addressee_level: targetLevel,
      });

      if (error) throw error;

      await fetchConnections();
    } catch (error: any) {
      console.error("Error connecting:", error);
      alert(error.message || "Erro ao enviar convite");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (userId: string) => {
    if (!profile) return;

    try {
      setActionLoading(userId);

      const connection = connections.find(
        (c) =>
          c.requester_id === userId &&
          c.addressee_id === profile.id &&
          c.status === "pending"
      );

      if (!connection) return;

      const { error } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", connection.id);

      if (error) throw error;

      await fetchConnections();
    } catch (error) {
      console.error("Error accepting connection:", error);
      alert("Erro ao aceitar convite");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!profile) return;

    try {
      setActionLoading(userId);

      const connection = connections.find(
        (c) =>
          c.requester_id === userId &&
          c.addressee_id === profile.id &&
          c.status === "pending"
      );

      if (!connection) return;

      const { error } = await supabase
        .from("connections")
        .update({ status: "rejected" })
        .eq("id", connection.id);

      if (error) throw error;

      await fetchConnections();
    } catch (error) {
      console.error("Error rejecting connection:", error);
      alert("Erro ao recusar convite");
    } finally {
      setActionLoading(null);
    }
  };

  const myConnections = users.filter(
    (u) => getConnectionStatus(u.id) === "connected"
  );
  const pendingRequests = users.filter(
    (u) => getConnectionStatus(u.id) === "pending_received"
  );

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Conexões</h2>
        <p className="text-gray-700">
          Conecte-se com pensadores do seu nível ou inferior para acessar suas
          bibliotecas e trocar reflexões profundas.
        </p>
      </div>

      {/* Premium Warning */}
      {!profile.is_premium && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 text-sm">
            ⚠️ Você está no modo gratuito. Faça upgrade para Premium para
            solicitar conexões ativamente.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("discover")}
          className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "discover"
              ? "border-purple-600 text-purple-600 font-medium"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          <Search className="w-4 h-4" />
          Descobrir
        </button>
        <button
          onClick={() => setActiveTab("my-connections")}
          className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "my-connections"
              ? "border-purple-600 text-purple-600 font-medium"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Minhas Conexões ({myConnections.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "pending"
              ? "border-purple-600 text-purple-600 font-medium"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          Pendentes ({pendingRequests.length})
        </button>
      </div>

      {/* Search (only in discover tab) */}
      {activeTab === "discover" && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                fetchUsers();
              }
            }}
            placeholder="Buscar por nome ou username..."
            className="pl-10"
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">A carregar...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === "discover" && (
            <>
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhum usuário encontrado</p>
                </div>
              ) : (
                users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    currentUserLevel={profile.current_level || 1}
                    connectionStatus={getConnectionStatus(user.id)}
                    onConnect={handleConnect}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    isLoading={actionLoading === user.id}
                  />
                ))
              )}
            </>
          )}

          {activeTab === "my-connections" && (
            <>
              {myConnections.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">
                    Você ainda não tem conexões
                  </p>
                  <p className="text-sm text-gray-500">
                    Explore a aba "Descobrir" para encontrar pensadores
                  </p>
                </div>
              ) : (
                myConnections.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    currentUserLevel={profile.current_level || 1}
                    connectionStatus="connected"
                  />
                ))
              )}
            </>
          )}

          {activeTab === "pending" && (
            <>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhum convite pendente</p>
                </div>
              ) : (
                pendingRequests.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    currentUserLevel={profile.current_level || 1}
                    connectionStatus="pending_received"
                    onAccept={handleAccept}
                    onReject={handleReject}
                    isLoading={actionLoading === user.id}
                  />
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/types/user.types";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdate: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onUpdate,
}: EditProfileModalProps) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState(profile.full_name);
  const [username, setUsername] = useState(profile.username || "");
  const [bio, setBio] = useState(profile.bio || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validar username (apenas letras, números e underscore)
      if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error("Username só pode conter letras, números e underscore");
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          username: username.trim() || null,
          bio: bio.trim() || null,
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Editar Perfil</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Fechar modal"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome Completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Seu nome completo"
            required
            disabled={isLoading}
          />

          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="seu_username"
            disabled={isLoading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte um pouco sobre você e seus interesses..."
              rows={4}
              maxLength={200}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {bio.length}/200 caracteres
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

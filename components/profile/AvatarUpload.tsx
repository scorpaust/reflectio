"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

interface AvatarUploadProps {
  userId: string;
  currentAvatar: string | null;
  userName: string;
  onUploadComplete?: (url: string | null) => void;
}

export function AvatarUpload({
  userId,
  currentAvatar,
  userName,
  onUploadComplete,
}: AvatarUploadProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limpar erro anterior
    setError("");

    try {
      // Validações
      if (!file.type.startsWith("image/")) {
        throw new Error("Por favor, selecione uma imagem");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("A imagem deve ter menos de 5MB");
      }

      // Mostrar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload
      setUploading(true);

      // Gerar nome único do arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Se já existe um avatar, deletar o antigo
      if (currentAvatar) {
        const oldPath = currentAvatar.split("/").slice(-2).join("/");
        await supabase.storage.from("avatars").remove([oldPath]);
      }

      // Upload para Supabase Storage
      console.log("Uploading file:", fileName);
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        if (uploadError.message.includes("bucket")) {
          throw new Error(
            "Bucket de avatares não encontrado. Verifique a configuração do Storage."
          );
        }
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Atualizar perfil no banco de dados
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Callback de sucesso
      onUploadComplete?.(publicUrl);
      setPreview(null);

      // Forçar re-render do componente para mostrar a nova imagem
      setTimeout(() => {
        setPreview(null);
      }, 100);
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      setError(err.message || "Erro ao fazer upload da imagem");
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatar || !confirm("Remover foto de perfil?")) return;

    try {
      setUploading(true);

      // Deletar do storage
      const oldPath = currentAvatar.split("/").slice(-2).join("/");
      await supabase.storage.from("avatars").remove([oldPath]);

      // Atualizar perfil
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (updateError) throw updateError;

      onUploadComplete?.(null);
    } catch (err: any) {
      console.error("Error removing avatar:", err);
      setError(err.message || "Erro ao remover imagem");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <input
          ref={fileInputRef}
          type="file"
          id="avatar-upload"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        {/* Avatar Display */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400 border-4 border-white shadow-lg">
            {uploading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : currentAvatar ? (
              <img
                src={currentAvatar}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                {getInitials(userName)}
              </div>
            )}
          </div>

          {/* Overlay on Hover */}
          {!uploading && (
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-8 h-8 text-white" />
            </label>
          )}

          {/* Remove Button */}
          {currentAvatar && !uploading && (
            <button
              onClick={handleRemoveAvatar}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
              title="Remover foto"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <label
          htmlFor="avatar-upload"
          className="text-sm text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
        >
          {currentAvatar ? "Alterar foto" : "Adicionar foto"}
        </label>
        <p className="text-xs text-gray-500 mt-1">JPG, PNG ou GIF (máx. 5MB)</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Status */}
      {uploading && (
        <p className="mt-2 text-sm text-gray-600">A carregar imagem...</p>
      )}
    </div>
  );
}

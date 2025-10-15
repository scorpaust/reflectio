"use client";

import { useState } from "react";
import { CreatePostWithModeration } from "@/components/feed/CreatePostWithModeration";

export default function TestModerationPage() {
  const [posts, setPosts] = useState<
    Array<{
      id: string;
      content: string;
      audioFile?: File;
      transcription?: string;
      timestamp: Date;
    }>
  >([]);

  const handlePostCreated = (
    content: string,
    audioFile?: File,
    transcription?: string
  ) => {
    const newPost = {
      id: Date.now().toString(),
      content,
      audioFile,
      transcription,
      timestamp: new Date(),
    };

    setPosts((prev) => [newPost, ...prev]);
    console.log("Post criado:", newPost);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teste do Sistema de Moderação
          </h1>
          <p className="text-gray-600">
            Teste a moderação de conteúdo em texto e áudio. O sistema detectará
            automaticamente conteúdo inadequado e fornecerá feedback em tempo
            real.
          </p>
        </div>

        <div className="mb-8">
          <CreatePostWithModeration onPostCreated={handlePostCreated} />
        </div>

        {/* Lista de posts criados */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Posts Criados</h2>

          {posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum post criado ainda. Teste o sistema acima!
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-sm border p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500">
                    {post.timestamp.toLocaleString("pt-BR")}
                  </span>
                  {post.audioFile && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Áudio
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-gray-900">{post.content}</p>

                  {post.transcription &&
                    post.transcription !== post.content && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Transcrição:</strong> {post.transcription}
                      </div>
                    )}

                  {post.audioFile && (
                    <div className="text-sm text-gray-500">
                      Arquivo de áudio: {post.audioFile.name} (
                      {Math.round(post.audioFile.size / 1024)}KB)
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Exemplos para testar */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            Exemplos para Testar a Moderação
          </h3>

          <div className="space-y-2 text-sm text-yellow-700">
            <p>
              <strong>Conteúdo normal:</strong> "Que bela reflexão sobre
              filosofia!"
            </p>
            <p>
              <strong>Conteúdo questionável:</strong> "Você é um idiota por
              pensar assim"
            </p>
            <p>
              <strong>Discurso de ódio:</strong> Teste com linguagem ofensiva
              (será bloqueado)
            </p>
            <p>
              <strong>Áudio:</strong> Grave uma mensagem falando qualquer um dos
              exemplos acima
            </p>
          </div>

          <div className="mt-4 text-xs text-yellow-600">
            <p>
              <strong>Nota:</strong> Para testar completamente, você precisa
              configurar a OPENAI_API_KEY no arquivo .env.local
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

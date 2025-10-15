import { NextRequest, NextResponse } from "next/server";
import { ModerationResult } from "@/types/moderation";

export interface ModerationMiddlewareOptions {
  enableTextModeration?: boolean;
  enableAudioModeration?: boolean;
  strictMode?: boolean;
  autoBlock?: boolean;
  skipForRoles?: string[];
}

// Middleware para moderação automática em APIs
export function withModeration(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: ModerationMiddlewareOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const {
      enableTextModeration = true,
      enableAudioModeration = true,
      strictMode = false,
      autoBlock = true,
    } = options;

    try {
      // Verificar se a moderação está habilitada
      if (!enableTextModeration && !enableAudioModeration) {
        return handler(req);
      }

      // Extrair conteúdo da requisição
      const contentType = req.headers.get("content-type") || "";
      let textContent = "";
      let hasAudio = false;

      if (contentType.includes("application/json")) {
        const body = await req.json();

        // Procurar por campos de texto comuns
        const textFields = [
          "content",
          "message",
          "text",
          "description",
          "title",
        ];
        for (const field of textFields) {
          if (body[field] && typeof body[field] === "string") {
            textContent += body[field] + " ";
          }
        }

        // Recriar a requisição com o body
        req = new NextRequest(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(body),
        });
      } else if (contentType.includes("multipart/form-data")) {
        hasAudio = true; // Assumir que form-data pode conter áudio
      }

      // Moderar texto se necessário
      if (enableTextModeration && textContent.trim()) {
        const moderationResult = await moderateTextContent(
          textContent,
          strictMode
        );

        if (moderationResult.flagged && autoBlock) {
          return NextResponse.json(
            {
              error: "Conteúdo bloqueado por violar nossas diretrizes",
              moderationResult,
            },
            { status: 400 }
          );
        }
      }

      // Para áudio, deixar a moderação para o handler específico
      // pois precisa processar o arquivo

      return handler(req);
    } catch (error) {
      console.error("Erro no middleware de moderação:", error);
      // Em caso de erro, permitir que a requisição continue
      return handler(req);
    }
  };
}

// Função auxiliar para moderar texto
async function moderateTextContent(
  text: string,
  strictMode: boolean
): Promise<ModerationResult> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/moderation/text`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      throw new Error("Erro na moderação");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na moderação de texto:", error);
    // Retornar resultado seguro em caso de erro
    return {
      flagged: false,
      severity: "low",
      categories: [],
      reason: "Erro na moderação",
      confidence: 0,
    };
  }
}

// Decorator para aplicar moderação em route handlers
export function moderatedRoute(options: ModerationMiddlewareOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = withModeration(originalMethod, options);

    return descriptor;
  };
}

// Função para verificar permissões de moderação
export function canBypassModeration(
  userRole: string,
  allowedRoles: string[]
): boolean {
  return allowedRoles.includes(userRole);
}

// Função para log de eventos de moderação
export function logModerationEvent(
  userId: string,
  content: string,
  result: ModerationResult,
  action: "allowed" | "blocked" | "warned"
) {
  // Implementar logging conforme necessário
  console.log("Moderação:", {
    userId,
    contentLength: content.length,
    flagged: result.flagged,
    severity: result.severity,
    action,
    timestamp: new Date().toISOString(),
  });
}

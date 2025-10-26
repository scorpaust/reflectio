import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  shouldModerateContent,
  logModerationDecision,
  IntelligentModerationConfig,
} from "@/lib/utils/moderation";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const userId = formData.get("userId") as string;
    const context = formData.get("context")
      ? JSON.parse(formData.get("context") as string)
      : {};

    if (!audioFile) {
      return NextResponse.json(
        { error: "Arquivo de áudio é obrigatório" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "ID do utilizador é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar tamanho do arquivo (máximo 25MB para Whisper)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 25MB." },
        { status: 400 }
      );
    }

    // Transcrever áudio usando Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "pt",
    });

    const transcribedText = transcription.text;

    if (!transcribedText.trim()) {
      return NextResponse.json({
        flagged: false,
        transcription: "",
        reason: "Nenhum texto detectado no áudio",
        moderationType: "bypassed",
        userType: "unknown",
        bypassed: true,
      });
    }

    // Verificar se deve aplicar moderação baseado no tipo de utilizador
    const moderationConfig: IntelligentModerationConfig = {
      userId,
      contentType: "audio",
      content: transcribedText,
      context: context || {},
    };

    const moderationDecision = await shouldModerateContent(moderationConfig);

    // Log da decisão
    logModerationDecision(moderationDecision, moderationConfig);

    // Se não precisa de moderação (utilizador premium confiável), retornar aprovado
    if (!moderationDecision.shouldModerate) {
      const result = {
        flagged: false,
        transcription: transcribedText,
        severity: "low" as const,
        categories: [],
        reason:
          moderationDecision.bypassReason || "Conteúdo aprovado sem moderação",
        transcriptionQuality: "good" as const,
        suggestions: [],
        confidence: moderationDecision.confidence,
        moderationType: moderationDecision.moderationType,
        userType: moderationDecision.userType,
        bypassed: true,
      };

      return NextResponse.json(result);
    }

    // Usar a mesma lógica de moderação de texto
    const moderationResponse = await openai.moderations.create({
      input: transcribedText,
    });

    const moderation = moderationResponse.results[0];

    // Análise contextual específica para áudio
    const contextualAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um moderador especializado em analisar transcrições de áudio para detectar discurso de ódio e conteúdo inadequado no contexto brasileiro.
          
          Considere que esta é uma transcrição de áudio, então:
          - Pode haver erros de transcrição
          - Tom e contexto podem ser perdidos
          - Expressões coloquiais são mais comuns
          
          Retorne JSON com:
          - "isHateSpeech": boolean
          - "severity": "low" | "medium" | "high"
          - "categories": array de categorias
          - "reason": explicação
          - "transcriptionQuality": "good" | "fair" | "poor"
          - "suggestions": sugestões de melhoria`,
        },
        {
          role: "user",
          content: `Transcrição: "${transcribedText}"`,
        },
      ],
      temperature: 0.1,
    });

    let contextualResult;
    try {
      contextualResult = JSON.parse(
        contextualAnalysis.choices[0].message.content || "{}"
      );
    } catch {
      contextualResult = {
        isHateSpeech: false,
        severity: "low",
        categories: [],
        reason: "Erro na análise contextual",
        transcriptionQuality: "fair",
      };
    }

    const isFlagged = moderation.flagged || contextualResult.isHateSpeech;

    const result = {
      flagged: isFlagged,
      transcription: transcribedText,
      severity: contextualResult.severity || "low",
      categories: [
        ...Object.keys(moderation.categories).filter(
          (key) =>
            moderation.categories[key as keyof typeof moderation.categories]
        ),
        ...(contextualResult.categories || []),
      ],
      reason: contextualResult.reason || "Conteúdo potencialmente inadequado",
      transcriptionQuality: contextualResult.transcriptionQuality || "fair",
      suggestions: contextualResult.suggestions || [],
      confidence: moderation.category_scores
        ? Math.max(...Object.values(moderation.category_scores))
        : 0.5,
      moderationType: moderationDecision.moderationType,
      userType: moderationDecision.userType,
      bypassed: false,
    };

    // Log do resultado final da moderação
    console.log(
      `[Audio Moderation Result] User: ${userId}, Flagged: ${isFlagged}, Type: ${moderationDecision.moderationType}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na moderação de áudio:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

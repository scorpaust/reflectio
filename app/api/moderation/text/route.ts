import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  shouldModerateContent,
  logModerationDecision,
  IntelligentModerationConfig,
} from "@/lib/utils/moderation";
import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, userId, context } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Texto é obrigatório" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "ID do utilizador é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se deve aplicar moderação baseado no tipo de utilizador
    const moderationConfig: IntelligentModerationConfig = {
      userId,
      contentType: "text",
      content: text,
      context: context || {},
    };

    const moderationDecision = await shouldModerateContent(moderationConfig);

    // Log da decisão
    logModerationDecision(moderationDecision, moderationConfig);

    // Se não precisa de moderação (utilizador premium confiável), retornar aprovado
    if (!moderationDecision.shouldModerate) {
      const result = {
        flagged: false,
        severity: "low" as const,
        categories: [],
        reason:
          moderationDecision.bypassReason || "Conteúdo aprovado sem moderação",
        suggestions: [],
        confidence: moderationDecision.confidence,
        moderationType: moderationDecision.moderationType,
        userType: moderationDecision.userType,
        bypassed: true,
      };

      return NextResponse.json(result);
    }

    // Moderação usando OpenAI
    const moderationResponse = await openai.moderations.create({
      input: text,
    });

    const moderation = moderationResponse.results[0];

    // Análise adicional com GPT para contexto cultural brasileiro
    const contextualAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um moderador de conteúdo especializado em detectar discurso de ódio, bullying, e conteúdo inadequado no contexto brasileiro. 
          
          Analise o texto e retorne um JSON com:
          - "isHateSpeech": boolean
          - "severity": "low" | "medium" | "high"
          - "categories": array de categorias problemáticas
          - "reason": explicação breve
          - "suggestions": sugestões para melhorar o texto (opcional)
          
          Considere:
          - Contexto cultural brasileiro
          - Gírias e expressões regionais
          - Sarcasmo e ironia
          - Diferença entre crítica construtiva e ataque pessoal`,
        },
        {
          role: "user",
          content: text,
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
      };
    }

    // Combinar resultados
    const isFlagged = moderation.flagged || contextualResult.isHateSpeech;

    const result = {
      flagged: isFlagged,
      severity: contextualResult.severity || "low",
      categories: [
        ...Object.keys(moderation.categories).filter(
          (key) =>
            moderation.categories[key as keyof typeof moderation.categories]
        ),
        ...(contextualResult.categories || []),
      ],
      reason: contextualResult.reason || "Conteúdo potencialmente inadequado",
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
      `[Moderation Result] User: ${userId}, Flagged: ${isFlagged}, Type: ${moderationDecision.moderationType}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na moderação de texto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Texto é obrigatório" },
        { status: 400 }
      );
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
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na moderação de texto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

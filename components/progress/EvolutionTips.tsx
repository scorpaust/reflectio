import { Lightbulb, BookOpen, Users, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function EvolutionTips() {
  const tips = [
    {
      icon: BookOpen,
      title: "Use Fontes Credíveis",
      description:
        "Cite livros, artigos científicos e autores reconhecidos nas suas reflexões.",
      points: "+20 pontos",
    },
    {
      icon: Target,
      title: "Reflexões Profundas",
      description:
        "Escreva reflexões com mais de 500 caracteres para demonstrar profundidade.",
      points: "+20 pontos",
    },
    {
      icon: Users,
      title: "Inspire a Comunidade",
      description: "Crie posts que gerem reflexões em outros membros.",
      points: "+10 pontos por reflexão recebida",
    },
    {
      icon: Lightbulb,
      title: "Consistência",
      description:
        "Contribua regularmente para manter seu crescimento constante.",
      points: "Bônus semanal",
    },
  ];

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-bold text-gray-800">
          Como Evoluir Mais Rápido
        </h3>
      </div>

      <div className="space-y-4">
        {tips.map((tip, idx) => {
          const Icon = tip.icon;
          return (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-800 text-sm">
                    {tip.title}
                  </h4>
                  <span className="text-xs font-semibold text-emerald-600">
                    {tip.points}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <p className="text-sm text-gray-700">
          💡 <strong>Dica:</strong> Qualidade sempre prevalece sobre quantidade.
          Uma reflexão bem fundamentada vale mais que várias superficiais.
        </p>
      </div>
    </Card>
  );
}

"use client";

import { AlertTriangle, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { ModerationResult, ModerationAction } from "@/types/moderation";

interface ModerationFeedbackProps {
  result: ModerationResult;
  action: ModerationAction;
  onOverride?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function ModerationFeedback({
  result,
  action,
  onOverride,
  onCancel,
  className = "",
}: ModerationFeedbackProps) {
  const getIcon = () => {
    switch (action.type) {
      case "allow":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warn":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "block":
        return <Shield className="w-5 h-5 text-red-500" />;
      case "review":
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (action.type) {
      case "allow":
        return "bg-green-50 border-green-200";
      case "warn":
        return "bg-yellow-50 border-yellow-200";
      case "block":
        return "bg-red-50 border-red-200";
      case "review":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (action.type === "allow") {
    return null; // Não mostrar feedback para conteúdo aprovado
  }

  return (
    <div
      className={`rounded-lg border p-4 ${getBackgroundColor()} ${className}`}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">
            {action.type === "warn" && "Atenção"}
            {action.type === "block" && "Conteúdo Bloqueado"}
            {action.type === "review" && "Revisão Necessária"}
          </h4>

          <p className="mt-1 text-sm text-gray-600">{action.message}</p>

          {result.reason && (
            <p className="mt-2 text-xs text-gray-500">
              Motivo: {result.reason}
            </p>
          )}

          {result.categories.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">
                Categorias detectadas:
              </p>
              <div className="flex flex-wrap gap-1">
                {result.categories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.suggestions && result.suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Sugestões:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(action.canOverride || action.type === "warn") && (
            <div className="mt-4 flex space-x-2">
              {action.canOverride && onOverride && (
                <button
                  onClick={onOverride}
                  className="px-3 py-1 text-xs font-medium text-white bg-gray-600 rounded hover:bg-gray-700 transition-colors"
                >
                  Publicar Mesmo Assim
                </button>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

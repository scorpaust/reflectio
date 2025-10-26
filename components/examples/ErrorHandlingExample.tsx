"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RestrictionMessage } from "@/components/ui/RestrictionMessage";
import {
  HelpText,
  PremiumFeatureHelp,
  RestrictionHelp,
} from "@/components/ui/HelpText";
import { Tooltip } from "@/components/ui/Tooltip";
import { PermissionErrorBoundary } from "@/components/ui/PermissionErrorBoundary";
import {
  ReflectionUpgradePrompt,
  ConnectionUpgradePrompt,
  ContentUpgradePrompt,
} from "@/components/premium/UpgradePrompt";
import { usePermissionErrors } from "@/lib/hooks/usePermissionErrors";

/**
 * Componente de exemplo demonstrando o uso dos novos componentes de tratamento de erros
 * Este componente serve como documentação viva e teste visual dos componentes implementados
 */
export function ErrorHandlingExample() {
  const [activeDemo, setActiveDemo] = useState<string>("restriction-messages");
  const { errorState, setPermissionError, clearError } = usePermissionErrors();

  const triggerPermissionError = (
    type: "content" | "connection" | "reflection"
  ) => {
    switch (type) {
      case "content":
        setPermissionError(
          "premium_content",
          "post_view",
          "Este conteúdo requer uma subscrição Premium ativa."
        );
        break;
      case "connection":
        setPermissionError(
          "connection_request",
          "connection_request",
          "Apenas utilizadores Premium podem solicitar conexões."
        );
        break;
      case "reflection":
        setPermissionError(
          "reflection_creation",
          "reflection_creation",
          "Não é possível criar reflexões em conteúdo premium."
        );
        break;
    }
  };

  const demos = [
    { id: "restriction-messages", label: "Mensagens de Restrição" },
    { id: "help-tooltips", label: "Tooltips e Ajuda" },
    { id: "upgrade-prompts", label: "Prompts de Upgrade" },
    { id: "error-boundaries", label: "Error Boundaries" },
    { id: "permission-hooks", label: "Hooks de Permissão" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Sistema de Tratamento de Erros e Restrições
        </h1>
        <p className="text-gray-600">
          Demonstração dos componentes implementados para task 6.3
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        {demos.map((demo) => (
          <Button
            key={demo.id}
            onClick={() => setActiveDemo(demo.id)}
            variant={activeDemo === demo.id ? "primary" : "secondary"}
            size="sm"
          >
            {demo.label}
          </Button>
        ))}
      </div>

      {/* Demo Content */}
      <div className="space-y-6">
        {activeDemo === "restriction-messages" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Mensagens de Restrição
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Conteúdo Premium</h3>
                <RestrictionMessage
                  type="premium_content"
                  context="post_view"
                  variant="card"
                />
              </div>

              <div>
                <h3 className="font-medium mb-2">Solicitação de Conexão</h3>
                <RestrictionMessage
                  type="connection_request"
                  context="connection_request"
                  variant="banner"
                />
              </div>

              <div>
                <h3 className="font-medium mb-2">Criação de Reflexão</h3>
                <RestrictionMessage
                  type="reflection_creation"
                  context="reflection_creation"
                  variant="inline"
                  showDismiss={true}
                />
              </div>

              <div>
                <h3 className="font-medium mb-2">Mensagem Personalizada</h3>
                <RestrictionMessage
                  type="general"
                  context="feature_access"
                  customMessage={{
                    title: "Funcionalidade em Desenvolvimento",
                    description:
                      "Esta funcionalidade estará disponível em breve para utilizadores Premium.",
                    action: "Saber Mais",
                  }}
                />
              </div>
            </div>
          </Card>
        )}

        {activeDemo === "help-tooltips" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Tooltips e Textos de Ajuda
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Tooltips Informativos</h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span>Conteúdo Premium</span>
                    <Tooltip content="Este conteúdo está disponível apenas para utilizadores Premium">
                      <PremiumFeatureHelp
                        feature="premium_badge"
                        variant="tooltip"
                      />
                    </Tooltip>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Solicitar Conexão</span>
                    <Tooltip content="Apenas utilizadores Premium podem solicitar novas conexões">
                      <RestrictionHelp
                        text="Funcionalidade restrita"
                        variant="tooltip"
                      />
                    </Tooltip>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Moderação Inteligente</span>
                    <PremiumFeatureHelp
                      feature="moderation_bypass"
                      variant="tooltip"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Textos de Ajuda Inline</h3>
                <div className="space-y-3">
                  <HelpText
                    text="Utilizadores Premium têm acesso a funcionalidades exclusivas"
                    type="premium"
                    variant="inline"
                  />

                  <HelpText
                    text="Esta ação requer permissões especiais"
                    type="restriction"
                    variant="inline"
                  />

                  <HelpText
                    text="Dica: Use fontes credíveis para melhorar a qualidade das suas reflexões"
                    type="info"
                    variant="inline"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeDemo === "upgrade-prompts" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Prompts de Upgrade Especializados
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Upgrade para Conteúdo</h3>
                <ContentUpgradePrompt variant="default" />
              </div>

              <div>
                <h3 className="font-medium mb-2">Upgrade para Conexões</h3>
                <ConnectionUpgradePrompt variant="compact" />
              </div>

              <div>
                <h3 className="font-medium mb-2">Upgrade para Reflexões</h3>
                <ReflectionUpgradePrompt variant="banner" showDismiss={true} />
              </div>
            </div>
          </Card>
        )}

        {activeDemo === "error-boundaries" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Error Boundaries</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Os Error Boundaries capturam erros de permissão e mostram
                interfaces apropriadas:
              </p>

              <PermissionErrorBoundary showRetry={true}>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">
                    ✅ Este conteúdo está protegido por um Error Boundary
                  </p>
                </div>
              </PermissionErrorBoundary>

              <div>
                <h3 className="font-medium mb-2">Simular Erro de Permissão</h3>
                <PermissionErrorBoundary>
                  <Button
                    onClick={() => {
                      throw new Error("PERMISSION_DENIED: Acesso negado");
                    }}
                    variant="danger"
                    size="sm"
                  >
                    Gerar Erro de Permissão
                  </Button>
                </PermissionErrorBoundary>
              </div>
            </div>
          </Card>
        )}

        {activeDemo === "permission-hooks" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Hooks de Permissão</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Demonstração do hook usePermissionErrors para gerenciar estados
                de erro:
              </p>

              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => triggerPermissionError("content")}
                  size="sm"
                  variant="secondary"
                >
                  Erro de Conteúdo
                </Button>
                <Button
                  onClick={() => triggerPermissionError("connection")}
                  size="sm"
                  variant="secondary"
                >
                  Erro de Conexão
                </Button>
                <Button
                  onClick={() => triggerPermissionError("reflection")}
                  size="sm"
                  variant="secondary"
                >
                  Erro de Reflexão
                </Button>
                <Button onClick={clearError} size="sm" variant="ghost">
                  Limpar Erro
                </Button>
              </div>

              {errorState.hasError && (
                <div className="mt-4">
                  <RestrictionMessage
                    type={errorState.errorType || "general"}
                    context={errorState.context || "feature_access"}
                    customMessage={{
                      description: errorState.message,
                    }}
                    showDismiss={true}
                    onDismiss={clearError}
                  />
                </div>
              )}

              {!errorState.hasError && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-600">
                    Nenhum erro ativo. Clique nos botões acima para testar
                    diferentes tipos de erro.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Implementation Notes */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h2 className="text-lg font-semibold text-blue-800 mb-3">
          📋 Notas de Implementação
        </h2>
        <div className="text-blue-700 space-y-2 text-sm">
          <p>
            <strong>✅ Implementado:</strong> Mensagens de erro claras, tooltips
            contextuais, prompts de upgrade especializados, error boundaries e
            hooks de permissão.
          </p>
          <p>
            <strong>🎯 Benefícios:</strong> UX consistente, mensagens em
            português, componentes reutilizáveis e tratamento robusto de erros.
          </p>
          <p>
            <strong>🔧 Uso:</strong> Importe os componentes necessários e use
            conforme demonstrado nesta página de exemplo.
          </p>
        </div>
      </Card>
    </div>
  );
}

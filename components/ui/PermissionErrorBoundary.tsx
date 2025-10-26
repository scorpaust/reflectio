"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { RestrictionMessage } from "./RestrictionMessage";

interface PermissionError extends Error {
  code?: string;
  type?: "PERMISSION_DENIED" | "PREMIUM_REQUIRED" | "ACCESS_RESTRICTED";
  context?: string;
  upgradePrompt?: boolean;
}

interface PermissionErrorBoundaryState {
  hasError: boolean;
  error: PermissionError | null;
  errorInfo: ErrorInfo | null;
}

interface PermissionErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: PermissionError, errorInfo: ErrorInfo) => void;
  showRetry?: boolean;
  className?: string;
}

export class PermissionErrorBoundary extends Component<
  PermissionErrorBoundaryProps,
  PermissionErrorBoundaryState
> {
  constructor(props: PermissionErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(
    error: PermissionError
  ): Partial<PermissionErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: PermissionError, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for monitoring
    console.error(
      "Permission Error Boundary caught an error:",
      error,
      errorInfo
    );

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const error = this.state.error;

      // If it's a permission error, show appropriate restriction message
      if (
        error.type === "PERMISSION_DENIED" ||
        error.type === "PREMIUM_REQUIRED"
      ) {
        return (
          <div className={this.props.className}>
            <RestrictionMessage
              type="general"
              context="feature_access"
              variant="card"
              customMessage={{
                title: "Acesso Restrito",
                description:
                  error.message ||
                  "Não tem permissão para aceder a esta funcionalidade.",
              }}
            />
          </div>
        );
      }

      // For other errors, show generic error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className={`p-6 ${this.props.className || ""}`}>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Algo correu mal
            </h3>

            <p className="text-gray-600 mb-4">
              {error.message || "Ocorreu um erro inesperado. Tente novamente."}
            </p>

            {this.props.showRetry && (
              <Button
                onClick={this.handleRetry}
                variant="secondary"
                className="inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </Button>
            )}

            {/* Development error details */}
            {process.env.NODE_ENV === "development" && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                  {error.stack}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook for throwing permission errors
export function usePermissionError() {
  const throwPermissionError = (
    message: string,
    type: PermissionError["type"] = "PERMISSION_DENIED",
    context?: string
  ) => {
    const error = new Error(message) as PermissionError;
    error.code = "PERMISSION_ERROR";
    error.type = type;
    error.context = context;
    error.upgradePrompt = type === "PREMIUM_REQUIRED";
    throw error;
  };

  return { throwPermissionError };
}

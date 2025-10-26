"use client";

import { ReactNode, useState } from "react";
import { Crown, Lock, Info, X, ExternalLink } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { PremiumModal } from "@/components/premium/PremiumModal";
import {
  RestrictionType,
  RestrictionContext,
  getErrorMessage,
  getContextualMessage,
  getUpgradeLink,
  getCTAText,
} from "@/lib/constants/error-messages";
import { cn } from "@/lib/utils";

interface RestrictionMessageProps {
  type: RestrictionType;
  context: RestrictionContext;
  variant?: "inline" | "card" | "modal" | "banner";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showDismiss?: boolean;
  showAlternative?: boolean;
  className?: string;
  onDismiss?: () => void;
  customMessage?: {
    title?: string;
    description?: string;
    action?: string;
  };
}

export function RestrictionMessage({
  type,
  context,
  variant = "card",
  size = "md",
  showIcon = true,
  showDismiss = false,
  showAlternative = true,
  className = "",
  onDismiss,
  customMessage,
}: RestrictionMessageProps) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const errorMessage = getErrorMessage(type);
  const contextualMessage = getContextualMessage(context);
  const upgradeLink = getUpgradeLink(context);
  const ctaText = getCTAText(context);

  // Use custom messages if provided, otherwise use defaults
  const title = customMessage?.title || errorMessage.title;
  const description =
    customMessage?.description || contextualMessage.description;
  const actionText = customMessage?.action || ctaText;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleUpgrade = () => {
    setShowPremiumModal(true);
  };

  if (isDismissed) {
    return null;
  }

  // Variant styles
  const variantStyles = {
    inline: "p-3 bg-amber-50 border border-amber-200 rounded-lg",
    card: "p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl shadow-sm",
    modal: "p-6 bg-white border border-gray-200 rounded-xl shadow-lg",
    banner: "p-4 bg-amber-100 border-l-4 border-amber-500",
  };

  const sizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const getIcon = () => {
    switch (type) {
      case "premium_content":
      case "content_creation":
        return <Crown className={cn(iconSizes[size], "text-amber-500")} />;
      case "connection_request":
        return <Lock className={cn(iconSizes[size], "text-blue-500")} />;
      case "reflection_creation":
        return <Lock className={cn(iconSizes[size], "text-purple-500")} />;
      default:
        return <Info className={cn(iconSizes[size], "text-gray-500")} />;
    }
  };

  const content = (
    <div className={cn(variantStyles[variant], sizeStyles[size], className)}>
      <div className="flex items-start gap-3">
        {showIcon && <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
              <p className="text-gray-600 leading-relaxed mb-3">
                {description}
              </p>

              {/* Help text */}
              {"help_text" in contextualMessage &&
                contextualMessage.help_text && (
                  <p className="text-sm text-gray-500 mb-3">
                    {contextualMessage.help_text}
                  </p>
                )}

              {/* Alternative action */}
              {showAlternative &&
                "alternative" in contextualMessage &&
                contextualMessage.alternative && (
                  <p className="text-sm text-blue-600 mb-3">
                    💡 {contextualMessage.alternative}
                  </p>
                )}
            </div>

            {showDismiss && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dispensar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={handleUpgrade}
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              <Crown className="w-4 h-4 mr-2" />
              {actionText}
            </Button>

            {/* Secondary action - learn more */}
            <Button
              onClick={() => window.open("/premium", "_blank")}
              size="sm"
              variant="ghost"
              className="text-gray-600 hover:text-gray-800"
            >
              Saber Mais
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {variant === "card" ? (
        <Card className="p-0 overflow-hidden">{content}</Card>
      ) : (
        content
      )}

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </>
  );
}

// Specialized components for common use cases
export function ContentRestrictionMessage(
  props: Omit<RestrictionMessageProps, "type" | "context">
) {
  return (
    <RestrictionMessage type="premium_content" context="post_view" {...props} />
  );
}

export function ConnectionRestrictionMessage(
  props: Omit<RestrictionMessageProps, "type" | "context">
) {
  return (
    <RestrictionMessage
      type="connection_request"
      context="connection_request"
      {...props}
    />
  );
}

export function ReflectionRestrictionMessage(
  props: Omit<RestrictionMessageProps, "type" | "context">
) {
  return (
    <RestrictionMessage
      type="reflection_creation"
      context="reflection_creation"
      {...props}
    />
  );
}

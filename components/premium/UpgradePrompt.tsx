"use client";

import { Crown, ArrowRight, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { PremiumModal } from "./PremiumModal";
import {
  RestrictionType,
  RestrictionContext,
  getErrorMessage,
  getContextualMessage,
  getUpgradeLink,
  getCTAText,
} from "@/lib/constants/error-messages";
import { cn } from "@/lib/utils";

interface UpgradePromptProps {
  title?: string;
  description?: string;
  context?: RestrictionContext;
  restrictionType?: RestrictionType;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact" | "banner";
  showDismiss?: boolean;
  showAlternative?: boolean;
  showSecondaryAction?: boolean;
  onDismiss?: () => void;
  customAction?: {
    text: string;
    onClick: () => void;
  };
}

export function UpgradePrompt({
  title,
  description,
  context = "feature_access",
  restrictionType = "general",
  className = "",
  size = "md",
  variant = "default",
  showDismiss = false,
  showAlternative = true,
  showSecondaryAction = true,
  onDismiss,
  customAction,
}: UpgradePromptProps) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Get contextual messages
  const errorMessage = getErrorMessage(restrictionType);
  const contextualMessage = getContextualMessage(context);
  const ctaText = getCTAText(context);

  // Use provided props or fallback to contextual messages
  const finalTitle = title || errorMessage.title;
  const finalDescription = description || contextualMessage.description;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleUpgrade = () => {
    if (customAction) {
      customAction.onClick();
    } else {
      setShowPremiumModal(true);
    }
  };

  if (isDismissed) {
    return null;
  }

  const sizeClasses = {
    sm: "p-3 text-sm",
    md: "p-4",
    lg: "p-6 text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const variantClasses = {
    default:
      "bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl",
    compact: "bg-amber-50 border border-amber-200 rounded-lg",
    banner:
      "bg-gradient-to-r from-amber-100 to-orange-100 border-l-4 border-amber-500 rounded-r-lg",
  };

  return (
    <>
      <div
        className={cn(variantClasses[variant], sizeClasses[size], className)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Crown className={cn(iconSizes[size], "text-amber-500")} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">
                  {finalTitle}
                </h4>
                <p className="text-gray-600 leading-relaxed mb-3">
                  {finalDescription}
                </p>

                {/* Help text */}
                {"help_text" in contextualMessage &&
                  contextualMessage.help_text && (
                    <p className="text-sm text-gray-500 mb-3">
                      {contextualMessage.help_text}
                    </p>
                  )}

                {/* Alternative suggestion */}
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
                {customAction?.text || ctaText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {/* Secondary action */}
              {showSecondaryAction && (
                <Button
                  onClick={() => window.open("/premium", "_blank")}
                  size="sm"
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Saber Mais
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </>
  );
}

// Specialized upgrade prompts for common scenarios
export function ContentUpgradePrompt(
  props: Omit<UpgradePromptProps, "context" | "restrictionType">
) {
  return (
    <UpgradePrompt
      context="post_view"
      restrictionType="premium_content"
      {...props}
    />
  );
}

export function ConnectionUpgradePrompt(
  props: Omit<UpgradePromptProps, "context" | "restrictionType">
) {
  return (
    <UpgradePrompt
      context="connection_request"
      restrictionType="connection_request"
      {...props}
    />
  );
}

export function ReflectionUpgradePrompt(
  props: Omit<UpgradePromptProps, "context" | "restrictionType">
) {
  return (
    <UpgradePrompt
      context="reflection_creation"
      restrictionType="reflection_creation"
      {...props}
    />
  );
}

"use client";

import { useState, useCallback, useRef } from "react";
import { useModeration } from "@/lib/hooks/useModeration";
import { ModerationFeedback } from "./ModerationFeedback";
import { ModerationResult, ModerationAction } from "@/types/moderation";
import { Loader2 } from "lucide-react";

interface ModeratedTextInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  rows?: number;
  strictMode?: boolean;
  autoModerate?: boolean;
  debounceMs?: number;
}

export function ModeratedTextInput({
  value,
  onChange,
  onValidationChange,
  placeholder = "Digite sua mensagem...",
  className = "",
  maxLength = 1000,
  rows = 3,
  strictMode = false,
  autoModerate = true,
  debounceMs = 1000,
}: ModeratedTextInputProps) {
  const [moderationResult, setModerationResult] =
    useState<ModerationResult | null>(null);
  const [moderationAction, setModerationAction] =
    useState<ModerationAction | null>(null);
  const [isOverridden, setIsOverridden] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const { moderateText, isLoading } = useModeration({
    strictMode,
    onModerationComplete: (result, action) => {
      setModerationResult(result as ModerationResult);
      setModerationAction(action);
      setIsOverridden(false);

      const isValid =
        action.type === "allow" || (action.canOverride && isOverridden);
      onValidationChange?.(isValid);
    },
  });

  const handleTextChange = useCallback(
    (newValue: string) => {
      onChange(newValue);

      if (!autoModerate || !newValue.trim()) {
        setModerationResult(null);
        setModerationAction(null);
        onValidationChange?.(true);
        return;
      }

      // Debounce da moderação
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        try {
          await moderateText(newValue);
        } catch (error) {
          console.error("Erro na moderação:", error);
        }
      }, debounceMs);
    },
    [onChange, autoModerate, debounceMs, moderateText, onValidationChange]
  );

  const handleOverride = useCallback(() => {
    setIsOverridden(true);
    onValidationChange?.(true);
  }, [onValidationChange]);

  const handleCancel = useCallback(() => {
    onChange("");
    setModerationResult(null);
    setModerationAction(null);
    setIsOverridden(false);
    onValidationChange?.(true);
  }, [onChange, onValidationChange]);

  const isValid =
    !moderationAction ||
    moderationAction.type === "allow" ||
    (moderationAction.canOverride && isOverridden);

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-lg resize-none
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${!isValid ? "border-red-300 bg-red-50" : ""}
            ${className}
          `}
        />

        {isLoading && (
          <div className="absolute top-2 right-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}

        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {value.length}/{maxLength}
          </span>

          {autoModerate && (
            <span className="text-xs text-gray-400">
              {isLoading ? "Verificando..." : "Moderação automática ativa"}
            </span>
          )}
        </div>
      </div>

      {moderationResult && moderationAction && !isOverridden && (
        <ModerationFeedback
          result={moderationResult}
          action={moderationAction}
          onOverride={moderationAction.canOverride ? handleOverride : undefined}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

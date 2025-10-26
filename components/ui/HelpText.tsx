"use client";

import { ReactNode } from "react";
import { Info, HelpCircle, AlertCircle, Crown, Lock } from "lucide-react";
import { Tooltip } from "./Tooltip";
import { cn } from "@/lib/utils";
import { HELP_TEXTS } from "@/lib/constants/error-messages";

interface HelpTextProps {
  text: string | ReactNode;
  type?: "info" | "warning" | "premium" | "restriction";
  variant?: "inline" | "tooltip" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
}

export function HelpText({
  text,
  type = "info",
  variant = "inline",
  size = "sm",
  className = "",
  tooltipPosition = "top",
}: HelpTextProps) {
  const getIcon = () => {
    const iconSizes = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    const iconClass = iconSizes[size];

    switch (type) {
      case "info":
        return <Info className={cn(iconClass, "text-blue-500")} />;
      case "warning":
        return <AlertCircle className={cn(iconClass, "text-amber-500")} />;
      case "premium":
        return <Crown className={cn(iconClass, "text-amber-500")} />;
      case "restriction":
        return <Lock className={cn(iconClass, "text-gray-500")} />;
      default:
        return <HelpCircle className={cn(iconClass, "text-gray-500")} />;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "info":
        return "text-blue-600";
      case "warning":
        return "text-amber-600";
      case "premium":
        return "text-amber-600";
      case "restriction":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (variant === "tooltip") {
    return (
      <Tooltip content={text} position={tooltipPosition} size={size}>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors",
            size === "sm" ? "p-1" : size === "md" ? "p-1.5" : "p-2",
            className
          )}
          aria-label="Ajuda"
        >
          {getIcon()}
        </button>
      </Tooltip>
    );
  }

  if (variant === "icon") {
    return (
      <div className={cn("inline-flex items-center gap-1", className)}>
        {getIcon()}
      </div>
    );
  }

  // Inline variant
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2",
        sizeClasses[size],
        getTextColor(),
        className
      )}
    >
      {getIcon()}
      <span>{text}</span>
    </div>
  );
}

// Predefined help text components for common scenarios
export function PremiumFeatureHelp({
  feature,
  variant = "tooltip",
  ...props
}: {
  feature: keyof typeof HELP_TEXTS;
  variant?: HelpTextProps["variant"];
} & Omit<HelpTextProps, "text" | "type">) {
  return (
    <HelpText
      text={HELP_TEXTS[feature]}
      type="premium"
      variant={variant}
      {...props}
    />
  );
}

export function RestrictionHelp({
  text,
  variant = "tooltip",
  ...props
}: {
  text: string;
  variant?: HelpTextProps["variant"];
} & Omit<HelpTextProps, "text" | "type">) {
  return (
    <HelpText text={text} type="restriction" variant={variant} {...props} />
  );
}

export function InfoHelp({
  text,
  variant = "inline",
  ...props
}: {
  text: string;
  variant?: HelpTextProps["variant"];
} & Omit<HelpTextProps, "text" | "type">) {
  return <HelpText text={text} type="info" variant={variant} {...props} />;
}

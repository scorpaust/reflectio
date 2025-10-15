export interface ModerationResult {
  flagged: boolean;
  severity: "low" | "medium" | "high";
  categories: string[];
  reason: string;
  suggestions?: string[];
  confidence: number;
}

export interface AudioModerationResult extends ModerationResult {
  transcription: string;
  transcriptionQuality: "good" | "fair" | "poor";
}

export interface ModerationConfig {
  enableTextModeration: boolean;
  enableAudioModeration: boolean;
  strictMode: boolean;
  allowedCategories: string[];
  blockedWords: string[];
  customRules: CustomModerationRule[];
}

export interface CustomModerationRule {
  id: string;
  name: string;
  pattern: string;
  severity: "low" | "medium" | "high";
  action: "warn" | "block" | "review";
  description: string;
}

export interface ModerationAction {
  type: "allow" | "warn" | "block" | "review";
  message: string;
  canOverride: boolean;
}

export interface ModerationHistory {
  id: string;
  userId: string;
  content: string;
  contentType: "text" | "audio";
  result: ModerationResult;
  action: ModerationAction;
  timestamp: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}

// Types for Password Strength Checker
export type PasswordVerdict = "weak" | "medium" | "strong" | "very strong";

export interface CrackTimeEstimate {
  seconds: number;
  humanReadable: string;
  attackScenario: "online" | "offline" | "offline_fast";
}

export interface PasswordStrengthResult {
  score: number; // 0-5 scale
  verdict: PasswordVerdict;
  suggestions: string[];
  crackTime: {
    online: CrackTimeEstimate;
    offline: CrackTimeEstimate;
    offlineFast: CrackTimeEstimate;
  };
}

// Types for Password Generator
export interface GeneratePasswordOptions {
  length?: number;
  numbers?: boolean;
  symbols?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  excludeSimilar?: boolean; // exclude similar chars like 0, O, l, 1
}

export interface PasswordAnalysis {
  length: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  entropy: number;
  isCommonPassword: boolean;
  varietyScore: number;
}

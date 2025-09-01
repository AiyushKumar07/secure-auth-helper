// Types for Password Strength Checker
export type PasswordVerdict = "weak" | "medium" | "strong" | "very strong";

export interface CrackTimeEstimate {
  seconds: number;
  humanReadable: string;
  attackScenario: "online" | "offline" | "offline_fast";
}

export interface PwnedCheckResult {
  isPwned: boolean;
  breachCount: number | null; // Number of times found in breaches, null if check failed
  errorMessage?: string; // Error message if check failed
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
  pwnedCheck: PwnedCheckResult;
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

// Types for Email Validation
export type EmailStatus = "VALID" | "INVALID";

export interface EmailValidations {
  syntax: boolean;
  domain_exists: boolean;
  mx_records: boolean;
  mailbox_exists: boolean;
  is_disposable: boolean;
  is_role_based: boolean;
}

export interface EmailValidationResult {
  email: string;
  validations: EmailValidations;
  score: number; // 0-100 scale
  status: EmailStatus;
  suggestions?: string[];
}
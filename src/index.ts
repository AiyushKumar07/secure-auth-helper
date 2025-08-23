// Main exports for secure-auth-helper package

export { PasswordChecker } from './passwordChecker';
export { PasswordGenerator } from './passwordGenerator';

// Export types for TypeScript users
export type {
  PasswordStrengthResult,
  PasswordVerdict,
  GeneratePasswordOptions,
  PasswordAnalysis,
  CrackTimeEstimate
} from './types';

// Import classes for internal use in convenience functions
import { PasswordChecker } from './passwordChecker';
import { PasswordGenerator } from './passwordGenerator';
import type { GeneratePasswordOptions } from './types';

// Convenience functions for easier usage
export function checkPasswordStrength(password: string) {
  return PasswordChecker.checkPassword(password);
}

export function generatePassword(options?: GeneratePasswordOptions) {
  return PasswordGenerator.generatePassword(options);
}

export function generateStrongPassword(options?: GeneratePasswordOptions) {
  return PasswordGenerator.generateStrongPassword(options);
}

export function generateMemorablePassword(wordCount?: number, addNumbers?: boolean, addSymbols?: boolean) {
  return PasswordGenerator.generateMemorablePassword(wordCount, addNumbers, addSymbols);
}

// Default export with all utilities
export default {
  checkPasswordStrength,
  generatePassword,
  generateStrongPassword,
  generateMemorablePassword,
  PasswordChecker,
  PasswordGenerator
};

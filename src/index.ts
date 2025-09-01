// Main exports for secure-auth-helper package

export { PasswordChecker } from './passwordChecker';
export { PasswordGenerator } from './passwordGenerator';
export { EmailChecker } from './emailChecker';

// Export types for TypeScript users
export type {
  PasswordStrengthResult,
  PasswordVerdict,
  GeneratePasswordOptions,
  PasswordAnalysis,
  CrackTimeEstimate,
  PwnedCheckResult,
  EmailValidationResult,
  EmailValidations,
  EmailStatus
} from './types';

// Import classes for internal use in convenience functions
import { PasswordChecker } from './passwordChecker';
import { PasswordGenerator } from './passwordGenerator';
import { EmailChecker } from './emailChecker';
import type { GeneratePasswordOptions } from './types';

// Convenience functions for easier usage
export function checkPasswordStrength(password: string) {
  return PasswordChecker.checkPassword(password);
}

export async function checkPasswordStrengthWithPwnedCheck(password: string) {
  return PasswordChecker.checkPasswordWithPwnedCheck(password);
}

export async function checkIfPasswordPwned(password: string) {
  return PasswordChecker.checkIfPasswordPwned(password);
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

// Email validation convenience functions
export function validateEmail(email: string) {
  return EmailChecker.validateEmail(email);
}

export function isValidEmailSyntax(email: string) {
  return EmailChecker.isValidEmailSyntax(email);
}

export function validateEmails(emails: string[]) {
  return EmailChecker.validateEmails(emails);
}

// Default export with all utilities
export default {
  checkPasswordStrength,
  checkPasswordStrengthWithPwnedCheck,
  checkIfPasswordPwned,
  generatePassword,
  generateStrongPassword,
  generateMemorablePassword,
  validateEmail,
  isValidEmailSyntax,
  validateEmails,
  PasswordChecker,
  PasswordGenerator,
  EmailChecker
};

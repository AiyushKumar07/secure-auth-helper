import { promisify } from 'util';
import * as dns from 'dns';
import type { EmailValidationResult, EmailValidations, EmailStatus } from './types';
import { isDisposableEmailDomainAsync } from './data/disposableEmailProviders';
import { isRoleBasedEmail } from './data/roleBasedEmails';

const resolveMx = promisify(dns.resolveMx);
const lookup = promisify(dns.lookup);

/**
 * EmailChecker class for comprehensive email validation
 */
export class EmailChecker {
  
  /**
   * Validates email syntax according to RFC standards
   * @param email - Email address to validate
   * @returns true if syntax is valid
   */
  private static validateEmailSyntax(email: string): boolean {
    // Basic RFC 5322 compliant regex - simplified but covers most cases
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      return false;
    }
    
    // Additional checks
    const [localPart, domain] = email.split('@');
    
    // Local part shouldn't be empty or too long
    if (!localPart || localPart.length > 64) {
      return false;
    }
    
    // Domain shouldn't be empty or too long
    if (!domain || domain.length > 253) {
      return false;
    }
    
    // Check for consecutive dots
    if (email.includes('..')) {
      return false;
    }
    
    // Local part shouldn't start or end with a dot
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Checks if domain exists via DNS lookup
   * @param domain - Domain to check
   * @returns Promise<boolean> - true if domain exists
   */
  private static async checkDomainExists(domain: string): Promise<boolean> {
    try {
      await lookup(domain);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Checks if domain has MX records
   * @param domain - Domain to check
   * @returns Promise<boolean> - true if MX records exist
   */
  private static async checkMxRecords(domain: string): Promise<boolean> {
    try {
      const mxRecords = await resolveMx(domain);
      return mxRecords && mxRecords.length > 0;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Basic mailbox existence check
   * Note: This is a simplified check. True verification would require SMTP connection
   * which is often blocked or unreliable. This checks domain validity as a proxy.
   * @param email - Email address to check
   * @returns Promise<boolean> - true if mailbox likely exists
   */
  private static async checkMailboxExists(email: string): Promise<boolean> {
    // For this implementation, we'll consider the mailbox exists if:
    // 1. Domain exists
    // 2. Domain has MX records
    // 3. Email syntax is valid
    // Real mailbox verification would require SMTP VRFY/RCPT TO commands
    
    const domain = email.split('@')[1];
    const domainExists = await this.checkDomainExists(domain);
    const hasMxRecords = await this.checkMxRecords(domain);
    const validSyntax = this.validateEmailSyntax(email);
    
    return domainExists && hasMxRecords && validSyntax;
  }
  
  /**
   * Calculates email validation score (0-100)
   * @param validations - Email validation results
   * @returns number - Score from 0 to 100
   */
  private static calculateScore(validations: EmailValidations): number {
    let score = 0;
    const weights = {
      syntax: 30,           // Syntax is critical
      domain_exists: 25,    // Domain existence is very important
      mx_records: 20,       // MX records are important for deliverability
      mailbox_exists: 15,   // Mailbox existence check
      is_disposable: -20,   // Penalty for disposable emails
      is_role_based: -10    // Mild penalty for role-based emails
    };
    
    // Add points for positive validations
    if (validations.syntax) score += weights.syntax;
    if (validations.domain_exists) score += weights.domain_exists;
    if (validations.mx_records) score += weights.mx_records;
    if (validations.mailbox_exists) score += weights.mailbox_exists;
    
    // Subtract points for negative indicators
    if (validations.is_disposable) score += weights.is_disposable;
    if (validations.is_role_based) score += weights.is_role_based;
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Determines email status based on validations
   * @param validations - Email validation results
   * @param score - Calculated score
   * @returns EmailStatus - VALID or INVALID
   */
  private static determineStatus(validations: EmailValidations, score: number): EmailStatus {
    // Email is invalid if basic requirements aren't met
    if (!validations.syntax || !validations.domain_exists) {
      return "INVALID";
    }
    
    // Consider valid if score is above threshold
    return score >= 50 ? "VALID" : "INVALID";
  }
  
  /**
   * Generates suggestions for improving email validation
   * @param email - Original email
   * @param validations - Validation results
   * @returns string[] - Array of suggestions
   */
  private static generateSuggestions(email: string, validations: EmailValidations): string[] {
    const suggestions: string[] = [];
    
    if (!validations.syntax) {
      suggestions.push("Email format is invalid. Please check for typos and ensure it follows the format: user@domain.com");
    }
    
    if (!validations.domain_exists) {
      suggestions.push("The domain does not exist. Please verify the domain name is correct.");
    }
    
    if (!validations.mx_records) {
      suggestions.push("The domain cannot receive emails (no MX records found). Please check if this is the correct email address.");
    }
    
    if (!validations.mailbox_exists) {
      suggestions.push("The mailbox may not exist or may not be accessible. Please verify this email address is active.");
    }
    
    if (validations.is_disposable) {
      suggestions.push("This appears to be a disposable/temporary email address. Consider using a permanent email address.");
    }
    
    if (validations.is_role_based) {
      suggestions.push("This appears to be a role-based email address (e.g., support@, admin@). Consider using a personal email address if required.");
    }
    
    return suggestions;
  }
  
  /**
   * Performs comprehensive email validation
   * @param email - Email address to validate
   * @returns Promise<EmailValidationResult> - Complete validation result
   */
  static async validateEmail(email: string): Promise<EmailValidationResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.split('@')[1] || '';
    
    // Perform basic synchronous validations first
    const validations: EmailValidations = {
      syntax: this.validateEmailSyntax(normalizedEmail),
      domain_exists: false,
      mx_records: false,
      mailbox_exists: false,
      is_disposable: false,
      is_role_based: isRoleBasedEmail(normalizedEmail)
    };
    
    // Perform async validations (network checks and disposable domain check)
    if (validations.syntax && domain) {
      try {
        // Run all async checks in parallel for better performance
        const [domainExists, hasMxRecords, isDisposable] = await Promise.all([
          this.checkDomainExists(domain),
          this.checkMxRecords(domain),
          isDisposableEmailDomainAsync(domain)
        ]);
        
        validations.domain_exists = domainExists;
        validations.mx_records = hasMxRecords;
        validations.is_disposable = isDisposable;
        
        // Only check mailbox if domain and MX records exist
        if (domainExists && hasMxRecords) {
          validations.mailbox_exists = await this.checkMailboxExists(normalizedEmail);
        }
      } catch (error) {
        // Network errors - validations remain false
        console.warn('Network error during email validation:', error);
      }
    } else {
      // Even if syntax is invalid, still check if it's a disposable domain
      try {
        validations.is_disposable = await isDisposableEmailDomainAsync(domain);
      } catch (error) {
        // If disposable check fails, it remains false
        console.warn('Error checking disposable domain:', error);
      }
    }
    
    // Calculate score and determine status
    const score = this.calculateScore(validations);
    const status = this.determineStatus(validations, score);
    
    // Generate suggestions if email is not perfect
    const suggestions = score < 100 ? this.generateSuggestions(normalizedEmail, validations) : undefined;
    
    return {
      email: normalizedEmail,
      validations,
      score,
      status,
      suggestions
    };
  }
  
  /**
   * Quick syntax-only validation for performance-critical scenarios
   * @param email - Email address to validate
   * @returns boolean - true if syntax is valid
   */
  static isValidEmailSyntax(email: string): boolean {
    return this.validateEmailSyntax(email.trim().toLowerCase());
  }
  
  /**
   * Batch email validation
   * @param emails - Array of email addresses to validate
   * @returns Promise<EmailValidationResult[]> - Array of validation results
   */
  static async validateEmails(emails: string[]): Promise<EmailValidationResult[]> {
    const validationPromises = emails.map(email => this.validateEmail(email));
    return Promise.all(validationPromises);
  }
}

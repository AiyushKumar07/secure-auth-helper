import { EmailChecker } from '../emailChecker';
import type { EmailValidationResult, EmailStatus } from '../types';

describe('EmailChecker', () => {
  
  describe('isValidEmailSyntax', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'user+tag@example.net',
        'user123@test-domain.co.uk',
        'test_email@domain-name.com',
        'a@b.co',
        'test.email.with.dots@example.com',
        'user+123@example.com'
      ];
      
      validEmails.forEach(email => {
        expect(EmailChecker.isValidEmailSyntax(email)).toBe(true);
      });
    });
    
    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        '.test@example.com',
        'test.@example.com',
        'test@example.',
        'test @example.com',
        'test@exa mple.com',
        '',
        'test@example..com',
        'a'.repeat(65) + '@example.com', // local part too long
        'test@' + 'a'.repeat(250) + '.com' // domain too long
      ];
      
      invalidEmails.forEach(email => {
        expect(EmailChecker.isValidEmailSyntax(email)).toBe(false);
      });
    });
  });
  
  describe('validateEmail', () => {
    
    it('should validate a proper email with good domain', async () => {
      const result = await EmailChecker.validateEmail('test@gmail.com');
      
      expect(result.email).toBe('test@gmail.com');
      expect(result.validations.syntax).toBe(true);
      expect(result.validations.domain_exists).toBe(true);
      expect(result.validations.mx_records).toBe(true);
      expect(result.validations.is_disposable).toBe(false);
      expect(result.validations.is_role_based).toBe(false);
      expect(result.score).toBeGreaterThan(80);
      expect(result.status).toBe('VALID');
    }, 10000); // Increased timeout for network operations
    
    it('should handle invalid syntax', async () => {
      const result = await EmailChecker.validateEmail('invalid-email');
      
      expect(result.validations.syntax).toBe(false);
      expect(result.validations.domain_exists).toBe(false);
      expect(result.validations.mx_records).toBe(false);
      expect(result.validations.mailbox_exists).toBe(false);
      expect(result.score).toBe(0);
      expect(result.status).toBe('INVALID');
      expect(result.suggestions?.some(s => s.includes('Email format is invalid'))).toBe(true);
    });
    
    it('should detect disposable email providers', async () => {
      const result = await EmailChecker.validateEmail('test@10minutemail.com');
      
      expect(result.validations.syntax).toBe(true);
      expect(result.validations.is_disposable).toBe(true);
      expect(result.score).toBeLessThan(50); // Should be penalized
      expect(result.suggestions?.some(s => s.includes('disposable/temporary email'))).toBe(true);
    });
    
    it('should detect role-based emails', async () => {
      const result = await EmailChecker.validateEmail('admin@example.com');
      
      expect(result.validations.syntax).toBe(true);
      expect(result.validations.is_role_based).toBe(true);
      expect(result.suggestions?.some(s => s.includes('role-based email'))).toBe(true);
    });
    
    it('should handle domain that does not exist', async () => {
      const result = await EmailChecker.validateEmail('test@nonexistentdomain12345.com');
      
      expect(result.validations.syntax).toBe(true);
      expect(result.validations.domain_exists).toBe(false);
      expect(result.validations.mx_records).toBe(false);
      expect(result.validations.mailbox_exists).toBe(false);
      expect(result.status).toBe('INVALID');
      expect(result.suggestions?.some(s => s.includes('domain does not exist'))).toBe(true);
    }, 10000);
    
    it('should normalize email addresses', async () => {
      const result = await EmailChecker.validateEmail('  TEST@GMAIL.COM  ');
      
      expect(result.email).toBe('test@gmail.com');
    }, 10000);
    
    it('should handle various role-based email patterns', async () => {
      const roleEmails = [
        'support@example.com',
        'admin@example.com',
        'info@example.com',
        'noreply@example.com',
        'sales@example.com',
        'contact@example.com',
        'help@example.com'
      ];
      
      for (const email of roleEmails) {
        const result = await EmailChecker.validateEmail(email);
        expect(result.validations.is_role_based).toBe(true);
      }
    });
    
    it('should not flag personal emails as role-based', async () => {
      const personalEmails = [
        'john.doe@example.com',
        'jane.smith@example.com',
        'alice123@example.com',
        'bob_wilson@example.com'
      ];
      
      for (const email of personalEmails) {
        const result = await EmailChecker.validateEmail(email);
        expect(result.validations.is_role_based).toBe(false);
      }
    });
  });
  
  describe('validateEmails', () => {
    it('should validate multiple emails', async () => {
      const emails = [
        'test@gmail.com',
        'invalid-email',
        'admin@example.com'
      ];
      
      const results = await EmailChecker.validateEmails(emails);
      
      expect(results).toHaveLength(3);
      expect(results[0].validations.syntax).toBe(true);
      expect(results[1].validations.syntax).toBe(false);
      expect(results[2].validations.is_role_based).toBe(true);
    }, 15000);
  });
  
  describe('edge cases', () => {
    it('should handle empty string', async () => {
      const result = await EmailChecker.validateEmail('');
      expect(result.validations.syntax).toBe(false);
      expect(result.status).toBe('INVALID');
    });
    
    it('should handle very long emails', async () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const result = await EmailChecker.validateEmail(longEmail);
      expect(result.validations.syntax).toBe(false);
    });
    
    it('should handle emails with special characters', async () => {
      const specialEmails = [
        'test+filter@gmail.com',
        'user.name@example.com',
        'user_name@example.com',
        'user-name@example.com'
      ];
      
      for (const email of specialEmails) {
        const result = await EmailChecker.validateEmail(email);
        expect(result.validations.syntax).toBe(true);
      }
    }, 10000);
  });
  
  describe('scoring system', () => {
    it('should give high scores to valid emails', async () => {
      const result = await EmailChecker.validateEmail('test@gmail.com');
      expect(result.score).toBeGreaterThan(80);
    }, 10000);
    
    it('should give low scores to invalid emails', async () => {
      const result = await EmailChecker.validateEmail('invalid-email');
      expect(result.score).toBe(0);
    });
    
    it('should penalize disposable emails', async () => {
      const disposableResult = await EmailChecker.validateEmail('test@10minutemail.com');
      const normalResult = await EmailChecker.validateEmail('test@gmail.com');
      
      // Even if both have valid syntax, disposable should score lower
      if (disposableResult.validations.syntax && normalResult.validations.syntax) {
        expect(disposableResult.score).toBeLessThan(normalResult.score);
      }
    }, 10000);
  });
  
  describe('suggestions', () => {
    it('should provide helpful suggestions for invalid emails', async () => {
      const result = await EmailChecker.validateEmail('test@nonexistentdomain.com');
      
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
    }, 10000);
    
    it('should not provide suggestions for perfect emails', async () => {
      const result = await EmailChecker.validateEmail('test@gmail.com');
      
      if (result.score === 100) {
        expect(result.suggestions).toBeUndefined();
      }
    }, 10000);
  });
});

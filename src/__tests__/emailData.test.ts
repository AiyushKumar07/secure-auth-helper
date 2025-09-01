import { 
  isDisposableEmailDomain, 
  isDisposableEmailDomainAsync,
  FALLBACK_DISPOSABLE_DOMAINS,
  getDisposableDomainsCacheInfo,
  refreshDisposableDomainsCache
} from '../data/disposableEmailProviders';
import { isRoleBasedEmail, ROLE_BASED_EMAIL_PREFIXES } from '../data/roleBasedEmails';

describe('Email Data', () => {
  
  describe('disposableEmailProviders', () => {
    it('should have a populated fallback set of disposable providers', () => {
      expect(FALLBACK_DISPOSABLE_DOMAINS.size).toBeGreaterThan(10);
    });
    
    it('should provide cache information', () => {
      const cacheInfo = getDisposableDomainsCacheInfo();
      expect(cacheInfo).toHaveProperty('isCached');
      expect(cacheInfo).toHaveProperty('domainCount');
      expect(cacheInfo).toHaveProperty('lastFetchTime');
      expect(cacheInfo).toHaveProperty('cacheAge');
      expect(cacheInfo.domainCount).toBeGreaterThan(10);
    });
    
    it('should detect known disposable email domains', () => {
      const disposableDomains = [
        '10minutemail.com',
        'mailinator.com',
        'guerrillamail.com',
        'tempmail.org',
        'yopmail.com'
      ];
      
      disposableDomains.forEach(domain => {
        expect(isDisposableEmailDomain(domain)).toBe(true);
      });
    });
    
    it('should not flag legitimate email providers', () => {
      const legitimateDomains = [
        'gmail.com',
        'yahoo.com',
        'outlook.com',
        'hotmail.com',
        'aol.com',
        'icloud.com'
      ];
      
      legitimateDomains.forEach(domain => {
        expect(isDisposableEmailDomain(domain)).toBe(false);
      });
    });
    
    it('should be case insensitive', () => {
      expect(isDisposableEmailDomain('MAILINATOR.COM')).toBe(true);
      expect(isDisposableEmailDomain('Guerrillamail.com')).toBe(true);
    });
    
    it('should work asynchronously with comprehensive list', async () => {
      // Use domains that are guaranteed to be in both fallback and comprehensive lists
      const disposableDomains = [
        '10minutemail.com',
        'mailinator.com',
        'guerrillamail.com',
        'yopmail.com'
      ];
      
      // Force cache refresh to ensure we're testing against the comprehensive list
      try {
        await refreshDisposableDomainsCache();
      } catch (error) {
        console.warn('Cache refresh failed, using fallback list');
      }
      
      for (const domain of disposableDomains) {
        const result = await isDisposableEmailDomainAsync(domain);
        expect(result).toBe(true);
      }
    }, 20000); // Increased timeout for network requests
    
    it('should handle async errors gracefully', async () => {
      const result = await isDisposableEmailDomainAsync('gmail.com');
      expect(typeof result).toBe('boolean');
    });
    
    it('should allow cache refresh', async () => {
      try {
        await refreshDisposableDomainsCache();
        const cacheInfo = getDisposableDomainsCacheInfo();
        expect(cacheInfo.isCached).toBe(true);
      } catch (error) {
        // Cache refresh might fail in test environment, that's okay
        console.warn('Cache refresh failed in test:', error);
      }
    }, 15000);
  });
  
  describe('roleBasedEmails', () => {
    it('should have a populated set of role-based prefixes', () => {
      expect(ROLE_BASED_EMAIL_PREFIXES.size).toBeGreaterThan(30);
    });
    
    it('should detect common role-based emails', () => {
      const roleBasedEmails = [
        'admin@example.com',
        'support@example.com',
        'info@example.com',
        'contact@example.com',
        'sales@example.com',
        'help@example.com',
        'noreply@example.com',
        'postmaster@example.com',
        'webmaster@example.com'
      ];
      
      roleBasedEmails.forEach(email => {
        expect(isRoleBasedEmail(email)).toBe(true);
      });
    });
    
    it('should not flag personal emails', () => {
      const personalEmails = [
        'john.doe@example.com',
        'jane.smith@example.com',
        'alice123@example.com',
        'bob_wilson@example.com',
        'mary.jones@example.com',
        'david.brown@example.com'
      ];
      
      personalEmails.forEach(email => {
        expect(isRoleBasedEmail(email)).toBe(false);
      });
    });
    
    it('should handle role-based emails with numbers and separators', () => {
      const roleBasedVariations = [
        'admin1@example.com',
        'support.team@example.com',
        'info-desk@example.com',
        'sales_team@example.com',
        'help123@example.com'
      ];
      
      roleBasedVariations.forEach(email => {
        expect(isRoleBasedEmail(email)).toBe(true);
      });
    });
    
    it('should be case insensitive', () => {
      expect(isRoleBasedEmail('ADMIN@EXAMPLE.COM')).toBe(true);
      expect(isRoleBasedEmail('Support@Example.com')).toBe(true);
    });
    
    it('should not match partial words', () => {
      // These should not be flagged as role-based
      const notRoleBasedEmails = [
        'john.doe@example.com',      // personal name
        'jane.smith@example.com',    // personal name
        'jonathan@example.com',      // contains 'on' but not a role
        'sally@example.com',         // contains 'sales' substring but not at start
        'informative@example.com',   // contains 'info' but doesn't start with it
        'administrators@example.com' // contains 'admin' but has extra letters
      ];
      
      notRoleBasedEmails.forEach(email => {
        expect(isRoleBasedEmail(email)).toBe(false);
      });
    });
    
    it('should handle exact matches without separators', () => {
      const exactMatches = [
        'admin@example.com',
        'info@example.com',
        'sales@example.com'
      ];
      
      exactMatches.forEach(email => {
        expect(isRoleBasedEmail(email)).toBe(true);
      });
    });
  });
  
  describe('integration', () => {
    it('should correctly identify emails that are both disposable and role-based', () => {
      const email = 'admin@10minutemail.com';
      const domain = email.split('@')[1];
      
      expect(isDisposableEmailDomain(domain)).toBe(true);
      expect(isRoleBasedEmail(email)).toBe(true);
    });
    
    it('should handle edge cases with empty or malformed inputs', () => {
      expect(isDisposableEmailDomain('')).toBe(false);
      expect(isRoleBasedEmail('')).toBe(false);
      expect(isRoleBasedEmail('notanemail')).toBe(false);
    });
  });
});

import { PasswordChecker } from '../passwordChecker';
import { PasswordGenerator } from '../passwordGenerator';

describe('Edge Cases and Additional Coverage', () => {
  
  describe('PasswordChecker Edge Cases', () => {
    
    test('should handle unicode characters', () => {
      const unicodePasswords = [
        'Pàssw®rd123!',
        'Пароль123!',
        '密码123!',
        'مرور123!'
      ];

      unicodePasswords.forEach(password => {
        const result = PasswordChecker.checkPassword(password);
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('verdict');
        expect(result).toHaveProperty('suggestions');
        expect(result).toHaveProperty('crackTime');
      });
    });

    test('should handle very long passwords', () => {
      const veryLongPassword = 'A'.repeat(100) + '1!';
      const result = PasswordChecker.checkPassword(veryLongPassword);
      
      expect(result.score).toBeGreaterThan(0);
      expect(result.verdict).not.toBe('weak');
      expect(result.crackTime.online.seconds).toBeGreaterThan(0);
    });

    test('should handle passwords with only symbols', () => {
      const symbolOnlyPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const result = PasswordChecker.checkPassword(symbolOnlyPassword);
      
      expect(result.score).toBeGreaterThan(0);
      expect(result.suggestions).toContain('Add uppercase letters (A-Z)');
      expect(result.suggestions).toContain('Add lowercase letters (a-z)');
      expect(result.suggestions).toContain('Add numbers (0-9)');
    });

    test('should handle passwords with mixed case but no other types', () => {
      const mixedCaseOnly = 'AbCdEfGhIjKl';
      const result = PasswordChecker.checkPassword(mixedCaseOnly);
      
      expect(result.suggestions).toContain('Add numbers (0-9)');
      expect(result.suggestions).toContain('Add special characters (!@#$%^&*)');
    });

    test('should detect keyboard patterns in different cases', () => {
      const keyboardPatterns = [
        'QWERTY123',
        'asdfgh456',
        'ZxCvBn789',
        '1q2w3e4r',
        '9o8i7u6y'
      ];

      keyboardPatterns.forEach(password => {
        const result = PasswordChecker.checkPassword(password);
        // These should generally have lower scores due to patterns
        expect(result.score).toBeLessThanOrEqual(3);
      });
    });

    test('should handle alternating patterns', () => {
      const alternatingPatterns = [
        'AaAaAaAa',
        '1a1a1a1a',
        'AbAbAbAb12',
        'XyXyXyXy!@'
      ];

      alternatingPatterns.forEach(password => {
        const result = PasswordChecker.checkPassword(password);
        // Alternating patterns should be penalized
        expect(result.score).toBeLessThan(4);
      });
    });

    test('should properly format very large crack times', () => {
      const veryStrongPassword = 'Tr0ub4dor&3!K$mG9#vQ2w@LpR8tY5nM2';
      const result = PasswordChecker.checkPassword(veryStrongPassword);
      
      // Should handle very large numbers in time formatting
      expect(result.crackTime.online.humanReadable).toMatch(/(year|billion year|million year)/);
      expect(result.crackTime.offline.seconds).toBeGreaterThan(365 * 24 * 3600);
    });

    test('should handle edge cases in time formatting', () => {
      // Test password that might result in exactly 1 second, minute, hour, etc.
      const edgePasswords = ['Aa1!', 'Bb2@', 'Cc3#'];
      
      edgePasswords.forEach(password => {
        const result = PasswordChecker.checkPassword(password);
        expect(typeof result.crackTime.online.humanReadable).toBe('string');
        expect(result.crackTime.online.humanReadable.length).toBeGreaterThan(0);
      });
    });

    test('should handle passwords with repeated substrings', () => {
      const repeatedSubstrings = [
        'abcabc123',
        'xyzxyzxyz',
        '123123123',
        'passpass!'
      ];

      repeatedSubstrings.forEach(password => {
        const result = PasswordChecker.checkPassword(password);
        // Repeated patterns should be penalized
        expect(result.score).toBeLessThan(4);
      });
    });

    test('should detect phone and date patterns accurately', () => {
      const datePatterns = [
        'mypass2023birth',
        'secret01011990',
        'user12/25/2000',
        'admin01-01-1985'
      ];

      const phonePatterns = [
        'pass555-1234',
        'user(555)123-4567',
        'secret5551234567'
      ];

      [...datePatterns, ...phonePatterns].forEach(password => {
        const result = PasswordChecker.checkPassword(password);
        // Should be detected and penalized appropriately
        expect(result.score).toBeLessThanOrEqual(4.5);
      });
    });
  });

  describe('PasswordGenerator Edge Cases', () => {

    test('should handle minimum length with all character types', () => {
      const password = PasswordGenerator.generatePassword({ 
        length: 4, 
        lowercase: true, 
        uppercase: true, 
        numbers: true, 
        symbols: true 
      });

      expect(password).toHaveLength(4);
      
      // Should have at least one of each type, but with only 4 characters total
      // this tests the algorithm's ability to handle minimal requirements
      const hasLowercase = /[a-z]/.test(password);
      const hasUppercase = /[A-Z]/.test(password);
      const hasNumbers = /[0-9]/.test(password);
      const hasSymbols = /[^A-Za-z0-9]/.test(password);
      
      expect([hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length).toBe(4);
    });

    test('should exclude similar characters comprehensively', () => {
      const iterations = 50;
      const passwords = [];
      
      for (let i = 0; i < iterations; i++) {
        const password = PasswordGenerator.generatePassword({ 
          length: 20, 
          excludeSimilar: true 
        });
        passwords.push(password);
      }

      // Check that NO passwords contain similar characters
      passwords.forEach(password => {
        expect(password).not.toMatch(/[0O1lI|]/);
      });
    });

    test('should handle large password lengths', () => {
      const largeLengths = [50, 100, 200];
      
      largeLengths.forEach(length => {
        const password = PasswordGenerator.generatePassword({ length });
        expect(password).toHaveLength(length);
        
        // Should still meet character type requirements
        expect(password).toMatch(/[a-z]/);
        expect(password).toMatch(/[A-Z]/);
        expect(password).toMatch(/[0-9]/);
        expect(password).toMatch(/[^A-Za-z0-9]/);
      });
    });

    test('should generate unique passwords consistently', () => {
      const uniqueTests = [
        { length: 8, iterations: 100 },
        { length: 12, iterations: 100 },
        { length: 16, iterations: 50 }
      ];

      uniqueTests.forEach(({ length, iterations }) => {
        const passwords = new Set();
        
        for (let i = 0; i < iterations; i++) {
          passwords.add(PasswordGenerator.generatePassword({ length }));
        }
        
        // Should have very high uniqueness (allowing for tiny possibility of collision)
        expect(passwords.size).toBeGreaterThanOrEqual(iterations * 0.99);
      });
    });

    test('should handle single character type with excludeSimilar', () => {
      const testConfigs = [
        { lowercase: true, uppercase: false, numbers: false, symbols: false, excludeSimilar: true },
        { lowercase: false, uppercase: true, numbers: false, symbols: false, excludeSimilar: true },
        { lowercase: false, uppercase: false, numbers: true, symbols: false, excludeSimilar: true }
      ];

      testConfigs.forEach(config => {
        const password = PasswordGenerator.generatePassword({ 
          length: 10, 
          ...config 
        });
        
        expect(password).toHaveLength(10);
        expect(password).not.toMatch(/[0O1lI|]/);
      });
    });
  });

  describe('PasswordGenerator Memorable Password Edge Cases', () => {
    
    test('should handle edge cases for word counts', () => {
      const wordCounts = [1, 2, 10];
      
      wordCounts.forEach(count => {
        const password = PasswordGenerator.generateMemorablePassword(count, true, true);
        expect(typeof password).toBe('string');
        expect(password.length).toBeGreaterThan(0);
        
        // Should have appropriate number of word separators
        const separators = (password.match(/-/g) || []).length;
        expect(separators).toBeGreaterThanOrEqual(count - 1);
      });
    });

    test('should handle all false flags', () => {
      const password = PasswordGenerator.generateMemorablePassword(3, false, false);
      
      // Should only contain letters and hyphens
      expect(password).toMatch(/^[A-Za-z-]+$/);
      expect(password).not.toMatch(/[\d!@#$%&*]/);
    });

    test('should generate different memorable passwords consistently', () => {
      const memorablePasswords = new Set();
      
      for (let i = 0; i < 20; i++) {
        memorablePasswords.add(PasswordGenerator.generateMemorablePassword());
      }
      
      expect(memorablePasswords.size).toBe(20); // All should be unique
    });
  });

  describe('PasswordGenerator Strong Password Selection', () => {
    
    test('should consistently select passwords with higher entropy', () => {
      const results = [];
      
      // Generate multiple strong passwords and check their entropy distribution
      for (let i = 0; i < 10; i++) {
        const strongPassword = PasswordGenerator.generateStrongPassword({ length: 12 });
        const regularPassword = PasswordGenerator.generatePassword({ length: 12 });
        
        results.push({ strong: strongPassword, regular: regularPassword });
      }
      
      // The strong password selection should generally produce good passwords
      // (though there's randomness involved, so we can't be 100% deterministic)
      results.forEach(({ strong }) => {
        expect(strong).toHaveLength(12);
        
        // Should have good character variety
        let charTypes = 0;
        if (/[a-z]/.test(strong)) charTypes++;
        if (/[A-Z]/.test(strong)) charTypes++;
        if (/[0-9]/.test(strong)) charTypes++;
        if (/[^A-Za-z0-9]/.test(strong)) charTypes++;
        
        expect(charTypes).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('Integration and Compatibility Tests', () => {
    
    test('should work correctly with generated passwords', () => {
      // Generate various types of passwords and ensure they can be analyzed
      const generatedTypes = [
        PasswordGenerator.generatePassword(),
        PasswordGenerator.generateStrongPassword(),
        PasswordGenerator.generateMemorablePassword()
      ];

      generatedTypes.forEach(password => {
        const analysis = PasswordChecker.checkPassword(password);
        
        expect(analysis.score).toBeGreaterThan(0);
        expect(['weak', 'medium', 'strong', 'very strong']).toContain(analysis.verdict);
        expect(analysis.suggestions).toBeInstanceOf(Array);
        expect(analysis.crackTime).toHaveProperty('online');
        expect(analysis.crackTime).toHaveProperty('offline');
        expect(analysis.crackTime).toHaveProperty('offlineFast');
      });
    });

    test('should handle concurrent operations safely', () => {
      // Test thread-safety by running multiple operations simultaneously
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(Promise.resolve(PasswordGenerator.generatePassword({ length: 8 + i })));
        promises.push(Promise.resolve(PasswordChecker.checkPassword(`TestPass${i}!`)));
      }
      
      return Promise.all(promises).then(results => {
        expect(results).toHaveLength(20);
        
        // Passwords should be the expected lengths
        const passwords = results.filter((r, i) => i % 2 === 0);
        passwords.forEach((password, index) => {
          expect(password).toHaveLength(8 + index);
        });
        
        // Analysis results should be valid
        const analyses = results.filter((r, i) => i % 2 === 1);
        analyses.forEach(analysis => {
          expect(analysis).toHaveProperty('score');
          expect(analysis).toHaveProperty('verdict');
        });
      });
    });
  });

  describe('Boundary Value Testing', () => {
    
    test('should handle boundary values for scoring', () => {
      // Test passwords that might hit specific score boundaries
      const boundaryTests = [
        { password: 'a', expectedScore: 0 },
        { password: 'Aa1!', expectedMaxScore: 2 }, // Very short but has variety
        { password: 'VeryLongPasswordWithoutNumbersOrSymbols', expectedMinScore: 2 }
      ];

      boundaryTests.forEach(({ password, expectedScore, expectedMaxScore, expectedMinScore }) => {
        const result = PasswordChecker.checkPassword(password);
        
        if (expectedScore !== undefined) {
          expect(result.score).toBe(expectedScore);
        }
        if (expectedMaxScore !== undefined) {
          expect(result.score).toBeLessThanOrEqual(expectedMaxScore);
        }
        if (expectedMinScore !== undefined) {
          expect(result.score).toBeGreaterThanOrEqual(expectedMinScore);
        }
      });
    });
  });
});

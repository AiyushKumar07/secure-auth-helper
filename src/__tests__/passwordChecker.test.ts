import { PasswordChecker } from '../passwordChecker';

describe('PasswordChecker', () => {
  
  describe('checkPassword', () => {
    
    test('should return weak for common passwords', () => {
      const commonPasswords = ['password', '123456', 'qwerty', 'admin'];
      
      commonPasswords.forEach(password => {
        const result = PasswordChecker.checkPassword(password);
        expect(result.score).toBe(0);
        expect(result.verdict).toBe('weak');
        expect(result.suggestions).toContain('Avoid common passwords - use a unique combination');
        expect(result.crackTime).toBeDefined();
        expect(result.crackTime.online.humanReadable).toBe('instantly');
      });
    });

    test('should return weak for very short passwords', () => {
      const result = PasswordChecker.checkPassword('abc');
      expect(result.verdict).toBe('weak');
      expect(result.suggestions).toContain('Use at least 8 characters');
    });

    test('should provide suggestions for missing character types', () => {
      const testCases = [
        { password: 'alllowercase', expected: 'Add uppercase letters (A-Z)' },
        { password: 'ALLUPPERCASE', expected: 'Add lowercase letters (a-z)' },
        { password: 'NoNumbers!', expected: 'Add numbers (0-9)' },
        { password: 'NoSymbols123', expected: 'Add special characters (!@#$%^&*)' }
      ];

      testCases.forEach(testCase => {
        const result = PasswordChecker.checkPassword(testCase.password);
        expect(result.suggestions).toContain(testCase.expected);
      });
    });

    test('should give high scores to strong passwords', () => {
      const strongPasswords = [
        'MyV3ry$tr0ngP@ssw0rd!',
        'Tr0ub4dor&3',
        'C0rrect-H0rse-B@ttery-St@ple!'
      ];

      strongPasswords.forEach(password => {
        const result = PasswordChecker.checkPassword(password);
        expect(result.score).toBeGreaterThanOrEqual(3);
        expect(['strong', 'very strong']).toContain(result.verdict);
      });
    });

    test('should handle empty password', () => {
      const result = PasswordChecker.checkPassword('');
      expect(result.score).toBe(0);
      expect(result.verdict).toBe('weak');
    });

    test('should score based on length appropriately', () => {
      const shortResult = PasswordChecker.checkPassword('Abc1!');
      const mediumResult = PasswordChecker.checkPassword('Abc1!Abc1!Ab');
      const longResult = PasswordChecker.checkPassword('Abc1!Abc1!Abc1!Abc1!');

      expect(mediumResult.score).toBeGreaterThan(shortResult.score);
      expect(longResult.score).toBeGreaterThanOrEqual(mediumResult.score);
    });

    test('should penalize passwords with obvious patterns', () => {
      const patternPasswords = [
        'abcdefgh',
        '12345678',
        'aaaaaaaa'
      ];

      patternPasswords.forEach(password => {
        const result = PasswordChecker.checkPassword(password);
        expect(result.score).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('verdict mapping', () => {
    test('should map scores to correct verdicts', () => {
      // Test boundary conditions by creating passwords that should hit specific score ranges
      const weakPassword = '123'; // Very short, should be weak
      const mediumPassword = 'Passw0rd123'; // Decent but not great
      
      const weakResult = PasswordChecker.checkPassword(weakPassword);
      const mediumResult = PasswordChecker.checkPassword(mediumPassword);
      
      expect(weakResult.verdict).toBe('weak');
      expect(['weak', 'medium'].includes(mediumResult.verdict)).toBe(true);
    });
  });

  describe('crack time estimation', () => {
    test('should provide crack time estimates for all attack scenarios', () => {
      const result = PasswordChecker.checkPassword('StrongP@ssw0rd123!');
      
      expect(result.crackTime).toBeDefined();
      expect(result.crackTime.online).toBeDefined();
      expect(result.crackTime.offline).toBeDefined();
      expect(result.crackTime.offlineFast).toBeDefined();
      
      // Check that all estimates have required properties
      const scenarios = ['online', 'offline', 'offlineFast'] as const;
      scenarios.forEach(scenario => {
        const estimate = result.crackTime[scenario];
        expect(estimate.seconds).toBeGreaterThan(0);
        expect(typeof estimate.humanReadable).toBe('string');
        expect(estimate.attackScenario).toBeDefined();
      });
    });

    test('should show increasing crack times for stronger passwords', () => {
      const weakResult = PasswordChecker.checkPassword('abc123');
      const strongResult = PasswordChecker.checkPassword('Str0ngP@ssw0rd!WithL0ts0fCh@rs');
      
      // Strong password should take longer to crack than weak password
      expect(strongResult.crackTime.online.seconds).toBeGreaterThan(weakResult.crackTime.online.seconds);
      expect(strongResult.crackTime.offline.seconds).toBeGreaterThan(weakResult.crackTime.offline.seconds);
      expect(strongResult.crackTime.offlineFast.seconds).toBeGreaterThan(weakResult.crackTime.offlineFast.seconds);
    });

    test('should format time appropriately', () => {
      const result = PasswordChecker.checkPassword('TestPassword123!');
      
      // Should have readable time formats (including large numbers like "billion years")
      expect(result.crackTime.online.humanReadable).toMatch(/\d+\s+(second|minute|hour|day|month|year|thousand year|million year|billion year)/);
      expect(result.crackTime.offline.humanReadable).toMatch(/\d+\s+(second|minute|hour|day|month|year|thousand year|million year|billion year)|instantly/);
      expect(result.crackTime.offlineFast.humanReadable).toMatch(/\d+\s+(second|minute|hour|day|month|year|thousand year|million year|billion year)|instantly/);
    });

    test('should penalize patterns in crack time calculation', () => {
      const patternPassword = PasswordChecker.checkPassword('aaaaaa');
      const randomPassword = PasswordChecker.checkPassword('Xz!7jK');
      
      // Pattern password should be cracked faster
      expect(patternPassword.crackTime.online.seconds).toBeLessThan(randomPassword.crackTime.online.seconds);
    });

    test('should show attack scenario differences', () => {
      const result = PasswordChecker.checkPassword('ModeratePassword123');
      
      // Online attacks should take much longer than offline attacks
      expect(result.crackTime.online.seconds).toBeGreaterThan(result.crackTime.offline.seconds);
      expect(result.crackTime.offline.seconds).toBeGreaterThan(result.crackTime.offlineFast.seconds);
    });

    test('should detect leet speak and reduce crack time accordingly', () => {
      const leetPassword = PasswordChecker.checkPassword('p@ssw0rd123');
      const strongPassword = PasswordChecker.checkPassword('Xj9#mK$vQ!2w');
      
      // Leet speak should be easier to crack than truly random password
      expect(leetPassword.crackTime.offline.seconds).toBeLessThan(strongPassword.crackTime.offline.seconds);
    });

    test('should apply enhanced pattern detection', () => {
      // Test that enhanced pattern detection works
      const keyboardPassword = PasswordChecker.checkPassword('qwerty123!');
      const randomPassword = PasswordChecker.checkPassword('Xr9#Km$vQ!');
      
      // Both passwords are similar length, keyboard should be detected as weaker
      expect(keyboardPassword.score).toBeLessThanOrEqual(randomPassword.score);
    });

    test('should detect dictionary-based passwords', () => {
      const dictionaryPassword = PasswordChecker.checkPassword('password123!');
      const randomPassword = PasswordChecker.checkPassword('Xr9#Km$vQ!2w');
      
      // Dictionary-based passwords should be much easier to crack
      expect(dictionaryPassword.crackTime.offline.seconds).toBeLessThan(randomPassword.crackTime.offline.seconds);
    });

    test('should properly handle leet speak variations', () => {
      const leetPassword = PasswordChecker.checkPassword('p@ssw0rd123');
      const basePassword = PasswordChecker.checkPassword('password123');
      
      // Leet speak should be slightly harder than base but still relatively weak
      expect(leetPassword.crackTime.offline.seconds).toBeGreaterThan(basePassword.crackTime.offline.seconds);
      expect(leetPassword.score).toBeLessThanOrEqual(3); // Still relatively weak overall
      expect(leetPassword.verdict).toMatch(/weak|medium/); // Should not be strong
    });

    test('should give realistic times for very strong passwords', () => {
      const veryStrongPassword = PasswordChecker.checkPassword('Tr0ub4dor&3!K$mG9#vQ2w@Lp');
      
      // Very strong passwords should take astronomical time to crack
      expect(veryStrongPassword.crackTime.offlineFast.seconds).toBeGreaterThan(365 * 24 * 3600 * 1000); // > 1000 years
      expect(veryStrongPassword.crackTime.online.humanReadable).toMatch(/year/);
    });

    test('should demonstrate comprehensive pattern analysis', () => {
      // Test different password types
      const commonPassword = PasswordChecker.checkPassword('password');
      const strongPassword = PasswordChecker.checkPassword('Tr0ub4dor&3!K$mG9#vQ2w@Lp');
      
      // Common password should be instantly crackable
      expect(commonPassword.crackTime.online.humanReadable).toBe('instantly');
      expect(commonPassword.score).toBe(0);
      
      // Strong password should take very long to crack
      expect(strongPassword.crackTime.offlineFast.seconds).toBeGreaterThan(365 * 24 * 3600); // > 1 year
      expect(strongPassword.score).toBeGreaterThanOrEqual(4);
      
      // Verify that crack time estimates exist and are properly formatted
      expect(strongPassword.crackTime.online.humanReadable).toMatch(/\d+\s+(second|minute|hour|day|month|year|thousand year|million year|billion year)/);
      expect(strongPassword.crackTime.offline.attackScenario).toBe('offline');
      expect(strongPassword.crackTime.offlineFast.attackScenario).toBe('offline_fast');
    });
  });
});

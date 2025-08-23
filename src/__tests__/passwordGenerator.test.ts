import { PasswordGenerator } from '../passwordGenerator';

describe('PasswordGenerator', () => {

  describe('generatePassword', () => {
    
    test('should generate password with default options', () => {
      const password = PasswordGenerator.generatePassword();
      expect(password).toHaveLength(12);
      expect(password).toMatch(/[a-z]/); // lowercase
      expect(password).toMatch(/[A-Z]/); // uppercase
      expect(password).toMatch(/[0-9]/); // numbers
      expect(password).toMatch(/[^A-Za-z0-9]/); // symbols
    });

    test('should respect length option', () => {
      const lengths = [8, 16, 20, 32];
      
      lengths.forEach(length => {
        const password = PasswordGenerator.generatePassword({ length });
        expect(password).toHaveLength(length);
      });
    });

    test('should respect character type options', () => {
      // Only lowercase
      const lowercaseOnly = PasswordGenerator.generatePassword({
        length: 8,
        lowercase: true,
        uppercase: false,
        numbers: false,
        symbols: false
      });
      expect(lowercaseOnly).toMatch(/^[a-z]+$/);

      // Only uppercase
      const uppercaseOnly = PasswordGenerator.generatePassword({
        length: 8,
        lowercase: false,
        uppercase: true,
        numbers: false,
        symbols: false
      });
      expect(uppercaseOnly).toMatch(/^[A-Z]+$/);

      // Only numbers
      const numbersOnly = PasswordGenerator.generatePassword({
        length: 8,
        lowercase: false,
        uppercase: false,
        numbers: true,
        symbols: false
      });
      expect(numbersOnly).toMatch(/^[0-9]+$/);

      // Mixed types
      const mixed = PasswordGenerator.generatePassword({
        length: 12,
        lowercase: true,
        uppercase: true,
        numbers: false,
        symbols: false
      });
      expect(mixed).toMatch(/[a-z]/);
      expect(mixed).toMatch(/[A-Z]/);
      expect(mixed).not.toMatch(/[0-9]/);
      expect(mixed).not.toMatch(/[^A-Za-z0-9]/);
    });

    test('should exclude similar characters when requested', () => {
      const password = PasswordGenerator.generatePassword({
        length: 20,
        excludeSimilar: true
      });
      
      // Should not contain similar characters: 0, O, 1, l, I, |
      expect(password).not.toMatch(/[0O1lI|]/);
    });

    test('should throw error for invalid options', () => {
      expect(() => {
        PasswordGenerator.generatePassword({ length: 3 });
      }).toThrow('Password length must be at least 4 characters');

      expect(() => {
        PasswordGenerator.generatePassword({
          lowercase: false,
          uppercase: false,
          numbers: false,
          symbols: false
        });
      }).toThrow('At least one character type must be enabled');
    });

    test('should generate different passwords on multiple calls', () => {
      const passwords = new Set();
      
      // Generate 10 passwords and ensure they're all different
      for (let i = 0; i < 10; i++) {
        const password = PasswordGenerator.generatePassword({ length: 16 });
        passwords.add(password);
      }
      
      expect(passwords.size).toBe(10); // All should be unique
    });

    test('should include at least one character from each enabled type', () => {
      const password = PasswordGenerator.generatePassword({
        length: 8,
        lowercase: true,
        uppercase: true,
        numbers: true,
        symbols: true
      });

      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[^A-Za-z0-9]/);
    });
  });

  describe('generateStrongPassword', () => {
    
    test('should generate a strong password', () => {
      const password = PasswordGenerator.generateStrongPassword();
      expect(password).toHaveLength(12);
      expect(typeof password).toBe('string');
    });

    test('should generate passwords with higher entropy on average', () => {
      // Generate multiple passwords and check that the strong generator
      // typically produces passwords with good character variety
      const strongPassword = PasswordGenerator.generateStrongPassword({ length: 16 });
      
      let charTypes = 0;
      if (/[a-z]/.test(strongPassword)) charTypes++;
      if (/[A-Z]/.test(strongPassword)) charTypes++;
      if (/[0-9]/.test(strongPassword)) charTypes++;
      if (/[^A-Za-z0-9]/.test(strongPassword)) charTypes++;
      
      expect(charTypes).toBeGreaterThanOrEqual(3);
    });
  });

  describe('generateMemorablePassword', () => {
    
    test('should generate memorable password with default options', () => {
      const password = PasswordGenerator.generateMemorablePassword();
      
      // Should have word pattern like "Word-Word-Word-Word-##!"
      expect(password).toMatch(/^[A-Z][a-z]+-[A-Z][a-z]+-[A-Z][a-z]+-[A-Z][a-z]+-\d{1,2}[!@#$%&*]$/);
    });

    test('should respect word count option', () => {
      const twoWordPassword = PasswordGenerator.generateMemorablePassword(2);
      const parts = twoWordPassword.split('-');
      expect(parts.length).toBeGreaterThanOrEqual(2);
    });

    test('should optionally exclude numbers and symbols', () => {
      const passwordNoNumbers = PasswordGenerator.generateMemorablePassword(3, false, true);
      const passwordNoSymbols = PasswordGenerator.generateMemorablePassword(3, true, false);
      const passwordNeitherb = PasswordGenerator.generateMemorablePassword(3, false, false);
      
      expect(passwordNoNumbers).not.toMatch(/\d/);
      expect(passwordNoSymbols).not.toMatch(/[!@#$%&*]/);
      expect(passwordNeitherb).not.toMatch(/[\d!@#$%&*]/);
    });

    test('should generate different memorable passwords', () => {
      const passwords = new Set();
      
      for (let i = 0; i < 5; i++) {
        const password = PasswordGenerator.generateMemorablePassword();
        passwords.add(password);
      }
      
      expect(passwords.size).toBe(5);
    });
  });
});

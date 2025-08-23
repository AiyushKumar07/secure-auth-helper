import {
  checkPasswordStrength,
  generatePassword,
  generateStrongPassword,
  generateMemorablePassword,
  PasswordChecker,
  PasswordGenerator
} from '../index';

describe('Package exports', () => {
  
  test('should export convenience functions', () => {
    expect(typeof checkPasswordStrength).toBe('function');
    expect(typeof generatePassword).toBe('function');
    expect(typeof generateStrongPassword).toBe('function');
    expect(typeof generateMemorablePassword).toBe('function');
  });

  test('should export classes', () => {
    expect(PasswordChecker).toBeDefined();
    expect(PasswordGenerator).toBeDefined();
  });

  test('convenience functions should work', () => {
    // Test password strength check
    const strengthResult = checkPasswordStrength('TestPassword123!');
    expect(strengthResult).toHaveProperty('score');
    expect(strengthResult).toHaveProperty('verdict');
    expect(strengthResult).toHaveProperty('suggestions');
    expect(strengthResult).toHaveProperty('crackTime');

    // Test password generation
    const generated = generatePassword({ length: 10 });
    expect(generated).toHaveLength(10);

    const strong = generateStrongPassword({ length: 8 });
    expect(strong).toHaveLength(8);

    const memorable = generateMemorablePassword(3);
    expect(typeof memorable).toBe('string');
    expect(memorable.length).toBeGreaterThan(0);
  });

  test('convenience functions should match class methods', () => {
    const password = 'TestPassword123!';
    
    const convenienceResult = checkPasswordStrength(password);
    const classResult = PasswordChecker.checkPassword(password);
    
    expect(convenienceResult).toEqual(classResult);
  });
});

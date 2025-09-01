import {
  checkPasswordStrength,
  generatePassword,
  generateStrongPassword,
  generateMemorablePassword,
  validateEmail,
  isValidEmailSyntax,
  validateEmails,
  PasswordChecker,
  PasswordGenerator,
  EmailChecker
} from '../index';

describe('Package exports', () => {
  
  test('should export convenience functions', () => {
    expect(typeof checkPasswordStrength).toBe('function');
    expect(typeof generatePassword).toBe('function');
    expect(typeof generateStrongPassword).toBe('function');
    expect(typeof generateMemorablePassword).toBe('function');
    expect(typeof validateEmail).toBe('function');
    expect(typeof isValidEmailSyntax).toBe('function');
    expect(typeof validateEmails).toBe('function');
  });

  test('should export classes', () => {
    expect(PasswordChecker).toBeDefined();
    expect(PasswordGenerator).toBeDefined();
    expect(EmailChecker).toBeDefined();
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

    // Test email validation
    const syntaxValid = isValidEmailSyntax('test@example.com');
    expect(syntaxValid).toBe(true);

    const syntaxInvalid = isValidEmailSyntax('invalid-email');
    expect(syntaxInvalid).toBe(false);
  });

  test('convenience functions should match class methods', () => {
    const password = 'TestPassword123!';
    
    const convenienceResult = checkPasswordStrength(password);
    const classResult = PasswordChecker.checkPassword(password);
    
    expect(convenienceResult).toEqual(classResult);

    // Test email convenience functions match class methods
    const email = 'test@example.com';
    
    const emailSyntaxConvenience = isValidEmailSyntax(email);
    const emailSyntaxClass = EmailChecker.isValidEmailSyntax(email);
    
    expect(emailSyntaxConvenience).toEqual(emailSyntaxClass);
  });

  test('email validation convenience functions should work asynchronously', async () => {
    const email = 'test@gmail.com';
    
    const validationResult = await validateEmail(email);
    expect(validationResult).toHaveProperty('email');
    expect(validationResult).toHaveProperty('validations');
    expect(validationResult).toHaveProperty('score');
    expect(validationResult).toHaveProperty('status');

    const multipleResults = await validateEmails(['test@gmail.com', 'invalid-email']);
    expect(multipleResults).toHaveLength(2);
    expect(multipleResults[0]).toHaveProperty('validations');
    expect(multipleResults[1]).toHaveProperty('validations');
  }, 10000);
});

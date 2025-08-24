import { PasswordChecker } from '../passwordChecker';

describe('Pwned Password Functionality', () => {
  // Note: These tests make real API calls to HaveIBeenPwned
  // In a production environment, you might want to mock these calls

  it('should identify a known pwned password', async () => {
    const result = await PasswordChecker.checkIfPasswordPwned('password123');
    
    expect(result.isPwned).toBe(true);
    expect(result.breachCount).toBeGreaterThan(0);
    expect(result.errorMessage).toBeUndefined();
  }, 10000); // 10 second timeout for network call

  it('should not identify a unique password as pwned', async () => {
    // Using a very unique password that's unlikely to be in breaches
    const uniquePassword = 'MyVeryUnique@Password2024!WithLongSuffix' + Math.random();
    const result = await PasswordChecker.checkIfPasswordPwned(uniquePassword);
    
    expect(result.isPwned).toBe(false);
    expect(result.breachCount).toBe(0);
    expect(result.errorMessage).toBeUndefined();
  }, 10000);

  it('should include pwned check in full password analysis', async () => {
    const result = await PasswordChecker.checkPasswordWithPwnedCheck('password123');
    
    expect(result).toHaveProperty('pwnedCheck');
    expect(result.pwnedCheck.isPwned).toBe(true);
    expect(result.pwnedCheck.breachCount).toBeGreaterThan(0);
    
    // Pwned passwords should have low scores
    expect(result.score).toBeLessThanOrEqual(1);
    
    // Should include pwned warning in suggestions
    const pwnedSuggestion = result.suggestions.find(s => s.includes('compromised in data breaches'));
    expect(pwnedSuggestion).toBeDefined();
  }, 10000);

  it('should maintain high score for unique passwords', async () => {
    const uniquePassword = 'MyVeryUnique@Password2024!WithLongSuffix' + Math.random();
    const result = await PasswordChecker.checkPasswordWithPwnedCheck(uniquePassword);
    
    expect(result.pwnedCheck.isPwned).toBe(false);
    expect(result.score).toBeGreaterThan(3); // Should maintain high score if not pwned
  }, 10000);

  it('should handle network errors gracefully', async () => {
    // Test with invalid hostname to simulate network error
    const originalMethod = PasswordChecker['makeHibpApiRequest'];
    
    // Mock the API request to return null (simulate network error)
    PasswordChecker['makeHibpApiRequest'] = jest.fn().mockResolvedValue(null);
    
    const result = await PasswordChecker.checkIfPasswordPwned('testpassword');
    
    expect(result.isPwned).toBe(false);
    expect(result.breachCount).toBe(null);
    expect(result.errorMessage).toBeDefined();
    
    // Restore original method
    PasswordChecker['makeHibpApiRequest'] = originalMethod;
  });

  it('should maintain backward compatibility', () => {
    // Original method should work without pwned check
    const result = PasswordChecker.checkPassword('MySecure@Pass2024!');
    
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('verdict');
    expect(result).toHaveProperty('suggestions');
    expect(result).toHaveProperty('crackTime');
    expect(result).not.toHaveProperty('pwnedCheck');
    
    // Should be synchronous (not a promise)
    expect(result).not.toBeInstanceOf(Promise);
  });

  it('should validate SHA-1 hash generation', async () => {
    // We can't directly test the hash without exposing internal methods,
    // but we can test that the same password gives consistent results
    const password = 'test123';
    
    const result1 = await PasswordChecker.checkIfPasswordPwned(password);
    const result2 = await PasswordChecker.checkIfPasswordPwned(password);
    
    expect(result1.isPwned).toBe(result2.isPwned);
    expect(result1.breachCount).toBe(result2.breachCount);
  }, 10000);
});

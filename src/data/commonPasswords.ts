// Most common weak passwords to check against
export const COMMON_PASSWORDS = new Set([
  // Numeric sequences
  "123456",
  "1234567",
  "12345678",
  "123456789",
  "1234567890",
  "000000",
  "111111",
  "222222",
  "333333",
  "444444",
  "555555",
  "666666",
  "777777",
  "888888",
  "999999",
  
  // Common passwords
  "password",
  "password1",
  "password123",
  "admin",
  "administrator",
  "root",
  "user",
  "guest",
  "test",
  "demo",
  
  // Keyboard patterns
  "qwerty",
  "qwertyuiop",
  "asdfgh",
  "asdfghjkl",
  "zxcvbn",
  "zxcvbnm",
  "azerty",
  "12345qwerty",
  "qwerty123",
  
  // Common words
  "welcome",
  "login",
  "master",
  "secret",
  "super",
  "access",
  "computer",
  "internet",
  "service",
  "system",
  
  // Date patterns
  "19700101",
  "19800101",
  "19900101",
  "20000101",
  "20100101",
  "20200101",
  "01011970",
  "01011980",
  "01011990",
  "01012000",
  
  // Simple variations
  "abc123",
  "123abc",
  "a1b2c3",
  "1q2w3e",
  "1q2w3e4r",
  "1qaz2wsx",
  "qwe123",
  "asd123",
  "zxc123",
  
  // Common names + numbers
  "john123",
  "admin123",
  "root123",
  "user123",
  "pass123",
  "temp123",
  
  // Single characters repeated
  "aaaaaaa",
  "aaaaaaaaaa",
  
  // Other common weak passwords
  "letmein",
  "welcome1",
  "iloveyou",
  "princess",
  "rockyou",
  "12341234",
  "passw0rd",
  "p@ssw0rd",
  "p@ssword",
  "password!",
  "Password1",
  "Password123"
]);

// Case-insensitive check
export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

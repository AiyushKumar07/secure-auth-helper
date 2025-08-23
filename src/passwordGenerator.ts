import { GeneratePasswordOptions } from './types';
import * as crypto from 'crypto';

export class PasswordGenerator {
  
  // Character sets
  private static readonly LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  private static readonly UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly NUMBERS = '0123456789';
  private static readonly SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Similar characters that might be confusing
  private static readonly SIMILAR_CHARS = '0O1lI|';

  /**
   * Generates a secure random password with the specified options
   */
  public static generatePassword(options: GeneratePasswordOptions = {}): string {
    const {
      length = 12,
      numbers = true,
      symbols = true,
      uppercase = true,
      lowercase = true,
      excludeSimilar = false
    } = options;

    // Validate options
    if (length < 4) {
      throw new Error('Password length must be at least 4 characters');
    }

    if (!numbers && !symbols && !uppercase && !lowercase) {
      throw new Error('At least one character type must be enabled');
    }

    // Build character set
    let charset = '';
    const requiredChars: string[] = [];

    if (lowercase) {
      const lowerSet = excludeSimilar ? 
        this.LOWERCASE.replace(/[0O1lI]/g, '') : 
        this.LOWERCASE;
      charset += lowerSet;
      requiredChars.push(this.getRandomChar(lowerSet));
    }

    if (uppercase) {
      const upperSet = excludeSimilar ? 
        this.UPPERCASE.replace(/[0O1lI]/g, '') : 
        this.UPPERCASE;
      charset += upperSet;
      requiredChars.push(this.getRandomChar(upperSet));
    }

    if (numbers) {
      const numberSet = excludeSimilar ? 
        this.NUMBERS.replace(/[0O1l]/g, '') : 
        this.NUMBERS;
      charset += numberSet;
      requiredChars.push(this.getRandomChar(numberSet));
    }

    if (symbols) {
      const symbolSet = excludeSimilar ? 
        this.SYMBOLS.replace(/[|]/g, '') : 
        this.SYMBOLS;
      charset += symbolSet;
      requiredChars.push(this.getRandomChar(symbolSet));
    }

    // Remove similar characters if requested
    if (excludeSimilar) {
      for (const char of this.SIMILAR_CHARS) {
        charset = charset.replace(new RegExp(char, 'g'), '');
      }
    }

    // Generate password ensuring at least one character from each enabled type
    let password = '';
    
    // Add required characters first
    for (const char of requiredChars) {
      password += char;
    }

    // Fill remaining length with random characters
    for (let i = requiredChars.length; i < length; i++) {
      password += this.getRandomChar(charset);
    }

    // Shuffle the password to avoid predictable patterns
    return this.shuffleString(password);
  }

  /**
   * Gets a cryptographically secure random character from the given charset
   */
  private static getRandomChar(charset: string): string {
    const randomIndex = this.getSecureRandomInt(charset.length);
    return charset[randomIndex];
  }

  /**
   * Generates a cryptographically secure random integer between 0 and max (exclusive)
   */
  private static getSecureRandomInt(max: number): number {
    // Use crypto.randomBytes for secure random number generation
    const byteArray = crypto.randomBytes(4);
    const randomValue = byteArray.readUInt32BE(0);
    return randomValue % max;
  }

  /**
   * Shuffles a string using the Fisher-Yates algorithm with secure random
   */
  private static shuffleString(str: string): string {
    const array = str.split('');
    
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.getSecureRandomInt(i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    
    return array.join('');
  }

  /**
   * Generates multiple passwords and returns the best one based on entropy
   */
  public static generateStrongPassword(options: GeneratePasswordOptions = {}): string {
    const passwords = [];
    const iterations = 5; // Generate 5 candidates
    
    for (let i = 0; i < iterations; i++) {
      passwords.push(this.generatePassword(options));
    }

    // Return the password with highest calculated entropy
    return passwords.reduce((best, current) => {
      const bestEntropy = this.calculateSimpleEntropy(best);
      const currentEntropy = this.calculateSimpleEntropy(current);
      return currentEntropy > bestEntropy ? current : best;
    });
  }

  /**
   * Simple entropy calculation for password comparison
   */
  private static calculateSimpleEntropy(password: string): number {
    let charsetSize = 0;
    
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32;
    
    return password.length * Math.log2(charsetSize);
  }

  /**
   * Generates a memorable password using the diceware-like approach
   * Creates passwords like "Correct-Horse-Battery-Staple-42!"
   */
  public static generateMemorablePassword(wordCount: number = 4, addNumbers: boolean = true, addSymbols: boolean = true): string {
    // Simple word list for memorable passwords
    const words = [
      'apple', 'brave', 'chair', 'dance', 'eagle', 'flame', 'grace', 'heart',
      'image', 'jewel', 'knight', 'light', 'magic', 'noble', 'ocean', 'peace',
      'queen', 'river', 'stone', 'tiger', 'unity', 'voice', 'world', 'youth',
      'zebra', 'angel', 'beach', 'cloud', 'dream', 'earth', 'fresh', 'green',
      'happy', 'ideal', 'jolly', 'karma', 'laugh', 'music', 'nature', 'outer',
      'power', 'quiet', 'rapid', 'smile', 'trust', 'urban', 'vital', 'wonder'
    ];

    const selectedWords = [];
    for (let i = 0; i < wordCount; i++) {
      const randomWord = words[this.getSecureRandomInt(words.length)];
      // Capitalize first letter
      selectedWords.push(randomWord.charAt(0).toUpperCase() + randomWord.slice(1));
    } 

    let password = selectedWords.join('-');

    if (addNumbers) {
      const randomNumber = this.getSecureRandomInt(100);
      password += '-' + randomNumber;
    }

    if (addSymbols) {
      const symbols = '!@#$%&*';
      password += symbols[this.getSecureRandomInt(symbols.length)];
    }

    return password;
  }
}

import { PasswordStrengthResult, PasswordVerdict, PasswordAnalysis, CrackTimeEstimate } from './types';
import { isCommonPassword } from './data/commonPasswords';
import { 
  calculateAdvancedPatternPenalty, 
  normalizeLeetSpeak, 
  containsKeyboardPattern,
  containsDatePattern,
  containsPhonePattern,
  EXTENDED_COMMON_PASSWORDS 
} from './data/advancedPatterns';

export class PasswordChecker {
  
  /**
   * Analyzes password strength and returns detailed results
   */
  public static checkPassword(password: string): PasswordStrengthResult {
    const analysis = this.analyzePassword(password);
    const score = this.calculateScore(analysis, password);
    const verdict = this.getVerdict(score);
    const suggestions = this.generateSuggestions(analysis);
    const crackTime = this.calculateCrackTime(analysis, password);

    return {
      score,
      verdict,
      suggestions,
      crackTime
    };
  }

  /**
   * Analyzes password components
   */
  private static analyzePassword(password: string): PasswordAnalysis {
    const length = password.length;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    const entropy = this.calculateEntropy(password);
    const isCommon = isCommonPassword(password);
    
    // Calculate variety score (0-4 based on character types)
    let varietyScore = 0;
    if (hasUppercase) varietyScore++;
    if (hasLowercase) varietyScore++;
    if (hasNumbers) varietyScore++;
    if (hasSymbols) varietyScore++;

    return {
      length,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSymbols,
      entropy,
      isCommonPassword: isCommon,
      varietyScore
    };
  }

  /**
   * Calculates password entropy (approximate)
   */
  private static calculateEntropy(password: string): number {
    let charsetSize = 0;
    
    if (/[a-z]/.test(password)) charsetSize += 26; // lowercase
    if (/[A-Z]/.test(password)) charsetSize += 26; // uppercase
    if (/[0-9]/.test(password)) charsetSize += 10; // numbers
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32; // symbols (approximate)
    
    // Entropy = log2(charsetSize^length)
    return password.length * Math.log2(charsetSize);
  }

  /**
   * Calculates overall password score (0-5)
   */
  private static calculateScore(analysis: PasswordAnalysis, password: string): number {
    let score = 0;

    // Common password check (immediate fail)
    if (analysis.isCommonPassword) {
      return 0;
    }

    // Length scoring
    if (analysis.length >= 8) score += 1;
    if (analysis.length >= 12) score += 1;
    if (analysis.length >= 16) score += 0.5;

    // Character variety scoring
    if (analysis.varietyScore >= 2) score += 0.5;
    if (analysis.varietyScore >= 3) score += 0.5;
    if (analysis.varietyScore >= 4) score += 1;

    // Entropy bonus
    if (analysis.entropy >= 40) score += 0.5;
    if (analysis.entropy >= 60) score += 0.5;
    if (analysis.entropy >= 80) score += 0.5;

    // Pattern detection penalties
    if (this.hasRepeatingPatterns(password)) {
      score -= 0.5;
    }
    
    if (this.hasSequentialPattern(password)) {
      score -= 0.5;
    }

    // Cap score between 0 and 5
    return Math.max(0, Math.min(5, Math.round(score * 2) / 2));
  }

  /**
   * Maps score to verdict
   */
  private static getVerdict(score: number): PasswordVerdict {
    if (score <= 1) return "weak";
    if (score <= 2.5) return "medium";
    if (score <= 4) return "strong";
    return "very strong";
  }

  /**
   * Generates improvement suggestions
   */
  private static generateSuggestions(analysis: PasswordAnalysis): string[] {
    const suggestions: string[] = [];

    if (analysis.isCommonPassword) {
      suggestions.push("Avoid common passwords - use a unique combination");
    }

    if (analysis.length < 8) {
      suggestions.push("Use at least 8 characters");
    } else if (analysis.length < 12) {
      suggestions.push("Consider using 12+ characters for better security");
    }

    if (!analysis.hasUppercase) {
      suggestions.push("Add uppercase letters (A-Z)");
    }

    if (!analysis.hasLowercase) {
      suggestions.push("Add lowercase letters (a-z)");
    }

    if (!analysis.hasNumbers) {
      suggestions.push("Add numbers (0-9)");
    }

    if (!analysis.hasSymbols) {
      suggestions.push("Add special characters (!@#$%^&*)");
    }

    if (analysis.varietyScore < 3) {
      suggestions.push("Mix different character types for complexity");
    }

    if (analysis.entropy < 40) {
      suggestions.push("Increase randomness - avoid predictable patterns");
    }

    // If no suggestions and score is good, add encouragement
    if (suggestions.length === 0 && analysis.entropy >= 60) {
      suggestions.push("Great password! Consider using a password manager for unique passwords across all accounts");
    }

    return suggestions;
  }

  /**
   * Detects repeating patterns (simple check)
   */
  private static hasRepeatingPatterns(password: string): boolean {
    // Check for simple repeating patterns like "aaa", "111", "abcabc"
    const repeatingPattern = /(.{1,3})\1{2,}/.test(password);
    const sameChar = /(.)\1{2,}/.test(password);
    return repeatingPattern || sameChar;
  }

  /**
   * Detects sequential patterns
   */
  private static hasSequentialPattern(password: string): boolean {
    // Check for sequential patterns like "123", "abc", "qwe"
    const sequences = [
      "0123456789",
      "9876543210",
      "abcdefghijklmnopqrstuvwxyz",
      "zyxwvutsrqponmlkjihgfedcba",
      "qwertyuiop",
      "poiuytrewq",
      "asdfghjkl",
      "lkjhgfdsa"
    ];

    const lowerPassword = password.toLowerCase();
    
    for (const sequence of sequences) {
      for (let i = 0; i <= sequence.length - 3; i++) {
        const subseq = sequence.substring(i, i + 3);
        if (lowerPassword.includes(subseq)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Calculates crack time estimates for different attack scenarios with enhanced realism
   */
  private static calculateCrackTime(analysis: PasswordAnalysis, password: string): {
    online: CrackTimeEstimate;
    offline: CrackTimeEstimate;
    offlineFast: CrackTimeEstimate;
  } {
    // More realistic attack rates based on current technology (2024)
    const ONLINE_ATTACK_RATE = 1000;          // Online attacks (considering multiple IPs, botnets)
    const OFFLINE_ATTACK_RATE = 1e11;         // Offline with modern GPUs (RTX 4090 class)
    const OFFLINE_FAST_ATTACK_RATE = 1e13;    // High-end cloud/ASIC attacks

    // Calculate keyspace with advanced analysis
    const keyspace = this.calculateKeyspace(analysis, password);
    
    // Use smarter attack modeling
    const smartAttackKeyspace = this.calculateSmartAttackKeyspace(password, keyspace);
    
    // Average time to crack (using smart attack keyspace for more realistic estimates)
    const avgGuesses = Math.max(1, smartAttackKeyspace / 2);

    const onlineSeconds = avgGuesses / ONLINE_ATTACK_RATE;
    const offlineSeconds = avgGuesses / OFFLINE_ATTACK_RATE;
    const offlineFastSeconds = avgGuesses / OFFLINE_FAST_ATTACK_RATE;

    return {
      online: {
        seconds: onlineSeconds,
        humanReadable: this.formatCrackTime(onlineSeconds),
        attackScenario: "online"
      },
      offline: {
        seconds: offlineSeconds,
        humanReadable: this.formatCrackTime(offlineSeconds),
        attackScenario: "offline"
      },
      offlineFast: {
        seconds: offlineFastSeconds,
        humanReadable: this.formatCrackTime(offlineFastSeconds),
        attackScenario: "offline_fast"
      }
    };
  }

  /**
   * Calculates more realistic attack keyspace considering smart attack strategies
   */
  private static calculateSmartAttackKeyspace(password: string, baseKeyspace: number): number {
    // Smart attackers don't do pure brute force - they use optimized strategies
    
    // Dictionary attack first (if contains dictionary elements)
    const baseWords = this.extractPotentialBaseWords(password);
    if (baseWords.length > 0) {
      // Hybrid attack: try dictionary words + common variations first
      const hybridKeyspace = EXTENDED_COMMON_PASSWORDS.size * Math.pow(100, password.length - Math.max(...baseWords.map(w => w.length)));
      return Math.min(baseKeyspace, hybridKeyspace);
    }
    
    // Mask attack for patterns
    if (containsDatePattern(password) || containsPhonePattern(password)) {
      // Attackers would use targeted mask attacks for date/phone patterns
      return Math.min(baseKeyspace, Math.pow(10, password.length) * 1000);
    }
    
    // Keyboard pattern optimization
    if (containsKeyboardPattern(password)) {
      // Much smaller keyspace for keyboard walks
      return Math.min(baseKeyspace, Math.pow(1000, password.length / 3));
    }
    
    // For truly random passwords, use the full keyspace
    return baseKeyspace;
  }

  /**
   * Calculates the theoretical keyspace for the password using advanced analysis
   */
  private static calculateKeyspace(analysis: PasswordAnalysis, password: string): number {
    // Enhanced common password detection
    if (analysis.isCommonPassword || EXTENDED_COMMON_PASSWORDS.has(password.toLowerCase())) {
      return 1;
    }

    // Check for leet speak variations
    const normalizedPassword = normalizeLeetSpeak(password);
    if (EXTENDED_COMMON_PASSWORDS.has(normalizedPassword)) {
      return Math.min(1000, password.length * 10); // Small keyspace for leet variations
    }
    
    // Calculate base character set size
    let charsetSize = 0;
    if (analysis.hasLowercase) charsetSize += 26;
    if (analysis.hasUppercase) charsetSize += 26;
    if (analysis.hasNumbers) charsetSize += 10;
    if (analysis.hasSymbols) charsetSize += 32;

    // Advanced pattern penalties
    const advancedPenalty = calculateAdvancedPatternPenalty(password);
    
    // Additional specific pattern penalties
    let patternPenalty = advancedPenalty;
    
    // Repeating patterns
    if (this.hasRepeatingPatterns(password)) {
      patternPenalty *= 0.05;
    }
    
    // Sequential patterns
    if (this.hasSequentialPattern(password)) {
      patternPenalty *= 0.05;
    }

    // Hybrid attack simulation (common patterns + variations)
    const hybridPenalty = this.calculateHybridAttackPenalty(password);
    patternPenalty *= hybridPenalty;

    // Statistical analysis penalty
    const statisticalPenalty = this.calculateStatisticalPenalty(password);
    patternPenalty *= statisticalPenalty;

    const keyspace = Math.pow(charsetSize, password.length) * patternPenalty;
    return Math.max(1, keyspace);
  }

  /**
   * Calculates penalty for hybrid attacks (dictionary + numbers/symbols)
   */
  private static calculateHybridAttackPenalty(password: string): number {
    const baseWords = this.extractPotentialBaseWords(password);
    
    if (baseWords.length > 0) {
      // If we can identify base dictionary words with appended/prepended numbers/symbols
      // the keyspace is much smaller (base word count * variations)
      const variations = password.length - Math.max(...baseWords.map(w => w.length));
      return Math.min(0.1, Math.pow(0.5, variations));
    }
    
    return 1.0;
  }

  /**
   * Basic statistical analysis of character transitions
   */
  private static calculateStatisticalPenalty(password: string): number {
    if (password.length < 3) return 1.0;
    
    let penalty = 1.0;
    
    // Check for alternating patterns
    let alternatingCount = 0;
    for (let i = 1; i < password.length - 1; i++) {
      const char1 = password[i - 1];
      const char2 = password[i];
      const char3 = password[i + 1];
      
      // Check for alternating character types
      if (this.getCharType(char1) === this.getCharType(char3) && 
          this.getCharType(char1) !== this.getCharType(char2)) {
        alternatingCount++;
      }
    }
    
    if (alternatingCount > password.length * 0.4) {
      penalty *= 0.3; // Strong alternating pattern
    }
    
    // Check for repeated substrings
    for (let len = 2; len <= Math.floor(password.length / 2); len++) {
      for (let i = 0; i <= password.length - len * 2; i++) {
        const substring = password.substring(i, i + len);
        const nextSubstring = password.substring(i + len, i + len * 2);
        if (substring === nextSubstring) {
          penalty *= 0.2;
          break;
        }
      }
    }
    
    return Math.max(0.001, penalty);
  }

  /**
   * Extracts potential base words from password
   */
  private static extractPotentialBaseWords(password: string): string[] {
    const normalized = normalizeLeetSpeak(password.toLowerCase());
    const words: string[] = [];
    
    // Check for known dictionary words within the password
    for (const word of EXTENDED_COMMON_PASSWORDS) {
      if (word.length >= 4 && normalized.includes(word)) {
        words.push(word);
      }
    }
    
    return words;
  }

  /**
   * Gets character type for statistical analysis
   */
  private static getCharType(char: string): 'lower' | 'upper' | 'number' | 'symbol' {
    if (/[a-z]/.test(char)) return 'lower';
    if (/[A-Z]/.test(char)) return 'upper';
    if (/[0-9]/.test(char)) return 'number';
    return 'symbol';
  }

  /**
   * Simple dictionary word detection (heuristic)
   */
  private static containsDictionaryWords(password: string): boolean {
    // Simple check for common dictionary words within the password
    const commonWords = [
      'password', 'admin', 'user', 'login', 'welcome', 'computer',
      'internet', 'system', 'service', 'master', 'secret', 'access',
      'love', 'hate', 'good', 'bad', 'best', 'test', 'demo', 'temp'
    ];

    const lowerPassword = password.toLowerCase();
    return commonWords.some(word => lowerPassword.includes(word));
  }

  /**
   * Formats crack time in seconds to human-readable string
   */
  private static formatCrackTime(seconds: number): string {
    if (seconds < 1) {
      return "instantly";
    }

    if (seconds < 60) {
      return `${Math.round(seconds)} second${seconds === 1 ? '' : 's'}`;
    }

    const minutes = seconds / 60;
    if (minutes < 60) {
      return `${Math.round(minutes)} minute${Math.round(minutes) === 1 ? '' : 's'}`;
    }

    const hours = minutes / 60;
    if (hours < 24) {
      return `${Math.round(hours)} hour${Math.round(hours) === 1 ? '' : 's'}`;
    }

    const days = hours / 24;
    if (days < 30) {
      return `${Math.round(days)} day${Math.round(days) === 1 ? '' : 's'}`;
    }

    const months = days / 30;
    if (months < 12) {
      return `${Math.round(months)} month${Math.round(months) === 1 ? '' : 's'}`;
    }

    const years = months / 12;
    if (years < 1000) {
      return `${Math.round(years)} year${Math.round(years) === 1 ? '' : 's'}`;
    }

    if (years < 1000000) {
      const thousands = Math.round(years / 1000);
      return `${thousands} thousand year${thousands === 1 ? '' : 's'}`;
    }

    if (years < 1000000000) {
      const millions = Math.round(years / 1000000);
      return `${millions} million year${millions === 1 ? '' : 's'}`;
    }

    const billions = Math.round(years / 1000000000);
    return `${billions} billion year${billions === 1 ? '' : 's'}`;
  }
}

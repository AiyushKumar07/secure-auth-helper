// Advanced pattern detection for more sophisticated crack time estimation

// L33t speak substitutions (character -> substitutes)
export const LEET_SUBSTITUTIONS: Record<string, string[]> = {
  'a': ['@', '4'],
  'e': ['3'],
  'i': ['1', '!'],
  'o': ['0'],
  's': ['5', '$'],
  't': ['7', '+'],
  'l': ['1', '|'],
  'g': ['9'],
  'b': ['6'],
  'z': ['2']
};

// Extended dictionary of common passwords and patterns
export const EXTENDED_COMMON_PASSWORDS = new Set([
  // Basic patterns
  'password', 'password1', 'password123', 'pass', 'admin', 'administrator',
  'root', 'user', 'guest', 'test', 'demo', 'temp', 'qwerty', 'asdf',
  'zxcv', 'admin123', 'root123', 'user123', 'pass123', 'temp123',
  
  // Years and dates
  '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015',
  '1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997', '1998', '1999',
  '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009',
  '2010', '2011', '2012', '2013', '2014',
  
  // Common words
  'welcome', 'login', 'master', 'secret', 'super', 'access', 'computer',
  'internet', 'system', 'service', 'letmein', 'welcome1', 'iloveyou',
  'princess', 'rockyou', 'sunshine', 'shadow', 'dragon', 'monkey',
  'football', 'baseball', 'basketball', 'soccer', 'tennis', 'hockey',
  
  // Names
  'john', 'mary', 'david', 'sarah', 'michael', 'jennifer', 'robert',
  'linda', 'william', 'elizabeth', 'james', 'barbara', 'charles',
  'susan', 'joseph', 'jessica', 'thomas', 'karen', 'christopher',
  'nancy', 'daniel', 'betty', 'matthew', 'helen', 'anthony', 'sandra',
  
  // L33t variations
  'p@ssw0rd', 'p@ssword', 'passw0rd', 'password!', 'Password1',
  'admin!', 'adm1n', '4dm1n', 'r00t', 'us3r', 't3st', 'd3mo',
  '1234567890', '0987654321', 'qwerty123', 'asdf123', 'zxcv123',
  
  // Company/Tech related
  'microsoft', 'google', 'apple', 'facebook', 'twitter', 'amazon',
  'windows', 'linux', 'android', 'iphone', 'samsung', 'oracle',
  'cisco', 'intel', 'nvidia', 'adobe', 'paypal', 'netflix'
]);

// Common first names (subset)
export const COMMON_FIRST_NAMES = new Set([
  'john', 'mary', 'david', 'sarah', 'michael', 'jennifer', 'robert',
  'linda', 'william', 'elizabeth', 'james', 'barbara', 'charles',
  'susan', 'joseph', 'jessica', 'thomas', 'karen', 'christopher',
  'nancy', 'daniel', 'betty', 'matthew', 'helen', 'anthony', 'sandra',
  'mark', 'donna', 'donald', 'carol', 'steven', 'ruth', 'kenneth',
  'sharon', 'paul', 'michelle', 'andrew', 'laura', 'joshua', 'emily',
  'kevin', 'kimberly', 'brian', 'deborah', 'george', 'dorothy',
  'timothy', 'lisa', 'ronald', 'nancy', 'jason', 'karen', 'edward',
  'betty', 'jeffrey', 'helen', 'ryan', 'sandra', 'jacob', 'donna'
]);

// Keyboard patterns
export const KEYBOARD_PATTERNS = [
  // QWERTY rows
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  'poiuytrewq', 'lkjhgfdsa', 'mnbvcxz',
  
  // QWERTY columns
  'qaz', 'wsx', 'edc', 'rfv', 'tgb', 'yhn', 'ujm', 'ik', 'ol', 'p',
  'zaq', 'xsw', 'cde', 'vfr', 'bgt', 'nhy', 'mju', 'ki', 'lo',
  
  // Diagonal patterns
  'qwe', 'asd', 'zxc', 'wer', 'sdf', 'xcv', 'ert', 'dfg', 'cvb',
  'rty', 'fgh', 'vbn', 'tyu', 'ghj', 'bnm', 'yui', 'hjk', 'nmk',
  'uio', 'jkl', 'iop', 'kl',
  
  // Numbers
  '123', '234', '345', '456', '567', '678', '789', '890',
  '987', '876', '765', '654', '543', '432', '321'
];

// Date patterns (regex)
export const DATE_PATTERNS = [
  /\b(19|20)\d{2}\b/,           // Years 1900-2099
  /\b(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\b/, // MMDD
  /\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])\b/, // DDMM
  /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,  // MM/DD/YYYY or variations
  /\b\d{1,2}-\d{1,2}-\d{2,4}\b/,    // MM-DD-YYYY or variations
  /\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/   // MM.DD.YYYY or variations
];

// Phone number patterns
export const PHONE_PATTERNS = [
  /\b\d{3}-?\d{3}-?\d{4}\b/,        // XXX-XXX-XXXX
  /\b\(\d{3}\)\s?\d{3}-?\d{4}\b/,   // (XXX) XXX-XXXX
  /\b\d{10}\b/                      // XXXXXXXXXX
];

// Simple word lists for common categories
export const COMMON_WORDS = {
  colors: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'purple', 'orange', 'pink', 'brown'],
  animals: ['cat', 'dog', 'bird', 'fish', 'tiger', 'lion', 'bear', 'wolf', 'fox', 'eagle'],
  sports: ['football', 'baseball', 'basketball', 'soccer', 'tennis', 'hockey', 'golf', 'swimming'],
  months: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
  days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
};

/**
 * Converts leet speak to normal text for dictionary checking
 */
export function normalizeLeetSpeak(password: string): string {
  let normalized = password.toLowerCase();
  
  for (const [char, substitutes] of Object.entries(LEET_SUBSTITUTIONS)) {
    for (const substitute of substitutes) {
      normalized = normalized.replace(new RegExp(substitute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), char);
    }
  }
  
  return normalized;
}

/**
 * Detects if password contains keyboard patterns
 */
export function containsKeyboardPattern(password: string): boolean {
  const lowerPassword = password.toLowerCase();
  
  for (const pattern of KEYBOARD_PATTERNS) {
    if (lowerPassword.includes(pattern) || lowerPassword.includes(pattern.split('').reverse().join(''))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Detects date patterns in password
 */
export function containsDatePattern(password: string): boolean {
  return DATE_PATTERNS.some(pattern => pattern.test(password));
}

/**
 * Detects phone number patterns
 */
export function containsPhonePattern(password: string): boolean {
  return PHONE_PATTERNS.some(pattern => pattern.test(password));
}

/**
 * Calculates a more sophisticated pattern penalty based on multiple factors
 */
export function calculateAdvancedPatternPenalty(password: string): number {
  let penalty = 1.0;
  
  // Check for leet speak
  const normalizedPassword = normalizeLeetSpeak(password);
  if (normalizedPassword !== password.toLowerCase()) {
    penalty *= 0.3; // Leet speak is easily cracked by smart attackers
  }
  
  // Check for extended common passwords
  if (EXTENDED_COMMON_PASSWORDS.has(normalizedPassword)) {
    penalty *= 0.001; // Very low penalty for dictionary words
  }
  
  // Check for keyboard patterns
  if (containsKeyboardPattern(password)) {
    penalty *= 0.1;
  }
  
  // Check for date patterns
  if (containsDatePattern(password)) {
    penalty *= 0.2;
  }
  
  // Check for phone patterns
  if (containsPhonePattern(password)) {
    penalty *= 0.1;
  }
  
  // Check for common words within the password
  const lowerPassword = password.toLowerCase();
  for (const category of Object.values(COMMON_WORDS)) {
    for (const word of category) {
      if (lowerPassword.includes(word)) {
        penalty *= 0.5;
        break;
      }
    }
  }
  
  // Check for common names
  for (const name of COMMON_FIRST_NAMES) {
    if (lowerPassword.includes(name)) {
      penalty *= 0.3;
      break;
    }
  }
  
  return Math.max(0.000001, penalty); // Ensure penalty doesn't go to zero
}

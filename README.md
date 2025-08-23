# 🔐 Secure Auth Helper

A comprehensive password utility library for Node.js applications, providing password strength analysis and secure password generation.

## Features

- **Password Strength Checker**: Evaluates passwords using multiple criteria including length, character variety, entropy, and common password detection
- **Secure Password Generator**: Creates cryptographically secure random passwords with customizable options
- **Memorable Password Generator**: Generates human-friendly passwords using word combinations
- **TypeScript Support**: Full TypeScript definitions included
- **Zero Dependencies**: No external dependencies for core functionality

## Installation

```bash
npm install secure-auth-helper
```

## Quick Start

```javascript
import { checkPasswordStrength, generatePassword } from 'secure-auth-helper';

// Check password strength
const result = checkPasswordStrength('myPassword123!');
console.log(result);
// {
//   score: 4,
//   verdict: "strong",
//   suggestions: ["Consider using 12+ characters for better security"]
// }

// Generate a secure password
const password = generatePassword({
  length: 16,
  numbers: true,
  symbols: true,
  uppercase: true,
  lowercase: true
});
console.log(password); // "Xz!7jLmR$1@qN9pK"
```

## Password Strength Checker

### Basic Usage

```javascript
import { PasswordChecker } from 'secure-auth-helper';

const result = PasswordChecker.checkPassword('MySecurePassword123!');
```

### Return Format

```typescript
interface PasswordStrengthResult {
  score: number;        // 0-5 scale
  verdict: "weak" | "medium" | "strong" | "very strong";
  suggestions: string[]; // Array of improvement suggestions
}
```

### Examples

```javascript
// Weak password
checkPasswordStrength('password');
// {
//   score: 0,
//   verdict: "weak",
//   suggestions: [
//     "Avoid common passwords - use a unique combination",
//     "Use at least 8 characters",
//     "Add uppercase letters (A-Z)",
//     "Add numbers (0-9)",
//     "Add special characters (!@#$%^&*)"
//   ]
// }

// Strong password
checkPasswordStrength('MyV3ry$tr0ngP@ssw0rd!');
// {
//   score: 5,
//   verdict: "very strong",
//   suggestions: [
//     "Great password! Consider using a password manager for unique passwords across all accounts"
//   ]
// }
```

### Strength Criteria

The password checker evaluates:

- **Length**: Minimum 8 characters recommended, 12+ preferred
- **Character Variety**: Uppercase, lowercase, numbers, symbols
- **Common Passwords**: Checks against database of weak passwords
- **Entropy**: Measures randomness and unpredictability
- **Patterns**: Detects repeating and sequential patterns

## Password Generator

### Basic Usage

```javascript
import { PasswordGenerator } from 'secure-auth-helper';

// Generate with default options (12 chars, all types)
const password = PasswordGenerator.generatePassword();

// Generate with custom options
const customPassword = PasswordGenerator.generatePassword({
  length: 16,
  numbers: true,
  symbols: true,
  uppercase: true,
  lowercase: true,
  excludeSimilar: true  // Excludes 0, O, 1, l, I, |
});
```

### Configuration Options

```typescript
interface GeneratePasswordOptions {
  length?: number;        // Default: 12
  numbers?: boolean;      // Default: true
  symbols?: boolean;      // Default: true
  uppercase?: boolean;    // Default: true
  lowercase?: boolean;    // Default: true
  excludeSimilar?: boolean; // Default: false
}
```

### Advanced Generation

```javascript
// Generate the strongest possible password from multiple candidates
const strongPassword = PasswordGenerator.generateStrongPassword({
  length: 20,
  excludeSimilar: true
});

// Generate memorable password (word-based)
const memorablePassword = PasswordGenerator.generateMemorablePassword(4, true, true);
// Example: "Brave-Ocean-Tiger-Music-47!"
```

## Memorable Passwords

For passwords that are easier to remember:

```javascript
import { generateMemorablePassword } from 'secure-auth-helper';

// Generate with default options (4 words + number + symbol)
const password = generateMemorablePassword();
// "Correct-Horse-Battery-Staple-73!"

// Customize word count and additions
const customPassword = generateMemorablePassword(
  3,      // word count
  true,   // add numbers
  false   // exclude symbols
);
// "Apple-River-Knight-42"
```

## Security Features

### Cryptographically Secure Random Generation

The library uses Node.js's `crypto.randomBytes()` for secure random number generation, ensuring passwords are unpredictable.

### Common Password Detection

Checks against a comprehensive list of common weak passwords including:
- Numeric sequences (123456, etc.)
- Common words (password, admin, etc.)
- Keyboard patterns (qwerty, asdfgh, etc.)
- Date patterns and simple variations

### Entropy Calculation

Passwords are evaluated for entropy based on:
- Character set size
- Password length
- Pattern detection
- Randomness assessment

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import { 
  PasswordStrengthResult, 
  GeneratePasswordOptions,
  PasswordVerdict 
} from 'secure-auth-helper';

const checkResult: PasswordStrengthResult = checkPasswordStrength('test');
const options: GeneratePasswordOptions = { length: 16, symbols: false };
```

## API Reference

### Password Checker

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `checkPasswordStrength(password)` | `string` | `PasswordStrengthResult` | Analyzes password strength |
| `PasswordChecker.checkPassword(password)` | `string` | `PasswordStrengthResult` | Class method for password analysis |

### Password Generator

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `generatePassword(options?)` | `GeneratePasswordOptions` | `string` | Generates secure random password |
| `generateStrongPassword(options?)` | `GeneratePasswordOptions` | `string` | Generates optimized strong password |
| `generateMemorablePassword(wordCount?, addNumbers?, addSymbols?)` | `number, boolean, boolean` | `string` | Generates word-based password |

## Examples

### Web Application Integration

```javascript
// User registration validation
app.post('/register', (req, res) => {
  const { password } = req.body;
  const strength = checkPasswordStrength(password);
  
  if (strength.score < 3) {
    return res.status(400).json({
      error: 'Password too weak',
      suggestions: strength.suggestions
    });
  }
  
  // Proceed with registration
});

// Password reset with secure generation
app.post('/reset-password', (req, res) => {
  const temporaryPassword = generatePassword({
    length: 12,
    excludeSimilar: true
  });
  
  // Send secure temporary password
});
```

### CLI Tool

```javascript
#!/usr/bin/env node
import { checkPasswordStrength, generatePassword } from 'secure-auth-helper';

const [,, action, password] = process.argv;

if (action === 'check' && password) {
  const result = checkPasswordStrength(password);
  console.log(`Score: ${result.score}/5`);
  console.log(`Verdict: ${result.verdict}`);
  console.log('Suggestions:', result.suggestions.join(', '));
} else if (action === 'generate') {
  console.log(generatePassword({ length: 16 }));
}
```

## Testing

Run the test suite:

```bash
npm test
```

The package includes comprehensive tests for:
- Password strength evaluation
- Password generation algorithms
- Edge cases and error handling
- TypeScript type definitions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Security Notice

This library is designed for general-purpose password utilities. For high-security applications, consider additional measures such as:
- Server-side validation
- Rate limiting
- Account lockout policies
- Multi-factor authentication
- Professional security audit

## Changelog

### v1.0.0
- Initial release
- Password strength checker with 0-5 scoring
- Secure password generator with customizable options
- Memorable password generation
- TypeScript support
- Comprehensive test suite

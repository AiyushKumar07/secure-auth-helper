const { checkPasswordStrength, checkPasswordStrengthWithPwnedCheck, checkIfPasswordPwned, generatePassword, generateStrongPassword } = require('./dist/index.js');

async function runDemo() {
  console.log('🔐 Secure Auth Helper - Demo with Pwned Password Checking\n');
  
  // Test passwords - some common ones that are likely pwned
  const testPasswords = [
    'password123',    // Very common, definitely pwned
    'admin123',       // Common, likely pwned
    'MySecure@Pass2024!', // Strong password, unlikely to be pwned
    '123456',         // Extremely common, definitely pwned
    'qwerty123',      // Common keyboard pattern, likely pwned
  ];

  console.log('🔍 Testing Password Strength with Pwned Check:\n');

  for (const password of testPasswords) {
    console.log(`\n📋 Testing: "${password}"`);
    console.log('─'.repeat(50));
    
    try {
      // Test the async version with pwned checking
      const result = await checkPasswordStrengthWithPwnedCheck(password);
      
      console.log(`💪 Strength Score: ${result.score}/5 (${result.verdict})`);
      console.log(`⏱️  Crack Time (Online): ${result.crackTime.online.humanReadable}`);
      console.log(`⏱️  Crack Time (Offline): ${result.crackTime.offline.humanReadable}`);
      
      // Pwned status
      if (result.pwnedCheck.isPwned) {
        console.log(`🚨 PWNED: Found ${result.pwnedCheck.breachCount?.toLocaleString()} times in breaches`);
      } else if (result.pwnedCheck.errorMessage) {
        console.log(`⚠️  Error checking pwned status: ${result.pwnedCheck.errorMessage}`);
      } else {
        console.log('✅ Not found in known data breaches');
      }
      
      // Suggestions
      if (result.suggestions.length > 0) {
        console.log('💡 Suggestions:');
        result.suggestions.forEach(suggestion => {
          console.log(`   • ${suggestion}`);
        });
      }
      
    } catch (error) {
      console.error(`❌ Error testing password: ${error.message}`);
    }
  }

  // Demonstrate synchronous version (without pwned check)
  console.log('\n\n🔄 Testing Synchronous Version (No Pwned Check):\n');
  const syncResult = checkPasswordStrength('MySecure@Pass2024!');
  console.log('📋 Testing: "MySecure@Pass2024!" (sync)');
  console.log('─'.repeat(50));
  console.log(`💪 Strength Score: ${syncResult.score}/5 (${syncResult.verdict})`);
  console.log(`⏱️  Crack Time (Online): ${syncResult.crackTime.online.humanReadable}`);

  // Test standalone pwned checking
  console.log('\n\n🔍 Testing Standalone Pwned Checking:\n');
  const pwnedTest = 'password';
  console.log(`📋 Checking if "${pwnedTest}" has been pwned...`);
  
  try {
    const pwnedResult = await checkIfPasswordPwned(pwnedTest);
    if (pwnedResult.isPwned) {
      console.log(`🚨 PWNED: Found ${pwnedResult.breachCount?.toLocaleString()} times in breaches`);
    } else {
      console.log('✅ Not found in known data breaches');
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }

  // Generate secure passwords
  console.log('\n\n🎲 Generating Secure Passwords:\n');
  console.log('📋 Generated strong password:', generateStrongPassword());
  console.log('📋 Generated custom password:', generatePassword({ 
    length: 16, 
    symbols: true, 
    numbers: true,
    excludeSimilar: true 
  }));

  console.log('\n✅ Demo completed! The library now includes pwned password checking.');
  console.log('\n📚 API Methods:');
  console.log('   • checkPasswordStrength() - Original sync method (backward compatible)');
  console.log('   • checkPasswordStrengthWithPwnedCheck() - New async method with pwned checking');
  console.log('   • checkIfPasswordPwned() - Standalone pwned password checking');
  console.log('\n🖥️  CLI Tools:');
  console.log('   • node checkPwned.js <password> - Check any password from command line');
  console.log('   • npm run check-pwned <password> - Same as above using npm script');
  console.log('\n🆕 New Features:');
  console.log('   • Privacy-preserving pwned password checking using HaveIBeenPwned API');
  console.log('   • Pwned passwords automatically get low strength scores');
  console.log('   • Suggestions include warnings for compromised passwords');
  console.log('   • Full backward compatibility with existing code');
}

// Run the demo
runDemo().catch(console.error);
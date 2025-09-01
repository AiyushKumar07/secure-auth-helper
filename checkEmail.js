#!/usr/bin/env node

const { validateEmail, isValidEmailSyntax } = require('./dist/index');
const { getDisposableDomainsCacheInfo } = require('./dist/data/disposableEmailProviders');

async function demonstrateEmailValidation() {
  console.log('🔍 Email Validation Demo\n');
  console.log('=' .repeat(50));
  
  // Show disposable domains cache info
  const cacheInfo = getDisposableDomainsCacheInfo();
  console.log('📊 Disposable Domains Database:');
  console.log(`   • Cached: ${cacheInfo.isCached ? '✅' : '❌'}`);
  console.log(`   • Domain Count: ${cacheInfo.domainCount.toLocaleString()}`);
  if (cacheInfo.lastFetchTime) {
    console.log(`   • Last Updated: ${cacheInfo.lastFetchTime.toLocaleString()}`);
  }
  console.log(`   • Source: ${cacheInfo.isCached ? 'GitHub Repository' : 'Fallback List'}`);
  console.log('');
  
  const testEmails = [
    'synyci@forexzig.com',      // The example from user requirements
    'test@gmail.com',           // Valid email
    'admin@company.com',        // Role-based email
    'user@10minutemail.com',    // Disposable email
    'invalid-email',            // Invalid syntax
    'test@nonexistentdomain12345.com', // Non-existent domain
  ];
  
  for (const email of testEmails) {
    console.log(`\n📧 Testing: ${email}`);
    console.log('-'.repeat(30));
    
    try {
      const result = await validateEmail(email);
      
      console.log(`✅ Email: ${result.email}`);
      console.log(`📊 Score: ${result.score}/100`);
      console.log(`🎯 Status: ${result.status}`);
      console.log('\n📋 Validations:');
      console.log(`   • Syntax: ${result.validations.syntax ? '✅' : '❌'}`);
      console.log(`   • Domain exists: ${result.validations.domain_exists ? '✅' : '❌'}`);
      console.log(`   • MX records: ${result.validations.mx_records ? '✅' : '❌'}`);
      console.log(`   • Mailbox exists: ${result.validations.mailbox_exists ? '✅' : '❌'}`);
      console.log(`   • Is disposable: ${result.validations.is_disposable ? '⚠️' : '✅'}`);
      console.log(`   • Is role-based: ${result.validations.is_role_based ? '⚠️' : '✅'}`);
      
      if (result.suggestions && result.suggestions.length > 0) {
        console.log('\n💡 Suggestions:');
        result.suggestions.forEach(suggestion => {
          console.log(`   • ${suggestion}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Error validating email: ${error.message}`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✨ Demo completed!');
}

// Quick syntax-only validation demo
function demonstrateSyntaxValidation() {
  console.log('\n🚀 Quick Syntax Validation:');
  const quickTests = [
    'test@example.com',
    'invalid-email',
    'user@domain',
    'test.email@domain.co.uk'
  ];
  
  quickTests.forEach(email => {
    const isValid = isValidEmailSyntax(email);
    console.log(`   ${email}: ${isValid ? '✅' : '❌'}`);
  });
}

// Main execution
if (require.main === module) {
  demonstrateEmailValidation()
    .then(() => {
      demonstrateSyntaxValidation();
    })
    .catch(error => {
      console.error('Demo failed:', error);
    });
}

module.exports = { demonstrateEmailValidation, demonstrateSyntaxValidation };

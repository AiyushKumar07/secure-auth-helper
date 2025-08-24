#!/usr/bin/env node

const { checkIfPasswordPwned } = require('./dist/index.js');

async function main() {
    const password = process.argv[2];
    
    if (!password) {
        console.error('Usage: node checkPwned.js <password>');
        console.error('Example: node checkPwned.js password123');
        process.exit(1);
    }

    console.log(`🔍 Checking if "${password}" has been pwned...`);
    console.log('─'.repeat(50));

    try {
        const result = await checkIfPasswordPwned(password);
        
        if (result.isPwned) {
            console.log(`🚨 PWNED: Found ${result.breachCount?.toLocaleString()} times in data breaches`);
            console.log('⚠️  This password should NOT be used - choose a different one immediately');
        } else if (result.errorMessage) {
            console.log(`❌ Error: ${result.errorMessage}`);
            console.log('💡 Consider using a different password for safety');
        } else {
            console.log('✅ Not found in known data breaches');
            console.log('👍 This password appears to be safe from a breach perspective');
        }
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

main().catch(console.error);

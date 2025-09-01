#!/usr/bin/env node

const { checkPasswordStrength, checkPasswordStrengthWithPwnedCheck } = require('./dist/index.js');

async function main() {
    const password = process.argv[2];
    const includePwned = process.argv.includes('--pwned') || process.argv.includes('-p');
    
    if (!password) {
        console.error('Usage: node checkStrength.js <password> [--pwned|-p]');
        console.error('');
        console.error('Examples:');
        console.error('  node checkStrength.js "MyPassword123!"');
        console.error('  node checkStrength.js "password123" --pwned');
        console.error('  npm run check-strength "MyPassword123!"');
        console.error('  npm run check-strength "password123" --pwned');
        console.error('');
        console.error('Options:');
        console.error('  --pwned, -p    Include pwned password checking (requires internet)');
        process.exit(1);
    }

    console.log(`🔐 Checking password strength: "${password}"`);
    console.log('═'.repeat(60));

    try {
        let result;
        
        if (includePwned) {
            console.log('🌐 Including pwned password check...\n');
            result = await checkPasswordStrengthWithPwnedCheck(password);
        } else {
            console.log('⚡ Quick strength analysis (offline)...\n');
            result = checkPasswordStrength(password);
        }
        
        // Display strength score and verdict
        const scoreBar = '█'.repeat(result.score) + '░'.repeat(5 - result.score);
        console.log(`💪 Strength Score: ${result.score}/5 [${scoreBar}] (${result.verdict.toUpperCase()})`);
        
        // Color code based on strength
        const colors = {
            'weak': '🔴',
            'medium': '🟡', 
            'strong': '🟢',
            'very strong': '🟢'
        };
        console.log(`${colors[result.verdict] || '⚪'} Verdict: ${result.verdict}`);
        
        // Display pwned status if checked
        if (result.pwnedCheck) {
            console.log('\n🛡️  Breach Status:');
            if (result.pwnedCheck.isPwned) {
                console.log(`   🚨 COMPROMISED: Found ${result.pwnedCheck.breachCount?.toLocaleString()} times in data breaches`);
                console.log('   ⚠️  This password should NOT be used!');
            } else if (result.pwnedCheck.errorMessage) {
                console.log(`   ❌ Error checking: ${result.pwnedCheck.errorMessage}`);
            } else {
                console.log('   ✅ Not found in known data breaches');
            }
        }
        
        // Display crack time estimates
        console.log('\n⏱️  Estimated Crack Times:');
        console.log(`   🌐 Online Attack:     ${result.crackTime.online.humanReadable}`);
        console.log(`   💻 Offline Attack:    ${result.crackTime.offline.humanReadable}`);
        console.log(`   🚀 Fast Offline:      ${result.crackTime.offlineFast.humanReadable}`);
        
        // Display suggestions
        if (result.suggestions && result.suggestions.length > 0) {
            console.log('\n💡 Suggestions for improvement:');
            result.suggestions.forEach((suggestion, index) => {
                console.log(`   ${index + 1}. ${suggestion}`);
            });
        }
        
        // Overall recommendation
        console.log('\n📊 Overall Assessment:');
        if (result.pwnedCheck?.isPwned) {
            console.log('   🚨 CRITICAL: Change this password immediately - it\'s been compromised!');
        } else if (result.score >= 4) {
            console.log('   ✅ EXCELLENT: This is a strong password suitable for important accounts');
        } else if (result.score >= 3) {
            console.log('   👍 GOOD: Decent password, but could be stronger');
        } else if (result.score >= 2) {
            console.log('   ⚠️  FAIR: Minimum security - consider strengthening');
        } else {
            console.log('   ❌ POOR: This password is too weak - create a stronger one');
        }
        
        // Usage tip
        if (!includePwned) {
            console.log('\n💡 Tip: Add --pwned flag to check against known data breaches');
        }
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

main().catch(console.error);

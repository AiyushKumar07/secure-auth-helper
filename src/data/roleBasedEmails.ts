/**
 * List of common role-based email prefixes
 * These are typically not personal emails but represent organizational roles
 */

export const ROLE_BASED_EMAIL_PREFIXES = new Set([
  // Administrative roles
  'admin',
  'administrator',
  'root',
  'postmaster',
  'webmaster',
  'hostmaster',
  'abuse',
  'security',
  'privacy',
  'compliance',
  'legal',
  'dpo', // Data Protection Officer
  
  // Customer service
  'support',
  'help',
  'helpdesk',
  'service',
  'customer',
  'customerservice',
  'contact',
  'feedback',
  'complaints',
  
  // Business/General inquiries
  'info',
  'information',
  'hello',
  'inquiries',
  'inquiry',
  'general',
  'office',
  'reception',
  
  // Sales and Marketing
  'sales',
  'marketing',
  'business',
  'partnerships',
  'partner',
  'press',
  'media',
  'pr',
  'publicity',
  
  // Technical
  'tech',
  'technical',
  'it',
  'noc', // Network Operations Center
  'devops',
  'sysadmin',
  'network',
  'ops',
  'operations',
  
  // HR and Recruiting
  'hr',
  'careers',
  'jobs',
  'recruiting',
  'recruitment',
  'talent',
  
  // Finance and Billing
  'billing',
  'accounts',
  'accounting',
  'finance',
  'payments',
  'invoices',
  'orders',
  
  // No-reply addresses
  'noreply',
  'no-reply',
  'donotreply',
  'do-not-reply',
  'automated',
  'system',
  'notification',
  'notifications',
  'alerts',
  'bounce',
  'bounces',
  
  // Management
  'ceo',
  'cto',
  'cfo',
  'coo',
  'president',
  'director',
  'manager',
  'executive',
  
  // Common department emails
  'research',
  'development',
  'design',
  'editorial',
  'content',
  'community',
  'events',
  'training',
  'quality',
  'qa'
]);

/**
 * Check if an email appears to be role-based (not a personal email)
 * @param email - The email address to check
 * @returns true if the email appears to be role-based
 */
export function isRoleBasedEmail(email: string): boolean {
  if (!email.includes('@')) {
    return false;
  }
  
  const localPart = email.split('@')[0].toLowerCase();
  
  // Check exact matches
  if (ROLE_BASED_EMAIL_PREFIXES.has(localPart)) {
    return true;
  }
  
  // Check if it starts with a role-based prefix followed by common separators
  for (const prefix of ROLE_BASED_EMAIL_PREFIXES) {
    if (localPart === prefix) {
      return true;
    }
    
    // Only match if the prefix is followed by a separator (not part of a longer word)
    if (localPart.startsWith(prefix)) {
      const remainder = localPart.substring(prefix.length);
      // Check if it's followed by numbers, dots, dashes, or underscores (not letters)
      if (remainder.length > 0 && /^[0-9._-]/.test(remainder)) {
        return true;
      }
    }
  }
  
  return false;
}

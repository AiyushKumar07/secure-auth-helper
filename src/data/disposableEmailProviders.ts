/**
 * Disposable email domain detection using the comprehensive list from
 * https://disposable.github.io/disposable-email-domains/domains.json
 * 
 * This implementation fetches the latest disposable domains list and caches it
 * for performance while providing a fallback for offline scenarios.
 */

import * as https from 'https';

// Fallback list of most common disposable email providers
const FALLBACK_DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.org',
  'yopmail.com',
  'throwaway.email',
  'getnada.com',
  'maildrop.cc',
  'sharklasers.com',
  'discard.email',
  'temp-mail.org',
  'emailondeck.com'
]);

// Cache for disposable domains
let disposableDomainsCache: Set<string> | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const DISPOSABLE_DOMAINS_URL = 'https://disposable.github.io/disposable-email-domains/domains.json';

/**
 * Fetches the latest disposable email domains from the GitHub repository
 * @returns Promise<Set<string>> - Set of disposable domain strings
 */
async function fetchDisposableDomains(): Promise<Set<string>> {
  return new Promise((resolve, reject) => {
    const request = https.get(DISPOSABLE_DOMAINS_URL, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const domains = JSON.parse(data) as string[];
          const domainSet = new Set(domains.map(domain => domain.toLowerCase()));
          resolve(domainSet);
        } catch (error) {
          reject(new Error(`Failed to parse disposable domains JSON: ${error}`));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(new Error(`Failed to fetch disposable domains: ${error.message}`));
    });
    
    // Set a timeout for the request
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout while fetching disposable domains'));
    });
  });
}

/**
 * Gets disposable domains with caching
 * @returns Promise<Set<string>> - Cached or freshly fetched disposable domains
 */
async function getDisposableDomains(): Promise<Set<string>> {
  const now = Date.now();
  
  // Return cached data if it's still fresh
  if (disposableDomainsCache && (now - lastFetchTime) < CACHE_DURATION) {
    return disposableDomainsCache;
  }
  
  try {
    // Attempt to fetch fresh data
    const freshDomains = await fetchDisposableDomains();
    disposableDomainsCache = freshDomains;
    lastFetchTime = now;
    return freshDomains;
  } catch (error) {
    console.warn('Failed to fetch disposable domains, using fallback list:', error);
    
    // Return cached data if available, otherwise fallback
    if (disposableDomainsCache) {
      return disposableDomainsCache;
    }
    
    return FALLBACK_DISPOSABLE_DOMAINS;
  }
}

/**
 * Initializes the disposable domains cache on first load
 * This is called when the module is imported to pre-populate the cache
 */
let initializationPromise: Promise<void> | null = null;

function initializeCache(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = getDisposableDomains().then(() => {
      // Cache initialized successfully
    }).catch(() => {
      // Initialization failed, but that's okay - we'll use fallback
    });
  }
  return initializationPromise;
}

// Start initialization when module loads
initializeCache();

/**
 * Check if an email domain is from a disposable email provider (synchronous)
 * Uses cached data if available, otherwise falls back to basic list
 * @param domain - The domain to check
 * @returns true if the domain is a known disposable email provider
 */
export function isDisposableEmailDomain(domain: string): boolean {
  const normalizedDomain = domain.toLowerCase();
  
  // Use cached data if available
  if (disposableDomainsCache) {
    return disposableDomainsCache.has(normalizedDomain);
  }
  
  // Fallback to basic list if cache not ready
  // Also trigger a background cache refresh
  if (!initializationPromise) {
    initializeCache();
  }
  
  return FALLBACK_DISPOSABLE_DOMAINS.has(normalizedDomain);
}

/**
 * Check if an email domain is from a disposable email provider (asynchronous)
 * Always uses the most up-to-date list available
 * @param domain - The domain to check
 * @returns Promise<boolean> - true if the domain is a known disposable email provider
 */
export async function isDisposableEmailDomainAsync(domain: string): Promise<boolean> {
  const normalizedDomain = domain.toLowerCase();
  const domains = await getDisposableDomains();
  return domains.has(normalizedDomain);
}

/**
 * Get the current disposable domains cache statistics
 * @returns object with cache information
 */
export function getDisposableDomainsCacheInfo(): {
  isCached: boolean;
  domainCount: number;
  lastFetchTime: Date | null;
  cacheAge: number;
} {
  return {
    isCached: disposableDomainsCache !== null,
    domainCount: disposableDomainsCache?.size || FALLBACK_DISPOSABLE_DOMAINS.size,
    lastFetchTime: lastFetchTime ? new Date(lastFetchTime) : null,
    cacheAge: lastFetchTime ? Date.now() - lastFetchTime : 0
  };
}

/**
 * Force refresh the disposable domains cache
 * @returns Promise<void>
 */
export async function refreshDisposableDomainsCache(): Promise<void> {
  try {
    const freshDomains = await fetchDisposableDomains();
    disposableDomainsCache = freshDomains;
    lastFetchTime = Date.now();
  } catch (error) {
    throw new Error(`Failed to refresh disposable domains cache: ${error}`);
  }
}

// Export the FALLBACK_DISPOSABLE_DOMAINS for testing purposes
export { FALLBACK_DISPOSABLE_DOMAINS };

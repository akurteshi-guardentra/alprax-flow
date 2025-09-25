/**
 * Stellar address display utilities
 * Better ways to display long Stellar addresses to users
 */

// Word lists for generating memorable names
const ADJECTIVES = [
  'brave', 'bright', 'clever', 'swift', 'bold', 'wise', 'calm', 'strong',
  'gentle', 'quick', 'noble', 'keen', 'sharp', 'clear', 'pure', 'true',
  'lucky', 'happy', 'stellar', 'cosmic', 'lunar', 'solar', 'mighty', 'grand',
  'golden', 'silver', 'diamond', 'crystal', 'azure', 'crimson', 'emerald', 'violet'
];

const NOUNS = [
  'star', 'moon', 'sun', 'comet', 'nova', 'galaxy', 'nebula', 'asteroid',
  'planet', 'orbit', 'cosmos', 'universe', 'space', 'rocket', 'explorer', 'voyager',
  'phoenix', 'dragon', 'eagle', 'falcon', 'wolf', 'lion', 'tiger', 'bear',
  'ocean', 'mountain', 'forest', 'river', 'canyon', 'summit', 'valley', 'harbor'
];

/**
 * Truncate a Stellar address for display
 */
export function truncateStellarAddress(address: string, prefixLength = 4, suffixLength = 4): string {
  if (!address || address.length <= prefixLength + suffixLength + 3) {
    return address;
  }
  
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Generate a memorable name from a Stellar address
 * Uses a deterministic algorithm based on the address
 */
export function generateMemorableName(address: string): string {
  if (!address) return 'unknown-account';
  
  // Use the address to seed our selection
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Make hash positive
  hash = Math.abs(hash);
  
  // Select adjective and noun based on hash
  const adjectiveIndex = hash % ADJECTIVES.length;
  const nounIndex = Math.floor(hash / ADJECTIVES.length) % NOUNS.length;
  
  // Generate a number suffix based on address
  const numberSuffix = (hash % 999) + 1;
  
  return `${ADJECTIVES[adjectiveIndex]}-${NOUNS[nounIndex]}-${numberSuffix}`;
}

/**
 * Format address for different display contexts
 */
export interface AddressDisplayOptions {
  context: 'compact' | 'standard' | 'full' | 'memorable' | 'card';
  showCopyButton?: boolean;
  showQRCode?: boolean;
}

export function formatStellarAddress(address: string, options: AddressDisplayOptions) {
  if (!address) return { display: '', full: '', memorable: '' };
  
  const memorable = generateMemorableName(address);
  
  switch (options.context) {
    case 'compact':
      return {
        display: truncateStellarAddress(address, 3, 3),
        full: address,
        memorable,
        tooltip: `${memorable} (${address})`
      };
      
    case 'standard':
      return {
        display: truncateStellarAddress(address, 6, 6),
        full: address,
        memorable,
        tooltip: `${memorable} (${address})`
      };
      
    case 'memorable':
      return {
        display: memorable,
        full: address,
        memorable,
        tooltip: address
      };
      
    case 'full':
    default:
      return {
        display: address,
        full: address,
        memorable,
        tooltip: memorable
      };
  }
}

/**
 * Validate Stellar address format
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address) return false;
  
  // Stellar addresses are 56 characters long and start with 'G'
  if (address.length !== 56 || !address.startsWith('G')) {
    return false;
  }
  
  // Check if it contains only valid base32 characters
  const validChars = /^[A-Z2-7]+$/;
  return validChars.test(address);
}

/**
 * Create a QR code data URL for a Stellar address
 */
export function createStellarQRCodeData(address: string, amount?: number, memo?: string): string {
  let stellarUri = `stellar:${address}`;
  
  const params = new URLSearchParams();
  if (amount) params.append('amount', amount.toString());
  if (memo) params.append('memo', memo);
  
  if (params.toString()) {
    stellarUri += `?${params.toString()}`;
  }
  
  return stellarUri;
}

/**
 * Get address display color based on the address
 * Useful for creating consistent visual identifiers
 */
export function getAddressColor(address: string): { bg: string; text: string; border: string } {
  if (!address) return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-muted' };
  
  // Generate a color based on the address
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Extract domain from federated Stellar address if present
 */
export function extractFederatedDomain(address: string): string | null {
  if (!address) return null;
  
  // Check if it's a federated address (contains *)
  const federatedMatch = address.match(/^(.+)\*(.+)$/);
  if (federatedMatch) {
    return federatedMatch[2]; // Return the domain part
  }
  
  return null;
}

/**
 * Check if address is a federated address
 */
export function isFederatedAddress(address: string): boolean {
  return address?.includes('*') || false;
}

/**
 * Create address book entry suggestions
 */
export interface AddressBookSuggestion {
  address: string;
  name: string;
  type: 'memorable' | 'domain' | 'custom';
  confidence: number;
}

export function generateAddressBookSuggestions(address: string): AddressBookSuggestion[] {
  if (!address) return [];
  
  const suggestions: AddressBookSuggestion[] = [];
  
  // Always suggest memorable name
  suggestions.push({
    address,
    name: generateMemorableName(address),
    type: 'memorable',
    confidence: 0.9
  });
  
  // If federated, suggest domain-based name
  const domain = extractFederatedDomain(address);
  if (domain) {
    suggestions.push({
      address,
      name: domain.replace(/\./g, '-'),
      type: 'domain',
      confidence: 0.95
    });
  }
  
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Format balance display
 */
export function formatBalance(balance: string | number, currency = 'XLM', decimals = 7): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  
  if (isNaN(num)) return '0.0000000 ' + currency;
  
  // For very small amounts, show more decimals
  if (num < 0.001) {
    return num.toFixed(decimals) + ' ' + currency;
  }
  
  // For larger amounts, show fewer decimals
  if (num >= 1) {
    return num.toFixed(2) + ' ' + currency;
  }
  
  return num.toFixed(4) + ' ' + currency;
}

/**
 * Get network info for address
 */
export function getNetworkInfo(address: string): { network: 'testnet' | 'mainnet'; isValid: boolean } {
  if (!isValidStellarAddress(address)) {
    return { network: 'mainnet', isValid: false };
  }
  
  // This is a simplified check - in reality, you'd need to query the network
  // For now, we'll assume testnet addresses contain certain patterns
  const isTestnet = address.includes('TEST') || address.startsWith('GB') === false;
  
  return {
    network: isTestnet ? 'testnet' : 'mainnet',
    isValid: true
  };
}
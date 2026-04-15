import { describe, it, expect } from 'vitest';
import {
  truncateStellarAddress,
  generateMemorableName,
  formatStellarAddress,
  isValidStellarAddress,
  createStellarQRCodeData,
  getAddressColor,
  extractFederatedDomain,
  isFederatedAddress,
  generateAddressBookSuggestions,
  formatBalance,
  getNetworkInfo
} from '../utils/stellar-display';

const VALID_ADDRESS = 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A';

describe('stellar-display utilities', () => {
  // ---------------------------------------------------------------------------
  describe('truncateStellarAddress', () => {
    it('truncates a full address with default prefix/suffix lengths', () => {
      const result = truncateStellarAddress(VALID_ADDRESS);
      expect(result).toMatch(/^GAHK\.\.\.DB4A$/);
    });

    it('uses custom prefix and suffix lengths', () => {
      const result = truncateStellarAddress(VALID_ADDRESS, 6, 6);
      expect(result.startsWith('GAHK7E')).toBe(true);
      // The 6-char suffix of our test address is 'TODB4A'; verify the full pattern.
      expect(result).toMatch(/^GAHK7E\.\.\..{6}$/);
      expect(result).toContain('...');
    });

    it('returns the address unchanged when it is shorter than the threshold', () => {
      const short = 'GABC';
      expect(truncateStellarAddress(short)).toBe(short);
    });

    it('handles an empty string gracefully', () => {
      expect(truncateStellarAddress('')).toBe('');
    });
  });

  // ---------------------------------------------------------------------------
  describe('generateMemorableName', () => {
    it('returns a non-empty string for a valid address', () => {
      const name = generateMemorableName(VALID_ADDRESS);
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('returns "unknown-account" for an empty address', () => {
      expect(generateMemorableName('')).toBe('unknown-account');
    });

    it('is deterministic – same address always produces the same name', () => {
      const a = generateMemorableName(VALID_ADDRESS);
      const b = generateMemorableName(VALID_ADDRESS);
      expect(a).toBe(b);
    });

    it('produces different names for different addresses', () => {
      const addr2 = 'GD3MMPOEXG7UGKKMSJONH4BULA7VX3ZD53TJZZEL55GKDTBRDOCX374V';
      expect(generateMemorableName(VALID_ADDRESS)).not.toBe(
        generateMemorableName(addr2)
      );
    });

    it('follows the adjective-noun-number pattern', () => {
      const name = generateMemorableName(VALID_ADDRESS);
      expect(name).toMatch(/^[a-z]+-[a-z]+-\d+$/);
    });
  });

  // ---------------------------------------------------------------------------
  describe('formatStellarAddress', () => {
    it('compact context truncates to 3+3 characters', () => {
      const result = formatStellarAddress(VALID_ADDRESS, { context: 'compact' });
      // compact uses prefixLength=3, suffixLength=3
      expect(result.display).toMatch(/^GAH\.\.\..{3}$/);
    });

    it('standard context truncates to 6+6 characters', () => {
      const result = formatStellarAddress(VALID_ADDRESS, { context: 'standard' });
      expect(result.display).toContain('...');
      expect(result.display.length).toBeLessThan(VALID_ADDRESS.length);
    });

    it('full context returns the full address as display', () => {
      const result = formatStellarAddress(VALID_ADDRESS, { context: 'full' });
      expect(result.display).toBe(VALID_ADDRESS);
    });

    it('memorable context returns a human-readable name', () => {
      const result = formatStellarAddress(VALID_ADDRESS, { context: 'memorable' });
      expect(result.display).not.toBe(VALID_ADDRESS);
      expect(result.full).toBe(VALID_ADDRESS);
    });

    it('always exposes the full address in result.full', () => {
      const contexts = ['compact', 'standard', 'full', 'memorable'] as const;
      contexts.forEach((context) => {
        const result = formatStellarAddress(VALID_ADDRESS, { context });
        expect(result.full).toBe(VALID_ADDRESS);
      });
    });

    it('returns empty strings for an empty address', () => {
      const result = formatStellarAddress('', { context: 'full' });
      expect(result.display).toBe('');
      expect(result.full).toBe('');
    });
  });

  // ---------------------------------------------------------------------------
  describe('isValidStellarAddress', () => {
    it('returns true for a valid Stellar address', () => {
      expect(isValidStellarAddress(VALID_ADDRESS)).toBe(true);
    });

    it('returns false for an address not starting with G', () => {
      const bad = 'S' + VALID_ADDRESS.slice(1);
      expect(isValidStellarAddress(bad)).toBe(false);
    });

    it('returns false for a 55-character address', () => {
      expect(isValidStellarAddress(VALID_ADDRESS.slice(0, 55))).toBe(false);
    });

    it('returns false for a 57-character address', () => {
      expect(isValidStellarAddress(VALID_ADDRESS + 'A')).toBe(false);
    });

    it('returns false for an address containing lowercase letters', () => {
      const lower = 'g' + VALID_ADDRESS.slice(1);
      expect(isValidStellarAddress(lower)).toBe(false);
    });

    it('returns false for an empty string', () => {
      expect(isValidStellarAddress('')).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  describe('createStellarQRCodeData', () => {
    it('returns the basic stellar URI for an address', () => {
      const uri = createStellarQRCodeData(VALID_ADDRESS);
      expect(uri).toBe(`stellar:${VALID_ADDRESS}`);
    });

    it('appends amount as a query parameter when provided', () => {
      const uri = createStellarQRCodeData(VALID_ADDRESS, 10);
      expect(uri).toContain('amount=10');
    });

    it('appends memo as a query parameter when provided', () => {
      const uri = createStellarQRCodeData(VALID_ADDRESS, undefined, 'hello');
      expect(uri).toContain('memo=hello');
    });

    it('appends both amount and memo when both are provided', () => {
      const uri = createStellarQRCodeData(VALID_ADDRESS, 5, 'pay');
      expect(uri).toContain('amount=5');
      expect(uri).toContain('memo=pay');
    });
  });

  // ---------------------------------------------------------------------------
  describe('getAddressColor', () => {
    it('returns bg, text, and border properties', () => {
      const color = getAddressColor(VALID_ADDRESS);
      expect(color).toHaveProperty('bg');
      expect(color).toHaveProperty('text');
      expect(color).toHaveProperty('border');
    });

    it('returns muted classes for an empty address', () => {
      const color = getAddressColor('');
      expect(color.bg).toContain('muted');
    });

    it('is deterministic', () => {
      const a = getAddressColor(VALID_ADDRESS);
      const b = getAddressColor(VALID_ADDRESS);
      expect(a.bg).toBe(b.bg);
    });
  });

  // ---------------------------------------------------------------------------
  describe('extractFederatedDomain', () => {
    it('returns the domain from a federated address', () => {
      expect(extractFederatedDomain('user*stellar.org')).toBe('stellar.org');
    });

    it('returns null for a regular Stellar address', () => {
      expect(extractFederatedDomain(VALID_ADDRESS)).toBeNull();
    });

    it('returns null for an empty string', () => {
      expect(extractFederatedDomain('')).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  describe('isFederatedAddress', () => {
    it('returns true for an address containing *', () => {
      expect(isFederatedAddress('user*stellar.org')).toBe(true);
    });

    it('returns false for a regular Stellar address', () => {
      expect(isFederatedAddress(VALID_ADDRESS)).toBe(false);
    });

    it('returns false for an empty string', () => {
      expect(isFederatedAddress('')).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  describe('generateAddressBookSuggestions', () => {
    it('returns at least one suggestion for a valid address', () => {
      const suggestions = generateAddressBookSuggestions(VALID_ADDRESS);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('always includes a memorable-type suggestion', () => {
      const suggestions = generateAddressBookSuggestions(VALID_ADDRESS);
      expect(suggestions.some((s) => s.type === 'memorable')).toBe(true);
    });

    it('includes a domain-type suggestion for a federated address', () => {
      const suggestions = generateAddressBookSuggestions('user*stellar.org');
      expect(suggestions.some((s) => s.type === 'domain')).toBe(true);
    });

    it('returns an empty array for an empty address', () => {
      expect(generateAddressBookSuggestions('')).toEqual([]);
    });

    it('suggestions are sorted by confidence descending', () => {
      const suggestions = generateAddressBookSuggestions('user*stellar.org');
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i - 1].confidence).toBeGreaterThanOrEqual(
          suggestions[i].confidence
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  describe('formatBalance', () => {
    it('formats a large balance to 2 decimal places', () => {
      expect(formatBalance(1234.56789, 'XLM')).toBe('1234.57 XLM');
    });

    it('formats a small balance (< 0.001) to 7 decimal places', () => {
      const result = formatBalance(0.0000001, 'XLM');
      expect(result).toBe('0.0000001 XLM');
    });

    it('formats a medium balance (0.001–1) to 4 decimal places', () => {
      const result = formatBalance(0.005, 'XLM');
      expect(result).toBe('0.0050 XLM');
    });

    it('accepts a string balance', () => {
      const result = formatBalance('42.5', 'XLM');
      expect(result).toContain('XLM');
    });

    it('returns 0.0000000 for NaN input', () => {
      const result = formatBalance('not-a-number', 'XLM');
      expect(result).toBe('0.0000000 XLM');
    });

    it('uses XLM as the default currency', () => {
      expect(formatBalance(10)).toContain('XLM');
    });
  });

  // ---------------------------------------------------------------------------
  describe('getNetworkInfo', () => {
    it('marks a valid address as valid', () => {
      const info = getNetworkInfo(VALID_ADDRESS);
      expect(info.isValid).toBe(true);
    });

    it('marks an invalid address as invalid', () => {
      const info = getNetworkInfo('INVALID');
      expect(info.isValid).toBe(false);
    });

    it('returns a network property of mainnet or testnet', () => {
      const info = getNetworkInfo(VALID_ADDRESS);
      expect(['mainnet', 'testnet']).toContain(info.network);
    });
  });
});

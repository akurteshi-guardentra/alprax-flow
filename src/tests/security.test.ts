import { describe, it, expect } from 'vitest';
import { sanitize, validate, rateLimiter } from '../lib/security';

describe('Security Utils', () => {
  describe('sanitize', () => {
    it('should sanitize HTML input', () => {
      const malicious = '<script>alert("xss")</script>';
      const sanitized = sanitize.html(malicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    it('should sanitize SQL input', () => {
      const malicious = "'; DROP TABLE users; --";
      const sanitized = sanitize.sql(malicious);
      expect(sanitized).not.toContain("'");
      expect(sanitized).not.toContain('--');
    });
  });

  describe('validate', () => {
    it('should validate email format', () => {
      expect(validate.email('test@example.com')).toBe(true);
      expect(validate.email('invalid-email')).toBe(false);
    });

    it('should validate stellar address', () => {
      const validAddress = 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A';
      expect(validate.stellarAddress(validAddress)).toBe(true);
      expect(validate.stellarAddress('invalid')).toBe(false);
    });

    it('should validate password strength', () => {
      const strong = validate.password('SecurePass123!');
      expect(strong.isValid).toBe(true);
      
      const weak = validate.password('weak');
      expect(weak.isValid).toBe(false);
      expect(weak.errors.length).toBeGreaterThan(0);
    });
  });

  describe('rateLimiter', () => {
    it('should allow requests within limits', () => {
      const key = 'test-user';
      expect(rateLimiter.isAllowed(key, 5, 60000)).toBe(true);
      expect(rateLimiter.isAllowed(key, 5, 60000)).toBe(true);
    });

    it('should block requests exceeding limits', () => {
      const key = 'test-user-2';
      for (let i = 0; i < 5; i++) {
        rateLimiter.isAllowed(key, 5, 60000);
      }
      expect(rateLimiter.isAllowed(key, 5, 60000)).toBe(false);
    });
  });
});
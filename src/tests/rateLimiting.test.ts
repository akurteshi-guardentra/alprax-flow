import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the logger that rate-limiting imports to prevent log noise and avoid
// real logger initialisation side-effects in tests.
vi.mock('@/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}));

import { rateLimiter, RATE_LIMITS } from '../utils/rate-limiting';

describe('rate-limiting utilities', () => {
  // ---------------------------------------------------------------------------
  describe('rateLimiter.isAllowed', () => {
    it('allows the first request for a new key', () => {
      const key = `test-allow-${Date.now()}`;
      const allowed = rateLimiter.isAllowed(key, RATE_LIMITS.LOGIN);
      expect(allowed).toBe(true);
    });

    it('allows requests up to the configured limit', () => {
      const key = `test-within-limit-${Date.now()}`;
      const { maxRequests } = RATE_LIMITS.LOGIN; // 5 per 15 min

      for (let i = 0; i < maxRequests; i++) {
        expect(rateLimiter.isAllowed(key, RATE_LIMITS.LOGIN)).toBe(true);
      }
    });

    it('blocks a request that exceeds the limit', () => {
      const key = `test-exceed-${Date.now()}`;
      const { maxRequests } = RATE_LIMITS.LOGIN;

      for (let i = 0; i < maxRequests; i++) {
        rateLimiter.isAllowed(key, RATE_LIMITS.LOGIN);
      }

      expect(rateLimiter.isAllowed(key, RATE_LIMITS.LOGIN)).toBe(false);
    });

    it('allows a new request once the window has expired', async () => {
      // Use a very short window so we can advance timers
      const config = { maxRequests: 2, windowMs: 50 };
      const key = `test-expire-${Date.now()}`;

      rateLimiter.isAllowed(key, config);
      rateLimiter.isAllowed(key, config);
      // Third request should be blocked
      expect(rateLimiter.isAllowed(key, config)).toBe(false);

      // Advance time beyond the window
      await new Promise((r) => setTimeout(r, 100));

      // Now the window has reset – request should be allowed again
      expect(rateLimiter.isAllowed(key, config)).toBe(true);
    });

    it('tracks different keys independently', () => {
      const key1 = `independent-a-${Date.now()}`;
      const key2 = `independent-b-${Date.now()}`;

      const config = { maxRequests: 1, windowMs: 60_000 };

      rateLimiter.isAllowed(key1, config);
      // key1 is now exhausted, key2 should still be allowed
      expect(rateLimiter.isAllowed(key1, config)).toBe(false);
      expect(rateLimiter.isAllowed(key2, config)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  describe('rateLimiter.cleanup', () => {
    it('does not throw when called', () => {
      expect(() => rateLimiter.cleanup()).not.toThrow();
    });

    it('removes expired entries (older than 24 h)', async () => {
      vi.useFakeTimers();

      const key = `cleanup-test-${Date.now()}`;
      rateLimiter.isAllowed(key, { maxRequests: 1, windowMs: 1_000 });

      // Advance time by more than 24 hours
      vi.advanceTimersByTime(25 * 60 * 60 * 1_000);
      rateLimiter.cleanup();

      // After cleanup, the rate-limiter should have forgotten this key and
      // allow a new request (no stale entry to block it)
      vi.useRealTimers();
      expect(rateLimiter.isAllowed(key, { maxRequests: 1, windowMs: 60_000 })).toBe(
        true
      );
    });
  });

  // ---------------------------------------------------------------------------
  describe('RATE_LIMITS constants', () => {
    it('defines a PAYMENT limit', () => {
      expect(RATE_LIMITS.PAYMENT).toBeDefined();
      expect(RATE_LIMITS.PAYMENT.maxRequests).toBeGreaterThan(0);
      expect(RATE_LIMITS.PAYMENT.windowMs).toBeGreaterThan(0);
    });

    it('defines a TRANSACTION limit', () => {
      expect(RATE_LIMITS.TRANSACTION).toBeDefined();
    });

    it('defines a LOGIN limit', () => {
      expect(RATE_LIMITS.LOGIN).toBeDefined();
      // Stricter than PAYMENT – fewer requests per window
      expect(RATE_LIMITS.LOGIN.maxRequests).toBeLessThanOrEqual(
        RATE_LIMITS.PAYMENT.maxRequests
      );
    });

    it('defines a KYC_UPLOAD limit', () => {
      expect(RATE_LIMITS.KYC_UPLOAD).toBeDefined();
    });

    it('defines an API_GENERAL limit', () => {
      expect(RATE_LIMITS.API_GENERAL).toBeDefined();
      expect(RATE_LIMITS.API_GENERAL.maxRequests).toBeGreaterThan(
        RATE_LIMITS.PAYMENT.maxRequests
      );
    });
  });
});

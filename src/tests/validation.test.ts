import { describe, it, expect, beforeEach } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  stellarAddressSchema,
  amountSchema,
  memoSchema,
  loginFormSchema,
  signupFormSchema,
  paymentFormSchema,
  profileFormSchema,
  sanitizeString,
  sanitizeNumber,
  sanitizeEmail,
  sanitizePhoneNumber,
  formRateLimiter,
  formatValidationErrors,
  safeValidate
} from '../utils/validation';
import { z } from 'zod';

const VALID_STELLAR_ADDRESS = 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A';

describe('Validation utilities', () => {
  // ---------------------------------------------------------------------------
  describe('emailSchema', () => {
    it('accepts a valid email', () => {
      expect(() => emailSchema.parse('user@example.com')).not.toThrow();
    });

    it('rejects a missing @', () => {
      expect(() => emailSchema.parse('notanemail')).toThrow();
    });

    it('rejects an empty string', () => {
      expect(() => emailSchema.parse('')).toThrow();
    });

    it('rejects an email longer than 254 characters', () => {
      const longLocal = 'a'.repeat(250);
      expect(() => emailSchema.parse(`${longLocal}@x.com`)).toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  describe('passwordSchema', () => {
    it('accepts a strong password', () => {
      expect(() => passwordSchema.parse('SecurePass123!')).not.toThrow();
    });

    it('rejects a password shorter than 8 characters', () => {
      expect(() => passwordSchema.parse('Ab1!')).toThrow();
    });

    it('rejects a password without an uppercase letter', () => {
      expect(() => passwordSchema.parse('lowercase1!')).toThrow();
    });

    it('rejects a password without a lowercase letter', () => {
      expect(() => passwordSchema.parse('UPPERCASE1!')).toThrow();
    });

    it('rejects a password without a number', () => {
      expect(() => passwordSchema.parse('NoNumbers!')).toThrow();
    });

    it('rejects a password without a special character', () => {
      expect(() => passwordSchema.parse('NoSpecial1')).toThrow();
    });

    it('rejects a password longer than 128 characters', () => {
      const long = 'Aa1!' + 'x'.repeat(130);
      expect(() => passwordSchema.parse(long)).toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  describe('stellarAddressSchema', () => {
    it('accepts a valid 56-char Stellar address starting with G', () => {
      expect(() => stellarAddressSchema.parse(VALID_STELLAR_ADDRESS)).not.toThrow();
    });

    it('rejects an address shorter than 56 chars', () => {
      expect(() => stellarAddressSchema.parse('GSHORT')).toThrow();
    });

    it('rejects an address not starting with G', () => {
      const badAddress = 'S' + VALID_STELLAR_ADDRESS.slice(1);
      expect(() => stellarAddressSchema.parse(badAddress)).toThrow();
    });

    it('rejects an address with invalid base32 characters', () => {
      const badAddress = 'G' + '0'.repeat(55); // '0' is not in base32 A-Z2-7
      expect(() => stellarAddressSchema.parse(badAddress)).toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  describe('amountSchema', () => {
    it('accepts a positive number', () => {
      expect(() => amountSchema.parse(100)).not.toThrow();
    });

    it('accepts a small fractional amount with up to 7 decimal places', () => {
      expect(() => amountSchema.parse(0.0000001)).not.toThrow();
    });

    it('rejects zero', () => {
      expect(() => amountSchema.parse(0)).toThrow();
    });

    it('rejects negative numbers', () => {
      expect(() => amountSchema.parse(-10)).toThrow();
    });

    it('rejects amounts above the maximum', () => {
      expect(() => amountSchema.parse(1_000_001)).toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  describe('memoSchema', () => {
    it('accepts an empty/undefined memo', () => {
      expect(() => memoSchema.parse(undefined)).not.toThrow();
      expect(() => memoSchema.parse('')).not.toThrow();
    });

    it('accepts a memo of exactly 28 characters', () => {
      expect(() => memoSchema.parse('a'.repeat(28))).not.toThrow();
    });

    it('rejects a memo longer than 28 characters', () => {
      expect(() => memoSchema.parse('a'.repeat(29))).toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  describe('loginFormSchema', () => {
    it('accepts valid credentials', () => {
      expect(() =>
        loginFormSchema.parse({ email: 'a@b.com', password: 'any' })
      ).not.toThrow();
    });

    it('rejects invalid email', () => {
      expect(() =>
        loginFormSchema.parse({ email: 'bad', password: 'pw' })
      ).toThrow();
    });

    it('rejects empty password', () => {
      expect(() =>
        loginFormSchema.parse({ email: 'a@b.com', password: '' })
      ).toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  describe('signupFormSchema', () => {
    const validSignup = {
      email: 'user@example.com',
      password: 'Secure123!',
      confirmPassword: 'Secure123!'
    };

    it('accepts valid signup data', () => {
      expect(() => signupFormSchema.parse(validSignup)).not.toThrow();
    });

    it('rejects mismatched passwords', () => {
      expect(() =>
        signupFormSchema.parse({ ...validSignup, confirmPassword: 'DifferentPass1!' })
      ).toThrow();
    });

    it('rejects a weak password', () => {
      expect(() =>
        signupFormSchema.parse({ ...validSignup, password: 'weak', confirmPassword: 'weak' })
      ).toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  describe('paymentFormSchema', () => {
    const validPayment = {
      recipientAddress: VALID_STELLAR_ADDRESS,
      amount: 50,
      recipientName: 'Jane Doe'
    };

    it('accepts valid payment data', () => {
      expect(() => paymentFormSchema.parse(validPayment)).not.toThrow();
    });

    it('rejects an invalid Stellar address', () => {
      expect(() =>
        paymentFormSchema.parse({ ...validPayment, recipientAddress: 'BAD' })
      ).toThrow();
    });

    it('rejects a zero amount', () => {
      expect(() =>
        paymentFormSchema.parse({ ...validPayment, amount: 0 })
      ).toThrow();
    });

    it('rejects a missing recipient name', () => {
      expect(() =>
        paymentFormSchema.parse({ ...validPayment, recipientName: '' })
      ).toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  describe('profileFormSchema', () => {
    it('accepts valid profile data', () => {
      expect(() =>
        profileFormSchema.parse({
          fullName: 'Jane Doe',
          country: 'US',
          phoneNumber: '+12345678901'
        })
      ).not.toThrow();
    });

    it('rejects a single-character full name', () => {
      expect(() =>
        profileFormSchema.parse({ fullName: 'J', country: 'US' })
      ).toThrow();
    });

    it('rejects an invalid country code', () => {
      expect(() =>
        profileFormSchema.parse({ fullName: 'Jane Doe', country: 'USA' })
      ).toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  describe('sanitizeString', () => {
    it('removes <script> tags', () => {
      const result = sanitizeString('<script>alert("xss")</script>hello');
      expect(result).not.toContain('<script>');
      expect(result).toContain('hello');
    });

    it('removes javascript: protocol', () => {
      const result = sanitizeString('javascript:void(0)');
      expect(result).not.toContain('javascript:');
    });

    it('removes inline event handlers', () => {
      const result = sanitizeString('onclick=foo()');
      expect(result).not.toContain('onclick=');
    });

    it('trims whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('limits output to 1000 characters', () => {
      const long = 'a'.repeat(1500);
      expect(sanitizeString(long).length).toBe(1000);
    });
  });

  // ---------------------------------------------------------------------------
  describe('sanitizeNumber', () => {
    it('parses a numeric string', () => {
      expect(sanitizeNumber('42.5')).toBe(42.5);
    });

    it('strips non-numeric characters', () => {
      expect(sanitizeNumber('$1,000.00')).toBe(1000);
    });

    it('passes through a plain number', () => {
      expect(sanitizeNumber(99)).toBe(99);
    });

    it('returns null for non-numeric input', () => {
      expect(sanitizeNumber('abc')).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  describe('sanitizeEmail', () => {
    it('lowercases and trims the email', () => {
      expect(sanitizeEmail('  User@EXAMPLE.COM  ')).toBe('user@example.com');
    });
  });

  // ---------------------------------------------------------------------------
  describe('sanitizePhoneNumber', () => {
    it('strips non-phone characters', () => {
      expect(sanitizePhoneNumber('+1 (234) 567-8901')).toBe('+1 (234) 567-8901');
    });

    it('removes letters', () => {
      const result = sanitizePhoneNumber('abc+1234');
      expect(result).not.toContain('a');
      expect(result).toContain('+');
    });
  });

  // ---------------------------------------------------------------------------
  describe('formRateLimiter', () => {
    it('allows submissions within the limit', () => {
      const id = `rate-limiter-test-${Date.now()}`;
      expect(formRateLimiter.canSubmit(id)).toBe(true);
    });

    it('blocks submissions after the limit is reached', () => {
      const id = `rate-limiter-block-${Date.now()}`;
      // Default limit is 5 within 1 minute
      for (let i = 0; i < 5; i++) {
        formRateLimiter.canSubmit(id);
      }
      expect(formRateLimiter.canSubmit(id)).toBe(false);
    });

    it('returns 0 remaining time when submissions are below the limit', () => {
      const id = `rate-limiter-remaining-${Date.now()}`;
      expect(formRateLimiter.getRemainingTime(id)).toBe(0);
    });

    it('returns positive remaining time when limit is hit', () => {
      const id = `rate-limiter-remaining-hit-${Date.now()}`;
      for (let i = 0; i < 5; i++) {
        formRateLimiter.canSubmit(id);
      }
      expect(formRateLimiter.getRemainingTime(id)).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  describe('formatValidationErrors', () => {
    it('formats Zod errors into a flat key → message object', () => {
      const schema = z.object({ name: z.string().min(2), age: z.number() });
      const result = schema.safeParse({ name: 'x', age: 'bad' });

      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(typeof formatted).toBe('object');
        expect(Object.keys(formatted).length).toBeGreaterThan(0);
      }
    });
  });

  // ---------------------------------------------------------------------------
  describe('safeValidate', () => {
    const schema = z.object({ email: emailSchema });

    it('returns success with parsed data for valid input', () => {
      const result = safeValidate(schema, { email: 'a@b.com' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('a@b.com');
      }
    });

    it('returns failure with errors for invalid input', () => {
      const result = safeValidate(schema, { email: 'bad' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(Object.keys(result.errors).length).toBeGreaterThan(0);
      }
    });

    it('returns failure gracefully for non-object input', () => {
      const result = safeValidate(schema, null);
      expect(result.success).toBe(false);
    });
  });
});

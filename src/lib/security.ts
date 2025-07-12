/**
 * Security utilities for production applications
 * Provides input sanitization, validation, and security headers
 */

/**
 * Input sanitization utilities
 */
export const sanitize = {
  /**
   * Sanitize HTML input to prevent XSS attacks
   */
  html: (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Sanitize SQL input to prevent injection
   */
  sql: (input: string): string => {
    return input
      .replace(/['";\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  },

  /**
   * Sanitize email input
   */
  email: (input: string): string => {
    return input.toLowerCase().trim();
  },

  /**
   * Sanitize phone number input
   */
  phone: (input: string): string => {
    return input.replace(/[^\d+\-\s()]/g, '');
  }
};

/**
 * Validation utilities
 */
export const validate = {
  /**
   * Validate email format
   */
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   */
  password: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate Stellar address format
   */
  stellarAddress: (address: string): boolean => {
    // Stellar public keys start with 'G' and are 56 characters long
    const stellarRegex = /^G[A-Z2-7]{55}$/;
    return stellarRegex.test(address);
  },

  /**
   * Validate amount for transactions
   */
  amount: (amount: string | number): { isValid: boolean; error?: string } => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return { isValid: false, error: 'Amount must be a positive number' };
    }
    
    if (numAmount > 10000000) {
      return { isValid: false, error: 'Amount exceeds maximum limit' };
    }
    
    // Check for reasonable decimal places (max 7 for Stellar)
    const decimalPlaces = amount.toString().split('.')[1]?.length || 0;
    if (decimalPlaces > 7) {
      return { isValid: false, error: 'Amount has too many decimal places' };
    }
    
    return { isValid: true };
  }
};

/**
 * Rate limiting utilities
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * Check if action is allowed based on rate limit
   */
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key);

    if (!userAttempts || now > userAttempts.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userAttempts.count >= maxAttempts) {
      return false;
    }

    userAttempts.count++;
    return true;
  }

  /**
   * Get remaining attempts for a key
   */
  getRemainingAttempts(key: string, maxAttempts: number): number {
    const userAttempts = this.attempts.get(key);
    if (!userAttempts) return maxAttempts;
    return Math.max(0, maxAttempts - userAttempts.count);
  }

  /**
   * Reset attempts for a key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Security headers for enhanced protection
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

/**
 * Content Security Policy for XSS protection
 */
export const generateCSP = (nonce?: string): string => {
  const baseCSP = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'connect-src': ["'self'", 'https://api.stellar.org', 'https://*.supabase.co'],
    'frame-src': ["'self'", 'https://js.stripe.com'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  };

  if (nonce) {
    baseCSP['script-src'].push(`'nonce-${nonce}'`);
  }

  return Object.entries(baseCSP)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};
// Production-ready input validation and sanitization
import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .max(254, 'Email is too long');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const stellarAddressSchema = z.string()
  .min(56, 'Stellar address must be 56 characters')
  .max(56, 'Stellar address must be 56 characters')
  .regex(/^G[A-Z2-7]{55}$/, 'Invalid Stellar address format');

export const amountSchema = z.number()
  .positive('Amount must be positive')
  .max(1000000, 'Amount is too large')
  .refine((val) => Number.isFinite(val), 'Amount must be a valid number')
  .refine((val) => Number(val.toFixed(7)) === val, 'Amount has too many decimal places');

export const memoSchema = z.string()
  .max(28, 'Memo cannot exceed 28 characters')
  .optional();

// Form validation schemas
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const signupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const paymentFormSchema = z.object({
  recipientAddress: stellarAddressSchema,
  amount: amountSchema,
  memo: memoSchema,
  recipientName: z.string()
    .min(1, 'Recipient name is required')
    .max(100, 'Recipient name is too long')
    .regex(/^[a-zA-Z0-9\s\-\.]+$/, 'Recipient name contains invalid characters')
});

export const profileFormSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long')
    .regex(/^[a-zA-Z\s\-\.]+$/, 'Full name contains invalid characters'),
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  country: z.string()
    .min(2, 'Please select a country')
    .max(2, 'Invalid country code'),
  preferredLanguage: z.string()
    .min(2, 'Please select a language')
    .max(5, 'Invalid language code')
    .optional()
});

// Input sanitization functions
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

export const sanitizeNumber = (input: string | number): number | null => {
  const num = typeof input === 'string' ? parseFloat(input.replace(/[^\d.-]/g, '')) : input;
  return Number.isFinite(num) ? num : null;
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d+\-\s\(\)]/g, '').trim();
};

// Rate limiting for forms
class FormRateLimiter {
  private submissions: Map<string, number[]> = new Map();
  private readonly maxSubmissions = 5;
  private readonly timeWindow = 60000; // 1 minute

  canSubmit(identifier: string): boolean {
    const now = Date.now();
    const submissions = this.submissions.get(identifier) || [];
    
    // Remove old submissions outside the time window
    const recentSubmissions = submissions.filter(time => now - time < this.timeWindow);
    
    if (recentSubmissions.length >= this.maxSubmissions) {
      return false;
    }
    
    // Add current submission
    recentSubmissions.push(now);
    this.submissions.set(identifier, recentSubmissions);
    
    return true;
  }

  getRemainingTime(identifier: string): number {
    const submissions = this.submissions.get(identifier) || [];
    if (submissions.length < this.maxSubmissions) return 0;
    
    const oldestSubmission = Math.min(...submissions);
    const remainingTime = this.timeWindow - (Date.now() - oldestSubmission);
    
    return Math.max(0, Math.ceil(remainingTime / 1000));
  }
}

export const formRateLimiter = new FormRateLimiter();

// Validation error formatting
export const formatValidationErrors = (error: z.ZodError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });
  
  return formattedErrors;
};

// Safe validation wrapper
export const safeValidate = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: formatValidationErrors(result.error) };
    }
  } catch (error) {
    return { 
      success: false, 
      errors: { general: 'Validation failed. Please check your input.' } 
    };
  }
};
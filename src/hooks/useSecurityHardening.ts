import { useState, useCallback, useRef } from 'react';
import CryptoJS from 'crypto-js';

interface SecurityConfig {
  enableCSP: boolean;
  enableEncryption: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

interface SecurityState {
  isSessionValid: boolean;
  loginAttempts: number;
  lastActivity: number;
  isLocked: boolean;
  lockoutUntil?: number;
}

const DEFAULT_CONFIG: SecurityConfig = {
  enableCSP: true,
  enableEncryption: true,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000  // 15 minutes
};

/**
 * Security hardening hook for authentication and data protection
 */
export function useSecurityHardening(config: Partial<SecurityConfig> = {}) {
  const securityConfig = { ...DEFAULT_CONFIG, ...config };
  const [securityState, setSecurityState] = useState<SecurityState>({
    isSessionValid: true,
    loginAttempts: 0,
    lastActivity: Date.now(),
    isLocked: false
  });
  
  const sessionTimeoutRef = useRef<NodeJS.Timeout>();
  const activityListeners = useRef<(() => void)[]>([]);

  const updateActivity = useCallback(() => {
    const now = Date.now();
    setSecurityState(prev => ({
      ...prev,
      lastActivity: now,
      isSessionValid: true
    }));

    // Reset session timeout
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    sessionTimeoutRef.current = setTimeout(() => {
      setSecurityState(prev => ({
        ...prev,
        isSessionValid: false
      }));
    }, securityConfig.sessionTimeout);
  }, [securityConfig.sessionTimeout]);

  const trackLoginAttempt = useCallback((successful: boolean) => {
    if (successful) {
      setSecurityState(prev => ({
        ...prev,
        loginAttempts: 0,
        isLocked: false,
        lockoutUntil: undefined
      }));
      updateActivity();
    } else {
      setSecurityState(prev => {
        const newAttempts = prev.loginAttempts + 1;
        const shouldLock = newAttempts >= securityConfig.maxLoginAttempts;
        
        return {
          ...prev,
          loginAttempts: newAttempts,
          isLocked: shouldLock,
          lockoutUntil: shouldLock 
            ? Date.now() + securityConfig.lockoutDuration 
            : undefined
        };
      });
    }
  }, [securityConfig.maxLoginAttempts, securityConfig.lockoutDuration, updateActivity]);

  const encryptData = useCallback((data: string, key?: string): string => {
    if (!securityConfig.enableEncryption) return data;
    
    const encryptionKey = key || 'default-key'; // In production, use proper key management
    return CryptoJS.AES.encrypt(data, encryptionKey).toString();
  }, [securityConfig.enableEncryption]);

  const decryptData = useCallback((encryptedData: string, key?: string): string => {
    if (!securityConfig.enableEncryption) return encryptedData;
    
    try {
      const decryptionKey = key || 'default-key';
      const bytes = CryptoJS.AES.decrypt(encryptedData, decryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }, [securityConfig.enableEncryption]);

  const sanitizeInput = useCallback((input: string): string => {
    // Basic XSS protection
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }, []);

  const validateCSP = useCallback(() => {
    if (!securityConfig.enableCSP) return true;

    // Check if CSP headers are properly configured
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const hasCSP = cspMeta !== null;

    if (!hasCSP) {
      console.warn('Content Security Policy not detected. This may pose security risks.');
    }

    return hasCSP;
  }, [securityConfig.enableCSP]);

  const checkAccountLockout = useCallback((): boolean => {
    if (!securityState.isLocked) return false;
    
    if (securityState.lockoutUntil && Date.now() >= securityState.lockoutUntil) {
      setSecurityState(prev => ({
        ...prev,
        isLocked: false,
        lockoutUntil: undefined,
        loginAttempts: 0
      }));
      return false;
    }

    return securityState.isLocked;
  }, [securityState.isLocked, securityState.lockoutUntil]);

  const isSessionExpired = useCallback((): boolean => {
    const now = Date.now();
    return now - securityState.lastActivity > securityConfig.sessionTimeout;
  }, [securityState.lastActivity, securityConfig.sessionTimeout]);

  const setupSecurityHeaders = useCallback(() => {
    // This would typically be done on the server side
    // Here we can only warn about missing security measures
    
    const securityChecks = {
      https: location.protocol === 'https:',
      csp: validateCSP(),
      referrerPolicy: document.querySelector('meta[name="referrer"]') !== null
    };

    const issues = Object.entries(securityChecks)
      .filter(([_, passed]) => !passed)
      .map(([check]) => check);

    if (issues.length > 0) {
      console.warn('Security issues detected:', issues);
    }

    return securityChecks;
  }, [validateCSP]);

  const getLockoutTimeRemaining = useCallback((): number => {
    if (!securityState.isLocked || !securityState.lockoutUntil) return 0;
    
    const remaining = securityState.lockoutUntil - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000)); // Convert to seconds
  }, [securityState.isLocked, securityState.lockoutUntil]);

  return {
    // State
    isSessionValid: securityState.isSessionValid && !isSessionExpired(),
    isAccountLocked: checkAccountLockout(),
    loginAttempts: securityState.loginAttempts,
    lockoutTimeRemaining: getLockoutTimeRemaining(),
    
    // Methods
    updateActivity,
    trackLoginAttempt,
    encryptData,
    decryptData,
    sanitizeInput,
    setupSecurityHeaders,
    
    // Validation
    validateCSP,
    isSessionExpired,
    checkAccountLockout
  };
}
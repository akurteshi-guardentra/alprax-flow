import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Clock } from 'lucide-react';
import { rateLimiter, validate, sanitize } from '@/lib/security';
import { toast } from 'sonner';

interface SecureFormProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  onSubmit: (data: any) => Promise<void>;
  rateLimitKey: string;
  maxAttempts?: number;
  windowMs?: number;
  showSecurityBadge?: boolean;
  validateOnSubmit?: boolean;
}

export const SecureForm: React.FC<SecureFormProps> = ({
  children,
  title,
  description,
  onSubmit,
  rateLimitKey,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000, // 15 minutes
  showSecurityBadge = true,
  validateOnSubmit = true
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(maxAttempts);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [resetTime, setResetTime] = useState<Date | null>(null);

  useEffect(() => {
    // Check current rate limit status
    const remaining = rateLimiter.getRemainingAttempts(rateLimitKey, maxAttempts);
    setRemainingAttempts(remaining);
    setIsRateLimited(remaining <= 0);
  }, [rateLimitKey, maxAttempts]);

  useEffect(() => {
    if (isRateLimited && !resetTime) {
      const resetAt = new Date(Date.now() + windowMs);
      setResetTime(resetAt);
      
      // Set up timer to reset rate limit
      const timeout = setTimeout(() => {
        setIsRateLimited(false);
        setRemainingAttempts(maxAttempts);
        setResetTime(null);
        rateLimiter.reset(rateLimitKey);
      }, windowMs);

      return () => clearTimeout(timeout);
    }
  }, [isRateLimited, resetTime, windowMs, maxAttempts, rateLimitKey]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Check rate limiting
    if (!rateLimiter.isAllowed(rateLimitKey, maxAttempts, windowMs)) {
      setIsRateLimited(true);
      toast.error('Too many attempts. Please try again later.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const data: Record<string, any> = {};

      // Sanitize and validate form data
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          // Apply appropriate sanitization based on field type
          if (key.includes('email')) {
            data[key] = sanitize.email(value);
            if (validateOnSubmit && !validate.email(data[key])) {
              toast.error(`Invalid ${key} format`);
              return;
            }
          } else if (key.includes('phone')) {
            data[key] = sanitize.phone(value);
          } else if (key.includes('password')) {
            data[key] = value; // Don't sanitize passwords, but validate
            if (validateOnSubmit) {
              const validation = validate.password(value);
              if (!validation.isValid) {
                toast.error(validation.errors[0]);
                return;
              }
            }
          } else if (key.includes('amount')) {
            data[key] = value;
            if (validateOnSubmit) {
              const validation = validate.amount(value);
              if (!validation.isValid) {
                toast.error(validation.error || 'Invalid amount');
                return;
              }
            }
          } else {
            // General HTML sanitization for other fields
            data[key] = sanitize.html(value);
          }
        } else {
          data[key] = value;
        }
      }

      await onSubmit(data);
      
      // Success - reset rate limiting
      rateLimiter.reset(rateLimitKey);
      setRemainingAttempts(maxAttempts);
      setIsRateLimited(false);
      
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Update remaining attempts
      const remaining = rateLimiter.getRemainingAttempts(rateLimitKey, maxAttempts);
      setRemainingAttempts(remaining);
      
      if (remaining <= 0) {
        setIsRateLimited(true);
      }
      
      toast.error(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeRemaining = (resetTime: Date): string => {
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();
    const minutes = Math.ceil(diff / 60000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <Card className="w-full">
      {(title || description || showSecurityBadge) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            {title && <CardTitle>{title}</CardTitle>}
            {showSecurityBadge && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Secure
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {isRateLimited && resetTime && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Too many attempts. Please try again in {formatTimeRemaining(resetTime)}.
            </AlertDescription>
          </Alert>
        )}
        
        {!isRateLimited && remainingAttempts <= 2 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before temporary lockout.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              // Disable form elements if rate limited or submitting
              return React.cloneElement(child, {
                disabled: child.props.disabled || isRateLimited || isSubmitting
              } as any);
            }
            return child;
          })}
        </form>
      </CardContent>
    </Card>
  );
};
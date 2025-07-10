import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface AccessibleFormFieldProps {
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
  isTextarea?: boolean;
  className?: string;
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

export const AccessibleFormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  AccessibleFormFieldProps
>(({ label, error, description, required, isTextarea, className, id, ...props }, ref) => {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;

  const inputProps = {
    id: fieldId,
    'aria-describedby': cn(
      description && descriptionId,
      error && errorId
    ),
    'aria-invalid': !!error,
    'aria-required': required,
    className: cn(
      'transition-colors focus:ring-2 focus:ring-primary/20',
      error && 'border-red-500 focus:border-red-500',
      className
    ),
    placeholder: props.placeholder,
    value: props.value,
    onChange: props.onChange,
    disabled: props.disabled
  };

  const textareaProps = {
    ...inputProps,
    onChange: props.onChange as React.ChangeEventHandler<HTMLTextAreaElement>
  };

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={fieldId}
        className={cn(
          'text-sm font-medium',
          required && "after:content-['*'] after:ml-0.5 after:text-red-500"
        )}
      >
        {label}
      </Label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {isTextarea ? (
        <Textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          {...textareaProps}
        />
      ) : (
        <Input
          ref={ref as React.Ref<HTMLInputElement>}
          {...inputProps}
        />
      )}
      
      {error && (
        <div
          id={errorId}
          className="flex items-center gap-2 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

AccessibleFormField.displayName = 'AccessibleFormField';

interface AccessibleFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

export const AccessibleForm = forwardRef<HTMLFormElement, AccessibleFormProps>(
  ({ children, onSubmit, className, ...props }, ref) => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(e);
    };

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={cn('space-y-4', className)}
        noValidate
        {...props}
      >
        {children}
      </form>
    );
  }
);

AccessibleForm.displayName = 'AccessibleForm';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ loading, loadingText, children, disabled, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        className={className}
        {...props}
      >
        {loading ? (loadingText || 'Loading...') : children}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';
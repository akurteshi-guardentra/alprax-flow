
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock setTimeout
vi.useFakeTimers();

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the reset password form correctly', () => {
    render(<ResetPasswordForm />);

    expect(screen.getByText('Reset password')).toBeInTheDocument();
    expect(screen.getByText('Enter your new password below')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset password' })).toBeInTheDocument();
  });

  it('validates password strength when typing', () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText('New Password');

    // Test weak password
    fireEvent.change(passwordInput, { target: { value: 'pass' } });
    expect(screen.getByText('Password is too weak')).toBeInTheDocument();

    // Test medium password
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    expect(screen.getByText('Password is good')).toBeInTheDocument();

    // Test strong password
    fireEvent.change(passwordInput, { target: { value: 'Password123!@#' } });
    expect(screen.getByText('Password is strong')).toBeInTheDocument();
  });

  it('validates password matching', () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    // Enter different passwords
    fireEvent.change(passwordInput, { target: { value: 'Password123!@#' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword' } });
    expect(screen.getByText('Passwords don\'t match')).toBeInTheDocument();

    // Enter matching passwords
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!@#' } });
    expect(screen.getByText('Passwords match')).toBeInTheDocument();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText('New Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find and click the eye icon
    const eyeButton = screen.getAllByRole('button')[0];
    fireEvent.click(eyeButton);

    // Password should now be visible
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide
    fireEvent.click(eyeButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows error when passwords don\'t match on submit', async () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Reset password' });

    // Enter different passwords
    fireEvent.change(passwordInput, { target: { value: 'Password123!@#' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword' } });

    // Submit the form
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Passwords don\'t match');
    });
  });

  it('shows error when password is too weak on submit', async () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Reset password' });

    // Enter weak but matching password
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } });

    // Submit the form
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please use a stronger password');
    });
  });

  it('submits the form successfully with valid data', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const navigate = vi.fn();
    
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => navigate,
      };
    });
    
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Reset password' });

    // Enter strong matching password
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!@#' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword123!@#' } });

    // Submit the form
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'StrongPassword123!@#',
      });
      expect(toast.success).toHaveBeenCalledWith('Password reset successful!');
    });

    // Fast-forward time to trigger navigation
    vi.advanceTimersByTime(2000);

    // Navigate should be called after timeout
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('shows success state after successful password reset', async () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Reset password' });

    // Enter strong matching password
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!@#' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword123!@#' } });

    // Submit the form
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password reset successful!')).toBeInTheDocument();
      expect(screen.getByText('Your password has been changed successfully.')).toBeInTheDocument();
    });
  });

  it('shows error when password reset fails', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    (supabase.auth.updateUser as any).mockResolvedValue({
      error: new Error('Failed to update password'),
    });

    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Reset password' });

    // Enter strong matching password
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!@#' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword123!@#' } });

    // Submit the form
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to reset your password');
    });
  });
});

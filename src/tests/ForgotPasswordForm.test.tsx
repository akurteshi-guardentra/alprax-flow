
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { toast } from 'sonner';

// Mock supabase client and toast
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ForgotPasswordForm', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the forgot password form correctly', () => {
    render(<ForgotPasswordForm onBackToLogin={() => {}} />);

    // Check for important elements
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByText('No worries, we\'ll send you reset instructions.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Reset password')).toBeInTheDocument();
    expect(screen.getByText('Back to login')).toBeInTheDocument();
  });

  it('calls onBackToLogin when back button is clicked', async () => {
    const mockBackToLogin = vi.fn();
    render(<ForgotPasswordForm onBackToLogin={mockBackToLogin} />);

    // Click back to login button
    fireEvent.click(screen.getByText('Back to login'));

    await waitFor(() => {
      expect(mockBackToLogin).toHaveBeenCalledTimes(1);
    });
  });

  it('submits the form with email when reset password button is clicked', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    render(<ForgotPasswordForm onBackToLogin={() => {}} />);

    // Fill out email field
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { 
      target: { value: 'test@example.com' } 
    });

    // Submit form
    fireEvent.click(screen.getByText('Reset password'));

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.any(String),
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Password reset link sent to your email');
    });
  });

  it('shows success state after successful form submission', async () => {
    render(<ForgotPasswordForm onBackToLogin={() => {}} />);

    // Fill out email field
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { 
      target: { value: 'test@example.com' } 
    });

    // Submit form
    fireEvent.click(screen.getByText('Reset password'));

    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument();
      expect(screen.getByText(/We've sent a password reset link to/)).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('try again')).toBeInTheDocument();
    });
  });

  it('shows error when password reset fails', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({
      error: new Error('Failed to send email'),
    });

    render(<ForgotPasswordForm onBackToLogin={() => {}} />);

    // Fill out email field
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { 
      target: { value: 'test@example.com' } 
    });

    // Submit form
    fireEvent.click(screen.getByText('Reset password'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to send password reset email');
    });
  });

  it('disables the submit button during form submission', async () => {
    // Mock a slow resolving promise to check loading state
    const { supabase } = await import('@/integrations/supabase/client');
    (supabase.auth.resetPasswordForEmail as any).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ error: null });
        }, 100);
      });
    });

    render(<ForgotPasswordForm onBackToLogin={() => {}} />);

    // Fill out email field
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { 
      target: { value: 'test@example.com' } 
    });

    // Submit form
    fireEvent.click(screen.getByText('Reset password'));

    // Check loading state
    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(screen.queryByText('Sending...')).not.toBeInTheDocument();
    });
  });
});

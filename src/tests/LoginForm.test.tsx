import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('LoginForm', () => {
  // Define the common props
  const defaultProps = {
    email: '',
    setEmail: vi.fn(),
    password: '',
    setPassword: vi.fn(),
    isLoading: false,
    onSubmit: vi.fn(),
    onFingerprint: vi.fn(),
    onNumberAuth: vi.fn(),
    onForgotPassword: vi.fn(),
  };

  it('renders the login form correctly', () => {
    render(
      <BrowserRouter>
        <LoginForm {...defaultProps} />
      </BrowserRouter>
    );

    // Check for important elements
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByText('Fingerprint')).toBeInTheDocument();
    expect(screen.getByText('Number')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', async () => {
    const mockSubmit = vi.fn(e => e.preventDefault());

    render(
      <BrowserRouter>
        <LoginForm {...defaultProps} onSubmit={mockSubmit} />
      </BrowserRouter>
    );

    // Fill out form
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onForgotPassword when forgot password link is clicked', async () => {
    const mockForgotPassword = vi.fn();

    render(
      <BrowserRouter>
        <LoginForm {...defaultProps} onForgotPassword={mockForgotPassword} />
      </BrowserRouter>
    );

    // Click forgot password link
    fireEvent.click(screen.getByText('Forgot password?'));

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledTimes(1);
    });
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <BrowserRouter>
        <LoginForm {...defaultProps} isLoading={true} />
      </BrowserRouter>
    );

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(
      <BrowserRouter>
        <LoginForm {...defaultProps} />
      </BrowserRouter>
    );

    // Initially password field should be of type "password"
    const passwordField = screen.getByPlaceholderText('Password');
    expect(passwordField).toHaveAttribute('type', 'password');

    // Click the eye icon to show password
    const eyeIcon = passwordField.parentElement?.querySelector('button');
    fireEvent.click(eyeIcon as HTMLElement);

    // Now password field should be of type "text"
    expect(passwordField).toHaveAttribute('type', 'text');

    // Click again to hide password
    fireEvent.click(eyeIcon as HTMLElement);

    // Password field should be of type "password" again
    expect(passwordField).toHaveAttribute('type', 'password');
  });

  it('calls onFingerprint when fingerprint button is clicked', async () => {
    const mockFingerprint = vi.fn();

    render(
      <BrowserRouter>
        <LoginForm {...defaultProps} onFingerprint={mockFingerprint} />
      </BrowserRouter>
    );

    // Click fingerprint button
    fireEvent.click(screen.getByText('Fingerprint'));

    await waitFor(() => {
      expect(mockFingerprint).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onNumberAuth when number button is clicked', async () => {
    const mockNumberAuth = vi.fn();

    render(
      <BrowserRouter>
        <LoginForm {...defaultProps} onNumberAuth={mockNumberAuth} />
      </BrowserRouter>
    );

    // Click number button
    fireEvent.click(screen.getByText('Number'));

    await waitFor(() => {
      expect(mockNumberAuth).toHaveBeenCalledTimes(1);
    });
  });
});

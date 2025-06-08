import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Login from '@/pages/Login';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';

// Mock components and hooks
vi.mock('@/components/auth/LoginForm', () => ({
  LoginForm: vi.fn(({ onSubmit, onForgotPassword }) => (
    <div>
      <h2>Mock Login Form</h2>
      <button onClick={() => onSubmit({ preventDefault: vi.fn() })}>Sign In</button>
      <button onClick={onForgotPassword}>Forgot Password</button>
    </div>
  ))
}));

vi.mock('@/components/auth/ForgotPasswordForm', () => ({
  ForgotPasswordForm: vi.fn(({ onBackToLogin }) => (
    <div>
      <h2>Mock Forgot Password Form</h2>
      <button onClick={onBackToLogin}>Back to Login</button>
    </div>
  ))
}));

vi.mock('@/components/auth/TwoFactorForm', () => ({
  TwoFactorForm: vi.fn(({ onSubmit }) => (
    <div>
      <h2>Mock Two Factor Form</h2>
      <button onClick={() => onSubmit({ preventDefault: vi.fn() })}>Verify</button>
    </div>
  ))
}));

vi.mock('@/components/auth/NumberAuthForm', () => ({
  NumberAuthForm: vi.fn(({ onSubmit, onBack }) => (
    <div>
      <h2>Mock Number Auth Form</h2>
      <button onClick={() => onSubmit('123456')}>Submit Number</button>
      <button onClick={onBack}>Back</button>
    </div>
  ))
}));

vi.mock('@/hooks/useLogin', () => ({
  useLogin: () => ({
    email: 'test@example.com',
    setEmail: vi.fn(),
    password: 'password123',
    setPassword: vi.fn(),
    isLoading: false,
    showTwoFactor: false,
    showNumberAuth: false,
    setShowNumberAuth: vi.fn(),
    twoFactorCode: '',
    setTwoFactorCode: vi.fn(),
    handleLogin: vi.fn(),
    handleFingerprint: vi.fn(),
    handleNumberAuth: vi.fn(),
    handleNumberSubmit: vi.fn(),
    handleTwoFactorSubmit: vi.fn()
  })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('Login Flow Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the login page with login form initially', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText('Mock Login Form')).toBeInTheDocument();
  });

  it('shows forgot password form when forgot password is clicked', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Click forgot password button
    fireEvent.click(screen.getByText('Forgot Password'));
    
    // ForgotPasswordForm should now be rendered
    await waitFor(() => {
      expect(screen.getByText('Mock Forgot Password Form')).toBeInTheDocument();
    });
  });

  it('returns to login form when back to login is clicked from forgot password', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Go to forgot password form
    fireEvent.click(screen.getByText('Forgot Password'));
    
    // Then go back to login
    fireEvent.click(screen.getByText('Back to Login'));
    
    // LoginForm should now be rendered again
    await waitFor(() => {
      expect(screen.getByText('Mock Login Form')).toBeInTheDocument();
    });
  });

  it('handles number auth flow correctly', async () => {
    // Update the mock to show number auth
    vi.mock('@/hooks/useLogin', () => ({
      useLogin: () => ({
        email: 'test@example.com',
        setEmail: vi.fn(),
        password: 'password123',
        setPassword: vi.fn(),
        isLoading: false,
        showTwoFactor: false,
        showNumberAuth: true,
        setShowNumberAuth: vi.fn(),
        twoFactorCode: '',
        setTwoFactorCode: vi.fn(),
        handleLogin: vi.fn(),
        handleFingerprint: vi.fn(),
        handleNumberAuth: vi.fn(),
        handleNumberSubmit: vi.fn(),
        handleTwoFactorSubmit: vi.fn()
      })
    }));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Should show the number auth form when showNumberAuth is true
    expect(screen.getByText('Mock Number Auth Form')).toBeInTheDocument();
  });

  it('handles 2FA flow correctly', async () => {
    // Update the mock to show 2FA
    vi.mock('@/hooks/useLogin', () => ({
      useLogin: () => ({
        email: 'test@example.com',
        setEmail: vi.fn(),
        password: 'password123',
        setPassword: vi.fn(),
        isLoading: false,
        showTwoFactor: true,
        showNumberAuth: false,
        setShowNumberAuth: vi.fn(),
        twoFactorCode: '',
        setTwoFactorCode: vi.fn(),
        handleLogin: vi.fn(),
        handleFingerprint: vi.fn(),
        handleNumberAuth: vi.fn(),
        handleNumberSubmit: vi.fn(),
        handleTwoFactorSubmit: vi.fn()
      })
    }));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Should show the 2FA form when showTwoFactor is true
    expect(screen.getByText('Mock Two Factor Form')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../services/AuthService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset singleton so each test gets a fresh instance
    (AuthService as any).instance = null;
    service = AuthService.getInstance();

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance on repeated calls', () => {
      const a = AuthService.getInstance();
      const b = AuthService.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('signIn', () => {
    it('should sign in successfully and normalise email', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = {
        expires_at: new Date(Date.now() + 3_600_000).toISOString()
      };

      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      const result = await service.signIn('Test@Example.COM ', 'Password123!');

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!'
      });
    });

    it('should handle invalid credentials error', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { toast } = await import('sonner');

      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      });

      const result = await service.signIn('test@example.com', 'wrong');

      expect(result.user).toBeNull();
      expect(result.error).not.toBeNull();
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid email or password')
      );
    });

    it('should handle email not confirmed error', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { toast } = await import('sonner');

      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email not confirmed' }
      });

      await service.signIn('test@example.com', 'Password123!');

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('email')
      );
    });

    it('should handle too many requests error', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { toast } = await import('sonner');

      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Too many requests' }
      });

      await service.signIn('test@example.com', 'Password123!');

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Too many login attempts')
      );
    });

    it('should handle a generic auth error', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { toast } = await import('sonner');

      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Some unknown error' }
      });

      await service.signIn('test@example.com', 'Password123!');

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Authentication failed')
      );
    });

    it('should handle unexpected network errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      (supabase.auth.signInWithPassword as any).mockRejectedValue(
        new Error('Network failure')
      );

      const result = await service.signIn('test@example.com', 'Password123!');

      expect(result.user).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should sign out successfully and clear storage', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      (supabase.auth.signOut as any).mockResolvedValue({ error: null });

      const result = await service.signOut();

      expect(result).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith('session_activity');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_preferences');
    });

    it('should return false when sign-out returns an error', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      (supabase.auth.signOut as any).mockResolvedValue({
        error: { message: 'Sign out failed' }
      });

      const result = await service.signOut();

      expect(result).toBe(false);
    });

    it('should return false when sign-out throws', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      (supabase.auth.signOut as any).mockRejectedValue(new Error('Network error'));

      const result = await service.signOut();

      expect(result).toBe(false);
    });
  });

  describe('refreshSession', () => {
    it('should return true when session is refreshed', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      (supabase.auth.refreshSession as any).mockResolvedValue({
        data: {
          session: { expires_at: new Date(Date.now() + 3_600_000).toISOString() }
        },
        error: null
      });

      const result = await service.refreshSession();

      expect(result).toBe(true);
    });

    it('should return false on refresh error', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      (supabase.auth.refreshSession as any).mockResolvedValue({
        data: { session: null },
        error: { message: 'Refresh failed' }
      });

      const result = await service.refreshSession();

      expect(result).toBe(false);
    });

    it('should return false when no session is returned', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      (supabase.auth.refreshSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      const result = await service.refreshSession();

      expect(result).toBe(false);
    });

    it('should return false when refresh throws', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      (supabase.auth.refreshSession as any).mockRejectedValue(
        new Error('Connection error')
      );

      const result = await service.refreshSession();

      expect(result).toBe(false);
    });
  });

  describe('validateSession', () => {
    it('should return true for a valid future session', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      (supabase.auth.getSession as any).mockResolvedValue({
        data: {
          session: { expires_at: new Date(Date.now() + 3_600_000).toISOString() }
        }
      });

      const result = await service.validateSession();

      expect(result).toBe(true);
    });

    it('should return false when no session exists', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null }
      });

      const result = await service.validateSession();

      expect(result).toBe(false);
    });

    it('should return false for an already-expired session', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      (supabase.auth.getSession as any).mockResolvedValue({
        data: {
          session: { expires_at: new Date(Date.now() - 3_600_000).toISOString() }
        }
      });

      const result = await service.validateSession();

      expect(result).toBe(false);
    });

    it('should return false when getSession throws', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      (supabase.auth.getSession as any).mockRejectedValue(
        new Error('Session error')
      );

      const result = await service.validateSession();

      expect(result).toBe(false);
    });
  });

  describe('updateSessionActivity', () => {
    it('should persist the current timestamp to localStorage', () => {
      const beforeCall = Date.now();
      service.updateSessionActivity();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'session_activity',
        expect.any(String)
      );

      const writtenValue = (localStorage.setItem as any).mock.calls.find(
        (c: string[]) => c[0] === 'session_activity'
      )?.[1];
      expect(Number(writtenValue)).toBeGreaterThanOrEqual(beforeCall);
    });
  });
});

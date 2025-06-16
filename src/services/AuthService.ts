
import { supabase } from '@/integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export class AuthService {
  private static instance: AuthService;
  private sessionTimeout: NodeJS.Timeout | null = null;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize auth service with session monitoring
   */
  public async initialize(): Promise<void> {
    try {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        this.startSessionTimeout();
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          this.startSessionTimeout();
          toast.success('Successfully signed in');
        } else if (event === 'SIGNED_OUT') {
          this.clearSessionTimeout();
          localStorage.removeItem('session_activity');
        } else if (event === 'TOKEN_REFRESHED') {
          this.startSessionTimeout();
          console.log('Token refreshed successfully');
        }
      });
    } catch (error) {
      console.error('Failed to initialize auth service:', error);
    }
  }

  /**
   * Sign in with enhanced error handling
   */
  public async signIn(email: string, password: string): Promise<{
    user: User | null;
    session: Session | null;
    error: AuthError | null;
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        this.handleAuthError(error);
        return { user: null, session: null, error };
      }

      if (data.session) {
        this.startSessionTimeout();
        this.updateSessionActivity();
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please try again.');
      return { user: null, session: null, error: error as AuthError };
    }
  }

  /**
   * Sign out with cleanup
   */
  public async signOut(): Promise<boolean> {
    try {
      this.clearSessionTimeout();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Failed to sign out properly');
        return false;
      }
      
      // Clear all auth-related data
      localStorage.removeItem('session_activity');
      localStorage.removeItem('user_preferences');
      
      toast.success('Successfully signed out');
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      return false;
    }
  }

  /**
   * Refresh session manually
   */
  public async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }
      
      if (data.session) {
        this.startSessionTimeout();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }

  /**
   * Check if user session is still valid
   */
  public async validateSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session && new Date(session.expires_at!) > new Date();
    } catch {
      return false;
    }
  }

  /**
   * Update session activity timestamp
   */
  public updateSessionActivity(): void {
    localStorage.setItem('session_activity', Date.now().toString());
  }

  /**
   * Start session timeout monitoring
   */
  private startSessionTimeout(): void {
    this.clearSessionTimeout();
    
    this.sessionTimeout = setTimeout(async () => {
      const lastActivity = localStorage.getItem('session_activity');
      const now = Date.now();
      
      if (lastActivity && (now - parseInt(lastActivity)) > this.SESSION_TIMEOUT) {
        toast.info('Session expired due to inactivity');
        await this.signOut();
        window.location.href = '/login';
      } else {
        // Refresh session if still active
        const refreshed = await this.refreshSession();
        if (!refreshed) {
          toast.error('Failed to refresh session');
          window.location.href = '/login';
        }
      }
    }, this.SESSION_TIMEOUT);
  }

  /**
   * Clear session timeout
   */
  private clearSessionTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
  }

  /**
   * Handle authentication errors with user-friendly messages
   */
  private handleAuthError(error: AuthError): void {
    switch (error.message) {
      case 'Invalid login credentials':
        toast.error('Invalid email or password. Please check your credentials.');
        break;
      case 'Email not confirmed':
        toast.error('Please check your email and click the verification link.');
        break;
      case 'Too many requests':
        toast.error('Too many login attempts. Please wait a moment and try again.');
        break;
      default:
        toast.error('Authentication failed. Please try again.');
        console.error('Auth error:', error);
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

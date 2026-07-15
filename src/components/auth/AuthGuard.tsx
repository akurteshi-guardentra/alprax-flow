
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { consumeNextOr, withNext } from '@/lib/next-redirect';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        const here = location.pathname + location.search;
        navigate(withNext(redirectTo, here));
      } else if (!requireAuth && user) {
        navigate(consumeNextOr('/dashboard'));
      }
    }
  }, [user, loading, requireAuth, navigate, redirectTo, location]);

  if (loading) {
    return (
      <div className="min-h-screen modern-gradient flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}

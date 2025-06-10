
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ModernDashboard from "./pages/ModernDashboard";
import ModernPayments from "./pages/ModernPayments";
import ModernWelcome from "./pages/ModernWelcome";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Payments from "./pages/Payments";
import Cards from "./pages/Cards";
import KYC from "./pages/KYC";
import VerificationSuccess from "./pages/VerificationSuccess";
import Verify from "./pages/Verify";
import VerifyDocument from "./pages/VerifyDocument";
import PaymentTest from "./pages/PaymentTest";
import ResetPassword from "./pages/ResetPassword";
import Setup2FA from "./pages/Setup2FA";
import BiometricAuthSetup from "./pages/BiometricAuthSetup";
import Splash from "./pages/Splash";
import Help from "./pages/Help";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <Splash />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route path="/welcome" element={<ModernWelcome />} />
            <Route path="/welcome-old" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/help" element={<Help />} />
            <Route path="/terms" element={<Terms />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ModernDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard-old" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute>
                <ModernPayments />
              </ProtectedRoute>
            } />
            <Route path="/payments-old" element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/cards" element={
              <ProtectedRoute>
                <Cards />
              </ProtectedRoute>
            } />
            <Route path="/kyc" element={
              <ProtectedRoute>
                <KYC />
              </ProtectedRoute>
            } />
            <Route path="/verification-success" element={
              <ProtectedRoute>
                <VerificationSuccess />
              </ProtectedRoute>
            } />
            <Route path="/verify" element={
              <ProtectedRoute>
                <Verify />
              </ProtectedRoute>
            } />
            <Route path="/verify-document" element={
              <ProtectedRoute>
                <VerifyDocument />
              </ProtectedRoute>
            } />
            <Route path="/payment-test" element={
              <ProtectedRoute>
                <PaymentTest />
              </ProtectedRoute>
            } />
            <Route path="/setup-2fa" element={
              <ProtectedRoute>
                <Setup2FA />
              </ProtectedRoute>
            } />
            <Route path="/biometric-setup" element={
              <ProtectedRoute>
                <BiometricAuthSetup />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

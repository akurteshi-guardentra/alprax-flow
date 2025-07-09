
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import GlobalErrorBoundary from "@/components/error/GlobalErrorBoundary";
import { LoadingProvider } from "@/components/ui/LoadingManager";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PerformanceInfo } from "@/components/ui/performance-info";
import { DeviceInfoPanel } from "@/components/mobile/DeviceInfoPanel";
import { authService } from "@/services/AuthService";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ModernPayments from "./pages/ModernPayments"; // The actual send money form
import Payments from "./pages/Payments"; // Payment methods management
import RequestMoney from "./pages/RequestMoney";
import AddFunds from "./pages/AddFunds";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Setup2FA from "./pages/Setup2FA";
import BiometricAuthSetup from "./pages/BiometricAuthSetup";
import KYC from "./pages/KYC";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Initialize auth service
    authService.initialize();
  }, []);

  return (
    <GlobalErrorBoundary>
      <LoadingProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <ConnectionStatus />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={
                    <AuthGuard requireAuth={false}>
                      <Index />
                    </AuthGuard>
                  } />
                  <Route path="/welcome" element={
                    <AuthGuard requireAuth={false}>
                      <Welcome />
                    </AuthGuard>
                  } />
                  <Route path="/splash" element={
                    <AuthGuard requireAuth={false}>
                      <Splash />
                    </AuthGuard>
                  } />
                  <Route path="/login" element={
                    <AuthGuard requireAuth={false}>
                      <Login />
                    </AuthGuard>
                  } />
                  <Route path="/signup" element={
                    <AuthGuard requireAuth={false}>
                      <Signup />
                    </AuthGuard>
                  } />
                  <Route path="/dashboard" element={
                    <AuthGuard requireAuth={true}>
                      <Dashboard />
                    </AuthGuard>
                  } />
                  <Route path="/profile" element={
                    <AuthGuard requireAuth={true}>
                      <Profile />
                    </AuthGuard>
                  } />
                  <Route path="/payments" element={
                    <AuthGuard requireAuth={true}>
                      <ModernPayments />
                    </AuthGuard>
                  } />
                  <Route path="/payment-methods" element={
                    <AuthGuard requireAuth={true}>
                      <Payments />
                    </AuthGuard>
                  } />
                  <Route path="/request" element={
                    <AuthGuard requireAuth={true}>
                      <RequestMoney />
                    </AuthGuard>
                  } />
                  <Route path="/add-funds" element={
                    <AuthGuard requireAuth={true}>
                      <AddFunds />
                    </AuthGuard>
                  } />
                  <Route path="/contacts" element={
                    <AuthGuard requireAuth={true}>
                      <Contacts />
                    </AuthGuard>
                  } />
                  <Route path="/settings" element={
                    <AuthGuard requireAuth={true}>
                      <Settings />
                    </AuthGuard>
                  } />
                  <Route path="/help" element={
                    <AuthGuard requireAuth={true}>
                      <Help />
                    </AuthGuard>
                  } />
                  <Route path="/setup-2fa" element={
                    <AuthGuard requireAuth={true}>
                      <Setup2FA />
                    </AuthGuard>
                  } />
                  <Route path="/biometric-setup" element={
                    <AuthGuard requireAuth={true}>
                      <BiometricAuthSetup />
                    </AuthGuard>
                  } />
                  <Route path="/kyc" element={
                    <AuthGuard requireAuth={true}>
                      <KYC />
                    </AuthGuard>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                {isMobile && <MobileBottomNav />}
                <PerformanceInfo />
                {isMobile && <DeviceInfoPanel />}
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </LoadingProvider>
    </GlobalErrorBoundary>
  );
};

const App = () => <AppContent />;

export default App;

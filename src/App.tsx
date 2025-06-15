
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Payments from "./pages/Payments";
import RequestMoney from "./pages/RequestMoney";
import AddFunds from "./pages/AddFunds";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Setup2FA from "./pages/Setup2FA";
import BiometricAuthSetup from "./pages/BiometricAuthSetup";
import KYC from "./pages/KYC";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "@/hooks/use-theme";
import { TestnetBanner } from "./components/TestnetBanner";
import { BrowserCompatibilityWarning } from "./components/BrowserCompatibilityWarning";
import '@/i18n';
import { TestAccountProvider } from "./contexts/TestAccountContext";

// Loading fallback
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-loaded components for better performance
const LoadingFallback = () => (
  <div className="p-10 flex flex-col gap-4 max-w-md mx-auto">
    <Skeleton className="h-12 w-3/4 mb-6" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-12 w-1/2 mx-auto mt-6" />
  </div>
);

// Core pages (frequently used, load immediately)
import Splash from "./pages/Splash";
import NotFound from "./pages/NotFound";
const Login = lazy(() => import("./pages/Login"));
const ModernWelcome = lazy(() => import("./pages/ModernWelcome"));

// Auth pages
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Signup = lazy(() => import("./pages/Signup"));
const Verify = lazy(() => import("./pages/Verify"));
const Setup2FA = lazy(() => import("./pages/Setup2FA"));

// App pages
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Cards = lazy(() => import("./pages/Cards"));
const Payments = lazy(() => import("./pages/Payments"));
const KYC = lazy(() => import("./pages/KYC"));
const PaymentTest = lazy(() => import("./pages/PaymentTest"));

// Info pages
const Help = lazy(() => import("./pages/Help"));
const Terms = lazy(() => import("./pages/Terms"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
          <TestAccountProvider>
            <TooltipProvider>
              <div className="flex flex-col min-h-screen">
                <TestnetBanner />
                <Toaster />
                <Sonner />
                <BrowserCompatibilityWarning />
                <Routes>
                  {/* Non-lazy loaded core routes */}
                  <Route path="/" element={<Splash />} />
                  <Route path="*" element={<NotFound />} />

                  {/* Lazy loaded routes wrapped in Suspense */}
                  <Route path="/welcome" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ModernWelcome />
                    </Suspense>
                  } />

                  {/* Auth Routes */}
                  <Route path="/login" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Login />
                    </Suspense>
                  } />
                  <Route path="/signup" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Signup />
                    </Suspense>
                  } />
                  <Route path="/reset-password" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ResetPassword />
                    </Suspense>
                  } />
                  <Route path="/verify" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Verify />
                    </Suspense>
                  } />
                  <Route path="/setup-2fa" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Setup2FA />
                    </Suspense>
                  } />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <Index />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <Analytics />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <Notifications />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <Profile />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <Settings />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/cards" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <Cards />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/payments" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <Payments />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/kyc" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <KYC />
                      </Suspense>
                    </ProtectedRoute>
                  } />

                  {/* Testing Routes */}
                  <Route path="/payment-test" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <PaymentTest />
                    </Suspense>
                  } />

                  {/* Public Info Routes */}
                  <Route path="/help" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Help />
                    </Suspense>
                  } />
                  <Route path="/terms" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Terms />
                    </Suspense>
                  } />
                </Routes>
              </div>
            </TooltipProvider>
          </TestAccountProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;

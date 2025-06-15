
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
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
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

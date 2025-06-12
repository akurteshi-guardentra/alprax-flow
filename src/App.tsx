import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { TestnetBanner } from "@/components/TestnetBanner";
import { useMemo } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Verify from "./pages/Verify";
import VerifyDocument from "./pages/VerifyDocument";
import Cards from "./pages/Cards";
import Help from "./pages/Help";

function App() {
  // Create QueryClient inside the component to ensure proper React context
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="alprax-theme">
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <TestnetBanner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/verification/document" element={<VerifyDocument />} />
              <Route path="/cards" element={<Cards />} />
              <Route path="/help" element={<Help />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

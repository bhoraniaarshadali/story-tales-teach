
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import Share from "./pages/Share";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./hooks/useAuth";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <SpeedInsights />
            <Analytics />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/share/:storyId" element={<Share />} />
                <Route path="/" element={
                  <AuthGuard>
                    <Index />
                  </AuthGuard>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </AccessibilityProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

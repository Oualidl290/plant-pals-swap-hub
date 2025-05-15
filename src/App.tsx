
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Plants from "./pages/Plants";
import PlantDetail from "./pages/PlantDetail";
import UserProfile from "./pages/UserProfile";
import Messages from "./pages/Messages";
import AddPlant from "./pages/AddPlant";
import SwapsPage from "./pages/SwapsPage";
import { useState } from "react";

function App() {
  // Create a new QueryClient instance within the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Auth route - not accessible when logged in */}
              <Route 
                path="/auth" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Auth />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected routes - require authentication */}
              <Route 
                path="/onboarding" 
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/swaps" 
                element={
                  <ProtectedRoute>
                    <SwapsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/add-plant" 
                element={
                  <ProtectedRoute>
                    <AddPlant />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/edit-plant/:id" 
                element={
                  <ProtectedRoute>
                    <AddPlant />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/plants" element={<Plants />} />
              <Route path="/plants/:id" element={<PlantDetail />} />
              
              <Route 
                path="/profile/:username" 
                element={
                  <UserProfile />
                } 
              />
              
              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } 
              />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense, useState } from "react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { LoadingScreen } from "./components/auth/LoadingScreen";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Plants = lazy(() => import("./pages/Plants"));
const PlantDetail = lazy(() => import("./pages/PlantDetail"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Messages = lazy(() => import("./pages/Messages"));
const AddPlant = lazy(() => import("./pages/AddPlant"));
const SwapsPage = lazy(() => import("./pages/SwapsPage"));

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 30000,
        // Using the correct error handling approach for React Query v5+
        meta: {
          onError: (error: Error) => {
            console.error('Query error:', error);
          }
        }
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" />
          <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
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
                <Route path="/plant/:id" element={<PlantDetail />} />
                
                {/* Removed the /profile/:username route, keeping only /profile */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
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
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

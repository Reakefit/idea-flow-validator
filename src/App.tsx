
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ProjectProvider } from "@/lib/context/ProjectContext";
import getRoutes from "@/lib/utils/routes";
import { useAuth } from "@/lib/context/AuthContext";
import { useProject } from "@/lib/context/ProjectContext";
import React from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  }
});

// Enhanced ProtectedRoute component that checks authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-insight-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// SmartRedirectRoute component that checks authentication and project status
const SmartRedirectRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { currentProject, problemContext, isLoading: projectLoading } = useProject();
  
  if (authLoading || projectLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-insight-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If the user doesn't have a project yet, send to dashboard
  if (!currentProject) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If problem understanding is not completed, send to chat
  if (!problemContext || !problemContext.finalStatement) {
    return <Navigate to="/chat" replace />;
  }
  
  // If problem understanding is completed but analysis is not, send to analysis
  if (currentProject.progress.market_research === 'pending' || 
      currentProject.progress.competitor_analysis === 'pending' ||
      currentProject.progress.feature_analysis === 'pending' ||
      currentProject.progress.customer_insights === 'pending' ||
      currentProject.progress.customer_personas === 'pending' ||
      currentProject.progress.opportunity_mapping === 'pending') {
    return <Navigate to="/analysis" replace />;
  }
  
  // If everything is completed, render the children
  return <>{children}</>;
};

// PublicRoute component for pages that should not be accessible when logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-insight-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main App component that sets up the providers and routes
const App = () => {
  const routes = getRoutes();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ProjectProvider>
              <Routes>
                {routes.map((route) => (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={route.element} 
                  />
                ))}
              </Routes>
            </ProjectProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
export { ProtectedRoute, PublicRoute, SmartRedirectRoute };

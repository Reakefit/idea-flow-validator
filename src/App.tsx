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

  // Get the current phase, defaulting to null if not set
  const currentPhase = currentProject.current_phase || null;

  // Handle navigation based on current phase
  switch (currentPhase) {
    case null:
    case '':
      // If no phase is set, check if problem understanding is completed
      if (!problemContext || !problemContext.finalStatement) {
        return <Navigate to="/chat" replace />;
      }
      // If problem is understood but no phase set, set it to analysis
      return <Navigate to="/analysis" replace />;

    case 'problem_understanding':
      // If in problem understanding phase but it's completed, move to analysis
      if (problemContext?.finalStatement) {
        return <Navigate to="/analysis" replace />;
      }
      return <Navigate to="/chat" replace />;

    case 'analysis':
      // If analysis is completed, move to dashboard
      if (currentProject.progress.market_research === 'complete' &&
          currentProject.progress.competitor_analysis === 'complete' &&
          currentProject.progress.feature_analysis === 'complete' &&
          currentProject.progress.customer_insights === 'complete' &&
          currentProject.progress.customer_personas === 'complete' &&
          currentProject.progress.opportunity_mapping === 'complete') {
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/analysis" replace />;

    default:
      // For all other phases, render the children
      return <>{children}</>;
  }
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

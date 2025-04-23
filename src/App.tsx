import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ProjectProvider } from "@/lib/context/ProjectContext";
import { AnalysisProvider } from '@/lib/context/AnalysisContext';
import getRoutes from "@/lib/utils/routes";
import { useAuth } from "@/lib/context/AuthContext";
import { useProject } from "@/lib/context/ProjectContext";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

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
  const [isValidating, setIsValidating] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  
  // Memoize the validation logic to prevent unnecessary re-runs
  const validateState = useCallback(async () => {
    // Don't proceed if we're still loading or already have a redirect path
    if (authLoading || projectLoading || redirectPath) return;
    
    setIsValidating(true);
    setLastError(null);
    
    try {
      // If no user, redirect to login
      if (!user) {
        setRedirectPath('/login');
        return;
      }

      // If no project, redirect to chat
      if (!currentProject) {
        setRedirectPath('/chat');
        return;
      }

      // Get the current phase, defaulting to null if not set
      const currentPhase = currentProject.current_phase || null;
      
      // Validate project state
      if (!currentProject.id) {
        throw new Error('Invalid project state: Missing project ID');
      }

      // Flow logic:
      // 1. If no phase set, go to problem chat
      if (!currentPhase) {
        setRedirectPath('/chat');
        return;
      }

      // 2. If in problem_understanding phase
      if (currentPhase === 'problem_understanding') {
        // If no final statement, stay in chat
        if (!problemContext?.finalStatement) {
          setRedirectPath('/chat');
          return;
        }
        // If final statement exists, go to analysis
        setRedirectPath('/analysis');
        return;
      }

      // 3. If in analysis phase
      if (currentPhase === 'analysis') {
        const isAnalysisComplete = 
          currentProject.progress.market_research === 'complete' &&
          currentProject.progress.competitor_analysis === 'complete' &&
          currentProject.progress.feature_analysis === 'complete' &&
          currentProject.progress.customer_insights === 'complete' &&
          currentProject.progress.customer_personas === 'complete' &&
          currentProject.progress.opportunity_mapping === 'complete';

        // If analysis is complete, go to dashboard
        if (isAnalysisComplete) {
          setRedirectPath('/dashboard');
          return;
        }
        
        // If analysis is in progress, stay in analysis
        setRedirectPath('/analysis');
        return;
      }

      // 4. If in dashboard phase
      if (currentPhase === 'dashboard') {
        setRedirectPath('/dashboard');
        return;
      }

      // 5. If in an unknown phase, go to chat to reset
      setRedirectPath('/chat');
      
    } catch (error: any) {
      console.error('Error in SmartRedirectRoute:', error);
      setLastError(error.message);
      setRedirectPath('/dashboard'); // Safe fallback
    } finally {
      setIsValidating(false);
    }
  }, [authLoading, projectLoading, user, currentProject, problemContext, redirectPath]);

  // Only run validation when key dependencies change
  useEffect(() => {
    validateState();
  }, [validateState]);

  if (authLoading || projectLoading || isValidating) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-insight-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If there was an error, show error state with retry option
  if (lastError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-insight-dark">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {lastError}</p>
          <button 
            onClick={() => {
              setLastError(null);
              setRedirectPath(null);
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If we have a redirect path, navigate to it
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

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
              <AnalysisProvider>
                <Routes>
                  {routes.map((route) => (
                    <Route 
                      key={route.path} 
                      path={route.path} 
                      element={route.element} 
                    />
                  ))}
                </Routes>
              </AnalysisProvider>
            </ProjectProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
export { ProtectedRoute, PublicRoute, SmartRedirectRoute };

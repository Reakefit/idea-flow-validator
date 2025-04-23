
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';
import { useProject } from '@/lib/context/ProjectContext';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import Index from '@/pages/Index';
import ChatPage from '@/pages/ChatPage';
import DashboardPage from '@/pages/DashboardPage';
import AnalysisPipelinePage from '@/pages/AnalysisPipelinePage';
import InterviewAssistantPage from '@/pages/InterviewAssistantPage';
import InterviewSummaryPage from '@/pages/InterviewSummaryPage';
import ConsolidatedInsightsPage from '@/pages/ConsolidatedInsightsPage';
import NotFound from '@/pages/NotFound';

interface RouteConfig {
  path: string;
  element: JSX.Element;
  children?: RouteConfig[];
}

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You could render a loading spinner here
    return <div className="h-screen w-full flex items-center justify-center bg-insight-dark">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-insight-dark">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export const SmartRedirectRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const { currentProject, problemContext, isLoading: projectLoading } = useProject();
  
  if (isLoading || projectLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-insight-dark">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // If the user doesn't have a project yet, send to dashboard
  if (!currentProject) {
    return <Navigate to="/dashboard" />;
  }
  
  // If problem understanding is not completed, send to chat
  if (!problemContext || !problemContext.finalStatement) {
    return <Navigate to="/chat" />;
  }
  
  // If problem understanding is completed but analysis is not, send to analysis
  if (currentProject.progress.market_research === 'pending' || 
      currentProject.progress.competitor_analysis === 'pending' ||
      currentProject.progress.feature_analysis === 'pending' ||
      currentProject.progress.customer_insights === 'pending' ||
      currentProject.progress.customer_personas === 'pending' ||
      currentProject.progress.opportunity_mapping === 'pending') {
    return <Navigate to="/analysis" />;
  }
  
  // If everything is completed, render the children
  return <>{children}</>;
};

const getRoutes = (): RouteConfig[] => [
  {
    path: '/',
    element: <Index />
  },
  {
    path: '/login',
    element: <PublicRoute><LoginPage /></PublicRoute>
  },
  {
    path: '/register',
    element: <PublicRoute><RegisterPage /></PublicRoute>
  },
  {
    path: '/chat',
    element: <ProtectedRoute><ChatPage /></ProtectedRoute>
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>
  },
  {
    path: '/analysis',
    element: <ProtectedRoute><AnalysisPipelinePage /></ProtectedRoute>
  },
  {
    path: '/interview-assistant',
    element: <SmartRedirectRoute><InterviewAssistantPage /></SmartRedirectRoute>
  },
  {
    path: '/interview-summary',
    element: <SmartRedirectRoute><InterviewSummaryPage /></SmartRedirectRoute>
  },
  {
    path: '/insights',
    element: <SmartRedirectRoute><ConsolidatedInsightsPage /></SmartRedirectRoute>
  },
  {
    path: '*',
    element: <NotFound />
  }
];

export default getRoutes;

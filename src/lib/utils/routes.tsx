import { Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import Index from '@/pages/Index';
import ChatPage from '@/pages/ChatPage';
import DashboardPage from '@/pages/DashboardPage';
import InterviewAssistantPage from '@/pages/InterviewAssistantPage';
import InterviewSummaryPage from '@/pages/InterviewSummaryPage';
import ConsolidatedInsightsPage from '@/pages/ConsolidatedInsightsPage';
import NotFound from '@/pages/NotFound';
import { ProtectedRoute, PublicRoute, SmartRedirectRoute } from '@/App';

interface RouteConfig {
  path: string;
  element: JSX.Element;
  children?: RouteConfig[];
}

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
    path: '/interviews',
    element: <ProtectedRoute><InterviewAssistantPage /></ProtectedRoute>
  },
  {
    path: '/insights',
    element: <ProtectedRoute><ConsolidatedInsightsPage /></ProtectedRoute>
  },
  {
    path: '*',
    element: <NotFound />
  }
];

export default getRoutes;

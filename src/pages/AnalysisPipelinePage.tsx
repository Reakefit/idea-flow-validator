import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/lib/context/ProjectContext';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const AnalysisPipelinePage = () => {
  const navigate = useNavigate();
  const { currentProject, problemContext, fetchProblemContext } = useProject();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentProject) {
      setIsLoading(true);
      // Optionally redirect or display a message
      return;
    }

    setIsLoading(false);
  }, [currentProject]);

  const handleNavigation = (stage: string) => {
    if (!currentProject) {
      console.warn("No project selected.");
      return;
    }

    switch (stage) {
      case 'problem_validation':
        navigate(`/projects/${currentProject.id}/problem-understanding`);
        break;
      case 'market_research':
        navigate(`/projects/${currentProject.id}/market-research`);
        break;
      case 'competitor_analysis':
        navigate(`/projects/${currentProject.id}/competitor-analysis`);
        break;
      case 'feature_analysis':
        navigate(`/projects/${currentProject.id}/feature-analysis`);
        break;
      case 'customer_insights':
        navigate(`/projects/${currentProject.id}/customer-insights`);
        break;
      case 'customer_personas':
        navigate(`/projects/${currentProject.id}/customer-persona`);
        break;
      case 'opportunity_mapping':
        navigate(`/projects/${currentProject.id}/opportunity-mapping`);
        break;
      default:
        console.warn(`Unknown stage: ${stage}`);
    }
  };

  const renderStatusBadge = (status: string) => {
    let variant: "default" | "destructive" | "outline" | "secondary" = "default";
    
    switch (status) {
      case 'complete':
        variant = "secondary";  // Use secondary instead of success
        return <Badge variant={variant} className="bg-green-600 text-white">Complete</Badge>;
      case 'in-progress':
        variant = "secondary";
        return <Badge variant={variant} className="bg-blue-500">In Progress</Badge>;
      case 'pending':
        variant = "outline";
        return <Badge variant={variant}>Pending</Badge>;
      case 'error':
        variant = "destructive";
        return <Badge variant={variant}>Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-64" /></CardTitle>
            <CardDescription><Skeleton className="h-4 w-96" /></CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-4">
              <span>Problem Validation:</span>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center space-x-4">
              <span>Market Research:</span>
              <Skeleton className="h-4 w-24" />
            </div>
            {/* Add more skeleton loaders for other stages */}
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!currentProject) {
    return <div className="container mx-auto p-4">No project selected.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{currentProject.name}</CardTitle>
          <CardDescription>Analysis Pipeline</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4">
            <span>Problem Validation:</span>
            {renderStatusBadge(currentProject.progress?.problem_validation)}
          </div>
          <div className="flex items-center space-x-4">
            <span>Market Research:</span>
            {renderStatusBadge(currentProject.progress?.market_research)}
          </div>
          <div className="flex items-center space-x-4">
            <span>Competitor Analysis:</span>
            {renderStatusBadge(currentProject.progress?.competitor_analysis)}
          </div>
           <div className="flex items-center space-x-4">
            <span>Feature Analysis:</span>
            {renderStatusBadge(currentProject.progress?.feature_analysis)}
          </div>
          <div className="flex items-center space-x-4">
            <span>Customer Insights:</span>
            {renderStatusBadge(currentProject.progress?.customer_insights)}
          </div>
          <div className="flex items-center space-x-4">
            <span>Customer Personas:</span>
            {renderStatusBadge(currentProject.progress?.customer_personas)}
          </div>
          <div className="flex items-center space-x-4">
            <span>Opportunity Mapping:</span>
            {renderStatusBadge(currentProject.progress?.opportunity_mapping)}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => handleNavigation('problem_validation')}>
            Go to Problem Validation
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AnalysisPipelinePage;

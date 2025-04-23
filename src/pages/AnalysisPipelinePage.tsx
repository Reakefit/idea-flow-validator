import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/lib/context/ProjectContext';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

// Import all agents
import { OpenAIMarketResearchAgent } from '@/lib/ai/market-research-agent';
import { OpenAICompetitorAnalysisAgent } from '@/lib/ai/competitor-analysis-agent';
import { OpenAIFeatureAnalysisAgent } from '@/lib/ai/feature-analysis-agent';
import { OpenAICustomerInsightsAgent } from '@/lib/ai/customer-insights-agent';
import { OpenAICustomerPersonaAgent } from '@/lib/ai/customer-persona-agent';
import { OpenAIOpportunityMappingAgent } from '@/lib/ai/opportunity-mapping-agent';

const AnalysisPipelinePage = () => {
  const navigate = useNavigate();
  const { currentProject, problemContext, fetchProblemContext } = useProject();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!currentProject) {
      setIsLoading(true);
      return;
    }

    // Check if problem understanding is completed
    if (!problemContext || !problemContext.finalStatement) {
      navigate('/chat');
      return;
    }

    setIsLoading(false);
    
    // Check if we should start or continue the pipeline
    const shouldRunPipeline = 
      currentProject.progress.market_research === 'pending' || 
      currentProject.progress.competitor_analysis === 'pending' ||
      currentProject.progress.feature_analysis === 'pending' ||
      currentProject.progress.customer_insights === 'pending' ||
      currentProject.progress.customer_personas === 'pending' ||
      currentProject.progress.opportunity_mapping === 'pending';
    
    if (shouldRunPipeline && !isRunning) {
      runAnalysisPipeline();
    }
  }, [currentProject, problemContext, user]);

  const updateProjectProgress = async (stage: string, status: string) => {
    if (!currentProject) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          progress: {
            ...currentProject.progress,
            [stage]: status
          }
        })
        .eq('id', currentProject.id);
        
      if (error) throw error;
    } catch (error) {
      console.error(`Error updating ${stage} status:`, error);
      toast.error(`Failed to update ${stage} status`);
    }
  };

  const runAnalysisPipeline = async () => {
    if (!currentProject || !problemContext || !user?.id) {
      toast.error("Missing required data to run analysis");
      return;
    }
    
    setIsRunning(true);
    setProgress(0);

    try {
      // Market Research
      if (currentProject.progress.market_research === 'pending') {
        setCurrentAgent('market_research');
        setProgress(5);
        updateProjectProgress('market_research', 'in-progress');
        
        const marketResearchAgent = new OpenAIMarketResearchAgent(currentProject.id, supabase);
        await marketResearchAgent.loadContext(currentProject.id);
        const marketResearchResult = await marketResearchAgent.analyzeMarket(problemContext);
        await marketResearchAgent.saveContext();

        updateProjectProgress('market_research', 'complete');
        setProgress(15);
      } else {
        setProgress(15);
      }
      
      // Competitor Analysis
      if (currentProject.progress.competitor_analysis === 'pending') {
        setCurrentAgent('competitor_analysis');
        updateProjectProgress('competitor_analysis', 'in-progress');
      
        const competitorAnalysisAgent = new OpenAICompetitorAnalysisAgent(currentProject.id, supabase);

        await competitorAnalysisAgent.loadContext(currentProject.id);

        const { data: marketResearchData } = await supabase
          .from('market_research_context')
          .select('*')
          .eq('project_id', currentProject.id)
          .single();

        if (marketResearchData) {
          const competitorResult = await competitorAnalysisAgent.analyzeCompetitors(marketResearchData);
          await competitorAnalysisAgent.saveContext();
        } else {
          throw new Error("Market research data not found");
        }
        updateProjectProgress('competitor_analysis', 'complete');
        setProgress(30);
      } else {
        setProgress(30);
      }
      
      // Feature Analysis
      if (currentProject.progress.feature_analysis === 'pending') {
        setCurrentAgent('feature_analysis');
        updateProjectProgress('feature_analysis', 'in-progress');

        const featureAnalysisAgent = new OpenAIFeatureAnalysisAgent(currentProject.id, supabase);
        await featureAnalysisAgent.loadContext(currentProject.id);

        const { data: competitorData } = await supabase
          .from('competitor_analysis_context')
          .select('*')
          .eq('project_id', currentProject.id)
          .single();

        if (competitorData) {
          const featureResult = await featureAnalysisAgent.analyzeFeatures(competitorData.id);
          await featureAnalysisAgent.saveContext();
        } else {
          throw new Error("Competitor analysis data not found");
        }
        updateProjectProgress('feature_analysis', 'complete');
        setProgress(50);
      } else {
        setProgress(50);
      }
      
      // Customer Insights
      if (currentProject.progress.customer_insights === 'pending') {
        setCurrentAgent('customer_insights');
        updateProjectProgress('customer_insights', 'in-progress');

        const customerInsightsAgent = new OpenAICustomerInsightsAgent(currentProject.id, supabase);
        await customerInsightsAgent.loadContext(currentProject.id);

        const { data: featureData } = await supabase
          .from('feature_analysis_context')
          .select('*')
          .eq('project_id', currentProject.id)
          .single();

        if (featureData) {
          const insightsResult = await customerInsightsAgent.analyzeCustomerInsights(featureData.id);
          await customerInsightsAgent.saveContext();
        } else {
          throw new Error("Feature analysis context data not found");
        }
        updateProjectProgress('customer_insights', 'complete');
        setProgress(70);
      } else {
        setProgress(70);
      }
      
      // Customer Personas
      if (currentProject.progress.customer_personas === 'pending') {
        setCurrentAgent('customer_personas');
        updateProjectProgress('customer_personas', 'in-progress');

        const personaAgent = new OpenAICustomerPersonaAgent(currentProject.id, supabase);
        await personaAgent.loadContext(currentProject.id);

        const { data: marketResearchData } = await supabase
          .from('market_research_context')
          .select('*')
          .eq('project_id', currentProject.id)
          .single();

        if (marketResearchData) {
          const personaResult = await personaAgent.generatePersonas(marketResearchData);
          await personaAgent.saveContext();
        } else {
          throw new Error("Market research data not found");
        }

        updateProjectProgress('customer_personas', 'complete');
        setProgress(85);
      } else {
        setProgress(85);
      }
      
      // Opportunity Mapping
      if (currentProject.progress.opportunity_mapping === 'pending') {
        setCurrentAgent('opportunity_mapping');
        updateProjectProgress('opportunity_mapping', 'in-progress');

        const opportunityAgent = new OpenAIOpportunityMappingAgent(currentProject.id, supabase);
        await opportunityAgent.loadContext(currentProject.id);

        const { data: marketResearchData } = await supabase
          .from('market_research_context')
          .select('*')
          .eq('project_id', currentProject.id)
          .single();

        const { data: competitorData } = await supabase
          .from('competitor_analysis_context')
          .select('*')
          .eq('project_id', currentProject.id)
          .single();

        const { data: featureData } = await supabase
          .from('feature_analysis_context')
          .select('*')
          .eq('project_id', currentProject.id)
          .single();

        const { data: insightsData } = await supabase
          .from('customer_insights_context')
          .select('*')
          .eq('project_id', currentProject.id)
          .single();

        if (marketResearchData && competitorData && featureData && insightsData) {
          const opportunityResult = await opportunityAgent.mapOpportunities(
            marketResearchData,
            competitorData,
            featureData,
            insightsData
          );
          await opportunityAgent.saveContext();
        } else {
          throw new Error("Required context data not found");
        }

        updateProjectProgress('opportunity_mapping', 'complete');
        setProgress(100);
      } else {
        setProgress(100);
      }
      
      setCurrentAgent(null);
      toast.success("Analysis pipeline completed successfully!");
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error("Error in analysis pipeline:", error);
      toast.error(`Analysis error: ${error.message}`);
      
      // Mark current stage as error
      if (currentAgent) {
        updateProjectProgress(currentAgent, 'error');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    let variant: "default" | "destructive" | "outline" | "secondary" = "default";
    
    switch (status) {
      case 'complete':
        variant = "secondary";
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
          {isRunning && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-2">
                Currently running: {currentAgent?.replace('_', ' ')}
              </p>
              <Progress value={progress} className="h-2" />
            </div>
          )}
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
        <CardFooter className="flex justify-between">
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button 
            onClick={runAnalysisPipeline} 
            disabled={isRunning}
            variant="secondary"
          >
            {isRunning ? "Analysis in progress..." : "Run Analysis"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AnalysisPipelinePage;

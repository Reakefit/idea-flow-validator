import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart2, Users, Hexagon, FileSearch, Lightbulb, ChevronRight, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useProject } from '@/lib/context/ProjectContext';
import { useAnalysis } from '@/lib/context/AnalysisContext';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';

// Import all agents
import { OpenAIMarketResearchAgent } from '@/lib/ai/market-research-agent';
import { OpenAICompetitorAnalysisAgent } from '@/lib/ai/competitor-analysis-agent';
import { OpenAIFeatureAnalysisAgent } from '@/lib/ai/feature-analysis-agent';
import { OpenAICustomerInsightsAgent } from '@/lib/ai/customer-insights-agent';
import { OpenAICustomerPersonaAgent } from '@/lib/ai/customer-persona-agent';
import { OpenAIOpportunityMappingAgent } from '@/lib/ai/opportunity-mapping-agent';

export const DashboardContent: React.FC = () => {
  const { currentProject, problemContext, fetchProblemContext } = useProject();
  const {
    marketResearch,
    competitorAnalysis,
    featureAnalysis,
    customerInsights,
    customerPersonas,
    opportunityMapping,
    currentStep,
    isRunning,
    isLoading,
    error,
    retryStep,
    runAnalysisPipeline
  } = useAnalysis();
  const [isRunningAnalysis, setIsRunningAnalysis] = React.useState(false);
  const [currentAnalysisStep, setCurrentAnalysisStep] = React.useState<string | null>(null);
  const navigate = useNavigate();

  console.log('Dashboard state:', {
    currentProject,
    marketResearch,
    competitorAnalysis,
    featureAnalysis,
    customerInsights,
    customerPersonas,
    opportunityMapping,
    currentStep,
    isRunning,
    isLoading,
    error
  });

  if (!currentProject) {
    console.log('No project selected');
    return <div>No project selected</div>;
  }

  const renderAnalysisCard = (
    title: string,
    step: string,
    data: Record<string, any> | null,
    dependencies: string[] = []
  ) => {
    const isPending = !data || !Object.values(data || {}).some(value => 
      Array.isArray(value) ? value.length > 0 : value
    );
    const isRunningStep = currentStep === step;
    const isComplete = !isPending && !isRunningStep;
    const hasError = error?.includes(step);

    console.log(`Rendering card for ${step}:`, {
      isPending,
      isRunningStep,
      isComplete,
      hasError,
      data
    });

    return (
      <GlassCard className={isComplete ? '' : 'opacity-50'}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            {step === 'market_research' && <BarChart2 className="h-5 w-5 text-primary mr-2" />}
            {step === 'competitor_analysis' && <Activity className="h-5 w-5 text-primary mr-2" />}
            {step === 'feature_analysis' && <Hexagon className="h-5 w-5 text-primary mr-2" />}
            {step === 'customer_insights' && <FileSearch className="h-5 w-5 text-primary mr-2" />}
            {step === 'customer_personas' && <Users className="h-5 w-5 text-primary mr-2" />}
            {step === 'opportunity_mapping' && <Lightbulb className="h-5 w-5 text-primary mr-2" />}
            <h3 className="font-semibold">{title}</h3>
          </div>
          {isComplete && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <>
            {isRunningStep && (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analysis in progress...</span>
              </div>
            )}
            {isComplete && data && (
              <div className="space-y-2">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground">{key}</p>
                    {Array.isArray(value) ? (
                      <ul className="text-sm list-disc list-inside space-y-1">
                        {value.slice(0, 2).map((item: any, i: number) => (
                          <li key={i} className="text-sm truncate">
                            {typeof item === 'object' ? item.name || item.description || item.opportunity : String(item)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm font-medium">{String(value)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {hasError && (
              <div className="text-red-500">
                <p>Analysis failed</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log(`Retrying step ${step}`);
                    retryStep(step);
                  }}
                >
                  Retry
                </Button>
              </div>
            )}
            {isPending && !isRunningStep && !hasError && (
              <div className="text-gray-500">
                <p>Analysis pending</p>
                {dependencies.length > 0 && (
                  <p className="text-sm">
                    Waiting for: {dependencies.join(', ')}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </GlassCard>
    );
  };

  const handleStartChat = () => {
    navigate('/chat');
  };

  const shouldShowChatPrompt = !problemContext?.finalStatement;
  const isAllAnalysisComplete = 
    currentProject?.progress?.market_research === 'complete' &&
    currentProject?.progress?.competitor_analysis === 'complete' &&
    currentProject?.progress?.feature_analysis === 'complete' &&
    currentProject?.progress?.customer_insights === 'complete' &&
    currentProject?.progress?.customer_personas === 'complete' &&
    currentProject?.progress?.opportunity_mapping === 'complete';

  if (!currentProject || isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 h-full">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <GlassCard key={i} className="h-40">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analysis Dashboard</h2>
        {isAllAnalysisComplete && (
          <Button onClick={() => {
            console.log('Starting analysis pipeline');
            runAnalysisPipeline();
          }}>
            View Insights
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{currentProject.name}</h1>
            <p className="text-sm text-muted-foreground">
              {shouldShowChatPrompt 
                ? 'Start by defining your problem' 
                : isAllAnalysisComplete
                  ? 'Analysis complete! View your insights below'
                  : 'Analysis in progress...'}
            </p>
          </div>
          
          {shouldShowChatPrompt && (
            <Button className="bg-gradient-primary" onClick={handleStartChat}>
              Start Problem Chat
            </Button>
          )}
          
          {isAllAnalysisComplete && (
            <Button className="bg-gradient-primary" onClick={() => navigate('/insights')}>
              View Consolidated Insights
            </Button>
          )}
        </div>
        
        {/* Problem Statement */}
        {problemContext?.finalStatement && (
          <GlassCard className="mb-2">
            <div className="flex items-start">
              <Lightbulb className="mr-2 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Problem Statement</h3>
                <p className="text-sm">{problemContext.finalStatement}</p>
              </div>
            </div>
          </GlassCard>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderAnalysisCard('Market Research', 'market_research', marketResearch)}
          {renderAnalysisCard(
            'Competitor Analysis',
            'competitor_analysis',
            competitorAnalysis,
            ['market_research']
          )}
          {renderAnalysisCard(
            'Feature Analysis',
            'feature_analysis',
            featureAnalysis,
            ['competitor_analysis']
          )}
          {renderAnalysisCard(
            'Customer Insights',
            'customer_insights',
            customerInsights,
            ['feature_analysis']
          )}
          {renderAnalysisCard(
            'Customer Personas',
            'customer_personas',
            customerPersonas,
            ['market_research', 'customer_insights']
          )}
          {renderAnalysisCard(
            'Opportunity Mapping',
            'opportunity_mapping',
            opportunityMapping,
            ['market_research', 'competitor_analysis', 'feature_analysis', 'customer_insights']
          )}
        </div>
        
        {error && !currentStep && (
          <div className="text-red-500">
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={() => {
                const step = error.split(' ').pop();
                if (step) retryStep(step);
              }}
            >
              Retry Failed Step
            </Button>
          </div>
        )}
        
        <Separator className="my-4" />
        
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="schedule">Schedule Interviews</TabsTrigger>
            <TabsTrigger value="personas">Personas</TabsTrigger>
            <TabsTrigger value="tasks">Implementation Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="schedule" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Interview Schedule</CardTitle>
                <CardDescription>
                  Schedule and manage your customer interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No interviews scheduled yet</p>
                  <Button>Schedule Your First Interview</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="personas" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Customer Personas</CardTitle>
                <CardDescription>
                  Understand your target customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentProject.progress.customer_personas === 'complete' && customerPersonas && 
                 customerPersonas.personas && customerPersonas.personas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(Array.isArray(customerPersonas.personas) 
                      ? customerPersonas.personas 
                      : Object.values(customerPersonas.personas)
                    ).map((persona: any, i: number) => (
                      <div key={i} className="border rounded-md p-4">
                        <h3 className="font-semibold text-lg mb-1">{persona.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{persona.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="font-medium">Age:</p>
                            <p>{persona.demographics?.age || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Occupation:</p>
                            <p>{persona.demographics?.occupation || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Complete the analysis to generate personas</p>
                    <Button onClick={() => runAnalysisPipeline()} disabled={currentProject.progress.customer_personas === 'in-progress'}>
                      {currentProject.progress.customer_personas === 'in-progress' 
                        ? 'Generation in progress...' 
                        : 'Run Analysis'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tasks" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Implementation Roadmap</CardTitle>
                <CardDescription>
                  Plan and track your MVP development
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentProject.progress.opportunity_mapping === 'complete' && opportunityMapping && 
                 opportunityMapping.implementation_roadmap && opportunityMapping.implementation_roadmap.length > 0 ? (
                  <div className="space-y-4">
                    {opportunityMapping.implementation_roadmap.map((step: any, i: number) => (
                      <div key={i} className="border rounded-md p-4">
                        <h3 className="font-semibold">{step.step}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-sm font-medium">{step.timeline}</span>
                          <Button size="sm" variant="outline">Mark Complete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Complete the analysis to generate implementation plan</p>
                    <Button onClick={() => runAnalysisPipeline()} disabled={currentProject.progress.opportunity_mapping === 'in-progress'}>
                      {currentProject.progress.opportunity_mapping === 'in-progress' 
                        ? 'Generation in progress...' 
                        : 'Run Analysis'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

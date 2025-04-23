import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useProject } from "@/lib/context/ProjectContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, Users, Hexagon, FileSearch, Lightbulb, ChevronRight, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function DashboardContent() {
  const { currentProject, problemContext, fetchProblemContext } = useProject();
  const [marketResearch, setMarketResearch] = useState<any | null>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<any | null>(null);
  const [featureAnalysis, setFeatureAnalysis] = useState<any | null>(null);
  const [customerInsights, setCustomerInsights] = useState<any | null>(null);
  const [customerPersonas, setCustomerPersonas] = useState<any | null>(null);
  const [opportunityMapping, setOpportunityMapping] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentProject) return;
    
    // Check if problem understanding is completed
    if (!problemContext?.finalStatement) {
      toast.info("Let's start by understanding your problem");
      navigate('/chat');
      return;
    }

    // Check if analysis pipeline needs to be run
    const shouldRunAnalysis = 
      currentProject.progress.market_research === 'pending' || 
      currentProject.progress.competitor_analysis === 'pending' ||
      currentProject.progress.feature_analysis === 'pending' ||
      currentProject.progress.customer_insights === 'pending' ||
      currentProject.progress.customer_personas === 'pending' ||
      currentProject.progress.opportunity_mapping === 'pending';

    if (shouldRunAnalysis) {
      toast.info("Let's run the analysis pipeline for your project");
      navigate('/analysis');
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);

      try {
        // Fetch problem context if needed
        if (!problemContext) {
          await fetchProblemContext(currentProject.id);
        }

        // Fetch market research
        const { data: marketData } = await supabase
          .from('market_research_context')
          .select('*')
          .eq('project_id', currentProject.id)
          .single();
        
        setMarketResearch(marketData);

        // Fetch competitor analysis
        const { data: competitorData } = await supabase
          .from('competitor_analysis_context')
          .select('*')
          .eq('project_id', currentProject.id)
          .single();
        
        setCompetitorAnalysis(competitorData);

        // Fetch feature analysis
        const { data: featureData } = await supabase
          .from('feature_analysis_context')
          .select('*')
          .eq('project_id', currentProject.id)
          .single();
        
        setFeatureAnalysis(featureData);

        // Fetch customer insights
        const { data: insightsData } = await supabase
          .from('customer_insights_context')
          .select('*')
          .eq('project_id', currentProject.id)
          .single();
        
        setCustomerInsights(insightsData);

        // Fetch customer personas
        const { data: personasData } = await supabase
          .from('customer_persona_context')
          .select('*')
          .eq('project_id', currentProject.id)
          .single();
        
        setCustomerPersonas(personasData);

        // Fetch opportunity mapping
        const { data: opportunityData } = await supabase
          .from('opportunity_mapping_context')
          .select('*')
          .eq('project_id', currentProject.id)
          .single();
        
        setOpportunityMapping(opportunityData);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [currentProject, fetchProblemContext, problemContext, navigate]);

  const handleStartChat = () => {
    navigate('/chat');
  };

  const handleStartAnalysis = () => {
    navigate('/analysis');
  };

  const shouldShowChatPrompt = !problemContext?.finalStatement;
  const shouldShowAnalysisPrompt = problemContext?.finalStatement && 
    currentProject?.progress?.market_research !== 'complete';
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
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{currentProject.name}</h1>
          <p className="text-sm text-muted-foreground">
            {shouldShowChatPrompt 
              ? 'Start by defining your problem' 
              : shouldShowAnalysisPrompt
                ? 'Run analysis to understand your market'
                : 'Analyze insights to build your MVP'}
          </p>
        </div>
        
        {shouldShowChatPrompt && (
          <Button className="bg-gradient-primary" onClick={handleStartChat}>
            Start Problem Chat
          </Button>
        )}
        
        {shouldShowAnalysisPrompt && (
          <Button className="bg-gradient-primary" onClick={handleStartAnalysis}>
            Run Analysis
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
        {/* Market Research Card */}
        <GlassCard className={
          currentProject.progress.market_research !== 'complete'
            ? 'opacity-50'
            : ''
        }>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold">Market Research</h3>
            </div>
            {currentProject.progress.market_research === 'complete' && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          {currentProject.progress.market_research === 'complete' && marketResearch ? (
            <div>
              <div className="mb-2">
                <p className="text-xs text-muted-foreground">Market Size</p>
                <p className="text-sm font-medium">{marketResearch.metadata?.marketSize || 'Not available'}</p>
              </div>
              {marketResearch.market_insights && marketResearch.market_insights.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Key Insights</p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {marketResearch.market_insights.slice(0, 2).map((insight: string, i: number) => (
                      <li key={i} className="text-sm truncate">{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {currentProject.progress.market_research === 'in-progress'
                ? 'Analysis in progress...'
                : 'Run analysis to see market insights'}
            </p>
          )}
        </GlassCard>
        
        {/* Competitor Analysis Card */}
        <GlassCard className={
          currentProject.progress.competitor_analysis !== 'complete'
            ? 'opacity-50'
            : ''
        }>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold">Competitor Analysis</h3>
            </div>
            {currentProject.progress.competitor_analysis === 'complete' && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          {currentProject.progress.competitor_analysis === 'complete' && competitorAnalysis ? (
            <div>
              {competitorAnalysis.competitor_profiles && competitorAnalysis.competitor_profiles.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Top Competitors</p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {competitorAnalysis.competitor_profiles.slice(0, 2).map((comp: any, i: number) => (
                      <li key={i} className="text-sm truncate">{comp.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {currentProject.progress.competitor_analysis === 'in-progress'
                ? 'Analysis in progress...'
                : 'Run analysis to see competitor data'}
            </p>
          )}
        </GlassCard>
        
        {/* Feature Analysis Card */}
        <GlassCard className={
          currentProject.progress.feature_analysis !== 'complete'
            ? 'opacity-50'
            : ''
        }>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <Hexagon className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold">Feature Analysis</h3>
            </div>
            {currentProject.progress.feature_analysis === 'complete' && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          {currentProject.progress.feature_analysis === 'complete' && featureAnalysis ? (
            <div>
              {featureAnalysis.capability_analysis && featureAnalysis.capability_analysis.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Key Features</p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {featureAnalysis.capability_analysis.slice(0, 2).map((feature: any, i: number) => (
                      <li key={i} className="text-sm truncate">{feature.capability}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {currentProject.progress.feature_analysis === 'in-progress'
                ? 'Analysis in progress...'
                : 'Run analysis to see feature opportunities'}
            </p>
          )}
        </GlassCard>
        
        {/* Customer Insights Card */}
        <GlassCard className={
          currentProject.progress.customer_insights !== 'complete'
            ? 'opacity-50'
            : ''
        }>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <FileSearch className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold">Customer Insights</h3>
            </div>
            {currentProject.progress.customer_insights === 'complete' && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          {currentProject.progress.customer_insights === 'complete' && customerInsights ? (
            <div>
              {customerInsights.pain_points && customerInsights.pain_points.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Top Pain Points</p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {customerInsights.pain_points.slice(0, 2).map((pp: any, i: number) => (
                      <li key={i} className="text-sm truncate">{pp.description}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {currentProject.progress.customer_insights === 'in-progress'
                ? 'Analysis in progress...'
                : 'Run analysis to see customer insights'}
            </p>
          )}
        </GlassCard>
        
        {/* Customer Personas Card */}
        <GlassCard className={
          currentProject.progress.customer_personas !== 'complete'
            ? 'opacity-50'
            : ''
        }>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold">Customer Personas</h3>
            </div>
            {currentProject.progress.customer_personas === 'complete' && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          {currentProject.progress.customer_personas === 'complete' && customerPersonas ? (
            <div>
              {customerPersonas.personas && customerPersonas.personas.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Target Personas</p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {(Array.isArray(customerPersonas.personas) 
                      ? customerPersonas.personas 
                      : Object.values(customerPersonas.personas)
                    ).slice(0, 2).map((persona: any, i: number) => (
                      <li key={i} className="text-sm truncate">{persona.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {currentProject.progress.customer_personas === 'in-progress'
                ? 'Analysis in progress...'
                : 'Run analysis to see target personas'}
            </p>
          )}
        </GlassCard>
        
        {/* Opportunity Mapping Card */}
        <GlassCard className={
          currentProject.progress.opportunity_mapping !== 'complete'
            ? 'opacity-50'
            : ''
        }>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <Lightbulb className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold">Opportunities</h3>
            </div>
            {currentProject.progress.opportunity_mapping === 'complete' && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate('/insights')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          {currentProject.progress.opportunity_mapping === 'complete' && opportunityMapping ? (
            <div>
              {opportunityMapping.strategic_opportunities && opportunityMapping.strategic_opportunities.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Key Opportunities</p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {opportunityMapping.strategic_opportunities.slice(0, 2).map((opp: any, i: number) => (
                      <li key={i} className="text-sm truncate">{opp.opportunity}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {currentProject.progress.opportunity_mapping === 'in-progress'
                ? 'Analysis in progress...'
                : 'Run analysis to see opportunities'}
            </p>
          )}
        </GlassCard>
      </div>
      
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
                  <Button onClick={handleStartAnalysis} disabled={currentProject.progress.customer_personas === 'in-progress'}>
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
                  <Button onClick={handleStartAnalysis} disabled={currentProject.progress.opportunity_mapping === 'in-progress'}>
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
  );
}

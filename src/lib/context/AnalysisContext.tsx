import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useProject } from './ProjectContext';
import { supabase } from '@/lib/supabase/client';
import { OpenAIMarketResearchAgent } from '@/lib/ai/market-research-agent';
import { OpenAICompetitorAnalysisAgent } from '@/lib/ai/competitor-analysis-agent';
import { OpenAIFeatureAnalysisAgent } from '@/lib/ai/feature-analysis-agent';
import { OpenAICustomerInsightsAgent } from '@/lib/ai/customer-insights-agent';
import { OpenAICustomerPersonaAgent } from '@/lib/ai/customer-persona-agent';
import { OpenAIOpportunityMappingAgent } from '@/lib/ai/opportunity-mapping-agent';
import { toast } from 'sonner';
import { Project } from '@/lib/types/project';

interface AnalysisContextType {
  marketResearch: Record<string, any> | null;
  competitorAnalysis: Record<string, any> | null;
  featureAnalysis: Record<string, any> | null;
  customerInsights: Record<string, any> | null;
  customerPersonas: Record<string, any> | null;
  opportunityMapping: Record<string, any> | null;
  currentStep: string | null;
  isRunning: boolean;
  isLoading: boolean;
  error: string | null;
  fetchAllContexts: () => Promise<void>;
  runAnalysisPipeline: () => Promise<void>;
  retryStep: (step: string) => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentProject } = useProject();
  const [contexts, setContexts] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRunTime, setLastRunTime] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});
  const [project, setProject] = useState<Project>({
    id: '',
    name: '',
    description: '',
    created_at: '',
    updated_at: '',
    user_id: '',
    current_phase: '',
    progress: {
      market_research: '',
      competitor_analysis: '',
      feature_analysis: '',
      customer_insights: '',
      customer_personas: '',
      opportunity_mapping: ''
    },
    problem_understanding_context: {
      finalStatement: '',
    }
  });

  // Helper function to check if data is valid
  const isValidData = useCallback((data: any) => {
    if (!data) return false;
    
    const hasArrayData = Object.entries(data).some(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return false;
    });

    const hasObjectData = Object.entries(data).some(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return Object.keys(value).length > 0;
      }
      return false;
    });

    return hasArrayData || hasObjectData;
  }, []);

  // Check if a step needs to run
  const shouldRunStep = useCallback((step: string, dependencies: string[] = []) => {
    // Don't run if we've exceeded retry limit
    if (retryCount[step] >= 3) return false;
    
    // Don't run if we've run recently (within 30 seconds)
    if (Date.now() - lastRunTime < 30000) return false;
    
    // Check if step has valid data
    const hasValidData = isValidData(contexts[step]);
    if (hasValidData) return false;

    // Check if dependencies are met
    return dependencies.every(dep => {
      const depData = contexts[dep];
      return depData && isValidData(depData);
    });
  }, [contexts, isValidData, retryCount, lastRunTime]);

  // Run a single analysis step
  const runStep = useCallback(async (step: string, dependencies: string[] = []) => {
    if (!currentProject) return;
    if (!shouldRunStep(step, dependencies)) return;

    // Prevent concurrent runs
    if (isRunning) {
      console.log('Analysis already running, skipping');
      return;
    }

    setCurrentStep(step);
    setIsRunning(true);
    setError(null);
    setLastRunTime(Date.now());

    try {
      let result;
      switch (step) {
        case 'market_research':
          const marketAgent = new OpenAIMarketResearchAgent(currentProject.id, supabase);
          result = await marketAgent.analyzeMarket(currentProject.problem_understanding_context);
          break;
        case 'competitor_analysis':
          const competitorAgent = new OpenAICompetitorAnalysisAgent(currentProject.id, supabase);
          result = await competitorAgent.analyzeCompetitors(contexts.market_research);
          break;
        case 'feature_analysis':
          const featureAgent = new OpenAIFeatureAnalysisAgent(currentProject.id, supabase);
          if (!contexts.competitor_analysis?.id) {
            throw new Error('Competitor analysis context ID not found');
          }
          result = await featureAgent.analyzeFeatures(contexts.competitor_analysis.id);
          break;
        case 'customer_insights':
          const insightsAgent = new OpenAICustomerInsightsAgent(currentProject.id, supabase);
          result = await insightsAgent.analyzeCustomerInsights(contexts.feature_analysis);
          break;
        case 'customer_persona':
          const personaAgent = new OpenAICustomerPersonaAgent(currentProject.id, supabase);
          result = await personaAgent.generatePersonas(contexts.market_research);
          if (result?.personas) {
            // Create a single record with all personas
            const { error: saveError } = await supabase
              .from('customer_persona_context')
              .insert({
                project_id: currentProject.id,
                personas: result.personas,
                market_research_context: contexts.market_research?.id,
                status: 'complete',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_updated: new Date().toISOString()
              });
            
            if (saveError) throw saveError;
            result = { status: 'complete' };
          }
          break;
        case 'opportunity_mapping':
          const opportunityAgent = new OpenAIOpportunityMappingAgent(currentProject.id, supabase);
          result = await opportunityAgent.mapOpportunities(
            contexts.market_research,
            contexts.competitor_analysis,
            contexts.feature_analysis,
            contexts.customer_insights
          );
          break;
      }

      if (result) {
        setContexts(prev => ({
          ...prev,
          [step]: result
        }));
        setRetryCount(prev => ({
          ...prev,
          [step]: 0
        }));

        // Update project progress
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            progress: {
              ...currentProject.progress,
              [step]: 'complete'
            }
          })
          .eq('id', currentProject.id);

        if (updateError) {
          console.error('Failed to update project progress:', updateError);
          throw updateError;
        }
      }
    } catch (err) {
      console.error(`Error in step ${step}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Handle rate limits specifically
      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        setError(`Rate limit reached for ${step}. Please try again later.`);
        // Store retry count in localStorage for persistence
        const storedRetries = JSON.parse(localStorage.getItem('analysisRetries') || '{}');
        storedRetries[step] = (storedRetries[step] || 0) + 1;
        localStorage.setItem('analysisRetries', JSON.stringify(storedRetries));
      } else {
        setError(`Failed to complete ${step}: ${errorMessage}`);
      }
      
      setRetryCount(prev => ({
        ...prev,
        [step]: (prev[step] || 0) + 1
      }));
    } finally {
      setIsRunning(false);
      setCurrentStep(null);
    }
  }, [currentProject, contexts, shouldRunStep, isRunning]);

  // Helper function to get next steps that can run
  const getNextSteps = useCallback((completedStep: string, currentContexts: Record<string, any>) => {
    const stepDependencies = {
      market_research: [],
      competitor_analysis: ['market_research'],
      feature_analysis: ['competitor_analysis'],
      customer_insights: ['feature_analysis'],
      customer_persona: ['market_research'],
      opportunity_mapping: ['market_research', 'competitor_analysis', 'feature_analysis', 'customer_insights']
    };

    return Object.entries(stepDependencies)
      .filter(([step, deps]) => {
        // Skip if step is already complete
        if (currentContexts[step] && isValidData(currentContexts[step])) {
          return false;
        }
        
        // Check if all dependencies are met
        return deps.every(dep => 
          currentContexts[dep] && isValidData(currentContexts[dep])
        );
      })
      .map(([step]) => step);
  }, [isValidData]);

  // Helper function to get dependencies for a step
  const getDependencies = useCallback((step: string) => {
    const stepDependencies = {
      market_research: [],
      competitor_analysis: ['market_research'],
      feature_analysis: ['competitor_analysis'],
      customer_insights: ['feature_analysis'],
      customer_persona: ['market_research'],
      opportunity_mapping: ['market_research', 'competitor_analysis', 'feature_analysis', 'customer_insights']
    };
    return stepDependencies[step as keyof typeof stepDependencies] || [];
  }, []);

  // Retry a specific step
  const retryStep = useCallback(async (step: string) => {
    console.log(`Retrying step ${step}`);
    const dependencies = {
      market_research: [],
      competitor_analysis: ['market_research'],
      feature_analysis: ['competitor_analysis'],
      customer_insights: ['feature_analysis'],
      customer_persona: ['market_research'],
      opportunity_mapping: ['market_research', 'competitor_analysis', 'feature_analysis', 'customer_insights']
    };

    await runStep(step, dependencies[step as keyof typeof dependencies]);
  }, [runStep]);

  // Run the entire analysis pipeline
  const runAnalysis = useCallback(async () => {
    if (!currentProject) {
      console.log('No current project, skipping analysis');
      return;
    }

    if (isRunning) {
      console.log('Analysis already running, skipping');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      // Define the analysis steps in order of execution
      const analysisSteps = [
        { step: 'market_research', deps: [] },
        { step: 'competitor_analysis', deps: ['market_research'] },
        { step: 'feature_analysis', deps: ['competitor_analysis'] },
        { step: 'customer_insights', deps: ['feature_analysis'] },
        { step: 'customer_persona', deps: ['market_research'] },
        { step: 'opportunity_mapping', deps: ['market_research', 'competitor_analysis', 'feature_analysis', 'customer_insights'] }
      ];

      // First, check if any steps need to be run
      const stepsToRun = analysisSteps.filter(({ step, deps }) => {
        // Skip if this step is already complete
        if (contexts[step] && isValidData(contexts[step])) {
          console.log(`Skipping ${step} - already complete`);
          return false;
        }

        // Check if dependencies are met
        const dependenciesMet = deps.every(dep => {
          const depData = contexts[dep];
          return depData && isValidData(depData);
        });

        if (!dependenciesMet) {
          console.log(`Skipping ${step} - dependencies not met`);
          return false;
        }

        return true;
      });

      if (stepsToRun.length === 0) {
        console.log('No steps need to be run');
        return;
      }

      // Run only the steps that need to be run
      for (const { step } of stepsToRun) {
        console.log(`Running ${step} analysis`);
        setCurrentStep(step);

        let result;
        switch (step) {
          case 'market_research':
            const marketAgent = new OpenAIMarketResearchAgent(currentProject.id, supabase);
            result = await marketAgent.analyzeMarket(currentProject.problem_understanding_context);
            break;
          case 'competitor_analysis':
            const competitorAgent = new OpenAICompetitorAnalysisAgent(currentProject.id, supabase);
            result = await competitorAgent.analyzeCompetitors(contexts.market_research);
            break;
          case 'feature_analysis':
            const featureAgent = new OpenAIFeatureAnalysisAgent(currentProject.id, supabase);
            if (!contexts.competitor_analysis?.id) {
              throw new Error('Competitor analysis context ID not found');
            }
            result = await featureAgent.analyzeFeatures(contexts.competitor_analysis.id);
            break;
          case 'customer_insights':
            const insightsAgent = new OpenAICustomerInsightsAgent(currentProject.id, supabase);
            result = await insightsAgent.analyzeCustomerInsights(contexts.feature_analysis);
            break;
          case 'customer_persona':
            const personaAgent = new OpenAICustomerPersonaAgent(currentProject.id, supabase);
            result = await personaAgent.generatePersonas(contexts.market_research);
            break;
          case 'opportunity_mapping':
            const opportunityAgent = new OpenAIOpportunityMappingAgent(currentProject.id, supabase);
            result = await opportunityAgent.mapOpportunities(
              contexts.market_research,
              contexts.competitor_analysis,
              contexts.feature_analysis,
              contexts.customer_insights
            );
            break;
        }

        if (result) {
          // Update the context for this step
          setContexts(prev => ({
            ...prev,
            [step]: result
          }));
          setRetryCount(prev => ({
            ...prev,
            [step]: 0
          }));

          // Wait a short time to allow the agent to save its context
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Fetch the updated context
          const { data: updatedContext, error: fetchError } = await supabase
            .from(`${step}_context`)
            .select('*')
            .eq('project_id', currentProject.id)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error(`Error fetching updated ${step} context:`, fetchError);
          } else if (updatedContext) {
            // Only update if the fetched context is valid
            if (isValidData(updatedContext)) {
              setContexts(prev => ({
                ...prev,
                [step]: updatedContext
              }));
            } else {
              console.log(`Fetched ${step} context is invalid, marking as incomplete`);
              // Mark the step as incomplete in contexts
              setContexts(prev => ({
                ...prev,
                [step]: null
              }));
            }
          }
        }
      }
    } catch (err) {
      console.error('Error in analysis pipeline:', err);
      setError(err instanceof Error ? err.message : 'Analysis pipeline failed');
    } finally {
      setIsRunning(false);
      setCurrentStep(null);
    }
  }, [currentProject, contexts, isRunning, isValidData]);

  // Fetch all contexts at once
  const fetchAllContexts = useCallback(async () => {
    if (!currentProject?.id || isRunning || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contextTypes = [
        'market_research',
        'competitor_analysis',
        'feature_analysis',
        'customer_insights',
        'customer_persona',
        'opportunity_mapping'
      ];

      const results = await Promise.all(
        contextTypes.map(async type => {
          try {
            const tableName = type === 'customer_persona' ? 'customer_persona_context' : `${type}_context`;
            const result = await supabase
              .from(tableName)
              .select('*')
              .eq('project_id', currentProject.id)
              .single();

            if (result.error) {
              if (result.error.code === '42P01' || result.error.code === 'PGRST116') {
                return { data: null };
              }
              throw result.error;
            }
            return result;
          } catch (err) {
            console.error(`Error fetching ${type} context:`, err);
            return { data: null };
          }
        })
      );

      const newContexts = contextTypes.reduce((acc, type, index) => {
        const data = results[index].data;
        if (!data) {
          acc[type] = null;
          return acc;
        }

        // Transform the data based on the type
        switch (type) {
          case 'customer_persona':
            acc[type] = {
              personas: data.personas || [],
              marketResearchContext: data.market_research_context,
              createdAt: data.created_at,
              updatedAt: data.updated_at
            };
            break;
          case 'opportunity_mapping':
            acc[type] = {
              marketGaps: data.market_gaps || [],
              strategicOpportunities: data.strategic_opportunities || [],
              recommendations: data.recommendations || [],
              riskAssessment: data.risk_assessment || [],
              implementationRoadmap: data.implementation_roadmap || [],
              createdAt: data.created_at,
              updatedAt: data.updated_at
            };
            break;
          default:
            acc[type] = data;
        }
        return acc;
      }, {} as Record<string, any>);

      setContexts(newContexts);
    } catch (err) {
      console.error('Error fetching contexts:', err);
      setError('Failed to fetch analysis data');
    } finally {
      setIsLoading(false);
    }
  }, [currentProject?.id, isRunning, isLoading]);

  // Initial fetch and setup
  useEffect(() => {
    if (currentProject?.id && !isRunning && !isLoading) {
      fetchAllContexts();
    }
  }, [currentProject?.id, isRunning, isLoading, fetchAllContexts]);

  // Effect to start the analysis pipeline when contexts are loaded
  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const runAnalysisIfNeeded = async () => {
      if (!mounted) return;
      
      // Check if all steps are complete
      const allStepsComplete = Object.entries(contexts).every(([step, data]) => {
        return isValidData(data);
      });

      if (allStepsComplete) {
        console.log('All analysis steps are complete, no need to run analysis');
        return;
      }

      // Don't run if we're in the middle of handling an invalid context
      if (currentStep) {
        console.log('Currently handling invalid context, skipping analysis');
        return;
      }

      if (!isRunning && currentProject?.id && Object.keys(contexts).length > 0 && !isLoading && !error) {
        try {
          await runAnalysis();
        } catch (err) {
          console.error('Error in analysis pipeline:', err);
          setError(err instanceof Error ? err.message : 'Analysis pipeline failed');
          // Set a retry timeout instead of immediate retry
          retryTimeout = setTimeout(() => {
            setError(null);
          }, 5000); // Wait 5 seconds before clearing error and allowing retry
        }
      }
    };

    runAnalysisIfNeeded();

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [contexts, isRunning, currentProject?.id, isLoading, runAnalysis, isValidData, currentStep]);

  const value = {
    marketResearch: contexts.market_research,
    competitorAnalysis: contexts.competitor_analysis,
    featureAnalysis: contexts.feature_analysis,
    customerInsights: contexts.customer_insights,
    customerPersonas: contexts.customer_persona,
    opportunityMapping: contexts.opportunity_mapping,
    currentStep,
    isRunning,
    isLoading,
    error,
    fetchAllContexts,
    runAnalysisPipeline: runAnalysis,
    retryStep
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}; 
import React, { createContext, useContext, useState } from 'react';
import { useProject } from './ProjectContext';
import { supabase } from '@/lib/supabase/client';
import { OpenAIMarketResearchAgent } from '@/lib/ai/market-research-agent';
import { OpenAICompetitorAnalysisAgent } from '@/lib/ai/competitor-analysis-agent';
import { OpenAIFeatureAnalysisAgent } from '@/lib/ai/feature-analysis-agent';
import { OpenAICustomerInsightsAgent } from '@/lib/ai/customer-insights-agent';
import { OpenAICustomerPersonaAgent } from '@/lib/ai/customer-persona-agent';
import { OpenAIOpportunityMappingAgent } from '@/lib/ai/opportunity-mapping-agent';

interface AnalysisContextType {
  isLoading: boolean;
  runAnalysis: () => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentProject } = useProject();
  const [isLoading, setIsLoading] = useState(false);

  const runAnalysis = async () => {
    if (!currentProject?.id || isLoading) return;

    setIsLoading(true);

    try {
      // Get problem context first
      const { data: problemContext, error: problemError } = await supabase
        .from('problem_understanding_context')
        .select('*')
        .eq('project_id', currentProject.id)
        .single();

      if (problemError) {
        throw new Error('Failed to fetch problem context');
      }

      // Run market research first
      const marketAgent = new OpenAIMarketResearchAgent(currentProject.id, supabase);
      const marketResearch = await marketAgent.analyzeMarket(problemContext);

      // Run competitor analysis
      const competitorAgent = new OpenAICompetitorAnalysisAgent(currentProject.id, supabase);
      const competitorAnalysis = await competitorAgent.analyzeCompetitors(marketResearch.context);

      // Run feature analysis
      const featureAgent = new OpenAIFeatureAnalysisAgent(currentProject.id, supabase);
      const featureAnalysis = await featureAgent.analyzeFeatures(competitorAnalysis.context.id);

      // Run customer insights
      const insightsAgent = new OpenAICustomerInsightsAgent(currentProject.id, supabase);
      const customerInsights = await insightsAgent.analyzeCustomerInsights(featureAnalysis.context.id);

      // Run customer persona
      const personaAgent = new OpenAICustomerPersonaAgent(currentProject.id, supabase);
      const customerPersona = await personaAgent.generatePersonas(marketResearch.context);

      // Run opportunity mapping
      const opportunityAgent = new OpenAIOpportunityMappingAgent(currentProject.id, supabase);
      await opportunityAgent.mapOpportunities(
        marketResearch.context.id,
        competitorAnalysis.context.id,
        featureAnalysis.context.id,
        customerInsights.context.id
      );

      // Update project phase
      await supabase
        .from('projects')
        .update({ current_phase: 'analysis_complete' })
        .eq('id', currentProject.id);

      // Refresh the page to show results
      window.location.reload();
    } catch (err) {
      console.error('Analysis failed:', err);
      // Update project phase to error
      await supabase
        .from('projects')
        .update({ current_phase: 'analysis_error' })
        .eq('id', currentProject.id);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoading,
    runAnalysis
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
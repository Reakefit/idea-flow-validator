import { OpenAI } from 'openai';
import { supabase } from '@/lib/supabase';
import { 
  CustomerInsightsContext, 
  CustomerInsightsResult,
  PainPoint,
  CompetitorAnalysisContext,
  FeatureAnalysisContext
} from './types';

export class OpenAICustomerInsightsAgent {
  private context: CustomerInsightsContext;
  private openai: OpenAI;
  private projectId: string;
  private supabase: typeof supabase;

  constructor(projectId: string, supabaseClient: typeof supabase) {
    console.log('Initializing OpenAICustomerInsightsAgent with projectId:', projectId);
    
    if (!projectId) {
      throw new Error('Project ID is required for OpenAICustomerInsightsAgent');
    }
    this.projectId = projectId;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    this.supabase = supabaseClient;
    this.context = {
      id: crypto.randomUUID(),
      projectId,
      featureAnalysisContextId: null,
      painPoints: [],
      satisfactionMetrics: [],
      featureRequests: [],
      sentimentAnalysis: [],
      usagePatterns: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.initializeProjectRows();
  }

  private async initializeProjectRows(): Promise<void> {
    try {
      // Check if we already have rows for this project
      const { data: existingRows, error: fetchError } = await this.supabase
        .from('customer_insights_context')
        .select('*')
        .eq('project_id', this.projectId);

      if (fetchError) {
        console.error('Error checking for existing rows:', fetchError);
        return;
      }

      // If no rows exist, create one
      if (!existingRows || existingRows.length === 0) {
        // First, get the latest feature analysis context ID
        const { data: featureAnalysis, error: featureError } = await this.supabase
          .from('feature_analysis_context')
          .select('id')
          .eq('project_id', this.projectId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (featureError) {
          console.error('Error fetching feature analysis context:', featureError);
        }

        const { error: insertError } = await this.supabase
          .from('customer_insights_context')
          .insert({
            project_id: this.projectId,
            feature_analysis_context_id: featureAnalysis?.[0]?.id || null,
            pain_points: [],
            satisfaction_metrics: [],
            feature_requests: [],
            sentiment_analysis: [],
            usage_patterns: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating initial row:', insertError);
        }
      } else {
        // Update the context with existing data
        const latestRow = existingRows[0];
        this.context = {
          id: latestRow.id,
          projectId: this.projectId,
          featureAnalysisContextId: latestRow.feature_analysis_context_id,
          painPoints: latestRow.pain_points || [],
          satisfactionMetrics: latestRow.satisfaction_metrics || [],
          featureRequests: latestRow.feature_requests || [],
          sentimentAnalysis: latestRow.sentiment_analysis || [],
          usagePatterns: latestRow.usage_patterns || [],
          createdAt: latestRow.created_at,
          updatedAt: latestRow.updated_at
        };
      }
    } catch (error) {
      console.error('Error in initializeProjectRows:', error);
    }
  }

  async analyzeCustomerInsights(featureAnalysisContextId: string): Promise<CustomerInsightsResult> {
    try {
      console.log(`Starting customer insights analysis with feature context ID: ${featureAnalysisContextId}`);
      
      // Updated to match the interface requirement
      // First get the feature analysis context by ID
      const { data: featureContextData, error: featureError } = await this.supabase
        .from('feature_analysis_context')
        .select('*')
        .eq('id', featureAnalysisContextId)
        .single();
      
      if (featureError) {
        console.error('Error fetching feature analysis context:', featureError);
        throw new Error(`Failed to fetch feature analysis context: ${featureError.message}`);
      }
      
      if (!featureContextData) {
        throw new Error(`Feature analysis context not found for ID: ${featureAnalysisContextId}`);
      }
      
      // Now get the competitor analysis context ID from the feature context
      const competitorAnalysisContextId = featureContextData.competitor_analysis_context_id;
      
      if (!competitorAnalysisContextId) {
        throw new Error('Competitor analysis context ID not found in feature analysis context');
      }
      
      // Get the competitor analysis context
      const { data: competitorContextData, error: competitorError } = await this.supabase
        .from('competitor_analysis_context')
        .select('*')
        .eq('id', competitorAnalysisContextId)
        .single();
      
      if (competitorError) {
        console.error('Error fetching competitor analysis context:', competitorError);
        throw new Error(`Failed to fetch competitor analysis context: ${competitorError.message}`);
      }
      
      if (!competitorContextData) {
        throw new Error(`Competitor analysis context not found for ID: ${competitorAnalysisContextId}`);
      }
      
      // Map the data to our types
      const featureAnalysisContext: FeatureAnalysisContext = {
        id: featureContextData.id,
        projectId: featureContextData.project_id,
        competitorAnalysisContextId: featureContextData.competitor_analysis_context_id,
        featureComparisonMatrix: featureContextData.feature_comparison_matrix || [],
        capabilityAnalysis: featureContextData.capability_analysis || [],
        documentationAnalysis: featureContextData.documentation_analysis || [],
        technicalSpecifications: featureContextData.technical_specifications || [],
        integrationAnalysis: featureContextData.integration_analysis || [],
        createdAt: featureContextData.created_at,
        updatedAt: featureContextData.updated_at
      };
      
      const competitorAnalysisContext: CompetitorAnalysisContext = {
        id: competitorContextData.id,
        projectId: competitorContextData.project_id,
        marketResearchContextId: competitorContextData.market_research_context_id,
        competitorProfiles: competitorContextData.competitor_profiles || [],
        featureMatrices: competitorContextData.feature_matrices || [],
        reviewAnalysis: competitorContextData.review_analysis || [],
        pricingAnalysis: competitorContextData.pricing_analysis || [],
        marketPositionAnalysis: competitorContextData.market_position_analysis || [],
        createdAt: competitorContextData.created_at,
        updatedAt: competitorContextData.updated_at
      };
      
      // Store the feature analysis context ID for later use
      this.context.featureAnalysisContextId = featureAnalysisContextId;
      
      // Now proceed with the analysis using both contexts
      return await this.performCustomerInsightsAnalysis(competitorAnalysisContext, featureAnalysisContext);
    } catch (error) {
      console.error('Error in analyzeCustomerInsights:', error);
      throw error;
    }
  }
  
  private async performCustomerInsightsAnalysis(
    competitorAnalysisContext: CompetitorAnalysisContext,
    featureAnalysisContext: FeatureAnalysisContext
  ): Promise<CustomerInsightsResult> {
    try {
      // Store the feature analysis context ID for later use
      this.context.featureAnalysisContextId = featureAnalysisContext.id;
      
      console.log('Analyzing customer insights using feature and competitor data');
      
      const response = await this.openai.chat.completions.create({
        model: 'o3-mini',
        messages: [
          {
            role: 'system',
            content: `Analyze customer insights based on the following feature and competitor analysis:
            
            Feature Analysis:
            ${JSON.stringify(featureAnalysisContext, null, 2)}
            
            Competitor Analysis:
            ${JSON.stringify(competitorAnalysisContext, null, 2)}
            
            Provide a detailed analysis in the following JSON format:
            {
              "painPoints": [
                {
                  "id": "string",
                  "segment": "string",
                  "description": "string",
                  "impact": "high|medium|low",
                  "frequency": "high|medium|low",
                  "currentSolutions": ["string"],
                  "gaps": ["string"]
                }
              ],
              "satisfactionMetrics": [
                {
                  "metric": "string",
                  "score": number,
                  "feedback": ["string"]
                }
              ],
              "featureRequests": [
                {
                  "id": "string",
                  "description": "string",
                  "priority": "high|medium|low",
                  "requestedBy": ["string"],
                  "useCases": ["string"]
                }
              ],
              "sentimentAnalysis": [
                {
                  "source": "string",
                  "overallSentiment": "positive|neutral|negative",
                  "keyThemes": ["string"],
                  "sentimentScores": [
                    {
                      "theme": "string",
                      "score": number
                    }
                  ]
                }
              ],
              "usagePatterns": [
                {
                  "pattern": "string",
                  "frequency": "high|medium|low",
                  "context": "string",
                  "painPoints": ["string"],
                  "opportunities": ["string"]
                }
              ]
            }`
          }
        ],
        max_completion_tokens: 12000,
        reasoning_effort: 'high'
      });

      console.log('Raw OpenAI response:', response.choices[0].message.content);

      if (!response.choices[0].message.content) {
        throw new Error('OpenAI response is empty');
      }

      let analysis;
      try {
        // Extract only the JSON object from the string in case there's any additional text
        const jsonMatch = response.choices[0].message.content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : response.choices[0].message.content;
        analysis = JSON.parse(jsonStr);
      } catch (error) {
        console.error('Failed to parse OpenAI response:', response.choices[0].message.content);
        throw new Error('Invalid JSON response from OpenAI');
      }

      if (!analysis || typeof analysis !== 'object') {
        throw new Error('Invalid analysis format from OpenAI');
      }

      // Validate and set default values for each section
      this.context.painPoints = analysis.painPoints || [];
      this.context.satisfactionMetrics = analysis.satisfactionMetrics || [];
      this.context.featureRequests = analysis.featureRequests || [];
      this.context.sentimentAnalysis = analysis.sentimentAnalysis || [];
      this.context.usagePatterns = analysis.usagePatterns || [];
      this.context.updatedAt = new Date().toISOString();

      console.log('Processed analysis:', {
        painPoints: this.context.painPoints.length,
        satisfactionMetrics: this.context.satisfactionMetrics.length,
        featureRequests: this.context.featureRequests.length,
        sentimentAnalysis: this.context.sentimentAnalysis.length,
        usagePatterns: this.context.usagePatterns.length
      });

      // Save context
      await this.saveContext();

      return {
        painPoints: this.context.painPoints,
        satisfactionMetrics: this.context.satisfactionMetrics,
        featureRequests: this.context.featureRequests,
        sentimentAnalysis: this.context.sentimentAnalysis,
        usagePatterns: this.context.usagePatterns,
        nextQuestion: 'Would you like to refine the customer insights further?',
        isComplete: false
      };
    } catch (error) {
      console.error('Error in performCustomerInsightsAnalysis:', error);
      throw error;
    }
  }

  async refineAnalysis(feedback: string): Promise<CustomerInsightsResult> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'o3-mini',
        messages: [
          {
            role: 'developer',
            content: `Refine the customer insights analysis based on the following feedback:
            ${feedback}
            
            Current analysis:
            ${JSON.stringify(this.context, null, 2)}
            
            Provide a refined analysis in the same JSON format as before, focusing on:
            1. Specific actionable insights
            2. Updated pain points
            3. Refined satisfaction metrics
            4. New feature requests
            5. Updated sentiment analysis
            6. New usage patterns`
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'web_search',
            description: 'Search the web for additional customer information'
          }
        }],
        max_completion_tokens: 8000,
        reasoning_effort: 'high'
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content in response');

      const refinedAnalysis = JSON.parse(content);
      
      // Update our context with the refined results
      this.context.painPoints = refinedAnalysis.painPoints || this.context.painPoints;
      this.context.satisfactionMetrics = refinedAnalysis.satisfactionMetrics || this.context.satisfactionMetrics;
      this.context.featureRequests = refinedAnalysis.featureRequests || this.context.featureRequests;
      this.context.sentimentAnalysis = refinedAnalysis.sentimentAnalysis || this.context.sentimentAnalysis;
      this.context.usagePatterns = refinedAnalysis.usagePatterns || this.context.usagePatterns;
      this.context.updatedAt = new Date().toISOString();
      
      await this.saveContext();
      
      return {
        painPoints: this.context.painPoints,
        satisfactionMetrics: this.context.satisfactionMetrics,
        featureRequests: this.context.featureRequests,
        sentimentAnalysis: this.context.sentimentAnalysis,
        usagePatterns: this.context.usagePatterns,
        nextQuestion: 'Are these insights helpful? What other aspects would you like to understand?',
        isComplete: false
      };
    } catch (error) {
      console.error('Error in refineAnalysis:', error);
      throw error;
    }
  }

  getContext(): CustomerInsightsContext {
    return this.context;
  }

  async resetContext(): Promise<void> {
    this.context = {
      id: crypto.randomUUID(),
      projectId: this.projectId,
      featureAnalysisContextId: null,
      painPoints: [],
      satisfactionMetrics: [],
      featureRequests: [],
      sentimentAnalysis: [],
      usagePatterns: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await this.saveContext();
  }

  async saveContext(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('customer_insights_context')
        .upsert({
          id: this.context.id,
          project_id: this.context.projectId,
          feature_analysis_context_id: this.context.featureAnalysisContextId,
          pain_points: this.context.painPoints,
          satisfaction_metrics: this.context.satisfactionMetrics,
          feature_requests: this.context.featureRequests,
          sentiment_analysis: this.context.sentimentAnalysis,
          usage_patterns: this.context.usagePatterns,
          created_at: this.context.createdAt,
          updated_at: this.context.updatedAt
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving customer insights context:', error);
      throw error;
    }
  }

  async loadContext(projectId: string): Promise<void> {
    try {
      const { data: allRows, error: fetchError } = await this.supabase
        .from('customer_insights_context')
        .select('*')
        .eq('project_id', projectId);

      if (fetchError) {
        console.warn('Failed to load context:', fetchError);
        this.context = {
          id: crypto.randomUUID(),
          projectId,
          featureAnalysisContextId: null,
          painPoints: [],
          satisfactionMetrics: [],
          featureRequests: [],
          sentimentAnalysis: [],
          usagePatterns: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return;
      }

      if (!allRows || allRows.length === 0) {
        this.context = {
          id: crypto.randomUUID(),
          projectId,
          featureAnalysisContextId: null,
          painPoints: [],
          satisfactionMetrics: [],
          featureRequests: [],
          sentimentAnalysis: [],
          usagePatterns: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return;
      }

      const latestRow = allRows[0];

      this.context = {
        id: latestRow.id,
        projectId,
        featureAnalysisContextId: latestRow.feature_analysis_context_id,
        painPoints: latestRow.pain_points || [],
        satisfactionMetrics: latestRow.satisfaction_metrics || [],
        featureRequests: latestRow.feature_requests || [],
        sentimentAnalysis: latestRow.sentiment_analysis || [],
        usagePatterns: latestRow.usage_patterns || [],
        createdAt: latestRow.created_at,
        updatedAt: latestRow.updated_at
      };
    } catch (error) {
      console.error('Error in loadContext:', error);
      throw error;
    }
  }
} 
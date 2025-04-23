import { OpenAI } from 'openai';
import { supabase } from '@/lib/supabase';
import { 
  OpportunityMappingContext,
  OpportunityMappingResult,
  MarketResearchContext,
  CompetitorAnalysisContext,
  FeatureAnalysisContext,
  CustomerInsightsContext,
  MarketGap,
  StrategicOpportunity,
  Recommendation,
  RiskAssessment,
  ImplementationRoadmap
} from './types';

export class OpenAIOpportunityMappingAgent {
  private context: OpportunityMappingContext;
  private openai: OpenAI;
  private projectId: string;
  private supabase: typeof supabase;

  constructor(projectId: string, supabaseClient: typeof supabase) {
    console.log('Initializing OpenAIOpportunityMappingAgent with projectId:', projectId);
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    this.context = {
      id: crypto.randomUUID(),
      projectId,
      marketResearchContextId: null,
      competitorAnalysisContextId: null,
      featureAnalysisContextId: null,
      customerInsightsContextId: null,
      marketGaps: [],
      strategicOpportunities: [],
      recommendations: [],
      riskAssessment: [],
      implementationRoadmap: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    this.projectId = projectId;
    this.supabase = supabaseClient;
    this.initializeProjectRows();
  }

  private async initializeProjectRows(): Promise<void> {
    try {
      // Check if a row already exists for this project
      const { data, error: fetchError } = await this.supabase
        .from('opportunity_mapping_context')
        .select('*')
        .eq('project_id', this.projectId);

      if (fetchError) {
        console.error('Error checking for existing rows:', fetchError);
        throw fetchError;
      }

      if (!data || data.length === 0) {
        // Create initial row
        console.log('No opportunity mapping context found, creating initial row');
        const { error: insertError } = await this.supabase
          .from('opportunity_mapping_context')
          .insert({
            project_id: this.projectId,
            market_research_context_id: null,
            competitor_analysis_context_id: null,
            feature_analysis_context_id: null,
            customer_insights_context_id: null,
            market_gaps: [],
            strategic_opportunities: [],
            recommendations: [],
            risk_assessment: [],
            implementation_roadmap: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating initial row:', insertError);
          throw insertError;
        }

        console.log('Created initial opportunity mapping context for project:', this.projectId);
      } else {
        console.log('Found existing opportunity mapping context for project:', this.projectId);
      }
    } catch (error) {
      console.error('Error in initializeProjectRows:', error);
      throw error;
    }
  }

  async mapOpportunities(
    marketResearchContextId: string,
    competitorAnalysisContextId: string,
    featureAnalysisContextId: string,
    customerInsightsContextId: string
  ): Promise<OpportunityMappingResult> {
    try {
      // First ensure our context is initialized
      await this.initializeProjectRows();

      // Fetch all required contexts using project_id
      const [
        { data: marketResearch, error: marketResearchError },
        { data: competitorAnalysis, error: competitorError },
        { data: featureAnalysis, error: featureError },
        { data: customerInsights, error: customerInsightsError }
      ] = await Promise.all([
        this.supabase
          .from('market_research_context')
          .select('*')
          .eq('project_id', this.projectId)
          .single(),
        this.supabase
          .from('competitor_analysis_context')
          .select('*')
          .eq('project_id', this.projectId)
          .single(),
        this.supabase
          .from('feature_analysis_context')
          .select('*')
          .eq('project_id', this.projectId)
          .single(),
        this.supabase
          .from('customer_insights_context')
          .select('*')
          .eq('project_id', this.projectId)
          .single()
      ]);

      // Check for errors (ignoring PGRST116)
      if (marketResearchError && marketResearchError.code !== 'PGRST116') throw marketResearchError;
      if (competitorError && competitorError.code !== 'PGRST116') throw competitorError;
      if (featureError && featureError.code !== 'PGRST116') throw featureError;
      if (customerInsightsError && customerInsightsError.code !== 'PGRST116') throw customerInsightsError;

      // Check if all contexts exist, create empty ones if needed
      const marketResearchData = marketResearch || { id: null };
      const competitorAnalysisData = competitorAnalysis || { id: null };
      const featureAnalysisData = featureAnalysis || { id: null };
      const customerInsightsData = customerInsights || { id: null };
      
      // Update our context with the IDs
      this.context.marketResearchContextId = marketResearchData.id;
      this.context.competitorAnalysisContextId = competitorAnalysisData.id;
      this.context.featureAnalysisContextId = featureAnalysisData.id;
      this.context.customerInsightsContextId = customerInsightsData.id;

      const response = await this.openai.chat.completions.create({
        model: 'o3-mini',
        messages: [
          {
            role: 'developer',
            content: `Analyze opportunities based on the following comprehensive context. IMPORTANT: Base your analysis on actual research and data from the provided contexts. Do not hallucinate or make assumptions. Focus on concrete, evidence-based insights:

            Market Research: ${JSON.stringify(marketResearchData, null, 2)}
            Competitor Analysis: ${JSON.stringify(competitorAnalysisData, null, 2)}
            Feature Analysis: ${JSON.stringify(featureAnalysisData, null, 2)}
            Customer Insights: ${JSON.stringify(customerInsightsData, null, 2)}
            
            Provide a detailed, evidence-based analysis in the following JSON format:
            {
              "marketGaps": [
                {
                  "id": "string",
                  "description": "string",
                  "size": "small|medium|large",
                  "urgency": "low|medium|high",
                  "competitors": ["string"],
                  "customerPainPoints": ["string"],
                  "featureGaps": ["string"]
                }
              ],
              "strategicOpportunities": [
                {
                  "id": "string",
                  "description": "string",
                  "marketGapId": "string",
                  "potentialImpact": "string",
                  "requiredResources": ["string"],
                  "timeline": "string",
                  "competitorAdvantage": "string",
                  "customerValue": "string",
                  "technicalFeasibility": "low|medium|high",
                  "marketReadiness": "low|medium|high"
                }
              ],
              "recommendations": [
                {
                  "id": "string",
                  "description": "string",
                  "rationale": "string",
                  "priority": "low|medium|high",
                  "dependencies": ["string"],
                  "estimatedEffort": "string",
                  "expectedOutcome": "string",
                  "risks": ["string"]
                }
              ],
              "riskAssessment": [
                {
                  "id": "string",
                  "risk": "string",
                  "impact": "low|medium|high",
                  "probability": "low|medium|high",
                  "mitigation": ["string"],
                  "affectedAreas": ["string"],
                  "earlyWarningSigns": ["string"]
                }
              ],
              "implementationRoadmap": [
                {
                  "phase": "string",
                  "objectives": ["string"],
                  "deliverables": ["string"],
                  "timeline": "string",
                  "dependencies": ["string"],
                  "resources": ["string"],
                  "successMetrics": ["string"],
                  "risks": ["string"]
                }
              ]
            }`
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'web_search',
            description: 'Search the web for additional market insights',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query'
                }
              },
              required: ['query']
            }
          }
        }],
        max_completion_tokens: 12000,
        reasoning_effort: 'high'
      });

      console.log('Raw OpenAI response:', response.choices[0].message.content);

      if (!response.choices[0].message.content) {
        throw new Error('OpenAI response is empty');
      }

      let analysis;
      try {
        analysis = JSON.parse(response.choices[0].message.content);
      } catch (error) {
        console.error('Failed to parse OpenAI response:', response.choices[0].message.content);
        throw new Error('Invalid JSON response from OpenAI');
      }

      if (!analysis || typeof analysis !== 'object') {
        throw new Error('Invalid analysis format from OpenAI');
      }

      // Update context with the analysis
      this.context.marketGaps = analysis.marketGaps || [];
      this.context.strategicOpportunities = analysis.strategicOpportunities || [];
      this.context.recommendations = analysis.recommendations || [];
      this.context.implementationRoadmap = analysis.implementationRoadmap || [];
      this.context.riskAssessment = analysis.riskAssessment || [];
      this.context.updatedAt = new Date().toISOString();

      // Save context with proper upsert
      await this.saveContext();

      return {
        marketGaps: analysis.marketGaps || [],
        strategicOpportunities: analysis.strategicOpportunities || [],
        recommendations: analysis.recommendations || [],
        riskAssessment: analysis.riskAssessment || [],
        implementationRoadmap: analysis.implementationRoadmap || [],
        nextQuestion: null,
        isComplete: true
      };
    } catch (error) {
      console.error('Error mapping opportunities:', error);
      throw error;
    }
  }

  async refineAnalysis(feedback: string): Promise<OpportunityMappingResult> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'o3-mini',
        messages: [
          {
            role: 'developer',
            content: `Refine the opportunity mapping based on the following feedback:
            ${feedback}
            
            Current analysis:
            ${JSON.stringify(this.context, null, 2)}
            
            Provide a refined analysis in the same JSON format as before, focusing on:
            1. Updated market gaps and opportunities
            2. Refined recommendations
            3. Enhanced risk assessment
            4. Improved implementation roadmap`
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'web_search',
            description: 'Search the web for additional market insights',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query'
                }
              },
              required: ['query']
            }
          }
        }],
        max_completion_tokens: 8000,
        reasoning_effort: 'high'
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content in response');

      const refinedAnalysis = JSON.parse(content);
      
      // Update context
      this.context = {
        ...this.context,
        marketGaps: refinedAnalysis.marketGaps,
        strategicOpportunities: refinedAnalysis.strategicOpportunities,
        recommendations: refinedAnalysis.recommendations,
        implementationRoadmap: refinedAnalysis.implementationRoadmap,
        riskAssessment: refinedAnalysis.riskAssessment,
        updatedAt: new Date().toISOString()
      };

      // Save context
      await this.saveContext();

      return {
        ...refinedAnalysis,
        nextQuestion: 'Would you like to focus on any specific aspect of the opportunity mapping?',
        isComplete: true
      };
    } catch (error) {
      console.error('Error refining opportunity mapping:', error);
      throw error;
    }
  }

  getContext(): OpportunityMappingContext {
    return this.context;
  }

  resetContext(): void {
    this.context = {
      id: crypto.randomUUID(),
      projectId: this.context.projectId,
      marketResearchContextId: null,
      competitorAnalysisContextId: null,
      featureAnalysisContextId: null,
      customerInsightsContextId: null,
      marketGaps: [],
      strategicOpportunities: [],
      recommendations: [],
      riskAssessment: [],
      implementationRoadmap: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async saveContext(): Promise<void> {
    try {
      if (!this.context.projectId) {
        throw new Error('Project ID is required to save context');
      }

      const { error } = await this.supabase
        .from('opportunity_mapping_context')
        .upsert({
          id: this.context.id,
          project_id: this.context.projectId,
          market_research_context_id: this.context.marketResearchContextId,
          competitor_analysis_context_id: this.context.competitorAnalysisContextId,
          feature_analysis_context_id: this.context.featureAnalysisContextId,
          customer_insights_context_id: this.context.customerInsightsContextId,
          market_gaps: this.context.marketGaps,
          strategic_opportunities: this.context.strategicOpportunities,
          recommendations: this.context.recommendations,
          risk_assessment: this.context.riskAssessment,
          implementation_roadmap: this.context.implementationRoadmap,
          created_at: this.context.createdAt,
          updated_at: this.context.updatedAt
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving opportunity mapping context:', error);
      throw error;
    }
  }

  async loadContext(): Promise<void> {
    try {
      if (!this.context.projectId) {
        throw new Error('Project ID is required to load context');
      }

      const { data, error } = await this.supabase
        .from('opportunity_mapping_context')
        .select('*')
        .eq('project_id', this.context.projectId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No opportunity mapping context found for project ID:', this.context.projectId);
          console.log('Using empty opportunity mapping context');
          // Context remains as initialized
          return;
        }
        console.error('Error loading opportunity mapping context:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No opportunity mapping context data found for project ID:', this.context.projectId);
        // Context remains as initialized
        return;
      }

      const context = data[0];
      this.context = {
        id: context.id,
        projectId: this.context.projectId,
        marketResearchContextId: context.market_research_context_id,
        competitorAnalysisContextId: context.competitor_analysis_context_id,
        featureAnalysisContextId: context.feature_analysis_context_id,
        customerInsightsContextId: context.customer_insights_context_id,
        marketGaps: context.market_gaps || [],
        strategicOpportunities: context.strategic_opportunities || [],
        recommendations: context.recommendations || [],
        riskAssessment: context.risk_assessment || [],
        implementationRoadmap: context.implementation_roadmap || [],
        createdAt: context.created_at,
        updatedAt: context.updated_at
      };
    } catch (error) {
      console.error('Error loading opportunity mapping context:', error);
      throw error;
    }
  }
} 
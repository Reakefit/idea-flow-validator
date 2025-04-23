import { OpenAI } from 'openai';
import { supabase } from '@/lib/supabase';
import { 
  FeatureAnalysisContext, 
  FeatureAnalysisResult,
  CompetitorAnalysisContext
} from './types';

export class OpenAIFeatureAnalysisAgent {
  private context: FeatureAnalysisContext;
  private openai: OpenAI;
  private projectId: string;
  private supabase: typeof supabase;

  constructor(projectId: string, supabaseClient: typeof supabase) {
    console.log('Initializing OpenAIFeatureAnalysisAgent with projectId:', projectId);
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    this.context = {
      id: crypto.randomUUID(),
      projectId,
      competitorAnalysisContextId: null,
      featureComparisonMatrix: [],
      capabilityAnalysis: [],
      documentationAnalysis: [],
      technicalSpecifications: [],
      integrationAnalysis: [],
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
      // Check if we already have rows for this project
      const { data: existingRows, error: fetchError } = await this.supabase
        .from('feature_analysis_context')
        .select('*')
        .eq('project_id', this.projectId);

      if (fetchError) {
        console.error('Error checking for existing rows:', fetchError);
        return;
      }

      // If no rows exist, create one
      if (!existingRows || existingRows.length === 0) {
        const { error: insertError } = await this.supabase
          .from('feature_analysis_context')
          .insert({
            project_id: this.projectId,
            competitor_analysis_context_id: null,
            feature_comparison_matrix: [],
            capability_analysis: [],
            documentation_analysis: [],
            technical_specifications: [],
            integration_analysis: [],
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
          competitorAnalysisContextId: latestRow.competitor_analysis_context_id,
          featureComparisonMatrix: latestRow.feature_comparison_matrix || [],
          capabilityAnalysis: latestRow.capability_analysis || [],
          documentationAnalysis: latestRow.documentation_analysis || [],
          technicalSpecifications: latestRow.technical_specifications || [],
          integrationAnalysis: latestRow.integration_analysis || [],
          createdAt: latestRow.created_at,
          updatedAt: latestRow.updated_at
        };
      }
    } catch (error) {
      console.error('Error in initializeProjectRows:', error);
    }
  }

  async analyzeFeatures(competitorAnalysisContextId: string): Promise<FeatureAnalysisResult> {
    try {
      // First ensure our context is initialized
      await this.initializeProjectRows();
      
      // Get the competitor analysis context for this project
      const { data: competitorAnalysisContext, error: competitorError } = await this.supabase
        .from('competitor_analysis_context')
        .select('*')
        .eq('id', competitorAnalysisContextId)
        .single();

      // Handle errors, accounting for PGRST116 (no data found)
      if (competitorError) {
        if (competitorError.code === 'PGRST116') {
          console.log('No competitor analysis context found for ID:', competitorAnalysisContextId);
          console.log('Using empty competitor analysis context');
          // Proceed with empty data
        } else {
          console.error('Error fetching competitor analysis context:', competitorError);
          throw new Error(`Failed to fetch competitor analysis context: ${competitorError.message}`);
        }
      }

      // Update our context with the competitor analysis ID
      this.context.competitorAnalysisContextId = competitorAnalysisContextId;
      
      // Create a default empty context if none was found
      const analysisContext = competitorAnalysisContext || {
        competitor_profiles: [],
        feature_matrices: [],
        review_analysis: [],
        pricing_analysis: [],
        market_position_analysis: []
      };
      
      const response = await this.openai.chat.completions.create({
        model: 'o3-mini',
        messages: [
          {
            role: 'developer',
            content: `Analyze features based on the following competitor analysis:
            ${JSON.stringify(analysisContext, null, 2)}
            
            Provide a detailed analysis in the following JSON format:
            {
              "featureComparisonMatrix": [
                {
                  "feature": "string",
                  "competitors": [
                    {
                      "name": "string",
                      "implementation": "string",
                      "differentiation": "string"
                    }
                  ],
                  "marketGap": "string"
                }
              ],
              "capabilityAnalysis": [
                {
                  "capability": "string",
                  "description": "string",
                  "importance": "high|medium|low",
                  "complexity": "high|medium|low",
                  "dependencies": ["string"]
                }
              ],
              "documentationAnalysis": [
                {
                  "feature": "string",
                  "documentationQuality": "excellent|good|fair|poor",
                  "gaps": ["string"],
                  "recommendations": ["string"]
                }
              ],
              "technicalSpecifications": [
                {
                  "feature": "string",
                  "requirements": ["string"],
                  "constraints": ["string"],
                  "architecture": "string"
                }
              ],
              "integrationAnalysis": [
                {
                  "feature": "string",
                  "integrationPoints": ["string"],
                  "dependencies": ["string"],
                  "challenges": ["string"]
                }
              ]
            }`
          }
        ],
        max_completion_tokens: 8000,
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
      this.context.featureComparisonMatrix = analysis.featureComparisonMatrix || [];
      this.context.capabilityAnalysis = analysis.capabilityAnalysis || [];
      this.context.documentationAnalysis = analysis.documentationAnalysis || [];
      this.context.technicalSpecifications = analysis.technicalSpecifications || [];
      this.context.integrationAnalysis = analysis.integrationAnalysis || [];

      console.log('Processed analysis:', {
        featureComparisonMatrix: this.context.featureComparisonMatrix.length,
        capabilityAnalysis: this.context.capabilityAnalysis.length,
        documentationAnalysis: this.context.documentationAnalysis.length,
        technicalSpecifications: this.context.technicalSpecifications.length,
        integrationAnalysis: this.context.integrationAnalysis.length
      });

      // Save context
      await this.saveContext();

      return {
        featureComparisonMatrix: this.context.featureComparisonMatrix,
        capabilityAnalysis: this.context.capabilityAnalysis,
        documentationAnalysis: this.context.documentationAnalysis,
        technicalSpecifications: this.context.technicalSpecifications,
        integrationAnalysis: this.context.integrationAnalysis,
        nextQuestion: null,
        isComplete: true
      };
    } catch (error) {
      console.error('Error analyzing features:', error);
      throw error;
    }
  }

  async saveContext(): Promise<void> {
    try {
      const { data: existingContext, error: fetchError } = await this.supabase
        .from('feature_analysis_context')
        .select('*')
        .eq('project_id', this.projectId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing context:', fetchError);
        throw fetchError;
      }

      let result;
      if (existingContext) {
        // Update existing context
        result = await this.supabase
          .from('feature_analysis_context')
          .update({
            competitor_analysis_context_id: this.context.competitorAnalysisContextId,
            feature_comparison_matrix: this.context.featureComparisonMatrix,
            capability_analysis: this.context.capabilityAnalysis,
            documentation_analysis: this.context.documentationAnalysis,
            technical_specifications: this.context.technicalSpecifications,
            integration_analysis: this.context.integrationAnalysis,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContext.id)
          .select()
          .single();
      } else {
        // Create new context
        result = await this.supabase
          .from('feature_analysis_context')
          .insert({
            id: this.context.id,
            project_id: this.projectId,
            competitor_analysis_context_id: this.context.competitorAnalysisContextId,
            feature_comparison_matrix: this.context.featureComparisonMatrix,
            capability_analysis: this.context.capabilityAnalysis,
            documentation_analysis: this.context.documentationAnalysis,
            technical_specifications: this.context.technicalSpecifications,
            integration_analysis: this.context.integrationAnalysis,
            created_at: this.context.createdAt,
            updated_at: this.context.updatedAt
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving context:', result.error);
        throw result.error;
      }

      if (result.data) {
        this.context.id = result.data.id;
      }
    } catch (error) {
      console.error('Error in saveContext:', error);
      throw error;
    }
  }

  async loadContext(projectId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('feature_analysis_context')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) {
        console.error('Error loading context:', error);
        throw error;
      }

      if (data) {
        this.context = {
          id: data.id,
          projectId,
          competitorAnalysisContextId: data.competitor_analysis_context_id,
          featureComparisonMatrix: data.feature_comparison_matrix || [],
          capabilityAnalysis: data.capability_analysis || [],
          documentationAnalysis: data.documentation_analysis || [],
          technicalSpecifications: data.technical_specifications || [],
          integrationAnalysis: data.integration_analysis || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      } else {
        this.context = {
          id: crypto.randomUUID(),
          projectId,
          competitorAnalysisContextId: null,
          featureComparisonMatrix: [],
          capabilityAnalysis: [],
          documentationAnalysis: [],
          technicalSpecifications: [],
          integrationAnalysis: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error in loadContext:', error);
      throw error;
    }
  }

  getContext(): FeatureAnalysisContext | null {
    return this.context;
  }

  async resetContext(): Promise<void> {
    this.context = {
      id: crypto.randomUUID(),
      projectId: this.projectId,
      competitorAnalysisContextId: null,
      featureComparisonMatrix: [],
      capabilityAnalysis: [],
      documentationAnalysis: [],
      technicalSpecifications: [],
      integrationAnalysis: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async refineAnalysis(feedback: string): Promise<FeatureAnalysisResult> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'o3-mini',
        messages: [
          {
            role: 'developer',
            content: `Refine the feature analysis based on the following feedback:
            ${feedback}
            
            Current analysis:
            ${JSON.stringify(this.context, null, 2)}
            
            Provide a refined analysis in the same JSON format as before, focusing on:
            1. Specific actionable insights
            2. Updated feature priorities
            3. Improved technical specifications
            4. Enhanced integration analysis`
          }
        ],
        max_completion_tokens: 8000,
        reasoning_effort: 'high'
      });

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

      // Update context with refined analysis
      this.context.featureComparisonMatrix = analysis.featureComparisonMatrix || this.context.featureComparisonMatrix;
      this.context.capabilityAnalysis = analysis.capabilityAnalysis || this.context.capabilityAnalysis;
      this.context.documentationAnalysis = analysis.documentationAnalysis || this.context.documentationAnalysis;
      this.context.technicalSpecifications = analysis.technicalSpecifications || this.context.technicalSpecifications;
      this.context.integrationAnalysis = analysis.integrationAnalysis || this.context.integrationAnalysis;

      // Save the refined context
      await this.saveContext();

      return {
        featureComparisonMatrix: this.context.featureComparisonMatrix,
        capabilityAnalysis: this.context.capabilityAnalysis,
        documentationAnalysis: this.context.documentationAnalysis,
        technicalSpecifications: this.context.technicalSpecifications,
        integrationAnalysis: this.context.integrationAnalysis,
        nextQuestion: null,
        isComplete: true
      };
    } catch (error) {
      console.error('Error in refineAnalysis:', error);
      throw error;
    }
  }
} 
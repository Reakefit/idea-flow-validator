import { OpenAI } from 'openai';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase/types';
import { 
  CompetitorAnalysisAgent,
  CompetitorAnalysisContext, 
  CompetitorAnalysisResult,
  MarketResearchContext,
  CompetitorProfile,
  FeatureMatrix,
  ReviewAnalysis,
  PricingAnalysis,
  MarketPositionAnalysis
} from './types';

export class OpenAICompetitorAnalysisAgent implements CompetitorAnalysisAgent {
  private context: CompetitorAnalysisContext;
  private openai: OpenAI;
  private projectId: string;
  private supabase: typeof supabase;

  constructor(projectId: string, supabaseClient: typeof supabase) {
    console.log('Initializing OpenAICompetitorAnalysisAgent with projectId:', projectId);
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    // Initialize with properly typed structure
    this.context = {
      id: crypto.randomUUID(), // Use crypto.randomUUID() to generate a valid ID
      projectId,
      marketResearchContextId: null,
      competitorProfiles: [],
      featureMatrices: [],
      reviewAnalysis: [],
      pricingAnalysis: [],
      marketPositionAnalysis: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Use process.env for API key
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    
    this.projectId = projectId;
    this.supabase = supabaseClient;
  }

  getContext(): CompetitorAnalysisContext | null {
    return this.context;
  }

  async resetContext(): Promise<void> {
    this.context = {
      id: crypto.randomUUID(), // Use crypto.randomUUID() to generate a valid ID
      projectId: this.projectId,
      marketResearchContextId: null,
      competitorProfiles: [],
      featureMatrices: [],
      reviewAnalysis: [],
      pricingAnalysis: [],
      marketPositionAnalysis: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await this.saveContext();
  }
  
  async saveContext(): Promise<void> {
    try {
      console.log('Attempting to save competitor analysis context for project:', this.projectId);
      
      // Ensure all arrays are properly initialized to prevent database errors
      if (!Array.isArray(this.context.competitorProfiles)) {
        this.context.competitorProfiles = [];
      }
      
      if (!Array.isArray(this.context.featureMatrices)) {
        this.context.featureMatrices = [];
      }
      
      if (!Array.isArray(this.context.reviewAnalysis)) {
        this.context.reviewAnalysis = [];
      }
      
      if (!Array.isArray(this.context.pricingAnalysis)) {
        this.context.pricingAnalysis = [];
      }
      
      if (!Array.isArray(this.context.marketPositionAnalysis)) {
        this.context.marketPositionAnalysis = [];
      }
      
      const { data: existingContext, error: fetchError } = await this.supabase
        .from('competitor_analysis_context')
        .select('*')
        .eq('project_id', this.projectId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing competitor analysis context:', fetchError);
        throw fetchError;
      }
      
      let result;
      if (existingContext) {
        console.log('Updating existing competitor analysis context');
        result = await this.supabase
          .from('competitor_analysis_context')
          .update({
            market_research_context_id: this.context.marketResearchContextId,
            competitor_profiles: this.context.competitorProfiles,
            feature_matrices: this.context.featureMatrices,
            review_analysis: this.context.reviewAnalysis,
            pricing_analysis: this.context.pricingAnalysis,
            market_position_analysis: this.context.marketPositionAnalysis,
            updated_at: new Date().toISOString()
          })
          .eq('project_id', this.projectId)
          .select()
          .single();
      } else {
        console.log('Creating new competitor analysis context');
        result = await this.supabase
          .from('competitor_analysis_context')
          .insert({
            project_id: this.projectId,
            market_research_context_id: this.context.marketResearchContextId,
            competitor_profiles: this.context.competitorProfiles,
            feature_matrices: this.context.featureMatrices,
            review_analysis: this.context.reviewAnalysis,
            pricing_analysis: this.context.pricingAnalysis,
            market_position_analysis: this.context.marketPositionAnalysis,
            created_at: this.context.createdAt,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
      }
      
      if (result.error) {
        console.error('Error saving competitor analysis context:', result.error);
        throw result.error;
      }
      
      if (result.data) {
        console.log('Successfully saved competitor analysis context');
        this.context.id = result.data.id;
      }
    } catch (error) {
      console.error('Error in saveContext:', error);
      throw error;
    }
  }
  
  async loadContext(projectId: string): Promise<void> {
    try {
      console.log('Loading competitor analysis context for project:', projectId);
      
      const { data, error } = await this.supabase
        .from('competitor_analysis_context')
        .select('*')
        .eq('project_id', projectId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No existing competitor analysis context found, using empty context');
          this.context = {
            id: crypto.randomUUID(), // Use crypto.randomUUID() to generate a valid ID
            projectId,
            marketResearchContextId: null,
            competitorProfiles: [],
            featureMatrices: [],
            reviewAnalysis: [],
            pricingAnalysis: [],
            marketPositionAnalysis: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          return;
        }
        
        console.error('Error loading competitor analysis context:', error);
        throw error;
      }
      
      if (data) {
        console.log('Successfully loaded competitor analysis context');
        this.context = {
          id: data.id,
          projectId: data.project_id,
          marketResearchContextId: data.market_research_context_id,
          competitorProfiles: data.competitor_profiles || [],
          featureMatrices: data.feature_matrices || [],
          reviewAnalysis: data.review_analysis || [],
          pricingAnalysis: data.pricing_analysis || [],
          marketPositionAnalysis: data.market_position_analysis || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
    } catch (error) {
      console.error('Error in loadContext:', error);
      throw error;
    }
  }

  async analyzeCompetitors(marketResearchContext: MarketResearchContext): Promise<CompetitorAnalysisResult> {
    try {
      console.log(`🏢 Competitor Analysis: Starting analysis for project ${this.projectId}`);
      console.log(`📊 Competitor Analysis: Using market research with ${marketResearchContext.competitors?.length || 0} competitors`);
      
      if (!marketResearchContext.competitors || marketResearchContext.competitors.length === 0) {
        console.log(`⚠️ Competitor Analysis: No competitors found in market research context, continuing with basic analysis`);
      }
      
      // Set the market research context for later reference
      this.context.marketResearchContextId = marketResearchContext.id;
      
      console.log(`🤖 Competitor Analysis: Calling OpenAI API...`);
      const response = await this.openai.chat.completions.create({
        model: 'o3-mini',
        max_completion_tokens: 12000,
        reasoning_effort: 'high',
        messages: [
          {
            role: 'system',
            content: `You are an expert competitor analysis agent specializing in deep comparison and positioning analysis. 
            Your task is to conduct a thorough competitive analysis using chain-of-thought reasoning.
            
            Step 1: Analyze the market research and extract key competitor information
            Step 2: Use web_search to gather detailed data on each competitor
            Step 3: Analyze features, strengths, and weaknesses
            Step 4: Create comparison matrices
            
            You must return your analysis in the following JSON format:
            {
              "competitorProfiles": [
                {
                  "id": "string",
                  "name": "string",
                  "description": "string",
                  "features": ["string"],
                  "strengths": ["string"],
                  "weaknesses": ["string"],
                  "pricing": "string",
                  "marketPosition": "string",
                  "customerFeedback": ["string"]
                }
              ],
              "featureMatrix": [
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
              "reviewAnalysis": {
                "summary": "string",
                "sentimentByCompetitor": [
                  {
                    "competitor": "string",
                    "sentiment": "positive|neutral|negative",
                    "commonThemes": ["string"]
                  }
                ],
                "topPositiveFeatures": ["string"],
                "topNegativeFeatures": ["string"]
              },
              "pricingAnalysis": {
                "summary": "string",
                "models": [
                  {
                    "model": "string",
                    "descriptions": "string",
                    "competitors": ["string"]
                  }
                ],
                "priceRanges": [
                  {
                    "range": "string",
                    "competitors": ["string"]
                  }
                ]
              },
              "marketPositionAnalysis": {
                "analysis": "string",
                "leadingCompetitors": ["string"],
                "nichePlayers": ["string"],
                "disruptors": ["string"],
                "gapOpportunities": ["string"]
              }
            }
            
            IMPORTANT:
            - DO NOT include any text outside the JSON structure
            - Ensure the JSON is properly formatted and complete
            - If you can't find specific information, use "Not available" rather than making up data
            - Use data you can verify through web_search
            - Do not hallucinate information`
          },
          {
            role: 'user',
            content: `Market Research Context: ${JSON.stringify(marketResearchContext)}`
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'web_search',
            description: 'Search the web for competitor information'
          }
        }]
      });

      console.log(`✅ Competitor Analysis: OpenAI API call completed`);
      console.log(`📝 Competitor Analysis: Raw response length: ${response.choices[0].message.content?.length || 0} characters`);
      
      // Log the tool calls if any
      if (response.choices[0].message.tool_calls && response.choices[0].message.tool_calls.length > 0) {
        console.log(`🔍 Competitor Analysis: Made ${response.choices[0].message.tool_calls.length} web searches`);
      }
      
      if (!response.choices[0].message.content) {
        console.error(`❌ Competitor Analysis: OpenAI response is empty`);
        throw new Error('OpenAI response is empty');
      }

      // Extract JSON from the response with more robust error handling
      let analysisResult;
      try {
        // First try to extract any JSON object from the response
        const content = response.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        
        // Log sanitized JSON string for debugging
        console.log(`🧪 Competitor Analysis: Attempting to parse JSON of length ${jsonString.length}`);
        
        // Try parsing, handle common syntax errors
        try {
          analysisResult = JSON.parse(jsonString);
        } catch (jsonError) {
          // Try to fix common JSON syntax issues
          console.log(`⚠️ Competitor Analysis: Initial JSON parse failed, attempting to fix common issues`);
          
          // Fix unescaped quotes in strings (common error)
          let fixedJson = jsonString.replace(/(?<!\\)\\(?!["\\/bfnrt])/g, '\\\\');
          
          // Fix trailing commas (another common error)
          fixedJson = fixedJson.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          
          // Try parsing again
          analysisResult = JSON.parse(fixedJson);
        }
      } catch (error) {
        console.error(`❌ Competitor Analysis: Failed to parse JSON response:`, error);
        console.error(`🧾 Competitor Analysis: First 200 chars of response: ${response.choices[0].message.content?.substring(0, 200)}...`);
        
        // Create a minimal valid result as fallback
        analysisResult = {
          competitorProfiles: marketResearchContext.competitors?.map(comp => ({
            id: comp.id || crypto.randomUUID(),
            name: comp.name,
            description: comp.description || "Not available",
            features: ["Not available"],
            strengths: ["Not available"],
            weaknesses: ["Not available"],
            pricing: "Not available",
            marketPosition: "Not available",
            customerFeedback: ["Not available"]
          })) || [],
          featureMatrix: [],
          reviewAnalysis: [],
          pricingAnalysis: [],
          marketPositionAnalysis: []
        };
        
        console.log(`⚠️ Competitor Analysis: Created fallback analysis using market research data`);
      }

      // Verify minimal structure requirements are met
      if (!analysisResult.competitorProfiles || !Array.isArray(analysisResult.competitorProfiles)) {
        console.error(`❌ Competitor Analysis: Invalid structure - missing competitorProfiles array`);
        analysisResult.competitorProfiles = marketResearchContext.competitors?.map(comp => ({
          id: comp.id || crypto.randomUUID(),
          name: comp.name,
          description: comp.description || "Not available",
          features: ["Not available"],
          strengths: ["Not available"],
          weaknesses: ["Not available"],
          pricing: "Not available",
          marketPosition: "Not available",
          customerFeedback: ["Not available"]
        })) || [];
      }
      
      console.log(`📊 Competitor Analysis: Updating context with results`);
      this.context.competitorProfiles = analysisResult.competitorProfiles || [];
      this.context.featureMatrices = analysisResult.featureMatrix || [];
      this.context.reviewAnalysis = analysisResult.reviewAnalysis || [];
      
      // Convert reviewAnalysis from object to array if needed
      if (this.context.reviewAnalysis && !Array.isArray(this.context.reviewAnalysis)) {
        this.context.reviewAnalysis = [this.context.reviewAnalysis];
      }
      
      this.context.pricingAnalysis = analysisResult.pricingAnalysis || [];
      
      // Convert pricingAnalysis from object to array if needed
      if (this.context.pricingAnalysis && !Array.isArray(this.context.pricingAnalysis)) {
        this.context.pricingAnalysis = [this.context.pricingAnalysis];
      }
      
      // Ensure marketPositionAnalysis is always an array, as expected by the database schema
      if (analysisResult.marketPositionAnalysis) {
        // Convert non-array to array if needed
        if (!Array.isArray(analysisResult.marketPositionAnalysis)) {
          this.context.marketPositionAnalysis = [{
            competitor: "Generic",
            position: "follower",
            marketShare: analysisResult.marketPositionAnalysis.analysis || "Not available",
            growthRate: "Not available",
            keyAdvantages: analysisResult.marketPositionAnalysis.leadingCompetitors || [],
            vulnerabilities: analysisResult.marketPositionAnalysis.gapOpportunities || []
          }];
        } else {
          this.context.marketPositionAnalysis = analysisResult.marketPositionAnalysis;
        }
      } else {
        // Create a minimal valid array
        this.context.marketPositionAnalysis = [];
      }
      
      console.log(`💾 Competitor Analysis: Saving context to database...`);
      await this.saveContext();
      console.log(`✅ Competitor Analysis: Context saved with ID: ${this.context.id}`);
      
      console.log(`📈 Competitor Analysis details:
        - Competitor Profiles: ${this.context.competitorProfiles.length} profiles
        - Feature Matrices: ${this.context.featureMatrices.length} features
      `);
      
      return {
        competitorProfiles: this.context.competitorProfiles,
        featureMatrices: this.context.featureMatrices,
        reviewAnalysis: this.context.reviewAnalysis,
        pricingAnalysis: this.context.pricingAnalysis,
        marketPositionAnalysis: this.context.marketPositionAnalysis,
        nextQuestion: null,
        isComplete: true
      };
    } catch (error) {
      console.error('Error in analyzeCompetitors:', error);
      throw error;
    }
  }

  async refineAnalysis(feedback: string): Promise<CompetitorAnalysisResult> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'o3-mini',
        max_completion_tokens: 12000,
        reasoning_effort: 'high',
        messages: [
          {
            role: 'developer',
            content: `You are an expert competitor analysis agent specializing in deep competitor research and analysis.
            Your task is to refine the existing analysis based on the provided feedback using chain-of-thought reasoning.
            
            Step 1: Review the current analysis and feedback
            Step 2: Identify areas needing improvement
            Step 3: Use web_search to gather additional data
            Step 4: Synthesize new findings with existing analysis
            
            Focus on providing specific, actionable insights rather than generic observations.
            For each insight, include supporting data points or trends where possible.
            
            You must return your refined analysis in the following JSON format:
            {
              "competitorProfiles": [
                {
                  "id": "string",
                  "name": "string",
                  "description": "string",
                  "coreFeatures": ["string"],
                  "strengths": ["string"],
                  "weaknesses": ["string"],
                  "pricingModel": "string",
                  "marketShare": "string",
                  "customerFeedback": ["string"],
                  "recentUpdates": ["string"]
                }
              ],
              "featureMatrices": [
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
              "reviewAnalysis": [
                {
                  "competitor": "string",
                  "sentiment": "positive|neutral|negative",
                  "keyThemes": ["string"],
                  "strengths": ["string"],
                  "weaknesses": ["string"],
                  "sampleQuotes": ["string"]
                }
              ],
              "pricingAnalysis": [
                {
                  "competitor": "string",
                  "pricingModel": "string",
                  "pricePoints": ["string"],
                  "valueProposition": "string",
                  "differentiation": "string"
                }
              ],
              "marketPositionAnalysis": [
                {
                  "competitor": "string",
                  "position": "leader|challenger|follower|niche",
                  "marketShare": "string",
                  "growthRate": "string",
                  "keyAdvantages": ["string"],
                  "vulnerabilities": ["string"]
                }
              ]
            }

            For competitor profiles, analyze:
            - Core product features and capabilities
            - Market positioning and brand perception
            - Customer base and target segments
            - Recent product updates and roadmap
            - Strengths and weaknesses in execution
            
            For feature matrices, focus on:
            - Feature completeness and quality
            - Implementation differences
            - Market gaps and opportunities
            - Competitive advantages
            - Areas for improvement
            
            For review analysis, examine:
            - Overall customer sentiment
            - Common pain points and delights
            - Feature-specific feedback
            - Support and service quality
            - Pricing perception
            
            For pricing analysis, consider:
            - Pricing model structure
            - Value proposition alignment
            - Competitive positioning
            - Market acceptance
            - Revenue model effectiveness
            
            For market position analysis, evaluate:
            - Market share and growth
            - Competitive advantages
            - Strategic vulnerabilities
            - Market influence
            - Future potential
            
            IMPORTANT: 
            - Each insight must be specific and supported by data
            - Focus on actionable, implementable insights
            - Your response must be a valid JSON object matching the format above
            - Do not include any text outside the JSON`
          },
          {
            role: 'user',
            content: `Current Analysis: ${JSON.stringify(this.context)}
            Feedback: ${feedback}`
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'web_search',
            description: 'Use web_search to gather additional information'
          }
        }]
      });

      // Parse the JSON response with error handling
      let refinedAnalysis;
      try {
        // Extract JSON from response
        const content = response.choices[0].message.content || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        
        // Try parsing, handle common syntax errors
        try {
          refinedAnalysis = JSON.parse(jsonString);
        } catch (jsonError) {
          console.log(`⚠️ Competitor Analysis: Initial JSON parse failed, attempting to fix common issues`);
          
          // Fix unescaped quotes in strings (common error)
          let fixedJson = jsonString.replace(/(?<!\\)\\(?!["\\/bfnrt])/g, '\\\\');
          
          // Fix trailing commas (another common error)
          fixedJson = fixedJson.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          
          // Try parsing again
          refinedAnalysis = JSON.parse(fixedJson);
        }
      } catch (error) {
        console.error(`❌ Competitor Analysis: Failed to parse JSON response:`, error);
        console.error(`🧾 Competitor Analysis: First 200 chars of response: ${response.choices[0].message.content?.substring(0, 200)}...`);
        
        // Use current context as fallback
        refinedAnalysis = {
          competitorProfiles: this.context.competitorProfiles,
          featureMatrices: this.context.featureMatrices,
          reviewAnalysis: this.context.reviewAnalysis,
          pricingAnalysis: this.context.pricingAnalysis,
          marketPositionAnalysis: this.context.marketPositionAnalysis
        };
      }
      
      // Ensure all required arrays exist
      this.context.competitorProfiles = refinedAnalysis.competitorProfiles || this.context.competitorProfiles;
      this.context.featureMatrices = refinedAnalysis.featureMatrices || this.context.featureMatrices;
      this.context.reviewAnalysis = refinedAnalysis.reviewAnalysis || this.context.reviewAnalysis;
      this.context.pricingAnalysis = refinedAnalysis.pricingAnalysis || this.context.pricingAnalysis;
      this.context.marketPositionAnalysis = refinedAnalysis.marketPositionAnalysis || this.context.marketPositionAnalysis;
      
      // Ensure arrays are not objects
      if (this.context.reviewAnalysis && !Array.isArray(this.context.reviewAnalysis)) {
        this.context.reviewAnalysis = [this.context.reviewAnalysis];
      }
      
      if (this.context.pricingAnalysis && !Array.isArray(this.context.pricingAnalysis)) {
        this.context.pricingAnalysis = [this.context.pricingAnalysis];
      }
      
      if (this.context.marketPositionAnalysis && !Array.isArray(this.context.marketPositionAnalysis)) {
        this.context.marketPositionAnalysis = [this.context.marketPositionAnalysis];
      }
      
      await this.saveContext();
      
      return {
        competitorProfiles: this.context.competitorProfiles,
        featureMatrices: this.context.featureMatrices,
        reviewAnalysis: this.context.reviewAnalysis,
        pricingAnalysis: this.context.pricingAnalysis,
        marketPositionAnalysis: this.context.marketPositionAnalysis,
        nextQuestion: 'Is there anything else you\'d like to explore or refine?',
        isComplete: true
      };
    } catch (error) {
      console.error('Error in refineAnalysis:', error);
      throw error;
    }
  }
} 
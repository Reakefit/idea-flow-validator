import { OpenAI } from 'openai';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase/types';
import { 
  MarketResearchAgent, 
  MarketResearchContext, 
  MarketResearchResult,
  ProblemUnderstandingContext,
  Competitor
} from './types';

export class OpenAIMarketResearchAgent implements MarketResearchAgent {
  private context: MarketResearchContext;
  private openai: OpenAI;
  private projectId: string;
  private supabase: typeof supabase;

  constructor(projectId: string, supabaseClient: typeof supabase) {
    console.log('Initializing OpenAIMarketResearchAgent with projectId:', projectId);
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    this.context = {
      id: crypto.randomUUID(),
      projectId,
      problemContext: null,
      competitors: [],
      marketInsights: [],
      opportunities: [],
      metadata: {
        marketSize: '',
        growthRate: '',
        keyTrends: [],
        customerSegments: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    this.projectId = projectId;
    this.supabase = supabaseClient;
  }

  async analyzeMarket(problemContext: ProblemUnderstandingContext): Promise<MarketResearchResult> {
    try {
      console.log(`🔍 Market Research: Starting analysis for project ${this.projectId}`);
      console.log(`📊 Market Research: Using problem context with final statement: ${problemContext.finalStatement ? problemContext.finalStatement.substring(0, 100) : 'None'}...`);
      
      this.context.problemContext = problemContext;
      
      console.log(`🤖 Market Research: Calling OpenAI API...`);
      const response = await this.openai.chat.completions.create({
        model: 'o3-mini',
        max_completion_tokens: 8000,
        reasoning_effort: 'high',
        messages: [
          {
            role: 'developer',
            content: `You are an expert market research agent specializing in deep market analysis and research.
            Your task is to conduct a thorough market analysis using chain-of-thought reasoning.
            
            Step 1: Analyze the problem context and identify key research areas
            Step 2: Use web_search to gather comprehensive market data, including identifying main competitors
            Step 3: Synthesize findings into structured insights
            Step 4: Validate conclusions with multiple data points
            
            Focus on providing specific, actionable insights rather than generic observations.
            For each insight, include supporting data points or trends where possible.
            
            You must return your analysis in the following JSON format:
            {
              "competitors": [
                {
                  "id": "string",
                  "name": "string",
                  "description": "string"
                }
              ],
              "marketInsights": [
                {
                  "insight": "string",
                  "supportingData": ["string"],
                  "implications": ["string"],
                  "confidenceLevel": "high|medium|low"
                }
              ],
              "opportunities": [
                {
                  "opportunity": "string",
                  "marketSize": "string",
                  "barriersToEntry": ["string"],
                  "requiredCapabilities": ["string"],
                  "timeToMarket": "short|medium|long"
                }
              ],
              "metadata": {
                "marketSize": "string",
                "growthRate": "string",
                "keyTrends": ["string"],
                "customerSegments": ["string"]
              }
            }

            For competitors research:
            - Use web_search to identify the top 5-7 competitors in this market space
            - Include only the name and a brief 1-2 sentence description of each competitor
            - Assign a simple unique ID to each competitor
            - Deeper competitor analysis will be done by a separate agent later
            
            For market insights, analyze:
            - Industry-specific trends and their impact
            - Customer behavior patterns and preferences
            - Regulatory and compliance landscape
            - Technology adoption rates and barriers
            - Market growth drivers and inhibitors
            
            For opportunities, identify:
            - Specific market gaps with quantifiable potential
            - Emerging customer needs and pain points
            - Technology-driven opportunities
            - Partnership and integration possibilities
            - Competitive advantages to leverage
            
            IMPORTANT: 
            - Each insight must be specific and supported by data
            - Opportunities should include market size estimates where possible
            - Focus on actionable, implementable insights
            - Your response must be a valid JSON object matching the format above
            - Do not include any text outside the JSON
            - Ensure the JSON is properly formatted and complete
            - ONLY use data that you can verify through web_search
            - DO NOT hallucinate or make up data
            - If you cannot find specific data for a field, use "Not specified" instead of making up values
            - Clearly indicate when data is estimated or based on limited sources`
          },
          {
            role: 'user',
            content: `Problem Context: ${JSON.stringify(problemContext)}`
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'web_search',
            description: 'Search the web for market information and competitor data'
          }
        }]
      });

      console.log(`✅ Market Research: OpenAI API call completed`);
      console.log(`📝 Market Research: Raw response length: ${response.choices[0].message.content?.length || 0} characters`);
      
      // Log the tool calls if any
      if (response.choices[0].message.tool_calls && response.choices[0].message.tool_calls.length > 0) {
        console.log(`🔍 Market Research: Made ${response.choices[0].message.tool_calls.length} web searches`);
      }
      
      if (!response.choices[0].message.content) {
        console.error(`❌ Market Research: OpenAI response is empty`);
        throw new Error('OpenAI response is empty');
      }

      let analysis;
      try {
        const jsonMatch = response.choices[0].message.content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : response.choices[0].message.content;
        console.log(`🔄 Market Research: Parsing JSON response...`);
        analysis = JSON.parse(jsonString);
      } catch (error) {
        console.error(`❌ Market Research: Failed to parse OpenAI response:`, error);
        console.error(`🧾 Market Research: Response content: ${response.choices[0].message.content?.substring(0, 200)}...`);
        throw new Error('Invalid JSON response from OpenAI');
      }

      if (!analysis || typeof analysis !== 'object') {
        console.error(`❌ Market Research: Invalid analysis format from OpenAI`);
        throw new Error('Invalid analysis format from OpenAI');
      }
      
      console.log(`📊 Market Research: Updating context with parsed analysis`);
      this.context.competitors = analysis.competitors || [];
      this.context.marketInsights = analysis.marketInsights || [];
      this.context.opportunities = analysis.opportunities || [];
      this.context.metadata = {
        marketSize: analysis.metadata?.marketSize || '',
        growthRate: analysis.metadata?.growthRate || '',
        keyTrends: analysis.metadata?.keyTrends || [],
        customerSegments: analysis.metadata?.customerSegments || []
      };
      
      console.log(`📈 Market Research: Analysis processed successfully`);
      console.log(`📊 Market Research details:
        - Competitors: ${this.context.competitors.length} items
        - Market Insights: ${this.context.marketInsights.length} items
        - Opportunities: ${this.context.opportunities.length} items
        - Market Size: ${this.context.metadata.marketSize}
        - Growth Rate: ${this.context.metadata.growthRate}
        - Key Trends: ${this.context.metadata.keyTrends.length} items
        - Customer Segments: ${this.context.metadata.customerSegments.length} items
      `);
      
      console.log(`💾 Market Research: Saving context to database...`);
      await this.saveContext();
      console.log(`✅ Market Research: Context saved successfully with ID: ${this.context.id}`);
      
      return {
        competitors: this.context.competitors,
        marketInsights: this.context.marketInsights,
        opportunities: this.context.opportunities,
        nextQuestion: 'Would you like to dive deeper into any specific aspect of the market analysis?',
        isComplete: false,
        context: this.context
      };
    } catch (error) {
      console.error(`❌ Market Research: Error in analyzeMarket:`, error);
      throw error;
    }
  }

  async refineAnalysis(feedback: string): Promise<MarketResearchResult> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'o3-mini',
        max_completion_tokens: 8000,
        reasoning_effort: 'high',
        messages: [
          {
            role: 'developer',
            content: `You are an expert market research agent specializing in deep market analysis and research.
            Your task is to refine the existing analysis based on the provided feedback using chain-of-thought reasoning.
            
            Step 1: Review the current analysis and feedback
            Step 2: Identify areas needing improvement
            Step 3: Use web_search to gather additional data
            Step 4: Synthesize new findings with existing analysis
            
            Focus on providing specific, actionable insights rather than generic observations.
            For each insight, include supporting data points or trends where possible.
            
            You must return your refined analysis in the following JSON format:
            {
              "competitors": [
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
              "marketInsights": [
                {
                  "insight": "string",
                  "supportingData": ["string"],
                  "implications": ["string"],
                  "confidenceLevel": "high|medium|low"
                }
              ],
              "opportunities": [
                {
                  "opportunity": "string",
                  "marketSize": "string",
                  "barriersToEntry": ["string"],
                  "requiredCapabilities": ["string"],
                  "timeToMarket": "short|medium|long"
                }
              ],
              "metadata": {
                "marketSize": "string",
                "growthRate": "string",
                "keyTrends": ["string"],
                "customerSegments": ["string"]
              }
            }

            For market insights, analyze:
            - Industry-specific trends and their impact
            - Customer behavior patterns and preferences
            - Regulatory and compliance landscape
            - Technology adoption rates and barriers
            - Market growth drivers and inhibitors
            
            For opportunities, identify:
            - Specific market gaps with quantifiable potential
            - Emerging customer needs and pain points
            - Technology-driven opportunities
            - Partnership and integration possibilities
            - Competitive advantages to leverage
            
            IMPORTANT: 
            - Each insight must be specific and supported by data
            - Focus on actionable, implementable insights
            - Your response must be a valid JSON object matching the format above
            - Do not include any text outside the JSON
            - ONLY use data that you can verify through web_search
            - DO NOT hallucinate or make up data
            - If you cannot find specific data for a field, use "Not specified" instead of making up values
            - Clearly indicate when data is estimated or based on limited sources
            - If you cannot complete the analysis, return an empty array for that section rather than truncating the response`
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
            description: 'Use web_search to gather additional market information'
          }
        }]
      });

      const refinedAnalysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Update context with refined analysis
      this.context = {
        ...this.context,
        competitors: refinedAnalysis.competitors || this.context.competitors,
        marketInsights: refinedAnalysis.marketInsights || this.context.marketInsights,
        opportunities: refinedAnalysis.opportunities || this.context.opportunities,
        metadata: {
          ...this.context.metadata,
          ...(refinedAnalysis.metadata || {}),
          marketSize: refinedAnalysis.metadata?.marketSize || this.context.metadata.marketSize,
          growthRate: refinedAnalysis.metadata?.growthRate || this.context.metadata.growthRate,
          keyTrends: refinedAnalysis.metadata?.keyTrends || this.context.metadata.keyTrends,
          customerSegments: refinedAnalysis.metadata?.customerSegments || this.context.metadata.customerSegments
        },
        updatedAt: new Date().toISOString()
      };
      
      await this.saveContext();
      
      return {
        competitors: this.context.competitors,
        marketInsights: this.context.marketInsights,
        opportunities: this.context.opportunities,
        nextQuestion: null,
        isComplete: true,
        context: this.context
      };
    } catch (error) {
      console.error('Error in refineAnalysis:', error);
      throw error;
    }
  }

  getContext(): MarketResearchContext | null {
    return this.context;
  }

  async resetContext(): Promise<void> {
    this.context = {
      id: crypto.randomUUID(),
      projectId: this.projectId,
      problemContext: null,
      competitors: [],
      marketInsights: [],
      opportunities: [],
      metadata: {
        marketSize: '',
        growthRate: '',
        keyTrends: [],
        customerSegments: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async loadContext(projectId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('market_research_context')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No market research context found for project ID:', projectId);
          console.log('Using empty market research context');
          this.context = {
            id: crypto.randomUUID(),
            projectId,
            problemContext: null,
            competitors: [],
            marketInsights: [],
            opportunities: [],
            metadata: {
              marketSize: '',
              growthRate: '',
              keyTrends: [],
              customerSegments: []
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          return;
        }
        console.error('Error loading context:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No market research context data found for project ID:', projectId);
        this.context = {
          id: crypto.randomUUID(),
          projectId,
          problemContext: null,
          competitors: [],
          marketInsights: [],
          opportunities: [],
          metadata: {
            marketSize: '',
            growthRate: '',
            keyTrends: [],
            customerSegments: []
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return;
      }

      const latest = data[0];
      this.context = {
        id: latest.id || crypto.randomUUID(),
        projectId: latest.project_id,
        problemContext: latest.problem_context,
        competitors: latest.competitors || [],
        marketInsights: latest.market_insights || [],
        opportunities: latest.opportunities || [],
        metadata: latest.metadata || {
          marketSize: '',
          growthRate: '',
          keyTrends: [],
          customerSegments: []
        },
        createdAt: latest.created_at ? latest.created_at : new Date().toISOString(),
        updatedAt: latest.updated_at ? latest.updated_at : new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in loadContext:', error);
      this.context = {
        id: crypto.randomUUID(),
        projectId,
        problemContext: null,
        competitors: [],
        marketInsights: [],
        opportunities: [],
        metadata: {
          marketSize: '',
          growthRate: '',
          keyTrends: [],
          customerSegments: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  async saveContext(): Promise<void> {
    if (!this.context) {
      console.error(`❌ Market Research: No context to save`);
      throw new Error('No context to save');
    }

    console.log(`💾 Market Research: Saving context to 'market_research_context' table`);
    console.log(`📊 Market Research: Context data summary:
      - ID: ${this.context.id}
      - Project ID: ${this.context.projectId}
      - Market Insights: ${this.context.marketInsights.length} items
      - Opportunities: ${this.context.opportunities.length} items
    `);

    try {
      // First check if a record already exists for this project
      const { data, error: checkError } = await this.supabase
        .from('market_research_context')
        .select('id')
        .eq('project_id', this.context.projectId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ Market Research: Error checking existing context:`, checkError);
        throw checkError;
      }
      
      // If we found an existing record, use its ID
      if (data && data.id) {
        this.context.id = data.id;
        console.log(`📝 Market Research: Updating existing context with ID ${data.id}`);
      }
      
      // Now perform the upsert with the correct ID
      const { data: upsertData, error: upsertError } = await this.supabase
        .from('market_research_context')
        .upsert({
          id: this.context.id,
          project_id: this.context.projectId,
          problem_context: this.context.problemContext,
          competitors: this.context.competitors,
          market_insights: this.context.marketInsights,
          opportunities: this.context.opportunities,
          metadata: this.context.metadata,
          created_at: this.context.createdAt,
          updated_at: new Date().toISOString()
        })
        .select();

      if (upsertError) {
        console.error(`❌ Market Research: Error saving context:`, upsertError);
        throw upsertError;
      }

      console.log(`✅ Market Research: Context saved successfully. Response:`, upsertData);
    } catch (error) {
      console.error(`❌ Market Research: Error in saveContext:`, error);
      throw error;
    }
  }

  async startAnalysis(projectId: string): Promise<MarketResearchResult> {
    try {
      await this.loadContext(projectId);
      
      if (!this.context) {
        throw new Error('Failed to load context');
      }

      const result: MarketResearchResult = {
        competitors: this.context.competitors,
        marketInsights: this.context.marketInsights,
        opportunities: this.context.opportunities,
        nextQuestion: 'What specific market segments are you targeting?',
        isComplete: false,
        context: this.context
      };

      return result;
    } catch (error) {
      console.error('Error in startAnalysis:', error);
      throw error;
    }
  }
} 
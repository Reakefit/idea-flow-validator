import { OpenAI } from 'openai';
import { supabase } from '@/lib/supabase';
import { 
  CustomerPersonaAgent, 
  CustomerPersonaContext, 
  CustomerPersonaResult,
  MarketResearchContext
} from './types';

export class OpenAICustomerPersonaAgent implements CustomerPersonaAgent {
  private context: CustomerPersonaContext;
  private openai: OpenAI;
  private projectId: string;
  private supabase: typeof supabase;

  constructor(projectId: string, supabaseClient: typeof supabase) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    this.context = {
      id: crypto.randomUUID(),
      projectId,
      personas: [],
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

  async generatePersonas(marketResearchContext: MarketResearchContext): Promise<CustomerPersonaResult> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a customer persona generation expert. Based on the market research context, generate detailed customer personas that represent the target audience segments. Each persona should include:
            - Name
            - Age
            - Occupation
            - Goals
            - Pain Points
            - Behaviors
            - Preferences
            - Quotes
            - Usage Scenarios
            
            The personas should be realistic and based on the market research data provided. Return the response as a valid JSON object with the following structure:
            {
              "personas": [
                {
                  "name": "string",
                  "age": number,
                  "occupation": "string",
                  "goals": "string",
                  "painPoints": "string",
                  "behaviors": "string",
                  "preferences": "string",
                  "quotes": "string",
                  "usageScenarios": "string"
                }
              ]
            }
            
            Do not include any text before or after the JSON object.`
          },
          {
            role: 'user',
            content: `Market Research Context: ${JSON.stringify(marketResearchContext)}`
          }
        ]
      });

      if (!response.choices[0].message.content) {
        throw new Error('OpenAI response is empty');
      }

      let analysis;
      try {
        // Extract JSON from the response
        const jsonMatch = response.choices[0].message.content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : response.choices[0].message.content;
        analysis = JSON.parse(jsonString);
      } catch (error) {
        console.error('Failed to parse OpenAI response:', response.choices[0].message.content);
        throw new Error('Invalid JSON response from OpenAI');
      }

      if (!analysis || typeof analysis !== 'object' || !Array.isArray(analysis.personas)) {
        throw new Error('Invalid analysis format from OpenAI');
      }
      
      this.context.personas = analysis.personas;
      this.context.marketResearchContext = marketResearchContext;
      this.context.updatedAt = new Date().toISOString();
      
      await this.saveContext();
      
      return {
        personas: this.context.personas,
        nextQuestion: null,
        isComplete: true,
        context: this.context
      };
    } catch (error) {
      console.error('Error in generatePersonas:', error);
      throw error;
    }
  }

  async getContext(): Promise<CustomerPersonaContext | null> {
    return this.context;
  }

  async resetContext(): Promise<void> {
    this.context = {
      id: crypto.randomUUID(),
      projectId: this.projectId,
      personas: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await this.saveContext();
  }

  async saveContext(): Promise<void> {
    try {
      // First, try to find existing context for this project
      const { data: existingData } = await this.supabase
        .from('customer_persona_context')
        .select('id')
        .eq('project_id', this.projectId)
        .single();

      const { error } = await this.supabase
        .from('customer_persona_context')
        .upsert({
          id: existingData?.id || this.context.id,
          project_id: this.context.projectId,
          persona_profile: this.context.personas, 
          market_research_context: this.context.marketResearchContext,
          created_at: existingData?.id ? undefined : this.context.createdAt,
          updated_at: this.context.updatedAt,
          status: 'complete',
          last_updated: this.context.updatedAt
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Failed to save context:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error saving context:', error);
      throw error;
    }
  }

  async loadContext(projectId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('customer_persona_context')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, initialize with empty context
          console.log('No customer persona context found for project ID:', projectId);
          console.log('Using empty customer persona context');
          this.context = {
            id: crypto.randomUUID(),
            projectId,
            personas: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await this.saveContext();
          return;
        }
        console.error('Failed to load context:', error);
        throw error;
      }

      if (!data) {
        // Initialize with empty context if no data found
        console.log('No customer persona context data found for project ID:', projectId);
        this.context = {
          id: crypto.randomUUID(),
          projectId,
          personas: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await this.saveContext();
        return;
      }

      // Update context with loaded data
      this.context = {
        id: data.id,
        projectId: data.project_id,
        personas: data.persona_profile || [],
        marketResearchContext: data.market_research_context,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.last_updated
      };
    } catch (error) {
      console.error('Error loading context:', error);
      // Initialize with empty context on error
      this.context = {
        id: crypto.randomUUID(),
        projectId,
        personas: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await this.saveContext();
    }
  }
} 
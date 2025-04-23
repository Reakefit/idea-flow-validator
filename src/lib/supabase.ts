import { createBrowserClient } from '@supabase/ssr';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          current_phase: string;
          progress: any;
          market_research_context: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          current_phase?: string;
          progress?: any;
          market_research_context?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          current_phase?: string;
          progress?: any;
          market_research_context?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      problem_understanding_context: {
        Row: {
          id: string;
          project_id: string;
          initial_statement: string;
          understanding_level: number;
          clarifying_questions: string;
          user_responses: any;
          key_insights: any;
          final_statement: string;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          initial_statement: string;
          understanding_level?: number;
          clarifying_questions?: string;
          user_responses?: any;
          key_insights?: any;
          final_statement?: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          initial_statement?: string;
          understanding_level?: number;
          clarifying_questions?: string;
          user_responses?: any;
          key_insights?: any;
          final_statement?: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      market_research_context: {
        Row: {
          id: string;
          project_id: string;
          problem_context: any;
          competitors: any;
          market_insights: string;
          opportunities: string;
          metadata: any;
          status: string;
          last_updated: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          problem_context?: any;
          competitors?: any;
          market_insights?: string;
          opportunities?: string;
          metadata?: any;
          status?: string;
          last_updated?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          problem_context?: any;
          competitors?: any;
          market_insights?: string;
          opportunities?: string;
          metadata?: any;
          status?: string;
          last_updated?: string;
        };
      };
      competitor_analysis_context: {
        Row: {
          id: string;
          project_id: string;
          market_research_context: string;
          competitor_profiles: any;
          feature_matrices: any;
          review_analysis: any;
          pricing_analysis: any;
          market_position_analysis: any;
          created_at: string;
          updated_at: string;
          status: string;
          last_updated: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          market_research_context: string;
          competitor_profiles?: any;
          feature_matrices?: any;
          review_analysis?: any;
          pricing_analysis?: any;
          market_position_analysis?: any;
          created_at?: string;
          updated_at?: string;
          status?: string;
          last_updated?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          market_research_context?: string;
          competitor_profiles?: any;
          feature_matrices?: any;
          review_analysis?: any;
          pricing_analysis?: any;
          market_position_analysis?: any;
          created_at?: string;
          updated_at?: string;
          status?: string;
          last_updated?: string;
        };
      };
      feature_analysis_context: {
        Row: {
          id: string;
          project_id: string;
          competitor_analysis_context: string;
          feature_comparison: any;
          capability_analysis: any;
          documentation_analysis: any;
          technical_specifications: any;
          integration_analysis: any;
          created_at: string;
          updated_at: string;
          status: string;
          last_updated: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          competitor_analysis_context: string;
          feature_comparison?: any;
          capability_analysis?: any;
          documentation_analysis?: any;
          technical_specifications?: any;
          integration_analysis?: any;
          created_at?: string;
          updated_at?: string;
          status?: string;
          last_updated?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          competitor_analysis_context?: string;
          feature_comparison?: any;
          capability_analysis?: any;
          documentation_analysis?: any;
          technical_specifications?: any;
          integration_analysis?: any;
          created_at?: string;
          updated_at?: string;
          status?: string;
          last_updated?: string;
        };
      };
      customer_insights_context: {
        Row: {
          id: string;
          project_id: string;
          feature_analysis_context: string;
          pain_points: any;
          satisfaction_metrics: any;
          feature_requests: any;
          sentiment_analysis: any;
          usage_patterns: any;
          created_at: string;
          updated_at: string;
          status: string;
          last_updated: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          feature_analysis_context: string;
          pain_points?: any;
          satisfaction_metrics?: any;
          feature_requests?: any;
          sentiment_analysis?: any;
          usage_patterns?: any;
          created_at?: string;
          updated_at?: string;
          status?: string;
          last_updated?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          feature_analysis_context?: string;
          pain_points?: any;
          satisfaction_metrics?: any;
          feature_requests?: any;
          sentiment_analysis?: any;
          usage_patterns?: any;
          created_at?: string;
          updated_at?: string;
          status?: string;
          last_updated?: string;
        };
      };
      opportunity_mapping_context: {
        Row: {
          id: string;
          project_id: string;
          market_research_context: string;
          competitor_analysis_context: string;
          feature_analysis_context: string;
          customer_insights_context: string;
          market_gaps: any;
          strategic_opportunities: any;
          recommendations: any;
          risk_assessment: any;
          implementation_roadmap: any;
          created_at: string;
          updated_at: string;
          status: string;
          last_updated: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          market_research_context: string;
          competitor_analysis_context: string;
          feature_analysis_context: string;
          customer_insights_context: string;
          market_gaps?: any;
          strategic_opportunities?: any;
          recommendations?: any;
          risk_assessment?: any;
          implementation_roadmap?: any;
          created_at?: string;
          updated_at?: string;
          status?: string;
          last_updated?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          market_research_context?: string;
          competitor_analysis_context?: string;
          feature_analysis_context?: string;
          customer_insights_context?: string;
          market_gaps?: any;
          strategic_opportunities?: any;
          recommendations?: any;
          risk_assessment?: any;
          implementation_roadmap?: any;
          created_at?: string;
          updated_at?: string;
          status?: string;
          last_updated?: string;
        };
      };
      persona_generation_context: {
        Row: {
          id: string;
          project_id: string;
          personae: any;
          created_at: string;
          updated_at: string;
          status: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          personae?: any;
          created_at?: string;
          updated_at?: string;
          status?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          personae?: any;
          created_at?: string;
          updated_at?: string;
          status?: string;
        };
      };
      customer_persona_context: {
        Row: {
          id: string;
          project_id: string;
          persona_profile: any;
          market_research_context: string;
          created_at: string;
          updated_at: string;
          status: string;
          last_updated: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          persona_profile?: any;
          market_research_context: string;
          created_at?: string;
          updated_at?: string;
          status?: string;
          last_updated?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          persona_profile?: any;
          market_research_context?: string;
          created_at?: string;
          updated_at?: string;
          status?: string;
          last_updated?: string;
        };
      };
      interviews: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          role: string;
          goals: string;
          learn_points: string[];
          meeting_link: string;
          scheduled_at: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          role: string;
          goals: string;
          learn_points?: string[];
          meeting_link: string;
          scheduled_at: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          role?: string;
          goals?: string;
          learn_points?: string[];
          meeting_link?: string;
          scheduled_at?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      interview_transcriptions: {
        Row: {
          id: string;
          interview_id: string;
          speaker: string;
          content: string;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          speaker: string;
          content: string;
          timestamp: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          speaker?: string;
          content?: string;
          timestamp?: string;
          created_at?: string;
        };
      };
      interview_prompts: {
        Row: {
          id: string;
          interview_id: string;
          prompt_type: string;
          content: string;
          context: any;
          timestamp: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          prompt_type: string;
          content: string;
          context?: any;
          timestamp: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          prompt_type?: string;
          content?: string;
          context?: any;
          timestamp?: string;
          status?: string;
          created_at?: string;
        };
      };
      interview_alerts: {
        Row: {
          id: string;
          interview_id: string;
          alert_type: string;
          content: string;
          context: any;
          priority: string;
          timestamp: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          alert_type: string;
          content: string;
          context?: any;
          priority?: string;
          timestamp: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          alert_type?: string;
          content?: string;
          context?: any;
          priority?: string;
          timestamp?: string;
          status?: string;
          created_at?: string;
        };
      };
      interview_summaries: {
        Row: {
          id: string;
          interview_id: string;
          pain_points: any;
          quotes: any;
          sentiment: any;
          follow_ups: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          pain_points?: any;
          quotes?: any;
          sentiment?: any;
          follow_ups?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          pain_points?: any;
          quotes?: any;
          sentiment?: any;
          follow_ups?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      interview_insights: {
        Row: {
          id: string;
          interview_id: string;
          timestamp: string;
          insight_type: string;
          content: string;
          priority: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          timestamp: string;
          insight_type: string;
          content: string;
          priority?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          timestamp?: string;
          insight_type?: string;
          content?: string;
          priority?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      consolidated_insights: {
        Row: {
          id: string;
          project_id: string;
          themes: any;
          sentiment: any;
          features: any;
          action_plan: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          themes?: any;
          sentiment?: any;
          features?: any;
          action_plan?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          themes?: any;
          features?: any;
          sentiment?: any;
          action_plan?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Create a single supabase client for interacting with your database
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
); 

// Export types
export type { Database };
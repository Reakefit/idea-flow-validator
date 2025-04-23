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
    };
  };
}; 
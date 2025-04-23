export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      competitor_analysis_context: {
        Row: {
          competitor_profiles: Json[] | null
          created_at: string
          feature_matrices: Json[] | null
          id: string
          last_updated: string | null
          market_position_analysis: Json[] | null
          market_research_context_id: string | null
          pricing_analysis: Json[] | null
          project_id: string
          review_analysis: Json[] | null
          status: string | null
          updated_at: string
        }
        Insert: {
          competitor_profiles?: Json[] | null
          created_at?: string
          feature_matrices?: Json[] | null
          id?: string
          last_updated?: string | null
          market_position_analysis?: Json[] | null
          market_research_context_id?: string | null
          pricing_analysis?: Json[] | null
          project_id: string
          review_analysis?: Json[] | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          competitor_profiles?: Json[] | null
          created_at?: string
          feature_matrices?: Json[] | null
          id?: string
          last_updated?: string | null
          market_position_analysis?: Json[] | null
          market_research_context_id?: string | null
          pricing_analysis?: Json[] | null
          project_id?: string
          review_analysis?: Json[] | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_analysis_context_market_research_context_id_fkey"
            columns: ["market_research_context_id"]
            isOneToOne: false
            referencedRelation: "market_research_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_analysis_context_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      consolidated_insights: {
        Row: {
          action_plan: Json
          created_at: string
          features: Json
          id: string
          project_id: string
          sentiment: Json
          themes: Json
          updated_at: string
        }
        Insert: {
          action_plan: Json
          created_at?: string
          features: Json
          id?: string
          project_id: string
          sentiment: Json
          themes: Json
          updated_at?: string
        }
        Update: {
          action_plan?: Json
          created_at?: string
          features?: Json
          id?: string
          project_id?: string
          sentiment?: Json
          themes?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consolidated_insights_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_insights_context: {
        Row: {
          created_at: string
          feature_analysis_context_id: string | null
          feature_requests: Json[] | null
          id: string
          last_updated: string | null
          pain_points: Json[] | null
          project_id: string
          satisfaction_metrics: Json[] | null
          sentiment_analysis: Json[] | null
          status: string | null
          updated_at: string
          usage_patterns: Json[] | null
        }
        Insert: {
          created_at?: string
          feature_analysis_context_id?: string | null
          feature_requests?: Json[] | null
          id?: string
          last_updated?: string | null
          pain_points?: Json[] | null
          project_id: string
          satisfaction_metrics?: Json[] | null
          sentiment_analysis?: Json[] | null
          status?: string | null
          updated_at?: string
          usage_patterns?: Json[] | null
        }
        Update: {
          created_at?: string
          feature_analysis_context_id?: string | null
          feature_requests?: Json[] | null
          id?: string
          last_updated?: string | null
          pain_points?: Json[] | null
          project_id?: string
          satisfaction_metrics?: Json[] | null
          sentiment_analysis?: Json[] | null
          status?: string | null
          updated_at?: string
          usage_patterns?: Json[] | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_insights_context_feature_analysis_context_id_fkey"
            columns: ["feature_analysis_context_id"]
            isOneToOne: false
            referencedRelation: "feature_analysis_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_insights_context_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_persona_context: {
        Row: {
          created_at: string
          id: string
          last_updated: string | null
          market_research_context: Json | null
          personas: Json
          project_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_updated?: string | null
          market_research_context?: Json | null
          personas?: Json
          project_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_updated?: string | null
          market_research_context?: Json | null
          personas?: Json
          project_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_persona_context_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_analysis_context: {
        Row: {
          capability_analysis: Json[] | null
          competitor_analysis_context_id: string | null
          created_at: string
          documentation_analysis: Json[] | null
          feature_comparison_matrix: Json[] | null
          id: string
          integration_analysis: Json[] | null
          last_updated: string | null
          project_id: string
          status: string | null
          technical_specifications: Json[] | null
          updated_at: string
        }
        Insert: {
          capability_analysis?: Json[] | null
          competitor_analysis_context_id?: string | null
          created_at?: string
          documentation_analysis?: Json[] | null
          feature_comparison_matrix?: Json[] | null
          id?: string
          integration_analysis?: Json[] | null
          last_updated?: string | null
          project_id: string
          status?: string | null
          technical_specifications?: Json[] | null
          updated_at?: string
        }
        Update: {
          capability_analysis?: Json[] | null
          competitor_analysis_context_id?: string | null
          created_at?: string
          documentation_analysis?: Json[] | null
          feature_comparison_matrix?: Json[] | null
          id?: string
          integration_analysis?: Json[] | null
          last_updated?: string | null
          project_id?: string
          status?: string | null
          technical_specifications?: Json[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_analysis_context_competitor_analysis_context_id_fkey"
            columns: ["competitor_analysis_context_id"]
            isOneToOne: false
            referencedRelation: "competitor_analysis_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_analysis_context_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_alerts: {
        Row: {
          alert_type: string
          content: string
          context: Json
          created_at: string
          id: string
          interview_id: string
          priority: string
          status: string
          timestamp: string
        }
        Insert: {
          alert_type: string
          content: string
          context: Json
          created_at?: string
          id?: string
          interview_id: string
          priority: string
          status: string
          timestamp: string
        }
        Update: {
          alert_type?: string
          content?: string
          context?: Json
          created_at?: string
          id?: string
          interview_id?: string
          priority?: string
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_alerts_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_insights: {
        Row: {
          content: string
          created_at: string
          id: string
          insight_type: string
          interview_id: string
          priority: string
          timestamp: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          insight_type: string
          interview_id: string
          priority: string
          timestamp: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          insight_type?: string
          interview_id?: string
          priority?: string
          timestamp?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_insights_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_prompts: {
        Row: {
          content: string
          context: Json
          created_at: string
          id: string
          interview_id: string
          prompt_type: string
          status: string
          timestamp: string
        }
        Insert: {
          content: string
          context: Json
          created_at?: string
          id?: string
          interview_id: string
          prompt_type: string
          status: string
          timestamp: string
        }
        Update: {
          content?: string
          context?: Json
          created_at?: string
          id?: string
          interview_id?: string
          prompt_type?: string
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_prompts_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_summaries: {
        Row: {
          created_at: string
          follow_ups: Json
          id: string
          interview_id: string
          pain_points: Json
          quotes: Json
          sentiment: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          follow_ups: Json
          id?: string
          interview_id: string
          pain_points: Json
          quotes: Json
          sentiment: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          follow_ups?: Json
          id?: string
          interview_id?: string
          pain_points?: Json
          quotes?: Json
          sentiment?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_summaries_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_transcriptions: {
        Row: {
          content: string
          created_at: string
          id: string
          interview_id: string
          speaker: string
          timestamp: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          interview_id: string
          speaker: string
          timestamp: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          interview_id?: string
          speaker?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_transcriptions_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          created_at: string
          goals: string
          id: string
          learn_points: string[]
          meeting_link: string
          name: string
          project_id: string
          role: string
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          goals: string
          id?: string
          learn_points: string[]
          meeting_link: string
          name: string
          project_id: string
          role: string
          scheduled_at: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          goals?: string
          id?: string
          learn_points?: string[]
          meeting_link?: string
          name?: string
          project_id?: string
          role?: string
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      market_research_context: {
        Row: {
          competitors: Json[] | null
          created_at: string
          id: string
          last_updated: string | null
          market_insights: string[] | null
          metadata: Json | null
          opportunities: string[] | null
          problem_context: Json | null
          project_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          competitors?: Json[] | null
          created_at?: string
          id?: string
          last_updated?: string | null
          market_insights?: string[] | null
          metadata?: Json | null
          opportunities?: string[] | null
          problem_context?: Json | null
          project_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          competitors?: Json[] | null
          created_at?: string
          id?: string
          last_updated?: string | null
          market_insights?: string[] | null
          metadata?: Json | null
          opportunities?: string[] | null
          problem_context?: Json | null
          project_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_research_context_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_mapping_context: {
        Row: {
          competitor_analysis_context_id: string | null
          created_at: string
          customer_insights_context_id: string | null
          feature_analysis_context_id: string | null
          id: string
          implementation_roadmap: Json[] | null
          last_updated: string | null
          market_gaps: Json[] | null
          market_research_context_id: string | null
          project_id: string
          recommendations: Json[] | null
          risk_assessment: Json[] | null
          status: string | null
          strategic_opportunities: Json[] | null
          updated_at: string
        }
        Insert: {
          competitor_analysis_context_id?: string | null
          created_at?: string
          customer_insights_context_id?: string | null
          feature_analysis_context_id?: string | null
          id?: string
          implementation_roadmap?: Json[] | null
          last_updated?: string | null
          market_gaps?: Json[] | null
          market_research_context_id?: string | null
          project_id: string
          recommendations?: Json[] | null
          risk_assessment?: Json[] | null
          status?: string | null
          strategic_opportunities?: Json[] | null
          updated_at?: string
        }
        Update: {
          competitor_analysis_context_id?: string | null
          created_at?: string
          customer_insights_context_id?: string | null
          feature_analysis_context_id?: string | null
          id?: string
          implementation_roadmap?: Json[] | null
          last_updated?: string | null
          market_gaps?: Json[] | null
          market_research_context_id?: string | null
          project_id?: string
          recommendations?: Json[] | null
          risk_assessment?: Json[] | null
          status?: string | null
          strategic_opportunities?: Json[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_mapping_context_competitor_analysis_context_id_fkey"
            columns: ["competitor_analysis_context_id"]
            isOneToOne: false
            referencedRelation: "competitor_analysis_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_mapping_context_customer_insights_context_id_fkey"
            columns: ["customer_insights_context_id"]
            isOneToOne: false
            referencedRelation: "customer_insights_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_mapping_context_feature_analysis_context_id_fkey"
            columns: ["feature_analysis_context_id"]
            isOneToOne: false
            referencedRelation: "feature_analysis_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_mapping_context_market_research_context_id_fkey"
            columns: ["market_research_context_id"]
            isOneToOne: false
            referencedRelation: "market_research_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_mapping_context_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_generation_context: {
        Row: {
          created_at: string
          id: string
          personas: Json | null
          problem_context: Json | null
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          personas?: Json | null
          problem_context?: Json | null
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          personas?: Json | null
          problem_context?: Json | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "persona_generation_context_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      problem_understanding_context: {
        Row: {
          clarifying_questions: string[]
          created_at: string
          final_statement: string | null
          id: string
          initial_statement: string
          key_insights: string[]
          metadata: Json | null
          project_id: string
          understanding_level: number
          updated_at: string
          user_responses: Json
        }
        Insert: {
          clarifying_questions?: string[]
          created_at?: string
          final_statement?: string | null
          id?: string
          initial_statement: string
          key_insights?: string[]
          metadata?: Json | null
          project_id: string
          understanding_level?: number
          updated_at?: string
          user_responses?: Json
        }
        Update: {
          clarifying_questions?: string[]
          created_at?: string
          final_statement?: string | null
          id?: string
          initial_statement?: string
          key_insights?: string[]
          metadata?: Json | null
          project_id?: string
          understanding_level?: number
          updated_at?: string
          user_responses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "problem_understanding_context_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          current_phase: string | null
          id: string
          name: string
          progress: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_phase?: string | null
          id?: string
          name: string
          progress?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_phase?: string | null
          id?: string
          name?: string
          progress?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_customer_persona_context_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

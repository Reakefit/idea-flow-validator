export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  current_phase: string;
  progress: {
    market_research: string;
    competitor_analysis: string;
    feature_analysis: string;
    customer_insights: string;
    customer_personas: string;
    opportunity_mapping: string;
  };
  problem_understanding_context: {
    finalStatement: string;
    [key: string]: any;
  } | null;
} 
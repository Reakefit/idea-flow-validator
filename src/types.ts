
export interface CustomerPersona {
  id: string;
  project_id: string;
  name: string;
  description: string;
  demographics: {
    age: string;
    gender: string;
    location: string;
    occupation: string;
    income: string;
    education: string;
  };
  pain_points: string[];
  goals: string[];
  behaviors: string[];
  created_at: string;
  updated_at: string;
}

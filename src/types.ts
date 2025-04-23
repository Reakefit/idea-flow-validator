
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
  painPoints: string[];
  goals: string[];
  behaviors: string[];
  createdAt: string;
  updatedAt: string;
}

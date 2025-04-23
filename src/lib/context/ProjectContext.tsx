
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface Project {
  id: string;
  name: string;
  user_id: string;
  current_phase: string;
  progress: {
    problem_validation: string;
    market_research: string;
    competitor_analysis: string;
    feature_analysis: string;
    customer_insights: string;
    customer_personas: string;
    opportunity_mapping: string;
  };
  created_at: string;
  updated_at: string;
}

interface ProblemContext {
  id?: string;
  projectId: string;
  initialStatement: string;
  understandingLevel: number;
  clarifyingQuestions: string[];
  userResponses: { question: string; response: string }[];
  keyInsights: any[];
  finalStatement: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  problemContext: ProblemContext | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  setCurrentProject: (project: Project) => void;
  fetchProblemContext: (projectId: string) => Promise<void>;
  createProject: (name: string) => Promise<Project | null>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [problemContext, setProblemContext] = useState<ProblemContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match the Project interface
      const transformedData = data?.map(item => ({
        ...item,
        progress: typeof item.progress === 'string' 
          ? JSON.parse(item.progress) 
          : item.progress || {
              problem_validation: 'pending',
              market_research: 'pending',
              competitor_analysis: 'pending',
              feature_analysis: 'pending',
              customer_insights: 'pending',
              customer_personas: 'pending',
              opportunity_mapping: 'pending'
            }
      })) as Project[];
      
      setProjects(transformedData || []);
      
      // Set the first project as the current project if none is selected
      if (transformedData && transformedData.length > 0 && !currentProject) {
        setCurrentProject(transformedData[0]);
        await fetchProblemContext(transformedData[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setError(error.message);
      toast.error(`Failed to load projects: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProblemContext = async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('problem_understanding_context')
        .select('*')
        .eq('project_id', projectId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw error;
      }
      
      if (data) {
        setProblemContext({
          id: data.id,
          projectId: data.project_id,
          initialStatement: data.initial_statement,
          understandingLevel: data.understanding_level,
          clarifyingQuestions: data.clarifying_questions || [],
          userResponses: Array.isArray(data.user_responses) 
            ? data.user_responses 
            : [],
          keyInsights: data.key_insights || [],
          finalStatement: data.final_statement,
          metadata: data.metadata || {},
          createdAt: data.created_at,
          updatedAt: data.updated_at
        });
      } else {
        setProblemContext(null);
      }
    } catch (error: any) {
      console.error('Error fetching problem context:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (name: string): Promise<Project | null> => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const initialProgress = {
        problem_validation: 'pending',
        market_research: 'pending',
        competitor_analysis: 'pending',
        feature_analysis: 'pending',
        customer_insights: 'pending',
        customer_personas: 'pending',
        opportunity_mapping: 'pending'
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert({ 
          name, 
          user_id: user.id,
          progress: initialProgress
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Transform to match Project interface
        const newProject = {
          ...data,
          progress: typeof data.progress === 'string' 
            ? JSON.parse(data.progress) 
            : data.progress || initialProgress
        } as Project;
        
        // Update the projects list and set the new project as current
        setProjects(prev => [newProject, ...prev]);
        setCurrentProject(newProject);
        toast.success('Project created successfully!');
        return newProject;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.message);
      toast.error(`Failed to create project: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
      setProblemContext(null);
    }
  }, [user]);

  useEffect(() => {
    if (currentProject) {
      fetchProblemContext(currentProject.id);
    } else {
      setProblemContext(null);
    }
  }, [currentProject]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        problemContext,
        isLoading,
        error,
        fetchProjects,
        setCurrentProject,
        fetchProblemContext,
        createProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

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
  updateProjectPhase: (projectId: string, phase: string) => Promise<void>;
  updateProjectProgress: (projectId: string, progress: Partial<Project['progress']>) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [problemContext, setProblemContext] = useState<ProblemContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a new project for a new user
  const createInitialProject = async (userId: string) => {
    try {
      // First check if a project already exists
      const { data: existingProjects, error: checkError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);

      if (checkError) throw checkError;

      // If project exists, return it
      if (existingProjects && existingProjects.length > 0) {
        return existingProjects[0];
      }

      const newProject: Omit<Project, 'id'> = {
        name: 'My First Project',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        current_phase: 'problem_understanding',
        progress: {
          problem_validation: 'pending',
          market_research: 'pending',
          competitor_analysis: 'pending',
          feature_analysis: 'pending',
          customer_insights: 'pending',
          customer_personas: 'pending',
          opportunity_mapping: 'pending'
        }
      };

      const { data: project, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single();

      if (error) throw error;
      return project;
    } catch (error) {
      console.error('Error creating initial project:', error);
      throw error;
    }
  };

  // Fetch projects and set current project
  const fetchProjects = async () => {
    if (!user) {
      setCurrentProject(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // If no projects exist, create one
      if (!projects || projects.length === 0) {
        const newProject = await createInitialProject(user.id);
        setCurrentProject(newProject);
      } else {
        // Set the first project as current if none is selected
        setCurrentProject(projects[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch projects');
      toast.error('Failed to fetch projects. Please try again.');
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

  const updateProjectPhase = async (projectId: string, phase: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate phase transition
      const currentProject = projects.find(p => p.id === projectId);
      if (!currentProject) {
        throw new Error('Project not found');
      }

      // Validate phase transition rules
      const validTransitions: Record<string, string[]> = {
        '': ['problem_understanding', 'analysis', 'dashboard'],
        'problem_understanding': ['analysis', 'dashboard'],
        'analysis': ['dashboard'],
        'dashboard': ['problem_understanding', 'analysis']
      };

      const currentPhase = currentProject.current_phase || '';
      if (!validTransitions[currentPhase]?.includes(phase)) {
        throw new Error(`Invalid phase transition from ${currentPhase} to ${phase}`);
      }

      // Validate required data for phase transitions
      const requiredData: Record<string, () => boolean> = {
        'analysis': () => {
          if (!problemContext?.finalStatement) {
            throw new Error('Cannot transition to analysis without final problem statement');
          }
          return true;
        },
        'dashboard': () => {
          const isAnalysisComplete = 
            currentProject.progress.market_research === 'complete' &&
            currentProject.progress.competitor_analysis === 'complete' &&
            currentProject.progress.feature_analysis === 'complete' &&
            currentProject.progress.customer_insights === 'complete' &&
            currentProject.progress.customer_personas === 'complete' &&
            currentProject.progress.opportunity_mapping === 'complete';
          
          if (!isAnalysisComplete) {
            throw new Error('Cannot transition to dashboard without completing all analysis steps');
          }
          return true;
        }
      };

      if (requiredData[phase]) {
        requiredData[phase]();
      }

      // Add optimistic update
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId ? { ...project, current_phase: phase } : project
        )
      );
      
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({ ...currentProject, current_phase: phase });
      }

      // Update in database
      const { error } = await supabase
        .from('projects')
        .update({ current_phase: phase })
        .eq('id', projectId);
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Error updating project phase:', error);
      setError(error.message);
      toast.error(`Failed to update project phase: ${error.message}`);
      
      // Revert optimistic update on error
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId ? { ...project, current_phase: currentProject?.current_phase } : project
        )
      );
      
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(currentProject);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectProgress = async (projectId: string, progress: Partial<Project['progress']>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current project
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        // Try to fetch the project if not found in local state
        const { data: fetchedProject, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
          
        if (fetchError || !fetchedProject) {
          throw new Error('Project not found');
        }
        
        // Update local state with fetched project
        setProjects(prev => [...prev, fetchedProject]);
        if (!currentProject || currentProject.id === projectId) {
          setCurrentProject(fetchedProject);
        }
      }
      
      // Validate progress update
      const validProgressStates = ['pending', 'in-progress', 'complete', 'failed'];
      for (const [key, value] of Object.entries(progress)) {
        if (!validProgressStates.includes(value)) {
          throw new Error(`Invalid progress state: ${value} for ${key}`);
        }
      }
      
      // Merge new progress with existing progress
      const updatedProgress = {
        ...(project || currentProject)?.progress,
        ...progress
      };
      
      // Add optimistic update
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId ? { ...project, progress: updatedProgress } : project
        )
      );
      
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({ ...currentProject, progress: updatedProgress });
      }
      
      // Update in database
      const { error } = await supabase
        .from('projects')
        .update({ progress: updatedProgress })
        .eq('id', projectId);
      
      if (error) throw error;
      
      // Check if all analysis steps are complete
      const isComplete = 
        updatedProgress.market_research === 'complete' &&
        updatedProgress.competitor_analysis === 'complete' &&
        updatedProgress.feature_analysis === 'complete' &&
        updatedProgress.customer_insights === 'complete' &&
        updatedProgress.customer_personas === 'complete' &&
        updatedProgress.opportunity_mapping === 'complete';

      if (isComplete) {
        // Update phase to dashboard
        await updateProjectPhase(projectId, 'dashboard');
      }
      
    } catch (error: any) {
      console.error('Error updating project progress:', error);
      setError(error.message);
      toast.error(`Failed to update project progress: ${error.message}`);
      
      // Revert optimistic update on error
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId ? { ...project, progress: project.progress } : project
        )
      );
      
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(currentProject);
      }
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
          progress: initialProgress,
          current_phase: 'problem_validation'
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
    fetchProjects();
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
        updateProjectPhase,
        updateProjectProgress
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

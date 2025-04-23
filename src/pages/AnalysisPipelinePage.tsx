
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/context/AuthContext";
import { useProject } from "@/lib/context/ProjectContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AnalysisStep = {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  description: string;
};

const AnalysisPipelinePage = () => {
  const { user } = useAuth();
  const { currentProject, problemContext } = useProject();
  const [steps, setSteps] = useState<AnalysisStep[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const navigate = useNavigate();

  // Initialize analysis steps
  useEffect(() => {
    if (!currentProject) return;

    const initialSteps = [
      {
        id: "market_research",
        name: "Market Research",
        status: currentProject.progress.market_research as any,
        progress: currentProject.progress.market_research === "completed" ? 100 : 0,
        description:
          "Analyzing market size, trends, and opportunities related to your problem.",
      },
      {
        id: "competitor_analysis",
        name: "Competitor Analysis",
        status: currentProject.progress.competitor_analysis as any,
        progress: currentProject.progress.competitor_analysis === "completed" ? 100 : 0,
        description:
          "Identifying and analyzing key competitors and their offerings.",
      },
      {
        id: "feature_analysis",
        name: "Feature Analysis",
        status: currentProject.progress.feature_analysis as any,
        progress: currentProject.progress.feature_analysis === "completed" ? 100 : 0,
        description:
          "Evaluating feature sets, capabilities and technical specifications.",
      },
      {
        id: "customer_insights",
        name: "Customer Insights",
        status: currentProject.progress.customer_insights as any,
        progress: currentProject.progress.customer_insights === "completed" ? 100 : 0,
        description:
          "Gathering insights on customer pain points and preferences.",
      },
      {
        id: "opportunity_mapping",
        name: "Opportunity Mapping",
        status: currentProject.progress.opportunity_mapping as any,
        progress: currentProject.progress.opportunity_mapping === "completed" ? 100 : 0,
        description:
          "Identifying market gaps and strategic opportunities for your solution.",
      },
      {
        id: "customer_personas",
        name: "Customer Personas",
        status: currentProject.progress.customer_personas as any,
        progress: currentProject.progress.customer_personas === "completed" ? 100 : 0,
        description:
          "Creating detailed profiles of your target customers.",
      },
    ];

    setSteps(initialSteps);
    
    // Check if analysis has already started or completed
    const hasStarted = initialSteps.some(step => step.status !== "pending");
    setIsStarted(hasStarted);
    
    // Calculate overall progress
    calculateOverallProgress(initialSteps);
    
    // Start polling for updates if analysis has started but not completed
    if (hasStarted && !areAllStepsCompleted(initialSteps)) {
      const interval = setInterval(() => {
        checkAnalysisProgress();
      }, 5000); // Poll every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [currentProject]);

  // Check if all steps are completed
  const areAllStepsCompleted = (stepsArray: AnalysisStep[]) => {
    return stepsArray.every(step => step.status === "completed");
  };

  // Calculate the overall progress
  const calculateOverallProgress = (stepsArray: AnalysisStep[]) => {
    const totalProgress = stepsArray.reduce((sum, step) => sum + step.progress, 0);
    const overallPercent = totalProgress / (stepsArray.length * 100) * 100;
    setOverallProgress(Math.round(overallPercent));
  };

  // Fetch the latest analysis progress
  const checkAnalysisProgress = async () => {
    if (!currentProject) return;
    
    try {
      const { data: projectData, error } = await supabase
        .from("projects")
        .select("progress")
        .eq("id", currentProject.id)
        .single();
      
      if (error) throw error;
      
      if (projectData) {
        const updatedSteps = steps.map(step => ({
          ...step,
          status: projectData.progress[step.id] as any,
          progress: projectData.progress[step.id] === "completed" ? 100 : 
                   projectData.progress[step.id] === "processing" ? 50 : 0,
        }));
        
        setSteps(updatedSteps);
        calculateOverallProgress(updatedSteps);
        
        // If all steps are completed, show success toast
        if (areAllStepsCompleted(updatedSteps) && !areAllStepsCompleted(steps)) {
          toast.success("Analysis completed successfully!");
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error("Error checking analysis progress:", error);
    }
  };

  // Start the analysis pipeline
  const startAnalysis = async () => {
    if (!currentProject || !problemContext || !problemContext.finalStatement) {
      toast.error("Problem understanding must be completed before starting analysis.");
      return;
    }
    
    try {
      // Update the project progress to indicate that analysis has started
      const updatedProgress = {
        ...currentProject.progress,
        market_research: "processing",
      };
      
      await supabase
        .from("projects")
        .update({ progress: updatedProgress })
        .eq("id", currentProject.id);
      
      // Update local state
      setSteps(prev => prev.map(step => 
        step.id === "market_research" ? 
        { ...step, status: "processing", progress: 50 } : 
        step
      ));
      
      setIsStarted(true);
      
      toast.success("Analysis pipeline started!");
      
      // In a real implementation, you would trigger your AI pipeline here
      // For now, we'll simulate the pipeline with setTimeout
      
      // Start polling for updates
      const interval = setInterval(() => {
        checkAnalysisProgress();
      }, 5000); // Poll every 5 seconds
      
      return () => clearInterval(interval);
      
    } catch (error) {
      console.error("Error starting analysis:", error);
      toast.error("Failed to start analysis. Please try again.");
    }
  };

  if (!currentProject || !problemContext) {
    return (
      <div className="min-h-screen bg-insight-dark flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-4">No Project or Problem Context</h2>
            <p className="text-center mb-6">Please complete the problem understanding phase first.</p>
            <Button onClick={() => navigate('/chat')}>Go to Problem Chat</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-insight-dark text-foreground pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="glass-card p-6">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl md:text-3xl font-bold">Analysis Pipeline</CardTitle>
              {!isStarted ? (
                <Button 
                  onClick={startAnalysis}
                  disabled={!problemContext.finalStatement}
                  className="bg-insight-purple hover:bg-insight-purple/80"
                >
                  Start Analysis
                </Button>
              ) : (
                <Badge variant={areAllStepsCompleted(steps) ? "success" : "secondary"}>
                  {areAllStepsCompleted(steps) ? "Completed" : "In Progress"}
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>

            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.id} className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {step.status === "completed" ? (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : step.status === "processing" ? (
                        <div className="w-6 h-6 rounded-full bg-insight-blue flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-muted-foreground flex items-center justify-center">
                          <span className="text-xs">{steps.indexOf(step) + 1}</span>
                        </div>
                      )}
                      <h3 className="text-lg font-medium">{step.name}</h3>
                    </div>
                    <Badge variant={
                      step.status === "completed" ? "success" :
                      step.status === "processing" ? "secondary" :
                      step.status === "error" ? "destructive" : "outline"
                    }>
                      {step.status === "completed" ? "Completed" :
                       step.status === "processing" ? "Processing" :
                       step.status === "error" ? "Error" : "Pending"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">{step.description}</p>
                  <div className="ml-8 mt-2">
                    <Progress value={step.progress} className="h-1" />
                  </div>
                </div>
              ))}
            </div>

            {areAllStepsCompleted(steps) && (
              <div className="mt-8 flex justify-center">
                <Button onClick={() => navigate('/dashboard')} className="bg-gradient-primary hover:opacity-90">
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisPipelinePage;

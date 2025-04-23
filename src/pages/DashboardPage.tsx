
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "@/lib/context/ProjectContext";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { toast } from "sonner";

const DashboardPage = () => {
  const { currentProject, problemContext } = useProject();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentProject) {
      // Check if problem understanding is needed
      if (!problemContext || !problemContext.finalStatement) {
        toast.info("Let's start by defining your problem");
        navigate('/chat');
        return;
      }

      // Check if analysis pipeline needs to be run
      const analysisNeeded = 
        currentProject.progress.market_research === 'pending' || 
        currentProject.progress.competitor_analysis === 'pending' ||
        currentProject.progress.feature_analysis === 'pending' ||
        currentProject.progress.customer_insights === 'pending' ||
        currentProject.progress.customer_personas === 'pending' ||
        currentProject.progress.opportunity_mapping === 'pending';
      
      if (analysisNeeded) {
        toast.info("Your project needs analysis. Redirecting to the analysis pipeline...");
        navigate('/analysis');
        return;
      }
    }
  }, [currentProject, problemContext, navigate]);

  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
};

export default DashboardPage;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "@/lib/context/ProjectContext";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { AnalysisProvider } from "@/lib/context/AnalysisContext";
import { toast } from "sonner";

const DashboardPage = () => {
  const { currentProject, problemContext } = useProject();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentProject) {
      // Check if problem understanding is needed
      if (!currentProject.current_phase || !problemContext || !problemContext.finalStatement) {
        toast.info("Let's start by defining your problem");
        navigate('/chat');
        return;
      }
    }
  }, [currentProject, problemContext, navigate]);

  return (
    <DashboardLayout>
      <AnalysisProvider>
        <DashboardContent />
      </AnalysisProvider>
    </DashboardLayout>
  );
};

export default DashboardPage;

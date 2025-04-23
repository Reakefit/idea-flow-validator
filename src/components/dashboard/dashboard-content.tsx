
import { useAuth } from "@/lib/context/AuthContext";
import { useProject, Project } from "@/lib/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Play, Users, BarChart } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const DashboardContent = () => {
  const { user } = useAuth();
  const { projects, currentProject, setCurrentProject, createProject, isLoading } = useProject();
  const [newProjectName, setNewProjectName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    
    const project = await createProject(newProjectName);
    if (project) {
      setDialogOpen(false);
      setNewProjectName("");
    }
  };

  const goToProblemChat = () => {
    navigate('/chat');
  };

  const goToAnalysis = () => {
    navigate('/analysis');
  };

  const goToInterviews = () => {
    navigate('/interview-assistant');
  };

  const goToInsights = () => {
    navigate('/insights');
  };

  const getProjectStatus = (project: Project) => {
    if (!project.progress) return "Not Started";
    
    if (project.progress.problem_validation !== "completed") {
      return "Problem Definition";
    }
    
    const inProgress = Object.values(project.progress).some(status => status === "processing");
    const allComplete = Object.values(project.progress).every(status => status === "completed");
    
    if (allComplete) return "Complete";
    if (inProgress) return "Analysis In Progress";
    return "Ready for Analysis";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete":
        return "success";
      case "Analysis In Progress":
        return "secondary";
      case "Problem Definition":
        return "info";
      case "Ready for Analysis":
        return "warning";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access your dashboard.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/login')} className="w-full">Sign In</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-insight-purple hover:bg-insight-purple/80">
              <PlusCircle className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Give your new validation project a name to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="My Awesome Startup"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>No Projects Yet</CardTitle>
            <CardDescription>Create your first project to get started!</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setDialogOpen(true)} className="w-full">Create Project</Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  currentProject?.id === project.id ? "border-primary border-2" : ""
                }`}
                onClick={() => setCurrentProject(project)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="truncate">{project.name}</CardTitle>
                    <Badge variant={getStatusColor(getProjectStatus(project)) as any}>
                      {getProjectStatus(project)}
                    </Badge>
                  </div>
                  <CardDescription>
                    Created on {new Date(project.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentProject(project);
                      
                      // Navigate based on project status
                      const status = getProjectStatus(project);
                      if (status === "Problem Definition") {
                        goToProblemChat();
                      } else if (status === "Ready for Analysis") {
                        goToAnalysis();
                      } else if (status === "Complete") {
                        goToInsights();
                      }
                    }}
                  >
                    {getProjectStatus(project) === "Problem Definition" ? "Continue Setup" : 
                     getProjectStatus(project) === "Ready for Analysis" ? "Start Analysis" :
                     getProjectStatus(project) === "Analysis In Progress" ? "View Analysis" :
                     "View Project"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {currentProject && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="insights" disabled={getProjectStatus(currentProject) !== "Complete"}>
                  Insights
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Problem Statement</CardTitle>
                      <CardDescription>Current understanding of the problem</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        {currentProject.progress.problem_validation === "completed" ? 
                          "Problem has been defined and validated." : 
                          "Problem still needs definition and validation."}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={goToProblemChat}>
                        {currentProject.progress.problem_validation === "completed" ? "View" : "Define Problem"}
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Analysis</CardTitle>
                      <CardDescription>Competitors and market insights</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        {currentProject.progress.market_research === "completed" && 
                         currentProject.progress.competitor_analysis === "completed" ? 
                          "Market analysis is complete." : 
                          "Market analysis needs to be performed."}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={goToAnalysis}
                        disabled={currentProject.progress.problem_validation !== "completed"}
                      >
                        {currentProject.progress.market_research === "completed" ? "View Analysis" : "Run Analysis"}
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Interviews</CardTitle>
                      <CardDescription>Scheduled and completed interviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Schedule and conduct customer interviews to validate your assumptions.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={goToInterviews}
                        disabled={!Object.values(currentProject.progress).every(status => status === "completed")}
                      >
                        Manage Interviews
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="actions">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Play className="mr-2 h-5 w-5" />
                        Start Problem Definition
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Define the problem your startup is solving through an AI-guided conversation.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={goToProblemChat} className="w-full bg-insight-blue hover:bg-insight-blue/80">
                        Go to Problem Chat
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart className="mr-2 h-5 w-5" />
                        Run Market Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Analyze market size, competition, and opportunities for your solution.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={goToAnalysis} 
                        className="w-full bg-insight-purple hover:bg-insight-purple/80"
                        disabled={currentProject.progress.problem_validation !== "completed"}
                      >
                        Start Analysis
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Schedule Customer Interviews
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Set up and conduct interviews with potential customers to validate your idea.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={goToInterviews} 
                        className="w-full"
                        disabled={!Object.values(currentProject.progress).every(status => status === "completed")}
                      >
                        Schedule Interviews
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart className="mr-2 h-5 w-5" />
                        View Consolidated Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Get a comprehensive overview of all analysis and interview insights.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={goToInsights} 
                        className="w-full"
                        disabled={!Object.values(currentProject.progress).every(status => status === "completed")}
                      >
                        View Insights
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="insights">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Market Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Detailed market insights will appear here once analysis is complete.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={goToInsights}>
                      View Full Insights
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
};

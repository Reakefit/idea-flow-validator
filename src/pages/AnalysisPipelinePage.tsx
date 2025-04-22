
import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2 } from "lucide-react";

const analysisSteps = [
  { id: 1, name: "Market Size Analysis", description: "Evaluating total addressable market and growth trends" },
  { id: 2, name: "Competitor Landscape", description: "Identifying key players and market positioning" },
  { id: 3, name: "Feature Gap Analysis", description: "Analyzing competitive features and opportunities" },
  { id: 4, name: "Pain Point Extraction", description: "Identifying customer pain points from reviews and data" },
  { id: 5, name: "Opportunity Mapping", description: "Highlighting strategic market opportunities" },
  { id: 6, name: "Persona Development", description: "Creating detailed customer personas for targeting" },
];

const AnalysisPipelinePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);

  // Simulate progress
  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress(old => {
          const newProgress = old + 2;
          if (newProgress >= currentStep * 100 / analysisSteps.length && currentStep < analysisSteps.length) {
            setCurrentStep(current => current + 1);
          }
          return newProgress;
        });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [progress, currentStep]);

  return (
    <div className="min-h-screen bg-insight-dark flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-insight-blue opacity-20 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-insight-purple opacity-20 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-3xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">AI Analysis Pipeline</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Our AI agents are analyzing your business idea
          </p>
        </div>

        <GlassCard className="mb-8">
          <div className="flex flex-col items-center mb-6">
            <Progress value={progress} className="w-full h-3" />
            <p className="mt-2 text-muted-foreground">{Math.round(progress)}% Complete</p>
          </div>

          <div className="space-y-6">
            {analysisSteps.map((step) => (
              <div key={step.id} className="animate-fade-in">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.id < currentStep ? 'bg-primary/20 text-primary' : 
                      step.id === currentStep ? 'bg-secondary/20 text-secondary animate-pulse' : 
                      'bg-muted/20 text-muted-foreground'
                    }`}>
                      {step.id < currentStep ? (
                        <Check className="h-5 w-5" />
                      ) : step.id === currentStep ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-medium ${
                      step.id < currentStep ? 'text-primary' : 
                      step.id === currentStep ? 'text-white' : 
                      'text-muted-foreground'
                    }`}>
                      {step.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                    {step.id === currentStep && (
                      <div className="mt-3 bg-secondary/10 rounded-md p-3 border border-secondary/20">
                        <p className="text-sm animate-pulse">
                          Processing data... <span className="animate-pulse">•••</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {step.id !== analysisSteps.length && (
                  <div className="pl-5 ml-5 mt-2 mb-2 border-l border-dashed border-muted/30 h-6"></div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="text-center text-sm text-muted-foreground">
          <p>This process typically takes 2-3 minutes to complete</p>
          <p className="mt-2">We're using AI to generate comprehensive insights about your idea</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPipelinePage;

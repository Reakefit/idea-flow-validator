
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/context/AuthContext";
import { useProject } from "@/lib/context/ProjectContext";
import { OpenAIProblemUnderstandingAgent } from "@/lib/ai/openai-agent";
import { supabase } from "@/integrations/supabase/client";
import { ProblemUnderstandingResult } from "@/lib/ai/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ChatPage = () => {
  const { user } = useAuth();
  const { currentProject, problemContext, fetchProblemContext } = useProject();
  const [input, setInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agent, setAgent] = useState<OpenAIProblemUnderstandingAgent | null>(null);
  const [conversation, setConversation] = useState<{ type: 'question' | 'response', content: string }[]>([]);
  const navigate = useNavigate();

  // Initialize the agent when the component mounts
  useEffect(() => {
    if (!currentProject) {
      return;
    }

    const openAiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "sk-dummy-key"; // Replace with your actual key or get from env
    const newAgent = new OpenAIProblemUnderstandingAgent(openAiKey, currentProject.id, supabase);
    setAgent(newAgent);
    
    // If we already have a problem context with a final statement, we're done
    if (problemContext?.finalStatement) {
      setIsComplete(true);
      // Reconstruct conversation from problemContext
      const reconstructedConversation = [];
      
      if (problemContext.initialStatement) {
        reconstructedConversation.push({
          type: 'response',
          content: problemContext.initialStatement
        });
      }
      
      for (let i = 0; i < problemContext.clarifyingQuestions.length; i++) {
        reconstructedConversation.push({
          type: 'question',
          content: problemContext.clarifyingQuestions[i]
        });
        
        if (problemContext.userResponses[i]) {
          reconstructedConversation.push({
            type: 'response',
            content: problemContext.userResponses[i].response
          });
        }
      }
      
      if (problemContext.finalStatement) {
        reconstructedConversation.push({
          type: 'question',
          content: "Thank you for sharing this information. I now have a comprehensive understanding of your project. Here's a summary of what I've gathered:"
        });
        reconstructedConversation.push({
          type: 'question',
          content: problemContext.finalStatement
        });
      }
      
      setConversation(reconstructedConversation);
    } else {
      // Start a new conversation
      if (!problemContext || !problemContext.initialStatement) {
        setCurrentQuestion("What problem are you trying to solve with your startup?");
      } else {
        setCurrentQuestion(null);
        // Reconstruct conversation from partial problemContext
        const reconstructedConversation = [];
        
        reconstructedConversation.push({
          type: 'question',
          content: "What problem are you trying to solve with your startup?"
        });
        
        if (problemContext.initialStatement) {
          reconstructedConversation.push({
            type: 'response',
            content: problemContext.initialStatement
          });
        }
        
        for (let i = 0; i < problemContext.clarifyingQuestions.length; i++) {
          reconstructedConversation.push({
            type: 'question',
            content: problemContext.clarifyingQuestions[i]
          });
          
          if (problemContext.userResponses[i]) {
            reconstructedConversation.push({
              type: 'response',
              content: problemContext.userResponses[i].response
            });
          }
        }
        
        if (problemContext.clarifyingQuestions.length > 0 && 
            (!problemContext.userResponses || problemContext.userResponses.length < problemContext.clarifyingQuestions.length)) {
          // There's an unanswered question
          setCurrentQuestion(problemContext.clarifyingQuestions[problemContext.clarifyingQuestions.length - 1]);
        } else if (!problemContext.finalStatement) {
          // We need the next question
          loadNextQuestion(problemContext.initialStatement);
        }
        
        setConversation(reconstructedConversation);
      }
    }
  }, [currentProject, problemContext]);

  const loadNextQuestion = async (initialResponse: string) => {
    if (!agent) return;
    
    try {
      setIsLoading(true);
      
      let result: ProblemUnderstandingResult;
      
      if (!problemContext || !problemContext.clarifyingQuestions || problemContext.clarifyingQuestions.length === 0) {
        // This is the first question, use understandProblem
        result = await agent.understandProblem(initialResponse);
      } else {
        // There's no question to answer, proceed to completion
        result = {
          nextQuestion: null,
          isComplete: true,
          completionMessage: "We've gathered enough information to proceed with the analysis.",
          understandingLevel: 100,
          keyInsights: problemContext.keyInsights,
          context: problemContext
        };
      }
      
      setCurrentQuestion(result.nextQuestion);
      setIsComplete(result.isComplete);
      
      if (result.isComplete) {
        // Generate final statement if needed
        if (!problemContext?.finalStatement) {
          const finalResult = await agent.generateFinalStatement();
          setConversation(prev => [
            ...prev,
            { 
              type: 'question', 
              content: "Thank you for sharing this information. I now have a comprehensive understanding of your project. Here's a summary of what I've gathered:" 
            },
            { type: 'question', content: finalResult.finalStatement }
          ]);
        }
        
        // Refresh problem context
        if (currentProject) {
          await fetchProblemContext(currentProject.id);
        }
        
        // Show completion toast
        toast.success("Problem understanding complete! Moving to analysis phase.");
        
        // Navigate to analysis pipeline after a short delay
        setTimeout(() => {
          navigate('/analysis');
        }, 3000);
      }
    } catch (error) {
      console.error("Error loading next question:", error);
      toast.error("Failed to process your response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || !agent || !currentProject) return;
    
    try {
      setIsLoading(true);
      
      const userResponse = input.trim();
      setInput("");
      
      // Add user's response to conversation
      setConversation(prev => [...prev, { type: 'response', content: userResponse }]);
      
      // If this is the first question (about the problem)
      if (conversation.length === 0) {
        setConversation([
          { type: 'question', content: "What problem are you trying to solve with your startup?" },
          { type: 'response', content: userResponse }
        ]);
        
        loadNextQuestion(userResponse);
        return;
      }
      
      // Process the user's response to the current question
      if (currentQuestion) {
        const result = await agent.processUserResponse(currentQuestion, userResponse);
        
        if (result.nextQuestion) {
          setCurrentQuestion(result.nextQuestion);
          setConversation(prev => [...prev, { type: 'question', content: result.nextQuestion! }]);
        }
        
        setIsComplete(result.isComplete);
        
        if (result.isComplete) {
          // Generate final statement if needed
          if (!problemContext?.finalStatement) {
            const finalResult = await agent.generateFinalStatement();
            setConversation(prev => [
              ...prev,
              { 
                type: 'question', 
                content: "Thank you for sharing this information. I now have a comprehensive understanding of your project. Here's a summary of what I've gathered:" 
              },
              { type: 'question', content: finalResult.finalStatement }
            ]);
          }
          
          // Refresh problem context
          if (currentProject) {
            await fetchProblemContext(currentProject.id);
          }
          
          // Show completion toast
          toast.success("Problem understanding complete! Moving to analysis phase.");
          
          // Navigate to analysis pipeline after a short delay
          setTimeout(() => {
            navigate('/analysis');
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error processing response:", error);
      toast.error("Failed to process your response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-insight-dark flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-4">No Project Selected</h2>
            <p className="text-center mb-6">Please go to your dashboard and create or select a project.</p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-insight-dark text-foreground pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="glass-card p-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Problem Understanding</h1>
            <p className="text-muted-foreground">
              Tell me about the problem you're solving so I can help validate your business idea.
            </p>
          </div>

          <div className="space-y-6 mb-6 max-h-[50vh] overflow-y-auto rounded-lg p-4 bg-black/20">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.type === "question" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.type === "question"
                      ? "bg-insight-blue/20 text-foreground"
                      : "bg-primary/20 text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-4 bg-insight-blue/20">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-foreground/60 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-foreground/60 animate-pulse delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-foreground/60 animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isComplete ? "Problem understanding is complete." : "Type your response..."}
              className="resize-none bg-white/5"
              disabled={isLoading || isComplete}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading || isComplete}
              className="shrink-0 bg-insight-purple hover:bg-insight-purple/80"
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;

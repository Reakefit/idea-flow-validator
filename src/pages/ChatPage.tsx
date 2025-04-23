
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProject } from "@/lib/context/ProjectContext";
import { useAuth } from "@/lib/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { OpenAIProblemUnderstandingAgent } from '@/lib/ai/openai-agent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentProject: project, fetchProblemContext, problemContext } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [agent, setAgent] = useState<OpenAIProblemUnderstandingAgent | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if we already have a problem context with a final statement
    if (project && problemContext?.finalStatement) {
      navigate('/analysis');
      return;
    }
    
    // Initialize agent if we have project and user
    if (project && user && !agent) {
      const newAgent = new OpenAIProblemUnderstandingAgent(
        project.id,  // project_id
        supabase,    // Supabase client
        user.id      // user_id
      );
      setAgent(newAgent);
      
      // Load existing context
      newAgent.loadContext(project.id)
        .then(() => {
          const context = newAgent.getContext();
          
          // If we have existing questions and responses, reconstruct the conversation
          if (context.initialStatement && context.clarifyingQuestions.length > 0) {
            const reconstructedMessages: Message[] = [
              { role: 'assistant', content: "Hi there! I'm your idea validation assistant. Tell me about the problem you're trying to solve with your startup idea." },
              { role: 'user', content: context.initialStatement }
            ];
            
            // Add existing Q&A pairs
            context.userResponses.forEach((response, index) => {
              if (index < context.clarifyingQuestions.length) {
                reconstructedMessages.push({ 
                  role: 'assistant', 
                  content: context.clarifyingQuestions[index] 
                });
                reconstructedMessages.push({ 
                  role: 'user', 
                  content: response.response 
                });
              }
            });
            
            // If there's a next question that hasn't been answered yet
            const nextQuestionIndex = context.userResponses.length;
            if (nextQuestionIndex < context.clarifyingQuestions.length) {
              setCurrentQuestion(context.clarifyingQuestions[nextQuestionIndex]);
              reconstructedMessages.push({ 
                role: 'assistant', 
                content: context.clarifyingQuestions[nextQuestionIndex] 
              });
            } else if (context.finalStatement) {
              // If we've reached the final statement
              reconstructedMessages.push({ 
                role: 'assistant', 
                content: "We've gathered enough information to proceed with the analysis." 
              });
            }
            
            setMessages(reconstructedMessages);
          } else {
            // No existing conversation, just show welcome message
            setMessages([{
              role: 'assistant',
              content: "Hi there! I'm your idea validation assistant. Tell me about the problem you're trying to solve with your startup idea."
            }]);
          }
        })
        .catch(error => {
          console.error("Error loading agent context:", error);
          toast.error("Error loading previous conversation");
        });
    }
  }, [user, navigate, project, problemContext, agent]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-64" /></CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4">
            <span>Problem Validation:</span>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center space-x-4">
            <span>Market Research:</span>
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !agent) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setInput('');
    setIsLoading(true);

    try {
      let result;
      
      // If this is the first message (initial problem statement)
      if (messages.length === 1) {
        // First message is always the welcome message, so this is initial problem
        result = await agent.understandProblem(message);
        setCurrentQuestion(result.nextQuestion);
        
      } else if (currentQuestion) {
        // This is a response to a clarifying question
        result = await agent.processUserResponse(currentQuestion, message);
        setCurrentQuestion(result.nextQuestion);
      } else {
        // Shouldn't happen, but handle gracefully
        toast.error("Unable to determine conversation state");
        setIsLoading(false);
        return;
      }

      // If there's a completion message, show it
      if (result.completionMessage) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: result.completionMessage 
        }]);
      }

      // If there's a next question, show it
      if (result.nextQuestion) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: result.nextQuestion 
        }]);
      }
      
      // Handle completion
      if (result.isComplete) {
        // Update project status
        const { error } = await supabase
          .from('projects')
          .update({ 
            progress: {
              ...project.progress,
              problem_validation: 'complete'
            }
          })
          .eq('id', project.id);
          
        if (error) {
          console.error("Error updating project status:", error);
          toast.error("Failed to update project status");
        } else {
          toast.success("Problem understanding complete!");
          
          // Refresh context
          fetchProblemContext(project.id);
          
          // After a short delay, navigate to analysis page
          setTimeout(() => {
            navigate('/analysis');
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, there was an error processing your request." 
      }]);
      toast.error("Error processing your message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto h-screen flex flex-col">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle>Problem Understanding Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <ScrollArea className="flex-grow">
            <div className="flex flex-col gap-2 p-2">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8 mr-2">
                      <AvatarImage src="https://github.com/shadcn.png" alt="AI Avatar" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-md p-2 ${message.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100'}`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 ml-2">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt="User Avatar" />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center justify-center">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSendMessage(input);
                }
              }}
              disabled={isLoading}
            />
            <Button onClick={() => handleSendMessage(input)} disabled={isLoading}>
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;

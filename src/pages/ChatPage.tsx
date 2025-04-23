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
  isTyping?: boolean;
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
  const [questionCount, setQuestionCount] = useState<number>(0);
  const MAX_FOLLOW_UP_QUESTIONS = 2; // Updated max follow-up questions to 2

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (project && problemContext?.finalStatement) {
      updateProjectPhase('analysis');
      navigate('/analysis');
      return;
    }
    
    if (project && user && !agent) {
      const newAgent = new OpenAIProblemUnderstandingAgent(
        project.id,
        supabase,
        user.id
      );
      setAgent(newAgent);

      newAgent.loadContext(project.id)
        .then(() => {
          const context = newAgent.getContext();
          if (context.initialStatement && context.clarifyingQuestions.length > 0) {
            const reconstructedMessages: Message[] = [
              { role: 'assistant', content: "Hi there! I'm your idea validation assistant. Tell me about the problem you're trying to solve with your startup idea." },
              { role: 'user', content: context.initialStatement }
            ];
            
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

            setQuestionCount(context.userResponses.length);

            const nextQuestionIndex = context.userResponses.length;
            if (nextQuestionIndex < context.clarifyingQuestions.length) {
              setCurrentQuestion(context.clarifyingQuestions[nextQuestionIndex]);
              reconstructedMessages.push({
                role: 'assistant',
                content: context.clarifyingQuestions[nextQuestionIndex]
              });
            } else if (context.finalStatement) {
              reconstructedMessages.push({
                role: 'assistant',
                content: "We've gathered enough information to proceed with the analysis."
              });
            }
            setMessages(reconstructedMessages);
          } else {
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

    if (project && (!project.current_phase || project.current_phase === '')) {
      updateProjectPhase('problem_understanding');
    }
  }, [user, navigate, project, problemContext, agent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateProjectPhase = async (phase: string) => {
    if (!project) return;
    try {
      const { error } = await supabase
        .from('projects')
        .update({ current_phase: phase })
        .eq('id', project.id);

      if (error) {
        console.error("Error updating project phase:", error);
        toast.error("Failed to update project phase");
      }
    } catch (error) {
      console.error("Error updating project phase:", error);
      toast.error("Failed to update project phase");
    }
  };

  if (!user) {
    return null;
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
    
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'assistant', content: '', isTyping: true }]);

    try {
      let result;

      if (messages.length === 1) {
        result = await agent.understandProblem(message);
        setCurrentQuestion(result.nextQuestion);
      } else if (currentQuestion) {
        result = await agent.processUserResponse(currentQuestion, message);
        setCurrentQuestion(result.nextQuestion);
        setQuestionCount(prev => prev + 1);
      } else {
        toast.error("Unable to determine conversation state");
        setIsLoading(false);
        return;
      }

      setMessages(prev => prev.filter(msg => !msg.isTyping));

      if (result.completionMessage) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.completionMessage
        }]);
      }

      if (result.nextQuestion) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.nextQuestion
        }]);
      }

      if (result.isComplete || questionCount >= MAX_FOLLOW_UP_QUESTIONS) {
        const { error } = await supabase
          .from('projects')
          .update({
            progress: {
              ...project.progress,
              problem_validation: 'complete'
            },
            current_phase: 'analysis'
          })
          .eq('id', project.id);

        if (error) {
          console.error("Error updating project status:", error);
          toast.error("Failed to update project status");
        } else {
          toast.success("Problem understanding complete!");
          fetchProblemContext(project.id);

          setTimeout(() => {
            navigate('/analysis');
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages(prev => prev.filter(msg => !msg.isTyping));
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
                    {message.isTyping ? (
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 ml-2">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt="User Avatar" />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <Separator className="my-4" />
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <Button 
              onClick={() => handleSendMessage(input)}
              disabled={isLoading || !input.trim()}
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPage;

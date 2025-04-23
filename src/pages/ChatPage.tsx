import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
  timestamp: number;
  status: 'sending' | 'sent' | 'failed';
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentProject: project, fetchProblemContext, problemContext, updateProjectProgress } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [agent, setAgent] = useState<OpenAIProblemUnderstandingAgent | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const MAX_FOLLOW_UP_QUESTIONS = 3;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (project && problemContext?.finalStatement) {
      updateProjectPhase('analysis');
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
              { 
                id: '1',
                role: 'assistant', 
                content: "Hi there! I'm your idea validation assistant. Tell me about the problem you're trying to solve with your startup idea.",
                timestamp: Date.now(),
                status: 'sent'
              },
              { 
                id: '2',
                role: 'user', 
                content: context.initialStatement,
                timestamp: Date.now(),
                status: 'sent'
              }
            ];
            
            // Add questions and responses
            context.userResponses.forEach((response, index) => {
              if (index < context.clarifyingQuestions.length) {
                reconstructedMessages.push({
                  id: `q${index + 1}`,
                  role: 'assistant',
                  content: context.clarifyingQuestions[index],
                  timestamp: Date.now(),
                  status: 'sent'
                });

                reconstructedMessages.push({
                  id: `r${index + 1}`,
                  role: 'user',
                  content: response.response,
                  timestamp: Date.now(),
                  status: 'sent'
                });
              }
            });

            setQuestionCount(context.userResponses.length);

            const nextQuestionIndex = context.userResponses.length;
            if (nextQuestionIndex < context.clarifyingQuestions.length) {
              setCurrentQuestion(context.clarifyingQuestions[nextQuestionIndex]);
              reconstructedMessages.push({
                id: `q${nextQuestionIndex + 1}`,
                role: 'assistant',
                content: context.clarifyingQuestions[nextQuestionIndex],
                timestamp: Date.now(),
                status: 'sent'
              });
            }

            setMessages(reconstructedMessages);
          } else {
            setMessages([{
              id: '1',
              role: 'assistant',
              content: "Hi there! I'm your idea validation assistant. Tell me about the problem you're trying to solve with your startup idea.",
              timestamp: Date.now(),
              status: 'sent'
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

  const updateProjectPhase = async (phase: string) => {
    if (!project) return;
    try {
      setIsLoading(true);
      
      if (phase === 'analysis') {
        const { data: context } = await supabase
          .from('problem_understanding_context')
          .select('final_statement')
          .eq('project_id', project.id)
          .single();

        if (!context?.final_statement) {
          throw new Error('Cannot transition to analysis without final problem statement');
        }
      }

      await updateProjectProgress(project.id, { problem_validation: 'complete' });
      
      const { error } = await supabase
        .from('projects')
        .update({ current_phase: phase })
        .eq('id', project.id);

      if (error) throw error;

      await fetchProblemContext(project.id);
      
      if (phase === 'analysis') {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error updating project phase:", error);
      toast.error("Failed to update project phase");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !agent) return;
    
    const messageId = Date.now().toString();
    const newMessage: Message = {
      id: messageId,
      role: 'user',
      content: message,
      timestamp: Date.now(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    const typingMessage: Message = {
      id: `typing-${messageId}`,
      role: 'assistant',
      content: '',
      isTyping: true,
      timestamp: Date.now(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, typingMessage]);

    try {
      let result;

      if (messages.length === 1) {
        result = await agent.understandProblem(message);
        setCurrentQuestion(result.nextQuestion);
        setQuestionCount(1);
      } else if (currentQuestion) {
        result = await agent.processUserResponse(currentQuestion, message);
        
        const newQuestionCount = questionCount + 1;
        setQuestionCount(newQuestionCount);

        if (newQuestionCount === MAX_FOLLOW_UP_QUESTIONS + 1) {
          setMessages(prev => [...prev, {
            id: `compiling-${messageId}`,
            role: 'assistant',
            content: "Thank you for providing all the information. I'm now compiling a comprehensive problem statement. Please wait a moment...",
            timestamp: Date.now(),
            status: 'sent'
          }]);

          const finalResult = await agent.compileFinalStatement();
          if (finalResult.finalStatement) {
            setMessages(prev => [...prev, {
              id: `final-${messageId}`,
              role: 'assistant',
              content: "I've compiled a comprehensive problem statement. Let's proceed to the analysis phase.",
              timestamp: Date.now(),
              status: 'sent'
            }]);
            await updateProjectPhase('analysis');
          }
        } else {
          setCurrentQuestion(result.nextQuestion);
        }
      } else {
        throw new Error("Unable to determine conversation state");
      }

      setMessages(prev => prev.filter(msg => !msg.isTyping));

      if (questionCount < MAX_FOLLOW_UP_QUESTIONS) {
        if (result.completionMessage) {
          setMessages(prev => [...prev, {
            id: `complete-${messageId}`,
            role: 'assistant',
            content: result.completionMessage,
            timestamp: Date.now(),
            status: 'sent'
          }]);
        }

        if (result.nextQuestion && questionCount < MAX_FOLLOW_UP_QUESTIONS) {
          setMessages(prev => [...prev, {
            id: `question-${messageId}`,
            role: 'assistant',
            content: result.nextQuestion,
            timestamp: Date.now(),
            status: 'sent'
          }]);
        }
      }

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'sent' } : msg
      ));
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      setMessages(prev => [...prev, {
        id: `error-${messageId}`,
        role: 'assistant',
        content: "I'm sorry, there was an error processing your request. Please try again.",
        timestamp: Date.now(),
        status: 'sent'
      }]);
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'failed' } : msg
      ));
      
      toast.error("Error processing your message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryMessage = async (message: Message) => {
    await handleSendMessage(message.content);
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

  return (
    <div className="container mx-auto h-screen flex flex-col">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle>Problem Understanding Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <ScrollArea className="flex-grow">
            <div className="flex flex-col gap-2 p-2">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8 mr-2">
                      <AvatarImage src="https://github.com/shadcn.png" alt="AI Avatar" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-md p-2 ${message.role === 'user' ? 'bg-blue-100 text-right text-black' : 'bg-gray-100 text-black'} ${message.status === 'failed' ? 'border border-red-500' : ''}`}>
                    {message.isTyping ? (
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <p className="text-sm">{message.content}</p>
                        {message.status === 'failed' && (
                          <button 
                            onClick={() => handleRetryMessage(message)}
                            className="text-xs text-red-500 hover:text-red-700 mt-1"
                          >
                            Retry
                          </button>
                        )}
                      </div>
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
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
              placeholder="Type your message... (Shift + Enter for new line)"
              disabled={isLoading}
              className="min-h-[40px] max-h-[120px] resize-none"
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

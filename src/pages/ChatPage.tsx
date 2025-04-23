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
    
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi there! I'm your idea validation assistant. Tell me about the problem you're trying to solve with your startup idea."
      }]);
    }
    
  }, [user, navigate, project, problemContext, messages.length]);

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
          <CardTitle>Loading Project...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-[200px]" />
          <Separator className="my-2" />
          <Skeleton className="h-4 w-[200px]" />
        </CardContent>
      </Card>
    );
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setInput('');

    try {
      setIsLoading(true);
      
      if (!user?.id || !project) {
        toast.error("User ID and project are required for problem understanding");
        return;
      }

      const agent = new OpenAIProblemUnderstandingAgent(project.id, user.id, supabase);
      
      await agent.loadContext(project.id);

      const result = await agent.understandProblem(message);

      await agent.saveContext();

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
      
      if (result.isComplete) {
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
          
          setTimeout(() => {
            navigate('/analysis');
          }, 2000);
        }
      }
      
      fetchProblemContext(project.id);
      
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

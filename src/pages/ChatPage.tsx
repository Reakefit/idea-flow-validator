
import React, { useEffect, useState } from 'react';
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

// Import the supabase client directly
import { supabase } from '@/integrations/supabase/client';
import { OpenAIProblemUnderstandingAgent } from '@/lib/ai/openai-agent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentProject: project } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

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
      
      // Initialize the agent using the imported supabase client
      if (!user?.id) {
        toast.error("User ID is required for problem understanding");
        return;
      }
      
      const agent = new OpenAIProblemUnderstandingAgent(project.id, supabase, user.id);
      
      // Load existing context
      await agent.loadContext(project.id);

      // Process the user's message
      const result = await agent.understandProblem(message);

      // Save the updated context
      await agent.saveContext();

      // Display the agent's response
      setMessages(prev => [...prev, { role: 'assistant', content: result.completionMessage || 'Analysis complete.' }]);

      if (result.nextQuestion) {
        setMessages(prev => [...prev, { role: 'assistant', content: result.nextQuestion }]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, there was an error processing your request." }]);
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
                  <p>Loading...</p>
                </div>
              )}
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
                if (e.key === 'Enter') {
                  handleSendMessage(input);
                }
              }}
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

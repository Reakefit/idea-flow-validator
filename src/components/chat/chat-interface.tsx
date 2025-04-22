
import { useState, useRef, useEffect } from "react";
import { GradientButton } from "../ui/gradient-button";
import { GlassCard } from "../ui/glass-card";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  isTyping?: boolean;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi there! I'm your idea validation assistant. Tell me about the problem you're trying to solve with your startup idea.",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(input),
        sender: "ai",
        isTyping: true,
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // Remove typing indicator after response is complete
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessage.id ? { ...msg, isTyping: false } : msg
          )
        );
        setIsTyping(false);
      }, 1500);
    }, 1000);
  };

  const getAIResponse = (userInput: string): string => {
    // This is just a simple simulation - would be replaced with actual AI API
    const responses = [
      "Tell me more about the specific pain points your customers face.",
      "That's interesting! How do people currently solve this problem?",
      "Can you elaborate on who would be your target audience?",
      "What existing solutions are out there, and how would your idea be different?",
      "Thanks for sharing that. Have you validated this problem with potential customers yet?",
      "I understand. What do you think would be the biggest challenge in solving this problem?",
      "Great insights! Let's dive deeper into the market size for this problem.",
      "Excellent point. What metrics would indicate that you've successfully solved this problem?",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="flex flex-col h-screen bg-insight-dark relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-insight-blue opacity-10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-insight-purple opacity-10 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <header className="glass border-b border-white/10 p-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gradient">InsightValidator</Link>
        <div className="text-sm text-white/70">Problem Definition Chat</div>
        <div className="flex items-center space-x-4">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-white/70">AI Assistant Active</span>
        </div>
      </header>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <GlassCard
                className={`max-w-[80%] ${
                  message.sender === "user"
                    ? "bg-gradient-primary/20"
                    : "glass"
                } ${message.isTyping ? "animate-pulse" : ""}`}
              >
                <div>
                  {message.isTyping ? (
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  ) : (
                    message.text
                  )}
                </div>
              </GlassCard>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 glass border-t border-white/10">
        <div className="max-w-4xl mx-auto flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-white/5 border border-white/10 rounded-l-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none"
            placeholder="Describe the problem you're solving..."
            disabled={isTyping}
          />
          <GradientButton
            onClick={handleSend}
            className="rounded-l-none px-6"
            disabled={isTyping}
          >
            Send
          </GradientButton>
        </div>

        <div className="max-w-4xl mx-auto mt-6 flex justify-between items-center">
          <div className="text-sm text-white/50">
            Be specific about the problem, target audience, and current solutions
          </div>

          <Link to="/dashboard">
            <GradientButton variant="secondary" size="sm">
              Continue to Analysis
            </GradientButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export { ChatInterface };

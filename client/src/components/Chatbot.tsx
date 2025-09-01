import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, MessageCircle, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Chatbot({ isOpen, onToggle }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m here to help with your workplace complaints. You can submit complaints directly here, check on complaint status, or get guidance on workplace issues. Just describe your concern in detail and I\'ll help you lodge it.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat', { 
        message,
        chatHistory: messages.slice(-5) // Send last 5 messages for context
      });
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }]);

      // If a complaint was submitted, refresh the complaints data and show success toast
      if (data.complaintSubmitted) {
        queryClient.invalidateQueries({ queryKey: ['/api/complaints'] });
        queryClient.invalidateQueries({ queryKey: ['/api/complaints/stats'] });
        
        toast({
          title: "Complaint Successfully Lodged!",
          description: `Your complaint (#${data.complaintId}) has been submitted anonymously and is under review.`,
        });
      }
    },
    onError: () => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      }]);
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    chatMutation.mutate(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        size="lg"
      >
        <MessageCircle size={24} />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <span>Complaint Assistant</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0"
        >
          <X size={16} />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 h-[350px]">
          <div className="p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex space-x-2",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'assistant' && (
                  <Bot className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                )}
                <div
                  className={cn(
                    "max-w-[280px] rounded-lg px-3 py-2 text-sm break-words",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground ml-8" 
                      : message.content.includes("Complaint Details:") || message.content.includes("Thank you! Your complaint has been")
                        ? "bg-green-50 border border-green-200 text-green-800"
                        : "bg-muted"
                  )}
                >
                  {message.content.includes("Complaint Details:") && (
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="font-medium text-green-700">Complaint Submitted</span>
                    </div>
                  )}
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <User className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex space-x-2 justify-start">
                <Bot className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about complaints..."
              disabled={chatMutation.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              size="sm"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
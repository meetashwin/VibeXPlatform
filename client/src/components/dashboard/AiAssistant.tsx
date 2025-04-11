import { useState, useRef, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Message } from "@/lib/types";
import { useUser } from "@/context/UserContext";

const AiAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Load initial messages
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/messages");
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/messages", {
        content: input,
      });

      if (response.ok) {
        const aiResponse = await response.json();
        setMessages(prev => [...prev, {
          id: aiResponse.id,
          content: aiResponse.content,
          sender: "ai",
          timestamp: new Date(aiResponse.timestamp),
        }]);
      } else {
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageContent = (content: string) => {
    // Simple code block detection
    if (content.includes("```")) {
      const parts = content.split("```");
      return (
        <>
          {parts.map((part, index) => {
            if (index % 2 === 0) {
              return <p key={index}>{part}</p>;
            } else {
              // This is a code block
              const lines = part.split('\n');
              const language = lines[0]; // First line might contain language
              const code = lines.slice(language ? 1 : 0).join('\n');
              
              return (
                <pre key={index} className="font-mono text-xs bg-black/80 p-2 mt-2 rounded text-white overflow-x-auto">
                  {code}
                </pre>
              );
            }
          })}
        </>
      );
    }
    
    return <p>{content}</p>;
  };

  return (
    <div className="bg-white border-4 border-black p-4 brutal-shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 bg-primary border-2 border-black flex items-center justify-center">
          <i className="ri-robot-fill text-black text-xl"></i>
        </div>
        <div className="font-heading font-bold">Ask for Help (Architecture, Coding)</div>
      </div>
      
      <div className="h-[300px] overflow-y-auto border-2 border-black p-3 mb-4 bg-gray-50">
        {messages.length === 0 && !isLoading ? (
          <div className="text-center text-gray-500 mt-4">
            Ask me anything about coding, debugging, or software development!
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex gap-2 mb-3 ${message.sender === 'ai' ? 'justify-end' : ''}`}
            >
              {message.sender === 'user' && (
                <div className="flex-shrink-0 h-8 w-8 bg-secondary border-2 border-black flex items-center justify-center text-xs font-bold">
                  {user?.initials || "JD"}
                </div>
              )}
              
              <div className={`p-2 ${
                message.sender === 'ai' 
                  ? 'bg-accent text-white rounded-tl-lg rounded-b-lg max-w-[80%]' 
                  : 'bg-gray-200 rounded-tr-lg rounded-b-lg max-w-[80%]'
              }`}>
                {formatMessageContent(message.content)}
                <span className={`text-xs ${message.sender === 'ai' ? 'text-white/80' : 'text-gray-500'} block mt-1`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              {message.sender === 'ai' && (
                <div className="flex-shrink-0 h-8 w-8 bg-primary border-2 border-black flex items-center justify-center">
                  <i className="ri-robot-fill text-black text-sm"></i>
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-2 justify-end mb-3">
            <div className="bg-accent p-2 text-white rounded-tl-lg rounded-b-lg max-w-[80%]">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
            <div className="flex-shrink-0 h-8 w-8 bg-primary border-2 border-black flex items-center justify-center">
              <i className="ri-robot-fill text-black text-sm"></i>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Ask a coding question..." 
          className="flex-1 border-2 border-black p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button 
          className={`bg-primary text-black font-bold px-4 border-2 border-black brutal-shadow brutal-button ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSend}
          disabled={isLoading}
        >
          <i className="ri-send-plane-fill"></i>
        </button>
      </div>
    </div>
  );
};

export default AiAssistant;

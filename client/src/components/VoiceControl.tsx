import { useState, useEffect, useCallback, useRef } from 'react';
import { askAI } from '@/lib/aiService';
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Volume2 } from 'lucide-react';

// Declare speech recognition types since they're not in standard TypeScript lib
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: (event: any) => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// Add speech recognition to the window object
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface VoiceControlProps {
  isOpen?: boolean;
}

const VoiceControl = ({ isOpen = false }: VoiceControlProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(isOpen);
  const { toast } = useToast();
  
  const recognitionRef = useRef<any>(null);
  const synth = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize speech synthesis
      synth.current = new SpeechSynthesisUtterance();
      synth.current.rate = 1;
      synth.current.pitch = 1;
      synth.current.volume = 1;
      
      // Check if browser supports SpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcriptArray = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join(' ');
          
          setTranscript(transcriptArray);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast({
            title: "Voice Recognition Error",
            description: `Error: ${event.error}. Please try again.`,
            variant: "destructive"
          });
        };
      } else {
        toast({
          title: "Voice Mode Not Supported",
          description: "Your browser doesn't support voice recognition. Try using Chrome or Edge.",
          variant: "destructive"
        });
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [toast]);
  
  // Start/stop speech recognition
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Recognition Not Available",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // If we have a transcript, process it
      if (transcript) {
        processVoiceCommand(transcript);
      }
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, transcript, toast]);
  
  // Process the voice command
  const processVoiceCommand = async (text: string) => {
    try {
      setIsProcessing(true);
      
      // Process the command based on keywords
      let command = text.toLowerCase().trim();
      
      // Check for common commands
      if (command.includes('create project') || command.includes('new project')) {
        setResponse("I'll help you create a new project. What name would you like to give it?");
        // Open project creation dialog - could trigger this via context or props
      } 
      else if (command.includes('explain')) {
        const topic = command.replace(/explain/i, '').trim();
        const aiResponse = await askAI(`Please explain ${topic} briefly and in simple terms.`);
        setResponse(aiResponse);
      }
      else if (command.includes('generate code') || command.includes('write code')) {
        const prompt = command.replace(/(generate|write) code/i, '').trim();
        const aiResponse = await askAI(`Generate the following code: ${prompt}. Keep it simple and well-commented.`);
        setResponse(aiResponse);
      }
      else {
        // Default to asking the AI for a response
        const aiResponse = await askAI(command);
        setResponse(aiResponse);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      setResponse("Sorry, I couldn't process that command. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Speak the response
  const speakResponse = useCallback(() => {
    if (!response || !synth.current || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    synth.current.text = response;
    window.speechSynthesis.speak(synth.current);
  }, [response]);
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Clear the conversation
  const clearConversation = () => {
    setTranscript('');
    setResponse('');
  };
  
  return (
    <div 
      className={`fixed bottom-6 right-24 z-40 bg-white border-4 border-black brutal-shadow transition-all duration-300 ${
        isExpanded ? 'w-80 h-96' : 'w-16 h-16'
      }`}
    >
      {isExpanded ? (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center border-b-4 border-black p-3">
            <h3 className="font-bold">Voice Mode</h3>
            <button 
              className="bg-black text-white w-8 h-8 flex items-center justify-center"
              onClick={toggleExpanded}
            >
              &times;
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 text-sm">
            {transcript && (
              <div className="mb-4">
                <strong>You said:</strong>
                <p className="bg-gray-100 p-2 border-2 border-black mt-1">{transcript}</p>
              </div>
            )}
            
            {response && (
              <div>
                <div className="flex justify-between items-center">
                  <strong>Response:</strong>
                  <button 
                    onClick={speakResponse}
                    className="text-gray-700 hover:text-black"
                    title="Speak response"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
                <p className="bg-gray-100 p-2 border-2 border-black mt-1 whitespace-pre-wrap">{response}</p>
              </div>
            )}
            
            {isProcessing && (
              <div className="flex justify-center items-center my-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black"></div>
                <span className="ml-2">Processing...</span>
              </div>
            )}
          </div>
          
          <div className="border-t-4 border-black p-3 flex justify-between">
            <button
              onClick={clearConversation}
              className="px-4 py-2 border-2 border-black brutal-button bg-gray-100"
              disabled={isProcessing || (!transcript && !response)}
            >
              Clear
            </button>
            
            <button
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-black brutal-button ${
                isListening ? 'bg-red-500 text-white' : 'bg-accent text-white'
              }`}
              onClick={toggleListening}
              disabled={isProcessing}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
          </div>
        </div>
      ) : (
        <button
          className="w-full h-full flex items-center justify-center bg-accent text-white hover:bg-accent/90 active:bg-accent/80 transition-colors brutal-button"
          onClick={toggleExpanded}
          title="Voice Mode"
        >
          <Mic size={24} />
        </button>
      )}
    </div>
  );
};

export default VoiceControl;
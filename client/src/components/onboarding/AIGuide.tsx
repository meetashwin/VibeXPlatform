import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, HelpCircle, MessageSquare, Settings, Sparkles, Smile, Zap, Lightbulb, Bot, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/context/OnboardingContext';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Define different robot themes
const robotThemes = [
  {
    name: "Neobrutalist",
    backgroundColor: "#FF6B6B",
    borderColor: "#000000",
    accentColor: "#FFD166",
    icon: <Zap />,
    description: "Bold, colorful, and edgy"
  },
  {
    name: "Futuristic",
    backgroundColor: "#4CC9F0",
    borderColor: "#3A0CA3",
    accentColor: "#7209B7",
    icon: <Bot />,
    description: "Sleek, modern, and high-tech"
  },
  {
    name: "Playful",
    backgroundColor: "#06D6A0",
    borderColor: "#073B4C",
    accentColor: "#118AB2",
    icon: <Smile />,
    description: "Fun, bouncy, and energetic"
  },
  {
    name: "Magic",
    backgroundColor: "#9B5DE5",
    borderColor: "#251A58",
    accentColor: "#F15BB5",
    icon: <Sparkles />,
    description: "Mystical, enchanting, and magical"
  }
];

const AIGuide: React.FC = () => {
  const { 
    isAIGuideVisible, 
    toggleAIGuide, 
    AIGuideMessage, 
    setAIGuideMessage,
    AIGuideName,
    AIGuideAvatar,
    setAIGuideAvatar,
    AIGuidePersonality,
    setAIGuidePersonality,
    startTour,
    hasTourBeenSeen,
    resetTourHistory,
    currentTour,
    currentTourStepIndex,
    currentTourSteps
  } = useOnboarding();
  
  // Default to expanded on first load, but check if user has previously minimized it
  const [isMinimized, setIsMinimized] = useState(() => {
    const saved = localStorage.getItem('aiGuideMinimized');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [mood, setMood] = useState(100);
  const [showEmoji, setShowEmoji] = useState(false);
  const [bounceAvatar, setBounceAvatar] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Ensure the AI Guide is not minimized when the tour reaches the AI Guide step
  useEffect(() => {
    if (currentTour && currentTourSteps && currentTourSteps.length > 0) {
      // Check if the current step targets the AI guide bubble
      const currentStep = currentTourSteps[currentTourStepIndex];
      if (currentStep && currentStep.target === '.ai-guide-bubble') {
        // Force expansion of the AI guide
        setIsMinimized(false);
        localStorage.setItem('aiGuideMinimized', JSON.stringify(false));
      }
    }
  }, [currentTour, currentTourStepIndex, currentTourSteps]);
  
  // Type writer effect for the AI Guide messages
  // Effect for localStorage persistence of AIGuideVisible state
  useEffect(() => {
    localStorage.setItem('isAIGuideVisible', JSON.stringify(isAIGuideVisible));
  }, [isAIGuideVisible]);

  // Add effect for bouncing avatar when mood changes
  useEffect(() => {
    if (mood < 60) {
      setBounceAvatar(true);
      setTimeout(() => setBounceAvatar(false), 1000);
    }
  }, [mood]);

  // Random emoji effect
  useEffect(() => {
    const emojiTimer = setInterval(() => {
      if (Math.random() > 0.7 && !isMinimized) {
        setShowEmoji(true);
        setTimeout(() => setShowEmoji(false), 2000);
      }
    }, 5000);
    
    return () => clearInterval(emojiTimer);
  }, [isMinimized]);

  // Type writer effect for the AI Guide messages
  useEffect(() => {
    if (!AIGuideMessage) return;
    
    setIsTyping(true);
    setDisplayedMessage('');
    
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < AIGuideMessage.length) {
        setDisplayedMessage(prev => prev + AIGuideMessage.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 30); // Typing speed
    
    return () => clearInterval(typingInterval);
  }, [AIGuideMessage]);
  
  // If guide is not visible, don't render anything
  if (!isAIGuideVisible) return null;

  // Get current theme
  const currentTheme = robotThemes[selectedTheme];
  
  // Helper to get emoji based on mood
  const getMoodEmoji = () => {
    if (mood > 80) return "🤩";
    if (mood > 60) return "😊";
    if (mood > 40) return "😐";
    if (mood > 20) return "😞";
    return "😫";
  };
  
  return (
    <>
      <AnimatePresence mode="wait">
        {!isMinimized ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border-4 shadow-brutal"
            style={{ 
              borderColor: currentTheme.borderColor,
              backgroundColor: "white"
            }}
          >
            {/* Guide Header */}
            <div 
              className="flex items-center justify-between border-b-2 p-3"
              style={{ 
                borderColor: currentTheme.borderColor,
                backgroundColor: currentTheme.backgroundColor,
              }}
            >
              <div className="flex items-center">
                <motion.div 
                  className="h-12 w-12 overflow-hidden rounded-full border-2 bg-white relative"
                  style={{ borderColor: currentTheme.borderColor }}
                  animate={bounceAvatar ? { 
                    y: [0, -15, 0, -10, 0],
                    rotate: [0, -10, 10, -5, 0]
                  } : {}}
                  transition={{ duration: 1 }}
                >
                  <img
                    src={AIGuideAvatar || "/robot-avatar.svg"}
                    alt="AI Guide"
                    className="h-full w-full object-cover"
                  />
                  
                  {/* Mood emoji */}
                  <div className="absolute -right-1 -bottom-1 bg-white rounded-full w-6 h-6 flex items-center justify-center border border-black">
                    {getMoodEmoji()}
                  </div>
                  
                  {/* Random emoji that pops up */}
                  {showEmoji && (
                    <motion.div
                      initial={{ y: 0, opacity: 0 }}
                      animate={{ y: -20, opacity: 1 }}
                      exit={{ y: -40, opacity: 0 }}
                      className="absolute -top-8 left-0 text-2xl"
                    >
                      {["💡", "✨", "🎯", "🚀", "🎉", "💪"][Math.floor(Math.random() * 6)]}
                    </motion.div>
                  )}
                </motion.div>
                
                <div className="ml-3">
                  <span className="font-bold text-white text-base">{AIGuideName || "Vibe"}</span>
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-1"
                      style={{ backgroundColor: mood > 50 ? "#4ade80" : "#f87171" }}
                    ></div>
                    <span className="text-xs text-white opacity-90">
                      {mood > 80 ? "Excited" : 
                       mood > 60 ? "Happy" : 
                       mood > 40 ? "Neutral" : 
                       mood > 20 ? "Tired" : "Low Energy"}
                    </span>
                  </div>
                </div>
                
                {isTyping && (
                  <span className="ml-2 flex items-center">
                    <span className="typing-dot bg-white"></span>
                    <span className="typing-dot typing-dot-2 bg-white"></span>
                    <span className="typing-dot typing-dot-3 bg-white"></span>
                  </span>
                )}
              </div>
              
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-full border-2 p-0 text-white hover:bg-opacity-20 hover:bg-white"
                  style={{ borderColor: "white" }}
                  onClick={() => {
                    setMood(Math.min(100, mood + 20));
                    setAIGuideMessage("Thanks for the boost! I'm feeling more energetic now! 🚀");
                  }}
                >
                  <Zap className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-full border-2 p-0 text-white hover:bg-opacity-20 hover:bg-white"
                  style={{ borderColor: "white" }}
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-full border-2 p-0 text-white hover:bg-opacity-20 hover:bg-white"
                  style={{ borderColor: "white" }}
                  onClick={() => {
                    setIsMinimized(true);
                    localStorage.setItem('aiGuideMinimized', JSON.stringify(true));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-full border-2 p-0 text-white hover:bg-opacity-20 hover:bg-white ml-2 hover:bg-red-500"
                  style={{ borderColor: "white" }}
                  onClick={toggleAIGuide}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close AI Guide</span>
                </Button>
              </div>
            </div>
            
            {/* Guide Body */}
            <div 
              className="max-h-64 overflow-y-auto p-4"
              style={{ 
                backgroundColor: `${currentTheme.backgroundColor}20`
              }}
            >
              <motion.div 
                className="mb-2 rounded-lg rounded-tl-none border-2 bg-white p-3 text-sm"
                style={{ borderColor: currentTheme.borderColor }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                {displayedMessage}
              </motion.div>
            </div>
            
            {/* Guide Footer */}
            <div 
              className="flex items-center justify-between border-t-2 p-3 bg-white" 
              style={{ borderColor: currentTheme.borderColor }}
            >
              <div className="flex items-center space-x-2">
                {robotThemes.map((theme, idx) => (
                  <motion.button
                    key={idx}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${idx === selectedTheme ? 'ring-2 ring-black' : ''}`}
                    style={{ backgroundColor: theme.backgroundColor }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedTheme(idx);
                      setAIGuideMessage(`Switched to ${theme.name} theme! ${theme.description}!`);
                    }}
                  >
                    {theme.icon}
                  </motion.button>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className={`border-2 rounded-full text-xs font-medium transition-colors hover:text-white ai-guide-button ${
                    robotThemes[selectedTheme].name === "Neobrutalist" ? "ai-guide-theme-neobrutalist" : 
                    robotThemes[selectedTheme].name === "Futuristic" ? "ai-guide-theme-futuristic" :
                    robotThemes[selectedTheme].name === "Playful" ? "ai-guide-theme-playful" :
                    "ai-guide-theme-magic"
                  }`}
                  style={{ 
                    borderColor: currentTheme.borderColor,
                    backgroundColor: "white"
                  }}
                  onClick={() => startTour('main')}
                >
                  <HelpCircle className="mr-1 h-3 w-3" /> Tour
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-2 rounded-full text-xs font-medium transition-colors hover:text-white ai-guide-button"
                  style={{ 
                    borderColor: currentTheme.borderColor,
                    backgroundColor: "white"
                  }}
                  onClick={() => {
                    setAIGuideMessage("How can I help you today? If you'd like a tour of specific features, just ask!");
                  }}
                >
                  <MessageSquare className="mr-1 h-3 w-3" /> Chat
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="minimized"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -10, 0],
              transition: {
                y: {
                  repeat: 3,
                  duration: 1, 
                  ease: "easeInOut"
                }
              }
            }}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-4 right-4 z-50 cursor-pointer group ai-guide-bubble"
            onClick={() => {
              setIsMinimized(false);
              localStorage.setItem('aiGuideMinimized', JSON.stringify(false));
            }}
            ref={bubbleRef}
          >
            <div 
              className="h-16 w-16 overflow-hidden rounded-full border-4 shadow-brutal group-hover:shadow-[6px_6px_0px_0px_#000000] transition-all relative"
              style={{ 
                borderColor: currentTheme.borderColor,
                backgroundColor: currentTheme.backgroundColor 
              }}
            >
              <img
                src={AIGuideAvatar || "/robot-avatar.svg"}
                alt="AI Guide"
                className="h-full w-full object-cover"
              />
              
              {/* Mood emoji on the minimized button too */}
              <div className="absolute -right-1 -bottom-1 bg-white rounded-full w-6 h-6 flex items-center justify-center border border-black">
                {getMoodEmoji()}
              </div>
            </div>
            
            {/* Theme-colored halo */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-20"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              style={{ backgroundColor: currentTheme.accentColor }}
            />
            
            {/* Floating tooltip above the icon */}
            <div className="absolute -top-12 right-0 bg-black text-white px-3 py-1 rounded-full text-sm font-medium border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex items-center gap-1">
                {currentTheme.icon}
                <span>{AIGuideName || "AI Guide"}</span>
              </div>
            </div>
            
            {/* Quick action buttons that appear on hover */}
            <div className="absolute -left-42 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
              <motion.button
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 shadow-brutal"
                style={{ borderColor: currentTheme.borderColor }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  startTour('main');
                  setIsMinimized(false);
                  localStorage.setItem('aiGuideMinimized', JSON.stringify(false));
                }}
              >
                <HelpCircle className="h-5 w-5" />
              </motion.button>
              
              <motion.button
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 shadow-brutal"
                style={{ borderColor: currentTheme.borderColor }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setMood(Math.min(100, mood + 20));
                  setBounceAvatar(true);
                  setTimeout(() => setBounceAvatar(false), 1000);
                }}
              >
                <Zap className="h-5 w-5" />
              </motion.button>
              
              <motion.button
                className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 border-2 shadow-brutal"
                style={{ borderColor: "#ef4444" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAIGuide();
                }}
              >
                <X className="h-5 w-5 text-red-500" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent 
          className="border-l-4 p-0 overflow-hidden"
          style={{ borderColor: currentTheme.borderColor }}
        >
          {/* Header with theme color */}
          <div 
            className="p-6 relative"
            style={{ backgroundColor: currentTheme.backgroundColor }}
          >
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute right-4 top-4 rounded-full w-8 h-8 bg-white flex items-center justify-center border-2 border-black hover:scale-110 transition-transform"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
            
            <div className="flex items-center gap-4">
              <motion.div 
                className="h-16 w-16 overflow-hidden rounded-full border-2 bg-white relative shadow-brutal"
                style={{ borderColor: currentTheme.borderColor }}
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                <img
                  src={AIGuideAvatar || "/robot-avatar.svg"}
                  alt="AI Guide"
                  className="h-full w-full object-cover"
                />
                <div className="absolute -right-1 -bottom-1 bg-white rounded-full w-6 h-6 flex items-center justify-center border border-black">
                  {getMoodEmoji()}
                </div>
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">{AIGuideName || "AI Guide"} Settings</h2>
                <p className="text-white opacity-90">Customize your AI companion</p>
              </div>
            </div>
          </div>
          
          <div className="px-6 pt-6 pb-16 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Robot Mood Section */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
              <Label className="text-base font-semibold">Robot Mood</Label>
              <div className="flex items-center gap-2">
                <span>😫</span>
                <Slider 
                  value={[mood]} 
                  onValueChange={(vals) => {
                    setMood(vals[0]);
                    if (vals[0] > 80) {
                      setAIGuideMessage("Woohoo! I'm super excited to help you today! Let's build something amazing! 🚀");
                    } else if (vals[0] < 30) {
                      setAIGuideMessage("Ugh... I'm feeling a bit low on energy. Maybe a recharge would help? 🔋");
                    }
                  }}
                  max={100}
                  step={10}
                  className="flex-1"
                />
                <span>🤩</span>
              </div>
              <div className="flex justify-center">
                <Badge 
                  className="mt-1"
                  style={{ 
                    backgroundColor: mood > 50 ? "#4ade80" : "#f87171",
                    color: "white" 
                  }}
                >
                  {mood > 80 ? "Excited" : 
                   mood > 60 ? "Happy" : 
                   mood > 40 ? "Neutral" : 
                   mood > 20 ? "Tired" : "Low Energy"}
                </Badge>
              </div>
            </div>
            
            {/* Theme Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Theme</Label>
              <div className="flex flex-wrap gap-2">
                {robotThemes.map((theme, idx) => (
                  <motion.button
                    key={idx}
                    className={`flex flex-col items-center p-2 rounded-lg border-2 brutal-button ${
                      idx === selectedTheme ? 'ring-2 ring-black shadow-[4px_4px_0px_0px_#000000]' : ''
                    } ${
                      theme.name === "Neobrutalist" ? "hover:bg-red-100" : 
                      theme.name === "Futuristic" ? "hover:bg-blue-100" :
                      theme.name === "Playful" ? "hover:bg-green-100" :
                      "hover:bg-purple-100"
                    }`}
                    style={{ 
                      borderColor: theme.borderColor,
                      backgroundColor: idx === selectedTheme ? `${theme.backgroundColor}50` : `${theme.backgroundColor}20`
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedTheme(idx);
                      setAIGuideMessage(`Switched to ${theme.name} theme! ${theme.description}!`);
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
                      style={{ backgroundColor: theme.backgroundColor }}
                    >
                      {theme.icon}
                    </div>
                    <span className="text-xs font-medium">{theme.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Robot Name */}
            <div className="space-y-2">
              <Label htmlFor="guide-name" className="text-base font-semibold">Guide Name</Label>
              <Input
                id="guide-name"
                value={AIGuideName}
                onChange={(e) => {
                  setAIGuideMessage(`I'm now known as ${e.target.value}! Nice to meet you!`);
                }}
                className="border-2 border-black"
              />
            </div>
            
            {/* Avatar Selection */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Avatar Style</Label>
              <div className="grid grid-cols-4 gap-2">
                {["/robot-avatar.svg", "/robot-avatar-2.svg", "/robot-avatar-3.svg", "/robot-avatar-4.svg"].map((avatar, index) => (
                  <motion.div 
                    key={index}
                    className={`cursor-pointer rounded-lg border-2 p-1 brutal-button ${
                      AIGuideAvatar === avatar 
                        ? 'border-black bg-white shadow-[3px_3px_0px_0px_#000000]' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setAIGuideAvatar(avatar);
                      // Play a fun sound effect when avatar is changed
                      setAIGuideMessage("Looking good! I'm ready for my close-up! 📸");
                    }}
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-black mx-auto">
                      <img
                        src={avatar}
                        alt={`Avatar ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Personality Selection */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Personality</Label>
              <RadioGroup 
                value={AIGuidePersonality} 
                onValueChange={(val: 'friendly' | 'technical' | 'funny' | 'sassy') => {
                  setAIGuidePersonality(val);
                  // Select a random greeting from the new personality
                  const personalities = {
                    friendly: ["Hi there! I'm your friendly guide now!", "Hello friend! I'm here to help you out!"],
                    technical: ["Switching to technical mode. Preparing system diagnostics.", "Technical support initialized. Ready to assist with optimal workflows."],
                    funny: ["Well hello there! I hope you brought snacks, because I'm starving for data!", "It's joke time! What do you call a robot with good manners? A proper-gram!"],
                    sassy: ["Oh great, you want me to be sassy now? Fine, whatever.", "New personality mode: I'm judging everything you do. Looking good so far... I guess."]
                  };
                  const greetings = personalities[val];
                  setAIGuideMessage(greetings[Math.floor(Math.random() * greetings.length)]);
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <motion.div 
                    className={`flex flex-col items-center space-y-2 rounded-lg p-3 cursor-pointer ${
                      AIGuidePersonality === 'friendly' 
                        ? 'personality-button-friendly active' 
                        : 'personality-button-friendly'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                      backgroundColor: AIGuidePersonality === 'friendly' ? '#F0F9FF' : 'white',
                    }}
                    onClick={() => {
                      const val: 'friendly' | 'technical' | 'funny' | 'sassy' = 'friendly';
                      setAIGuidePersonality(val);
                      setAIGuideMessage("Hi there! I'm your friendly guide now!");
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-300">
                      <Smile className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="text-center">
                      <RadioGroupItem value="friendly" id="friendly" className="sr-only" />
                      <Label htmlFor="friendly" className="cursor-pointer font-medium">Friendly</Label>
                      <p className="text-xs text-gray-500">Helpful & supportive</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className={`flex flex-col items-center space-y-2 rounded-lg p-3 cursor-pointer ${
                      AIGuidePersonality === 'technical' 
                        ? 'personality-button-technical active' 
                        : 'personality-button-technical'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                      backgroundColor: AIGuidePersonality === 'technical' ? '#F0FFF4' : 'white',
                    }}
                    onClick={() => {
                      const val: 'friendly' | 'technical' | 'funny' | 'sassy' = 'technical';
                      setAIGuidePersonality(val);
                      setAIGuideMessage("Switching to technical mode. Preparing system diagnostics.");
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-300">
                      <Bot className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="text-center">
                      <RadioGroupItem value="technical" id="technical" className="sr-only" />
                      <Label htmlFor="technical" className="cursor-pointer font-medium">Technical</Label>
                      <p className="text-xs text-gray-500">Precise & detailed</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className={`flex flex-col items-center space-y-2 rounded-lg p-3 cursor-pointer ${
                      AIGuidePersonality === 'funny' 
                        ? 'personality-button-funny active' 
                        : 'personality-button-funny'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                      backgroundColor: AIGuidePersonality === 'funny' ? '#FFF0F9' : 'white',
                    }}
                    onClick={() => {
                      const val: 'friendly' | 'technical' | 'funny' | 'sassy' = 'funny';
                      setAIGuidePersonality(val);
                      setAIGuideMessage("Well hello there! I hope you brought snacks, because I'm starving for data!");
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center border-2 border-amber-300">
                      <span className="text-2xl">🎭</span>
                    </div>
                    <div className="text-center">
                      <RadioGroupItem value="funny" id="funny" className="sr-only" />
                      <Label htmlFor="funny" className="cursor-pointer font-medium">Funny</Label>
                      <p className="text-xs text-gray-500">Humorous & playful</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className={`flex flex-col items-center space-y-2 rounded-lg p-3 cursor-pointer ${
                      AIGuidePersonality === 'sassy' 
                        ? 'personality-button-sassy active' 
                        : 'personality-button-sassy'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                      backgroundColor: AIGuidePersonality === 'sassy' ? '#FFF1F0' : 'white',
                    }}
                    onClick={() => {
                      const val: 'friendly' | 'technical' | 'funny' | 'sassy' = 'sassy';
                      setAIGuidePersonality(val);
                      setAIGuideMessage("Oh great, you want me to be sassy now? Fine, whatever.");
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center border-2 border-red-300">
                      <span className="text-2xl">💅</span>
                    </div>
                    <div className="text-center">
                      <RadioGroupItem value="sassy" id="sassy" className="sr-only" />
                      <Label htmlFor="sassy" className="cursor-pointer font-medium">Sassy</Label>
                      <p className="text-xs text-gray-500">Witty & cheeky</p>
                    </div>
                  </motion.div>
                </div>
              </RadioGroup>
            </div>
            
            {/* Visibility & Tour Settings */}
            <div className="space-y-4 border-t-2 border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="visible-toggle" className="text-base font-semibold">Show AI Guide</Label>
                  <p className="text-xs text-gray-500">Toggle the AI guide visibility</p>
                </div>
                <Switch 
                  id="visible-toggle" 
                  checked={isAIGuideVisible}
                  onCheckedChange={toggleAIGuide}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">Tour Options</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className={`border-2 border-black flex items-center justify-center gap-2 h-auto py-3 brutal-button shadow-[3px_3px_0px_0px_#000000] ${
                      robotThemes[selectedTheme].name === "Neobrutalist" 
                        ? "hover:bg-red-50" 
                        : robotThemes[selectedTheme].name === "Futuristic" 
                          ? "hover:bg-blue-50" 
                          : robotThemes[selectedTheme].name === "Playful" 
                            ? "hover:bg-green-50" 
                            : "hover:bg-purple-50"
                    }`}
                    onClick={() => startTour('main')}
                  >
                    <HelpCircle className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Start Tour</div>
                      <div className="text-xs opacity-70">Explore features</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className={`border-2 border-black flex items-center justify-center gap-2 h-auto py-3 brutal-button shadow-[3px_3px_0px_0px_#000000] ${
                      robotThemes[selectedTheme].name === "Neobrutalist" 
                        ? "hover:bg-red-50" 
                        : robotThemes[selectedTheme].name === "Futuristic" 
                          ? "hover:bg-blue-50" 
                          : robotThemes[selectedTheme].name === "Playful" 
                            ? "hover:bg-green-50" 
                            : "hover:bg-purple-50"
                    }`}
                    onClick={() => {
                      resetTourHistory();
                      setAIGuideMessage("I've reset all your tour progress. Everything will be new again!");
                    }}
                  >
                    <Zap className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Reset Tours</div>
                      <div className="text-xs opacity-70">Start fresh</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer with fun animation */}
          <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-center">
            <motion.div
              className="absolute inset-x-0 h-12 bg-gradient-to-r"
              style={{ 
                backgroundImage: `linear-gradient(to right, ${currentTheme.backgroundColor}80, ${currentTheme.accentColor}80)` 
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
            <div className="relative z-10 flex gap-2 text-white">
              <Star className="h-5 w-5" />
              <span className="text-sm font-medium">Powered by AI</span>
              <Star className="h-5 w-5" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AIGuide;
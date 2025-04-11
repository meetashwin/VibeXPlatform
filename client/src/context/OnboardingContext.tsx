import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

// Define the tour step interface
export interface TourStep {
  target: string; // CSS selector for the target element
  content: string; // Content to show in the tooltip
  title: string; // Title of the tooltip
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'; // Tooltip placement
  spotlightPadding?: number; // Padding around the spotlight
  disableOverlay?: boolean; // Disable the overlay
  disableBeacon?: boolean; // Disable the beacon
  showSkipButton?: boolean; // Show skip button
  nextButtonText?: string; // Custom next button text
  prevButtonText?: string; // Custom previous button text
  route?: string; // Route to navigate to for this step
  condition?: () => boolean; // Optional condition to show this step
}

// Define tour types
export type TourName = 'main' | 'agent-workflow' | 'immersive-workflow' | 'project-creation' | 'settings';

// Define context interface
interface OnboardingContextType {
  isTourOpen: boolean;
  startTour: (tourName?: TourName) => void;
  closeTour: () => void;
  currentTourStepIndex: number;
  goToStep: (stepIndex: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  hasTourBeenSeen: (tourName: TourName) => boolean;
  markTourAsSeen: (tourName: TourName) => void;
  resetTourHistory: () => void;
  currentTour: TourName | null;
  currentTourSteps: TourStep[];
  registerTour: (tourName: TourName, steps: TourStep[]) => void;
  isAIGuideVisible: boolean;
  toggleAIGuide: () => void;
  AIGuideMessage: string;
  setAIGuideMessage: (message: string) => void;
  AIGuideName: string;
  AIGuideAvatar: string;
  setAIGuideAvatar: (avatar: string) => void;
  AIGuidePersonality: 'friendly' | 'technical' | 'funny' | 'sassy';
  setAIGuidePersonality: (personality: 'friendly' | 'technical' | 'funny' | 'sassy') => void;
}

// Create context with default values
const OnboardingContext = createContext<OnboardingContextType>({
  isTourOpen: false,
  startTour: () => {},
  closeTour: () => {},
  currentTourStepIndex: 0,
  goToStep: () => {},
  nextStep: () => {},
  prevStep: () => {},
  hasTourBeenSeen: () => false,
  markTourAsSeen: () => {},
  resetTourHistory: () => {},
  currentTour: null,
  currentTourSteps: [],
  registerTour: () => {},
  isAIGuideVisible: true,
  toggleAIGuide: () => {},
  AIGuideMessage: '',
  setAIGuideMessage: () => {},
  AIGuideName: 'Vibe',
  AIGuideAvatar: '/robot-avatar.svg',
  setAIGuideAvatar: () => {},
  AIGuidePersonality: 'friendly',
  setAIGuidePersonality: () => {},
});

// Main tour steps
const mainTourSteps: TourStep[] = [
  {
    target: 'body',
    title: 'Welcome to VibeX!',
    content: 'Welcome to VibeX, your AI-powered development platform. Let\'s take a quick tour to get you started.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '#dashboard-title',
    title: 'Dashboard',
    content: 'This is your main dashboard where you can see an overview of your projects, activities, and AI interactions.',
    placement: 'bottom',
  },
  {
    target: '#ai-prompt-form',
    title: 'AI Prompt',
    content: 'Ask the AI what you want to build here. Our AI assistant will help you create your software.',
    placement: 'bottom',
  },
  {
    target: '.ai-guide-bubble', // This will be handled by the TourGuide component's special handling
    title: 'AI Guide',
    content: 'Your personal AI guide is located in the bottom right corner and has been moved away from the voice button. Click on it anytime for assistance.',
    placement: 'left',
    disableBeacon: true,
  },
  {
    target: 'body',
    title: 'Tour Complete!',
    content: 'You\'ve completed the main tour! Explore the platform and don\'t hesitate to ask the AI guide if you need help.',
    placement: 'center',
    disableBeacon: true,
  },
];

// Agent workflow tour steps
const agentWorkflowTourSteps: TourStep[] = [
  {
    target: 'body',
    title: 'Agent Workflow Builder',
    content: 'This is where you can create and manage your agent workflows. Let\'s learn how to use it.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.add-agent-btn',
    title: 'Add Agent',
    content: 'Click here to add a new agent to your workflow.',
    placement: 'bottom',
  },
  {
    target: '.agent-toolbar',
    title: 'Agent Types',
    content: 'Select from different agent types: Business Analyst, Developer, QA Engineer, DevOps, and more.',
    placement: 'bottom',
  },
  {
    target: '.canvas-controls',
    title: 'Canvas Controls',
    content: 'Use these controls to zoom, pan, and navigate the workflow canvas.',
    placement: 'left',
  },
  {
    target: '.save-workflow-btn',
    title: 'Save Workflow',
    content: 'Don\'t forget to save your workflow when you\'re done.',
    placement: 'bottom',
  },
  {
    target: '.execute-workflow-btn',
    title: 'Execute Workflow',
    content: 'Run your workflow and watch the agents work together.',
    placement: 'bottom',
  },
  {
    target: 'body',
    title: 'Connect Agents',
    content: 'Drag from an agent\'s output handle to another agent\'s input handle to create connections between them.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: 'body',
    title: 'Tour Complete!',
    content: 'You\'ve completed the Agent Workflow tour! Start creating your own agent workflows now.',
    placement: 'center',
    disableBeacon: true,
  },
];

// Immersive workflow tour steps
const immersiveWorkflowTourSteps: TourStep[] = [
  {
    target: 'body',
    title: '3D Immersive Workflow',
    content: 'Welcome to the 3D immersive view of your agent workflows. Let\'s explore this immersive environment.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.camera-controls',
    title: 'Camera Controls',
    content: 'Use these controls to rotate, zoom, and pan around the 3D environment.',
    placement: 'bottom',
  },
  {
    target: '.add-agent-3d-btn',
    title: 'Add 3D Agent',
    content: 'Click here to add a new agent to your 3D workflow.',
    placement: 'bottom',
  },
  {
    target: '.robot-agent',
    title: 'Robot Agents',
    content: 'These robot-like visualizations represent your agents. You can see them interact in real-time during workflow execution.',
    placement: 'right',
  },
  {
    target: '.save-workflow-3d-btn',
    title: 'Save 3D Workflow',
    content: 'Save your 3D workflow design before leaving the page.',
    placement: 'bottom',
  },
  {
    target: '.execute-workflow-3d-btn',
    title: 'Execute 3D Workflow',
    content: 'Watch your robot agents come to life and perform their tasks in this immersive 3D environment.',
    placement: 'bottom',
  },
  {
    target: 'body',
    title: 'Tour Complete!',
    content: 'You\'ve completed the 3D Immersive Workflow tour! Enjoy creating and visualizing your agent workflows in 3D.',
    placement: 'center',
    disableBeacon: true,
  },
];

// Create the provider
export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentTourStepIndex, setCurrentTourStepIndex] = useState(0);
  const [currentTour, setCurrentTour] = useState<TourName | null>(null);
  const [seenTours, setSeenTours] = useState<Record<TourName, boolean>>(() => {
    const saved = localStorage.getItem('seenTours');
    return saved ? JSON.parse(saved) : {
      main: false,
      'agent-workflow': false,
      'immersive-workflow': false,
      'project-creation': false,
      'settings': false,
    };
  });
  
  // AI Guide is visible by default for all users
  const [isAIGuideVisible, setIsAIGuideVisible] = useState(() => {
    const saved = localStorage.getItem('isAIGuideVisible');
    // Default to true if not explicitly set to false
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [AIGuideMessage, setAIGuideMessage] = useState('Welcome to VibeX! I\'m your AI guide. How can I help you today?');
  const [AIGuideName, setAIGuideName] = useState(() => {
    const saved = localStorage.getItem('AIGuideName');
    return saved || 'Vibe';
  });
  
  const [AIGuideAvatar, setAIGuideAvatar] = useState(() => {
    const saved = localStorage.getItem('AIGuideAvatar');
    return saved || '/robot-avatar.svg';
  });
  
  const [AIGuidePersonality, setAIGuidePersonality] = useState<'friendly' | 'technical' | 'funny' | 'sassy'>(() => {
    const saved = localStorage.getItem('AIGuidePersonality');
    return (saved as 'friendly' | 'technical' | 'funny' | 'sassy') || 'friendly';
  });
  
  // Tour registrations
  const [registeredTours, setRegisteredTours] = useState<Record<string, TourStep[]>>({
    main: mainTourSteps,
    'agent-workflow': agentWorkflowTourSteps,
    'immersive-workflow': immersiveWorkflowTourSteps,
  });

  // Register a new tour
  const registerTour = (tourName: TourName, steps: TourStep[]) => {
    setRegisteredTours((prev: Record<string, TourStep[]>) => ({
      ...prev,
      [tourName]: steps,
    }));
  };

  // Get the current tour steps
  const currentTourSteps = currentTour ? registeredTours[currentTour] || [] : [];

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('seenTours', JSON.stringify(seenTours));
  }, [seenTours]);
  
  useEffect(() => {
    localStorage.setItem('isAIGuideVisible', JSON.stringify(isAIGuideVisible));
  }, [isAIGuideVisible]);
  
  useEffect(() => {
    localStorage.setItem('AIGuideName', AIGuideName);
  }, [AIGuideName]);
  
  useEffect(() => {
    localStorage.setItem('AIGuideAvatar', AIGuideAvatar);
  }, [AIGuideAvatar]);
  
  useEffect(() => {
    localStorage.setItem('AIGuidePersonality', AIGuidePersonality);
  }, [AIGuidePersonality]);

  // Start a tour
  const startTour = (tourName: TourName = 'main') => {
    // First, navigate to the appropriate route if needed
    const firstStep = registeredTours[tourName]?.[0];
    if (firstStep?.route && location !== firstStep.route) {
      setLocation(firstStep.route);
    }

    setCurrentTour(tourName);
    setCurrentTourStepIndex(0);
    setIsTourOpen(true);
  };

  // Close the tour
  const closeTour = () => {
    if (currentTour) {
      markTourAsSeen(currentTour);
    }
    setIsTourOpen(false);
    setCurrentTour(null);
  };

  // Go to a specific step
  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < currentTourSteps.length) {
      // Check if we need to navigate to a different route
      const step = currentTourSteps[stepIndex];
      if (step.route && location !== step.route) {
        setLocation(step.route);
      }
      
      setCurrentTourStepIndex(stepIndex);
    }
  };

  // Go to the next step
  const nextStep = () => {
    const nextIndex = currentTourStepIndex + 1;
    if (nextIndex < currentTourSteps.length) {
      goToStep(nextIndex);
    } else {
      closeTour();
    }
  };

  // Go to the previous step
  const prevStep = () => {
    const prevIndex = currentTourStepIndex - 1;
    if (prevIndex >= 0) {
      goToStep(prevIndex);
    }
  };

  // Check if a tour has been seen
  const hasTourBeenSeen = (tourName: TourName): boolean => {
    return seenTours[tourName] || false;
  };

  // Mark a tour as seen
  const markTourAsSeen = (tourName: TourName) => {
    setSeenTours((prev: Record<TourName, boolean>) => ({
      ...prev,
      [tourName]: true,
    }));
  };

  // Reset all tour history
  const resetTourHistory = () => {
    setSeenTours({
      main: false,
      'agent-workflow': false,
      'immersive-workflow': false,
      'project-creation': false,
      'settings': false,
    });
  };

  // Toggle AI guide visibility
  const toggleAIGuide = () => {
    setIsAIGuideVisible((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('isAIGuideVisible', JSON.stringify(newValue));
      return newValue;
    });
  };

  // Context value
  const contextValue: OnboardingContextType = {
    isTourOpen,
    startTour,
    closeTour,
    currentTourStepIndex,
    goToStep,
    nextStep,
    prevStep,
    hasTourBeenSeen,
    markTourAsSeen,
    resetTourHistory,
    currentTour,
    currentTourSteps,
    registerTour,
    isAIGuideVisible,
    toggleAIGuide,
    AIGuideMessage,
    setAIGuideMessage,
    AIGuideName,
    AIGuideAvatar,
    setAIGuideAvatar,
    AIGuidePersonality,
    setAIGuidePersonality,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook to use the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
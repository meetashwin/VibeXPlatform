import React, { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useOnboarding } from '@/context/OnboardingContext';

const TourGuide: React.FC = () => {
  // Use internal state for Joyride to manage its own step index
  const [stepIndex, setStepIndex] = useState(0);
  
  const {
    isTourOpen,
    closeTour,
    currentTourStepIndex,
    goToStep,
    nextStep,
    prevStep,
    currentTourSteps,
    setAIGuideMessage,
    currentTour,
    markTourAsSeen
  } = useOnboarding();

  // Sync our step index with the context when it changes externally
  useEffect(() => {
    setStepIndex(currentTourStepIndex);
  }, [currentTourStepIndex]);

  // Ensure the AI Guide is visible and expanded before the tour step
  useEffect(() => {
    if (currentTourSteps[currentTourStepIndex]?.target === '.ai-guide-bubble') {
      // Find the AI guide bubble element and click it if it's minimized
      const aiGuideBubble = document.querySelector('.ai-guide-bubble');
      if (aiGuideBubble && aiGuideBubble instanceof HTMLElement) {
        // Simulate click to expand it
        aiGuideBubble.click();
      }
    }
  }, [currentTourStepIndex, currentTourSteps]);

  // Convert our tour steps to Joyride steps
  const steps: Step[] = currentTourSteps.map(step => {
    // Special handling for AI guide bubble and elements that might not exist
    let targetElement: string = typeof step.target === 'string' ? step.target : 'body';
    
    // For body or center placement, always use body to avoid selector errors
    if (step.placement === 'center') {
      targetElement = 'body';
    }
    
    // Check if the element exists in the DOM
    if (targetElement !== 'body' && !document.querySelector(targetElement)) {
      console.log(`Warning: Target element "${targetElement}" not found, falling back to body`);
      targetElement = 'body';
    }
    
    // Create a clean content element without any references to the original step
    // to avoid cyclic structures
    const contentElement = React.createElement(
      'div', 
      { key: `content-${step.title}` }, 
      step.content
    );
    
    // Create a clean step object without any references that could cause cycles
    return {
      target: targetElement,
      content: contentElement,
      title: step.title,
      placement: step.placement || 'center',
      disableBeacon: step.disableBeacon !== false,
      spotlightPadding: step.spotlightPadding || 10,
      disableOverlay: step.disableOverlay || false,
      showSkipButton: step.showSkipButton !== false,
    };
  });

  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    // Destructure only what we need to avoid cyclic structures
    const { action, index, status, type } = data;
    
    // Log only the necessary primitive values to avoid cyclic structure serialization
    console.log('Joyride callback:', { 
      action: action || 'none', 
      index: typeof index === 'number' ? index : -1, 
      status: status || 'unknown', 
      type: type || 'unknown'
    });
    
    // Special handling for error:target_not_found
    if (type === 'error:target_not_found') {
      console.log('Target not found error:', index);
      
      // For any step that has target not found error
      if (index >= 0 && index < currentTourSteps.length) {
        // Skip to the next step
        const nextIndex = index + 1;
        if (nextIndex < currentTourSteps.length) {
          console.log(`Target not found for step ${index}, skipping to step ${nextIndex}`);
          goToStep(nextIndex);
          setStepIndex(nextIndex);
        } else {
          // If this is the last step, just close the tour
          console.log('Target not found on final step, closing tour');
          if (currentTour) {
            markTourAsSeen(currentTour);
          }
          closeTour();
        }
      } else {
        // Invalid index, just close the tour
        console.log('Invalid step index with target not found error, closing tour');
        closeTour();
      }
      return;
    }
    
    // Handle different actions in the tour
    if (type === 'step:after') {
      // When a step is completed
      if (action === 'next') {
        // Update our context state to match
        const nextIndex = index + 1;
        goToStep(nextIndex);
        setStepIndex(nextIndex);
        console.log('Moving to next step', nextIndex);
      } else if (action === 'prev') {
        // Update our context state to match
        const prevIndex = index - 1;
        goToStep(prevIndex);
        setStepIndex(prevIndex);
        console.log('Moving to previous step', prevIndex);
      }
    } else if (action === 'close' || action === 'skip' || status === 'finished') {
      // When tour is closed or skipped
      if (currentTour) {
        markTourAsSeen(currentTour);
      }
      closeTour();
      console.log('Closing tour');
    }

    // Update AI guide with contextual messages based on tour progress
    if ((type === 'step:after' || type === 'step:before') && currentTour) {
      // Based on tour progress, update AI guide message
      if (index === 0) {
        setAIGuideMessage("That's a great start! Let me know if you have any questions.");
      } else if (index === Math.floor(steps.length / 2)) {
        setAIGuideMessage("You're making great progress! Keep going!");
      } else if (index === steps.length - 2) {
        setAIGuideMessage("Almost there! Just one more step to go.");
      }
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      // Log that the tour was completed successfully
      console.log(`Tour ${currentTour || 'unknown'} completed successfully`);
      
      // Tour is complete - set appropriate message based on the tour
      if (currentTour === 'main') {
        setAIGuideMessage("Congratulations! You've completed the main tour. Feel free to explore the platform now or ask me if you need anything!");
      } else if (currentTour === 'agent-workflow') {
        setAIGuideMessage("Great job! You now know the basics of the Agent Workflow Builder. Try creating your first workflow!");
      } else if (currentTour === 'immersive-workflow') {
        setAIGuideMessage("Awesome! You're now familiar with the 3D Immersive Workflow. It's a fun way to visualize your agents' interactions!");
      } else {
        // Generic completion message for other tours
        setAIGuideMessage("Tour completed! If you have any questions, feel free to ask.");
      }
      
      // Make sure to mark the tour as seen before closing
      if (currentTour) {
        markTourAsSeen(currentTour);
      }
      
      // Use setTimeout to ensure the message is set before closing the tour
      setTimeout(() => {
        closeTour();
      }, 100);
    }
  };

  // Custom styles to match our Neobrutalist design system
  const styles = {
    options: {
      arrowColor: '#000000',
      backgroundColor: '#FFFFFF',
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      primaryColor: '#3B82F6',
      spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
      textColor: '#333333',
      zIndex: 10000,
    },
    tooltip: {
      borderRadius: '0.5rem',
      border: '3px solid #000000',
      boxShadow: '5px 5px 0px #000000',
    },
    tooltipContainer: {
      textAlign: 'left' as const,
    },
    tooltipTitle: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      margin: '0 0 0.5rem',
      padding: '0.5rem',
      borderBottom: '2px solid #000000',
      backgroundColor: '#3B82F6',
      color: '#FFFFFF',
    },
    tooltipContent: {
      padding: '1rem',
      fontSize: '0.9rem',
    },
    buttonNext: {
      backgroundColor: '#000000',
      borderRadius: '0.25rem',
      color: '#FFFFFF',
      fontSize: '0.8rem',
      padding: '0.5rem 1rem',
      border: '2px solid #000000',
      marginRight: '0.5rem',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    buttonBack: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.25rem',
      color: '#000000',
      fontSize: '0.8rem',
      padding: '0.5rem 1rem',
      border: '2px solid #000000',
      marginRight: '0.5rem',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    buttonSkip: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.25rem',
      color: '#666666',
      fontSize: '0.8rem',
      padding: '0.5rem 1rem',
      border: '2px solid #666666',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    buttonClose: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.25rem',
      color: '#666666',
      fontSize: '0.8rem',
      padding: '0.5rem 1rem',
      border: '2px solid #666666',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
  };

  // Log the current step index whenever it changes
  useEffect(() => {
    console.log('Current tour step index:', stepIndex);
    console.log('Current tour:', currentTour);
    
    // Prevent cyclic structures in logging by only logging primitive properties
    const safeStepTargets = currentTourSteps.map(step => {
      if (typeof step.target === 'string') {
        return step.target;
      }
      return 'non-string-target';
    });
    console.log('Tour steps:', safeStepTargets);
  }, [stepIndex, currentTour, currentTourSteps]);
  
  if (!isTourOpen || steps.length === 0) {
    return null;
  }

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous={true}
      hideCloseButton={false}
      run={isTourOpen}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      steps={steps}
      stepIndex={stepIndex} // Use our local state instead of the context
      styles={styles}
      disableScrolling={false}
      floaterProps={{
        disableAnimation: false,
      }}
      disableCloseOnEsc={false}
      disableOverlayClose={false}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip',
      }}
      debug={false} // Disable debug mode to prevent potential circular reference issues
    />
  );
};

export default TourGuide;
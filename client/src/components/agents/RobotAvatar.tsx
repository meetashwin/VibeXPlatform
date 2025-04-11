import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AgentType } from '@/pages/AgentWorkflow';

interface RobotAvatarProps {
  type: AgentType;
  isActive?: boolean;
  isProcessing?: boolean;
  isError?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const RobotAvatar: React.FC<RobotAvatarProps> = ({
  type,
  isActive = false,
  isProcessing = false,
  isError = false,
  size = 'md',
}) => {
  const [blinking, setBlinking] = useState(false);
  const [armWaving, setArmWaving] = useState(false);

  // Randomly trigger blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, Math.random() * 3000 + 2000); // Random interval between 2-5 seconds
    
    return () => clearInterval(blinkInterval);
  }, []);

  // Trigger arm wave when active or processing
  useEffect(() => {
    // Short waves when processing, occasional waves when active
    if (isProcessing) {
      // More frequent, rhythmic waves when processing
      const waveInterval = setInterval(() => {
        setArmWaving(true);
        setTimeout(() => setArmWaving(false), 800);
      }, 2000);
      
      return () => clearInterval(waveInterval);
    } else if (isActive && !isError) {
      // Occasional waves when active but not processing
      const waveInterval = setInterval(() => {
        setArmWaving(true);
        setTimeout(() => setArmWaving(false), 1000);
      }, 5000);
      
      return () => clearInterval(waveInterval);
    } else if (isError) {
      // Quick nervous arm motions when in error state
      const errorWaveInterval = setInterval(() => {
        setArmWaving(true);
        setTimeout(() => setArmWaving(false), 400);
      }, 1000);
      
      return () => clearInterval(errorWaveInterval);
    }
  }, [isActive, isProcessing, isError]);

  // Get the color for agent type
  const getAgentColor = (type: AgentType) => {
    switch (type) {
      case 'business-analyst': return '#F59E0B'; // Amber
      case 'developer': return '#3B82F6';       // Blue
      case 'qa-engineer': return '#10B981';     // Emerald
      case 'devops': return '#8B5CF6';          // Purple
      case 'product-manager': return '#EC4899'; // Pink
      case 'custom': return '#6B7280';          // Gray
      default: return '#6B7280';
    }
  };
  
  // Get secondary colors for agent accents
  const getSecondaryColor = (type: AgentType) => {
    switch (type) {
      case 'business-analyst': return '#FBBF24'; // Lighter amber
      case 'developer': return '#60A5FA';       // Lighter blue
      case 'qa-engineer': return '#34D399';     // Lighter emerald
      case 'devops': return '#A78BFA';          // Lighter purple
      case 'product-manager': return '#F472B6'; // Lighter pink
      case 'custom': return '#9CA3AF';          // Lighter gray
      default: return '#9CA3AF';
    }
  };
  
  // Get unique features for each agent type
  const getAgentFeatures = (type: AgentType) => {
    switch (type) {
      case 'business-analyst':
        return {
          eyeShape: 'rounded-full',
          faceDecoration: 'border-t-4 border-yellow-400',
          armStyle: 'rounded-md'
        };
      case 'developer':
        return {
          eyeShape: 'rounded-sm',
          faceDecoration: 'border-b-4 border-blue-400',
          armStyle: 'rounded-none'
        };
      case 'qa-engineer':
        return {
          eyeShape: 'rounded-full',
          faceDecoration: 'border-x-4 border-emerald-400',
          armStyle: 'rounded-full'
        };
      case 'devops':
        return {
          eyeShape: 'rounded-none',
          faceDecoration: 'border-t-4 border-r-4 border-purple-400',
          armStyle: 'rounded-none'
        };
      case 'product-manager':
        return {
          eyeShape: 'rounded-full',
          faceDecoration: 'border-b-4 border-l-4 border-pink-400',
          armStyle: 'rounded-lg'
        };
      default:
        return {
          eyeShape: 'rounded-full',
          faceDecoration: '',
          armStyle: 'rounded-md'
        };
    }
  };

  // Size mappings
  const sizeMap = {
    sm: {
      container: 'w-12 h-12',
      faceSize: 'w-8 h-8',
      eyeSize: 'w-1.5 h-1.5',
      mouthSize: 'w-4 h-1.5',
      armSize: 'w-2 h-6',
    },
    md: {
      container: 'w-16 h-16',
      faceSize: 'w-10 h-10',
      eyeSize: 'w-2 h-2',
      mouthSize: 'w-5 h-2',
      armSize: 'w-2.5 h-8',
    },
    lg: {
      container: 'w-24 h-24',
      faceSize: 'w-16 h-16',
      eyeSize: 'w-3 h-3',
      mouthSize: 'w-8 h-3',
      armSize: 'w-3 h-12',
    },
  };

  const currentSize = sizeMap[size];
  const color = getAgentColor(type);
  const secondaryColor = getSecondaryColor(type);
  const features = getAgentFeatures(type);

  return (
    <div className={`relative ${currentSize.container} flex items-center justify-center robot-agent`}>
      {/* Robot body - with type-specific color */}
      <div 
        className="absolute inset-0 rounded-lg border-4 border-black shadow-brutal"
        style={{ backgroundColor: color }}
      />
      
      {/* Type badge/identifier - shows as a small icon on top of the robot */}
      <div 
        className="absolute -top-1 -left-1 w-3 h-3 rounded-full border border-black z-20"
        style={{ backgroundColor: secondaryColor }}
      />
      
      {/* Face container - with type-specific decorations */}
      <div 
        className={`${currentSize.faceSize} relative bg-white rounded-full border-2 border-black shadow-brutal z-10 ${features.faceDecoration}`}
      >
        {/* Eyes - with type-specific shape and state-based animations */}
        <div className="absolute flex justify-between w-full top-1/3 transform -translate-y-1/2 px-1.5">
          <motion.div 
            className={`${currentSize.eyeSize} bg-black ${features.eyeShape} overflow-hidden`}
            animate={{ 
              scaleY: blinking ? 0.1 : 1,
              scaleX: isError ? 1.2 : 1,
              x: isProcessing ? [0, -1, 1, -1, 0] : 0
            }}
            transition={{ 
              duration: blinking ? 0.1 : isProcessing ? 2 : 0.3,
              repeat: isProcessing && !blinking ? Infinity : 0 
            }}
          />
          <motion.div 
            className={`${currentSize.eyeSize} bg-black ${features.eyeShape} overflow-hidden`}
            animate={{ 
              scaleY: blinking ? 0.1 : 1,
              scaleX: isError ? 1.2 : 1,
              x: isProcessing ? [0, 1, -1, 1, 0] : 0
            }}
            transition={{ 
              duration: blinking ? 0.1 : isProcessing ? 2 : 0.3,
              repeat: isProcessing && !blinking ? Infinity : 0 
            }}
          />
        </div>
        
        {/* Mouth - different expressions based on state */}
        {isProcessing ? (
          // Processing mouth - improved talking animation that varies height
          <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
            <motion.div 
              className={`${currentSize.mouthSize} bg-black absolute`}
              initial={{ height: "0.2rem", y: 0, borderRadius: "0.25rem" }}
              animate={{ 
                height: ["0.2rem", "0.8rem", "0.4rem", "0.6rem", "0.2rem"],
                y: [0, -4, -2, -3, 0],
                borderRadius: ["0.25rem", "0.125rem", "0.25rem", "0.125rem", "0.25rem"],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 0.5,
                ease: "easeInOut" 
              }}
            />
          </div>
        ) : isError ? (
          // Error mouth - sad face
          <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
            <motion.div 
              className={`${currentSize.mouthSize} bg-black rounded-t-none rounded-b-full`}
              animate={{ 
                scaleY: [1, 0.8, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5
              }}
            />
          </div>
        ) : isActive ? (
          // Active mouth - happy face
          <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
            <motion.div 
              className={`${currentSize.mouthSize} bg-black rounded-t-full rounded-b-none`}
            />
          </div>
        ) : (
          // Default mouth - neutral line
          <motion.div 
            className={`${currentSize.mouthSize} h-1 bg-black absolute bottom-1/4 left-1/2 transform -translate-x-1/2 rounded-md`}
          />
        )}
      </div>
      
      {/* Left Arm - type-specific styling and animation patterns */}
      <motion.div 
        className={`${currentSize.armSize} absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-2 border-black ${features.armStyle} origin-right`}
        style={{ backgroundColor: secondaryColor }}
        animate={{ 
          rotate: armWaving 
            ? isProcessing 
              ? [0, 15, 0, 15, 0] // Processing has rhythmic small movements
              : isError 
                ? [0, 40, 10, 40, 0] // Error has jerky unpredictable movements
                : [0, 30, 0] // Normal wave
            : 0
        }}
        transition={{ 
          duration: isError ? 0.3 : 0.5, 
          ease: isError ? "backOut" : "easeInOut"
        }}
      />
      
      {/* Right Arm - type-specific styling and animation patterns */}
      <motion.div 
        className={`${currentSize.armSize} absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-2 border-black ${features.armStyle} origin-left`}
        style={{ backgroundColor: secondaryColor }}
        animate={{ 
          rotate: armWaving 
            ? isProcessing 
              ? [0, -15, 0, -15, 0] // Processing has rhythmic small movements
              : isError 
                ? [0, -40, -10, -40, 0] // Error has jerky unpredictable movements
                : [0, -30, 0] // Normal wave
            : 0
        }}
        transition={{ 
          duration: isError ? 0.3 : 0.5, 
          ease: isError ? "backOut" : "easeInOut",
          delay: 0.2
        }}
      />
      
      {/* Processing indicator - uses secondary color */}
      {isProcessing && (
        <motion.div 
          className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-black z-20"
          style={{ backgroundColor: secondaryColor }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}
      
      {/* Error indicator */}
      {isError && (
        <motion.div 
          className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-black z-20"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        />
      )}
    </div>
  );
};

export default RobotAvatar;
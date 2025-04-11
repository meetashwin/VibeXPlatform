import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Animated Button with success or error feedback
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  feedbackDuration?: number;
  feedback?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(({
  children,
  className,
  variant = "primary",
  isLoading = false,
  isSuccess = false,
  isError = false,
  feedbackDuration = 1500,
  feedback = true,
  iconLeft,
  iconRight,
  onClick,
  disabled,
  ...props
}, ref) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    if (isSuccess) {
      setFeedbackType("success");
      setShowFeedback(true);
      const timer = setTimeout(() => setShowFeedback(false), feedbackDuration);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, feedbackDuration]);

  useEffect(() => {
    if (isError) {
      setFeedbackType("error");
      setShowFeedback(true);
      const timer = setTimeout(() => setShowFeedback(false), feedbackDuration);
      return () => clearTimeout(timer);
    }
  }, [isError, feedbackDuration]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  const baseClasses = "relative overflow-hidden font-bold border-2 border-black brutal-shadow brutal-button inline-flex items-center justify-center";
  const variantClasses = {
    primary: "bg-primary text-black",
    secondary: "bg-secondary text-black",
    accent: "bg-accent text-white",
    outline: "bg-transparent text-black border-black",
    ghost: "bg-transparent text-black border-transparent shadow-none hover:bg-muted",
  };
  const stateClasses = `
    ${disabled ? "opacity-50 cursor-not-allowed hover:translate-x-0 hover:translate-y-0 hover:shadow-[5px_5px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-[5px_5px_0px_0px_#000000]" : ""}
    ${isLoading ? "cursor-wait" : ""}
  `;

  return (
    <button
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], stateClasses, className)}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Spinner overlay for loading state */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-inherit"
          >
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success/Error feedback animation */}
      <AnimatePresence>
        {showFeedback && feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              feedbackType === "success" ? "bg-green-500" : "bg-red-500"
            )}
          >
            {feedbackType === "success" ? (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button Content */}
      <span className={cn("flex items-center gap-2", { "invisible": isLoading || showFeedback })}>
        {iconLeft}
        {children}
        {iconRight}
      </span>
    </button>
  );
});
AnimatedButton.displayName = "AnimatedButton";

// Cursor spotlight effect component
interface SpotlightProps {
  children: React.ReactNode;
  className?: string;
  spotlightSize?: "sm" | "md" | "lg";
  color?: string;
}

export const Spotlight = ({ 
  children, 
  className, 
  spotlightSize = "md", 
  color = "rgba(120, 119, 198, 0.1)" 
}: SpotlightProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const sizes = {
    sm: 300,
    md: 500,
    lg: 700,
  };

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(${sizes[spotlightSize]}px circle at ${position.x}px ${position.y}px, ${color}, transparent 80%)`,
        }}
        animate={{ opacity }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      />
      {children}
    </div>
  );
};

// Interactive card with hover effects
interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: "lift" | "tilt" | "shine" | "border" | "spotlight" | "none";
  clickEffect?: "bounce" | "pulse" | "shake" | "none";
}

export const InteractiveCard = ({
  children,
  className,
  hoverEffect = "lift",
  clickEffect = "bounce",
  ...props
}: InteractiveCardProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const getHoverAnimation = () => {
    switch (hoverEffect) {
      case "lift":
        return { y: -5, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" };
      case "tilt":
        return { rotateX: 10, rotateY: 10, rotateZ: 0 };
      case "shine":
        return { background: "linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)" };
      case "border":
        return { boxShadow: "0 0 0 2px var(--primary)" };
      case "none":
        return {};
      default:
        return { y: -5 };
    }
  };

  const getClickAnimation = () => {
    if (isPressed) {
      switch (clickEffect) {
        case "bounce":
          return { scale: [1, 0.97, 1], transition: { duration: 0.3 } };
        case "pulse":
          return { scale: [1, 1.03, 1], transition: { duration: 0.3 } };
        case "shake":
          return { x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.4 } };
        case "none":
          return {};
        default:
          return { scale: [1, 0.97, 1], transition: { duration: 0.3 } };
      }
    }
    return {};
  };

  return hoverEffect === "spotlight" ? (
    <Spotlight className={className}>
      <motion.div
        className={cn("bg-white border-2 border-black p-4 brutal-shadow", className)}
        whileHover={getHoverAnimation()}
        animate={getClickAnimation()}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        {...props}
      >
        {children}
      </motion.div>
    </Spotlight>
  ) : (
    <motion.div
      className={cn("bg-white border-2 border-black p-4 brutal-shadow", className)}
      whileHover={getHoverAnimation()}
      animate={getClickAnimation()}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated counter for numbers
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export const AnimatedCounter = ({
  value,
  duration = 1,
  className,
  formatter = (value) => value.toString(),
}: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    const difference = endValue - startValue;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const currentValue = Math.floor(startValue + difference * progress);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value, duration]);
  
  return <span className={className}>{formatter(displayValue)}</span>;
};

// Animated icon that can change states with animations
interface AnimatedIconProps {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  activeClassName?: string;
  animation?: "rotate" | "bounce" | "pulse" | "shake" | "none";
}

export const AnimatedIcon = ({
  icon,
  activeIcon,
  isActive = false,
  onClick,
  className,
  activeClassName,
  animation = "rotate",
}: AnimatedIconProps) => {
  const getAnimation = () => {
    switch (animation) {
      case "rotate":
        return { rotate: isActive ? 180 : 0 };
      case "bounce":
        return { y: isActive ? [0, -5, 0] : 0, transition: { duration: 0.3 } };
      case "pulse":
        return { scale: isActive ? [1, 1.2, 1] : 1, transition: { duration: 0.3 } };
      case "shake":
        return { x: isActive ? [0, -3, 3, -3, 3, 0] : 0, transition: { duration: 0.4 } };
      case "none":
        return {};
      default:
        return { rotate: isActive ? 180 : 0 };
    }
  };

  return (
    <motion.div
      className={cn("cursor-pointer", isActive ? activeClassName : className)}
      animate={getAnimation()}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {isActive && activeIcon ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {activeIcon}
          </motion.div>
        ) : (
          <motion.div
            key="inactive"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
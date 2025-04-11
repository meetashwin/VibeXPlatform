import React, { forwardRef, useEffect, useRef } from "react";
import { motion, MotionProps, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimationVariant = 
  | "fadeIn" 
  | "fadeInUp" 
  | "fadeInDown" 
  | "fadeInLeft" 
  | "fadeInRight" 
  | "zoomIn" 
  | "slideUp" 
  | "slideDown" 
  | "slideLeft" 
  | "slideRight" 
  | "pop"
  | "shake"
  | "wiggle" 
  | "bounce"
  | "none";

export interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isVisible?: boolean;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  as?: React.ElementType;
  motionProps?: MotionProps;
  layoutId?: string;
}

// Animation preset variants
const variants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 }
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 }
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 }
  },
  zoomIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  slideUp: {
    hidden: { y: 100 },
    visible: { y: 0 }
  },
  slideDown: {
    hidden: { y: -100 },
    visible: { y: 0 }
  },
  slideLeft: {
    hidden: { x: 100 },
    visible: { x: 0 }
  },
  slideRight: {
    hidden: { x: -100 },
    visible: { x: 0 }
  },
  pop: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: [0.8, 1.1, 1], 
      opacity: 1,
      transition: { times: [0, 0.7, 1] }
    }
  },
  shake: {
    hidden: { x: 0 },
    visible: { 
      x: [0, -10, 10, -10, 10, 0],
      transition: { times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    }
  },
  wiggle: {
    hidden: { rotate: 0 },
    visible: { 
      rotate: [0, -5, 5, -5, 5, 0],
      transition: { times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    }
  },
  bounce: {
    hidden: { y: 0 },
    visible: { 
      y: [0, -20, 0, -10, 0],
      transition: { times: [0, 0.4, 0.6, 0.8, 1] }
    }
  },
  none: {
    hidden: {},
    visible: {}
  }
};

export const AnimatedContainer = forwardRef<HTMLDivElement, AnimatedContainerProps>(({
  children,
  isVisible = true,
  variant = "fadeIn",
  delay = 0,
  duration = 0.5,
  className = "",
  once = true,
  as = "div",
  motionProps,
  layoutId,
  ...props
}, ref) => {
  const controls = useAnimation();
  const localRef = useRef<HTMLDivElement>(null);
  
  // Determine which ref to use
  const finalRef = ref || localRef;
  
  useEffect(() => {
    if (isVisible) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, isVisible]);

  const Component = motion[as as keyof typeof motion] || motion.div;

  return (
    <Component
      ref={finalRef}
      initial="hidden"
      animate={controls}
      variants={variants[variant]}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={className}
      layoutId={layoutId}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
});

AnimatedContainer.displayName = "AnimatedContainer";
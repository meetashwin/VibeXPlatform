import React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const spinnerVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        accent: "text-accent",
        muted: "text-muted-foreground",
        success: "text-green-500",
        warning: "text-yellow-500",
        error: "text-red-500",
        white: "text-white",
      },
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  asChild?: boolean;
}

// Classic spinner with circular progress
export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ variant, size }), className)}
        {...props}
      >
        <svg
          className="animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }
);
LoadingSpinner.displayName = "LoadingSpinner";

// Animated dots loader (three dots)
export const DotsLoader = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center space-x-1",
          spinnerVariants({ variant, size }),
          className
        )}
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "loop",
              delay: i * 0.15,
            }}
            className="rounded-full bg-current"
            style={{
              width: size === "xs" ? 4 : size === "sm" ? 5 : size === "md" ? 6 : size === "lg" ? 8 : 10,
              height: size === "xs" ? 4 : size === "sm" ? 5 : size === "md" ? 6 : size === "lg" ? 8 : 10,
            }}
          />
        ))}
      </div>
    );
  }
);
DotsLoader.displayName = "DotsLoader";

// Neobrutalist loader with squares that change colors
export const NeobrutalistLoader = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, variant, size, ...props }, ref) => {
    const containerSizes = {
      xs: "h-4 w-4",
      sm: "h-6 w-6",
      md: "h-10 w-10",
      lg: "h-16 w-16",
      xl: "h-24 w-24",
    };

    const squareCount = 4; // 2x2 grid
    const squares = Array.from({ length: squareCount });
    
    return (
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-2 gap-1 border-2 border-black brutal-shadow p-1 bg-white",
          containerSizes[size as keyof typeof containerSizes],
          className
        )}
        {...props}
      >
        {squares.map((_, i) => (
          <motion.div
            key={i}
            className="relative border-2 border-black" 
            animate={{
              backgroundColor: [
                "#FF5252",  // Red
                "#FFEB3B",  // Yellow
                "#4CAF50",  // Green
                "#2196F3",  // Blue
                "#9C27B0",  // Purple
                "#FF5252",  // Back to red
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "loop",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    );
  }
);
NeobrutalistLoader.displayName = "NeobrutalistLoader";
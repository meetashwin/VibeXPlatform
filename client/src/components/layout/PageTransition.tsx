import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: React.ReactNode;
  location?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
};

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children,
  location: propLocation,
}) => {
  const [location] = useLocation();
  const [currentKey, setCurrentKey] = useState<string>(propLocation || location);
  const [prevKey, setPrevKey] = useState<string | null>(null);

  useEffect(() => {
    const currentPath = propLocation || location;
    if (currentPath !== currentKey) {
      setPrevKey(currentKey);
      setCurrentKey(currentPath);
    }
  }, [propLocation, location, currentKey]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentKey}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
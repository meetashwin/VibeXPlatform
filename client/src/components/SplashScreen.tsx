import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface SplashScreenProps {
  onComplete?: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [, setLocation] = useLocation();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // After 2.5 seconds, start the fade out animation
    const fadeTimer = setTimeout(() => {
      console.log('SplashScreen: Starting fade out');
      setFadeOut(true);
    }, 2000);

    // After 3 seconds (fade animation duration is 0.5s), redirect to dashboard
    const redirectTimer = setTimeout(() => {
      console.log('SplashScreen: Completing splash screen');
      // Set the splash screen shown flag in localStorage
      localStorage.setItem('splashScreenShown', 'true');
      
      // Call the onComplete callback to notify parent component
      if (onComplete) {
        onComplete();
      }
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center z-50 bg-black transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Meditative transcendental fluid background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Deep cosmic gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-800 to-blue-900 animate-color-shift"></div>
        
        {/* Meditative flowing blobs - smooth and fluid */}
        <div className="absolute top-[5%] left-[10%] w-[40vw] h-[40vw] bg-teal-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-[30%] right-[15%] w-[50vw] h-[50vw] bg-indigo-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[20%] left-[20%] w-[45vw] h-[45vw] bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-[25%] right-[25%] w-[35vw] h-[35vw] bg-blue-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-50 animate-blob animation-delay-3000"></div>
        <div className="absolute top-[40%] left-[40%] w-[45vw] h-[45vw] bg-violet-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-40 animate-blob animation-delay-1000"></div>
        
        {/* Subtle light rays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.2)_0%,_rgba(0,0,0,0)_70%)] animate-pulse"></div>
        
        {/* Flowing wave effect */}
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGQ9Ik0wIDIwQzQwIDIwIDQwIDQwIDgwIDQwTDgwIDYwQzQwIDYwIDQwIDgwIDAgODBaIiB0cmFuc2Zvcm09InJvdGF0ZSgtNDUpIi8+PC9zdmc+')] animate-pulse"></div>
        
        {/* Starry particles effect */}
        <div className="absolute inset-0 bg-black opacity-20">
          <div className="absolute h-px w-px bg-white rounded-full left-[10%] top-[10%] shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] animate-pulse"></div>
          <div className="absolute h-px w-px bg-white rounded-full left-[20%] top-[30%] shadow-[0_0_8px_2px_rgba(255,255,255,0.8)] animate-pulse animation-delay-2000"></div>
          <div className="absolute h-px w-px bg-white rounded-full left-[80%] top-[15%] shadow-[0_0_12px_2px_rgba(255,255,255,0.8)] animate-pulse animation-delay-1000"></div>
          <div className="absolute h-px w-px bg-white rounded-full left-[45%] top-[70%] shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] animate-pulse animation-delay-3000"></div>
          <div className="absolute h-px w-px bg-white rounded-full left-[75%] top-[65%] shadow-[0_0_8px_2px_rgba(255,255,255,0.8)] animate-pulse animation-delay-4000"></div>
        </div>
      </div>
      
      {/* Logo and content with cosmic meditation-themed gradient text */}
      <div className="relative z-10 text-center animate-floating">
        <h1 className="text-7xl md:text-9xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-purple-400 to-blue-300 animate-color-shift drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          VibeX
        </h1>
        <div className="text-white text-lg md:text-xl opacity-90 tracking-widest animate-fade-in-up font-light">
          by Verticurl
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
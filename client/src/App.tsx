import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Documentation from "@/pages/Documentation";
import Settings from "@/pages/Settings";
import AgentWorkflow from "@/pages/AgentWorkflow";
import ImmersiveWorkflow from "@/pages/ImmersiveWorkflow";
import PlatformSDK from "@/pages/PlatformSDK";
import Playground from "@/pages/Playground";
import Login from "@/pages/Login";
import LoginDemo from "@/pages/LoginDemo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileMenu from "@/components/layout/MobileMenu";
import SplashScreen from "@/components/SplashScreen";
import VoiceControl from "@/components/VoiceControl";
import PageTransition from "@/components/layout/PageTransition";
import AuthGuard from "@/components/auth/AuthGuard";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import { UserProvider, useUser } from "@/context/UserContext";
import AIGuide from "@/components/onboarding/AIGuide";
import TourGuide from "@/components/onboarding/TourGuide";

function Router() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading } = useUser();
  
  // For debugging purposes
  console.log("Current authentication state:", isAuthenticated);
  
  // Show login page if not authenticated, regardless of route
  if (!isAuthenticated && !isLoading) {
    return (
      <PageTransition location={location}>
        <Login />
      </PageTransition>
    );
  }
  
  return (
    <PageTransition location={location}>
      <Switch>
        <Route path="/login-demo" component={LoginDemo} />
        
        {/* Protected routes */}
        <Route path="/projects/:id">
          <ProjectDetail />
        </Route>
        <Route path="/projects">
          <Projects />
        </Route>
        <Route path="/documentation">
          <Documentation />
        </Route>
        <Route path="/settings">
          <Settings />
        </Route>
        <Route path="/workflow">
          <AgentWorkflow />
        </Route>
        <Route path="/immersive-workflow">
          <ImmersiveWorkflow />
        </Route>
        <Route path="/platform-sdk">
          <PlatformSDK />
        </Route>
        <Route path="/playground">
          <Playground />
        </Route>
        <Route path="/">
          <Dashboard />
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </PageTransition>
  );
}

// AppContent component that can access the onboarding context
function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const { startTour, hasTourBeenSeen } = useOnboarding();
  const { isAuthenticated, isLoading } = useUser();
  const [location] = useLocation();
  
  // Handle splash screen completion
  const handleSplashComplete = () => {
    console.log('Splash screen complete, transitioning to dashboard');
    setShowSplash(false);
    
    // Start the main tour if it hasn't been seen yet
    // Use a small delay to ensure everything is rendered first
    setTimeout(() => {
      if (!hasTourBeenSeen('main')) {
        console.log('Starting main tour');
        startTour('main');
      }
    }, 1000);
  };
  
  // Show splash screen when user successfully logs in
  useEffect(() => {
    if (isAuthenticated && location === '/') {
      // We've been redirected to the home page after login
      // Show the splash screen
      const loginJustCompleted = sessionStorage.getItem('loginCompleted');
      
      if (loginJustCompleted === 'true') {
        setShowSplash(true);
        sessionStorage.removeItem('loginCompleted'); // Clear the flag
      }
    }
  }, [isAuthenticated, location]);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  // In an earlier version, we handled unauthenticated state here, 
  // but now it's handled in the Router component

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SplashScreen onComplete={handleSplashComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex flex-col"
          >
            <Header toggleMenu={toggleMenu} />
            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
              <Router />
            </main>
            <Footer />
            {/* Onboarding components */}
            <AIGuide />
            <TourGuide />
            {/* Voice control component - placed after AI Guide so it doesn't overlap */}
            <div className="relative z-10">
              <VoiceControl />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
    </>
  );
}

// Main App component that sets up providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <OnboardingProvider>
          <AppContent />
        </OnboardingProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;

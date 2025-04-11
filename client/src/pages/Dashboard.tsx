import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useOnboarding } from "@/context/OnboardingContext";
import { Button } from "@/components/ui/button";

import ProjectCard from "@/components/dashboard/ProjectCard";
import AiAssistant from "@/components/dashboard/AiAssistant";
import CodeWorkspace from "@/components/dashboard/CodeWorkspace";
import ActivitySection from "@/components/dashboard/ActivitySection";
import Documentation from "@/components/dashboard/Documentation";
import WorkflowTemplates from "@/components/dashboard/WorkflowTemplates";
import ProjectTemplates from "@/components/dashboard/ProjectTemplates";
import { CreateProjectButton } from "@/components/dashboard/CreateProjectForm";

const Dashboard = () => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAskingAi, setIsAskingAi] = useState(false);
  const { toast } = useToast();
  const { startTour, resetTourHistory } = useOnboarding();

  const { data, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  // Ensure projects is properly typed
  const projects: Project[] = data || [];

  const handleAiPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAskingAi(true);
    try {
      const response = await apiRequest("POST", "/api/ai/prompt", {
        prompt: aiPrompt
      });
      
      if (response.ok) {
        toast({
          title: "AI Assistant",
          description: "Your request has been sent to the AI assistant",
        });
        setAiPrompt("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send prompt to AI",
        variant: "destructive",
      });
    } finally {
      setIsAskingAi(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-row justify-between items-center mb-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold" id="dashboard-title">Team Development Hub (Dashboard)</h1>
        </div>
        <form 
          className="flex flex-col md:flex-row gap-4 bg-white border-4 border-black p-4 brutal-shadow-lg"
          onSubmit={handleAiPromptSubmit}
          id="ai-prompt-form"
        >
          <input 
            type="text" 
            placeholder="What would you like to build today?" 
            className="flex-1 border-2 border-black p-3 text-lg"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isAskingAi}
            id="ai-prompt-input"
          />
          <button 
            type="button"
            className={`bg-primary text-black font-bold py-3 px-6 border-2 border-black brutal-shadow brutal-button flex items-center gap-2 ${isAskingAi ? 'opacity-50' : ''}`}
            disabled={isAskingAi}
            onClick={() => {
              // Instead of submitting the form, we'll open the project creation modal
              document.getElementById("create-project-button")?.click();
            }}
            id="ai-prompt-button"
          >
            {isAskingAi ? (
              <>
                <span className="animate-spin h-5 w-5 border-2 border-black rounded-full border-t-transparent"></span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <i className="ri-rocket-2-fill"></i>
                <span>Start AI-Guided Project Creation</span>
              </>
            )}
          </button>
        </form>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-2xl font-bold">Recent Projects</h2>
            <Link href="/projects" className="flex items-center gap-1 font-medium hover:underline">
              <span>View all</span>
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          ) : (
            <>
              {projects.length === 0 ? (
                <div className="bg-white border-4 border-black p-8 brutal-shadow mb-4 text-center">
                  <p className="mb-4">You don't have any projects yet</p>
                </div>
              ) : (
                projects.slice(0, 2).map((project: Project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              )}
              
              <button 
                onClick={() => document.getElementById("create-project-button")?.click()}
                className="w-full bg-accent text-white font-bold py-3 border-2 border-black brutal-shadow brutal-button flex items-center justify-center gap-2"
              >
                <i className="ri-add-line"></i>
                <span>Create New Project (AI-Guided)</span>
              </button>
            </>
          )}
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-2xl font-bold">Ask for Help</h2>
          </div>
          <AiAssistant />
        </div>
      </div>
      
      <CodeWorkspace />
      
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl font-bold">Get Started with Templates</h2>
        </div>
        
        <ProjectTemplates />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivitySection />
        <Documentation />
      </div>
      
      {/* Removed duplicate tour button */}
      
      {/* Hidden component for project creation that gets triggered by "Start AI-Guided Project Creation" */}
      <div className="hidden">
        <CreateProjectButton />
      </div>
    </>
  );
};

export default Dashboard;

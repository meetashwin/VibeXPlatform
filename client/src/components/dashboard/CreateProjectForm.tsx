import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define project archetypes
const PROJECT_ARCHETYPES = [
  { id: "cx", name: "Customer Experience Platform", description: "Focus on improving customer interactions and satisfaction" },
  { id: "marketing", name: "Marketing Automation", description: "Automate marketing processes, campaigns, and analytics" },
  { id: "devops", name: "DevOps Platform", description: "Continuous integration and deployment with operational tools" },
  { id: "data", name: "Data Platform", description: "Data engineering, analytics, and insights capabilities" },
  { id: "ai", name: "AI Platform", description: "Machine learning and artificial intelligence applications" },
  { id: "commerce", name: "E-Commerce", description: "Online shopping and transaction-based platform" },
  { id: "enterprise", name: "Enterprise Solution", description: "Large-scale business process automation" },
  { id: "custom", name: "Custom", description: "Create your own custom project type" }
];

// Define common tech stacks that can be selected
const TECH_STACKS = [
  { name: "Web - React", technologies: ["React", "TypeScript", "Tailwind CSS"] },
  { name: "Web - Vue", technologies: ["Vue.js", "JavaScript", "CSS"] },
  { name: "Full Stack - MERN", technologies: ["MongoDB", "Express", "React", "Node.js"] },
  { name: "AI - Python", technologies: ["Python", "TensorFlow", "Pandas"] },
  { name: "AI - Agent Based", technologies: ["Python", "LLM", "Agents", "CrewAI"] },
  { name: "Mobile - React Native", technologies: ["React Native", "JavaScript", "Firebase"] },
];

interface ProjectFormProps {
  variant?: "primary" | "secondary";
  label?: string;
  project?: {
    id?: number | string;
    name: string;
    description: string;
    status: string;
    technologies: string[];
    archetype?: string;
  };
  mode?: "create" | "edit";
  onSuccess?: () => void;
  buttonStyle?: "button" | "link";
  className?: string;
}

export const CreateProjectButton = ({ 
  variant = "primary", 
  label = "New Project", 
  project, 
  mode = "create",
  onSuccess,
  buttonStyle = "button",
  className = ""
}: ProjectFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [status, setStatus] = useState(project?.status || "active");
  const [customTech, setCustomTech] = useState("");
  const [technologies, setTechnologies] = useState<string[]>(project?.technologies || []);
  const [techStack, setTechStack] = useState("");
  const [archetype, setArchetype] = useState(project?.archetype || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleTechStackChange = (stackName: string) => {
    setTechStack(stackName);
    const selectedStack = TECH_STACKS.find(stack => stack.name === stackName);
    if (selectedStack) {
      setTechnologies(selectedStack.technologies);
    }
  };

  const addCustomTech = () => {
    if (customTech && !technologies.includes(customTech)) {
      setTechnologies([...technologies, customTech]);
      setCustomTech("");
    }
  };

  const removeTech = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("active");
    setTechnologies([]);
    setCustomTech("");
    setTechStack("");
    setArchetype("");
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description || technologies.length === 0 || !archetype) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields, select a project archetype, and add at least one technology",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (mode === "edit" && project?.id) {
        // Edit existing project
        await apiRequest(
          "PATCH",
          `/api/projects/${project.id}`,
          {
            name,
            description,
            status,
            technologies,
            archetype
          }
        );
        
        // Invalidate the projects query to refetch data
        queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}`] });
        
        toast({
          title: "Success!",
          description: `Project "${name}" has been updated`,
        });
      } else {
        // Create new project
        await apiRequest(
          "POST",
          "/api/projects",
          {
            name,
            description,
            status,
            technologies,
            archetype
          }
        );
        
        // Invalidate the projects query to refetch data
        queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
        
        toast({
          title: "Success!",
          description: `Project "${name}" has been created`,
        });
      }
      
      resetForm();
      setIsOpen(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: mode === "edit" 
          ? "Failed to update the project. Please try again." 
          : "Failed to create the project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Agent-guided project creation
  const [agentPrompt, setAgentPrompt] = useState("");
  const [agentResponse, setAgentResponse] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentStep, setAgentStep] = useState(1);
  const [agentRecommendations, setAgentRecommendations] = useState({
    name: "",
    description: "",
    technologies: [] as string[],
    archetype: ""
  });

  const handleAgentPrompt = async () => {
    if (!agentPrompt.trim()) return;
    
    setAgentLoading(true);
    
    try {
      // Simulating an AI response for now
      setTimeout(() => {
        const projectIdea = agentPrompt.trim();
        let aiResponse = "";
        let aiRecommendation = { 
          name: "", 
          description: "", 
          technologies: [] as string[],
          archetype: ""
        };
        
        if (agentStep === 1) {
          // First interaction: project idea
          aiResponse = `Great idea! I can help you create a ${projectIdea} project. Here's what I recommend:`;
          
          // Generate a project name based on the prompt
          const projectName = projectIdea
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          aiRecommendation.name = projectName;
          
          // Generate a mock description
          aiRecommendation.description = `A powerful ${projectIdea} platform with modern architecture and intuitive user interfaces.`;
          
          // Recommend technologies based on keywords
          if (projectIdea.toLowerCase().includes('web') || projectIdea.toLowerCase().includes('frontend')) {
            aiRecommendation.technologies = ["React", "TypeScript", "Tailwind CSS"];
          } else if (projectIdea.toLowerCase().includes('ai') || projectIdea.toLowerCase().includes('machine learning')) {
            aiRecommendation.technologies = ["Python", "TensorFlow", "LLM", "Agents"];
            aiRecommendation.archetype = "ai";
          } else if (projectIdea.toLowerCase().includes('mobile')) {
            aiRecommendation.technologies = ["React Native", "JavaScript", "Firebase"];
          } else {
            aiRecommendation.technologies = ["React", "Node.js", "MongoDB"];
          }
          
          // Suggest archetype based on keywords
          if (projectIdea.toLowerCase().includes('customer') || projectIdea.toLowerCase().includes('crm') || projectIdea.toLowerCase().includes('support')) {
            aiRecommendation.archetype = "cx";
          } else if (projectIdea.toLowerCase().includes('marketing') || projectIdea.toLowerCase().includes('campaign') || projectIdea.toLowerCase().includes('email')) {
            aiRecommendation.archetype = "marketing";
          } else if (projectIdea.toLowerCase().includes('devops') || projectIdea.toLowerCase().includes('deploy') || projectIdea.toLowerCase().includes('ci/cd')) {
            aiRecommendation.archetype = "devops";
          } else if (projectIdea.toLowerCase().includes('data') || projectIdea.toLowerCase().includes('analytics') || projectIdea.toLowerCase().includes('dashboard')) {
            aiRecommendation.archetype = "data";
          } else if (projectIdea.toLowerCase().includes('commerce') || projectIdea.toLowerCase().includes('shop') || projectIdea.toLowerCase().includes('store')) {
            aiRecommendation.archetype = "commerce";
          } else if (projectIdea.toLowerCase().includes('enterprise') || projectIdea.toLowerCase().includes('business')) {
            aiRecommendation.archetype = "enterprise";
          } else if (!aiRecommendation.archetype) {
            aiRecommendation.archetype = "custom";
          }
          
          setAgentStep(2);
        } else if (agentStep === 2) {
          // Second interaction: refine project details
          aiResponse = "I've updated the project details based on your feedback. Is there anything else you'd like to modify?";
          // Keep existing recommendations but append the new prompt as context
          aiRecommendation = {...agentRecommendations};
          aiRecommendation.description += " " + projectIdea;
          setAgentStep(3);
        } else {
          // Final step: confirm
          aiResponse = "Perfect! Your project is ready to be created. Click 'Create with Agent' to finalize.";
          aiRecommendation = {...agentRecommendations};
          setAgentStep(4);
        }
        
        setAgentResponse(aiResponse);
        setAgentRecommendations(aiRecommendation);
        setAgentLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error with agent:", error);
      setAgentResponse("Sorry, I encountered an error. Please try again.");
      setAgentLoading(false);
    }
  };

  const applyAgentRecommendations = () => {
    setName(agentRecommendations.name);
    setDescription(agentRecommendations.description);
    setTechnologies(agentRecommendations.technologies);
    setArchetype(agentRecommendations.archetype);
    // Reset agent state
    setAgentStep(1);
    setAgentPrompt("");
    setAgentResponse("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          className={`${
            variant === "primary" 
              ? "bg-accent text-white" 
              : "bg-white text-black border-accent"
          } font-bold py-2 px-4 border-2 border-black brutal-shadow brutal-button flex items-center gap-2`}
          onClick={() => setIsOpen(true)}
          id="create-project-button"
        >
          <i className="ri-add-line"></i>
          <span>{label}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] border-4 border-black brutal-shadow">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {mode === "edit" ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="agent" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="manual" className="text-lg">Manual Setup</TabsTrigger>
            <TabsTrigger value="agent" className="text-lg">Agent-Driven Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="mt-5">
              <div className="mb-5">
                <label htmlFor="name" className="block mb-2 font-bold">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full border-2 border-black p-3"
                  required
                />
              </div>
              
              <div className="mb-5">
                <label htmlFor="description" className="block mb-2 font-bold">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your project"
                  className="w-full border-2 border-black p-3 min-h-[100px]"
                  required
                />
              </div>
              
              <div className="mb-5">
                <label htmlFor="archetype" className="block mb-2 font-bold">
                  Project Archetype <span className="text-red-500">*</span>
                </label>
                <select
                  id="archetype"
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value)}
                  className="w-full border-2 border-black p-3"
                >
                  <option value="">Select a project archetype</option>
                  {PROJECT_ARCHETYPES.map((arch) => (
                    <option key={arch.id} value={arch.id}>
                      {arch.name} - {arch.description}
                    </option>
                  ))}
                </select>
                {!archetype && (
                  <p className="text-sm text-gray-500 mt-1">Choose an archetype that best describes your project purpose</p>
                )}
              </div>
              
              <div className="mb-5">
                <label htmlFor="status" className="block mb-2 font-bold">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border-2 border-black p-3"
                >
                  <option value="active">Active</option>
                  <option value="in progress">In Progress</option>
                  <option value="on hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="mb-5">
                <label htmlFor="techStack" className="block mb-2 font-bold">
                  Tech Stack Templates
                </label>
                <select
                  id="techStack"
                  value={techStack}
                  onChange={(e) => handleTechStackChange(e.target.value)}
                  className="w-full border-2 border-black p-3"
                >
                  <option value="">Select a pre-defined tech stack</option>
                  {TECH_STACKS.map((stack) => (
                    <option key={stack.name} value={stack.name}>
                      {stack.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-5">
                <label className="block mb-2 font-bold">
                  Technologies <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {technologies.map((tech) => (
                    <div 
                      key={tech}
                      className="bg-accent text-white px-3 py-1 rounded flex items-center gap-1"
                    >
                      <span>{tech}</span>
                      <button 
                        type="button" 
                        onClick={() => removeTech(tech)}
                        className="text-white hover:text-red-200"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {technologies.length === 0 && (
                    <div className="text-gray-500 italic">No technologies selected</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTech}
                    onChange={(e) => setCustomTech(e.target.value)}
                    placeholder="Add custom technology"
                    className="flex-1 border-2 border-black p-3"
                  />
                  <button
                    type="button"
                    onClick={addCustomTech}
                    disabled={!customTech}
                    className="bg-black text-white font-bold py-2 px-4 brutal-button disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-white font-bold py-2 px-4 border-2 border-black brutal-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent text-white font-bold py-2 px-4 border-2 border-black brutal-button flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{mode === "edit" ? "Updating..." : "Creating..."}</span>
                    </>
                  ) : (
                    <span>{mode === "edit" ? "Update Project" : "Create Project"}</span>
                  )}
                </button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="agent">
            <div className="mt-5">
              <div className="bg-primary/10 border-2 border-primary p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-primary border-2 border-black flex items-center justify-center">
                    <i className="ri-robot-fill text-black text-xl"></i>
                  </div>
                  <div className="font-bold">Project Creation Agent</div>
                </div>
                <p className="text-sm mb-3">
                  Tell me what kind of project you'd like to create, and I'll help you set it up with recommended technologies and structure.
                </p>
                <div className="border-t-2 border-dashed border-black/30 pt-3">
                  <p className="font-medium text-sm">Current step: {
                    agentStep === 1 ? "Project Idea" : 
                    agentStep === 2 ? "Refining Details" : 
                    agentStep === 3 ? "Final Confirmation" :
                    "Ready to Create"
                  }</p>
                </div>
              </div>
              
              {/* Agent chat area */}
              <div className="border-2 border-black p-3 mb-4 h-[250px] overflow-y-auto bg-gray-50">
                {/* Initial prompt */}
                {agentStep === 1 && !agentResponse && (
                  <div className="text-center text-gray-500 my-6">
                    <p className="mb-2">👋 What kind of project would you like to create?</p>
                    <p className="text-sm">For example: "A social media platform for book lovers" or "An AI-powered personal assistant app"</p>
                  </div>
                )}
                
                {/* Agent response */}
                {agentResponse && (
                  <div className="flex gap-2 mb-4">
                    <div className="flex-shrink-0 h-8 w-8 bg-primary border-2 border-black flex items-center justify-center">
                      <i className="ri-robot-fill text-black text-sm"></i>
                    </div>
                    <div className="bg-accent text-white p-3 rounded-tl-lg rounded-b-lg">
                      <p>{agentResponse}</p>
                      
                      {/* Show recommendations */}
                      {agentRecommendations.name && (
                        <div className="mt-2 p-2 bg-white/10 rounded">
                          <p className="font-bold text-sm">Project Name:</p>
                          <p className="text-sm mb-1">{agentRecommendations.name}</p>
                          
                          <p className="font-bold text-sm">Description:</p>
                          <p className="text-sm mb-1">{agentRecommendations.description}</p>
                          
                          <p className="font-bold text-sm">Project Archetype:</p>
                          <p className="text-sm mb-1">
                            {PROJECT_ARCHETYPES.find(a => a.id === agentRecommendations.archetype)?.name || "Custom"}
                          </p>
                          
                          <p className="font-bold text-sm">Recommended Technologies:</p>
                          <div className="flex flex-wrap gap-1">
                            {agentRecommendations.technologies.map((tech, i) => (
                              <span key={i} className="text-xs bg-black/30 px-2 py-1 rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* User message */}
                {agentPrompt && (
                  <div className="flex gap-2 justify-end mb-4">
                    <div className="bg-gray-200 p-3 rounded-tr-lg rounded-b-lg">
                      <p>{agentPrompt}</p>
                    </div>
                    <div className="flex-shrink-0 h-8 w-8 bg-secondary border-2 border-black flex items-center justify-center text-xs font-bold">
                      U
                    </div>
                  </div>
                )}
                
                {/* Loading indicator */}
                {agentLoading && (
                  <div className="flex gap-2 mb-4">
                    <div className="flex-shrink-0 h-8 w-8 bg-primary border-2 border-black flex items-center justify-center">
                      <i className="ri-robot-fill text-black text-sm"></i>
                    </div>
                    <div className="bg-accent text-white p-3 rounded-tl-lg rounded-b-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input area */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  placeholder={agentStep === 1 ? "Describe your project idea..." : "Ask questions or provide feedback..."}
                  className="flex-1 border-2 border-black p-3"
                  disabled={agentLoading || agentStep > 3}
                />
                <button
                  type="button"
                  onClick={handleAgentPrompt}
                  disabled={agentLoading || !agentPrompt.trim() || agentStep > 3}
                  className="bg-primary text-black font-bold px-4 border-2 border-black brutal-button"
                >
                  <i className="ri-send-plane-fill"></i>
                </button>
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setAgentStep(1);
                    setAgentPrompt("");
                    setAgentResponse("");
                    setAgentRecommendations({name: "", description: "", technologies: [], archetype: ""});
                  }}
                  className="bg-white font-bold py-2 px-4 border-2 border-black brutal-button"
                >
                  Reset Agent
                </button>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="bg-white font-bold py-2 px-4 border-2 border-black brutal-button"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      applyAgentRecommendations();
                      handleSubmit(new Event('submit') as any);
                    }}
                    disabled={!agentRecommendations.name || isSubmitting || agentStep < 3}
                    className="bg-accent text-white font-bold py-2 px-4 border-2 border-black brutal-button flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{mode === "edit" ? "Updating..." : "Creating..."}</span>
                      </>
                    ) : (
                      <>
                        <i className="ri-robot-fill"></i>
                        <span>{mode === "edit" ? "Update with Agent" : "Create with Agent"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
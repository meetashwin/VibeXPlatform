import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Template types that can be added to a project
type TemplateType = 'workflow' | 'research' | 'prototype' | 'decision';

interface Template {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTime: string;
  icon: string;
}

interface ProjectTemplatesProps {
  projectId?: string | number;
  compact?: boolean;
  onSelect?: (template: Template) => void;
}

const TEMPLATES: Template[] = [
  // Workflow templates
  {
    id: 'workflow-web-app',
    name: 'Web Application Development',
    description: 'End-to-end workflow for building modern web applications',
    type: 'workflow',
    category: 'development',
    complexity: 'medium',
    estimatedTime: '2-4 weeks',
    icon: 'ri-code-box-line',
  },
  {
    id: 'workflow-mobile-app',
    name: 'Mobile App Development',
    description: 'Workflow for creating cross-platform mobile applications',
    type: 'workflow',
    category: 'development',
    complexity: 'complex',
    estimatedTime: '4-8 weeks',
    icon: 'ri-smartphone-line',
  },
  {
    id: 'workflow-ai-integration',
    name: 'AI Integration',
    description: 'Add AI capabilities to your existing applications',
    type: 'workflow',
    category: 'ai',
    complexity: 'medium',
    estimatedTime: '1-3 weeks',
    icon: 'ri-brain-line',
  },
  
  // Research plan templates
  {
    id: 'research-user-needs',
    name: 'User Needs Analysis',
    description: 'Research plan to identify and prioritize user requirements',
    type: 'research',
    category: 'design',
    complexity: 'medium',
    estimatedTime: '1-2 weeks',
    icon: 'ri-user-search-line',
  },
  {
    id: 'research-market',
    name: 'Market Analysis',
    description: 'Comprehensive research of market trends and competitors',
    type: 'research',
    category: 'business',
    complexity: 'medium',
    estimatedTime: '1-3 weeks',
    icon: 'ri-line-chart-line',
  },
  {
    id: 'research-tech-stack',
    name: 'Technology Evaluation',
    description: 'Compare and select the optimal technologies for your project',
    type: 'research',
    category: 'development',
    complexity: 'simple',
    estimatedTime: '3-5 days',
    icon: 'ri-stack-line',
  },
  
  // Prototype templates
  {
    id: 'prototype-mvp',
    name: 'Minimum Viable Product',
    description: 'Quickly build and test a minimal working version',
    type: 'prototype',
    category: 'development',
    complexity: 'simple',
    estimatedTime: '1-2 weeks',
    icon: 'ri-rocket-line',
  },
  {
    id: 'prototype-ui',
    name: 'UI Prototype',
    description: 'Interactive user interface mockups for testing',
    type: 'prototype',
    category: 'design',
    complexity: 'simple',
    estimatedTime: '3-7 days',
    icon: 'ri-layout-line',
  },
  
  // Decision templates
  {
    id: 'decision-architecture',
    name: 'Architecture Decision',
    description: 'Framework for making important architectural choices',
    type: 'decision',
    category: 'development',
    complexity: 'complex',
    estimatedTime: '1-3 days',
    icon: 'ri-git-branch-line',
  },
  {
    id: 'decision-feature',
    name: 'Feature Prioritization',
    description: 'Decide which features to build first',
    type: 'decision',
    category: 'product',
    complexity: 'simple',
    estimatedTime: '1-2 days',
    icon: 'ri-list-check',
  },
];

export const ProjectTemplates: React.FC<ProjectTemplatesProps> = ({ 
  projectId,
  compact = false,
  onSelect
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TemplateType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredTemplates = selectedType 
    ? TEMPLATES.filter(t => t.type === selectedType)
    : TEMPLATES;

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    
    if (onSelect) {
      onSelect(template);
      return;
    }
    
    if (!projectId) {
      setIsDialogOpen(false);
      toast({
        title: "No project selected",
        description: "Please select a project first before adding a template.",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would implement adding the template to the project
    // For now, we'll just show a success message
    toast({
      title: "Template Added",
      description: `Added "${template.name}" to your project.`,
    });
    
    setIsDialogOpen(false);
    
    // Invalidate relevant queries to trigger refetch
    if (template.type === 'workflow') {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/workflows`] });
    } else if (template.type === 'research') {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/research-plans`] });
    } else if (template.type === 'prototype') {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/prototype-tests`] });
    } else if (template.type === 'decision') {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/decisions`] });
    }
  };

  // Render different views based on compact mode
  if (compact) {
    // Render a grid of cards optimized for project details view
    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.slice(0, 4).map((template) => (
            <div 
              key={template.id}
              className="border-2 border-black p-3 bg-white brutal-shadow hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-accent text-white flex items-center justify-center">
                  <i className={template.icon}></i>
                </div>
                <h3 className="font-bold text-sm">{template.name}</h3>
              </div>
              <p className="text-xs text-gray-600 mb-1 line-clamp-2">{template.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="bg-gray-100 px-2 py-0.5 rounded">{template.type}</span>
                <span className="text-gray-500">{template.estimatedTime}</span>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="w-full mt-3 bg-black text-white font-bold py-2 px-4 border-2 border-black brutal-shadow brutal-button"
        >
          <span>Browse All Templates</span>
        </button>
      </>
    );
  }

  // Full view with dialog
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Workflow Templates */}
        <div className="border-4 border-black p-4 bg-white brutal-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-primary border-2 border-black flex items-center justify-center">
              <i className="ri-flow-chart text-black text-xl"></i>
            </div>
            <h3 className="font-heading font-bold">Workflow Templates</h3>
          </div>
          <p className="text-sm mb-4">Build agent-driven processes to automate your development tasks</p>
          <button 
            onClick={() => {
              setSelectedType('workflow');
              setIsDialogOpen(true);
            }}
            className="w-full bg-white font-bold py-2 px-4 border-2 border-black brutal-button mt-2"
          >
            Browse Workflows
          </button>
        </div>

        {/* Research Planning */}
        <div className="border-4 border-black p-4 bg-white brutal-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-primary border-2 border-black flex items-center justify-center">
              <i className="ri-book-read-line text-black text-xl"></i>
            </div>
            <h3 className="font-heading font-bold">Research Planning</h3>
          </div>
          <p className="text-sm mb-4">Create structured research plans to explore problems and solutions</p>
          <button 
            onClick={() => {
              setSelectedType('research');
              setIsDialogOpen(true);
            }}
            className="w-full bg-white font-bold py-2 px-4 border-2 border-black brutal-button mt-2"
          >
            Research Templates
          </button>
        </div>

        {/* Prototype Testing */}
        <div className="border-4 border-black p-4 bg-white brutal-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-primary border-2 border-black flex items-center justify-center">
              <i className="ri-test-tube-line text-black text-xl"></i>
            </div>
            <h3 className="font-heading font-bold">Prototype Testing</h3>
          </div>
          <p className="text-sm mb-4">Test and validate your solutions with guided user testing frameworks</p>
          <button 
            onClick={() => {
              setSelectedType('prototype');
              setIsDialogOpen(true);
            }}
            className="w-full bg-white font-bold py-2 px-4 border-2 border-black brutal-button mt-2"
          >
            Prototype Templates
          </button>
        </div>
      </div>

      {/* Template Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] border-4 border-black brutal-shadow">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedType === 'workflow' && 'Workflow Templates'}
              {selectedType === 'research' && 'Research Plan Templates'}
              {selectedType === 'prototype' && 'Prototype Testing Templates'}
              {selectedType === 'decision' && 'Decision Templates'}
              {!selectedType && 'All Templates'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-3 mb-4 flex-wrap">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-3 py-1 border-2 border-black ${!selectedType ? 'bg-black text-white' : 'bg-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType('workflow')}
              className={`px-3 py-1 border-2 border-black ${selectedType === 'workflow' ? 'bg-primary text-black' : 'bg-white'}`}
            >
              Workflows
            </button>
            <button
              onClick={() => setSelectedType('research')}
              className={`px-3 py-1 border-2 border-black ${selectedType === 'research' ? 'bg-secondary text-black' : 'bg-white'}`}
            >
              Research
            </button>
            <button
              onClick={() => setSelectedType('prototype')}
              className={`px-3 py-1 border-2 border-black ${selectedType === 'prototype' ? 'bg-accent text-white' : 'bg-white'}`}
            >
              Prototypes
            </button>
            <button
              onClick={() => setSelectedType('decision')}
              className={`px-3 py-1 border-2 border-black ${selectedType === 'decision' ? 'bg-[#FF9800] text-black' : 'bg-white'}`}
            >
              Decisions
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="border-2 border-black p-4 bg-white brutal-shadow hover:translate-y-[-2px] transition-transform cursor-pointer"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                    ${template.type === 'workflow' ? 'bg-primary text-black' : 
                      template.type === 'research' ? 'bg-secondary text-black' : 
                      template.type === 'prototype' ? 'bg-accent text-white' : 
                      'bg-[#FF9800] text-black'}`}>
                    <i className={template.icon}></i>
                  </div>
                  <h3 className="font-bold">{template.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex flex-wrap items-center justify-between text-xs">
                  <div className="flex gap-2 items-center">
                    <span className="bg-gray-100 px-2 py-1 rounded capitalize">{template.category}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded capitalize">{template.complexity}</span>
                  </div>
                  <span>{template.estimatedTime}</span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectTemplates;
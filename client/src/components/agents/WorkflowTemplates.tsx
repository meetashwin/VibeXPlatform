import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Edge, Node } from 'reactflow';
import { AgentType } from '@/pages/AgentWorkflow';
import RobotAvatar from './RobotAvatar';

// Define the structure of a workflow template
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'design' | 'data' | 'devops' | 'custom';
  nodes: Node[];
  edges: Edge[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
}

interface WorkflowTemplatesProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

// Predefined workflow templates
const templates: WorkflowTemplate[] = [
  {
    id: 'web-app-mvp',
    name: 'Web App MVP',
    description: 'A basic workflow for creating a minimal viable product web application with a focus on rapid development.',
    category: 'development',
    difficulty: 'beginner',
    estimatedTime: '3-4 days',
    tags: ['web', 'mvp', 'react', 'api'],
    nodes: [
      {
        id: 'ba-1',
        type: 'agent',
        position: { x: 250, y: 50 },
        data: {
          label: 'Product Requirements',
          type: 'business-analyst',
          description: 'Define product requirements and user stories for the MVP.',
        },
      },
      {
        id: 'dev-1',
        type: 'agent',
        position: { x: 100, y: 200 },
        data: {
          label: 'UI/UX Development',
          type: 'developer',
          description: 'Create React components and UI interfaces based on requirements.',
        },
      },
      {
        id: 'dev-2',
        type: 'agent',
        position: { x: 400, y: 200 },
        data: {
          label: 'API Development',
          type: 'developer',
          description: 'Build REST API endpoints and database models.',
        },
      },
      {
        id: 'qa-1',
        type: 'agent',
        position: { x: 250, y: 350 },
        data: {
          label: 'Testing',
          type: 'qa-engineer',
          description: 'Test the web application functionality and identify bugs.',
        },
      },
      {
        id: 'devops-1',
        type: 'agent',
        position: { x: 250, y: 500 },
        data: {
          label: 'Deployment',
          type: 'devops',
          description: 'Deploy the MVP to a production environment.',
        },
      },
    ],
    edges: [
      {
        id: 'e-ba1-dev1',
        source: 'ba-1',
        target: 'dev-1',
        animated: true,
        label: 'UI Requirements',
        data: {
          label: 'UI Requirements',
          dataType: 'requirements',
          description: 'User interface design requirements',
        }
      },
      {
        id: 'e-ba1-dev2',
        source: 'ba-1',
        target: 'dev-2',
        animated: true,
        label: 'API Requirements',
        data: {
          label: 'API Requirements',
          dataType: 'requirements',
          description: 'API specifications and data model requirements',
        }
      },
      {
        id: 'e-dev1-qa1',
        source: 'dev-1',
        target: 'qa-1',
        animated: true,
        label: 'UI for Testing',
        data: {
          label: 'UI for Testing',
          dataType: 'code',
          description: 'User interface components ready for testing',
        }
      },
      {
        id: 'e-dev2-qa1',
        source: 'dev-2',
        target: 'qa-1',
        animated: true,
        label: 'API for Testing',
        data: {
          label: 'API for Testing',
          dataType: 'code',
          description: 'API endpoints ready for testing',
        }
      },
      {
        id: 'e-qa1-devops1',
        source: 'qa-1',
        target: 'devops-1',
        animated: true,
        label: 'Validated App',
        data: {
          label: 'Validated App',
          dataType: 'code',
          description: 'Fully tested application ready for deployment',
        }
      },
    ]
  },
  {
    id: 'ml-integration',
    name: 'ML Model Integration',
    description: 'A workflow for integrating a machine learning model into an existing application.',
    category: 'data',
    difficulty: 'advanced',
    estimatedTime: '1-2 weeks',
    tags: ['ml', 'ai', 'data science', 'integration'],
    nodes: [
      {
        id: 'ba-1',
        type: 'agent',
        position: { x: 250, y: 50 },
        data: {
          label: 'Requirements Analysis',
          type: 'business-analyst',
          description: 'Define the ML integration requirements and expected outcomes.',
        },
      },
      {
        id: 'dev-1',
        type: 'agent',
        position: { x: 100, y: 200 },
        data: {
          label: 'Data Engineer',
          type: 'developer',
          description: 'Prepare data pipelines and infrastructure for ML model.',
        },
      },
      {
        id: 'dev-2',
        type: 'agent',
        position: { x: 400, y: 200 },
        data: {
          label: 'ML Engineer',
          type: 'developer',
          description: 'Develop and train the machine learning model.',
        },
      },
      {
        id: 'dev-3',
        type: 'agent',
        position: { x: 250, y: 350 },
        data: {
          label: 'API Developer',
          type: 'developer',
          description: 'Build API endpoints to serve ML model predictions.',
        },
      },
      {
        id: 'qa-1',
        type: 'agent',
        position: { x: 250, y: 500 },
        data: {
          label: 'ML Testing',
          type: 'qa-engineer',
          description: 'Test the ML model accuracy and performance.',
        },
      },
      {
        id: 'devops-1',
        type: 'agent',
        position: { x: 250, y: 650 },
        data: {
          label: 'ML Deployment',
          type: 'devops',
          description: 'Deploy the ML model to production environment.',
        },
      },
    ],
    edges: [
      {
        id: 'e-ba1-dev1',
        source: 'ba-1',
        target: 'dev-1',
        animated: true,
        label: 'Data Requirements',
        data: {
          label: 'Data Requirements',
          dataType: 'requirements',
          description: 'Data requirements and specifications',
        }
      },
      {
        id: 'e-ba1-dev2',
        source: 'ba-1',
        target: 'dev-2',
        animated: true,
        label: 'ML Requirements',
        data: {
          label: 'ML Requirements',
          dataType: 'requirements',
          description: 'Machine learning model specifications',
        }
      },
      {
        id: 'e-dev1-dev2',
        source: 'dev-1',
        target: 'dev-2',
        animated: true,
        label: 'Processed Data',
        data: {
          label: 'Processed Data',
          dataType: 'code',
          description: 'Cleaned and processed data for ML training',
        }
      },
      {
        id: 'e-dev2-dev3',
        source: 'dev-2',
        target: 'dev-3',
        animated: true,
        label: 'ML Model',
        data: {
          label: 'ML Model',
          dataType: 'code',
          description: 'Trained machine learning model',
        }
      },
      {
        id: 'e-dev3-qa1',
        source: 'dev-3',
        target: 'qa-1',
        animated: true,
        label: 'ML API',
        data: {
          label: 'ML API',
          dataType: 'code',
          description: 'API for accessing ML model predictions',
        }
      },
      {
        id: 'e-qa1-devops1',
        source: 'qa-1',
        target: 'devops-1',
        animated: true,
        label: 'Validated ML System',
        data: {
          label: 'Validated ML System',
          dataType: 'code',
          description: 'Fully tested ML system ready for deployment',
        }
      },
    ]
  },
  {
    id: 'microservice-architecture',
    name: 'Microservice Architecture',
    description: 'A workflow for designing and implementing a microservice-based application architecture.',
    category: 'devops',
    difficulty: 'intermediate',
    estimatedTime: '1-3 weeks',
    tags: ['microservices', 'architecture', 'docker', 'kubernetes'],
    nodes: [
      {
        id: 'ba-1',
        type: 'agent',
        position: { x: 250, y: 50 },
        data: {
          label: 'Architecture Planning',
          type: 'business-analyst',
          description: 'Define the microservice architecture and service boundaries.',
        },
      },
      {
        id: 'dev-1',
        type: 'agent',
        position: { x: 100, y: 200 },
        data: {
          label: 'Service A Development',
          type: 'developer',
          description: 'Develop the first microservice.',
        },
      },
      {
        id: 'dev-2',
        type: 'agent',
        position: { x: 400, y: 200 },
        data: {
          label: 'Service B Development',
          type: 'developer',
          description: 'Develop the second microservice.',
        },
      },
      {
        id: 'dev-3',
        type: 'agent',
        position: { x: 250, y: 350 },
        data: {
          label: 'API Gateway',
          type: 'developer',
          description: 'Develop the API gateway for service discovery and routing.',
        },
      },
      {
        id: 'qa-1',
        type: 'agent',
        position: { x: 250, y: 500 },
        data: {
          label: 'Integration Testing',
          type: 'qa-engineer',
          description: 'Test the interaction between microservices.',
        },
      },
      {
        id: 'devops-1',
        type: 'agent',
        position: { x: 250, y: 650 },
        data: {
          label: 'Container Orchestration',
          type: 'devops',
          description: 'Set up Kubernetes for managing microservices deployment.',
        },
      },
    ],
    edges: [
      {
        id: 'e-ba1-dev1',
        source: 'ba-1',
        target: 'dev-1',
        animated: true,
        label: 'Service A Spec',
        data: {
          label: 'Service A Spec',
          dataType: 'requirements',
          description: 'Requirements for the first microservice',
        }
      },
      {
        id: 'e-ba1-dev2',
        source: 'ba-1',
        target: 'dev-2',
        animated: true,
        label: 'Service B Spec',
        data: {
          label: 'Service B Spec',
          dataType: 'requirements',
          description: 'Requirements for the second microservice',
        }
      },
      {
        id: 'e-ba1-dev3',
        source: 'ba-1',
        target: 'dev-3',
        animated: true,
        label: 'Gateway Spec',
        data: {
          label: 'Gateway Spec',
          dataType: 'requirements',
          description: 'API gateway requirements and routing rules',
        }
      },
      {
        id: 'e-dev1-dev3',
        source: 'dev-1',
        target: 'dev-3',
        animated: true,
        label: 'Service A API',
        data: {
          label: 'Service A API',
          dataType: 'code',
          description: 'API endpoints for Service A',
        }
      },
      {
        id: 'e-dev2-dev3',
        source: 'dev-2',
        target: 'dev-3',
        animated: true,
        label: 'Service B API',
        data: {
          label: 'Service B API',
          dataType: 'code',
          description: 'API endpoints for Service B',
        }
      },
      {
        id: 'e-dev3-qa1',
        source: 'dev-3',
        target: 'qa-1',
        animated: true,
        label: 'Integrated System',
        data: {
          label: 'Integrated System',
          dataType: 'code',
          description: 'Complete microservice system with gateway',
        }
      },
      {
        id: 'e-qa1-devops1',
        source: 'qa-1',
        target: 'devops-1',
        animated: true,
        label: 'Validated System',
        data: {
          label: 'Validated System',
          dataType: 'code',
          description: 'Fully tested microservice architecture',
        }
      },
    ]
  }
];

const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({ onSelectTemplate }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="border-2 border-black brutal-shadow brutal-button"
        >
          📋 Use Template
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full md:max-w-[600px] overflow-y-auto" side="left">
        <SheetHeader>
          <SheetTitle className="text-3xl font-bold font-heading">AI Workflow Templates</SheetTitle>
          <SheetDescription>
            Choose a pre-built workflow template to get started quickly. 
            Templates provide a foundation that you can customize for your specific needs.
          </SheetDescription>
        </SheetHeader>
        
        <Separator className="my-4 border-black" />
        
        <div className="space-y-6 py-4">
          {templates.map((template) => (
            <div 
              key={template.id} 
              className="border-4 border-black p-4 rounded-lg brutal-shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectTemplate(template)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {template.category === 'development' && <RobotAvatar type="developer" size="sm" />}
                  {template.category === 'design' && <RobotAvatar type="product-manager" size="sm" />}
                  {template.category === 'data' && <RobotAvatar type="developer" size="sm" />}
                  {template.category === 'devops' && <RobotAvatar type="devops" size="sm" />}
                  {template.category === 'custom' && <RobotAvatar type="custom" size="sm" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{template.name}</h3>
                  <p className="text-gray-600 mt-1">{template.description}</p>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div>
                      <Badge category={template.category} />
                      <Badge difficulty={template.difficulty} />
                      <span className="inline-block text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded ml-1">
                        ⏱️ {template.estimatedTime}
                      </span>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-xs border-2 border-black brutal-shadow brutal-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate(template);
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="text-xs bg-gray-200 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <SheetFooter>
          <Button variant="outline" className="border-2 border-black">
            Create Custom Template
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

interface BadgeProps {
  category?: 'development' | 'design' | 'data' | 'devops' | 'custom';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

const Badge: React.FC<BadgeProps> = ({ category, difficulty }) => {
  if (category) {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    let label = category;
    
    switch (category) {
      case 'development':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'design':
        bgColor = 'bg-pink-100';
        textColor = 'text-pink-800';
        break;
      case 'data':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'devops':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
    }
    
    return (
      <span className={`inline-block text-xs ${bgColor} ${textColor} px-2 py-1 rounded mr-1`}>
        {label.charAt(0).toUpperCase() + label.slice(1)}
      </span>
    );
  }
  
  if (difficulty) {
    let bgColor = 'bg-green-100';
    let textColor = 'text-green-800';
    
    switch (difficulty) {
      case 'beginner':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'intermediate':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'advanced':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
    }
    
    return (
      <span className={`inline-block text-xs ${bgColor} ${textColor} px-2 py-1 rounded mr-1`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </span>
    );
  }
  
  return null;
};

export default WorkflowTemplates;
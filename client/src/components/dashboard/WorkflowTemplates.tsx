import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";

// Define solution templates with phases and components
const SOLUTION_TEMPLATES = [
  {
    id: "cx-build",
    name: "CX Platform Build",
    description: "End-to-end customer experience platform implementation",
    icon: "ri-customer-service-2-line",
    color: "bg-pink-500",
    phases: [
      {
        name: "Discovery & Design",
        items: ["User Research", "Persona Development", "Journey Mapping", "UX Design", "UI Design"]
      },
      {
        name: "Architecture & Planning",
        items: ["Technical Architecture", "Data Architecture", "Security Design", "Integration Strategy"]
      },
      {
        name: "Development",
        items: ["Frontend Development", "Backend Development", "API Development", "Microservices", "Component Library"]
      },
      {
        name: "Quality Assurance",
        items: ["Functional Testing", "Performance Testing", "Security Testing", "User Acceptance Testing"]
      },
      {
        name: "Deployment & Support",
        items: ["CI/CD Setup", "Monitoring", "Documentation", "Training", "Support Plan"]
      }
    ]
  },
  {
    id: "marketing-automation",
    name: "Marketing Automation",
    description: "Automated marketing workflows and campaigns",
    icon: "ri-mail-send-line",
    color: "bg-purple-500",
    phases: [
      {
        name: "Strategy",
        items: ["Audience Analysis", "Channel Strategy", "Content Strategy", "Campaign Planning"]
      },
      {
        name: "Setup",
        items: ["Platform Configuration", "User Management", "Integration Setup", "Template Design"]
      },
      {
        name: "Campaign Development",
        items: ["Email Campaign", "Social Media", "Landing Pages", "Lead Scoring"]
      },
      {
        name: "Analytics",
        items: ["Tracking Setup", "Dashboard Creation", "A/B Testing", "Reporting"]
      },
      {
        name: "Optimization",
        items: ["Performance Analysis", "Conversion Optimization", "Workflow Refinement"]
      }
    ]
  },
  {
    id: "data-engineering",
    name: "Data Engineering",
    description: "Data pipeline and analytics platform",
    icon: "ri-database-2-line",
    color: "bg-blue-500",
    phases: [
      {
        name: "Data Strategy",
        items: ["Requirements Analysis", "Data Architecture", "Data Governance", "Compliance Planning"]
      },
      {
        name: "Infrastructure",
        items: ["Cloud Setup", "Storage Configuration", "Compute Resources", "Security Implementation"]
      },
      {
        name: "Data Pipeline",
        items: ["ETL Processes", "Data Ingestion", "Data Transformation", "Data Validation"]
      },
      {
        name: "Analytics",
        items: ["Data Warehouse", "BI Tool Integration", "Dashboard Development", "Reporting System"]
      },
      {
        name: "MLOps",
        items: ["Model Development", "Model Deployment", "Monitoring", "Continuous Training"]
      }
    ]
  },
  {
    id: "ai-platform",
    name: "AI Platform",
    description: "End-to-end AI application development",
    icon: "ri-brain-line",
    color: "bg-green-500",
    phases: [
      {
        name: "AI Strategy",
        items: ["Problem Definition", "Data Requirements", "Model Selection", "Success Metrics"]
      },
      {
        name: "Data Preparation",
        items: ["Data Collection", "Data Cleaning", "Feature Engineering", "Data Labeling"]
      },
      {
        name: "Model Development",
        items: ["Model Architecture", "Training Pipeline", "Validation", "Hyperparameter Tuning"]
      },
      {
        name: "Platform Integration",
        items: ["API Development", "UI Integration", "Feedback Loops", "Monitoring Setup"]
      },
      {
        name: "Governance",
        items: ["Ethics Review", "Bias Detection", "Explainability", "Compliance Checks"]
      }
    ]
  },
  {
    id: "devops-transformation",
    name: "DevOps Transformation",
    description: "Modernize development and operations processes",
    icon: "ri-refresh-line",
    color: "bg-orange-500",
    phases: [
      {
        name: "Assessment",
        items: ["Current State Analysis", "Capability Assessment", "Tool Evaluation", "Process Mapping"]
      },
      {
        name: "Strategy",
        items: ["Transformation Roadmap", "Team Structure", "Technology Selection", "Success Metrics"]
      },
      {
        name: "Implementation",
        items: ["CI/CD Pipeline", "Infrastructure as Code", "Monitoring", "Security Integration"]
      },
      {
        name: "Culture",
        items: ["Training", "Knowledge Sharing", "Cross-team Collaboration", "Feedback Loops"]
      },
      {
        name: "Optimization",
        items: ["Performance Metrics", "Process Refinement", "Automation Expansion", "Continuous Improvement"]
      }
    ]
  }
];

// Define workflow templates
const WORKFLOW_TEMPLATES = [
  {
    id: "agile-development",
    name: "Agile Development",
    description: "Sprint-based development process with regular deliverables",
    icon: "ri-speed-up-line",
    color: "bg-blue-500"
  },
  {
    id: "design-thinking",
    name: "Design Thinking",
    description: "Human-centered approach to problem solving and innovation",
    icon: "ri-lightbulb-line",
    color: "bg-yellow-500"
  },
  {
    id: "mlops",
    name: "MLOps Pipeline",
    description: "Operationalize machine learning models with continuous delivery",
    icon: "ri-robot-line",
    color: "bg-purple-500"
  },
  {
    id: "microservices",
    name: "Microservices Architecture",
    description: "Deploy and manage a distributed system of microservices",
    icon: "ri-layout-grid-line",
    color: "bg-green-500"
  },
  {
    id: "content-production",
    name: "Content Production",
    description: "Streamlined workflow for digital content creation and publishing",
    icon: "ri-film-line",
    color: "bg-red-500"
  },
  {
    id: "data-analytics",
    name: "Data Analytics",
    description: "End-to-end data analysis from collection to visualization",
    icon: "ri-bar-chart-box-line",
    color: "bg-cyan-500"
  }
];

interface WorkflowTemplatesProps {
  onClose?: () => void;
}

const WorkflowTemplates = ({ onClose }: WorkflowTemplatesProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("solutions");

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="w-full bg-white border-4 border-black brutal-shadow p-4 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <i className="ri-file-list-3-line text-3xl text-primary"></i>
          </div>
          <h3 className="font-heading font-bold text-xl">Solution Templates</h3>
          <p className="text-gray-600 text-center">Start with industry-standard templates for faster results</p>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto border-4 border-black brutal-shadow">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Solution & Workflow Templates</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="solutions" className="text-lg">Solution Templates</TabsTrigger>
            <TabsTrigger value="workflows" className="text-lg">Workflow Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="solutions" className="space-y-6">
            <p className="text-gray-600">
              Choose a complete solution template with pre-defined phases and components to jumpstart your project:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SOLUTION_TEMPLATES.map((template) => (
                <Card key={template.id} className="border-2 border-black p-4 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 ${template.color} flex items-center justify-center rounded`}>
                      <i className={`${template.icon} text-white`}></i>
                    </div>
                    <h3 className="font-bold text-lg">{template.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                  
                  <Accordion type="single" collapsible className="w-full mt-auto">
                    <AccordionItem value="phases">
                      <AccordionTrigger className="text-sm font-bold">
                        View Phases & Components
                      </AccordionTrigger>
                      <AccordionContent>
                        {template.phases.map((phase, idx) => (
                          <div key={idx} className="mb-3">
                            <Label className="text-xs font-bold">{phase.name}</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {phase.items.map((item, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <div className="mt-4 flex justify-end">
                    <Link href={`/template/${template.id}`}>
                      <button className="bg-accent text-white px-3 py-1 text-sm border-2 border-black brutal-button">
                        Use Template
                      </button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="workflows" className="space-y-6">
            <p className="text-gray-600">
              Select a workflow methodology to structure your development process:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {WORKFLOW_TEMPLATES.map((workflow) => (
                <Card key={workflow.id} className="border-2 border-black p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 ${workflow.color} flex items-center justify-center rounded`}>
                      <i className={`${workflow.icon} text-white`}></i>
                    </div>
                    <h3 className="font-bold">{workflow.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{workflow.description}</p>
                  <div className="flex justify-end">
                    <Link href={`/workflow/${workflow.id}`}>
                      <button className="bg-accent text-white px-3 py-1 text-sm border-2 border-black brutal-button">
                        Apply Workflow
                      </button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-6">
          <button
            className="bg-white font-bold py-2 px-4 border-2 border-black brutal-button"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowTemplates;
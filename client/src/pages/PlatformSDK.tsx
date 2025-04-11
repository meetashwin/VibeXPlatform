import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const PlatformSDK = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("models");

  // Local models data
  const localModels = [
    {
      id: "local-llama3",
      name: "Llama 3",
      description: "High-performance local LLM with strong reasoning capabilities",
      size: "8B",
      category: "text",
      tags: ["reasoning", "instruction", "code"],
      installed: true
    },
    {
      id: "local-codeollamainstruct",
      name: "CodeOllama Instruct",
      description: "Specialized model for code generation and understanding",
      size: "7B",
      category: "code",
      tags: ["code", "completion", "debugging"],
      installed: true
    },
    {
      id: "local-stable-code",
      name: "Stable Code",
      description: "Efficient model for code completion and generation",
      size: "3B",
      category: "code",
      tags: ["fast", "efficient", "completion"],
      installed: false
    },
    {
      id: "local-mistral",
      name: "Mistral",
      description: "Balanced model for general text generation tasks",
      size: "7B",
      category: "text",
      tags: ["instruction", "balanced", "versatile"],
      installed: false
    }
  ];

  // Agent templates
  const agentTemplates = [
    {
      id: "template-code-assistant",
      name: "Code Assistant",
      description: "Helps with code generation, debugging, and refactoring",
      models: ["local-llama3", "local-codeollamainstruct"],
      category: "development",
      author: "VibeX Team"
    },
    {
      id: "template-requirements-analyzer",
      name: "Requirements Analyzer",
      description: "Extracts and prioritizes requirements from project documents",
      models: ["local-llama3"],
      category: "planning",
      author: "VibeX Team"
    },
    {
      id: "template-test-generator",
      name: "Test Generator",
      description: "Creates test cases based on code and requirements",
      models: ["local-codeollamainstruct"],
      category: "testing",
      author: "Community"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 border-4 border-black brutal-shadow">
        <h1 className="text-3xl font-bold font-heading">VibeX Platform SDK</h1>
        <p className="text-gray-600 mt-2">
          Build intelligent agents with local, secure AI models tailored for development workflows
        </p>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <Button className="bg-black text-white border-2 border-black brutal-shadow brutal-button">
            Get Started
          </Button>
          <Button variant="outline" className="border-2 border-black brutal-shadow brutal-button" asChild>
            <a href="https://github.com/vibex/sdk" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </Button>
          <Button variant="outline" className="border-2 border-black brutal-shadow brutal-button text-blue-600" asChild>
            <Link href="/playground">
              VibeX Playground
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="models" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 border-2 border-black">
          <TabsTrigger value="models" className="data-[state=active]:bg-black data-[state=active]:text-white">
            Local Models
          </TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-black data-[state=active]:text-white">
            Agent Templates
          </TabsTrigger>
          <TabsTrigger value="docs" className="data-[state=active]:bg-black data-[state=active]:text-white">
            Documentation
          </TabsTrigger>
        </TabsList>
        
        {/* Local Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-heading">Local Secure Intelligent Models</h2>
            <div className="flex gap-2">
              <Input 
                placeholder="Search models..." 
                className="border-2 border-black"
              />
              <Button variant="outline" className="border-2 border-black brutal-shadow brutal-button">
                Filter
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localModels.map(model => (
              <Card key={model.id} className="border-4 border-black brutal-shadow overflow-hidden">
                <CardHeader className={model.category === "code" ? "bg-blue-100" : "bg-amber-100"}>
                  <div className="flex justify-between items-start">
                    <CardTitle className="font-heading">{model.name}</CardTitle>
                    <Badge className={model.installed ? "bg-green-600" : "bg-gray-600"}>
                      {model.installed ? "Installed" : "Available"}
                    </Badge>
                  </div>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex gap-2 mb-4">
                    {model.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="border-2 border-black">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Size: {model.size}</span>
                    <span className="font-medium">Category: {model.category}</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t-2 border-black flex justify-between">
                  <Button variant="outline" className="border-2 border-black brutal-shadow brutal-button">
                    Details
                  </Button>
                  {model.installed ? (
                    <Button className="bg-black text-white border-2 border-black brutal-shadow brutal-button">
                      Use Model
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        toast({
                          title: "Download Started",
                          description: `Downloading ${model.name}. This may take a few minutes.`
                        });
                      }}
                      className="bg-blue-600 text-white border-2 border-black brutal-shadow brutal-button"
                    >
                      Download
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Agent Templates Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-heading">Agent Templates</h2>
            <Button className="bg-black text-white border-2 border-black brutal-shadow brutal-button">
              + Create Custom Agent
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentTemplates.map(template => (
              <Card key={template.id} className="border-4 border-black brutal-shadow overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="font-heading">{template.name}</CardTitle>
                    <Badge>{template.category}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Required Models:</h4>
                  <div className="flex gap-2 mb-4">
                    {template.models.map(modelId => {
                      const model = localModels.find(m => m.id === modelId);
                      return (
                        <Badge 
                          key={modelId} 
                          variant="outline" 
                          className={`border-2 ${model?.installed ? 'border-green-600' : 'border-red-600'}`}
                        >
                          {model?.name || modelId}
                        </Badge>
                      );
                    })}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Author: {template.author}</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t-2 border-black flex justify-between">
                  <Button variant="outline" className="border-2 border-black brutal-shadow brutal-button">
                    View Details
                  </Button>
                  <Button 
                    className="bg-black text-white border-2 border-black brutal-shadow brutal-button"
                    onClick={() => {
                      // Check if all required models are installed
                      const allModelsInstalled = template.models.every(
                        modelId => localModels.find(m => m.id === modelId)?.installed
                      );
                      
                      if (allModelsInstalled) {
                        toast({
                          title: "Agent Added",
                          description: `${template.name} has been added to your workflow.`
                        });
                      } else {
                        toast({
                          title: "Missing Models",
                          description: "Please install all required models first.",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    Add to Workflow
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-4">
          <div className="bg-white p-6 border-4 border-black brutal-shadow">
            <h2 className="text-2xl font-bold font-heading mb-4">Platform SDK Documentation</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Quick Start</h3>
                <p className="mb-4">Get started with the VibeX Platform SDK to build powerful AI-enabled agent workflows.</p>
                <div className="bg-gray-100 p-4 border-2 border-black font-mono text-sm mb-4">
                  # Install the SDK<br/>
                  npm install @vibex/sdk<br/><br/>
                  
                  # Initialize a new agent<br/>
                  npx vibex init my-custom-agent
                </div>
              </div>
              
              <Separator className="border-black" />
              
              <div>
                <h3 className="text-xl font-bold mb-2">Working with Local Models</h3>
                <p className="mb-4">VibeX prioritizes privacy and performance by using local models that run entirely on your machine.</p>
                <div className="space-y-2">
                  <div className="bg-amber-50 p-4 border-2 border-black">
                    <h4 className="font-bold">Securing Your AI Workflows</h4>
                    <p>All VibeX models run locally, ensuring your code and sensitive data never leave your machine. This is ideal for enterprise environments with strict data privacy requirements.</p>
                  </div>
                  <div className="bg-blue-50 p-4 border-2 border-black">
                    <h4 className="font-bold">Performance Optimization</h4>
                    <p>Our models are optimized for development tasks, with specialized versions for code completion, refactoring, and documentation generation that outperform generic models in these domains.</p>
                  </div>
                </div>
              </div>
              
              <Separator className="border-black" />
              
              <div>
                <h3 className="text-xl font-bold mb-2">Try it in the Playground</h3>
                <p className="mb-4">Test different models and configurations in the VibeX Playground before integrating them into your workflows.</p>
                <Button variant="outline" className="border-2 border-black brutal-shadow brutal-button text-blue-600" asChild>
                  <Link href="/playground">
                    Open VibeX Playground
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformSDK;
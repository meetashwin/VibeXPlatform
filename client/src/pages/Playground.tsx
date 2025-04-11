import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Playground = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("local-llama3");

  const models = [
    { id: "local-llama3", name: "Llama 3 (8B)", category: "general" },
    { id: "local-codeollamainstruct", name: "CodeOllama Instruct", category: "code" },
    { id: "local-mistral", name: "Mistral (7B)", category: "general" },
    { id: "local-stable-code", name: "Stable Code (3B)", category: "code" }
  ];

  const handleSubmit = () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to continue",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call to local model
    setTimeout(() => {
      const model = models.find(m => m.id === selectedModel);
      
      let simulatedResponse = "";
      if (model?.category === "code") {
        simulatedResponse = `\`\`\`javascript
// Here's the code you requested
function calculateTotal(items) {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

// Example usage
const cart = [
  { name: 'Product 1', price: 10, quantity: 2 },
  { name: 'Product 2', price: 15, quantity: 1 }
];

const total = calculateTotal(cart);
console.log(\`Total: $\${total}\`);
\`\`\`

This implementation creates a function that takes an array of items, each with price and quantity properties, and calculates the total cost by multiplying each item's price by its quantity and then summing those values.`;
      } else {
        simulatedResponse = `As a local secure model running entirely on your machine, I can help with your request while ensuring your data never leaves your system. This is particularly valuable for sensitive work environments and proprietary code.

Local AI models like me offer several advantages:

1. Privacy: All processing happens on your device, with no data sent to external servers
2. Security: Reduced risk of data breaches or unauthorized access
3. Reliability: Works even without internet connection
4. Cost-effectiveness: No usage-based billing or API costs
5. Customization: Can be fine-tuned for specific domains and workflows

For development workflows specifically, local models can be optimized for programming languages, frameworks, and coding patterns relevant to your projects.`;
      }

      setResponse(simulatedResponse);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 border-4 border-black brutal-shadow">
        <h1 className="text-3xl font-bold font-heading">VibeX Playground</h1>
        <p className="text-gray-600 mt-2">
          Test and experiment with local secure AI models
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-16rem)]">
        {/* Model selection sidebar */}
        <Card className="lg:col-span-1 border-4 border-black brutal-shadow">
          <CardHeader>
            <CardTitle className="font-heading">Select Model</CardTitle>
            <CardDescription>Choose a model to test</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-3 border-2 border-black w-full">
                <TabsTrigger value="all" className="data-[state=active]:bg-black data-[state=active]:text-white">All</TabsTrigger>
                <TabsTrigger value="general" className="data-[state=active]:bg-black data-[state=active]:text-white">General</TabsTrigger>
                <TabsTrigger value="code" className="data-[state=active]:bg-black data-[state=active]:text-white">Code</TabsTrigger>
              </TabsList>
              <div className="mt-4 space-y-3">
                {models.map(model => (
                  <div 
                    key={model.id}
                    className={`p-3 border-2 border-black cursor-pointer transition-all hover:bg-gray-100 ${
                      selectedModel === model.id ? 'bg-black text-white' : 'bg-white'
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="font-medium">{model.name}</div>
                    <div className={`text-xs ${selectedModel === model.id ? 'text-gray-300' : 'text-gray-500'}`}>
                      {model.category === 'code' ? 'Optimized for code' : 'General purpose'}
                    </div>
                  </div>
                ))}
              </div>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t-2 border-black pt-4">
            <div className="w-full">
              <h3 className="text-sm font-medium mb-2">Model Parameters</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs block mb-1">Temperature</label>
                  <Select defaultValue="0.7">
                    <SelectTrigger className="border-2 border-black">
                      <SelectValue placeholder="Temperature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.1">0.1 (Precise)</SelectItem>
                      <SelectItem value="0.5">0.5 (Balanced)</SelectItem>
                      <SelectItem value="0.7">0.7 (Default)</SelectItem>
                      <SelectItem value="1.0">1.0 (Creative)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs block mb-1">Max Tokens</label>
                  <Select defaultValue="2048">
                    <SelectTrigger className="border-2 border-black">
                      <SelectValue placeholder="Max Tokens" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024">1024</SelectItem>
                      <SelectItem value="2048">2048</SelectItem>
                      <SelectItem value="4096">4096</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button 
              className="w-full bg-black text-white border-2 border-black brutal-shadow brutal-button mt-4"
              onClick={() => toast({
                title: "Model Settings Saved",
                description: "Your preferences have been applied"
              })}
            >
              Apply Settings
            </Button>
          </CardFooter>
        </Card>

        {/* Input/Output area */}
        <Card className="lg:col-span-3 border-4 border-black brutal-shadow flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-heading">Test Prompt</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="border-2 border-black brutal-shadow brutal-button"
                  onClick={() => {
                    setPrompt("");
                    setResponse("");
                  }}
                >
                  Clear
                </Button>
                <Button 
                  className="bg-black text-white border-2 border-black brutal-shadow brutal-button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "Generating..." : "Run"}
                </Button>
              </div>
            </div>
            <CardDescription>
              Enter your prompt and test how the selected model responds
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col h-full">
            <div className="flex flex-col h-full gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Input</label>
                <Textarea 
                  placeholder="Enter your prompt here..."
                  className="min-h-[150px] flex-1 border-2 border-black h-full"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <Separator className="border-black" />
              
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Output</label>
                <div 
                  className={`border-2 border-black p-3 rounded-md overflow-auto bg-gray-50 min-h-[200px] h-full ${
                    isLoading ? 'opacity-50' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-pulse">Generating response...</div>
                    </div>
                  ) : response ? (
                    <div className="prose max-w-none">
                      {response.split("```").map((part, index) => {
                        if (index % 2 === 0) {
                          return <div key={index}>{part}</div>;
                        } else {
                          const [language, ...codeParts] = part.split("\n");
                          const code = codeParts.join("\n");
                          return (
                            <div key={index} className="bg-gray-800 text-white p-3 rounded my-2 font-mono text-sm overflow-x-auto">
                              {code}
                            </div>
                          );
                        }
                      })}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic">
                      Response will appear here...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t-2 border-black pt-4">
            <div className="w-full flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Using <span className="font-medium">{models.find(m => m.id === selectedModel)?.name}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="border-2 border-black brutal-shadow brutal-button"
                  onClick={() => {
                    toast({
                      title: "Response Copied",
                      description: "The model's response has been copied to clipboard"
                    });
                  }}
                  disabled={!response}
                >
                  Copy Response
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 border-black brutal-shadow brutal-button"
                  onClick={() => {
                    toast({
                      title: "Prompt Saved",
                      description: "Your prompt has been saved to your library"
                    });
                  }}
                  disabled={!prompt}
                >
                  Save Prompt
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Playground;
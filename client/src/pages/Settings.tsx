import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { apiRequest } from "@/lib/queryClient";

const Settings = () => {
  const { user, updateUser } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [apiKey, setApiKey] = useState("");
  const [darkMode, setDarkMode] = useState(user?.preferences?.darkMode || false);
  const [notifications, setNotifications] = useState(user?.preferences?.notifications || false);
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const response = await apiRequest("PUT", "/api/users/profile", {
        name,
        email
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const response = await apiRequest("PUT", "/api/users/preferences", {
        darkMode,
        notifications
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        toast({
          title: "Success",
          description: "Preferences updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveAPIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "API key cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiRequest("PUT", "/api/users/api-key", {
        apiKey
      });
      
      if (response.ok) {
        setApiKey("");
        toast({
          title: "Success",
          description: "API key updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold">Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white border-4 border-black p-6 brutal-shadow mb-8">
            <h2 className="font-heading text-2xl font-bold mb-4">Profile Settings</h2>
            
            <form onSubmit={handleSaveProfile}>
              <div className="mb-4">
                <label className="block font-bold mb-2">Name</label>
                <input 
                  type="text" 
                  className="w-full border-2 border-black p-3" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block font-bold mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full border-2 border-black p-3" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className={`bg-accent text-white font-bold py-2 px-6 border-2 border-black brutal-shadow brutal-button ${isLoading ? 'opacity-50' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span>
                    Saving...
                  </span>
                ) : (
                  "Save Profile"
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-white border-4 border-black p-6 brutal-shadow">
            <h2 className="font-heading text-2xl font-bold mb-4">AI Integration</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const selectedProvider = document.querySelector('input[name="ai-provider"]:checked') as HTMLInputElement;
              const selectedModel = (document.getElementById('ai-model') as HTMLSelectElement).value;
              const ollamaEndpoint = (document.getElementById('ollama-endpoint') as HTMLInputElement).value;
              
              if (selectedProvider) {
                setIsLoading(true);
                
                // Create preferences object based on selection
                const aiPreferences = {
                  aiProvider: selectedProvider.value as "openai" | "ollama" | "none",
                  aiModel: selectedModel,
                  ollamaEndpoint: ollamaEndpoint
                };
                
                // Update preferences
                apiRequest("PUT", "/api/users/preferences", aiPreferences)
                  .then(async (response) => {
                    if (response.ok) {
                      const updatedUser = await response.json();
                      updateUser(updatedUser);
                      toast({
                        title: "Success",
                        description: "AI settings updated successfully",
                      });
                      
                      // If user selected OpenAI and has provided an API key, save it too
                      if (aiPreferences.aiProvider === "openai" && apiKey) {
                        return apiRequest("PUT", "/api/users/api-key", { apiKey });
                      }
                    }
                  })
                  .catch(error => {
                    toast({
                      title: "Error",
                      description: "Failed to update AI settings",
                      variant: "destructive",
                    });
                  })
                  .finally(() => {
                    setIsLoading(false);
                  });
              }
            }}>
              <div className="space-y-6">
                <div className="border-2 border-black p-4">
                  <h3 className="font-bold mb-3">AI Provider</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="ai-provider" 
                        value="none" 
                        className="w-4 h-4 border-2 border-black" 
                        defaultChecked={user?.preferences?.aiProvider === "none" || !user?.preferences?.aiProvider} 
                      />
                      <span>No AI Assistance</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="ai-provider" 
                        value="ollama" 
                        className="w-4 h-4 border-2 border-black" 
                        defaultChecked={user?.preferences?.aiProvider === "ollama"}
                      />
                      <span>Ollama (Local Models)</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="ai-provider" 
                        value="openai" 
                        className="w-4 h-4 border-2 border-black" 
                        defaultChecked={user?.preferences?.aiProvider === "openai"}
                      />
                      <span>OpenAI</span>
                    </label>
                  </div>
                </div>
                
                <div className="border-2 border-black p-4">
                  <h3 className="font-bold mb-3">Model Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-1">Model</label>
                      <select 
                        id="ai-model"
                        className="w-full border-2 border-black p-3" 
                        defaultValue={user?.preferences?.aiModel || "deepseek-coder"}
                      >
                        <optgroup label="Ollama Models (Code-Optimized)">
                          <option value="deepseek-coder">Deepseek Coder</option>
                          <option value="codellama">Code Llama</option>
                          <option value="codellama:7b">Code Llama (7B)</option>
                          <option value="phi3:mini">Phi-3 Mini</option>
                          <option value="phi3">Phi-3</option>
                          <option value="qwen:14b">Qwen (14B)</option>
                          <option value="qwen:7b">Qwen (7B)</option>
                          <option value="wizard-coder">Wizard Coder</option>
                        </optgroup>
                        <optgroup label="Ollama Models (General)">
                          <option value="llama3">Llama 3 (8B)</option>
                          <option value="llama3:70b">Llama 3 (70B)</option>
                          <option value="mistral">Mistral</option>
                          <option value="mixtral">Mixtral</option>
                        </optgroup>
                        <optgroup label="OpenAI Models">
                          <option value="gpt-4o">GPT-4o</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </optgroup>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-1">Ollama Endpoint URL</label>
                      <input 
                        id="ollama-endpoint"
                        type="text" 
                        className="w-full border-2 border-black p-3" 
                        placeholder="http://localhost:11434"
                        defaultValue={user?.preferences?.ollamaEndpoint || "http://localhost:11434"}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the URL where your Ollama server is running
                      </p>
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-1">OpenAI API Key</label>
                      <input 
                        type="password" 
                        className="w-full border-2 border-black p-3" 
                        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Required only if using OpenAI models
                      </p>
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className={`w-full bg-primary text-black font-bold py-3 px-6 border-2 border-black brutal-shadow brutal-button ${isLoading ? 'opacity-50' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-black rounded-full border-t-transparent"></span>
                      Saving AI Settings...
                    </span>
                  ) : (
                    "Save AI Settings"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div>
          <div className="bg-white border-4 border-black p-6 brutal-shadow mb-8">
            <h2 className="font-heading text-2xl font-bold mb-4">App Preferences</h2>
            
            <form onSubmit={handleSavePreferences}>
              <div className="mb-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 border-2 border-black" 
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                  <span className="ml-2">Dark Mode</span>
                </label>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 border-2 border-black" 
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  <span className="ml-2">Enable Notifications</span>
                </label>
              </div>
              
              <button 
                type="submit" 
                className={`bg-black text-white font-bold py-2 px-6 border-2 border-black brutal-shadow brutal-button ${isLoading ? 'opacity-50' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span>
                    Saving...
                  </span>
                ) : (
                  "Save Preferences"
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-white border-4 border-black p-6 brutal-shadow mb-8">
            <h2 className="font-heading text-xl font-bold mb-4">Account Info</h2>
            
            <div className="space-y-4">
              <div>
                <div className="font-medium text-gray-600">Account Type</div>
                <div className="font-bold">Professional</div>
              </div>
              
              <div>
                <div className="font-medium text-gray-600">Member Since</div>
                <div className="font-bold">June 2023</div>
              </div>
              
              <div>
                <div className="font-medium text-gray-600">Projects</div>
                <div className="font-bold">12 Active</div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t-2 border-dashed border-black">
              <button className="w-full bg-white text-red-500 font-bold py-2 border-2 border-red-500 brutal-shadow brutal-button">
                Delete Account
              </button>
            </div>
          </div>
          
          {/* No download app section - removed */}
        </div>
      </div>
    </>
  );
};

export default Settings;

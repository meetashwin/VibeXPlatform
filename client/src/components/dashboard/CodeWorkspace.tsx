import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CodeFile, AiSuggestion } from "@/lib/types";

const CodeWorkspace = () => {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch code files
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/code-samples");
        if (res.ok) {
          const data = await res.json();
          setFiles(data);
          if (data.length > 0) {
            setActiveFile(data[0].id);
            setCode(data[0].content);
            // Fetch suggestions for the active file
            fetchSuggestions(data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load code files:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const fetchSuggestions = async (fileId: string) => {
    try {
      const res = await fetch(`/api/code-suggestions/${fileId}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    }
  };

  const handleFileChange = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setActiveFile(fileId);
      setCode(file.content);
      fetchSuggestions(fileId);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleSave = async () => {
    if (!activeFile) return;
    
    try {
      const response = await apiRequest("PUT", `/api/code-samples/${activeFile}`, {
        content: code
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Code saved successfully",
        });
        
        // Update the file in state
        setFiles(files.map(file => 
          file.id === activeFile ? { ...file, content: code } : file
        ));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save code",
        variant: "destructive",
      });
    }
  };

  const handleRun = () => {
    toast({
      title: "Running code",
      description: "This is a simulated run (would execute in production)",
    });
  };

  const applySuggestions = () => {
    // Simple implementation - in a real app, this would apply the suggestions to the code
    toast({
      title: "Applied suggestions",
      description: "All AI suggestions have been applied to your code",
    });
    
    // Simulate applying suggestions by clearing them
    setSuggestions([]);
  };

  // Syntax highlighting function (very simplified)
  const highlightCode = (code: string) => {
    const jsKeywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from'];
    let highlightedCode = code;
    
    // Highlight keywords
    jsKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlightedCode = highlightedCode.replace(regex, `<span class="text-purple-600">${keyword}</span>`);
    });
    
    // Highlight strings
    highlightedCode = highlightedCode.replace(/'([^']*)'/g, '<span class="text-orange-600">\'$1\'</span>');
    highlightedCode = highlightedCode.replace(/"([^"]*)"/g, '<span class="text-orange-600">"$1"</span>');
    
    // Highlight comments
    highlightedCode = highlightedCode.replace(/\/\/(.*)/g, '<span class="text-green-600">// $1</span>');
    
    // Highlight function names
    highlightedCode = highlightedCode.replace(/function\s+([a-zA-Z0-9_]+)/g, 'function <span class="text-blue-600">$1</span>');
    
    return highlightedCode;
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-2xl font-bold">Code Workspace</h2>
        <div className="flex gap-2">
          <button 
            className="bg-black text-white px-3 py-1 border-2 border-black brutal-shadow brutal-button text-sm"
            onClick={handleRun}
          >
            <i className="ri-play-fill mr-1"></i> Run
          </button>
          <button 
            className="bg-white px-3 py-1 border-2 border-black brutal-shadow brutal-button text-sm"
            onClick={handleSave}
          >
            <i className="ri-save-line mr-1"></i> Save
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-[350px] bg-white border-4 border-black brutal-shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-4 border-black brutal-shadow-lg">
          <div className="border-b-4 border-black px-4 py-2 flex gap-4 overflow-x-auto">
            {files.map(file => (
              <button 
                key={file.id}
                className={`font-medium px-4 py-1 ${activeFile === file.id ? 'border-b-2 border-primary' : 'text-gray-500'}`}
                onClick={() => handleFileChange(file.id)}
              >
                {file.name}
              </button>
            ))}
          </div>
          
          <div className="flex">
            <div className="code-editor font-mono text-sm p-4 h-[300px] overflow-auto flex-1 relative">
              <textarea
                value={code}
                onChange={handleCodeChange}
                className="absolute inset-0 h-full w-full opacity-0 z-10 p-4 font-mono text-sm resize-none"
              />
              <pre dangerouslySetInnerHTML={{ __html: highlightCode(code) }}></pre>
            </div>
            
            <div className="w-64 border-l-4 border-black p-4 font-mono text-sm flex flex-col">
              <h3 className="font-heading font-bold">AI Suggestions</h3>
              
              {suggestions.length === 0 ? (
                <div className="mt-3 text-xs text-gray-500">No suggestions available for this file.</div>
              ) : (
                <>
                  {suggestions.map((suggestion, i) => (
                    <div key={i} className={`mt-3 p-2 border-l-2 ${suggestion.type === 'improvement' ? 'border-accent' : 'border-warning'}`}>
                      <div className={`text-xs font-bold ${suggestion.type === 'improvement' ? 'text-accent' : 'text-warning'}`}>
                        {suggestion.line ? `Line ${suggestion.line}` : suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                      </div>
                      <p className="text-xs mt-1">{suggestion.description}</p>
                    </div>
                  ))}
                  
                  <button 
                    className="mt-auto bg-accent text-white px-3 py-2 border-2 border-black brutal-shadow brutal-button text-sm w-full"
                    onClick={applySuggestions}
                  >
                    Apply All Suggestions
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeWorkspace;

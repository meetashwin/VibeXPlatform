import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const Documentation = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/documents");
        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
        }
      } catch (error) {
        console.error("Failed to load documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const generateNewDocumentation = async () => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/documents/generate", {});
      
      if (response.ok) {
        const newDoc = await response.json();
        setDocuments([newDoc, ...documents]);
        toast({
          title: "Success",
          description: "New documentation generated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate documentation",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getDocumentLabel = (doc: Document) => {
    if (doc.isAiGenerated) {
      return { text: "AI-GENERATED", class: "bg-accent text-white" };
    }
    if (doc.isUpdated) {
      return { text: "UPDATED", class: "bg-secondary text-black" };
    }
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-2xl font-bold">Documentation</h2>
      </div>
      
      <div className="bg-white border-4 border-black p-4 brutal-shadow">
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No documentation available</div>
            ) : (
              documents.map((doc) => {
                const label = getDocumentLabel(doc);
                return (
                  <div key={doc.id} className="p-3 border-2 border-black">
                    <div className="flex justify-between">
                      <h3 className="font-bold">{doc.title}</h3>
                      {label && (
                        <span className={`text-xs ${label.class} px-2 py-1`}>{label.text}</span>
                      )}
                    </div>
                    <p className="text-sm mt-1">{doc.description}</p>
                  </div>
                );
              })
            )}
          </div>
        )}
        
        <button 
          className={`w-full mt-4 bg-white font-bold py-2 border-2 border-black brutal-shadow brutal-button flex items-center justify-center gap-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={generateNewDocumentation}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-black rounded-full border-t-transparent"></span>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <i className="ri-add-line"></i>
              <span>Generate New Documentation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Documentation;

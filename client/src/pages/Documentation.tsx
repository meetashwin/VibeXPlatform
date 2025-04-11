import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { FileText, Book, Server, CodeIcon, Lightbulb, BookOpen, PlusCircle } from "lucide-react";

// Type-safe helper function for extracting unique categories
function getUniqueCategories(docs: Document[]): string[] {
  const categorySet = new Set<string>();
  docs.forEach(doc => {
    if (doc.category) {
      categorySet.add(doc.category);
    }
  });
  return ["all", ...Array.from(categorySet)];
}

const Documentation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [showFeaturedDocs, setShowFeaturedDocs] = useState(true);
  const { toast } = useToast();

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // Get unique categories from documents
  const categories = getUniqueCategories(documents);

  // Filter documents based on search and category
  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Featured document categories with icons
  const featuredCategories = [
    { id: "Whitepaper", name: "Platform Whitepapers", icon: <FileText className="w-6 h-6" />, description: "Vision, philosophy, and roadmap for VibeX" },
    { id: "AI", name: "AI & Agents", icon: <Lightbulb className="w-6 h-6" />, description: "AI model fundamentals and agent concepts" },
    { id: "Developer", name: "Agent Development", icon: <CodeIcon className="w-6 h-6" />, description: "Building custom AI agents for the platform" },
    { id: "API", name: "API Documentation", icon: <Book className="w-6 h-6" />, description: "Platform API integration guides" },
    { id: "Database", name: "Database Guides", icon: <Server className="w-6 h-6" />, description: "Database schemas and integration" },
    { id: "Frontend", name: "Component Library", icon: <BookOpen className="w-6 h-6" />, description: "UI component documentation" }
  ];

  useEffect(() => {
    // Set the first document as active when documents load or filter changes
    if (filteredDocuments.length > 0 && !activeDoc) {
      setActiveDoc(filteredDocuments[0]);
    }
  }, [filteredDocuments, activeDoc]);

  useEffect(() => {
    // Hide featured docs when searching or filtering
    if (searchTerm || selectedCategory !== "all") {
      setShowFeaturedDocs(false);
    } else {
      setShowFeaturedDocs(true);
    }
  }, [searchTerm, selectedCategory]);

  const handleDocumentClick = (doc: Document) => {
    setActiveDoc(doc);
  };

  const handleFeaturedCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowFeaturedDocs(false);
    
    // Find the first document in this category and set it as active
    const firstDocInCategory = documents.find((doc: Document) => doc.category === categoryId);
    if (firstDocInCategory) {
      setActiveDoc(firstDocInCategory);
    }
  };

  const generateNewDocumentation = async (docType?: string) => {
    try {
      const response = await apiRequest("POST", "/api/documents/generate", { 
        documentType: docType || null 
      });
      
      if (response.ok) {
        const newDoc = await response.json();
        toast({
          title: "Success",
          description: "New documentation generated successfully",
        });
        // Refresh documents query
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
        window.location.reload(); // Simple way to refresh the data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate documentation",
        variant: "destructive",
      });
    }
  };

  const getDocLabelClass = (doc: Document) => {
    if (doc.isAiGenerated) {
      return "bg-accent text-white";
    }
    if (doc.isUpdated) {
      return "bg-secondary text-black";
    }
    return "bg-gray-200";
  };

  const getDocLabelText = (doc: Document) => {
    if (doc.isAiGenerated) {
      return "AI-GENERATED";
    }
    if (doc.isUpdated) {
      return "UPDATED";
    }
    return "";
  };

  // Get icon for document category
  const getCategoryIcon = (category: string) => {
    const found = featuredCategories.find(cat => cat.id === category);
    if (found) return found.icon;
    return <FileText className="w-6 h-6" />;
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="font-heading text-3xl md:text-4xl font-bold">VibeX Documentation</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full border-2 border-black p-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map((category, index) => (
              <button 
                key={index}
                className={`px-3 py-2 border-2 border-black ${selectedCategory === category ? 'bg-black text-white' : 'bg-white'} brutal-button`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-[40vh]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      ) : showFeaturedDocs ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {featuredCategories.map((category) => (
              <div 
                key={category.id}
                className="bg-white border-2 border-black brutal-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] transition-all duration-200 cursor-pointer"
                onClick={() => handleFeaturedCategoryClick(category.id)}
              >
                <div className="border-b-2 border-black p-4 flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-md">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-lg">{category.name}</h3>
                </div>
                <div className="p-4">
                  <p className="text-gray-700">{category.description}</p>
                  <div className="mt-4 flex justify-end">
                    <span className="text-accent font-medium flex items-center gap-1">
                      View docs <span className="ml-1">→</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 mb-4">
            <h2 className="font-heading text-2xl font-bold border-b-2 border-black pb-2">Recently Updated</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.slice(0, 4).map((doc: Document) => (
              <div 
                key={doc.id}
                className="p-4 border-2 border-black brutal-shadow cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000000] transition-all duration-200 bg-white"
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="flex items-center gap-3 mb-2">
                  {getCategoryIcon(doc.category)}
                  <div>
                    <h3 className="font-bold text-lg">{doc.title}</h3>
                    <div className="flex items-center">
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">{doc.category}</span>
                      {doc.isAiGenerated && (
                        <span className="text-xs bg-accent text-white px-2 py-1 rounded ml-2">AI-GENERATED</span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{doc.description}</p>
                <div className="text-xs text-gray-500 mt-2 text-right">
                  Updated {formatDate(doc.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white border-4 border-black p-8 brutal-shadow text-center">
          <h3 className="font-heading font-bold text-xl mb-2">No Documentation Found</h3>
          <p className="mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? "Try changing your search or filter"
              : "There's no documentation available yet"}
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button 
              className="inline-block bg-accent text-white font-bold py-2 px-4 border-2 border-black brutal-shadow brutal-button"
              onClick={(e) => {
                e.preventDefault();
                generateNewDocumentation();
              }}
            >
              Generate Your First Documentation
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="bg-white border-4 border-black p-4 brutal-shadow">
              <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                {selectedCategory !== "all" && getCategoryIcon(selectedCategory)}
                <span>{selectedCategory === "all" ? "All Documents" : featuredCategories.find(c => c.id === selectedCategory)?.name || selectedCategory}</span>
              </h2>
              <div className="space-y-3">
                {filteredDocuments.map((doc: Document) => (
                  <div 
                    key={doc.id} 
                    className={`p-3 border-2 border-black cursor-pointer ${activeDoc?.id === doc.id ? 'bg-gray-100' : ''}`}
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-bold">{doc.title}</h3>
                      <span className={`text-xs ${getDocLabelClass(doc)} px-2 py-1`}>
                        {getDocLabelText(doc)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{doc.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      Updated {formatDate(doc.updatedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3">
            {activeDoc && (
              <div className="bg-white border-4 border-black p-6 brutal-shadow">
                <div className="mb-4 pb-4 border-b-2 border-dashed border-black">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-2 bg-gray-100 rounded-md">
                      {getCategoryIcon(activeDoc.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h1 className="font-heading text-2xl font-bold">{activeDoc.title}</h1>
                        <span className={`text-xs ${getDocLabelClass(activeDoc)} px-2 py-1`}>
                          {getDocLabelText(activeDoc)}
                        </span>
                      </div>
                      <p className="text-gray-600">{activeDoc.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="prose max-w-none documentation-content" dangerouslySetInnerHTML={{ __html: activeDoc.content || "<p>Content not available</p>" }}></div>
                
                <div className="mt-8 pt-4 border-t-2 border-dashed border-black">
                  <div className="flex justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>Category:</span> 
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                        {activeDoc.category}
                      </span>
                    </div>
                    <div>Last updated: {formatDate(activeDoc.updatedAt)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Documentation;

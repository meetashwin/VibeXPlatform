import { apiRequest } from "./queryClient";
import { AiSuggestion } from "./types";

export async function analyzeCode(code: string, language: string = "javascript"): Promise<AiSuggestion[]> {
  try {
    const response = await apiRequest("POST", "/api/ai/analyze-code", {
      code,
      language
    });
    
    if (!response.ok) {
      throw new Error("Failed to analyze code");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error analyzing code:", error);
    return [];
  }
}

export async function generateCode(prompt: string, language: string = "javascript"): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/ai/generate-code", {
      prompt,
      language
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate code");
    }
    
    const data = await response.json();
    return data.code;
  } catch (error) {
    console.error("Error generating code:", error);
    throw error;
  }
}

export async function generateDocumentation(
  code: string, 
  type: "function" | "class" | "module" = "function"
): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/ai/generate-documentation", {
      code,
      type
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate documentation");
    }
    
    const data = await response.json();
    return data.documentation;
  } catch (error) {
    console.error("Error generating documentation:", error);
    throw error;
  }
}

export async function debugIssue(
  code: string, 
  error: string
): Promise<{
  diagnosis: string;
  solution: string;
  fixedCode?: string;
}> {
  try {
    const response = await apiRequest("POST", "/api/ai/debug", {
      code,
      error
    });
    
    if (!response.ok) {
      throw new Error("Failed to debug issue");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error debugging issue:", error);
    throw error;
  }
}

export async function askAI(prompt: string): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/ai/chat", {
      prompt
    });
    
    if (!response.ok) {
      throw new Error("Failed to get AI response");
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error asking AI:", error);
    throw error;
  }
}

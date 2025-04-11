import axios from 'axios';
import { AiSuggestion } from "@/lib/types";
import { storage } from './storage';
import OpenAI from 'openai';

interface AiServiceOptions {
  userId?: number;
}

interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_ctx?: number;
  };
}

interface UserAiPreferences {
  aiProvider: "openai" | "ollama" | "none";
  aiModel: string;
  ollamaEndpoint: string;
}

/**
 * Provides an interface for interacting with AI models (OpenAI or Ollama)
 */
export class AiService {
  private userId: number | null = null;
  private userPreferences: UserAiPreferences | null = null;
  
  constructor(options?: AiServiceOptions) {
    if (options?.userId) {
      this.userId = options.userId;
    }
  }
  
  /**
   * Gets the user's AI preferences, falling back to defaults if not set
   */
  async getUserPreferences(): Promise<UserAiPreferences> {
    // If we've already loaded preferences and have them in memory, use those
    if (this.userPreferences) {
      return this.userPreferences;
    }
    
    // If we have a userId, try to get that user's preferences
    if (this.userId) {
      const user = await storage.getUser(this.userId);
      if (user?.preferences) {
        this.userPreferences = {
          aiProvider: user.preferences.aiProvider || "ollama", // Default to Ollama instead of none
          aiModel: user.preferences.aiModel || "deepseek-coder", // Default to a code-optimized model
          ollamaEndpoint: user.preferences.ollamaEndpoint || "http://localhost:11434"
        };
        return this.userPreferences;
      }
    }
    
    // Fall back to defaults if no user ID is provided or if user has no preferences
    return {
      aiProvider: "ollama", // Default to Ollama instead of none
      aiModel: "deepseek-coder", // Default to a code-optimized model
      ollamaEndpoint: "http://localhost:11434"
    };
  }
  
  /**
   * Asks a question to the AI model
   */
  async askQuestion(prompt: string): Promise<string> {
    const prefs = await this.getUserPreferences();
    
    if (prefs.aiProvider === "none") {
      return this.mockAiResponse(prompt);
    } else if (prefs.aiProvider === "ollama") {
      return this.askOllama(prompt, prefs.aiModel, prefs.ollamaEndpoint);
    } else if (prefs.aiProvider === "openai") {
      return this.askOpenAI(prompt, prefs.aiModel || "gpt-4o");
    } else {
      return this.mockAiResponse(prompt);
    }
  }
  
  /**
   * Asks OpenAI for a response
   */
  private async askOpenAI(prompt: string, model: string = "gpt-4o"): Promise<string> {
    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return "OpenAI API key is not configured. Please add your API key in Settings.";
      }
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
      });
      
      return response.choices[0].message.content || "No response from OpenAI.";
    } catch (error) {
      console.error("OpenAI API error:", error);
      return "Error connecting to OpenAI. Please check your API key and network connection.";
    }
  }
  
  /**
   * Asks Ollama for a response
   */
  private async askOllama(prompt: string, model: string, endpoint: string): Promise<string> {
    try {
      const ollamaRequest: OllamaRequest = {
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7
        }
      };
      
      const response = await axios.post(
        `${endpoint}/api/generate`,
        ollamaRequest
      );
      
      // Return the response text
      return response.data.response || 
        "I couldn't generate a response. Please check your Ollama setup.";
    } catch (error) {
      console.error("Ollama API error:", error);
      return "Error connecting to Ollama. Please check if Ollama is running and accessible.";
    }
  }
  
  /**
   * Provides a mock AI response when no AI provider is configured
   */
  private mockAiResponse(prompt: string): string {
    const commonResponses = [
      "I understand you're asking about " + prompt.substring(0, 20) + "..., but AI assistance is not configured. Please set up Ollama or OpenAI in settings.",
      "To enable AI responses, go to Settings and configure either Ollama (local) or OpenAI.",
      "This is a simulated response as no AI provider is configured. Please check your AI settings.",
      "I'd love to help with " + prompt.substring(0, 15) + "..., but first you need to configure an AI provider in the Settings page."
    ];
    
    return commonResponses[Math.floor(Math.random() * commonResponses.length)];
  }
  
  /**
   * Analyzes code for improvements and issues
   */
  async analyzeCode(code: string, language: string = "javascript"): Promise<AiSuggestion[]> {
    const prefs = await this.getUserPreferences();
    
    if (prefs.aiProvider === "none") {
      return this.mockCodeAnalysis(code, language);
    } else if (prefs.aiProvider === "ollama") {
      try {
        const prompt = `Analyze this ${language} code and provide suggestions for improvements or identify issues:
\`\`\`${language}
${code}
\`\`\`

Provide your response in this format:
[
  {
    "type": "improvement" or "warning" or "error",
    "line": line number (optional),
    "description": "description of the suggestion"
  },
  ...
]`;

        const response = await this.askOllama(prompt, prefs.aiModel, prefs.ollamaEndpoint);
        
        // Try to extract a JSON array from the response
        try {
          // Look for JSON array pattern in the response
          const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (jsonMatch) {
            const suggestions = JSON.parse(jsonMatch[0]);
            return suggestions as AiSuggestion[];
          }
        } catch (parseError) {
          console.error("Error parsing Ollama JSON response:", parseError);
        }
        
        // If we couldn't get a proper JSON response, return a fallback suggestion
        return [{
          type: "warning",
          description: "Could not parse AI response. Try again or check AI settings."
        }];
      } catch (error) {
        console.error("Error analyzing code with Ollama:", error);
        return [{
          type: "error",
          description: "Error connecting to Ollama. Please check if Ollama is running."
        }];
      }
    } else if (prefs.aiProvider === "openai") {
      try {
        // Check if OpenAI API key is available
        if (!process.env.OPENAI_API_KEY) {
          return [{
            type: "error",
            description: "OpenAI API key is not configured. Please add your API key in Settings."
          }];
        }
        
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const prompt = `Analyze this ${language} code and provide suggestions for improvements or identify issues:
\`\`\`${language}
${code}
\`\`\`

Provide ONLY a JSON array response in this format:
[
  {
    "type": "improvement" or "warning" or "error",
    "line": line number (optional),
    "description": "description of the suggestion"
  },
  ...
]`;

        const response = await openai.chat.completions.create({
          model: prefs.aiModel || "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });
        
        const content = response.choices[0].message.content;
        if (content) {
          try {
            const jsonResponse = JSON.parse(content);
            if (Array.isArray(jsonResponse)) {
              return jsonResponse as AiSuggestion[];
            } else if (jsonResponse && Array.isArray(jsonResponse.suggestions)) {
              return jsonResponse.suggestions as AiSuggestion[];
            }
          } catch (parseError) {
            console.error("Error parsing OpenAI JSON response:", parseError);
          }
        }
        
        return [{
          type: "warning",
          description: "Could not get a proper response from OpenAI. Try again later."
        }];
      } catch (error) {
        console.error("OpenAI API error:", error);
        return [{
          type: "error",
          description: "Error connecting to OpenAI. Please check your API key and network connection."
        }];
      }
    } else {
      return this.mockCodeAnalysis(code, language);
    }
  }
  
  /**
   * Mock code analysis for when no AI provider is configured
   */
  private mockCodeAnalysis(code: string, language: string): AiSuggestion[] {
    // A simplified version of the original mock implementation
    const suggestions: AiSuggestion[] = [];

    if (language === "javascript" || language === "typescript") {
      // Check for for loops that could be replaced with map/filter/reduce
      if (code.includes("for (") && !code.includes(".map(")) {
        suggestions.push({
          type: "improvement",
          line: code.split("\n").findIndex(line => line.includes("for (")) + 1,
          description: "Consider using map() instead of a for loop for better readability"
        });
      }

      // Check for console.log statements
      if (code.includes("console.log")) {
        suggestions.push({
          type: "warning",
          line: code.split("\n").findIndex(line => line.includes("console.log")) + 1,
          description: "Remember to remove console.log statements before production"
        });
      }
    }
    
    if (suggestions.length === 0) {
      suggestions.push({
        type: "improvement",
        description: "No specific suggestions found. Consider configuring an AI provider in Settings for more detailed analysis."
      });
    }
    
    return suggestions;
  }
  
  /**
   * Generates code based on a prompt
   */
  async generateCode(prompt: string, language: string = "javascript"): Promise<string> {
    const prefs = await this.getUserPreferences();
    
    if (prefs.aiProvider === "none") {
      return this.mockCodeGeneration(prompt, language);
    } else if (prefs.aiProvider === "ollama") {
      try {
        const ollPrompt = `Generate ${language} code for the following requirement:
        
${prompt}

Respond with ONLY the code, without any explanations before or after. Make sure the code is complete, well-documented, and follows best practices.`;

        return await this.askOllama(ollPrompt, prefs.aiModel, prefs.ollamaEndpoint);
      } catch (error) {
        console.error("Error generating code with Ollama:", error);
        return "// Error connecting to Ollama. Please check if Ollama is running.\n// Falling back to mock response\n\n" + 
               this.mockCodeGeneration(prompt, language);
      }
    } else if (prefs.aiProvider === "openai") {
      try {
        // Check if OpenAI API key is available
        if (!process.env.OPENAI_API_KEY) {
          return "// OpenAI API key is not configured.\n// Please add your API key in Settings.\n";
        }
        
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const openAiPrompt = `Generate ${language} code for the following requirement:
        
${prompt}

Respond with ONLY the code, without any explanations before or after. Make sure the code is complete, well-documented, and follows best practices.`;

        const response = await openai.chat.completions.create({
          model: prefs.aiModel || "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [{ role: "user", content: openAiPrompt }],
        });
        
        return response.choices[0].message.content || "// No response from OpenAI.\n";
      } catch (error) {
        console.error("OpenAI API error:", error);
        return "// Error connecting to OpenAI. Please check your API key and network connection.\n// Falling back to mock response\n\n" + 
               this.mockCodeGeneration(prompt, language);
      }
    } else {
      return this.mockCodeGeneration(prompt, language);
    }
  }
  
  /**
   * Mock code generation for when no AI provider is configured
   */
  private mockCodeGeneration(prompt: string, language: string): string {
    if (prompt.toLowerCase().includes("fetch") || prompt.toLowerCase().includes("api")) {
      return `// Note: This is mock-generated code as no AI provider is configured
// To get real AI responses, configure Ollama or OpenAI in Settings

async function fetchData(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(\`HTTP error: \${response.status}\`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Example usage
const API_URL = 'https://api.example.com/data';

fetchData(API_URL)
  .then(data => {
    console.log('Data received:', data);
    // Process your data here
  })
  .catch(error => {
    console.error('Failed to fetch data:', error);
  });`;
    } else {
      return `// Note: This is mock-generated code as no AI provider is configured
// To get real AI responses, configure Ollama or OpenAI in Settings

// Generated code based on prompt: "${prompt}"
function process${prompt.replace(/[^a-zA-Z0-9]/g, '')}(data) {
  // TODO: Implement the functionality based on requirements
  console.log('Processing data:', data);
  return {
    result: 'success',
    processedData: data
  };
}

// Example usage
const data = {
  id: 1,
  name: 'Example',
  values: [10, 20, 30]
};

const result = process${prompt.replace(/[^a-zA-Z0-9]/g, '')}(data);
console.log('Result:', result);`;
    }
  }
  
  /**
   * Generates documentation for code
   */
  async generateDocumentation(code: string, type: "function" | "class" | "module" = "function"): Promise<string> {
    const prefs = await this.getUserPreferences();
    
    if (prefs.aiProvider === "none") {
      return this.mockDocumentationGeneration(code, type);
    } else if (prefs.aiProvider === "ollama") {
      try {
        const prompt = `Generate detailed documentation for this ${type}:
        
\`\`\`
${code}
\`\`\`

Generate the documentation in HTML format, including:
- Overview/purpose
- Parameters or properties
- Return values (if applicable)
- Example usage
- Any notable implementation details

Format your response as complete HTML that can be directly inserted into a documentation page.`;

        return await this.askOllama(prompt, prefs.aiModel, prefs.ollamaEndpoint);
      } catch (error) {
        console.error("Error generating documentation with Ollama:", error);
        return "<p>Error connecting to Ollama. Please check if Ollama is running.</p>" + 
               this.mockDocumentationGeneration(code, type);
      }
    } else if (prefs.aiProvider === "openai") {
      try {
        // Check if OpenAI API key is available
        if (!process.env.OPENAI_API_KEY) {
          return "<p>OpenAI API key is not configured. Please add your API key in Settings.</p>";
        }
        
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const openAiPrompt = `Generate detailed documentation for this ${type}:
        
\`\`\`
${code}
\`\`\`

Generate the documentation in HTML format, including:
- Overview/purpose
- Parameters or properties
- Return values (if applicable)
- Example usage
- Any notable implementation details

Format your response as complete HTML that can be directly inserted into a documentation page.`;

        const response = await openai.chat.completions.create({
          model: prefs.aiModel || "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [{ role: "user", content: openAiPrompt }],
        });
        
        return response.choices[0].message.content || 
          "<p>No response from OpenAI. Please try again later.</p>";
      } catch (error) {
        console.error("OpenAI API error:", error);
        return "<p>Error connecting to OpenAI. Please check your API key and network connection.</p>" + 
               this.mockDocumentationGeneration(code, type);
      }
    } else {
      return this.mockDocumentationGeneration(code, type);
    }
  }
  
  /**
   * Mock documentation generation
   */
  private mockDocumentationGeneration(code: string, type: "function" | "class" | "module"): string {
    // Extract function name
    const functionNameMatch = code.match(/function\s+([a-zA-Z0-9_]+)/);
    const functionName = functionNameMatch ? functionNameMatch[1] : "MyFunction";

    return `<h1>${functionName} Function Documentation</h1>
    <p>This documentation provides details about the <code>${functionName}</code> function.</p>
    <p><em>Note: This is mock-generated documentation as no AI provider is configured.
    Configure an AI provider in Settings for more detailed documentation.</em></p>
    
    <h2>Overview</h2>
    <p>The <code>${functionName}</code> function processes data and returns a result.</p>
    
    <h2>Parameters</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>data</td>
          <td>object | array</td>
          <td>The input data to process</td>
        </tr>
      </tbody>
    </table>
    
    <h2>Return Value</h2>
    <p>Returns an object containing the processed result.</p>
    
    <h2>Example Usage</h2>
    <pre><code>const data = { 
  id: 1, 
  name: 'Example' 
};

const result = ${functionName}(data);
console.log(result);</code></pre>
    
    <h2>Source Code</h2>
    <pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  }
  
  /**
   * Provides debugging assistance for code issues
   */
  async debugIssue(code: string, error: string): Promise<{
    diagnosis: string;
    solution: string;
    fixedCode?: string;
  }> {
    const prefs = await this.getUserPreferences();
    
    if (prefs.aiProvider === "none") {
      return this.mockDebugIssue(code, error);
    } else if (prefs.aiProvider === "ollama") {
      try {
        const prompt = `Debug the following code that has an error:
        
\`\`\`
${code}
\`\`\`

The error message is: "${error}"

Provide your response in this format as valid JSON:
{
  "diagnosis": "detailed explanation of what's causing the error",
  "solution": "how to fix the issue",
  "fixedCode": "the corrected code"
}`;

        const response = await this.askOllama(prompt, prefs.aiModel, prefs.ollamaEndpoint);
        
        // Try to extract a JSON object from the response
        try {
          // Look for JSON object pattern in the response
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            return {
              diagnosis: result.diagnosis || "Could not determine the cause of the error.",
              solution: result.solution || "Try reviewing the code manually.",
              fixedCode: result.fixedCode
            };
          }
        } catch (parseError) {
          console.error("Error parsing Ollama JSON response:", parseError);
        }
        
        // If parsing failed, return a generic response
        return {
          diagnosis: "Failed to parse the AI response.",
          solution: "Please try again or check your AI settings.",
          fixedCode: undefined
        };
      } catch (error) {
        console.error("Error debugging with Ollama:", error);
        return {
          diagnosis: "Error connecting to Ollama.",
          solution: "Please check if Ollama is running correctly.",
          fixedCode: undefined
        };
      }
    } else if (prefs.aiProvider === "openai") {
      try {
        // Check if OpenAI API key is available
        if (!process.env.OPENAI_API_KEY) {
          return {
            diagnosis: "OpenAI API key is not configured.",
            solution: "Please add your OpenAI API key in Settings to use this feature.",
            fixedCode: undefined
          };
        }
        
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const openAiPrompt = `Debug the following code that has an error:
        
\`\`\`
${code}
\`\`\`

The error message is: "${error}"

Analyze the code and provide:
1. A diagnosis of what's causing the error
2. A solution to fix the issue
3. The corrected code

Return your response in JSON format:
{
  "diagnosis": "detailed explanation of what's causing the error",
  "solution": "how to fix the issue",
  "fixedCode": "the corrected code"
}`;

        const response = await openai.chat.completions.create({
          model: prefs.aiModel || "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [{ role: "user", content: openAiPrompt }],
          response_format: { type: "json_object" }
        });
        
        const content = response.choices[0].message.content;
        if (content) {
          try {
            const result = JSON.parse(content);
            return {
              diagnosis: result.diagnosis || "Could not determine the cause of the error.",
              solution: result.solution || "Try reviewing the code manually.",
              fixedCode: result.fixedCode
            };
          } catch (parseError) {
            console.error("Error parsing OpenAI JSON response:", parseError);
          }
        }
        
        // If parsing failed, return a generic response
        return {
          diagnosis: "Failed to get a proper response from OpenAI.",
          solution: "Please try again later.",
          fixedCode: undefined
        };
      } catch (error) {
        console.error("OpenAI API error:", error);
        return {
          diagnosis: "Error connecting to OpenAI.",
          solution: "Please check your API key and network connection.",
          fixedCode: undefined
        };
      }
    } else {
      return this.mockDebugIssue(code, error);
    }
  }
  
  /**
   * Mock debugging assistance
   */
  private mockDebugIssue(code: string, error: string): {
    diagnosis: string;
    solution: string;
    fixedCode?: string;
  } {
    if (error.includes("undefined") || error.includes("is not defined")) {
      const variableMatch = error.match(/(?:variable |)['"]?([a-zA-Z0-9_]+)['"]? is not defined/);
      const variable = variableMatch ? variableMatch[1] : "variable";
      
      return {
        diagnosis: `The variable '${variable}' is being used before it's defined or is outside the current scope.`,
        solution: `Make sure '${variable}' is declared before use and is accessible in the current scope.`,
        fixedCode: code.replace(
          new RegExp(`([^a-zA-Z0-9_])${variable}([^a-zA-Z0-9_])`, 'g'), 
          `$1let ${variable} = {}$2`
        )
      };
    }

    // Default fallback
    return {
      diagnosis: "Based on the error description, there seems to be an issue with your code logic or implementation.",
      solution: "Review your code for logical errors, check variable types, and ensure proper function calls. Consider configuring an AI provider in Settings for more detailed debugging assistance."
    };
  }
}

// Create a default instance that can be imported and used directly
export const aiService = new AiService();

// Adapter functions to maintain backward compatibility with the existing API
export async function analyzeCode(code: string, language: string = "javascript"): Promise<AiSuggestion[]> {
  return aiService.analyzeCode(code, language);
}

export async function generateCode(prompt: string, language: string = "javascript"): Promise<string> {
  return aiService.generateCode(prompt, language);
}

export async function generateDocumentation(
  code: string, 
  type: "function" | "class" | "module" = "function"
): Promise<string> {
  return aiService.generateDocumentation(code, type);
}

export async function debugIssue(
  code: string, 
  error: string
): Promise<{
  diagnosis: string;
  solution: string;
  fixedCode?: string;
}> {
  return aiService.debugIssue(code, error);
}

export async function askAI(prompt: string): Promise<string> {
  return aiService.askQuestion(prompt);
}
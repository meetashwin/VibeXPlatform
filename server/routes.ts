import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertProjectSchema, 
  insertMessageSchema, 
  insertCodeFileSchema, 
  insertDocumentSchema,
  insertActivitySchema
} from "@shared/schema";
import { analyzeCode, generateCode, generateDocumentation, debugIssue, askAI } from "./ai";
import { requireAuth, verifyAuthToken } from "./middleware/auth";
import jwt from 'jsonwebtoken';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'vibe-x-development-secret-key';

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/me", async (req, res) => {
    try {
      // Mock user for demo purposes
      const user = await storage.getUserByUsername("johndoe");
      if (user) {
        res.json({
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          preferences: user.preferences
        });
      } else {
        // Create a demo user if none exists
        const newUser = await storage.createUser({
          username: "johndoe",
          password: "password",
          name: "John Doe",
          email: "john@example.com",
          preferences: {
            darkMode: false,
            notifications: true,
            aiProvider: "none",
            aiModel: "llama3",
            ollamaEndpoint: "http://localhost:11434"
          }
        });
        
        res.json({
          id: newUser.id.toString(),
          name: newUser.name,
          email: newUser.email,
          preferences: newUser.preferences
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/profile", async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email()
      });
      
      const { name, email } = schema.parse(req.body);
      const user = await storage.getUserByUsername("johndoe");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUser(user.id, { name, email });
      
      res.json({
        id: updatedUser.id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        preferences: updatedUser.preferences
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.put("/api/users/preferences", async (req, res) => {
    try {
      const schema = z.object({
        darkMode: z.boolean().optional(),
        notifications: z.boolean().optional(),
        aiProvider: z.enum(["openai", "ollama", "none"]).optional(),
        aiModel: z.string().optional(),
        ollamaEndpoint: z.string().optional()
      });
      
      const preferences = schema.parse(req.body);
      const user = await storage.getUserByUsername("johndoe");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUserPreferences(user.id, preferences);
      
      res.json({
        id: updatedUser.id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        preferences: updatedUser.preferences
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  app.put("/api/users/api-key", async (req, res) => {
    try {
      const schema = z.object({
        apiKey: z.string().min(1)
      });
      
      const { apiKey } = schema.parse(req.body);
      const user = await storage.getUserByUsername("johndoe");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUserApiKey(user.id, apiKey);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating API key:", error);
      res.status(500).json({ message: "Failed to update API key" });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const user = await storage.getUserByUsername("johndoe");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const project = await storage.createProject({
        ...projectData,
        createdBy: user.id
      });

      // Create an activity for project creation
      await storage.createActivity({
        type: "user",
        description: `Created project ${project.name}`,
        projectId: project.id,
        userId: user.id
      });
      
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const projectData = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional()
      }).parse(req.body);
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const updatedProject = await storage.updateProject(projectId, projectData);
      
      // Create an activity for project update
      const user = await storage.getUserByUsername("johndoe");
      if (user) {
        await storage.createActivity({
          type: "user",
          description: `Updated project ${updatedProject.name}`,
          projectId: projectId,
          userId: user.id
        });
      }
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.post("/api/projects/:id/technologies", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { technology } = z.object({
        technology: z.string().min(1)
      }).parse(req.body);
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const updatedProject = await storage.addProjectTechnology(projectId, technology);
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error adding technology:", error);
      res.status(500).json({ message: "Failed to add technology" });
    }
  });

  app.delete("/api/projects/:id/technologies/:technology", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const technology = req.params.technology;
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const updatedProject = await storage.removeProjectTechnology(projectId, technology);
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error removing technology:", error);
      res.status(500).json({ message: "Failed to remove technology" });
    }
  });

  // Message routes
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const user = await storage.getUserByUsername("johndoe");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const message = await storage.createMessage({
        ...messageData,
        userId: user.id
      });
      
      // Generate AI response
      if (message.sender === 'user') {
        const aiResponse = await askAI(message.content);
        
        const aiMessage = await storage.createMessage({
          content: aiResponse,
          sender: 'ai',
          userId: user.id
        });
        
        res.status(201).json(aiMessage);
      } else {
        res.status(201).json(message);
      }
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Code samples routes
  app.get("/api/code-samples", async (req, res) => {
    try {
      const codeFiles = await storage.getAllCodeFiles();
      res.json(codeFiles);
    } catch (error) {
      console.error("Error fetching code samples:", error);
      res.status(500).json({ message: "Failed to fetch code samples" });
    }
  });

  app.get("/api/code-samples/:id", async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const codeFile = await storage.getCodeFileById(fileId);
      
      if (!codeFile) {
        return res.status(404).json({ message: "Code file not found" });
      }
      
      res.json(codeFile);
    } catch (error) {
      console.error("Error fetching code file:", error);
      res.status(500).json({ message: "Failed to fetch code file" });
    }
  });

  app.put("/api/code-samples/:id", async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const { content } = z.object({
        content: z.string()
      }).parse(req.body);
      
      const codeFile = await storage.getCodeFileById(fileId);
      
      if (!codeFile) {
        return res.status(404).json({ message: "Code file not found" });
      }
      
      const updatedFile = await storage.updateCodeFile(fileId, { content });
      
      res.json(updatedFile);
    } catch (error) {
      console.error("Error updating code file:", error);
      res.status(500).json({ message: "Failed to update code file" });
    }
  });

  app.post("/api/code-samples", async (req, res) => {
    try {
      const codeFileData = insertCodeFileSchema.parse(req.body);
      const codeFile = await storage.createCodeFile(codeFileData);
      
      res.status(201).json(codeFile);
    } catch (error) {
      console.error("Error creating code file:", error);
      res.status(500).json({ message: "Failed to create code file" });
    }
  });

  // Code suggestions routes
  app.get("/api/code-suggestions/:fileId", async (req, res) => {
    try {
      const fileId = parseInt(req.params.fileId);
      const codeFile = await storage.getCodeFileById(fileId);
      
      if (!codeFile) {
        return res.status(404).json({ message: "Code file not found" });
      }
      
      const suggestions = await analyzeCode(codeFile.content, codeFile.language);
      res.json(suggestions);
    } catch (error) {
      console.error("Error getting code suggestions:", error);
      res.status(500).json({ message: "Failed to get code suggestions" });
    }
  });

  // Activities routes
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getAllActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Documents routes
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(documentData);
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.post("/api/documents/generate", async (req, res) => {
    try {
      // Check if a specific document type was requested
      const { documentType } = req.body;
      
      if (documentType === "llm-agents-whitepaper") {
        // Generate the LLM Agents whitepaper based on authentic content from "Vibe X - Agents.docx"
        const documentData = {
          title: "Revolutionizing AI with Advanced LLM Agents",
          description: "Comprehensive whitepaper on how Large Language Model agents are transforming software development through advanced capabilities",
          content: `<h1>VibeX White Paper: Revolutionizing AI with Advanced LLM Agents</h1>
                    <p class="lead">The rapid evolution of artificial intelligence (AI) has ushered in a new era of innovation, where <strong>Large Language Model (LLM) agents</strong> are redefining how we interact with technology. Unlike traditional AI models that rely solely on pre-trained knowledge, LLM agents are autonomous, intelligent systems capable of reasoning, planning, and executing complex tasks with minimal human oversight. The VibeX platform harnesses the power of these agents to deliver a transformative AI experience.</p>
                    
                    <h2>1. Defining LLM Agents</h2>
                    <p><strong>LLM agents</strong> are advanced AI entities powered by Large Language Models, designed to autonomously guide their own processes and solve problems dynamically. Unlike conventional LLMs that generate responses based on static training data, VibeX agents can:</p>
                    <ul>
                      <li><strong>Reason</strong> through complex queries using chain-of-thought processes.</li>
                      <li><strong>Plan</strong> multi-step solutions to achieve specific goals.</li>
                      <li><strong>Adapt</strong> to new information in real time.</li>
                    </ul>
                    <p>These capabilities enable VibeX agents to manage workflows, answer questions, and interact with external systems autonomously, making them versatile tools for both individual and enterprise users.</p>
                    
                    <h2>2. Anatomy of an LLM Agent</h2>
                    <p>The functionality of VibeX agents stems from their sophisticated architecture, which includes three key components:</p>
                    
                    <h3>2.1 Memory</h3>
                    <p>Memory allows agents to retain and utilize information from past interactions, ensuring continuity and personalization. VibeX agents employ:</p>
                    <ul>
                      <li><strong>Short-term memory</strong>: Stores recent inputs for immediate context (e.g., the last few exchanges in a conversation).</li>
                      <li><strong>Long-term memory</strong>: Retains user preferences and historical data, enabling adaptive, tailored responses over time.</li>
                    </ul>
                    
                    <h3>2.2 Tools</h3>
                    <p>Agents extend their capabilities by integrating with external tools, such as APIs, databases, or productivity software. Examples include:</p>
                    <ul>
                      <li>Querying a weather API for real-time updates.</li>
                      <li>Accessing a knowledge base for specialized information.</li>
                      <li>Automating tasks like scheduling or data analysis via third-party tools.</li>
                    </ul>
                    
                    <h3>2.3 Core Processing Unit</h3>
                    <p>The LLM serves as the agent's "brain," processing inputs, leveraging memory, and coordinating tool usage. It enables:</p>
                    <ul>
                      <li>Intent recognition and contextual understanding.</li>
                      <li>Multi-step reasoning for complex problem-solving.</li>
                      <li>Generation of accurate, relevant responses.</li>
                    </ul>
                    <p>Together, these components make VibeX agents intelligent, adaptable, and capable of tackling diverse challenges.</p>
                    
                    <h2>3. Agent Collaboration Protocol</h2>
                    <p>Collaboration is a cornerstone of the VibeX platform, allowing multiple agents to work together seamlessly. The <strong>agent collaboration protocol</strong> includes:</p>
                    <ul>
                      <li><strong>Communication Channels</strong>: Structured messaging systems enable agents to share data and request assistance in real time.</li>
                      <li><strong>Task Delegation</strong>: Agents divide responsibilities based on their strengths (e.g., one agent retrieves data while another analyzes it).</li>
                      <li><strong>Shared Knowledge Base</strong>: A centralized repository ensures collective access to insights, reducing redundancy and boosting efficiency.</li>
                    </ul>
                    <p>This protocol transforms individual agents into a cohesive team, capable of addressing multifaceted problems collaboratively.</p>
                    
                    <h2>4. AI Orchestration Service</h2>
                    <p>The <strong>AI orchestration service</strong> manages the VibeX agent ecosystem, ensuring optimal performance and coordination. Its key functions are:</p>
                    <ul>
                      <li><strong>Task Assignment</strong>: Allocates tasks to agents based on expertise and workload, maximizing efficiency.</li>
                      <li><strong>Performance Monitoring</strong>: Tracks agent activities in real time, identifying and resolving issues promptly.</li>
                      <li><strong>Tool Integration</strong>: Connects agents to external systems and resources, streamlining workflows.</li>
                    </ul>
                    <p>This service ensures the platform operates smoothly, even as the number of agents and tasks scales.</p>
                    
                    <h2>5. Agent Security: Ensuring Safe Agents</h2>
                    <p>Security is paramount at VibeX, given the autonomy of LLM agents. Our <strong>agent security framework</strong> includes:</p>
                    <ul>
                      <li><strong>Behavioral Safeguards</strong>: Continuous monitoring prevents unintended or harmful actions.</li>
                      <li><strong>Permission Frameworks</strong>: Strict access controls limit agents to authorized tasks and data.</li>
                      <li><strong>Ethical Compliance</strong>: Built-in guidelines ensure adherence to privacy and ethical standards.</li>
                      <li><strong>Anomaly Detection</strong>: Advanced systems identify and address irregular behavior, protecting users and the platform.</li>
                    </ul>
                    <p>These measures guarantee that VibeX agents are safe, reliable, and trustworthy.</p>
                    
                    <h2>6. Reasoning and Planning Capabilities</h2>
                    <p>VibeX agents excel in <strong>reasoning and planning</strong>, enabling them to handle complex tasks with precision. Key capabilities include:</p>
                    <ul>
                      <li><strong>Chain-of-Thought Reasoning</strong>: Agents break down problems into logical steps for systematic solutions.</li>
                      <li><strong>Dynamic Planning</strong>: Strategies adapt as new data emerges, ensuring flexibility.</li>
                      <li><strong>Decision-Making</strong>: Agents weigh options using memory and tools to make informed choices.</li>
                      <li><strong>Test-Time Compute Optimization</strong>: Additional resources are allocated during task execution to enhance response quality.</li>
                    </ul>
                    <p>These advanced features position VibeX agents as leaders in intelligent problem-solving.</p>
                    
                    <h2>7. Agent Lifecycle Management</h2>
                    <p>The <strong>agent lifecycle management</strong> process ensures VibeX agents remain effective and up-to-date:</p>
                    <ul>
                      <li><strong>Creation and Training</strong>: Agents are built and fine-tuned using cutting-edge LLMs for specific domains or tasks.</li>
                      <li><strong>Version Control</strong>: Regular updates keep agents current with new knowledge and capabilities.</li>
                      <li><strong>Performance Evaluation</strong>: Ongoing assessments drive continuous improvement.</li>
                      <li><strong>Retirement</strong>: Outdated agents are phased out, replaced by enhanced versions.</li>
                    </ul>
                    <p>This lifecycle approach keeps the platform dynamic and responsive to evolving needs.</p>
                    
                    <h2>8. Scalability and Performance</h2>
                    <p>VibeX is engineered for <strong>scalability and high performance</strong>, supporting large-scale use without compromising quality. Technical highlights include:</p>
                    <ul>
                      <li><strong>Distributed Architecture</strong>: Parallel processing across a network reduces latency and boosts capacity.</li>
                      <li><strong>Resource Optimization</strong>: Dynamic allocation ensures efficient use of computational resources.</li>
                      <li><strong>Latency Reduction</strong>: Caching and optimized tool integration deliver fast, seamless interactions.</li>
                    </ul>
                    <p>These features make VibeX a robust platform for both individual and enterprise applications.</p>
                    
                    <h2>9. User Experience and Interface</h2>
                    <p>VibeX prioritizes <strong>user experience</strong> with a design that is intuitive and inclusive:</p>
                    <ul>
                      <li><strong>Intuitive Interface</strong>: Simple, clear layouts make the platform accessible to all users.</li>
                      <li><strong>Personalization</strong>: Agents adapt to user preferences, enhancing relevance and engagement.</li>
                      <li><strong>Multi-Modal Interaction</strong>: Support for text, voice, and visual inputs ensures versatility.</li>
                    </ul>
                    <p>This user-centric approach maximizes adoption and satisfaction across diverse audiences.</p>
                    
                    <h2>10. Future Directions</h2>
                    <p>VibeX is committed to ongoing innovation, with a roadmap that includes:</p>
                    <ul>
                      <li><strong>Enhanced Collaboration</strong>: More advanced protocols for agent teamwork.</li>
                      <li><strong>Advanced Tool Integration</strong>: Expanded access to tools like IoT devices and enterprise systems.</li>
                      <li><strong>Ethical AI Leadership</strong>: Setting new benchmarks for safety, transparency, and fairness.</li>
                      <li><strong>Global Expansion</strong>: Supporting diverse languages, cultures, and industries worldwide.</li>
                    </ul>
                    <p>These goals will cement VibeX's role as a pioneer in AI-driven solutions.</p>
                    
                    <h2>Conclusion</h2>
                    <p>The VibeX platform represents a bold step forward in AI innovation, leveraging LLM agents to deliver a system that is intelligent, collaborative, and secure. By defining agents as autonomous problem-solvers, detailing their anatomy, ensuring robust collaboration and orchestration, prioritizing safety, and enhancing reasoning and planning, VibeX sets a new standard for AI platforms. As we pursue our vision for the future, VibeX remains dedicated to pushing the boundaries of what AI can achieve in service of human goals.</p>`,
          category: "White Paper",
          isAiGenerated: true,
          isUpdated: false
        };
        
        const document = await storage.createDocument(documentData);
        
        // Create an activity for document generation
        const user = await storage.getUserByUsername("johndoe");
        if (user) {
          await storage.createActivity({
            type: "ai",
            description: "Generated LLM Agents whitepaper",
            userId: user.id
          });
        }
        
        res.status(201).json(document);
      } 
      else {
        // Generate a random document with AI
        const topics = ["API Authentication", "Database Schema", "Frontend Architecture", "Testing Strategy", "Deployment Guide"];
        const categories = ["API", "Database", "Frontend", "Testing", "DevOps"];
        
        const randomIndex = Math.floor(Math.random() * topics.length);
        const title = topics[randomIndex];
        const category = categories[randomIndex];
        
        const documentData = {
          title: `${title} Documentation`,
          description: `Complete guide to ${title.toLowerCase()} in your projects`,
          content: `<h1>${title} Documentation</h1>
                    <p>This documentation provides a comprehensive guide to ${title.toLowerCase()} best practices.</p>
                    <h2>Introduction</h2>
                    <p>Understanding ${title.toLowerCase()} is critical for modern software development.</p>
                    <h2>Implementation Guide</h2>
                    <p>Follow these steps to implement ${title.toLowerCase()} in your project:</p>
                    <ol>
                      <li>Step 1: Plan your approach</li>
                      <li>Step 2: Implement basic functionality</li>
                      <li>Step 3: Test thoroughly</li>
                      <li>Step 4: Refine and optimize</li>
                    </ol>
                    <h2>Best Practices</h2>
                    <p>Always follow these best practices:</p>
                    <ul>
                      <li>Keep it simple</li>
                      <li>Document your code</li>
                      <li>Test edge cases</li>
                      <li>Maintain security</li>
                    </ul>`,
          category,
          isAiGenerated: true,
          isUpdated: false
        };
        
        const document = await storage.createDocument(documentData);
        
        // Create an activity for document generation
        const user = await storage.getUserByUsername("johndoe");
        if (user) {
          await storage.createActivity({
            type: "ai",
            description: `Generated ${title} documentation`,
            userId: user.id
          });
        }
        
        res.status(201).json(document);
      }
    } catch (error) {
      console.error("Error generating document:", error);
      res.status(500).json({ message: "Failed to generate document" });
    }
  });

  // AI routes
  app.post("/api/ai/prompt", async (req, res) => {
    try {
      const { prompt } = z.object({
        prompt: z.string().min(1)
      }).parse(req.body);
      
      // Here we'd normally process the prompt and return an AI response
      // For demo purposes, we'll just return a success message
      
      res.json({ success: true, message: "Prompt received" });
    } catch (error) {
      console.error("Error processing AI prompt:", error);
      res.status(500).json({ message: "Failed to process prompt" });
    }
  });

  app.post("/api/ai/analyze-code", async (req, res) => {
    try {
      const { code, language } = z.object({
        code: z.string().min(1),
        language: z.string()
      }).parse(req.body);
      
      const suggestions = await analyzeCode(code, language);
      res.json(suggestions);
    } catch (error) {
      console.error("Error analyzing code:", error);
      res.status(500).json({ message: "Failed to analyze code" });
    }
  });

  app.post("/api/ai/generate-code", async (req, res) => {
    try {
      const { prompt, language } = z.object({
        prompt: z.string().min(1),
        language: z.string()
      }).parse(req.body);
      
      const code = await generateCode(prompt, language);
      res.json({ code });
    } catch (error) {
      console.error("Error generating code:", error);
      res.status(500).json({ message: "Failed to generate code" });
    }
  });

  app.post("/api/ai/generate-documentation", async (req, res) => {
    try {
      const { code, type } = z.object({
        code: z.string().min(1),
        type: z.enum(["function", "class", "module"])
      }).parse(req.body);
      
      const documentation = await generateDocumentation(code, type);
      res.json({ documentation });
    } catch (error) {
      console.error("Error generating documentation:", error);
      res.status(500).json({ message: "Failed to generate documentation" });
    }
  });

  app.post("/api/ai/debug", async (req, res) => {
    try {
      const { code, error } = z.object({
        code: z.string().min(1),
        error: z.string().min(1)
      }).parse(req.body);
      
      const debugResult = await debugIssue(code, error);
      res.json(debugResult);
    } catch (error) {
      console.error("Error debugging issue:", error);
      res.status(500).json({ message: "Failed to debug issue" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { prompt } = z.object({
        prompt: z.string().min(1)
      }).parse(req.body);
      
      const response = await askAI(prompt);
      res.json({ response });
    } catch (error) {
      console.error("Error getting AI response:", error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  // Create HTTP server
  // Add a route to serve the INSTALL.md file directly for download
  app.get("/INSTALL.md", (req, res) => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const filePath = path.join(process.cwd(), 'INSTALL.md');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/markdown');
        res.send(fileContent);
      } else {
        res.status(404).send('Installation guide not found');
      }
    } catch (error) {
      console.error("Error serving INSTALL.md file:", error);
      res.status(500).send('Error loading installation guide');
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = z.object({
        username: z.string().min(1),
        password: z.string().min(1)
      }).parse(req.body);
      
      // Check for hardcoded admin credentials
      if (username === 'admin' && password === 'admin123!') {
        // Use admin credentials
        // Generate JWT token for admin
        const token = jwt.sign(
          { 
            userId: 9999, 
            username: 'admin', 
            email: 'admin@vibex.platform' 
          }, 
          JWT_SECRET, 
          { expiresIn: '1h' }
        );
        
        // Set token as a cookie
        res.cookie('authToken', token, { 
          httpOnly: true, 
          maxAge: 3600000, // 1 hour
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        });
        
        // Return admin user info
        return res.json({ 
          token,
          user: {
            id: '9999',
            name: 'Admin User',
            email: 'admin@vibex.platform'
          }
        });
      }
      
      // For regular users, find them in storage
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          email: user.email 
        }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
      );
      
      // Set token as a cookie
      res.cookie('authToken', token, { 
        httpOnly: true, 
        maxAge: 3600000, // 1 hour
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      
      // Also return the token in the response for clients that don't support cookies
      res.json({ 
        token,
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });
  
  app.post("/api/auth/verify", (req, res) => {
    try {
      const { token } = z.object({
        token: z.string().min(1)
      }).parse(req.body);
      
      // Verify the token
      const decoded = verifyAuthToken(token);
      
      if (!decoded) {
        return res.status(401).json({ valid: false });
      }
      
      res.json({ 
        valid: true,
        user: {
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email
        }
      });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ valid: false });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    // Clear auth cookie
    res.clearCookie('authToken');
    res.json({ success: true });
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSocket server on a different path than Vite's HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'system',
      message: 'Connected to VibeX development platform'
    }));
    
    // Handle incoming messages
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Handle different message types
        if (message.type === 'chat') {
          // Broadcast to all clients
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'chat',
                userId: message.userId,
                username: message.username,
                message: message.message,
                timestamp: new Date().toISOString()
              }));
            }
          });
        } else if (message.type === 'codeChange') {
          // Broadcast code changes
          wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'codeChange',
                fileId: message.fileId,
                content: message.content,
                userId: message.userId
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Error processing message'
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}

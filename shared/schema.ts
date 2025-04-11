import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  apiKey: text("api_key"),
  preferences: jsonb("preferences").$type<{
    darkMode: boolean;
    notifications: boolean;
    aiProvider: "openai" | "ollama" | "none";
    aiModel: string;
    ollamaEndpoint: string;
  }>().default({
    darkMode: false,
    notifications: true,
    aiProvider: "none",
    aiModel: "llama3",
    ollamaEndpoint: "http://localhost:11434",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("in progress"),
  technologies: text("technologies").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
});

export const projectCollaborators = pgTable("project_collaborators", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").default("collaborator"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  projectId: integer("project_id").references(() => projects.id),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  sender: text("sender").notNull(),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const codeFiles = pgTable("code_files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  language: text("language").notNull(),
  content: text("content").notNull(),
  projectId: integer("project_id").references(() => projects.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content"),
  category: text("category").notNull().default("general"),
  isAiGenerated: boolean("is_ai_generated").default(false),
  isUpdated: boolean("is_updated").default(false),
  projectId: integer("project_id").references(() => projects.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Research Planning Assistant
export const researchPlans = pgTable("research_plans", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  objective: text("objective").notNull(),
  methodology: text("methodology").notNull(),
  targetAudience: jsonb("target_audience").$type<{
    demographics: string[];
    requirements: string[];
    exclusions: string[];
  }>(),
  timeline: jsonb("timeline").$type<{
    startDate: string;
    endDate: string;
    milestones: { date: string; description: string }[];
  }>(),
  status: text("status").default("draft"),
  projectId: integer("project_id").references(() => projects.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Prototype Testing Workflow
export const prototypeTests = pgTable("prototype_tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  prototypeUrl: text("prototype_url"),
  testScript: jsonb("test_script").$type<{
    tasks: { description: string; successCriteria: string }[];
    questions: { text: string; type: string }[];
  }>(),
  metrics: jsonb("metrics").$type<string[]>().default([]),
  results: jsonb("results").$type<{
    completionRate: number;
    averageTime: number;
    userFeedback: { userId: number; feedback: string; sentiment: string }[];
    heatmapData: any;
  }>(),
  status: text("status").default("setup"),
  projectId: integer("project_id").references(() => projects.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Decision Journal
export const decisions = pgTable("decisions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  context: text("context").notNull(),
  options: jsonb("options").$type<{ option: string; pros: string[]; cons: string[] }[]>(),
  decision: text("decision").notNull(),
  rationale: text("rationale").notNull(),
  impact: jsonb("impact").$type<{
    expectedOutcome: string;
    metrics: { name: string; target: string }[];
    risks: { description: string; mitigation: string }[];
  }>(),
  status: text("status").default("recorded"),
  revisitDate: date("revisit_date"),
  outcomes: jsonb("outcomes").$type<{
    actualResult: string;
    lessonsLearned: string[];
    followUpActions: string[];
  }>(),
  projectId: integer("project_id").references(() => projects.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workflow Orchestration
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  stages: jsonb("stages").$type<{
    id: string;
    name: string;
    description: string;
    assignedTo: number[];
    dependencies: string[];
    estimatedDuration: number;
    status: string;
  }[]>(),
  triggers: jsonb("triggers").$type<{
    type: string;
    condition: string;
    action: string;
  }[]>().default([]),
  status: text("status").default("defined"),
  statistics: jsonb("statistics").$type<{
    bottlenecks: string[];
    averageCycleTime: number;
    completionRate: number;
  }>(),
  projectId: integer("project_id").references(() => projects.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Resource Allocation
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // team_member, equipment, service
  skills: jsonb("skills").$type<{
    name: string;
    proficiency: number;
  }[]>().default([]),
  availability: jsonb("availability").$type<{
    schedule: { day: string; hours: number }[];
    startDate: string;
    endDate: string;
  }>(),
  allocationStatus: text("allocation_status").default("available"),
  utilization: jsonb("utilization").$type<{
    current: number;
    history: { date: string; percentage: number }[];
  }>(),
  projectAssignments: jsonb("project_assignments").$type<{
    projectId: number;
    role: string;
    allocation: number;
    startDate: string;
    endDate: string;
  }[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectCollaboratorSchema = createInsertSchema(projectCollaborators).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertCodeFileSchema = createInsertSchema(codeFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// New feature schemas
export const insertResearchPlanSchema = createInsertSchema(researchPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrototypeTestSchema = createInsertSchema(prototypeTests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDecisionSchema = createInsertSchema(decisions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertProjectCollaborator = z.infer<typeof insertProjectCollaboratorSchema>;
export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertCodeFile = z.infer<typeof insertCodeFileSchema>;
export type CodeFile = typeof codeFiles.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// New feature types
export type InsertResearchPlan = z.infer<typeof insertResearchPlanSchema>;
export type ResearchPlan = typeof researchPlans.$inferSelect;

export type InsertPrototypeTest = z.infer<typeof insertPrototypeTestSchema>;
export type PrototypeTest = typeof prototypeTests.$inferSelect;

export type InsertDecision = z.infer<typeof insertDecisionSchema>;
export type Decision = typeof decisions.$inferSelect;

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

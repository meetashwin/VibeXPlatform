import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Project } from "@/lib/types";
import { getInitials, formatDate } from "@/lib/utils";
import { CreateProjectButton } from "@/components/dashboard/CreateProjectForm";
import ProjectTemplates from "@/components/dashboard/ProjectTemplates";

const ProjectDetail = () => {
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id || "";
  const { toast } = useToast();
  
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [newTechnology, setNewTechnology] = useState("");

  const { data: project, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
  });

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setStatus(project.status);
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: (updatedProject: Partial<Project>) => 
      apiRequest("PUT", `/api/projects/${projectId}`, updatedProject)
        .then(res => {
          if (!res.ok) throw new Error("Failed to update project");
          return res.json();
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setEditMode(false);
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  });

  const addTechnologyMutation = useMutation({
    mutationFn: (technology: string) => 
      apiRequest("POST", `/api/projects/${projectId}/technologies`, { technology })
        .then(res => {
          if (!res.ok) throw new Error("Failed to add technology");
          return res.json();
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      setNewTechnology("");
      toast({
        title: "Success",
        description: "Technology added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add technology",
        variant: "destructive",
      });
    }
  });

  const removeTechnologyMutation = useMutation({
    mutationFn: (technology: string) => 
      apiRequest("DELETE", `/api/projects/${projectId}/technologies/${technology}`, {})
        .then(res => {
          if (!res.ok) throw new Error("Failed to remove technology");
          return res.json();
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      toast({
        title: "Success",
        description: "Technology removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove technology",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ name, description, status });
  };

  const handleAddTechnology = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTechnology.trim()) {
      addTechnologyMutation.mutate(newTechnology.trim());
    }
  };

  const handleRemoveTechnology = (technology: string) => {
    removeTechnologyMutation.mutate(technology);
  };

  const getStatusBg = (statusValue: string) => {
    switch (statusValue.toLowerCase()) {
      case 'active':
        return 'bg-[#4CAF50] text-white';
      case 'in progress':
        return 'bg-[#FF9800] text-black';
      case 'completed':
        return 'bg-accent text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-4 h-4 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white border-4 border-black p-8 brutal-shadow text-center">
        <h2 className="font-heading text-2xl font-bold mb-4">Project Not Found</h2>
        <p className="mb-6">The project you're looking for does not exist or has been deleted.</p>
        <Link href="/projects">
          <a className="bg-accent text-white font-bold py-2 px-4 border-2 border-black brutal-shadow brutal-button inline-block">
            Back to Projects
          </a>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Link href="/projects">
            <a className="text-gray-600 hover:text-black">
              <i className="ri-arrow-left-line text-xl"></i>
            </a>
          </Link>
          {!editMode ? (
            <h1 className="font-heading text-3xl md:text-4xl font-bold">{project.name}</h1>
          ) : (
            <div className="font-heading text-3xl md:text-4xl font-bold">Edit Project</div>
          )}
          {!editMode && (
            <span className={`${getStatusBg(project.status)} text-xs px-2 py-1 font-bold`}>
              {project.status.toUpperCase()}
            </span>
          )}
        </div>
        
        {!editMode ? (
          <div className="flex gap-2">
            <CreateProjectButton 
              label="Edit Project"
              variant="secondary"
              mode="edit"
              project={project}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
              }}
            />
          </div>
        ) : (
          <button 
            className="bg-black text-white font-bold py-2 px-4 border-2 border-black brutal-shadow brutal-button flex items-center gap-2"
            onClick={() => setEditMode(false)}
          >
            <i className="ri-close-line"></i>
            <span>Cancel</span>
          </button>
        )}
      </div>
      
      {!editMode ? (
        <div className="bg-white border-4 border-black p-6 brutal-shadow mb-8">
          <div className="mb-6">
            <h2 className="font-heading text-xl font-bold mb-2">Description</h2>
            <p>{project.description}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="font-heading text-xl font-bold mb-2">Technologies</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.map((tech, i) => (
                <span key={i} className="bg-black text-white px-2 py-1 text-sm">
                  {tech}
                </span>
              ))}
            </div>
            
            <form onSubmit={handleAddTechnology} className="flex gap-2">
              <input
                type="text"
                placeholder="Add technology..."
                className="flex-1 border-2 border-black p-2"
                value={newTechnology}
                onChange={(e) => setNewTechnology(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-accent text-white px-4 border-2 border-black brutal-shadow brutal-button"
                disabled={addTechnologyMutation.isPending}
              >
                {addTechnologyMutation.isPending ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></span>
                ) : (
                  <i className="ri-add-line"></i>
                )}
              </button>
            </form>
          </div>
          
          <div>
            <h2 className="font-heading text-xl font-bold mb-2">Team</h2>
            <div className="flex flex-wrap gap-4">
              {project.collaborators.map((user, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border-2 border-black brutal-shadow">
                  <div className={`w-10 h-10 rounded-full border-2 border-black ${i % 2 === 0 ? 'bg-accent text-white' : 'bg-secondary text-black'} flex items-center justify-center font-bold`}>
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.role || 'Collaborator'}</div>
                  </div>
                </div>
              ))}
              
              <button className="p-3 border-2 border-dashed border-black flex items-center gap-2 hover:bg-gray-50">
                <i className="ri-user-add-line"></i>
                <span>Add Team Member</span>
              </button>
            </div>
          </div>
          
          <div className="mt-6 p-3 border-t-2 border-dashed border-black">
            <div className="flex justify-between text-sm text-gray-600">
              <div>Created: {formatDate(project.createdAt)}</div>
              <div>Last updated: {formatDate(project.updatedAt)}</div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border-4 border-black p-6 brutal-shadow mb-8">
          <div className="mb-6">
            <label className="block font-bold mb-2">Project Name</label>
            <input
              type="text"
              className="w-full border-2 border-black p-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block font-bold mb-2">Description</label>
            <textarea
              className="w-full border-2 border-black p-3 h-32"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block font-bold mb-2">Status</label>
            <select
              className="w-full border-2 border-black p-3"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="active">Active</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block font-bold mb-2">Technologies</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.map((tech, i) => (
                <div key={i} className="bg-black text-white px-2 py-1 text-sm flex items-center gap-1">
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTechnology(tech)}
                    className="ml-1 text-white hover:text-red-300"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="bg-white font-bold py-2 px-4 border-2 border-black brutal-shadow brutal-button"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-accent text-white font-bold py-2 px-4 border-2 border-black brutal-shadow brutal-button"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="">
          <h2 className="font-heading text-2xl font-bold mb-4">Project Templates</h2>
          <div className="bg-white border-4 border-black p-6 brutal-shadow h-full">
            <p className="text-md text-gray-700 mb-4">
              Add solution templates, workflows, research plans, or prototype tests to enhance your project.
            </p>
            <ProjectTemplates projectId={projectId} compact={true} />
          </div>
        </div>

        <div className="">
          <h2 className="font-heading text-2xl font-bold mb-4">Research Planning Assistant</h2>
          <div className="bg-white border-4 border-black p-6 brutal-shadow h-full">
            <div className="space-y-4">
              <p className="mb-4 text-gray-700">
                Use the Research Planning Assistant to create detailed research plans, define your target audience, 
                establish methodologies, and track research progress.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border-2 border-black p-4 brutal-shadow">
                  <div className="font-bold">User Research</div>
                  <p className="text-sm text-gray-600 mb-2">Define target users and research methods</p>
                  <div className="flex">
                    <div className="w-2/3 h-2 bg-accent"></div>
                    <div className="w-1/3 h-2 bg-gray-200"></div>
                  </div>
                </div>
                
                <div className="border-2 border-black p-4 brutal-shadow">
                  <div className="font-bold">Market Analysis</div>
                  <p className="text-sm text-gray-600 mb-2">Competitor and market trend research</p>
                  <div className="flex">
                    <div className="w-1/4 h-2 bg-primary"></div>
                    <div className="w-3/4 h-2 bg-gray-200"></div>
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-black text-white font-bold py-3 px-4 border-2 border-black brutal-shadow brutal-button flex items-center justify-center gap-2">
                <i className="ri-add-line"></i>
                <span>Create New Research Plan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-heading text-2xl font-bold mb-4">Project Activity</h2>
          <div className="bg-white border-4 border-black p-4 brutal-shadow">
            {project.activities.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No activity recorded yet</div>
            ) : (
              <div className="space-y-4">
                {project.activities.map((activity, i) => {
                  const activityTypes: Record<string, { icon: string, bg: string }> = {
                    'commit': { icon: 'ri-git-commit-line', bg: 'bg-accent text-white' },
                    'ai': { icon: 'ri-robot-fill', bg: 'bg-primary text-black' },
                    'user': { icon: 'ri-user-add-line', bg: 'bg-secondary text-black' },
                    'deployment': { icon: 'ri-check-line', bg: 'bg-[#4CAF50] text-white' }
                  };
                  
                  const { icon, bg } = activityTypes[activity.type] || { icon: 'ri-information-line', bg: 'bg-gray-500 text-white' };
                  
                  return (
                    <div key={i} className="flex gap-3">
                      <div className={`w-8 h-8 ${bg} border-2 border-black flex-shrink-0 flex items-center justify-center`}>
                        <i className={icon}></i>
                      </div>
                      <div>
                        <div className="font-medium">{activity.description}</div>
                        <div className="text-sm text-gray-600">{formatDate(activity.timestamp)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="font-heading text-2xl font-bold mb-4">AI Actions</h2>
          <div className="bg-white border-4 border-black p-4 brutal-shadow">
            <div className="space-y-4">
              <button className="w-full bg-white font-bold py-3 px-4 border-2 border-black brutal-shadow brutal-button flex items-center gap-2">
                <i className="ri-file-text-line"></i>
                <span>Generate Documentation</span>
              </button>
              
              <button className="w-full bg-white font-bold py-3 px-4 border-2 border-black brutal-shadow brutal-button flex items-center gap-2">
                <i className="ri-code-line"></i>
                <span>Generate Boilerplate Code</span>
              </button>
              
              <button className="w-full bg-white font-bold py-3 px-4 border-2 border-black brutal-shadow brutal-button flex items-center gap-2">
                <i className="ri-bug-line"></i>
                <span>Debug Project Issues</span>
              </button>
              
              <button className="w-full bg-primary text-black font-bold py-3 px-4 border-2 border-black brutal-shadow brutal-button flex items-center gap-2">
                <i className="ri-robot-fill"></i>
                <span>Ask AI About This Project</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetail;

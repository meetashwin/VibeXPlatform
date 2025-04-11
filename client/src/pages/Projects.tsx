import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Project } from "@/lib/types";
import ProjectCard from "@/components/dashboard/ProjectCard";
import { CreateProjectButton } from "@/components/dashboard/CreateProjectForm";
import { useToast } from "@/hooks/use-toast";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  // Ensure projects is properly typed
  const projects: Project[] = data || [];

  const filteredProjects = projects
    .filter((project: Project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filter === "all" || project.status.toLowerCase() === filter.toLowerCase();
      
      return matchesSearch && matchesFilter;
    });

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="font-heading text-3xl md:text-4xl font-bold">Your Projects</h1>
          {/* Use our new CreateProjectForm component */}
          <div className="mt-4 md:mt-0">
            <CreateProjectButton />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full border-2 border-black p-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button 
              className={`px-3 py-2 border-2 border-black ${filter === 'all' ? 'bg-black text-white' : 'bg-white'} brutal-button`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`px-3 py-2 border-2 border-black ${filter === 'active' ? 'bg-[#4CAF50] text-white' : 'bg-white'} brutal-button`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button 
              className={`px-3 py-2 border-2 border-black ${filter === 'in progress' ? 'bg-[#FF9800] text-black' : 'bg-white'} brutal-button`}
              onClick={() => setFilter('in progress')}
            >
              In Progress
            </button>
            <button 
              className={`px-3 py-2 border-2 border-black ${filter === 'completed' ? 'bg-accent text-white' : 'bg-white'} brutal-button`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : (
          <>
            {filteredProjects.length === 0 ? (
              <div className="col-span-full bg-white border-4 border-black p-8 brutal-shadow text-center">
                <h3 className="font-heading font-bold text-xl mb-2">No Projects Found</h3>
                <p className="mb-4">
                  {searchTerm || filter !== 'all' 
                    ? "Try changing your search or filter"
                    : "You don't have any projects yet"}
                </p>
                {!searchTerm && filter === 'all' && (
                  <Link href="/projects/new" className="inline-block bg-accent text-white font-bold py-2 px-4 border-2 border-black brutal-shadow brutal-button">
                    Create Your First Project
                  </Link>
                )}
              </div>
            ) : (
              filteredProjects.map((project: Project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Projects;

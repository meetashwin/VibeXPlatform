import { Link } from "wouter";
import { formatDate, getInitials } from "@/lib/utils";
import { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const getStatusBg = (status: string) => {
    switch (status.toLowerCase()) {
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

  return (
    <div className="mb-4 bg-white border-4 border-black p-4 brutal-shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex gap-2 items-center">
            <h3 className="font-heading font-bold text-xl">{project.name}</h3>
            <span className={`${getStatusBg(project.status)} text-xs px-2 py-1 font-bold`}>
              {project.status.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-700 mt-1">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/projects/${project.id}`} className="p-2 border-2 border-black brutal-shadow brutal-button">
            <i className="ri-edit-line"></i>
          </Link>
          <button className="p-2 border-2 border-black brutal-shadow brutal-button">
            <i className="ri-more-2-fill"></i>
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.technologies.map((tech, i) => (
          <span key={i} className="bg-black text-white px-2 py-1 text-sm">
            {tech}
          </span>
        ))}
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="flex -space-x-2">
          {project.collaborators.map((user, i) => (
            <div 
              key={i} 
              className={`w-8 h-8 rounded-full border-2 border-black ${i % 2 === 0 ? 'bg-accent text-white' : 'bg-secondary text-black'} flex items-center justify-center text-xs font-bold`}
            >
              {getInitials(user.name)}
            </div>
          ))}
        </div>
        <div className="text-sm">Updated {formatDate(project.updatedAt)}</div>
      </div>
    </div>
  );
};

export default ProjectCard;

import { Link, useLocation } from "wouter";
import { useUser } from "@/context/UserContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [location] = useLocation();
  const { user, logout } = useUser();

  return (
    <div className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white border-l-4 border-black transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 z-50`}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <div className="font-heading font-bold text-xl">MENU</div>
          <button onClick={onClose} className="p-2">
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>
        
        <nav className="flex flex-col gap-4">
          <Link 
            href="/"
            className={`font-medium py-2 border-b-2 border-dashed border-black ${location === "/" ? "font-bold" : ""}`}
            onClick={onClose}
          >
            Dashboard
          </Link>
          <Link 
            href="/projects"
            className={`font-medium py-2 border-b-2 border-dashed border-black ${location === "/projects" ? "font-bold" : ""}`}
            onClick={onClose}
          >
            Projects
          </Link>
          <Link 
            href="/documentation"
            className={`font-medium py-2 border-b-2 border-dashed border-black ${location === "/documentation" ? "font-bold" : ""}`}
            onClick={onClose}
          >
            Documentation
          </Link>
          <Link 
            href="/workflow"
            className={`font-medium py-2 border-b-2 border-dashed border-black ${location === "/workflow" ? "font-bold" : ""}`}
            onClick={onClose}
          >
            Agent Workflow
          </Link>
          <Link 
            href="/immersive-workflow"
            className={`font-medium py-2 border-b-2 border-dashed border-black ${location === "/immersive-workflow" ? "font-bold" : ""}`}
            onClick={onClose}
          >
            3D Workflow
          </Link>
          <Link 
            href="/settings"
            className={`font-medium py-2 border-b-2 border-dashed border-black ${location === "/settings" ? "font-bold" : ""}`}
            onClick={onClose}
          >
            Settings
          </Link>
        </nav>
        
        <div className="mt-auto pt-4">
          <button className="w-full bg-black text-white py-3 border-2 border-black brutal-shadow brutal-button flex items-center justify-center gap-2">
            <i className="ri-search-line"></i>
            <span>Search</span>
          </button>
          
          {user && (
            <>
              <div className="mt-4 flex items-center gap-3 p-3 border-2 border-black">
                <div className="w-10 h-10 bg-secondary border-2 border-black flex items-center justify-center">
                  <span className="font-bold">{user.initials}</span>
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
              </div>
              <button 
                onClick={logout}
                className="mt-4 w-full bg-white text-red-600 py-3 border-2 border-black brutal-shadow brutal-button flex items-center justify-center gap-2"
              >
                <i className="ri-logout-box-line"></i>
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;

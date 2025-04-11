import { Link, useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { getInitials } from "@/lib/utils";
import { useEffect } from "react";

interface HeaderProps {
  toggleMenu: () => void;
}

const Header = ({ toggleMenu }: HeaderProps) => {
  const [location] = useLocation();
  const { user, logout } = useUser();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('profile-dropdown');
      const profileButton = document.getElementById('profile-button');
      
      if (dropdown && !dropdown.classList.contains('hidden') && 
          profileButton && !profileButton.contains(event.target as Node) && 
          !dropdown.contains(event.target as Node)) {
        dropdown.classList.add('hidden');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white border-b-4 border-black sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2" id="logo-target">
          <div className="h-10 w-10 bg-primary border-2 border-black brutal-shadow-lg flex items-center justify-center">
            <i className="ri-robot-fill text-black text-xl"></i>
          </div>
          <span className="font-heading font-bold text-2xl tracking-tight">VibeX</span>
        </Link>
        
        <div className="hidden md:flex gap-6 items-center">
          <nav className="flex gap-6" id="navigation-target">
            <Link href="/" className={`font-medium hover:underline underline-offset-4 decoration-primary decoration-4 ${location === "/" ? "underline" : ""}`} id="dashboard-link">
              Dashboard
            </Link>
            <Link href="/projects" className={`font-medium hover:underline underline-offset-4 decoration-primary decoration-4 ${location === "/projects" ? "underline" : ""}`} id="projects-link">
              Projects
            </Link>
            <Link href="/documentation" className={`font-medium hover:underline underline-offset-4 decoration-primary decoration-4 ${location === "/documentation" ? "underline" : ""}`} id="documentation-link">
              Documentation
            </Link>
            <Link href="/workflow" className={`font-medium hover:underline underline-offset-4 decoration-primary decoration-4 ${location === "/workflow" ? "underline" : ""}`} id="agent-workflow-link">
              Agent Workflow
            </Link>
            <Link href="/immersive-workflow" className={`font-medium hover:underline underline-offset-4 decoration-primary decoration-4 ${location === "/immersive-workflow" ? "underline" : ""}`} id="immersive-workflow-link">
              3D Workflow
            </Link>
            <Link href="/platform-sdk" className={`font-medium hover:underline underline-offset-4 decoration-primary decoration-4 ${location === "/platform-sdk" ? "underline" : ""}`} id="platform-sdk-link">
              Platform SDK
            </Link>
            <Link href="/settings" className={`font-medium hover:underline underline-offset-4 decoration-primary decoration-4 ${location === "/settings" ? "underline" : ""}`} id="settings-link">
              Settings
            </Link>
          </nav>
          
          <button className="flex items-center gap-2 bg-black text-white px-4 py-2 border-2 border-black brutal-shadow brutal-button" id="search-button">
            <i className="ri-search-line"></i>
            <span>Search</span>
          </button>
          
          <div className="relative" id="profile-target">
            <button 
              id="profile-button"
              onClick={() => {
                const menu = document.getElementById('profile-dropdown');
                if (menu) {
                  menu.classList.toggle('hidden');
                }
              }}
              className="w-10 h-10 bg-secondary border-2 border-black brutal-shadow flex items-center justify-center cursor-pointer"
            >
              <span className="font-bold">{user ? getInitials(user.name) : "JD"}</span>
            </button>
            <div id="profile-dropdown" className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white border-2 border-black brutal-shadow hidden z-50">
              <div className="px-4 py-2 font-medium">
                {user?.name || "User"}
                <div className="text-sm text-muted-foreground">{user?.email}</div>
              </div>
              <div className="border-t border-gray-200"></div>
              <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                <i className="ri-settings-line mr-2"></i>
                Settings
              </Link>
              <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer">
                <i className="ri-logout-box-line mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <button className="md:hidden" onClick={toggleMenu} id="mobile-menu-button">
          <i className="ri-menu-line text-2xl"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;

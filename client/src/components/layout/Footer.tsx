import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-6 border-t-4 border-primary mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary border-2 border-white flex items-center justify-center">
                <i className="ri-robot-fill text-black text-lg"></i>
              </div>
              <span className="font-heading font-bold text-xl">AI-DEV</span>
            </div>
            <p className="text-sm mt-2">AI-powered software development platform</p>
          </div>
          
          <div className="flex gap-8 text-sm">
            <div>
              <h3 className="font-heading font-bold mb-2">Product</h3>
              <ul className="space-y-1">
                <li><Link href="#" className="hover:text-primary">Features</Link></li>
                <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary">Roadmap</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-heading font-bold mb-2">Resources</h3>
              <ul className="space-y-1">
                <li><Link href="/documentation" className="hover:text-primary">Documentation</Link></li>
                <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-heading font-bold mb-2">Connect</h3>
              <ul className="space-y-1">
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">GitHub</a></li>
                <li><a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Discord</a></li>
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Twitter</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">© {new Date().getFullYear()} AI-DEV. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-sm hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-sm hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

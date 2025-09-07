import React from 'react';
import { Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1c1917]/80 backdrop-blur-sm py-6 border-t-[0.5px] border-[#4ECBD9]/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-neutral-400 text-sm flex items-center">
            <span>Made with</span>
            <Heart size={16} className="text-[#F471B5] mx-1" />
            <span>for ton.band sessions</span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="text-neutral-400 hover:text-primary-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={20} />
            </a>
            <span className="text-neutral-400 text-sm">2025</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
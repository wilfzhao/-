import React, { useState, useRef, useEffect } from 'react';
import { Grid, Settings, Activity, MoreHorizontal, ChevronDown } from 'lucide-react';

interface HeaderProps {
  items: string[];
}

const Header: React.FC<HeaderProps> = ({ items }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.slice(0, 7);
  const overflowItems = items.slice(7);
  const hasOverflow = overflowItems.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="h-14 bg-blue-600 text-white flex items-center justify-between px-4 shadow-md sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="bg-white/20 p-1.5 rounded-lg">
             <Activity className="text-white" size={20} />
          </div>
          <span>智慧管理平台</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-1">
          {visibleItems.map((item, index) => (
            <button 
              key={index}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                item === '管理配置' 
                  ? 'bg-blue-700/50 text-white' 
                  : 'text-blue-100 hover:bg-blue-500/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {item === '管理配置' && <Grid size={14} />}
                {item}
              </div>
            </button>
          ))}

          {hasOverflow && (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                   isMenuOpen ? 'bg-blue-700/50 text-white' : 'text-blue-100 hover:bg-blue-500/50 hover:text-white'
                }`}
              >
                <MoreHorizontal size={16} />
                <ChevronDown size={12} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {overflowItems.map((item, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-blue-100">
           <span className="text-lg font-bold italic">Ai</span> 助手
        </div>
        <div className="h-6 w-px bg-blue-400/50"></div>
        <div className="flex items-center gap-2">
           <img 
             src="https://picsum.photos/32/32" 
             alt="User" 
             className="w-8 h-8 rounded-full border-2 border-white/20" 
           />
           <span>赵伟峰</span>
        </div>
        <Settings size={18} className="cursor-pointer hover:text-blue-200" />
      </div>
    </header>
  );
};

export default Header;
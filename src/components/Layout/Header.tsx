import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onMenuToggle }) => {
  return (
    <header className="bg-pet-green text-white p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-pet-light-green rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-200">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

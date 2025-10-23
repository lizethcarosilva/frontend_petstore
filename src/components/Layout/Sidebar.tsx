import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Package, 
  PawPrint,
  Building2,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/mascotas', icon: PawPrint, label: 'Mascotas' },
    { path: '/usuarios', icon: Users, label: 'Usuarios' },
    { path: '/citas', icon: Calendar, label: 'Citas' },
    { path: '/facturas', icon: FileText, label: 'Facturas' },
    { path: '/inventario', icon: Package, label: 'Inventario' },
    { path: '/tenants', icon: Building2, label: 'Empresas' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`bg-pet-green text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-pet-light-green">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <PawPrint className="w-8 h-8" />
              <span className="text-xl font-bold">PET STORE</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-pet-light-green rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-pet-light-green">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-pet-light-green rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.nombre?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                Bienvenido {user?.nombre}
              </p>
              <p className="text-xs text-gray-300 truncate">
                {user?.rol?.nombre}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <div className="w-8 h-8 bg-pet-light-green rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.nombre?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={`sidebar-item w-full ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

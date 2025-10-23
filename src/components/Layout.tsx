import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Package, 
  Building2,
  Heart,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { tenantAPI } from '../services/api';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tenantName, setTenantName] = useState<string>('PET STORE');
  
  console.log('Usuario actual:', user);

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Usuarios', path: '/users', icon: Users },
    { name: 'Tenants', path: '/tenants', icon: Building2 },
    { name: 'Mascotas', path: '/pets', icon: Heart },
    { name: 'Servicios', path: '/services', icon: Package },
    { name: 'Productos', path: '/products', icon: Package },
    { name: 'Facturas', path: '/invoices', icon: FileText },
    { name: 'Citas', path: '/appointments', icon: Calendar },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Cargar el nombre del tenant cuando el usuario esté disponible
  useEffect(() => {
    const loadTenantName = async () => {
      if (user?.tenantId) {
        try {
          console.log('Cargando tenant con ID:', user.tenantId);
          // getById ya construye el body automáticamente
          const response = await tenantAPI.getById(user.tenantId);
          console.log('Respuesta del tenant:', response.data);

          // response.data ya es el objeto del tenant, no un array
          if (response && response.data && response.data.razonSocial) {
            setTenantName(response.data.razonSocial);
            console.log('Nombre del tenant cargado:', response.data.razonSocial);
          }
        } catch (error) {
          console.error('Error al cargar el nombre del tenant:', error);
          // Mantener el valor por defecto si hay error
          setTenantName('PET STORE');
        }
      }
    };

    loadTenantName();
  }, [user?.tenantId]); // Se ejecuta cuando cambia el tenantId del usuario

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-green-800 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 lg:w-64 lg:flex-shrink-0
      `}>
        <div className="flex items-center justify-between h-16 px-4 bg-green-900">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">{tenantName}</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive(item.path)
                      ? 'bg-green-700 text-white'
                      : 'text-green-100 hover:bg-green-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                  {isActive(item.path) && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User profile section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-green-900">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">
                Bienvenido, {user?.name || 'Usuario'}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-green-200 hover:text-white"
              >
                Cerrar sesión
              </button>
            </div>
            <ChevronRight className="h-4 w-4 text-green-200" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigationItems.find(item => isActive(item.path))?.name || 'Dashboard'}
              </h1>
              <h1 className="text-xl font-semibold text-gray-900">

              </h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

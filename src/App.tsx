import React from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { ShoppingCartProvider } from './contexts/ShoppingCartContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Clients from './pages/Clients';
import Tenants from './pages/Tenants';
import Pets from './pages/Pets';
import Services from './pages/Services';
import Products from './pages/Products';
import Invoices from './pages/Invoices';
import Appointments from './pages/Appointments';
import MedicalHistory from './pages/MedicalHistory';
import Vaccinations from './pages/Vaccinations';
import Layout from './components/Layout';
import './App.css';

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const RoleProtectedRoute: React.FC<{ 
  children: ReactNode; 
  allowedRoles: string[] 
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const userRolId = user?.rol_id?.toString() || '';
  
  // Si allowedRoles incluye 'all', permitir a todos los autenticados
  if (allowedRoles.includes('all')) {
    return <>{children}</>;
  }

  // Verificar si el usuario tiene uno de los roles permitidos
  if (allowedRoles.includes(userRolId)) {
    return <>{children}</>;
  }

  // Si no tiene permiso, redirigir al dashboard
  return <Navigate to="/dashboard" replace />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route 
          path="users" 
          element={
            <RoleProtectedRoute allowedRoles={['1', '2']}>
              <Users />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="tenants" 
          element={
            <RoleProtectedRoute allowedRoles={['1']}>
              <Tenants />
            </RoleProtectedRoute>
          } 
        />
        <Route path="clients" element={<Clients />} />
        <Route path="pets" element={<Pets />} />
        <Route path="services" element={<Services />} />
        <Route path="products" element={<Products />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="appointments" element={<Appointments />} />
        <Route 
          path="medical-history" 
          element={
            <RoleProtectedRoute allowedRoles={['all']}>
              <MedicalHistory />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="vaccinations" 
          element={
            <RoleProtectedRoute allowedRoles={['all']}>
              <Vaccinations />
            </RoleProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <ShoppingCartProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
        </ShoppingCartProvider>
      </TenantProvider>
    </AuthProvider>
  );
}

export default App;

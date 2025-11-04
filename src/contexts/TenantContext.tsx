import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface TenantContextType {
  selectedTenantId: string | null;
  setSelectedTenantId: (tenantId: string | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [selectedTenantId, setSelectedTenantIdState] = useState<string | null>(null);

  // Inicializar con el tenant del usuario autenticado
  useEffect(() => {
    if (user?.tenantId) {
      setSelectedTenantIdState(user.tenantId);
    }
  }, [user?.tenantId]);

  const setSelectedTenantId = (tenantId: string | null) => {
    setSelectedTenantIdState(tenantId);
    // Guardar en localStorage para persistir entre sesiones
    if (tenantId) {
      localStorage.setItem('selectedTenantId', tenantId);
    } else {
      localStorage.removeItem('selectedTenantId');
    }
  };

  // Cargar tenant seleccionado desde localStorage al iniciar
  useEffect(() => {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId) {
      setSelectedTenantIdState(storedTenantId);
      // Guardar en localStorage si no está
      localStorage.setItem('selectedTenantId', storedTenantId);
    } else if (user?.tenantId) {
      setSelectedTenantIdState(user.tenantId);
      localStorage.setItem('selectedTenantId', user.tenantId);
    }
  }, [user?.tenantId]);

  // Obtener el tenant activo: si es SuperAdmin puede seleccionar, si no usa el suyo
  const activeTenantId = selectedTenantId || user?.tenantId || null;

  const value: TenantContextType = {
    selectedTenantId: activeTenantId,
    setSelectedTenantId,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};


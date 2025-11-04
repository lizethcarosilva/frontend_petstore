import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginRequest, LoginResponse } from '../types/types';
import { userAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;

  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser && storedUser !== 'undefined') {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Limpiar localStorage si hay datos corruptos
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Usar API real
      const response = await userAPI.login(credentials);
      
      // Verificar que la respuesta sea exitosa y tenga datos
      if (!response || !response.data) {
        console.error('No se recibieron datos del backend');
        return false;
      }
      
      // El backend devuelve todos los datos en el mismo nivel
      const loginData = response.data;
      
      // Si la respuesta es un string de error, el login falló
      if (typeof loginData === 'string') {
        console.error('Error del backend:', loginData);
        // Lanzar error para que se capture en el catch
        throw new Error(loginData);
      }
      
      const newToken = loginData.token;
      
      // Verificar que se recibió el token
      if (!newToken) {
        console.error('No se recibió token del backend');
        console.log('Login response:', loginData);
        throw new Error('No se recibió token del servidor');
      }
      
      // Construir el objeto user con los datos que vienen en la respuesta
      const userData: User = {
        user_id: loginData.userId?.toString() || loginData.user_id?.toString(),
        name: loginData.name,
        ident: loginData.ident || '',
        correo: loginData.correo,
        telefono: loginData.telefono || '',
        direccion: loginData.direccion || '',
        rol_id: loginData.rolId || loginData.role || loginData.rol_id,
        activo: loginData.activo !== false,
        tenantId: loginData.tenantId || loginData.tenant_id || '',
      };

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      
      // Extraer el mensaje de error del backend
      let errorMessage = 'Error al iniciar sesión';
      
      if (error?.response?.data) {
        // El backend puede devolver el error como string directo
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Lanzar el error con el mensaje para que se capture en Login.tsx
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
# 🛠️ GUÍA TÉCNICA PARA DESARROLLADORES

## 📋 Tabla de Contenidos

1. [Configuración del Entorno](#1-configuración-del-entorno)
2. [Estructura del Proyecto](#2-estructura-del-proyecto)
3. [Convenciones de Código](#3-convenciones-de-código)
4. [Componentes Reutilizables](#4-componentes-reutilizables)
5. [Servicios API](#5-servicios-api)
6. [Estado y Contextos](#6-estado-y-contextos)
7. [Routing y Navegación](#7-routing-y-navegación)
8. [Estilos y UI](#8-estilos-y-ui)
9. [Testing](#9-testing)
10. [Deploy](#10-deploy)

---

## 1. Configuración del Entorno

### 1.1 Requisitos Previos

```bash
# Node.js (versión 18 o superior)
node --version  # v18.x.x o superior

# npm (viene con Node.js)
npm --version   # 9.x.x o superior

# Git
git --version
```

### 1.2 Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd frontend_petstore

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional)
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev
```

### 1.3 Variables de Entorno

```env
# .env
VITE_API_BASE_URL=http://localhost:8090
VITE_IA_API_BASE_URL=http://localhost:8000
```

### 1.4 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo (puerto 5173)

# Build
npm run build        # Genera build de producción
npm run preview      # Preview del build

# Linting y Formato
npm run lint         # Ejecuta ESLint
npm run type-check   # Verifica tipos TypeScript
```

---

## 2. Estructura del Proyecto

```
frontend_petstore/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── Chatbot.tsx
│   │   ├── ClusteringDashboard.tsx
│   │   ├── Layout.tsx
│   │   └── Pagination.tsx
│   ├── contexts/           # Context API
│   │   ├── AuthContext.tsx
│   │   ├── TenantContext.tsx
│   │   └── ShoppingCartContext.tsx
│   ├── hooks/              # Custom hooks
│   │   └── usePagination.ts
│   ├── pages/              # Páginas principales
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Clients.tsx
│   │   ├── Tenants.tsx
│   │   ├── Pets.tsx
│   │   ├── Services.tsx
│   │   ├── Products.tsx
│   │   ├── Appointments.tsx
│   │   ├── Invoices.tsx
│   │   ├── MedicalHistory.tsx
│   │   └── Vaccinations.tsx
│   ├── services/           # Servicios y API
│   │   └── api.ts
│   ├── types/              # TypeScript types
│   │   └── types.ts
│   ├── App.tsx             # Componente raíz
│   ├── App.css             # Estilos globales
│   └── main.tsx            # Entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 3. Convenciones de Código

### 3.1 Nomenclatura

**Componentes**: PascalCase
```typescript
// ✅ Correcto
function UserCard() {}
const ProductList = () => {};

// ❌ Incorrecto
function userCard() {}
const product_list = () => {};
```

**Variables y funciones**: camelCase
```typescript
// ✅ Correcto
const userName = 'John';
const fetchUserData = async () => {};

// ❌ Incorrecto
const UserName = 'John';
const fetch_user_data = async () => {};
```

**Constantes**: UPPER_SNAKE_CASE
```typescript
// ✅ Correcto
const API_BASE_URL = 'http://localhost:8090';
const MAX_ITEMS_PER_PAGE = 10;
```

**Interfaces y Types**: PascalCase con prefijo "I" opcional
```typescript
// ✅ Correcto
interface User {}
interface IUserProfile {}
type UserRole = 'admin' | 'user';
```

### 3.2 Estructura de Componentes

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';

// 1. Interfaces/Types
interface UserCardProps {
  userId: string;
  onUpdate?: () => void;
}

// 2. Componente principal
const UserCard: React.FC<UserCardProps> = ({ userId, onUpdate }) => {
  // 3. Hooks
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // 4. Effects
  useEffect(() => {
    loadUser();
  }, [userId]);

  // 5. Funciones
  const loadUser = async () => {
    try {
      setLoading(true);
      // ... lógica
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 6. Renderizado condicional
  if (loading) return <div>Loading...</div>;

  // 7. JSX principal
  return (
    <div className="user-card">
      {/* contenido */}
    </div>
  );
};

export default UserCard;
```

### 3.3 Manejo de Errores

```typescript
// ✅ Siempre usar try-catch en operaciones async
const fetchData = async () => {
  try {
    const response = await api.get('/data');
    setData(response.data);
  } catch (error: any) {
    console.error('Error fetching data:', error);
    // Mostrar mensaje al usuario
    alert(error.response?.data?.message || 'Error desconocido');
  } finally {
    setLoading(false);
  }
};
```

### 3.4 TypeScript - Tipado Estricto

```typescript
// ✅ Tipar props
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// ✅ Tipar estados
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);

// ✅ Tipar funciones
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

---

## 4. Componentes Reutilizables

### 4.1 Pagination Component

```typescript
import Pagination from '../components/Pagination';

// Uso en un componente
const MyComponent = () => {
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage
  } = usePagination({
    data: filteredItems,
    itemsPerPage: 10
  });

  return (
    <>
      {/* Tabla con paginatedData */}
      <table>
        {paginatedData.map(item => (
          <tr key={item.id}>{/* ... */}</tr>
        ))}
      </table>

      {/* Componente de paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredItems.length}
        itemsPerPage={10}
        onPageChange={goToPage}
        itemName="items"
      />
    </>
  );
};
```

### 4.2 Chatbot Component

```typescript
import Chatbot from '../components/Chatbot';

// Uso
<Chatbot usuarioId={user?.user_id?.toString()} />
```

### 4.3 ClusteringDashboard Component

```typescript
import ClusteringDashboard from '../components/ClusteringDashboard';

// Uso (con renderizado condicional)
{iaStats && !isLoadingIA && (
  <ClusteringDashboard />
)}
```

---

## 5. Servicios API

### 5.1 Estructura del Servicio API

```typescript
// src/services/api.ts

import axios from 'axios';

// Instancia principal de Axios
const api = axios.create({
  baseURL: 'http://localhost:8090',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 5.2 Agregar Nuevos Endpoints

```typescript
// Patrón para agregar APIs
export const newResourceAPI = {
  getAll: () => api.get('/api/new-resource'),
  getById: (id: number) => api.get(`/api/new-resource/${id}`),
  create: (data: NewResource) => api.post('/api/new-resource/create', data),
  update: (data: NewResource) => api.put('/api/new-resource/update', data),
  delete: (id: number) => api.delete(`/api/new-resource/${id}`),
};
```

### 5.3 Llamadas a API en Componentes

```typescript
// Patrón recomendado
const MyComponent = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await itemAPI.getAll();
      setData(response.data);
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ...
};
```

---

## 6. Estado y Contextos

### 6.1 AuthContext

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  // Verificar autenticación
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Acceder a datos del usuario
  console.log(user?.name);
  console.log(user?.rol_id);

  return <div>Welcome {user?.name}</div>;
};
```

### 6.2 TenantContext

```typescript
import { useTenant } from '../contexts/TenantContext';

const MyComponent = () => {
  const { selectedTenantId, setSelectedTenantId, tenantName } = useTenant();

  // Filtrar datos por tenant
  const filteredData = data.filter(item => 
    item.tenantId === selectedTenantId
  );

  return <div>Empresa: {tenantName}</div>;
};
```

### 6.3 ShoppingCartContext

```typescript
import { useShoppingCart } from '../contexts/ShoppingCartContext';

const ProductCard = ({ product }) => {
  const { addItem, cart, total } = useShoppingCart();

  const handleAddToCart = () => {
    addItem({
      id: `product-${product.productId}`,
      tipo: 'PRODUCTO',
      productId: product.productId,
      itemNombre: product.nombre,
      cantidad: 1,
      precioUnitario: product.precio,
      descuento: 0,
      subtotal: product.precio,
    });
  };

  return (
    <button onClick={handleAddToCart}>
      Agregar al carrito
    </button>
  );
};
```

---

## 7. Routing y Navegación

### 7.1 Configuración de Rutas

```typescript
// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

<Router>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Layout />}>
      <Route index element={<Navigate to="/dashboard" />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="users" element={<Users />} />
      {/* ... más rutas */}
    </Route>
  </Routes>
</Router>
```

### 7.2 Rutas Protegidas

```typescript
// Componente ProtectedRoute
const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Uso
<Route 
  path="admin" 
  element={
    <ProtectedRoute>
      <AdminPanel />
    </ProtectedRoute>
  } 
/>
```

### 7.3 Navegación Programática

```typescript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navegar a ruta
    navigate('/dashboard');

    // Navegar con parámetros
    navigate(`/users/${userId}`);

    // Navegar hacia atrás
    navigate(-1);

    // Reemplazar en historial
    navigate('/login', { replace: true });
  };
};
```

---

## 8. Estilos y UI

### 8.1 Tailwind CSS - Clases Comunes

```tsx
{/* Contenedor principal */}
<div className="container mx-auto px-4 py-8">

{/* Card */}
<div className="bg-white rounded-lg shadow-md p-6">

{/* Botón primario */}
<button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">

{/* Input */}
<input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />

{/* Badge */}
<span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">

{/* Grid responsive */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### 8.2 Iconos con Lucide React

```typescript
import { 
  User, 
  Calendar, 
  Package, 
  CheckCircle 
} from 'lucide-react';

// Uso
<User className="h-5 w-5 text-gray-600" />
<Calendar className="h-6 w-6 text-blue-600" />
```

### 8.3 Responsive Design

```tsx
{/* Ocultar en móvil, mostrar en desktop */}
<div className="hidden md:block">

{/* Mostrar en móvil, ocultar en desktop */}
<div className="block md:hidden">

{/* Columnas adaptativas */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

{/* Padding responsive */}
<div className="p-4 md:p-6 lg:p-8">
```

---

## 9. Testing

### 9.1 Configuración de Testing (Futuro)

```bash
# Instalar dependencias de testing
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

### 9.2 Ejemplo de Test

```typescript
// UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UserCard from './UserCard';

describe('UserCard', () => {
  it('renders user name', () => {
    render(<UserCard userId="1" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<UserCard userId="1" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

---

## 10. Deploy

### 10.1 Build de Producción

```bash
# Generar build
npm run build

# Los archivos se generan en: dist/
```

### 10.2 Deploy en Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### 10.3 Deploy en Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Deploy a producción
netlify deploy --prod
```

### 10.4 Variables de Entorno en Producción

```bash
# Vercel
vercel env add VITE_API_BASE_URL

# Netlify
netlify env:set VITE_API_BASE_URL https://api.production.com
```

---

## 11. Mejores Prácticas

### 11.1 Performance

```typescript
// ✅ Usar React.memo para componentes que no cambian frecuentemente
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* ... */}</div>;
});

// ✅ Usar useMemo para cálculos costosos
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);

// ✅ Usar useCallback para funciones en props
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

### 11.2 Seguridad

```typescript
// ✅ Sanitizar inputs del usuario
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userInput);

// ✅ Validar datos antes de enviar al backend
const isValid = validateFormData(formData);
if (!isValid) return;

// ✅ No almacenar información sensible en localStorage
// Solo tokens, IDs, no contraseñas ni datos personales
```

### 11.3 Accesibilidad

```tsx
{/* ✅ Usar labels con inputs */}
<label htmlFor="email">Email</label>
<input id="email" type="email" />

{/* ✅ Usar atributos ARIA */}
<button aria-label="Cerrar modal">
  <X />
</button>

{/* ✅ Usar roles semánticos */}
<nav role="navigation">
  <ul role="list">
    <li role="listitem">
```

---

## 12. Debugging

### 12.1 React DevTools

```bash
# Instalar extensión de navegador
# Chrome: React Developer Tools
# Firefox: React Developer Tools
```

### 12.2 Console Logging Estratégico

```typescript
// ✅ Usar console.log con etiquetas
console.log('🔍 Loading data:', data);
console.error('❌ Error:', error);
console.warn('⚠️ Warning:', warning);
console.info('ℹ️ Info:', info);

// ✅ Usar console.table para arrays
console.table(users);

// ✅ Usar console.group para agrupar logs
console.group('User Data');
console.log('Name:', user.name);
console.log('Email:', user.email);
console.groupEnd();
```

### 12.3 Network Debugging

```typescript
// Usar interceptores de Axios para debugging
api.interceptors.request.use(request => {
  console.log('📤 Request:', request.url, request.data);
  return request;
});

api.interceptors.response.use(response => {
  console.log('📥 Response:', response.config.url, response.data);
  return response;
});
```

---

## 13. Recursos Adicionales

### Documentación Oficial
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com/docs/intro)

### Comunidad
- Stack Overflow
- Reddit: r/reactjs
- Discord: Reactiflux

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0



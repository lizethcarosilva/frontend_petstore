# 🔧 Corrección: Mostrar Nombre del Tenant en Layout

## ❌ Problema Original

### Código incorrecto (líneas 49-56):
```tsx
const getTenantName = async () => {
  const response = await tenantAPI.getById(user?.tenantId);
  const tenantName = response.data.razonSocial;
  console.log('tenantName', tenantName);
  console.log('tenantName', response);
  setTenantName(response.data.find((tenant: any) => tenant.tenantId === user?.tenantId)?.name);
  return tenantName;
};

// En el JSX (línea 77):
<span className="ml-2 text-xl font-bold text-white">{getTenantName()}</span>
```

### **Errores identificados:**

1. ❌ **Línea 54**: `response.data.find()` - `response.data` NO es un array, es un objeto
2. ❌ **getById()** devuelve UN solo tenant, no un array de tenants
3. ❌ **Línea 77**: Llamando función `async` directamente en el JSX (no funciona en React)
4. ❌ No estaba usando `useEffect` para cargar los datos

---

## ✅ Solución Implementada

### 1. **Agregar `useEffect` importación**
```tsx
import React, { useState, useEffect } from 'react';
```

### 2. **Inicializar estado con valor por defecto**
```tsx
const [tenantName, setTenantName] = useState<string>('PET STORE');
```

### 3. **Crear useEffect para cargar el tenant**
```tsx
useEffect(() => {
  const loadTenantName = async () => {
    if (user?.tenantId) {
      try {
        console.log('Cargando tenant con ID:', user.tenantId);
        const response = await tenantAPI.getById(user.tenantId);
        console.log('Respuesta del tenant:', response.data);
        
        // response.data ya es el objeto del tenant, NO un array
        if (response.data && response.data.razonSocial) {
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
}, [user?.tenantId]); // ⚠️ Se ejecuta cuando cambia el tenantId
```

### 4. **Usar la variable de estado en el JSX**
```tsx
<span className="ml-2 text-xl font-bold text-white">{tenantName}</span>
```

---

## 📊 Explicación Detallada

### **¿Por qué `response.data` NO es un array?**

```tsx
// Endpoint: GET /api/tenants/getTenantById?id=123
// Respuesta del backend:
{
  "data": {
    "tenantId": "123",
    "razonSocial": "Veterinaria San Francisco",
    "nit": "900123456",
    "direccion": "Calle 123",
    "telefono": "3001234567",
    "email": "contacto@vetsanfrancisco.com",
    "plan": "Premium",
    "activo": true
  }
}

// Por lo tanto:
response.data = {
  tenantId: "123",
  razonSocial: "Veterinaria San Francisco",
  ...
}

// ❌ INCORRECTO: response.data.find() - NO es un array!
// ✅ CORRECTO: response.data.razonSocial - Acceso directo
```

### **¿Por qué usar `useEffect`?**

En React, **NO puedes llamar funciones async directamente en el JSX**:

```tsx
// ❌ INCORRECTO - No funciona
<span>{getTenantName()}</span>

// getTenantName() retorna una Promise, no un string
// JSX mostraría: [object Promise]

// ✅ CORRECTO - Usar useEffect + estado
useEffect(() => {
  loadTenantName(); // Cargar al montar el componente
}, [user?.tenantId]);

<span>{tenantName}</span> // Mostrar el estado
```

---

## 🔄 Flujo de Ejecución

```
1. Usuario hace login
   ↓
2. AuthContext guarda user con tenantId
   ↓
3. Layout se monta
   ↓
4. useEffect detecta que user.tenantId existe
   ↓
5. loadTenantName() hace llamada al API
   ↓
6. tenantAPI.getById(tenantId) devuelve el tenant
   ↓
7. setTenantName(response.data.razonSocial)
   ↓
8. React re-renderiza con el nuevo nombre
   ↓
9. Se muestra "Veterinaria San Francisco" en el sidebar
```

---

## 🎯 Estructura del Tipo Tenant

```typescript
export interface Tenant {
  tenantId?: string;
  razonSocial: string;     // ← Este es el nombre que mostramos
  nit: string;
  direccion: string;
  telefono: string;
  email: string;
  plan: string;
  activo?: boolean;
  configuracion?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

---

## 🧪 Debugging

### **Ver en consola:**

Cuando el componente se carga, verás estos logs:

```
Usuario actual: {
  user_id: "1",
  name: "Admin San Francisco",
  tenantId: "VET001",  ← Debe existir este campo
  ...
}

Cargando tenant con ID: VET001

Respuesta del tenant: {
  tenantId: "VET001",
  razonSocial: "Veterinaria San Francisco",  ← Nombre que se muestra
  nit: "900123456",
  ...
}

Nombre del tenant cargado: Veterinaria San Francisco
```

### **Si NO funciona:**

1. **Verifica que `user.tenantId` existe:**
   ```tsx
   console.log('tenantId del usuario:', user?.tenantId);
   ```

2. **Verifica la respuesta del API:**
   ```tsx
   console.log('Respuesta completa:', response);
   console.log('Data:', response.data);
   ```

3. **Verifica el endpoint en `api.ts`:**
   ```tsx
   getById: (tenantId: string) => api.get(`/api/tenants/getTenantById?id=${tenantId}`),
   ```

---

## ⚠️ Problemas Comunes

### **Problema 1: tenantId es undefined**

```tsx
// Si user.tenantId es undefined:
if (user?.tenantId) { // ← No entra aquí
  // ...
}

// Solución: Asegúrate de que el login devuelva tenantId
// En AuthContext.tsx, al hacer login:
const userData: User = {
  ...
  tenantId: loginData.tenantId, // ← Debe estar presente
};
```

### **Problema 2: Error 403 en la petición**

```
Error al cargar el nombre del tenant: AxiosError 403 Forbidden
```

**Causa**: El backend está bloqueando la petición (Spring Security)

**Solución**: Ver `DEBUG_TOKEN_403.md` para configurar el backend

### **Problema 3: response.data es undefined**

```tsx
console.log(response.data); // undefined
```

**Causa**: El endpoint no está devolviendo datos

**Solución**: Verificar que el endpoint `/api/tenants/getTenantById?id=X` funcione en Postman

---

## ✅ Verificación Final

**El nombre del tenant debe mostrarse en:**

1. ✅ **Sidebar superior** (junto al icono de corazón)
2. ✅ Se carga automáticamente al hacer login
3. ✅ Se actualiza si el usuario cambia (aunque no debería cambiar en una sesión)
4. ✅ Muestra "PET STORE" por defecto si hay error

---

## 📝 Resumen de Cambios

| Archivo | Cambios |
|---------|---------|
| `Layout.tsx` | ✅ Agregado `useEffect` |
| `Layout.tsx` | ✅ Corregida función `loadTenantName()` |
| `Layout.tsx` | ✅ Eliminado `.find()` incorrecto |
| `Layout.tsx` | ✅ Cambiado JSX a usar variable de estado |
| `Layout.tsx` | ✅ Agregado manejo de errores |

---

## 🎉 Resultado

Antes:
```
Sidebar: "PET STORE" (fijo)
```

Después:
```
Sidebar: "Veterinaria San Francisco" (dinámico desde el API)
```

---

**Estado**: ✅ CORREGIDO  
**Funcionalidad**: Mostrar nombre del tenant dinámicamente  
**Archivos modificados**: 1 (Layout.tsx)


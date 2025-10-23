# 🔌 Integración con Backend Spring Boot

Este documento describe cómo el frontend React se integra con el backend Spring Boot del Pet Store.

## 📋 Campos del Backend vs Frontend

### Usuario (User)

**Backend (Spring Boot):**
```java
{
  "user_id": 1,
  "name": "Juan Pérez",
  "tipo_id": "CC",
  "ident": "12345678",
  "correo": "juan@example.com",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67",
  "password": "encrypted",
  "rol_id": "ADMIN",
  "tenant_id": 1,
  "created_on": "2024-01-15T10:30:00",
  "activo": true
}
```

**Frontend (React/TypeScript):**
```typescript
interface User {
  user_id?: string;
  name: string;
  tipo_id?: string;
  ident: string;
  correo: string;
  telefono: string;
  direccion: string;
  password?: string;
  rol_id: string;
  tenant_id?: number;
  created_on?: string;
  activo?: boolean;
}
```

## 🔐 Autenticación

### Login Request

**Formato Esperado por el Backend:**
```json
{
  "correo": "usuario@example.com",
  "password": "contraseña"
}
```

⚠️ **IMPORTANTE:** El backend usa `correo` no `email`

### Login Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "name": "Juan Pérez",
    "correo": "juan@example.com",
    "rol_id": "ADMIN",
    ...
  }
}
```

### Headers de Autorización

El frontend automáticamente envía el token en todas las peticiones:

```javascript
Authorization: Bearer {token}
```

Esto se configura en `src/services/api.ts`:

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🌐 Endpoints del API

### Base URL
```
http://localhost:8090/api
```

### Usuarios
- `POST /users/login` - Iniciar sesión
- `POST /users/create` - Crear usuario
- `GET /users` - Listar usuarios
- `GET /users/{id}` - Obtener usuario
- `PUT /users/{id}` - Actualizar usuario
- `DELETE /users/{id}` - Eliminar usuario (soft delete)

### Mascotas
- `GET /pets` - Listar mascotas
- `POST /pets/create` - Crear mascota
- `POST /pets/getId` - Obtener mascota
- `PUT /pets/update` - Actualizar mascota
- `DELETE /pets/deletePet` - Eliminar mascota

### Servicios
- `GET /services` - Listar servicios
- `POST /services/create` - Crear servicio
- `GET /services/getId` - Obtener servicio
- `PUT /services/update` - Actualizar servicio
- `DELETE /services/deleteService` - Eliminar servicio

### Productos
- `GET /products` - Listar productos
- `POST /products/create` - Crear producto
- `GET /products/getId` - Obtener producto
- `PUT /products/update` - Actualizar producto
- `DELETE /products/deleteProduct` - Eliminar producto
- `GET /products/lowStock` - Productos con stock bajo
- `GET /products/expiringSoon` - Productos próximos a vencer

### Citas
- `GET /appointments` - Listar citas
- `POST /appointments/create` - Crear cita
- `GET /appointments/getId` - Obtener cita
- `PUT /appointments/update` - Actualizar cita
- `PUT /appointments/complete` - Completar cita
- `PUT /appointments/cancel` - Cancelar cita
- `GET /appointments/today` - Citas del día

### Facturas
- `GET /invoices` - Listar facturas
- `POST /invoices/create` - Crear factura
- `GET /invoices/getId` - Obtener factura
- `PUT /invoices/updateStatus` - Actualizar estado
- `PUT /invoices/cancel` - Anular factura
- `GET /invoices/sales/today` - Ventas del día
- `GET /invoices/sales/month` - Ventas del mes

### Dashboard
- `GET /dashboard/summary` - Resumen general
- `GET /dashboard/users/stats` - Estadísticas de usuarios
- `GET /dashboard/products/stats` - Estadísticas de productos
- `GET /dashboard/sales/stats` - Estadísticas de ventas
- `GET /dashboard/topProducts` - Productos más vendidos
- `GET /dashboard/topServices` - Servicios más solicitados
- `GET /dashboard/products/lowStock` - Productos con stock bajo
- `GET /dashboard/products/expiringSoon` - Productos próximos a vencer

## 🔧 Configuración CORS

El backend debe tener configurado CORS para permitir peticiones desde `http://localhost:5173`.

Ver archivo `CORS_SETUP.md` para instrucciones completas.

## 📝 Notas de Implementación

### 1. Nombres de Campos

El backend usa snake_case para algunos campos:
- `user_id` en lugar de `userId`
- `rol_id` en lugar de `rolId`
- `created_on` en lugar de `createdAt`
- `tipo_id` en lugar de `tipoId`

El frontend debe respetar estos nombres.

### 2. Estructura de Respuestas

El backend puede devolver respuestas directas o envueltas:

```json
// Respuesta directa
{
  "user_id": 1,
  "name": "Juan"
}

// O respuesta envuelta
{
  "success": true,
  "data": {
    "user_id": 1,
    "name": "Juan"
  }
}
```

El frontend maneja ambos casos.

### 3. Errores

Los errores del backend se manejan en el interceptor:

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 4. Multi-Tenancy

El backend soporta multi-tenancy. Cada usuario tiene un `tenant_id` que identifica su empresa.

El frontend no necesita enviar el `tenant_id` en las peticiones, el backend lo extrae del token JWT.

## ✅ Checklist de Integración

- [x] Actualizar tipos TypeScript para coincidir con backend
- [x] Cambiar `email` por `correo` en login
- [x] Configurar interceptor de Axios con token
- [x] Manejar errores 401 (no autorizado)
- [ ] Configurar CORS en backend
- [ ] Crear archivo `.env` con URL del API
- [ ] Probar login con credenciales reales
- [ ] Verificar que los tokens se envíen correctamente
- [ ] Probar CRUD completo de cada módulo

## 🚀 Próximos Pasos

1. **Configurar CORS en el backend** según `CORS_SETUP.md`
2. **Crear archivo `.env`**:
   ```env
   VITE_API_URL=http://localhost:8090
   ```
3. **Reiniciar ambos servidores**
4. **Probar el login** con un usuario creado en el backend
5. **Verificar que los datos se carguen** correctamente en cada página

## 🐛 Solución de Problemas

### Error: "Usuario no encontrado"

**Causa:** El backend busca por el campo `correo` pero el frontend enviaba `email`.

**Solución:** Ya corregido. El frontend ahora envía `correo`.

### Error: CORS

**Causa:** Backend no tiene configurado CORS.

**Solución:** Ver `CORS_SETUP.md`.

### Error: 401 Unauthorized

**Causa:** Token no válido o expirado.

**Solución:** Volver a hacer login. El sistema automáticamente redirige al login.

### Datos no se cargan

**Causa:** Backend no está ejecutándose o URL incorrecta.

**Solución:** 
1. Verificar que el backend esté en `http://localhost:8090`
2. Verificar archivo `.env`
3. Revisar consola del navegador para ver errores específicos

## 📚 Referencias

- [Documentación API Backend](./API_DOCUMENTATION.md)
- [Configuración CORS](./CORS_SETUP.md)
- [Schema Base de Datos](./database_schema.sql)
- [Multi-Tenant Schema](./MULTI_TENANT_SCHEMA.sql)


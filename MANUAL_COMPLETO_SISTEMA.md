# 📘 MANUAL COMPLETO DEL SISTEMA - PET STORE

## 📑 Tabla de Contenidos

1. [Descripción General](#1-descripción-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#3-tecnologías-utilizadas)
4. [Páginas Principales](#4-páginas-principales)
5. [Componentes del Sistema](#5-componentes-del-sistema)
6. [Integración con Inteligencia Artificial](#6-integración-con-inteligencia-artificial)
7. [Roles y Permisos](#7-roles-y-permisos)
8. [Guía de Usuario por Módulo](#8-guía-de-usuario-por-módulo)
9. [API y Endpoints](#9-api-y-endpoints)
10. [Características Avanzadas](#10-características-avanzadas)

---

## 1. Descripción General

**Pet Store** es un sistema integral de gestión veterinaria que combina operaciones tradicionales con **Inteligencia Artificial y Machine Learning** para ofrecer análisis predictivos, segmentación de clientes y asistencia virtual.

### 🎯 Objetivos del Sistema:
- Gestionar clientes, mascotas y servicios veterinarios
- Programar y controlar citas médicas
- Gestionar inventario de productos y vacunas
- Facturación y control de ventas
- **Análisis con IA**: Predicciones, clustering y chatbot inteligente
- Historial clínico completo de mascotas

---

## 2. Arquitectura del Sistema

### 2.1 Arquitectura de 3 Capas

```
┌─────────────────────────────────────────┐
│         FRONTEND (React + Vite)         │
│  - React 18 + TypeScript                │
│  - Tailwind CSS                          │
│  - React Router v6                       │
│  - Recharts (visualización)              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      BACKEND (Spring Boot)               │
│  - Java 17+ Spring Boot                  │
│  - Spring Security + JWT                 │
│  - PostgreSQL Database                   │
│  - RESTful API                           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│     IA API (Python FastAPI)              │
│  - FastAPI + Scikit-learn                │
│  - Machine Learning Models               │
│  - Natural Language Processing           │
│  - Hierarchical Clustering               │
└─────────────────────────────────────────┘
```

### 2.2 Puertos y Servicios

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend API | 8090 | http://localhost:8090 |
| IA API | 8000 | http://localhost:8000 |
| PostgreSQL | 5432 | localhost:5432 |

---

## 3. Tecnologías Utilizadas

### 3.1 Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.3.1 | Librería principal UI |
| **TypeScript** | 5.6.2 | Tipado estático |
| **Vite** | 6.0.3 | Bundler rápido |
| **Tailwind CSS** | 3.4.17 | Estilos utility-first |
| **React Router** | 7.1.3 | Navegación SPA |
| **Axios** | 1.7.9 | Cliente HTTP |
| **Recharts** | 2.15.0 | Gráficos y visualización |
| **Lucide React** | 0.469.0 | Iconos modernos |

### 3.2 Backend

- **Spring Boot 3.x** - Framework Java
- **Spring Security** - Autenticación y autorización
- **JWT** - Tokens de sesión
- **JPA/Hibernate** - ORM
- **PostgreSQL** - Base de datos relacional

### 3.3 IA y Machine Learning

- **Python 3.9+**
- **FastAPI** - Framework web rápido
- **Scikit-learn** - ML models
- **Pandas** - Análisis de datos
- **NumPy** - Operaciones numéricas

---

## 4. Páginas Principales

### 4.1 Login (`Login.tsx`)

**Ruta**: `/login`

**Funcionalidad**:
- Autenticación de usuarios con email y contraseña
- Validación de credenciales contra el backend
- Generación de token JWT
- Almacenamiento de sesión en localStorage
- Redirección automática al Dashboard tras login exitoso

**Campos**:
- Email (correo electrónico)
- Contraseña

**Características**:
- Diseño responsive con gradientes
- Validación en tiempo real
- Mensajes de error claros
- Redirección automática si ya está autenticado

---

### 4.2 Dashboard (`Dashboard.tsx`)

**Ruta**: `/dashboard`

**Funcionalidad Principal**:
Sistema centralizado de métricas, análisis y control con **Inteligencia Artificial integrada**.

#### 📊 Secciones del Dashboard:

##### A) Resumen General (Spring Boot Backend)
- **Estadísticas básicas**:
  - Total de usuarios activos
  - Total de productos
  - Total de servicios
  - Citas del día
  - Ventas diarias y mensuales

##### B) Análisis con IA (Python API)
**Solo visible si la API de IA está disponible**

1. **KPIs Inteligentes**:
   - 🐾 Total de mascotas analizadas
   - 👥 Total de clientes registrados
   - 📅 Total de citas históricas
   - 🏥 Total de servicios ofrecidos

2. **Tipo de Mascota Más Común**:
   - Visualización con emoji según tipo
   - Porcentaje de prevalencia
   - Gráfico de barras con distribución
   - Top 4 tipos más comunes

3. **Análisis Temporal**:
   - **Día con más atención**: Gráfico de barras por día de semana
   - **Hora pico**: Gráfico de barras por hora del día
   - Identificación automática de patrones

4. **Clustering con Machine Learning** ⭐ NUEVO:
   - **Segmentación de Clientes**: VIP, Regulares, Ocasionales, Nuevos
   - **Clusters de Mascotas**: Por edad, tipo, precio promedio
   - **Agrupación de Servicios**: Por uso, hora y asistencia
   - Scores de calidad (Silhouette Score)
   - Estrategias sugeridas por segmento

##### C) Chatbot Flotante
- Botón flotante en esquina inferior derecha
- Panel de 450px × 700px
- Asistente virtual con IA
- Respuestas en tiempo real

**Características Destacadas**:
- Renderizado condicional de IA
- Gráficos interactivos con Recharts
- Indicador visual de conexión IA
- Instrucciones para activar la API de IA

---

### 4.3 Gestión de Usuarios (`Users.tsx`)

**Ruta**: `/users`  
**Permisos**: Solo SuperAdmin (rol_id: 1) y Admin (rol_id: 2)

**Funcionalidades**:
- ✅ **Listar usuarios** con paginación (10 por página)
- ✅ **Crear nuevo usuario**: nombre, email, contraseña, rol, documento
- ✅ **Editar usuario**: actualizar datos personales y rol
- ✅ **Activar/Desactivar**: cambio de estado sin eliminar
- ✅ **Búsqueda**: por nombre, email, documento o rol
- ✅ **Filtros**: por rol y estado (activo/inactivo)

**Campos del Formulario**:
- Nombre completo *
- Tipo de documento (CC, TI, CE, etc.)
- Número de documento *
- Email *
- Contraseña * (solo en creación)
- Teléfono
- Dirección
- Rol * (lista desplegable)
- Estado (activo/inactivo)

**Roles Disponibles**:
1. SuperAdmin - Acceso total
2. Admin - Gestión operativa
3. Empleado - Operaciones básicas
4. Veterinario - Gestión médica
5. Cliente General - Cliente sin registro completo
6. Cliente Registrado - Cliente con datos completos
7. Propietario - Cliente con mascotas

**Visualización en Tabla**:
- ID de usuario
- Nombre
- Email
- Documento
- Teléfono
- Rol (badge de color)
- Estado (activo/inactivo)
- Fecha de creación
- Acciones (editar, activar/desactivar)

---

### 4.4 Gestión de Clientes (`Clients.tsx`)

**Ruta**: `/clients`  
**Permisos**: Todos los usuarios autenticados

**Funcionalidades**:
- ✅ **Listar clientes** con paginación (10 por página)
- ✅ **Crear cliente**: formulario simplificado
- ✅ **Editar cliente**: actualizar datos
- ✅ **Búsqueda**: por nombre, email o documento
- ✅ **Vista de mascotas**: ver mascotas del cliente

**Diferencia con Usuarios**:
- Formulario simplificado (sin roles)
- Enfocado en datos de contacto
- Contraseña generada automáticamente
- Asignación automática de rol "Cliente"

**Campos del Formulario**:
- Nombre completo *
- Tipo de documento
- Número de documento *
- Email *
- Teléfono
- Dirección

---

### 4.5 Gestión de Empresas/Tenants (`Tenants.tsx`)

**Ruta**: `/tenants`  
**Permisos**: Solo SuperAdmin (rol_id: 1)

**Funcionalidades**:
- ✅ **Multi-tenancy**: soporte para múltiples empresas
- ✅ **Crear empresa**: formulario completo
- ✅ **Editar empresa**: actualizar información
- ✅ **Activar/Desactivar**: control de estado
- ✅ **Búsqueda**: por razón social, NIT, email o plan
- ✅ **Paginación**: 10 empresas por página

**Campos del Formulario**:
- Razón Social *
- NIT *
- Email corporativo *
- Teléfono *
- Dirección *
- Plan * (Básico, Estándar, Premium, Enterprise)

**Planes Disponibles**:
- 🟤 **BÁSICO**: Funcionalidades básicas
- 🔵 **ESTÁNDAR**: Funcionalidades avanzadas
- 🟣 **PREMIUM**: Todas las funcionalidades + IA
- 🟡 **ENTERPRISE**: Personalización completa

---

### 4.6 Gestión de Mascotas (`Pets.tsx`)

**Ruta**: `/pets`  
**Permisos**: Todos los usuarios autenticados

**Funcionalidades**:
- ✅ **Listar mascotas** con paginación (10 por página)
- ✅ **Crear mascota**: datos completos
- ✅ **Editar mascota**: actualizar información
- ✅ **Asignar propietarios**: múltiples propietarios por mascota
- ✅ **Remover propietarios**: gestión de relaciones
- ✅ **Búsqueda**: por nombre, tipo, raza o propietario
- ✅ **Vista detallada**: historial médico, citas, vacunas

**Campos del Formulario**:
- Nombre de la mascota *
- Tipo * (Perro, Gato, Conejo, Loro, Hámster, etc.)
- Raza *
- Edad (años)
- Sexo (Macho/Hembra)
- Color
- Cuidados especiales (textarea)
- Propietarios * (multi-select)

**Visualización en Tabla**:
- Nombre con emoji según tipo
- Tipo y raza
- Edad y sexo
- Color
- Propietarios (lista)
- Estado (activo/inactivo)
- Acciones (ver, editar, gestionar propietarios)

---

### 4.7 Gestión de Servicios (`Services.tsx`)

**Ruta**: `/services`  
**Permisos**: Todos los usuarios autenticados

**Funcionalidades**:
- ✅ **Listar servicios** con paginación (10 por página)
- ✅ **Crear servicio**: consulta, cirugía, vacunación, etc.
- ✅ **Editar servicio**: actualizar precio y descripción
- ✅ **Activar/Desactivar**: control de disponibilidad
- ✅ **Búsqueda**: por nombre, código o descripción

**Campos del Formulario**:
- Código del servicio
- Nombre del servicio *
- Descripción *
- Precio * (COP)
- Duración estimada (minutos)
- Estado (activo/inactivo)

**Ejemplos de Servicios**:
- Consulta general
- Vacunación antirrábica
- Cirugía menor
- Baño y peluquería
- Desparasitación
- Radiografía
- Hospitalización

---

### 4.8 Gestión de Productos (`Products.tsx`)

**Ruta**: `/products`  
**Permisos**: Todos los usuarios autenticados

**Funcionalidades**:
- ✅ **Listar productos** con paginación (10 por página)
- ✅ **Crear producto**: medicamentos, vacunas, alimentos
- ✅ **Editar producto**: actualizar stock y precio
- ✅ **Control de inventario**: stock mínimo, alertas
- ✅ **Fecha de vencimiento**: alertas de productos próximos a vencer
- ✅ **Búsqueda**: por nombre, código, lote o fabricante
- ✅ **Filtros**: por tipo (vacuna/producto), stock bajo, próximos a vencer

**Campos del Formulario**:
- Código del producto
- Nombre *
- Descripción *
- Presentación (ej: "10ml", "500g")
- Precio de venta * (COP)
- Stock actual *
- Stock mínimo *
- Fecha de vencimiento
- Número de lote
- Fabricante/Marca
- ¿Es vacuna? (checkbox)
- Estado (activo/inactivo)

**Alertas Automáticas**:
- 🔴 **Stock bajo**: cuando stock ≤ stock mínimo
- 🟡 **Próximo a vencer**: productos con menos de 3 meses

---

### 4.9 Gestión de Citas (`Appointments.tsx`)

**Ruta**: `/appointments`  
**Permisos**: Todos los usuarios autenticados

**Funcionalidades**:
- ✅ **Listar citas** con paginación (10 por página)
- ✅ **Crear cita**: programar nueva cita
- ✅ **Editar cita**: modificar fecha, hora o detalles
- ✅ **Cambiar estado**: Pendiente → Completada → Facturada
- ✅ **Cancelar cita**: con confirmación
- ✅ **Búsqueda**: por mascota, cliente, veterinario o fecha
- ✅ **Filtros**: por estado y rango de fechas
- ✅ **Vista de calendario**: organización temporal

**Campos del Formulario**:
- Mascota * (select)
- Cliente/Propietario * (autocompletado)
- Servicio * (select)
- Veterinario (opcional, select)
- Fecha y hora * (datetime)
- Observaciones (textarea)

**Estados de la Cita**:
1. 🟡 **Pendiente**: Cita programada
2. 🔵 **Completada**: Atención realizada
3. 🟢 **Facturada**: Ya se generó factura
4. 🔴 **Cancelada**: Cita anulada

**Flujo de Trabajo**:
```
Crear Cita → Pendiente → Completar → Agregar a Factura → Facturada
```

---

### 4.10 Gestión de Facturas (`Invoices.tsx`)

**Ruta**: `/invoices`  
**Permisos**: Todos los usuarios autenticados

**Funcionalidades**:
- ✅ **Listar facturas** con paginación (10 por página)
- ✅ **Crear factura**: con carrito de compras
- ✅ **Carrito inteligente**: agregar servicios, productos, citas, vacunas
- ✅ **Cálculo automático**: subtotal, descuento, impuesto, total
- ✅ **Imprimir factura**: vista previa y PDF
- ✅ **Búsqueda**: por número, cliente o fecha
- ✅ **Filtros**: por estado y rango de fechas
- ✅ **Cambiar estado**: actualizar factura (pagada/pendiente)

**Carrito de Compras - Flujo**:

1. **Seleccionar cliente** (obligatorio)
2. **Agregar items al carrito**:
   - 🛒 Productos en stock
   - 🏥 Servicios de citas completadas
   - 💉 Vacunaciones completadas
3. **Configurar descuentos e impuestos**
4. **Generar factura**
5. **Imprimir/Descargar**

**Campos de Items en Carrito**:
- Tipo (Producto/Servicio)
- Nombre del item
- Cantidad
- Precio unitario
- Descuento (%)
- Subtotal

**Cálculo Automático**:
```
Subtotal = Σ (cantidad × precio × (1 - descuento%))
Impuesto = Subtotal × impuesto%
Total = Subtotal + Impuesto
```

**Visualización en Tabla**:
- Número de factura
- Cliente
- Empleado que generó
- Fecha de emisión
- Subtotal
- Descuento
- Impuesto
- Total
- Estado (pagada/pendiente)
- Acciones (ver detalles, imprimir, cambiar estado)

---

### 4.11 Historia Clínica (`MedicalHistory.tsx`)

**Ruta**: `/medical-history`  
**Permisos**: Todos los usuarios autenticados

**Funcionalidades**:
- ✅ **Listar historias** con paginación (10 por página)
- ✅ **Crear historia**: registro médico completo
- ✅ **Editar historia**: actualizar diagnóstico y tratamiento
- ✅ **Ver por mascota**: historial completo
- ✅ **Búsqueda**: por mascota, veterinario o fecha
- ✅ **Exportar**: generar reportes

**Campos del Formulario**:
- Mascota * (select)
- Cita relacionada (opcional, select)
- Servicio * (select)
- Veterinario * (select)
- Fecha de atención *
- Tipo de procedimiento *
- Diagnóstico * (textarea)
- Tratamiento * (textarea)
- Observaciones (textarea)
- Peso (kg)
- Temperatura (°C)
- Notas adicionales (textarea)

**Tipos de Procedimiento**:
- Consulta general
- Cirugía
- Vacunación
- Emergencia
- Control
- Examen de laboratorio
- Hospitalización

---

### 4.12 Gestión de Vacunas (`Vaccinations.tsx`)

**Ruta**: `/vaccinations`  
**Permisos**: Todos los usuarios autenticados

**Funcionalidades**:
- ✅ **Listar vacunaciones** con paginación (10 por página)
- ✅ **Crear registro**: nueva vacuna aplicada
- ✅ **Editar registro**: actualizar información
- ✅ **Control de dosis**: seguimiento de refuerzos
- ✅ **Cambiar estado**: Completada → Facturada
- ✅ **Búsqueda**: por mascota, vacuna o fecha
- ✅ **Alertas**: recordatorios de próximas dosis

**Campos del Formulario**:
- Mascota * (select)
- Historia clínica relacionada (opcional)
- Veterinario * (select)
- Nombre de la vacuna * (ej: Antirrábica)
- Tipo de vacuna * (Viral, Bacterial, etc.)
- Fabricante
- Número de lote
- Fecha de aplicación *
- Fecha de próxima dosis
- Número de dosis
- Sitio de aplicación (ej: Subcutáneo)
- Observaciones
- ¿Requiere refuerzo? (checkbox)

**Estados**:
1. 🟡 **Completada**: Vacuna aplicada
2. 🟢 **Facturada**: Ya se generó factura

---

## 5. Componentes del Sistema

### 5.1 Layout (`Layout.tsx`)

**Funcionalidad**:
- Estructura principal de la aplicación
- Sidebar lateral con navegación
- Header superior con selector de tenant y logout
- Responsive: sidebar colapsable en móvil
- Breadcrumbs de navegación
- Indicador de usuario activo

**Navegación por Roles**:
```typescript
// Ejemplo de menú dinámico
SuperAdmin ve: Dashboard, Usuarios, Tenants, Clientes, Mascotas...
Admin ve: Dashboard, Usuarios, Clientes, Mascotas...
Empleado ve: Dashboard, Clientes, Mascotas, Citas...
Veterinario ve: Dashboard, Mascotas, Citas, Historia Clínica...
Cliente ve: Dashboard, Mis Mascotas, Mis Citas
```

---

### 5.2 Chatbot (`Chatbot.tsx`)

**Funcionalidad**:
- Asistente virtual con IA
- Chat en tiempo real con la API de Python
- Detección automática de conexión
- Mensajes de ejemplo para guiar al usuario
- Historial de conversación
- Indicador de estado (conectado/desconectado)

**Comandos Disponibles** (ejemplos):
- "¿Cuántas mascotas hay registradas?"
- "¿Cuál es el día con más citas?"
- "Dame información sobre vacunas"
- "¿Cuál es el tipo de mascota más común?"
- "Busca información del cliente [email]"

**Características Técnicas**:
- Conexión vía WebSocket/HTTP
- Manejo de errores robusto
- UI/UX moderna con burbujas de chat
- Scroll automático a nuevos mensajes
- Avatares diferenciados (usuario vs IA)

---

### 5.3 ClusteringDashboard (`ClusteringDashboard.tsx`)

**Funcionalidad**:
- Visualización de análisis de clustering jerárquico
- 3 vistas con tabs interactivos
- Gráficos y métricas avanzadas
- Recomendaciones estratégicas

**Vista de Segmentación de Clientes**:
- **Segmento VIP**: Alto gasto, alta frecuencia
- **Segmento Regular**: Gasto medio, frecuencia constante
- **Segmento Ocasional**: Bajo gasto, baja frecuencia
- **Segmento Nuevo**: Clientes recientes

**Métricas por Segmento**:
- Total de clientes
- Gasto promedio
- Citas promedio
- Tasa de asistencia
- Valor total del segmento

**Estrategias Sugeridas**:
- VIP: Programa de lealtad, descuentos exclusivos
- Regular: Recordatorios, ofertas especiales
- Ocasional: Campañas de reactivación
- Nuevo: Onboarding, descuentos de bienvenida

**Vista de Clusters de Mascotas**:
- Agrupación por edad, tipo y precio de servicios
- Distribución de tipos por cluster
- Identificación de patrones

**Vista de Agrupación de Servicios**:
- Servicios agrupados por uso y horario
- Tasa de asistencia por grupo
- Optimización de recursos

---

### 5.4 Pagination (`Pagination.tsx`)

**Funcionalidad**:
- Componente reutilizable de paginación
- Navegación por páginas
- Botones: Primera, Anterior, Siguiente, Última
- Indicador de items mostrados
- Responsive para móviles

**Props**:
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemName: string;
}
```

**Uso**:
```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={filteredItems.length}
  itemsPerPage={10}
  onPageChange={goToPage}
  itemName="usuarios"
/>
```

---

### 5.5 Hooks Personalizados

#### `usePagination.ts`

**Funcionalidad**:
- Hook personalizado para manejar paginación
- Cálculo automático de páginas
- Reset al cambiar datos o itemsPerPage

**Uso**:
```typescript
const {
  currentPage,
  totalPages,
  paginatedData,
  goToPage
} = usePagination({
  data: filteredItems,
  itemsPerPage: 10
});
```

---

### 5.6 Contextos

#### `AuthContext.tsx`

**Funcionalidad**:
- Gestión global de autenticación
- Almacenamiento de usuario actual
- Login/Logout
- Verificación de token JWT
- Protección de rutas

**Métodos**:
```typescript
const { user, login, logout, isAuthenticated, isLoading } = useAuth();
```

#### `TenantContext.tsx`

**Funcionalidad**:
- Gestión de multi-tenancy
- Selector de empresa activa
- Filtrado de datos por tenant

**Métodos**:
```typescript
const { selectedTenantId, setSelectedTenantId, tenantName } = useTenant();
```

#### `ShoppingCartContext.tsx`

**Funcionalidad**:
- Gestión del carrito de compras
- Agregar/remover items
- Cálculo de totales
- Persistencia temporal

**Métodos**:
```typescript
const { 
  cart, 
  addItem, 
  removeItem, 
  updateQuantity, 
  clearCart, 
  total 
} = useShoppingCart();
```

---

## 6. Integración con Inteligencia Artificial

### 6.1 API de Python (FastAPI)

**Puerto**: 8000  
**URL Base**: `http://localhost:8000`

#### Endpoints Disponibles:

##### 🤖 Chatbot
- `POST /api/chat` - Enviar mensaje al chatbot
- `GET /api/chat/comandos` - Obtener comandos disponibles

##### 📊 Estadísticas
- `GET /api/estadisticas` - Estadísticas generales

##### 📈 Análisis
- `GET /api/analisis/tipos-mascota` - Tipo más común de mascota
- `GET /api/analisis/dias-atencion` - Día con más citas
- `GET /api/analisis/horas-pico` - Hora pico de atención
- `GET /api/analisis/servicios` - Análisis de servicios

##### 🔮 Predicciones
- `POST /api/predicciones/tipo-mascota` - Predecir tipo de mascota
- `POST /api/predicciones/asistencia` - Predecir asistencia a cita
- `GET /api/predicciones/tipo-mas-comun` - Tipo más común predicho
- `GET /api/predicciones/dia-mas-atencion` - Día con más atención predicho
- `GET /api/predicciones/estado` - Estado de modelos ML

##### 🎯 Clustering
- `GET /api/clustering/completo` - Análisis completo de clustering
- `GET /api/clustering/mascotas` - Clustering de mascotas
- `GET /api/clustering/clientes` - Segmentación de clientes
- `GET /api/clustering/servicios` - Agrupación de servicios

##### 🔍 Consultas
- `GET /api/mascotas/buscar/{nombre}` - Buscar mascota
- `GET /api/mascotas/{pet_id}/historial` - Historial de mascota
- `GET /api/mascotas/{pet_id}/citas` - Citas de mascota
- `GET /api/mascotas/{pet_id}/vacunas` - Vacunas de mascota
- `GET /api/clientes/buscar/{correo}` - Buscar cliente
- `GET /api/clientes/{client_id}/mascotas` - Mascotas de cliente
- `GET /api/servicios` - Servicios disponibles

##### ⚙️ Administración
- `POST /api/entrenar` - Entrenar modelos ML
- `GET /api/exportar/dataset` - Exportar dataset

##### ❤️ Health Check
- `GET /api/health` - Verificar estado de la API

### 6.2 Modelos de Machine Learning

#### A) Clasificación - Random Forest
**Uso**: Predecir tipo de mascota basado en día, hora, mes y servicio

**Características**:
- Algoritmo: Random Forest Classifier
- Precisión: ~85-90%
- Entrenamiento: Automático con datos históricos

#### B) Clustering Jerárquico
**Uso**: Agrupar clientes, mascotas y servicios

**Características**:
- Algoritmo: Hierarchical Clustering
- Métrica: Silhouette Score
- Linkage: Ward

**Segmentación de Clientes**:
```python
Features = [gasto_total, cantidad_citas, tasa_asistencia]
Segmentos = [VIP, Regular, Ocasional, Nuevo]
```

**Clustering de Mascotas**:
```python
Features = [edad, precio_promedio_servicios, frecuencia_citas]
Clusters = [Cluster 0, Cluster 1, Cluster 2, ...]
```

**Agrupación de Servicios**:
```python
Features = [uso_promedio, hora_promedio, tasa_asistencia]
Grupos = [Grupo 0, Grupo 1, Grupo 2, ...]
```

### 6.3 Algoritmos de IA Utilizados

| Algoritmo | Tipo | Uso |
|-----------|------|-----|
| **Random Forest** | Clasificación | Predicción de tipo de mascota |
| **Hierarchical Clustering** | No supervisado | Segmentación de clientes/mascotas |
| **K-Means** | No supervisado | Clustering alternativo |
| **NLP básico** | Procesamiento de lenguaje | Chatbot inteligente |
| **Regresión Logística** | Clasificación | Predicción de asistencia |

---

## 7. Roles y Permisos

### 7.1 Matriz de Permisos

| Módulo | SuperAdmin (1) | Admin (2) | Empleado (3) | Veterinario (4) | Cliente (5, 6, 7) |
|--------|----------------|-----------|--------------|-----------------|-------------------|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Usuarios** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Tenants** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Clientes** | ✅ | ✅ | ✅ | ✅ | ✅ (solo propio) |
| **Mascotas** | ✅ | ✅ | ✅ | ✅ | ✅ (solo propias) |
| **Servicios** | ✅ | ✅ | ✅ | ✅ | ✅ (solo lectura) |
| **Productos** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Citas** | ✅ | ✅ | ✅ | ✅ | ✅ (solo propias) |
| **Facturas** | ✅ | ✅ | ✅ | ❌ | ✅ (solo propias) |
| **Historia Clínica** | ✅ | ✅ | ❌ | ✅ | ✅ (solo propias) |
| **Vacunaciones** | ✅ | ✅ | ❌ | ✅ | ✅ (solo propias) |
| **IA & Clustering** | ✅ | ✅ | ✅ | ✅ | ❌ |

### 7.2 Descripción de Roles

#### 1️⃣ SuperAdmin (rol_id: 1)
- **Acceso total** al sistema
- Gestionar usuarios y sus roles
- Gestionar empresas (tenants)
- Configuración del sistema
- Acceso a todas las funcionalidades de IA

#### 2️⃣ Admin (rol_id: 2)
- Gestión operativa completa
- Crear/editar usuarios (excepto tenants)
- Gestionar inventario y ventas
- Acceso a reportes y estadísticas
- Acceso a IA

#### 3️⃣ Empleado (rol_id: 3)
- Operaciones diarias
- Gestionar citas y clientes
- Generar facturas
- Consultar inventario
- Acceso limitado a IA

#### 4️⃣ Veterinario (rol_id: 4)
- Gestión médica
- Crear/editar historias clínicas
- Aplicar vacunas
- Gestionar citas
- Acceso a IA para análisis médicos

#### 5️⃣ Cliente General (rol_id: 5)
- Registro básico
- Ver servicios disponibles

#### 6️⃣ Cliente Registrado (rol_id: 6)
- Gestionar sus mascotas
- Agendar citas
- Ver historial médico
- Ver sus facturas

#### 7️⃣ Propietario (rol_id: 7)
- Mismo que Cliente Registrado
- Propietario confirmado de mascotas

---

## 8. Guía de Usuario por Módulo

### 8.1 Primer Ingreso al Sistema

1. **Acceder a la URL**: `http://localhost:5173`
2. **Iniciar sesión** con credenciales proporcionadas
3. **Dashboard**: Verás el panel principal con métricas

### 8.2 Cómo Crear una Cita

1. Ir a **"Citas"** en el menú lateral
2. Clic en **"Nueva Cita"**
3. Seleccionar **mascota** (si no existe, crearla primero)
4. Seleccionar **cliente/propietario**
5. Elegir **servicio** (ej: Consulta general)
6. Seleccionar **fecha y hora**
7. Agregar **observaciones** (opcional)
8. Clic en **"Crear"**

### 8.3 Cómo Completar una Cita

1. En la lista de citas, localizar la cita
2. Clic en **"Completar"**
3. Agregar **diagnóstico** (opcional)
4. La cita cambia a estado **"Completada"**
5. Ahora puede agregarse a una factura

### 8.4 Cómo Crear una Factura

1. Ir a **"Facturas"** en el menú
2. Clic en **"Nueva Factura"**
3. **Seleccionar cliente** (obligatorio)
4. **Agregar items al carrito**:
   - Pestaña **"Productos"**: buscar y agregar productos
   - Pestaña **"Servicios"**: agregar citas completadas
   - Pestaña **"Vacunas"**: agregar vacunaciones
5. Configurar **descuento** e **impuesto**
6. Verificar el **total**
7. Clic en **"Generar Factura"**
8. **Imprimir** o **descargar** PDF

### 8.5 Cómo Agregar una Mascota

1. Ir a **"Mascotas"**
2. Clic en **"Nueva Mascota"**
3. Completar formulario:
   - Nombre
   - Tipo (Perro, Gato, etc.)
   - Raza
   - Edad, sexo, color
   - Cuidados especiales
4. **Seleccionar propietario(s)**
5. Clic en **"Crear"**

### 8.6 Cómo Crear una Historia Clínica

1. Ir a **"Historia Clínica"**
2. Clic en **"Nueva Historia"**
3. Seleccionar **mascota**
4. Seleccionar **servicio** y **veterinario**
5. Completar:
   - Tipo de procedimiento
   - Diagnóstico
   - Tratamiento
   - Peso y temperatura
6. Clic en **"Crear"**

### 8.7 Cómo Registrar una Vacuna

1. Ir a **"Vacunaciones"**
2. Clic en **"Nueva Vacunación"**
3. Seleccionar **mascota**
4. Completar datos de la vacuna:
   - Nombre (ej: Antirrábica)
   - Tipo
   - Fabricante
   - Lote
   - Fecha de aplicación
   - Próxima dosis
5. Clic en **"Crear"**

### 8.8 Cómo Usar el Chatbot IA

1. En el Dashboard, localizar el **botón flotante verde** (esquina inferior derecha)
2. Clic para **abrir** el chatbot
3. Escribir pregunta o comando (ejemplos):
   - "¿Cuántas mascotas hay?"
   - "Dame estadísticas de citas"
   - "¿Cuál es el día con más atención?"
4. El asistente responderá con información del sistema
5. Clic en **X** para cerrar

### 8.9 Cómo Ver el Análisis de Clustering

1. En el Dashboard, desplazarse hasta **"Análisis de Clustering"**
2. Ver las **3 tarjetas de resumen** (Mascotas, Clientes, Servicios)
3. Usar los **tabs** para cambiar entre vistas:
   - **Clientes**: Ver segmentación y estrategias
   - **Mascotas**: Ver clusters por edad y tipo
   - **Servicios**: Ver agrupación por uso

### 8.10 Cómo Gestionar el Inventario

1. Ir a **"Productos"**
2. Verificar alertas:
   - 🔴 **Stock bajo**: productos que necesitan reabastecimiento
   - 🟡 **Próximos a vencer**: productos con menos de 3 meses
3. Para agregar stock:
   - Editar producto
   - Actualizar campo **"Stock actual"**
4. Para registrar nuevo producto:
   - Clic en **"Nuevo Producto"**
   - Completar formulario
   - Establecer **stock mínimo** para alertas

---

## 9. API y Endpoints

### 9.1 Backend API (Spring Boot)

**URL Base**: `http://localhost:8090`

#### Autenticación
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/register` - Registro de usuario

#### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users/create` - Crear usuario
- `PUT /api/users/update` - Actualizar usuario
- `PUT /api/users/userActivate` - Activar usuario
- `PUT /api/users/userDeactivate` - Desactivar usuario

#### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients/create` - Crear cliente
- `PUT /api/clients/update` - Actualizar cliente
- `GET /api/clients/{id}` - Obtener cliente por ID

#### Tenants
- `GET /api/tenants` - Listar empresas
- `POST /api/tenants/create` - Crear empresa
- `PUT /api/tenants/update` - Actualizar empresa
- `PUT /api/tenants/activate/{id}` - Activar empresa
- `PUT /api/tenants/deactivate/{id}` - Desactivar empresa

#### Mascotas
- `GET /api/pets` - Listar mascotas
- `POST /api/pets/create` - Crear mascota
- `PUT /api/pets/update` - Actualizar mascota
- `POST /api/pets/addOwner` - Agregar propietario
- `DELETE /api/pets/removeOwner` - Remover propietario

#### Servicios
- `GET /api/services` - Listar servicios
- `POST /api/services/create` - Crear servicio
- `PUT /api/services/update` - Actualizar servicio

#### Productos
- `GET /api/products` - Listar productos
- `POST /api/products/create` - Crear producto
- `PUT /api/products/update` - Actualizar producto
- `GET /api/products/lowStock` - Productos con stock bajo
- `GET /api/products/expiring` - Productos próximos a vencer

#### Citas
- `GET /api/appointments` - Listar citas
- `POST /api/appointments/create` - Crear cita
- `PUT /api/appointments/update` - Actualizar cita
- `PUT /api/appointments/complete` - Completar cita
- `PUT /api/appointments/cancel` - Cancelar cita
- `PUT /api/appointments/markAsInvoiced` - Marcar como facturada

#### Facturas
- `GET /api/invoices` - Listar facturas
- `POST /api/invoices/create` - Crear factura
- `PUT /api/invoices/update` - Actualizar factura
- `GET /api/invoices/client/{id}` - Facturas por cliente

#### Historia Clínica
- `GET /api/medical-history` - Listar historias
- `POST /api/medical-history/create` - Crear historia
- `PUT /api/medical-history/update` - Actualizar historia
- `GET /api/medical-history/pet/{id}` - Historial de mascota

#### Vacunaciones
- `GET /api/vaccinations` - Listar vacunaciones
- `POST /api/vaccinations/create` - Crear vacunación
- `PUT /api/vaccinations/update` - Actualizar vacunación
- `PUT /api/vaccinations/markAsInvoiced` - Marcar como facturada

#### Dashboard
- `GET /api/dashboard/summary` - Resumen del dashboard

### 9.2 Autenticación JWT

**Headers Requeridos**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Flujo**:
1. Login → Recibir token
2. Almacenar token en localStorage
3. Incluir token en todas las peticiones
4. Token expira en 24 horas (configurable)

---

## 10. Características Avanzadas

### 10.1 Paginación Universal

**Implementación**:
- 10 items por página en todas las tablas
- Navegación completa: Primera, Anterior, Siguiente, Última
- Indicador de rango: "Mostrando 1 a 10 de 50"
- Botones de páginas numéricos
- Reset automático al filtrar

**Páginas con Paginación**:
✅ Usuarios  
✅ Clientes  
✅ Tenants  
✅ Mascotas  
✅ Servicios  
✅ Productos  
✅ Citas  
✅ Facturas  
✅ Historia Clínica  
✅ Vacunaciones

### 10.2 Búsqueda y Filtros

**Características**:
- Búsqueda en tiempo real
- Sin necesidad de presionar "Enter"
- Búsqueda multi-campo
- Filtros adicionales por estado, fecha, rol, etc.
- Preservación de filtros al navegar

**Ejemplo - Búsqueda de Clientes**:
```typescript
// Busca en: nombre, email, documento
const filtered = clients.filter(client =>
  client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  client.ident.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### 10.3 Renderizado Condicional de IA

**Lógica**:
```typescript
// Solo mostrar si la API de IA está disponible
{iaStats && !isLoadingIA && (
  <ClusteringDashboard />
)}

// Mostrar mensaje informativo si no está disponible
{!iaStats && !isLoadingIA && (
  <div>
    ⚠️ API de IA no disponible
    Instrucciones para activarla...
  </div>
)}
```

### 10.4 Multi-Tenancy

**Funcionalidad**:
- Soporte para múltiples empresas
- Datos aislados por tenant
- Selector de tenant en header
- Filtrado automático de datos

**Implementación**:
```typescript
// Todas las peticiones incluyen tenant_id
const tenantId = localStorage.getItem('tenantId');
api.defaults.headers['X-Tenant-ID'] = tenantId;
```

### 10.5 Carrito de Compras Inteligente

**Características**:
- Agregar múltiples tipos de items
- Cálculo automático de totales
- Descuentos por item y global
- Impuestos configurables
- Validación de stock
- Persistencia temporal

**Flujo**:
```
1. Seleccionar cliente
2. Agregar productos (verifica stock)
3. Agregar servicios de citas completadas
4. Agregar vacunaciones completadas
5. Aplicar descuentos
6. Revisar total
7. Generar factura
8. Marcar citas/vacunas como facturadas
```

### 10.6 Alertas y Notificaciones

**Tipos de Alertas**:
- 🔴 **Stock bajo**: Productos con stock ≤ stock mínimo
- 🟡 **Próximo a vencer**: Productos con menos de 3 meses
- 📅 **Recordatorios**: Próximas citas
- 💉 **Vacunas pendientes**: Refuerzos programados

### 10.7 Exportación de Datos

**Formatos Disponibles**:
- 📄 **PDF**: Facturas, reportes
- 📊 **Excel**: Listas, inventarios
- 📈 **CSV**: Datasets para análisis

**Ejemplo - Imprimir Factura**:
```typescript
const handlePrint = () => {
  window.print();
};
```

### 10.8 Responsive Design

**Breakpoints**:
- 📱 **Móvil**: < 640px
- 📱 **Tablet**: 640px - 1024px
- 💻 **Desktop**: > 1024px

**Adaptaciones**:
- Sidebar colapsable en móvil
- Tablas con scroll horizontal
- Formularios en columnas adaptativas
- Paginación simplificada en móvil

---

## 11. Resolución de Problemas Comunes

### Problema 1: La API de IA no se conecta

**Síntomas**:
- Chatbot muestra "desconectado"
- No se muestra análisis de clustering
- Mensaje de API no disponible

**Solución**:
```bash
# 1. Verificar que Python API esté corriendo
cd path/to/python/api
python api.py

# 2. Verificar puerto 8000 disponible
netstat -ano | findstr :8000

# 3. Verificar endpoint de health check
curl http://localhost:8000/api/health
```

### Problema 2: Error 403 Forbidden

**Síntomas**:
- No puede acceder a ciertas páginas
- Mensaje "No autorizado"

**Solución**:
- Verificar que el usuario tenga el rol correcto
- Verificar token JWT válido
- Re-login si el token expiró

### Problema 3: Tablas vacías o sin datos

**Síntomas**:
- "No hay registros"
- Tablas en blanco

**Solución**:
- Verificar conexión a backend
- Verificar que hay datos en la base de datos
- Revisar consola del navegador para errores

### Problema 4: Carrito no guarda items

**Síntomas**:
- Items desaparecen del carrito
- Totales incorrectos

**Solución**:
- Seleccionar cliente primero
- Verificar stock de productos
- Verificar que citas/vacunas estén completadas

### Problema 5: Paginación no funciona

**Síntomas**:
- Botones deshabilitados
- No cambia de página

**Solución**:
- Verificar que haya más de 10 items
- Limpiar filtros de búsqueda
- Recargar página

---

## 12. Mantenimiento y Actualizaciones

### 12.1 Actualizar Dependencias

```bash
# Frontend
npm update

# Verificar vulnerabilidades
npm audit
npm audit fix
```

### 12.2 Limpieza de Cache

```bash
# Frontend
npm run clean
rm -rf node_modules
npm install

# Backend
mvn clean install
```

### 12.3 Backup de Base de Datos

```bash
# PostgreSQL
pg_dump -U usuario -d petstore > backup_$(date +%Y%m%d).sql
```

---

## 13. Conclusión

Este sistema **Pet Store** combina gestión veterinaria tradicional con tecnologías de **Inteligencia Artificial y Machine Learning** para ofrecer:

✅ **Gestión Completa**: Clientes, mascotas, citas, inventario, facturación  
✅ **Análisis Predictivo**: Predicciones con Random Forest  
✅ **Segmentación Inteligente**: Clustering jerárquico de clientes  
✅ **Asistente Virtual**: Chatbot con IA  
✅ **Dashboard Analítico**: Visualizaciones avanzadas con Recharts  
✅ **Multi-Tenancy**: Soporte para múltiples empresas  
✅ **Paginación Universal**: 10 items por página en todas las tablas  
✅ **Responsive Design**: Funciona en móvil, tablet y desktop  

---

## 📞 Soporte Técnico

**Documentación Adicional**:
- README del proyecto
- Comentarios en el código fuente
- Documentación de APIs

**Recursos**:
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Tailwind CSS: https://tailwindcss.com
- FastAPI: https://fastapi.tiangolo.com
- Scikit-learn: https://scikit-learn.org

---

**Versión del Manual**: 1.0  
**Fecha**: Noviembre 2025  
**Autor**: Sistema Pet Store Development Team

---

**FIN DEL MANUAL** 📘



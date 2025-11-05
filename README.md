# 🐾 Pet Store - Sistema de Gestión Veterinaria con IA

<div align="center">

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0.3-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

**Sistema integral de gestión veterinaria que combina operaciones tradicionales con Inteligencia Artificial y Machine Learning**

[Características](#-características-principales) •
[Tecnologías](#-tecnologías-utilizadas) •
[Instalación](#-instalación) •
[Documentación](#-documentación) •
[Screenshots](#-screenshots) •
[Licencia](#-licencia)

</div>

---

## 📋 Descripción

**Pet Store** es una solución completa para clínicas y hospitales veterinarios que integra:

- ✅ **Gestión Completa**: Clientes, mascotas, citas, inventario, facturación
- 🤖 **Inteligencia Artificial**: Predicciones, análisis y chatbot inteligente
- 📊 **Machine Learning**: Clustering jerárquico para segmentación
- 💬 **Asistente Virtual**: Chatbot con procesamiento de lenguaje natural
- 📈 **Análisis Predictivo**: Predicción de asistencia, tipos de mascotas más comunes
- 🎯 **Dashboard Analítico**: Visualizaciones avanzadas en tiempo real

---

## 🌟 Características Principales

### 🏥 Gestión Veterinaria

- **Clientes y Mascotas**: Registro completo con historial médico
- **Agenda de Citas**: Programación inteligente con recordatorios
- **Historia Clínica**: Registro detallado de consultas y procedimientos
- **Vacunaciones**: Control de dosis y recordatorios de refuerzos
- **Inventario**: Gestión de productos con alertas de stock
- **Facturación**: Sistema de carrito con múltiples tipos de items

### 🤖 Inteligencia Artificial

- **Chatbot Inteligente**: Asistente virtual con IA para consultas
- **Análisis Predictivo**: Random Forest para predicciones
- **Clustering Jerárquico**: Segmentación automática de clientes
- **Análisis Temporal**: Identificación de patrones por día y hora
- **Dashboard con IA**: Métricas y visualizaciones inteligentes

### 📊 Análisis y Reportes

- **Dashboard Ejecutivo**: KPIs en tiempo real
- **Clustering de Clientes**: Segmentación VIP, Regular, Ocasional, Nuevo
- **Análisis de Mascotas**: Agrupación por edad, tipo y precio
- **Análisis de Servicios**: Agrupación por uso y horario
- **Gráficos Interactivos**: Visualizaciones con Recharts

### 🔐 Seguridad y Roles

- **Autenticación JWT**: Tokens seguros
- **7 Roles Diferentes**: SuperAdmin, Admin, Empleado, Veterinario, Clientes
- **Permisos Granulares**: Control de acceso por módulo
- **Multi-Tenancy**: Soporte para múltiples empresas

---

## 🛠️ Tecnologías Utilizadas

### Frontend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 18.3.1 | Librería UI |
| **TypeScript** | 5.6.2 | Tipado estático |
| **Vite** | 6.0.3 | Build tool |
| **Tailwind CSS** | 3.4.17 | Estilos |
| **React Router** | 7.1.3 | Navegación |
| **Axios** | 1.7.9 | HTTP client |
| **Recharts** | 2.15.0 | Gráficos |
| **Lucide React** | 0.469.0 | Iconos |

### Backend (No incluido en este repo)

- **Spring Boot 3.x** - Framework Java
- **Spring Security** - Autenticación JWT
- **PostgreSQL** - Base de datos
- **JPA/Hibernate** - ORM

### IA y Machine Learning (No incluido en este repo)

- **Python 3.9+** - Lenguaje base
- **FastAPI** - API framework
- **Scikit-learn** - ML models
- **Pandas & NumPy** - Análisis de datos

---

## 🚀 Instalación

### Requisitos Previos

```bash
node >= 18.0.0
npm >= 9.0.0
```

### Instalación Paso a Paso

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/frontend_petstore.git
cd frontend_petstore

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional)
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en: http://localhost:5173
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor (puerto 5173)

# Producción
npm run build        # Genera build optimizado
npm run preview      # Vista previa del build

# Código
npm run lint         # Ejecuta ESLint
```

---

## 📚 Documentación

Este proyecto incluye **documentación completa** en 3 niveles:

### 📘 [MANUAL COMPLETO DEL SISTEMA](./MANUAL_COMPLETO_SISTEMA.md)
**Para**: Usuarios finales y administradores  
Incluye descripción completa de todas las funcionalidades, módulos y características.

### 🛠️ [GUÍA TÉCNICA PARA DESARROLLADORES](./GUIA_TECNICA_DESARROLLADORES.md)
**Para**: Desarrolladores  
Incluye instalación, estructura del código, convenciones y mejores prácticas.

### 🚀 [GUÍA RÁPIDA DE USUARIO](./GUIA_RAPIDA_USUARIO.md)
**Para**: Usuarios finales (no técnicos)  
Incluye tareas comunes paso a paso y preguntas frecuentes.

### 📑 [ÍNDICE DE DOCUMENTACIÓN](./INDICE_DOCUMENTACION.md)
**Para**: Todos  
Índice completo con enlaces rápidos a todos los temas.

---

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────┐
│         FRONTEND (React + Vite)         │
│  Puerto: 5173                            │
│  - React 18 + TypeScript                │
│  - Tailwind CSS                          │
│  - Recharts (gráficos)                   │
└─────────────────────────────────────────┘
                    ↓ API REST
┌─────────────────────────────────────────┐
│      BACKEND (Spring Boot)               │
│  Puerto: 8090                            │
│  - Spring Security + JWT                 │
│  - PostgreSQL Database                   │
└─────────────────────────────────────────┘
                    ↓ Consume datos
┌─────────────────────────────────────────┐
│     IA API (Python FastAPI)              │
│  Puerto: 8000                            │
│  - Machine Learning Models               │
│  - Chatbot con NLP                       │
│  - Clustering jerárquico                 │
└─────────────────────────────────────────┘
```

---

## 📸 Screenshots

### Dashboard Principal
![Dashboard](docs/screenshots/dashboard.png)
*Dashboard con análisis de IA y métricas en tiempo real*

### Gestión de Clientes
![Clientes](docs/screenshots/clientes.png)
*Lista de clientes con búsqueda y paginación*

### Facturación Inteligente
![Facturas](docs/screenshots/facturas.png)
*Carrito de compras con cálculo automático*

### Chatbot con IA
![Chatbot](docs/screenshots/chatbot.png)
*Asistente virtual flotante con Machine Learning*

### Clustering de Clientes
![Clustering](docs/screenshots/clustering.png)
*Segmentación automática con estrategias sugeridas*

---

## 🎯 Módulos Principales

### 👥 Gestión de Usuarios y Clientes
- Creación y edición de usuarios con roles
- Gestión de clientes y propietarios
- Asignación de mascotas a múltiples propietarios

### 🐾 Gestión de Mascotas
- Registro completo con datos médicos
- Historial clínico detallado
- Control de vacunaciones

### 📅 Agenda y Citas
- Programación de citas
- Estados: Pendiente, Completada, Facturada
- Visualización por veterinario y fecha

### 💊 Inventario
- Productos y medicamentos
- Alertas de stock bajo
- Control de vencimientos

### 💰 Facturación
- Carrito inteligente multi-item
- Cálculo automático de totales
- Impresión de facturas

### 🤖 Inteligencia Artificial
- **Chatbot**: Asistente con NLP
- **Predicciones**: Random Forest
- **Clustering**: Segmentación de clientes
- **Análisis**: Patrones temporales

---

## 🔑 Roles y Permisos

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **SuperAdmin** (1) | Acceso total | Todo el sistema |
| **Admin** (2) | Gestión operativa | Usuarios, inventario, facturas |
| **Empleado** (3) | Operaciones diarias | Citas, clientes, facturas |
| **Veterinario** (4) | Gestión médica | Historias clínicas, vacunas |
| **Cliente General** (5) | Cliente básico | Ver servicios |
| **Cliente Registrado** (6) | Cliente completo | Gestionar mascotas, citas |
| **Propietario** (7) | Con mascotas | Gestionar sus mascotas |

---

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Backend API
VITE_API_BASE_URL=http://localhost:8090

# IA API (opcional)
VITE_IA_API_BASE_URL=http://localhost:8000
```

### Configuración de Endpoints

Los endpoints están centralizados en `src/services/api.ts`:

```typescript
// Backend principal (Spring Boot)
const API_BASE_URL = 'http://localhost:8090';

// API de IA (Python FastAPI)
const IA_API_BASE_URL = 'http://localhost:8000';
```

---

## 🧪 Testing (Futuro)

```bash
# Ejecutar tests (cuando estén implementados)
npm run test

# Coverage
npm run test:coverage
```

---

## 📦 Build y Deploy

### Build de Producción

```bash
npm run build
```

Los archivos se generan en el directorio `dist/`.

### Deploy en Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy en Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Commits

```
Add: Nueva funcionalidad
Fix: Corrección de bug
Update: Actualización de código existente
Refactor: Refactorización
Docs: Documentación
Style: Estilos (no afecta funcionalidad)
Test: Tests
```

---

## 🐛 Reportar Issues

Si encuentras un bug o tienes una sugerencia:

1. Ve a [Issues](https://github.com/tu-usuario/frontend_petstore/issues)
2. Crea un nuevo issue
3. Usa las plantillas proporcionadas
4. Sé descriptivo y adjunta screenshots si es posible

---

## 📝 Roadmap

### Versión 1.1 (Próximamente)
- [ ] Testing con Vitest
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push
- [ ] Exportación de reportes a Excel/PDF

### Versión 2.0 (Futuro)
- [ ] App móvil React Native
- [ ] Integración con pasarelas de pago
- [ ] Sistema de mensajería interna
- [ ] Videollamadas para teleconsultas
- [ ] Dashboard personalizable

---

## 👥 Equipo

- **Desarrollo Frontend**: [Tu Nombre]
- **Desarrollo Backend**: [Nombre]
- **Machine Learning**: [Nombre]
- **UX/UI Design**: [Nombre]

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2025 Pet Store

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙏 Agradecimientos

- [React Team](https://react.dev) - Por React
- [Vercel](https://vercel.com) - Por Vite
- [Tailwind Labs](https://tailwindcss.com) - Por Tailwind CSS
- [Recharts](https://recharts.org) - Por los gráficos
- [Lucide](https://lucide.dev) - Por los iconos
- Comunidad de desarrolladores por sus contribuciones

---

## 📞 Soporte y Contacto

- **Email**: soporte@petstore.com
- **Website**: https://petstore.com
- **GitHub Issues**: [Reportar bug o sugerencia]
- **Discord**: [Unirse a la comunidad]

---

## 📊 Estadísticas del Proyecto

![GitHub stars](https://img.shields.io/github/stars/tu-usuario/frontend_petstore?style=social)
![GitHub forks](https://img.shields.io/github/forks/tu-usuario/frontend_petstore?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/tu-usuario/frontend_petstore?style=social)

![Lines of code](https://img.shields.io/tokei/lines/github/tu-usuario/frontend_petstore)
![GitHub code size](https://img.shields.io/github/languages/code-size/tu-usuario/frontend_petstore)
![GitHub repo size](https://img.shields.io/github/repo-size/tu-usuario/frontend_petstore)

---

<div align="center">

**Hecho con ❤️ y ☕ por el equipo de Pet Store**

⭐ Si este proyecto te fue útil, considera darle una estrella

[⬆ Volver arriba](#-pet-store---sistema-de-gestión-veterinaria-con-ia)

</div>

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0.0






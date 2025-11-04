# 📋 CASOS DE USO Y FLUJOS DE TRABAJO

## Tabla de Contenidos

1. [Casos de Uso por Rol](#1-casos-de-uso-por-rol)
2. [Flujos de Trabajo Principales](#2-flujos-de-trabajo-principales)
3. [Diagramas de Secuencia](#3-diagramas-de-secuencia)
4. [Historias de Usuario](#4-historias-de-usuario)
5. [Escenarios de Negocio](#5-escenarios-de-negocio)

---

## 1. Casos de Uso por Rol

### 👑 SuperAdmin

#### CU-SA-001: Gestionar Empresas (Tenants)
**Actor**: SuperAdmin  
**Precondición**: Usuario autenticado como SuperAdmin  
**Flujo Principal**:
1. Accede al módulo "Tenants"
2. Clic en "Nueva Empresa"
3. Completa formulario (razón social, NIT, plan)
4. Guarda empresa
5. Sistema crea tenant aislado

**Postcondición**: Nueva empresa disponible en el sistema

---

#### CU-SA-002: Gestionar Usuarios del Sistema
**Actor**: SuperAdmin  
**Precondición**: Usuario autenticado como SuperAdmin  
**Flujo Principal**:
1. Accede al módulo "Usuarios"
2. Clic en "Nuevo Usuario"
3. Completa datos y **selecciona rol**
4. Sistema valida email único
5. Guarda usuario
6. Usuario recibe credenciales

**Postcondición**: Nuevo usuario puede iniciar sesión

---

### 👨‍💼 Admin

#### CU-AD-001: Gestionar Inventario
**Actor**: Admin  
**Precondición**: Usuario autenticado como Admin  
**Flujo Principal**:
1. Accede al módulo "Productos"
2. Revisa alertas de stock bajo
3. Actualiza stock de productos críticos
4. Registra nuevos productos
5. Configura alertas de vencimiento

**Postcondición**: Inventario actualizado

---

#### CU-AD-002: Generar Reporte de Ventas
**Actor**: Admin  
**Precondición**: Usuario autenticado como Admin  
**Flujo Principal**:
1. Accede a Dashboard
2. Revisa métricas de ventas
3. Filtra por rango de fechas
4. Exporta reporte (PDF/Excel)
5. Analiza clustering de clientes

**Postcondición**: Reporte generado y analizado

---

### 👨‍⚕️ Veterinario

#### CU-VET-001: Atender Consulta Médica
**Actor**: Veterinario  
**Precondición**: Cita programada y paciente presente  
**Flujo Principal**:
1. Accede al módulo "Citas"
2. Localiza cita del día
3. Marca cita como "En proceso"
4. Examina paciente
5. Crea **Historia Clínica** con:
   - Diagnóstico
   - Tratamiento
   - Peso y temperatura
   - Observaciones
6. Marca cita como "Completada"
7. Si corresponde, agenda próxima cita

**Postcondición**: Cita completada, historia clínica guardada

---

#### CU-VET-002: Aplicar Vacuna
**Actor**: Veterinario  
**Precondición**: Cita programada para vacunación  
**Flujo Principal**:
1. Accede al módulo "Vacunaciones"
2. Clic en "Nueva Vacunación"
3. Selecciona mascota
4. Completa datos de la vacuna:
   - Nombre (ej: Antirrábica)
   - Tipo, lote, fabricante
   - Fecha de aplicación
   - Próxima dosis (si requiere)
5. Guarda registro
6. Actualiza historia clínica

**Postcondición**: Vacuna registrada, recordatorio programado

---

### 👨‍💻 Empleado/Recepcionista

#### CU-EMP-001: Registrar Cliente Nuevo
**Actor**: Empleado  
**Precondición**: Cliente visita la clínica  
**Flujo Principal**:
1. Accede al módulo "Clientes"
2. Clic en "Nuevo Cliente"
3. Solicita datos al cliente:
   - Nombre completo
   - Documento de identidad
   - Email
   - Teléfono
   - Dirección
4. Guarda cliente
5. Sistema genera cuenta de acceso

**Postcondición**: Cliente registrado y puede agendar citas

---

#### CU-EMP-002: Agendar Cita
**Actor**: Empleado  
**Precondición**: Cliente y mascota registrados  
**Flujo Principal**:
1. Cliente solicita cita
2. Accede al módulo "Citas"
3. Clic en "Nueva Cita"
4. Selecciona:
   - Mascota
   - Servicio (ej: Consulta general)
   - Fecha y hora disponible
   - Veterinario (opcional)
5. Agrega observaciones si las hay
6. Confirma cita
7. Sistema envía recordatorio (email/SMS)

**Postcondición**: Cita programada, recordatorio enviado

---

#### CU-EMP-003: Generar Factura
**Actor**: Empleado  
**Precondición**: Cliente ha recibido servicios/productos  
**Flujo Principal**:
1. Accede al módulo "Facturas"
2. Clic en "Nueva Factura"
3. **Selecciona cliente** (obligatorio)
4. Agrega items al carrito:
   - **Productos**: busca y agrega del inventario
   - **Servicios**: selecciona citas completadas
   - **Vacunas**: selecciona vacunaciones completadas
5. Configura descuento (si aplica)
6. Configura impuesto
7. Revisa total
8. Clic en "Generar Factura"
9. Imprime factura
10. Entrega al cliente
11. Citas/vacunas cambian a "Facturada"

**Postcondición**: Factura generada, items marcados como facturados

---

### 👤 Cliente

#### CU-CLI-001: Registrar Mascota
**Actor**: Cliente  
**Precondición**: Cliente autenticado  
**Flujo Principal**:
1. Accede a "Mis Mascotas"
2. Clic en "Nueva Mascota"
3. Completa datos:
   - Nombre
   - Tipo y raza
   - Edad, sexo, color
   - Cuidados especiales
4. Guarda mascota
5. Sistema la asocia al cliente

**Postcondición**: Mascota registrada, visible para veterinarios

---

#### CU-CLI-002: Consultar Historial Médico
**Actor**: Cliente  
**Precondición**: Cliente autenticado con mascotas  
**Flujo Principal**:
1. Accede a "Mis Mascotas"
2. Selecciona una mascota
3. Ve secciones:
   - Historia clínica
   - Vacunas aplicadas
   - Citas pasadas
4. Puede descargar reportes

**Postcondición**: Cliente informado del estado de salud de su mascota

---

## 2. Flujos de Trabajo Principales

### 🔄 Flujo 1: Atención Completa de un Paciente

```
┌─────────────────────────────────┐
│ 1. Cliente llama/visita         │
│    para agendar cita             │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 2. Empleado verifica si cliente │
│    está registrado               │
└─────────────────┬───────────────┘
                  ↓
         ┌────────┴────────┐
         │ ¿Registrado?    │
         └────┬───────┬────┘
              │       │
        NO ←──┘       └──→ SÍ
         ↓                 ↓
┌──────────────────┐  ┌──────────────────┐
│ 3a. Registrar    │  │ 3b. Buscar       │
│     cliente      │  │     cliente      │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         └──────────┬──────────┘
                    ↓
┌─────────────────────────────────┐
│ 4. Empleado verifica si mascota │
│    está registrada               │
└─────────────────┬───────────────┘
                  ↓
         ┌────────┴────────┐
         │ ¿Registrada?    │
         └────┬───────┬────┘
              │       │
        NO ←──┘       └──→ SÍ
         ↓                 ↓
┌──────────────────┐  ┌──────────────────┐
│ 5a. Registrar    │  │ 5b. Continuar    │
│     mascota      │  │                  │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         └──────────┬──────────┘
                    ↓
┌─────────────────────────────────┐
│ 6. Empleado agenda cita:         │
│    - Selecciona servicio         │
│    - Elige fecha/hora            │
│    - Asigna veterinario          │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 7. Sistema envía recordatorio   │
│    (email/SMS)                   │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 8. Día de la cita: Cliente      │
│    llega a la clínica            │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 9. Veterinario atiende:          │
│    - Examina paciente            │
│    - Crea historia clínica       │
│    - Aplica vacuna (si aplica)   │
│    - Marca cita como completada  │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 10. Cliente pasa a caja          │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 11. Empleado genera factura:     │
│     - Agrega servicio de cita    │
│     - Agrega vacuna (si aplica)  │
│     - Agrega productos (si aplica)│
│     - Calcula total              │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 12. Cliente paga y recibe        │
│     factura impresa              │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 13. Cita/vacuna marcan como      │
│     "Facturada"                  │
└─────────────────────────────────┘
```

---

### 🔄 Flujo 2: Gestión de Inventario

```
┌─────────────────────────────────┐
│ 1. Admin recibe producto nuevo   │
│    del proveedor                 │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 2. Admin registra en sistema:    │
│    - Código y nombre             │
│    - Precio                      │
│    - Stock inicial               │
│    - Stock mínimo (alerta)       │
│    - Fecha de vencimiento        │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 3. Sistema almacena producto    │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 4. Empleado vende producto       │
│    (en factura)                  │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 5. Sistema descuenta stock       │
│    automáticamente               │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 6. Sistema verifica:             │
│    ¿Stock <= Stock mínimo?       │
└─────────────────┬───────────────┘
                  ↓
         ┌────────┴────────┐
         │ ¿Stock bajo?    │
         └────┬───────┬────┘
              │       │
        NO ←──┘       └──→ SÍ
         ↓                 ↓
┌──────────────────┐  ┌──────────────────┐
│ 7a. Continuar    │  │ 7b. Genera alerta│
│     operación    │  │     🔴 Stock bajo│
└──────────────────┘  └────────┬─────────┘
                               ↓
                    ┌─────────────────────┐
                    │ 8. Admin ve alerta  │
                    │    en Dashboard     │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ 9. Admin contacta   │
                    │    proveedor        │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ 10. Reabastecer     │
                    │     (volver a paso 1)│
                    └─────────────────────┘
```

---

### 🔄 Flujo 3: Uso del Chatbot de IA

```
┌─────────────────────────────────┐
│ 1. Usuario accede al Dashboard   │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 2. Ve botón flotante verde       │
│    (esquina inferior derecha)     │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 3. Clic en botón                 │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ 4. Sistema verifica conexión     │
│    con API de IA (puerto 8000)   │
└─────────────────┬───────────────┘
                  ↓
         ┌────────┴────────┐
         │ ¿IA disponible? │
         └────┬───────┬────┘
              │       │
        NO ←──┘       └──→ SÍ
         ↓                 ↓
┌──────────────────┐  ┌──────────────────┐
│ 5a. Muestra      │  │ 5b. Abre panel   │
│    "Desconectado"│  │     de chat      │
└──────────────────┘  └────────┬─────────┘
                               ↓
                    ┌─────────────────────┐
                    │ 6. Usuario escribe  │
                    │    pregunta         │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ 7. Sistema envía a  │
                    │    API de IA        │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ 8. IA procesa con:  │
                    │    - NLP            │
                    │    - ML models      │
                    │    - Consulta DB    │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ 9. IA genera        │
                    │    respuesta        │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ 10. Sistema muestra │
                    │     respuesta       │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ 11. Usuario puede   │
                    │     hacer más       │
                    │     preguntas       │
                    └─────────────────────┘
```

---

## 3. Diagramas de Secuencia

### Secuencia: Generar Factura

```
Empleado    Sistema Frontend    Backend API    Base de Datos
   │              │                  │                │
   │ Clic "Nueva │                  │                │
   │  Factura"   │                  │                │
   ├─────────────>│                  │                │
   │              │ Solicita clientes│                │
   │              ├─────────────────>│                │
   │              │                  │ SELECT clients │
   │              │                  ├───────────────>│
   │              │                  │<───────────────┤
   │              │<─────────────────┤                │
   │<─────────────┤ Muestra lista    │                │
   │              │                  │                │
   │ Selecciona  │                  │                │
   │  cliente    │                  │                │
   ├─────────────>│                  │                │
   │              │ Solicita citas   │                │
   │              │  completadas     │                │
   │              ├─────────────────>│                │
   │              │                  │ SELECT appts   │
   │              │                  ├───────────────>│
   │              │                  │<───────────────┤
   │              │<─────────────────┤                │
   │<─────────────┤ Muestra citas    │                │
   │              │                  │                │
   │ Agrega items│                  │                │
   │  al carrito │                  │                │
   ├─────────────>│                  │                │
   │              │ Calcula total    │                │
   │              │ (local)          │                │
   │<─────────────┤ Muestra total    │                │
   │              │                  │                │
   │ Clic "Generar"│                 │                │
   ├─────────────>│                  │                │
   │              │ POST /invoices   │                │
   │              ├─────────────────>│                │
   │              │                  │ INSERT invoice │
   │              │                  ├───────────────>│
   │              │                  │ INSERT details │
   │              │                  ├───────────────>│
   │              │                  │ UPDATE stock   │
   │              │                  ├───────────────>│
   │              │                  │ UPDATE appts   │
   │              │                  ├───────────────>│
   │              │                  │<───────────────┤
   │              │<─────────────────┤ Invoice created│
   │<─────────────┤ Factura generada │                │
   │              │                  │                │
   │ Clic "Imprimir"│                │                │
   ├─────────────>│                  │                │
   │              │ window.print()   │                │
   │<─────────────┤ Abre impresión   │                │
```

---

### Secuencia: Chatbot Consulta

```
Usuario    Frontend    IA API (FastAPI)    ML Model    Base de Datos
   │           │              │                │              │
   │ Escribe  │              │                │              │
   │ mensaje  │              │                │              │
   ├─────────>│              │                │              │
   │           │ POST /api/chat│              │              │
   │           ├─────────────>│                │              │
   │           │              │ Procesa NLP    │              │
   │           │              ├───────────────>│              │
   │           │              │<───────────────┤ Intent detected
   │           │              │ Consulta SQL   │              │
   │           │              ├────────────────────────────────>│
   │           │              │<────────────────────────────────┤
   │           │              │ Procesa datos  │              │
   │           │              ├───────────────>│              │
   │           │              │ Genera respuesta│             │
   │           │              │<───────────────┤              │
   │           │<─────────────┤                │              │
   │<──────────┤ Muestra      │                │              │
   │           │ respuesta    │                │              │
```

---

## 4. Historias de Usuario

### HU-001: Registro de Cliente Nuevo
**Como** recepcionista  
**Quiero** registrar rápidamente a un cliente nuevo  
**Para que** pueda agendar su cita de inmediato

**Criterios de Aceptación**:
- ✅ Formulario con campos obligatorios: nombre, email, documento
- ✅ Validación de email único
- ✅ Generación automática de credenciales
- ✅ Confirmación visual de registro exitoso
- ✅ Tiempo de registro < 2 minutos

---

### HU-002: Agenda de Citas Visual
**Como** veterinario  
**Quiero** ver mis citas del día en un calendario visual  
**Para que** pueda organizar mejor mi tiempo

**Criterios de Aceptación**:
- ✅ Vista de calendario por día/semana
- ✅ Código de colores por estado (pendiente, completada)
- ✅ Información básica visible: mascota, cliente, servicio
- ✅ Clic para ver detalles completos
- ✅ Opción de marcar como completada desde calendario

---

### HU-003: Alertas de Inventario
**Como** administrador  
**Quiero** recibir alertas cuando un producto esté bajo de stock  
**Para que** pueda reabastecerlo antes de que se agote

**Criterios de Aceptación**:
- ✅ Alerta roja cuando stock <= stock mínimo
- ✅ Alerta amarilla cuando producto próximo a vencer (< 3 meses)
- ✅ Contador visible en Dashboard
- ✅ Lista de productos críticos
- ✅ Opción de generar orden de compra

---

### HU-004: Chatbot Inteligente
**Como** usuario del sistema  
**Quiero** hacer preguntas al chatbot de IA  
**Para que** pueda obtener información rápidamente sin navegar

**Criterios de Aceptación**:
- ✅ Botón flotante siempre visible
- ✅ Responde preguntas sobre estadísticas
- ✅ Proporciona información de clientes/mascotas
- ✅ Tiempo de respuesta < 3 segundos
- ✅ Respuestas en lenguaje natural

---

### HU-005: Facturación Rápida
**Como** empleado  
**Quiero** generar una factura en menos de 3 minutos  
**Para que** el cliente no espere mucho tiempo

**Criterios de Aceptación**:
- ✅ Selección rápida de cliente
- ✅ Agregar items con búsqueda instantánea
- ✅ Cálculo automático de totales
- ✅ Un solo clic para generar
- ✅ Impresión inmediata

---

## 5. Escenarios de Negocio

### Escenario 1: Campaña de Vacunación

**Contexto**: La clínica quiere realizar una campaña de vacunación antirrábica.

**Actores**: Admin, Empleados, Veterinarios, Clientes

**Flujo**:
1. **Admin** revisa clustering de clientes
2. Identifica clientes con mascotas sin vacunar
3. **Admin** configura promoción (descuento 20%)
4. **Empleados** llaman a clientes del segmento "Ocasional"
5. **Clientes** agendan citas masivamente
6. **Veterinarios** aplican vacunas
7. **Empleados** facturan con descuento aplicado
8. Sistema genera reporte de campaña:
   - Total de vacunas aplicadas
   - Ingresos generados
   - Clientes reactivados

**Resultado**: 
- 150 vacunas aplicadas
- $3,750,000 en ingresos
- 45 clientes reactivados (de "Ocasional" a "Regular")

---

### Escenario 2: Optimización de Horarios

**Contexto**: La clínica quiere optimizar los horarios de atención.

**Actores**: Admin, Sistema de IA

**Flujo**:
1. **Admin** accede al Dashboard
2. Revisa análisis de IA: "Análisis Temporal"
3. Identifica:
   - **Día con más atención**: Sábado
   - **Hora pico**: 10:00 AM - 12:00 PM
   - **Día con menos atención**: Lunes
4. **Admin** toma decisiones:
   - Contratar veterinario adicional para sábados
   - Ofrecer descuentos para lunes
   - Ajustar horarios de apertura
5. Sistema monitorea cambios con IA
6. Después de 1 mes, revisa métricas:
   - Reducción de 30% en tiempos de espera
   - Aumento de 20% en citas de lunes
   - Mejor satisfacción del cliente

**Resultado**: Optimización de recursos y mejor experiencia

---

### Escenario 3: Detección de Cliente VIP

**Contexto**: La clínica quiere identificar y retener clientes VIP.

**Actores**: Admin, Sistema ML (Clustering)

**Flujo**:
1. Sistema ejecuta **clustering jerárquico** mensualmente
2. Identifica **Segmento VIP**:
   - Gasto promedio: $500,000/mes
   - Citas promedio: 4/mes
   - Tasa de asistencia: 95%
   - 15 clientes en este segmento
3. **Admin** revisa estrategia sugerida:
   - Programa de lealtad
   - Descuentos exclusivos
   - Atención prioritaria
4. **Admin** implementa programa VIP:
   - Tarjeta VIP digital
   - 10% descuento permanente
   - Citas sin espera
   - Línea de WhatsApp exclusiva
5. Sistema monitorea retención:
   - 0% de clientes VIP perdidos
   - Aumento de 25% en gasto promedio
   - Recomiendan clínica a otros

**Resultado**: Retención de clientes de alto valor

---

### Escenario 4: Gestión de Emergencias

**Contexto**: Cliente llama con emergencia médica para su mascota.

**Actores**: Empleado, Veterinario, Cliente

**Flujo**:
1. **Cliente** llama: "Mi perro fue atropellado"
2. **Empleado** consulta chatbot: "¿Qué hacer en emergencia?"
3. Chatbot sugiere protocolo:
   - Marcar cita como "Emergencia"
   - Prioridad máxima
   - Avisar a veterinario de turno
4. **Empleado** crea cita emergencia
5. Sistema notifica a **Veterinario** vía SMS
6. **Cliente** llega en 10 minutos
7. **Veterinario** atiende inmediatamente
8. Crea historia clínica urgente
9. Aplica tratamiento
10. **Empleado** factura servicio de emergencia
11. Sistema registra tiempo de respuesta: 12 minutos

**Resultado**: Vida de la mascota salvada, cliente satisfecho

---

## 6. Métricas de Éxito

### Métricas por Módulo

| Módulo | Métrica Clave | Objetivo |
|--------|---------------|----------|
| **Citas** | Tasa de asistencia | > 85% |
| **Facturación** | Tiempo promedio | < 3 min |
| **Inventario** | Productos sin stock | 0% |
| **IA Chatbot** | Respuestas correctas | > 90% |
| **Clustering** | Silhouette Score | > 0.5 |

### KPIs del Sistema

- **Satisfacción del Cliente**: > 4.5/5
- **Tiempo de Carga**: < 2 segundos
- **Uptime**: > 99%
- **Errores**: < 0.1% de peticiones
- **Usuarios Activos**: Crecimiento mensual > 10%

---

## 7. Glosario de Términos

| Término | Definición |
|---------|------------|
| **Clustering** | Agrupación automática de datos similares usando ML |
| **JWT** | JSON Web Token, estándar para autenticación |
| **NLP** | Natural Language Processing, procesamiento de lenguaje natural |
| **Random Forest** | Algoritmo de ML para clasificación |
| **Silhouette Score** | Métrica de calidad de clustering (0-1) |
| **Tenant** | Empresa en sistema multi-tenant |
| **API REST** | Interfaz de programación basada en HTTP |
| **SPA** | Single Page Application |

---

**FIN DEL DOCUMENTO** 📋

**Última actualización**: Noviembre 2025  
**Versión**: 1.0



# 🚀 GUÍA RÁPIDA DE USUARIO - PET STORE

## 📋 Contenido Rápido

1. [Primeros Pasos](#1-primeros-pasos)
2. [Tareas Comunes](#2-tareas-comunes)
3. [Flujos de Trabajo](#3-flujos-de-trabajo)
4. [Preguntas Frecuentes](#4-preguntas-frecuentes)
5. [Atajos y Tips](#5-atajos-y-tips)

---

## 1. Primeros Pasos

### 🔐 Iniciar Sesión

1. Abre tu navegador e ingresa a: `http://localhost:5173`
2. Ingresa tu **email** y **contraseña**
3. Haz clic en **"Iniciar Sesión"**
4. Serás redirigido al Dashboard

**Nota**: Si olvidaste tu contraseña, contacta al administrador.

---

### 📊 Conociendo el Dashboard

El **Dashboard** es tu página principal. Aquí verás:

- **Métricas del día**: citas, ventas, productos
- **Análisis de IA** (si está activo):
  - Tipo de mascota más común
  - Día con más atención
  - Hora pico de atención
  - Clustering de clientes
- **Chatbot flotante** (botón verde en la esquina)

---

## 2. Tareas Comunes

### 👤 Registrar un Nuevo Cliente

**Ruta**: Menú lateral → **Clientes** → Botón **"Nuevo Cliente"**

1. **Nombre completo** *
2. **Tipo de documento**: CC, TI, CE, Pasaporte
3. **Número de documento** *
4. **Email** * (para login del cliente)
5. **Teléfono**
6. **Dirección**
7. Clic en **"Crear"**

✅ **Resultado**: El cliente puede ahora iniciar sesión con su email.

---

### 🐾 Registrar una Mascota

**Ruta**: Menú lateral → **Mascotas** → Botón **"Nueva Mascota"**

1. **Nombre de la mascota** *
2. **Tipo** *: Perro, Gato, Conejo, Loro, Hámster
3. **Raza** *
4. **Edad** (en años)
5. **Sexo**: Macho/Hembra
6. **Color**
7. **Cuidados especiales** (opcional)
8. **Propietarios** * (seleccionar de la lista)
9. Clic en **"Crear"**

💡 **Tip**: Puedes asignar múltiples propietarios a una mascota.

---

### 📅 Agendar una Cita

**Ruta**: Menú lateral → **Citas** → Botón **"Nueva Cita"**

1. **Mascota** *: Busca y selecciona
2. **Cliente/Propietario** *: Se autocompleta
3. **Servicio** *: Consulta, Vacunación, Cirugía, etc.
4. **Veterinario** (opcional)
5. **Fecha y hora** *
6. **Observaciones** (opcional): ej. "Mascota agresiva"
7. Clic en **"Crear"**

✅ **Resultado**: La cita queda **Pendiente** hasta que se complete.

---

### ✅ Completar una Cita

**Cuando la mascota ya fue atendida**:

1. En la lista de **Citas**, localiza la cita
2. Busca el botón ✅ (check verde)
3. Haz clic en **"Completar"**
4. (Opcional) Agrega un **diagnóstico**
5. Confirma

✅ **Resultado**: La cita cambia a **"Completada"** y puede ser facturada.

---

### 💰 Generar una Factura

**Ruta**: Menú lateral → **Facturas** → Botón **"Nueva Factura"**

#### Paso 1: Seleccionar Cliente
- Busca y selecciona el cliente
- **Sin cliente no puedes continuar**

#### Paso 2: Agregar Items al Carrito

**Pestaña "Productos en Stock"**:
1. Busca el producto
2. Selecciona **cantidad**
3. Clic en **"Agregar al Carrito"**

**Pestaña "Servicios de Citas"**:
1. Selecciona la **mascota** del cliente
2. Aparecen las citas **completadas** (no facturadas)
3. Selecciona las citas deseadas
4. Clic en **"Agregar Servicios"**

**Pestaña "Vacunas"** (Similar a servicios):
1. Selecciona la mascota
2. Aparecen vacunas completadas
3. Clic en **"Agregar Vacunas"**

#### Paso 3: Revisar Carrito
- Verifica items, cantidades y precios
- Configura **descuento** (% o valor fijo)
- Configura **impuesto** (% o valor fijo)

#### Paso 4: Generar
1. Clic en **"Generar Factura"**
2. Espera confirmación
3. Clic en **"Imprimir Factura"** para PDF

✅ **Resultado**: 
- Factura creada
- Citas/vacunas marcadas como **"Facturada"**
- Stock de productos descontado

---

### 💉 Registrar una Vacuna

**Ruta**: Menú lateral → **Vacunaciones** → Botón **"Nueva Vacunación"**

1. **Mascota** *
2. **Veterinario** *
3. **Nombre de la vacuna** * (ej: Antirrábica)
4. **Tipo de vacuna** *: Viral, Bacterial, etc.
5. **Fabricante**
6. **Número de lote**
7. **Fecha de aplicación** *
8. **Fecha de próxima dosis** (si requiere refuerzo)
9. **Número de dosis**
10. **Sitio de aplicación** (ej: Subcutáneo)
11. **Observaciones**
12. ☑️ **¿Requiere refuerzo?**
13. Clic en **"Crear"**

✅ **Resultado**: Registro guardado con estado **"Completada"**.

---

### 📋 Crear Historia Clínica

**Ruta**: Menú lateral → **Historia Clínica** → Botón **"Nueva Historia"**

1. **Mascota** *
2. **Cita relacionada** (opcional)
3. **Servicio** *
4. **Veterinario** *
5. **Fecha de atención** *
6. **Tipo de procedimiento** *
7. **Diagnóstico** * (descripción detallada)
8. **Tratamiento** * (medicamentos, indicaciones)
9. **Observaciones**
10. **Peso** (kg)
11. **Temperatura** (°C)
12. **Notas adicionales**
13. Clic en **"Crear"**

✅ **Resultado**: Registro médico completo guardado.

---

### 📦 Agregar un Producto al Inventario

**Ruta**: Menú lateral → **Productos** → Botón **"Nuevo Producto"**

1. **Código del producto**
2. **Nombre** *
3. **Descripción** *
4. **Presentación** (ej: 10ml, 500g)
5. **Precio de venta** * (en COP)
6. **Stock actual** *
7. **Stock mínimo** * (para alertas)
8. **Fecha de vencimiento**
9. **Número de lote**
10. **Fabricante/Marca**
11. ☑️ **¿Es vacuna?**
12. Clic en **"Crear"**

💡 **Alertas automáticas**:
- 🔴 **Stock bajo**: cuando stock ≤ stock mínimo
- 🟡 **Próximo a vencer**: menos de 3 meses

---

### 🏥 Crear un Nuevo Servicio

**Ruta**: Menú lateral → **Servicios** → Botón **"Nuevo Servicio"**

1. **Código del servicio**
2. **Nombre del servicio** *
3. **Descripción** *
4. **Precio** * (en COP)
5. **Duración estimada** (en minutos)
6. Clic en **"Crear"**

**Ejemplos de servicios**:
- Consulta general
- Vacunación antirrábica
- Cirugía menor
- Baño y peluquería
- Desparasitación
- Radiografía

---

## 3. Flujos de Trabajo

### 🔄 Flujo Completo: De la Cita a la Factura

```
1. 👤 Registrar cliente (si es nuevo)
   ↓
2. 🐾 Registrar mascota del cliente
   ↓
3. 📅 Agendar cita (estado: Pendiente)
   ↓
4. ✅ Completar cita (estado: Completada)
   ↓
5. 📋 Crear historia clínica (opcional)
   ↓
6. 💉 Registrar vacuna (si se aplicó)
   ↓
7. 💰 Generar factura
   │  └─ Agregar servicios de la cita
   │  └─ Agregar vacunas
   │  └─ Agregar productos
   ↓
8. 🖨️ Imprimir factura
   ↓
9. ✅ Cita y vacuna → estado: Facturada
```

---

### 🔄 Flujo de Inventario

```
1. 📦 Registrar producto en inventario
   ↓
2. 👁️ Monitorear alertas:
   │  ├─ 🔴 Stock bajo → Reabastecer
   │  └─ 🟡 Próximo a vencer → Promocionar
   ↓
3. 💰 Vender producto (en factura)
   ↓
4. 📊 Stock se descuenta automáticamente
   ↓
5. 🔁 Repetir desde paso 2
```

---

## 4. Preguntas Frecuentes

### ❓ ¿Cómo busco un cliente?

En cualquier página con tabla (Clientes, Citas, Facturas):
1. Usa la **barra de búsqueda** en la parte superior
2. Escribe: nombre, email o documento
3. Los resultados se filtran en **tiempo real**

---

### ❓ ¿Cómo sé cuántas páginas hay?

En la parte inferior de cada tabla verás:
```
Mostrando 1 a 10 de 50 clientes
[<< Primera] [< Anterior] [1] [2] [3] [4] [5] [Siguiente >] [Última >>]
```

---

### ❓ ¿Puedo editar una factura?

**No**, las facturas son **inmutables** una vez generadas. Solo puedes:
- Cambiar su estado (Pagada/Pendiente)
- Ver detalles
- Imprimir

Si necesitas corregir algo, debes anular la factura (contacta al administrador) y crear una nueva.

---

### ❓ ¿Cómo uso el Chatbot de IA?

1. En el Dashboard, busca el **botón verde flotante** (esquina inferior derecha)
2. Haz clic para **abrir** el chatbot
3. Escribe tu pregunta (ejemplos):
   - "¿Cuántas mascotas hay?"
   - "Dame estadísticas de citas"
   - "¿Cuál es el día con más atención?"
4. El asistente responderá con información del sistema

💡 **Requisito**: La API de Python debe estar corriendo (`python api.py`).

---

### ❓ ¿Qué significa "API de IA no disponible"?

Significa que el servidor de Inteligencia Artificial no está activo. **Sin IA**:
- ❌ No habrá análisis predictivo
- ❌ No funcionará el chatbot
- ❌ No se mostrará clustering de clientes
- ✅ El resto del sistema funciona normal

**Solución**: Contacta al administrador para que inicie la API de IA.

---

### ❓ ¿Cómo veo el historial médico de una mascota?

**Opción 1**: Desde Mascotas
1. Ve a **Mascotas**
2. Localiza la mascota
3. Clic en **"Ver"** o ícono de ojo 👁️
4. Verás: historial clínico, citas y vacunas

**Opción 2**: Desde Historia Clínica
1. Ve a **Historia Clínica**
2. Usa el filtro de búsqueda
3. Busca por nombre de mascota

---

### ❓ ¿Puedo tener múltiples propietarios para una mascota?

✅ **Sí**. Puedes asignar varios propietarios a una mascota (ej: familia).

**Cómo hacerlo**:
1. Al crear/editar mascota
2. En el campo **"Propietarios"**, selecciona múltiples clientes
3. Todos verán la mascota en su cuenta

---

## 5. Atajos y Tips

### ⌨️ Atajos de Teclado

| Acción | Atajo |
|--------|-------|
| Buscar en página | `Ctrl + F` |
| Recargar página | `Ctrl + R` o `F5` |
| Cerrar modal | `Esc` |
| Zoom in | `Ctrl + +` |
| Zoom out | `Ctrl + -` |

---

### 💡 Tips Útiles

#### 📌 Tip 1: Usa la Búsqueda
No navegues página por página. Usa la **barra de búsqueda** para encontrar rápidamente clientes, mascotas o productos.

#### 📌 Tip 2: Verifica el Estado
Antes de facturar una cita, verifica que esté en estado **"Completada"**. Las citas pendientes o canceladas no aparecen.

#### 📌 Tip 3: Revisa Alertas
En el módulo de **Productos**, revisa diariamente:
- 🔴 Stock bajo → Reabastece
- 🟡 Próximos a vencer → Promociona o descarta

#### 📌 Tip 4: Completa la Historia Clínica
Siempre completa la **historia clínica** después de una consulta. Esto ayuda al veterinario en futuras visitas.

#### 📌 Tip 5: Usa el Clustering
Ve al Dashboard y revisa el **análisis de clustering** para:
- Identificar tus mejores clientes (Segmento VIP)
- Ver patrones de atención por día/hora
- Optimizar tu inventario según demanda

#### 📌 Tip 6: Imprime Facturas Inmediatamente
Después de generar una factura, **imprímela de inmediato**. No puedes editarla después.

#### 📌 Tip 7: Verifica el Cliente en el Carrito
Antes de agregar items al carrito, **selecciona el cliente primero**. Sin cliente, no podrás agregar nada.

#### 📌 Tip 8: Usa Observaciones
En citas y historias clínicas, usa el campo **"Observaciones"** para notas importantes:
- "Mascota agresiva con extraños"
- "Alérgico a penicilina"
- "Requiere sedación para procedimientos"

#### 📌 Tip 9: Programa Citas con Anticipación
No esperes al último momento. Programa las citas con **al menos 1 día de anticipación**.

#### 📌 Tip 10: Pregunta al Chatbot
Si tienes dudas sobre estadísticas o información del sistema, **pregúntale al chatbot** antes de buscar manualmente.

---

## 6. Iconografía del Sistema

| Icono | Significado |
|-------|-------------|
| 👁️ | Ver detalles |
| ✏️ | Editar |
| 🗑️ | Eliminar |
| ✅ | Completar/Activar |
| ❌ | Cancelar/Desactivar |
| 🖨️ | Imprimir |
| 🔍 | Buscar |
| ➕ | Agregar/Nuevo |
| 🔄 | Refrescar |
| 💬 | Chatbot |
| 📊 | Estadísticas/Dashboard |
| 🟢 | Activo/Disponible |
| 🔴 | Inactivo/Alerta |
| 🟡 | Advertencia |
| 🔵 | Información |

---

## 7. Estados de los Elementos

### Estados de Cita
- 🟡 **Pendiente**: Programada pero no realizada
- 🔵 **Completada**: Atención finalizada
- 🟢 **Facturada**: Ya fue cobrada
- 🔴 **Cancelada**: Anulada

### Estados de Vacuna
- 🔵 **Completada**: Aplicada
- 🟢 **Facturada**: Ya fue cobrada

### Estados de Factura
- 🟡 **Pendiente**: No pagada
- 🟢 **Pagada**: Cobrada

### Estados de Producto
- 🟢 **Stock suficiente**
- 🔴 **Stock bajo** (≤ stock mínimo)
- 🟡 **Próximo a vencer** (< 3 meses)

---

## 8. Roles y Accesos

### 👑 SuperAdmin
- **Acceso total** al sistema
- Gestionar usuarios, empresas y configuración

### 👨‍💼 Admin
- Gestión operativa completa
- Crear usuarios, gestionar inventario, facturas

### 👨‍💻 Empleado
- Operaciones diarias
- Citas, clientes, facturas

### 👨‍⚕️ Veterinario
- Gestión médica
- Historias clínicas, vacunas, citas

### 👤 Cliente
- Gestionar sus mascotas
- Ver historial médico
- Ver facturas

---

## 9. Soporte y Ayuda

### 🆘 ¿Necesitas Ayuda?

1. **Consulta este manual** primero
2. **Pregunta al chatbot** (si está disponible)
3. **Contacta al administrador** del sistema
4. **Revisa la consola del navegador** (F12) para errores técnicos

### 📞 Contacto de Soporte

- Email: soporte@petstore.com (ejemplo)
- Teléfono: (555) 123-4567 (ejemplo)
- Horario: Lunes a Viernes, 9am - 6pm

---

## 10. Actualizaciones y Cambios

**Versión Actual**: 1.0  
**Última Actualización**: Noviembre 2025

### 🆕 Novedades de esta Versión:
- ✅ Dashboard con análisis de IA
- ✅ Chatbot inteligente
- ✅ Clustering de clientes
- ✅ Paginación en todas las tablas
- ✅ Carrito de compras mejorado
- ✅ Alertas de inventario

---

**¡Gracias por usar Pet Store!** 🐾💚

Si tienes sugerencias para mejorar este manual, contacta al equipo de desarrollo.

---

**FIN DE LA GUÍA RÁPIDA** 🎉



# 🤖 Guía de Integración del Chatbot con IA

## ✅ ¿Qué se ha integrado?

Se ha integrado completamente el chatbot con IA y análisis de Machine Learning en tu Dashboard de React.

### 📦 Componentes Creados/Modificados:

1. **`src/components/Chatbot.tsx`** ✨ NUEVO
   - Componente de chatbot funcional con IA
   - Interfaz de chat moderna con mensajes en tiempo real
   - Manejo de estados de conexión y errores
   - Ejemplos de preguntas rápidas
   - Visualización de confianza e intención del bot

2. **`src/services/api.ts`** 🔧 MODIFICADO
   - Agregada la API `chatbotAPI` con todos los endpoints de IA
   - Conexión a `http://localhost:8000` (API de Python)
   - Endpoints disponibles:
     - Chatbot conversacional
     - Estadísticas generales
     - Análisis de tipos de mascota
     - Análisis de días y horas pico
     - Predicciones con IA
     - Búsqueda de mascotas y clientes

3. **`src/pages/Dashboard.tsx`** 🔧 MODIFICADO
   - Agregado tab "Chatbot IA" con el componente funcional
   - Agregado tab "Análisis con IA" con visualizaciones:
     - Estadísticas generales (mascotas, clientes, citas, servicios)
     - Tipo de mascota más común
     - Distribución por tipo de mascota
     - Día con más atención (gráfico de barras)
     - Hora pico de atención (gráfico de barras)

---

## 🚀 Cómo Usar

### Paso 1: Iniciar la API de IA (Python)

**En una terminal separada**, navega a la carpeta donde está tu API de Python y ejecuta:

```bash
python api.py
```

O si creaste el script de inicio:

```bash
python iniciar_api.py
```

Deberías ver:

```
✅ LISTO - Presiona Ctrl+C para detener
🌐 Servidor corriendo en: http://localhost:8000
```

**Importante:** Deja esta terminal abierta mientras usas el chatbot.

---

### Paso 2: Iniciar tu Frontend React

En otra terminal (en la carpeta de tu frontend):

```bash
npm run dev
```

---

### Paso 3: Usar el Dashboard

1. **Inicia sesión** en tu aplicación
2. **Ve al Dashboard**
3. Verás **3 tabs** disponibles:
   - 📊 **Dashboard**: Vista tradicional con KPIs
   - 💬 **Chatbot IA**: Chatbot conversacional con IA
   - 🧠 **Análisis con IA**: Estadísticas y visualizaciones generadas por Machine Learning

---

## 💬 Usando el Chatbot IA

### Preguntas que puedes hacer:

El chatbot está entrenado para responder preguntas como:

- **Estadísticas:**
  - "¿Cuántos clientes tengo?"
  - "¿Cuántas mascotas están registradas?"
  - "¿Cuántas citas hay?"
  - "Muestra las estadísticas"

- **Análisis de tipos:**
  - "¿Cuál es el tipo de mascota más común?"
  - "¿Qué porcentaje son perros?"
  - "Muestra los tipos de mascotas"

- **Análisis temporal:**
  - "¿Qué día hay más atención?"
  - "¿Cuál es la hora pico?"
  - "¿Qué días son más ocupados?"

- **Búsquedas:**
  - "Buscar mascota Max"
  - "Buscar cliente correo@example.com"
  - "Historial de la mascota ID 5"

- **Predicciones (si los modelos están entrenados):**
  - "Predecir tipo de mascota para el viernes a las 10"
  - "¿Qué tipo de mascota es más probable?"

### Características del Chatbot:

- ✅ **Indicador de conexión** en tiempo real
- ✅ **Mensajes con timestamp**
- ✅ **Confianza e intención** del bot (para debugging)
- ✅ **Ejemplos de preguntas** para usuarios nuevos
- ✅ **Autodesplazamiento** a mensajes nuevos
- ✅ **Manejo de errores** si la API no está disponible
- ✅ **Indicador de carga** mientras el bot "piensa"

---

## 🧠 Usando el Análisis con IA

En el tab **"Análisis con IA"** verás:

### 1. Estadísticas Generales (Cards de colores)
- 🔵 Total Mascotas
- 🟢 Total Clientes
- 🟣 Total Citas
- 🟠 Total Servicios

### 2. Tipo de Mascota Más Común
- Emoji grande del tipo más común (🐕 o 🐱)
- Nombre del tipo
- Porcentaje del total

### 3. Distribución por Tipo
- Barras de progreso para cada tipo
- Cantidad de mascotas
- Porcentaje
- Promedio de citas por tipo

### 4. Día con Más Atención
- Nombre del día más concurrido
- Gráfico de barras con todos los días de la semana
- Total de citas por día

### 5. Hora Pico de Atención
- Hora con más citas (formato 24h)
- Gráfico de barras con distribución por hora
- Total de citas por hora

---

## ⚙️ Configuración Avanzada

### Si tu API de IA está en otro puerto o servidor:

Edita `src/services/api.ts`, línea ~286:

```typescript
const IA_API_BASE_URL = 'http://localhost:8000'; // Cambia aquí
```

### Si tienes problemas de CORS:

En tu `api.py` (Python), asegúrate de tener:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Puerto de tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔧 Solución de Problemas

### ❌ "No se pudo conectar con el servidor de IA"

**Causa:** La API de Python no está corriendo.

**Solución:**
1. Abre una terminal
2. Ve a la carpeta de tu API de Python
3. Ejecuta `python api.py`
4. Verifica que diga "Servidor corriendo en: http://localhost:8000"
5. En el frontend, haz clic en "Reintentar conexión"

---

### ❌ "ModuleNotFoundError: No module named 'fastapi'"

**Causa:** Falta instalar las dependencias de Python.

**Solución:**
```bash
pip install fastapi uvicorn pydantic scikit-learn pandas numpy
```

---

### ❌ El chatbot no responde correctamente

**Causa:** Los modelos de IA no están entrenados.

**Solución:**

**Opción 1: Desde la API** (recomendado)
```bash
# Hacer un POST request
curl -X POST http://localhost:8000/api/entrenar
```

**Opción 2: Desde terminal**
```bash
python main.py
# Selecciona opción 4: Entrenar Modelos de IA
```

**Opción 3: Agregar botón en el frontend**

Puedes agregar un botón en el Dashboard para entrenar los modelos:

```typescript
const entrenarModelos = async () => {
  try {
    await chatbotAPI.entrenarModelos();
    alert('Modelos de IA entrenados exitosamente');
  } catch (error) {
    alert('Error entrenando modelos');
  }
};
```

---

### ❌ No aparecen las estadísticas en "Análisis con IA"

**Causa:** La API no puede conectarse a tu base de datos PostgreSQL.

**Solución:**

1. Verifica que PostgreSQL esté corriendo
2. Verifica las credenciales en tu `config.py` o archivo de configuración de la API de Python:
   ```python
   DATABASE_URL = "postgresql://usuario:password@localhost:5432/petstore"
   ```
3. Verifica que la tabla `pets`, `appointments`, etc. existan en tu base de datos

---

## 📊 Endpoints Disponibles

Tu frontend ahora puede consumir estos endpoints de la API de IA:

### Chatbot
- `POST /api/chat` - Enviar mensaje
- `GET /api/chat/comandos` - Listar comandos

### Estadísticas
- `GET /api/estadisticas` - Estadísticas generales

### Análisis
- `GET /api/analisis/tipos-mascota` - Tipos de mascotas
- `GET /api/analisis/dias-atencion` - Días con más atención
- `GET /api/analisis/horas-pico` - Horas pico
- `GET /api/analisis/servicios` - Servicios más utilizados

### Predicciones (requiere modelos entrenados)
- `POST /api/predicciones/tipo-mascota` - Predecir tipo
- `POST /api/predicciones/asistencia` - Predecir asistencia
- `GET /api/predicciones/estado` - Estado de los modelos

### Consultas
- `GET /api/mascotas/buscar/{nombre}` - Buscar mascota
- `GET /api/mascotas/{pet_id}/historial` - Historial
- `GET /api/clientes/buscar/{correo}` - Buscar cliente
- `GET /api/servicios` - Servicios disponibles

---

## 🎨 Personalización

### Cambiar colores del chatbot:

En `src/components/Chatbot.tsx`:

- **Mensajes del usuario:** Busca `bg-green-600` (línea ~217)
- **Avatar del usuario:** Busca `bg-green-600` (línea ~210)
- **Botón de enviar:** Busca `bg-green-600` (línea ~254)

### Agregar más ejemplos de preguntas:

En `src/components/Chatbot.tsx`, línea ~125:

```typescript
const ejemplosPreguntas = [
  '¿Cuál es el tipo de mascota más común?',
  '¿Qué día hay más atención?',
  '¿Cuántos clientes tengo?',
  'Muestra las estadísticas',
  // Agrega más aquí 👇
  'Tu nueva pregunta aquí',
];
```

---

## 📝 Resumen de Archivos

### Archivos Creados:
- ✨ `src/components/Chatbot.tsx` - Componente del chatbot

### Archivos Modificados:
- 🔧 `src/services/api.ts` - API del chatbot
- 🔧 `src/pages/Dashboard.tsx` - Integración del chatbot

---

## 🚀 ¡Listo para Usar!

Tu aplicación ahora tiene:

✅ Chatbot conversacional con IA  
✅ Análisis con Machine Learning  
✅ Visualizaciones interactivas  
✅ Predicciones basadas en datos históricos  
✅ Interfaz moderna y responsive  

**¡Disfruta de tu nuevo asistente virtual con IA!** 🎉

---

## 📖 Documentación Adicional

Para más información sobre la API de IA, consulta:
- `README_API.md` (en tu carpeta de Python)
- `http://localhost:8000/docs` (cuando la API esté corriendo)



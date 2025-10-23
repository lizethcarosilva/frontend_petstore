# 📚 Guía: PrimeReact + Componentes Modulares en React

## 🎯 ¿Qué es PrimeReact?

**PrimeReact** es el equivalente de **PrimeNG** para React. Proporciona una librería completa de componentes UI profesionales.

- 🔗 **Sitio oficial**: https://primereact.org/
- 📦 **Componentes**: +90 componentes (Tablas, Formularios, Diálogos, Toast, etc.)
- 🎨 **Temas**: Múltiples temas personalizables

---

## ✅ Instalación Completada

```bash
npm install primereact primeicons
```

**Archivos modificados:**
- ✅ `src/main.tsx` - Importados los estilos CSS
- ✅ `src/pages/Tenants.tsx` - Implementado Toast para notificaciones

---

## 📋 Componentes PrimeReact Implementados

### 1. **Toast** - Notificaciones

```tsx
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

const MiComponente = () => {
  const toast = useRef<Toast>(null);

  const mostrarExito = () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Operación completada',
      life: 3000 // 3 segundos
    });
  };

  return (
    <div>
      <Toast ref={toast} />
      <button onClick={mostrarExito}>Mostrar Notificación</button>
    </div>
  );
};
```

**Tipos de severidad:**
- `success` - Verde (éxito)
- `info` - Azul (información)
- `warn` - Amarillo (advertencia)
- `error` - Rojo (error)

---

## 🏗️ Estructura de Componentes Modulares en React

### Angular vs React - Comparación

#### **Angular**:
```
user/
  ├── user.component.ts    (lógica)
  ├── user.component.html  (template)
  └── user.component.css   (estilos)
```

#### **React** (Recomendado):

**Opción 1: Componentes separados en carpeta**
```
Tenants/
  ├── index.tsx              (componente principal, exporta todo)
  ├── TenantPage.tsx         (página principal)
  ├── TenantForm.tsx         (formulario)
  ├── TenantTable.tsx        (tabla)
  ├── TenantFilters.tsx      (filtros de búsqueda)
  ├── tenants.styles.ts      (estilos con styled-components)
  └── types.ts               (tipos TypeScript locales)
```

**Opción 2: CSS Modules (similar a Angular)**
```
Tenants/
  ├── TenantPage.tsx         (lógica + JSX)
  └── TenantPage.module.css  (estilos CSS)
```

**Opción 3: Archivo único grande (actual)**
```
pages/
  └── Tenants.tsx            (todo en un archivo)
```

---

## 🚀 Cómo Crear Componentes Modulares

### **PASO 1: Crear la estructura de carpetas**

```bash
src/
  └── components/
      └── Tenants/
          ├── index.tsx           # Exporta todos los componentes
          ├── TenantPage.tsx      # Componente principal
          ├── TenantForm.tsx      # Formulario
          ├── TenantTable.tsx     # Tabla
          └── TenantRow.tsx       # Fila de tabla
```

---

### **PASO 2: Crear el componente principal**

**`TenantPage.tsx`** (lógica del componente):
```tsx
import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { tenantAPI } from '../../services/api';
import type { Tenant } from '../../types/types';
import TenantForm from './TenantForm';
import TenantTable from './TenantTable';

const TenantPage: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      const response = await tenantAPI.getAll();
      setTenants(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar empresas',
        life: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (tenant: Tenant) => {
    try {
      if (tenant.tenantId) {
        await tenantAPI.update(tenant);
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empresa actualizada',
          life: 3000
        });
      } else {
        await tenantAPI.create(tenant);
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empresa creada',
          life: 3000
        });
      }
      loadTenants();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al guardar empresa',
        life: 3000
      });
    }
  };

  return (
    <div className="space-y-6">
      <Toast ref={toast} />
      
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestionar Empresas</h1>
        
        <TenantForm onSave={handleSave} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <TenantTable 
          tenants={tenants} 
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default TenantPage;
```

---

### **PASO 3: Crear el componente del formulario**

**`TenantForm.tsx`**:
```tsx
import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { Tenant } from '../../types/types';

interface TenantFormProps {
  onSave: (tenant: Tenant) => Promise<void>;
  initialData?: Tenant;
  onCancel?: () => void;
}

const TenantForm: React.FC<TenantFormProps> = ({ onSave, initialData, onCancel }) => {
  const [formData, setFormData] = useState<Tenant>(
    initialData || {
      razonSocial: '',
      nit: '',
      direccion: '',
      telefono: '',
      email: '',
      plan: '',
      configuracion: ''
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la Empresa
        </label>
        <input
          type="text"
          name="razonSocial"
          value={formData.razonSocial}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          NIT
        </label>
        <input
          type="text"
          name="nit"
          value={formData.nit}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      {/* Más campos... */}

      <div className="flex items-center space-x-4 col-span-full">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Guardar</span>
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Cancelar</span>
          </button>
        )}
      </div>
    </form>
  );
};

export default TenantForm;
```

---

### **PASO 4: Crear el componente de la tabla**

**`TenantTable.tsx`**:
```tsx
import React from 'react';
import { Edit, Trash2, Building2 } from 'lucide-react';
import type { Tenant } from '../../types/types';
import TenantRow from './TenantRow';

interface TenantTableProps {
  tenants: Tenant[];
  isLoading: boolean;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
}

const TenantTable: React.FC<TenantTableProps> = ({ 
  tenants, 
  isLoading, 
  onEdit, 
  onDelete 
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              NIT
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tenants.map((tenant) => (
            <TenantRow
              key={tenant.tenantId}
              tenant={tenant}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TenantTable;
```

---

### **PASO 5: Crear el componente de fila de tabla**

**`TenantRow.tsx`**:
```tsx
import React from 'react';
import { Edit, Trash2, Building2 } from 'lucide-react';
import type { Tenant } from '../../types/types';

interface TenantRowProps {
  tenant: Tenant;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
}

const TenantRow: React.FC<TenantRowProps> = ({ tenant, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Building2 className="h-5 w-5 text-gray-400 mr-3" />
          <span className="text-sm font-medium text-gray-900">
            {tenant.razonSocial}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {tenant.nit}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {tenant.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {tenant.plan}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <button
          onClick={() => onEdit(tenant)}
          className="text-blue-600 hover:text-blue-900"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(tenant)}
          className="text-red-600 hover:text-red-900"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
};

export default TenantRow;
```

---

### **PASO 6: Crear el archivo index para exportar**

**`index.tsx`**:
```tsx
export { default as TenantPage } from './TenantPage';
export { default as TenantForm } from './TenantForm';
export { default as TenantTable } from './TenantTable';
export { default as TenantRow } from './TenantRow';
```

---

### **PASO 7: Usar el componente en la página**

**`src/pages/Tenants.tsx`**:
```tsx
import React from 'react';
import { TenantPage } from '../components/Tenants';

const Tenants: React.FC = () => {
  return <TenantPage />;
};

export default Tenants;
```

---

## 📦 Otros Componentes Útiles de PrimeReact

### 1. **DataTable** - Tabla avanzada

```tsx
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const MiTabla = () => {
  const tenants = [...]; // tus datos

  return (
    <DataTable value={tenants} paginator rows={10}>
      <Column field="razonSocial" header="Nombre"></Column>
      <Column field="nit" header="NIT"></Column>
      <Column field="email" header="Email"></Column>
    </DataTable>
  );
};
```

### 2. **Dialog** - Modal/Diálogo

```tsx
import { Dialog } from 'primereact/dialog';
import { useState } from 'react';

const MiComponente = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button onClick={() => setVisible(true)}>Abrir Modal</button>
      
      <Dialog 
        header="Título del Modal" 
        visible={visible} 
        onHide={() => setVisible(false)}
        style={{ width: '50vw' }}
      >
        <p>Contenido del modal</p>
      </Dialog>
    </>
  );
};
```

### 3. **Button** - Botón de PrimeReact

```tsx
import { Button } from 'primereact/button';

const MiBotones = () => {
  return (
    <>
      <Button label="Guardar" icon="pi pi-check" severity="success" />
      <Button label="Cancelar" icon="pi pi-times" severity="danger" />
      <Button label="Información" icon="pi pi-info-circle" severity="info" />
    </>
  );
};
```

### 4. **InputText** - Campo de texto

```tsx
import { InputText } from 'primereact/inputtext';

const MiFormulario = () => {
  const [value, setValue] = useState('');

  return (
    <InputText 
      value={value} 
      onChange={(e) => setValue(e.target.value)}
      placeholder="Escribe aquí"
    />
  );
};
```

### 5. **Dropdown** - Select mejorado

```tsx
import { Dropdown } from 'primereact/dropdown';

const MiSelect = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const planes = [
    { label: 'Básico', value: 'basico' },
    { label: 'Profesional', value: 'profesional' },
    { label: 'Premium', value: 'premium' }
  ];

  return (
    <Dropdown 
      value={selectedPlan} 
      options={planes} 
      onChange={(e) => setSelectedPlan(e.value)} 
      placeholder="Seleccionar Plan"
    />
  );
};
```

### 6. **ConfirmDialog** - Confirmación elegante

```tsx
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const MiComponente = () => {
  const confirmarEliminar = () => {
    confirmDialog({
      message: '¿Estás seguro de eliminar esta empresa?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Eliminar
      },
      reject: () => {
        // Cancelar
      }
    });
  };

  return (
    <>
      <ConfirmDialog />
      <button onClick={confirmarEliminar}>Eliminar</button>
    </>
  );
};
```

---

## 🎨 Temas Disponibles

Puedes cambiar el tema en `src/main.tsx`:

```tsx
// Tema claro verde (actual)
import 'primereact/resources/themes/lara-light-green/theme.css';

// Otros temas disponibles:
import 'primereact/resources/themes/lara-light-blue/theme.css';    // Azul
import 'primereact/resources/themes/lara-dark-green/theme.css';    // Verde oscuro
import 'primereact/resources/themes/lara-dark-blue/theme.css';     // Azul oscuro
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css'; // Bootstrap
import 'primereact/resources/themes/md-light-indigo/theme.css';    // Material Design
```

---

## 📚 Recursos

- 📖 **Documentación oficial**: https://primereact.org/
- 🎨 **Showcase**: https://primereact.org/showcase
- 💡 **Ejemplos**: https://primereact.org/templates
- 🎯 **Temas**: https://primereact.org/theming

---

## ✅ Resumen

**Lo que hicimos:**
1. ✅ Instalamos PrimeReact y PrimeIcons
2. ✅ Configuramos los estilos CSS en `main.tsx`
3. ✅ Implementamos Toast en la página de Tenants
4. ✅ Agregamos notificaciones de éxito, error e información

**Próximos pasos recomendados:**
1. 🔄 Refactorizar páginas grandes en componentes modulares
2. 📊 Usar `DataTable` de PrimeReact en lugar de tablas HTML
3. 🎨 Usar `Dialog` para formularios modales
4. ✨ Usar `Button`, `InputText`, `Dropdown` de PrimeReact

**Estructura recomendada para cada módulo:**
```
components/
  └── NombreModulo/
      ├── index.tsx           # Exporta todo
      ├── ModulePage.tsx      # Página principal
      ├── ModuleForm.tsx      # Formulario
      ├── ModuleTable.tsx     # Tabla
      └── ModuleRow.tsx       # Fila de tabla
```

---

**¡Ahora tienes PrimeReact funcionando con notificaciones Toast!** 🎉


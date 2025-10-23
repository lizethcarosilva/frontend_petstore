import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
        
import { 
  Plus, 
  Search, 
  Edit, 
  Save, 
  X, 
  Building2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { tenantAPI } from '../services/api';
import type { Tenant } from '../types/types';


const Tenants: React.FC = () => {
  // Referencia para el Toast
  const toast = useRef<Toast>(null);
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    razonSocial: '',
    nit: '',
    direccion: '',
    telefono: '',
    email: '',
    plan: '',
    configuracion: ''
  });

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    filterTenants();
  }, [tenants, searchTerm]);

  // Funciones de notificación Toast
  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      life: 3000
    });
  };

  const showError = (message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000
    });
  };

  const showInfo = (message: string) => {
    toast.current?.show({
      severity: 'info',
      summary: 'Información',
      detail: message,
      life: 3000
    });
  };

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      const response = await tenantAPI.getAll();
      setTenants(response.data);
      setFilteredTenants(response.data);
    } catch (error) {
      console.error('Error loading tenants:', error);
      showError('Error al cargar las empresas');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTenants = () => {
    if (!tenants || tenants.length === 0) {
      setFilteredTenants([]);
      return;
    }
    
    const filtered = tenants.filter(tenant =>
      tenant.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.nit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTenants(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTenant) {
        await tenantAPI.update({ ...formData, tenantId: editingTenant.tenantId });
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empresa actualizada exitosamente',
          life: 3000
        });

      } else {
        await tenantAPI.create(formData);
        
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empresa creada exitosamente',
          life: 3000
        });
      }

      setTimeout(async () => {
        await loadTenants();
        resetForm();
        setShowForm(false);
      }, 1000);

    } catch (error: any) {
      console.error('Error saving tenant:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data || 'Error al guardar la empresa',
        life: 3000
      });
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      razonSocial: tenant.razonSocial,
      nit: tenant.nit,
      direccion: tenant.direccion,
      telefono: tenant.telefono,
      email: tenant.email,
      plan: tenant.plan,
      configuracion: tenant.configuracion || ''
    });

    setShowForm(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = async (tenant: Tenant) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tenant?')) {
      try {
        await tenantAPI.deactivate(tenant.tenantId!);
        await loadTenants();
        showSuccess('Empresa eliminada exitosamente');
      } catch (error) {
        console.error('Error deleting tenant:', error);
        showError('Error al eliminar la empresa');
      }
    }
  };

  const handleToggleActive = async (tenant: Tenant) => {
    try {
      if (tenant.activo) {
        await tenantAPI.deactivate(tenant.tenantId!);
        showInfo('Empresa desactivada');
      } else {
        await tenantAPI.activate(tenant.tenantId!);
        showInfo('Empresa activada');
      }
      await loadTenants();
    } catch (error) {
      console.error('Error toggling tenant status:', error);
      showError('Error al cambiar el estado de la empresa');
    }
  };

  const resetForm = () => {
    setFormData({
      razonSocial: '',
      nit: '',
      direccion: '',
      telefono: '',
      email: '',
      plan: '',
      configuracion: ''
    });
    setEditingTenant(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast para notificaciones */}
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestionar Tenants</h1>
        
        {/* Tenant Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                name="razonSocial"
                value={formData.razonSocial}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan
              </label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar plan</option>
                <option value="Básico">Básico</option>
                <option value="Profesional">Profesional</option>
                <option value="Empresarial">Empresarial</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div className="flex items-center space-x-4 col-span-full">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Guardar</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tenants List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
  
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Empresa</span>
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, NIT o email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tenants Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="flex items-center justify-center px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.tenantId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{tenant.razonSocial}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.nit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.direccion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.telefono}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(tenant)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tenant.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {tenant.activo ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="flex items-center justify-center px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(tenant)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

 
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">


            <button
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2"
              onClick={() => window.location.href = '/'}
            >
              <span>Regresar al Menú Principal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tenants;

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Save, 
  X, 
  Package,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { serviceAPI } from '../services/api';
import type { Service } from '../types/types';
import { useAuth } from '../contexts/AuthContext';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';

const Services: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    duracionMinutos: 0,
    activo: true
  });

  // Hook de paginación
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage
  } = usePagination({
    data: filteredServices,
    itemsPerPage: 10
  });

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm]);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const response = await serviceAPI.getAll();
      setServices(response.data);
      setFilteredServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    const filtered = services.filter(service =>
      service.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              (name === 'precio' ? (parseFloat(value) || 0) :
               name === 'duracionMinutos' ? (parseInt(value) || 0) :
               type === 'number' ? (parseInt(value) || 0) : value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        // Preparar datos para actualización según Service model del backend
        const updateData = {
          serviceId: editingService.serviceId || parseInt(editingService.id || '0'),
          codigo: formData.codigo,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: Number(formData.precio),
          duracionMinutos: formData.duracionMinutos > 0 ? formData.duracionMinutos : null,
          activo: formData.activo
        };
        await serviceAPI.update(updateData);
      } else {
        // Preparar datos para creación según ServiceCreateDto
        // Validar que el precio sea mayor a 0
        if (formData.precio <= 0) {
          alert('El precio debe ser mayor a 0');
          return;
        }
        
        // Validar que el código no esté vacío
        if (!formData.codigo || formData.codigo.trim() === '') {
          alert('El código es obligatorio');
          return;
        }
        
        const createData = {
          codigo: formData.codigo.trim(),
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          precio: Number(formData.precio),
          duracionMinutos: formData.duracionMinutos > 0 ? formData.duracionMinutos : null
        };
        
        // Decodificar el token para verificar que contiene tenantId
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Token payload:', payload);
            console.log('Token tenantId:', payload.tenantId);
          } catch (e) {
            console.error('Error decoding token:', e);
          }
        }
        
        console.log('Creating service with data:', createData);
        console.log('User tenantId:', user?.tenantId);
        console.log('Token present:', !!token);
        
        const response = await serviceAPI.create(createData);
        console.log('Service created successfully:', response);
      }
      await loadServices();
      resetForm();
    } catch (error: any) {
      console.error('Error saving service:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      
      let errorMessage = 'Error desconocido';
      
      if (error?.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Si el error menciona tenant_id, es un problema del backend
      if (errorMessage.toLowerCase().includes('tenant') || errorMessage.toLowerCase().includes('null')) {
        alert(`Error del servidor: El sistema no puede obtener el tenant_id. Por favor, cierre sesión y vuelva a iniciar sesión. Si el problema persiste, contacte al administrador.\n\nDetalle: ${errorMessage}`);
      } else {
        alert(`Error al guardar el servicio: ${errorMessage}\n\nPor favor, verifique que:\n- El código sea único\n- Todos los campos estén completos\n- El precio sea mayor a 0`);
      }
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      codigo: service.codigo || '',
      nombre: service.nombre,
      descripcion: service.descripcion,
      precio: service.precio,
      duracionMinutos: service.duracionMinutos || 0,
      activo: service.activo !== undefined ? service.activo : true
    });
    setShowForm(true);
  };

  const handleDelete = async (service: Service) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      try {
        const serviceId = service.serviceId || parseInt(service.id || '0');
        await serviceAPI.delete(serviceId);
        await loadServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const updateData = {
        serviceId: service.serviceId || parseInt(service.id || '0'),
        codigo: service.codigo || '',
        nombre: service.nombre,
        descripcion: service.descripcion,
        precio: Number(service.precio),
        duracionMinutos: service.duracionMinutos && service.duracionMinutos > 0 ? service.duracionMinutos : null,
        activo: !service.activo
      };
      await serviceAPI.update(updateData);
      await loadServices();
    } catch (error) {
      console.error('Error toggling service status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio: 0,
      duracionMinutos: 0,
      activo: true
    });
    setEditingService(null);
    setShowForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Administrar Productos y Servicios</h1>
        
        {/* Service Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej. CONS-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Servicio
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej. Consulta General"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Venta
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (minutos)
              </label>
              <input
                type="number"
                name="duracionMinutos"
                value={formData.duracionMinutos}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej. 30"
                min="0"
              />
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej. Evaluación clínica de rutina"
                required
              />
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

      {/* Services List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Servicios Registrados</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Artículo</span>
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar artículos"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Services Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración (min)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((service) => (
                  <tr key={service.serviceId || service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {service.codigo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{service.nombre}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {service.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(service.precio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.duracionMinutos ? `${service.duracionMinutos} min` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(service)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {service.activo ? (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(service)}
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

          {/* Paginación */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredServices.length}
            itemsPerPage={10}
            onPageChange={goToPage}
            itemName="servicios"
          />

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

export default Services;
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Package,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { serviceAPI } from '../services/api';
import type { Service } from '../types/types';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: 0,
    activo: true
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
      service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await serviceAPI.update({ ...formData, id: editingService.id });
      } else {
        await serviceAPI.create(formData);
      }
      await loadServices();
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      nombre: service.nombre,
      descripcion: service.descripcion,
      precio: service.precio,
      activo: service.activo || false
    });
    setShowForm(true);
  };

  const handleDelete = async (service: Service) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      try {
        await serviceAPI.delete({ id: service.id });
        await loadServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await serviceAPI.update({ ...service, activo: !service.activo });
      await loadServices();
    } catch (error) {
      console.error('Error toggling service status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: 0,
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
                Descripción
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

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presentación/Descripción
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
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Presentación/Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Venta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Editar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {service.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{service.nombre}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(service.precio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      0
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Items por página</span>
              <select className="border border-gray-300 rounded-md px-2 py-1 text-sm">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">1-10 de {filteredServices.length}</span>
              <div className="flex space-x-1">
                <button className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  &lt;&lt;
                </button>
                <button className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  &lt;
                </button>
                <button className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  &gt;
                </button>
                <button className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  &gt;&gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
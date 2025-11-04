import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { tenantAPI } from '../services/api';
import type { Tenant } from '../types/types';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';

const Tenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState<Tenant>({
    razonSocial: '',
    nit: '',
    direccion: '',
    telefono: '',
    email: '',
    plan: 'BASICO',
    activo: true,
  });

  // Hook de paginación
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage
  } = usePagination({
    data: filteredTenants,
    itemsPerPage: 10
  });

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    filterTenants();
  }, [searchTerm, tenants]);

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      const response = await tenantAPI.getAll();
      console.log('✅ Tenants cargados:', response.data);
      setTenants(response.data);
    } catch (error: any) {
      console.error('❌ Error loading tenants:', error);
      alert('Error al cargar las empresas: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const filterTenants = () => {
    if (!searchTerm.trim()) {
      setFilteredTenants(tenants);
      return;
    }

    const filtered = tenants.filter(tenant =>
      tenant.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.nit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.plan?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTenants(filtered);
  };

  const handleCreate = () => {
    setCurrentTenant(null);
    setFormData({
      razonSocial: '',
      nit: '',
      direccion: '',
      telefono: '',
      email: '',
      plan: 'BASICO',
      activo: true,
    });
    setShowModal(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    setFormData({
      tenantId: tenant.tenantId,
      razonSocial: tenant.razonSocial,
      nit: tenant.nit,
      direccion: tenant.direccion,
      telefono: tenant.telefono,
      email: tenant.email,
      plan: tenant.plan,
      activo: tenant.activo,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      if (currentTenant) {
        // Actualizar
        await tenantAPI.update({
          tenantId: formData.tenantId,
          razonSocial: formData.razonSocial,
          nit: formData.nit,
          direccion: formData.direccion,
          telefono: formData.telefono,
          email: formData.email,
          plan: formData.plan,
        });
        alert('Empresa actualizada exitosamente');
      } else {
        // Crear
        await tenantAPI.create(formData);
        alert('Empresa creada exitosamente');
      }

      setShowModal(false);
      loadTenants();
    } catch (error: any) {
      console.error('Error saving tenant:', error);
      alert('Error al guardar la empresa: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (tenant: Tenant) => {
    if (!tenant.tenantId) return;

    const confirmMessage = tenant.activo 
      ? '¿Está seguro de desactivar esta empresa?' 
      : '¿Está seguro de activar esta empresa?';
    
    if (!window.confirm(confirmMessage)) return;

    try {
      setIsLoading(true);
      
      if (tenant.activo) {
        await tenantAPI.deactivate(tenant.tenantId);
      } else {
        await tenantAPI.activate(tenant.tenantId);
      }
      
      alert(`Empresa ${tenant.activo ? 'desactivada' : 'activada'} exitosamente`);
      loadTenants();
    } catch (error: any) {
      console.error('Error toggling tenant status:', error);
      alert('Error al cambiar el estado: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan?.toUpperCase()) {
      case 'BASICO':
        return 'bg-gray-100 text-gray-800';
      case 'ESTANDAR':
        return 'bg-blue-100 text-blue-800';
      case 'PREMIUM':
        return 'bg-purple-100 text-purple-800';
      case 'ENTERPRISE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Building2 className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Empresas</h1>
            <p className="text-gray-600 mt-1">Administra las empresas del sistema</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Empresa
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por razón social, NIT, email o plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla de empresas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Razón Social
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Creación
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        {searchTerm ? 'No se encontraron empresas con ese criterio' : 'No hay empresas registradas'}
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((tenant) => (
                      <tr key={tenant.tenantId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {tenant.razonSocial}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{tenant.nit}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{tenant.email}</div>
                          <div className="text-sm text-gray-500">{tenant.telefono}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadgeColor(tenant.plan)}`}>
                            {tenant.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tenant.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tenant.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(tenant)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(tenant)}
                            className={`${tenant.activo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            title={tenant.activo ? 'Desactivar' : 'Activar'}
                          >
                            {tenant.activo ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {filteredTenants.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTenants.length}
                itemsPerPage={10}
                onPageChange={goToPage}
                itemName="empresas"
              />
            )}
          </>
        )}
      </div>

      {/* Modal para crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {currentTenant ? 'Editar Empresa' : 'Nueva Empresa'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.razonSocial}
                    onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIT *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nit}
                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan *
                  </label>
                  <select
                    required
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="BASICO">Básico</option>
                    <option value="ESTANDAR">Estándar</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition duration-200"
                >
                  {isLoading ? 'Guardando...' : (currentTenant ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;


import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Heart,
  User,
  Printer
} from 'lucide-react';
import { petAPI, userAPI } from '../services/api';
import type { Pet, User as UserType } from '../types/types';
import { useAuth } from '../contexts/AuthContext';

const Pets: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [owners, setOwners] = useState<UserType[]>([]);
  console.log('owners***********', owners);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); 
   const { user } = useAuth();
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({
    identificacionPropietario: '',
    nombre: '',
    tipo: '',
    raza: '',
    cuidadosEspeciales: '',
    activo: true
  });

  useEffect(() => {
    loadPets();
    loadOwners();
  }, []);

  useEffect(() => {
    filterPets();
  }, [pets, searchTerm]);

  const loadPets = async () => {
    try {
      setIsLoading(true);
      const response = await petAPI.getAll();
      setPets(response.data);
      setFilteredPets(response.data);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOwners = async () => {
    try {
      const response = await userAPI.getIdTenant(user?.tenantId || '');
      console.log('response owners:', response);
      console.log('response.data:', response.data);
      
      // Verificar que response.data sea un array
      if (Array.isArray(response.data)) {
        setOwners(response.data);
      } else if (response.data) {
        // Si es un objeto, convertirlo a array
        setOwners([response.data]);
      } else {
        // Si no hay datos, usar array vacío
        setOwners([]);
      }
    } catch (error) {
      console.error('Error loading owners:', error);
      setOwners([]); // Array vacío en caso de error
    }
  };




  const filterPets = () => {
    const filtered = pets.filter(pet =>
      pet.identificacionPropietario ||
      pet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPets(filtered);
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
      if (editingPet) {
        await petAPI.update({ ...formData, id: editingPet.id });
      } else {
        await petAPI.create(formData);
      }
      await loadPets();
      resetForm();
    } catch (error) {
      console.error('Error saving pet:', error);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      identificacionPropietario: pet.identificacionPropietario,
      nombre: pet.nombre,
      tipo: pet.tipo,
      raza: pet.raza,
      cuidadosEspeciales: pet.cuidadosEspeciales || '',
      activo: pet.activo || false
    });
    setShowForm(true);
  };

  const handleDelete = async (pet: Pet) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      try {
        await petAPI.delete({ id: pet.id });
        await loadPets();
      } catch (error) {
        console.error('Error deleting pet:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      identificacionPropietario: '',
      nombre: '',
      tipo: '',
      raza: '',
      cuidadosEspeciales: '',
      activo: true
    });
    setEditingPet(null);
    setShowForm(false);
  };

  const getOwnerInfo = (identificacion: string) => {
    const owner = owners.find(o => o.ident === identificacion);
    return owner ? { nombre: owner.name, celular: owner.telefono } : { nombre: 'No encontrado', celular: 'N/A' };
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
        <h1 className="text-2xl font-bold text-gray-900">Administrar Mascota</h1>
        
        {/* Pet Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificación Propietario
              </label>
              <select
                name="identificacionPropietario"
                value={formData.identificacionPropietario}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar propietario</option>
                {owners && Array.isArray(owners) && owners.map((owner: UserType) => (
                  <option key={owner.user_id} value={owner.ident}>
                    {owner.ident} - {owner.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej. Firulais"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de mascota
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Ave">Ave</option>
                <option value="Reptil">Reptil</option>
                <option value="Roedor">Roedor</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raza
              </label>
              <input
                type="text"
                name="raza"
                value={formData.raza}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej. Pastor alemán"
                required
              />
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuidados especiales
              </label>
              <textarea
                name="cuidadosEspeciales"
                value={formData.cuidadosEspeciales}
                onChange={(e) => setFormData(prev => ({ ...prev, cuidadosEspeciales: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe cualquier cuidado especial que necesite la mascota..."
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

      {/* Pets List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Mascotas Registradas</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Mascota</span>
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar identificación del propietario"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Pets Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Identificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propietario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Celular
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mascota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuidados especiales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPets.map((pet) => {
                  const ownerInfo = getOwnerInfo(pet.identificacionPropietario);
                  return (
                    <tr key={pet.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pet.identificacionPropietario}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{ownerInfo.nombre}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ownerInfo.celular}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 text-pink-500 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{pet.nombre}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {pet.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pet.raza}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pet.cuidadosEspeciales || 'Ninguno'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(pet)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pet)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Printer className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">
            <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2">
              <Trash2 className="h-4 w-4" />
              <span>Eliminar</span>
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Modificar</span>
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
              <Printer className="h-4 w-4" />
              <span>Imprimir</span>
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2">
              <span>Regresar al Menú Principal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pets;
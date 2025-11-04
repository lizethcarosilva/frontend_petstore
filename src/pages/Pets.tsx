import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Save, 
  X, 
  Heart,
  User
} from 'lucide-react';
import { petAPI, userAPI, clientAPI, rolesAPI } from '../services/api';
import type { Pet, User as UserType, ClientResponseDto } from '../types/types';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';

const Pets: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [owners, setOwners] = useState<ClientResponseDto[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const ownerSelectRef = React.useRef<HTMLSelectElement>(null);
  const [formData, setFormData] = useState({
    ownerIds: [] as number[],
    nombre: '',
    tipo: '',
    raza: '',
    cuidadosEspeciales: '',
    edad: '',
    sexo: '',
    color: ''
  });

  // Hook de paginación
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage
  } = usePagination({
    data: filteredPets,
    itemsPerPage: 10
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
      const petsData = Array.isArray(response.data) ? response.data : [];
      setPets(petsData);
      setFilteredPets(petsData);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await rolesAPI.getAll();
      if (Array.isArray(response.data)) {
        console.log('Roles cargados:', response.data.map(r => ({ id: r.rolId, nombre: r.nombre, desc: r.descripcion })));
        setRoles(response.data);
      }
    } catch (error: any) {
      console.error('Error loading roles:', error);
      // Si falla, usar roles conocidos como fallback
      const defaultRoles = [
        { rolId: '5', nombre: 'Cliente general', descripcion: 'Cliente' },
        { rolId: '6', nombre: 'Propietario', descripcion: 'Cliente' },
      ];
      console.warn('Usando roles por defecto debido a error:', defaultRoles);
      setRoles(defaultRoles);
    }
  };

  const loadOwners = async () => {
    try {
      console.log('Cargando clientes...');
      
      // Cargar CLIENTES desde el nuevo endpoint /api/clients
      const clientsResponse = await clientAPI.getAll();
      console.log('✅ Clientes cargados:', clientsResponse.data?.length || 0);
      
      if (Array.isArray(clientsResponse.data)) {
        // Filtrar solo clientes activos
        const activeClients = clientsResponse.data.filter((client: ClientResponseDto) => 
          client.activo !== false
        );
        
        console.log(`✅ Clientes activos: ${activeClients.length}`);
        setOwners(activeClients);
      } else {
        console.warn('clientsResponse.data no es un array:', clientsResponse.data);
        setOwners([]);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setOwners([]);
    }
  };




  const filterPets = () => {
    const filtered = pets.filter(pet => {
      // Los owners pueden venir como OwnerInfoDto o User, mapear para obtener ident
      const ownerIdents = pet.owners?.map((owner: any) => owner.ident || '').filter((i: string) => i).join(',') || '';
      return (
        ownerIdents.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredPets(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // El selector de propietarios se maneja directamente en el onChange del select
    if (name !== 'addOwner') {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que haya al menos un propietario
    if (formData.ownerIds.length === 0) {
      alert('Debe seleccionar al menos un propietario');
      return;
    }

    try {
      const submitData = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        raza: formData.raza,
        cuidadosEspeciales: formData.cuidadosEspeciales || '',
        edad: formData.edad ? parseInt(formData.edad.toString()) : undefined,
        sexo: formData.sexo,
        color: formData.color || '',
        ownerIds: formData.ownerIds // Asegurar que sea un array de números
      };

      console.log('Submitting data:', submitData);
      console.log('Owner IDs:', formData.ownerIds);

      let createdPetId: number | undefined;

      if (editingPet) {
        // Obtener los propietarios actuales de la mascota usando el endpoint getOwners
        let currentOwnerIds: number[] = [];
        try {
          const ownersResponse = await petAPI.getOwners(editingPet.petId!);
          console.log('Owners response from getOwners:', ownersResponse.data);
          if (Array.isArray(ownersResponse.data)) {
            currentOwnerIds = ownersResponse.data
              .map((owner: any) => {
                // OwnerInfoDto tiene userId
                const ownerId = owner.userId;
                return ownerId ? parseInt(String(ownerId)) : 0;
              })
              .filter((id: number) => id > 0);
          }
        } catch (error) {
          console.error('Error getting current pet owners:', error);
          // Si falla, usar los propietarios que ya tenemos en editingPet como fallback
          if (editingPet.owners && Array.isArray(editingPet.owners)) {
            currentOwnerIds = editingPet.owners
              .map((owner: any) => {
                const ownerId = owner.userId || owner.user_id;
                return ownerId ? parseInt(String(ownerId)) : 0;
              })
              .filter((id: number) => id > 0);
          }
        }

        // Actualizar la mascota primero (sin propietarios, esos se manejan después)
        const updateResponse = await petAPI.update({ ...submitData, petId: editingPet.petId });
        console.log('Update response:', updateResponse);

        // Identificar propietarios a agregar y a eliminar
        const ownersToAdd = formData.ownerIds.filter(id => !currentOwnerIds.includes(id));
        const ownersToRemove = currentOwnerIds.filter((id: number) => !formData.ownerIds.includes(id));

        console.log('Current owners:', currentOwnerIds);
        console.log('Owners to add:', ownersToAdd);
        console.log('Owners to remove:', ownersToRemove);

        // Eliminar propietarios que ya no están en la lista
        for (const ownerId of ownersToRemove) {
          try {
            await petAPI.removeOwner(editingPet.petId!, ownerId);
          } catch (error) {
            console.error(`Error removing owner ${ownerId}:`, error);
          }
        }

        // Agregar nuevos propietarios
        for (const ownerId of ownersToAdd) {
          try {
            await petAPI.addOwner(editingPet.petId!, ownerId);
          } catch (error) {
            console.error(`Error adding owner ${ownerId}:`, error);
          }
        }
      } else {
        // Crear nueva mascota
        const createResponse = await petAPI.create(submitData);
        console.log('Create response:', createResponse);
        
        // El backend debería crear la mascota con los ownerIds proporcionados
        // Si no, agregar los propietarios uno por uno
        createdPetId = createResponse.data?.petId;
        
        if (createdPetId && formData.ownerIds.length > 0) {
          // Agregar propietarios uno por uno por si el backend no procesó los ownerIds en create
          for (const ownerId of formData.ownerIds) {
            try {
              await petAPI.addOwner(createdPetId, ownerId);
            } catch (error) {
              console.error(`Error adding owner ${ownerId} to new pet:`, error);
            }
          }
        }
      }

      await loadPets();
      resetForm();
    } catch (error) {
      console.error('Error saving pet:', error);
      alert('Error al guardar la mascota. Por favor, intente nuevamente.');
    }
  };

  const handleEdit = async (pet: Pet) => {
    setEditingPet(pet);
    
    // Recargar roles primero si no están cargados, luego propietarios
    if (roles.length === 0) {
      await loadRoles();
    }
    await loadOwners();
    
    // Extract owner IDs from the pet's owners array
    let ownerIds: number[] = [];
    
    // Intentar obtener los propietarios usando el endpoint getOwners
    try {
      const ownersResponse = await petAPI.getOwners(pet.petId!);
      console.log('Owners response from getOwners:', ownersResponse.data);
      if (Array.isArray(ownersResponse.data)) {
        ownerIds = ownersResponse.data
          .map((owner: any) => {
            // OwnerInfoDto tiene userId
            const ownerId = owner.userId;
            return ownerId ? parseInt(String(ownerId)) : 0;
          })
          .filter((id: number) => id > 0);
        console.log('Owner IDs extraídos de getOwners:', ownerIds);
      }
    } catch (error) {
      console.error('Error obteniendo propietarios con getOwners:', error);
      // Fallback: usar los owners que vienen en pet.owners si getOwners falla
      if (pet.owners && Array.isArray(pet.owners) && pet.owners.length > 0) {
        ownerIds = pet.owners
          .map((owner: any) => {
            // Intentar obtener el ID de diferentes formas:
            // 1. OwnerInfoDto tiene userId
            // 2. User tiene user_id
            if (typeof owner === 'object' && owner !== null) {
              const ownerId = owner.userId || owner.user_id;
              if (ownerId) {
                return parseInt(String(ownerId));
              }
            }
            return 0;
          })
          .filter(id => id > 0);
        console.log('Owner IDs extraídos de pet.owners (fallback):', ownerIds);
      }
    }
    
    console.log('Clientes disponibles en owners state:', owners.length);
    console.log('Clientes disponibles:', owners.map(o => ({ id: o.clientId, name: o.name })));
    console.log('Owner IDs a establecer en formData:', ownerIds);
    console.log('Comparación: ¿Los ownerIds están en clientes?', ownerIds.map(id => ({
      id,
      encontrado: owners.some(o => o.clientId === id),
      owner: owners.find(o => o.clientId === id)
    })));
    
    setFormData({
      ownerIds: ownerIds,
      nombre: pet.nombre,
      tipo: pet.tipo,
      raza: pet.raza,
      cuidadosEspeciales: pet.cuidadosEspeciales || '',
      edad: pet.edad?.toString() || '',
      sexo: pet.sexo || '',
      color: pet.color || ''
    });
    
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      ownerIds: [],
      nombre: '',
      tipo: '',
      raza: '',
      cuidadosEspeciales: '',
      edad: '',
      sexo: '',
      color: ''
    });
    setEditingPet(null);
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Administrar Mascota</h1>
        
        {/* Pet Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Propietario(s)
              </label>
              
              {/* Propietarios seleccionados */}
              <div className="mb-3 flex flex-wrap gap-2">
                {formData.ownerIds.length > 0 ? (
                  formData.ownerIds.map((ownerId) => {
                    const owner = owners.find(o => o.clientId === ownerId);
                    if (!owner) {
                      // Si no se encuentra en la lista actual, mostrar solo el ID
                      return (
                        <div
                          key={ownerId}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                        >
                          <User className="h-3 w-3" />
                          <span>ID: {ownerId} (No encontrado en clientes)</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                ownerIds: prev.ownerIds.filter(id => id !== ownerId)
                              }));
                            }}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={ownerId}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        <User className="h-3 w-3" />
                        <span>{owner.ident} - {owner.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              ownerIds: prev.ownerIds.filter(id => id !== ownerId)
                            }));
                          }}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No hay propietarios seleccionados</p>
                )}
              </div>

              {/* Selector de propietarios disponibles */}
              <div className="flex gap-2">
                <select
                  ref={ownerSelectRef}
                  name="addOwner"
                  onChange={(e) => {
                    const ownerId = parseInt(e.target.value);
                    if (ownerId > 0 && !formData.ownerIds.includes(ownerId)) {
                      setFormData(prev => ({
                        ...prev,
                        ownerIds: [...prev.ownerIds, ownerId]
                      }));
                      // Reset select después de un breve delay para permitir que React procese el cambio
                      setTimeout(() => {
                        if (ownerSelectRef.current) {
                          ownerSelectRef.current.value = '';
                        }
                      }, 10);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  defaultValue=""
                >
                  <option value="">Seleccionar cliente para agregar</option>
                  {owners && Array.isArray(owners) && owners.length > 0 ? (
                    owners
                      .filter(owner => {
                        const ownerId = owner.clientId || 0;
                        return ownerId > 0 && !formData.ownerIds.includes(ownerId);
                      })
                      .map((owner: ClientResponseDto) => (
                        <option key={owner.clientId} value={owner.clientId}>
                          {owner.ident} - {owner.name}
                        </option>
                      ))
                  ) : (
                    <option value="" disabled>No hay clientes disponibles</option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (ownerSelectRef.current && ownerSelectRef.current.value) {
                      const ownerId = parseInt(ownerSelectRef.current.value);
                      if (ownerId > 0 && !formData.ownerIds.includes(ownerId)) {
                        setFormData(prev => ({
                          ...prev,
                          ownerIds: [...prev.ownerIds, ownerId]
                        }));
                        ownerSelectRef.current.value = '';
                        // Forzar actualización del select
                        setTimeout(() => {
                          if (ownerSelectRef.current) {
                            ownerSelectRef.current.value = '';
                          }
                        }, 10);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={
                    !ownerSelectRef.current || 
                    !ownerSelectRef.current.value || 
                    ownerSelectRef.current.value === '' ||
                    (owners && Array.isArray(owners) && owners.filter(owner => {
                      const ownerId = owner.clientId || 0;
                      return ownerId > 0 && !formData.ownerIds.includes(ownerId);
                    }).length === 0)
                  }
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar</span>
                </button>
              </div>
              
              {formData.ownerIds.length === 0 && (
                <p className="mt-2 text-xs text-red-500">Se requiere al menos un propietario</p>
              )}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad
              </label>
              <input
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej. 2"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo
              </label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar sexo</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej. Negro, Blanco"
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
              onClick={async () => {
                // Asegurar que los roles estén cargados antes de recargar propietarios
                if (roles.length === 0) {
                  await loadRoles();
                }
                // Recargar propietarios antes de mostrar el formulario
                await loadOwners();
                setShowForm(true);
              }}
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
                    Cliente
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
                    Edad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sexo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
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
                {paginatedData.map((pet) => {
                  // Los owners pueden venir como OwnerInfoDto (con userId, name, ident, telefono) o User completo
                  // Mapear para obtener la información correctamente
                  const ownerIdents = pet.owners?.map((owner: any) => owner.ident || '').filter((i: string) => i).join(',') || '';
                  const ownerNames = pet.owners?.map((owner: any) => owner.name || '').filter((n: string) => n).join(',') || '';
                  const ownerPhones = pet.owners?.map((owner: any) => owner.telefono || '').filter((p: string) => p).join(',') || '';
                  
                  return (
                    <tr key={pet.petId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ownerIdents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{ownerNames}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ownerPhones}
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
                        {pet.edad || 'N/A'} {pet.edad ? 'años' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {pet.sexo || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pet.color || 'N/A'}
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPets.length}
            itemsPerPage={10}
            onPageChange={goToPage}
            itemName="mascotas"
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

export default Pets;
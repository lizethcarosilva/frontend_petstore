import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Edit, 
  Save, 
  X, 
  UserPlus,
  UserCheck,
  UserX,
} from 'lucide-react';
import { userAPI, rolesAPI } from '../services/api';
import type { User, Role } from '../types/types';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    tipoId: '',
    ident: '',
    name: '',
    direccion: '',
    correo: '',
    telefono: '',
    password: '',
    rolId: '',
    activo: true
  });

  // Hook de paginación
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage
  } = usePagination({
    data: filteredUsers,
    itemsPerPage: 10
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getAll();
      // Filtrar SuperAdmin (rol_id = "1") - NUNCA debe aparecer en la lista
      const filtered = (response.data || []).filter((user: User) => {
        const rolId = user.rol_id?.toString() || '';
        return rolId !== '1'; // Excluir SuperAdmin
      });
      setUsers(filtered);
      setFilteredUsers(filtered);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await rolesAPI.getAll();
      if (Array.isArray(response.data)) {
        // Filtrar el SuperAdmin (rolId = "1" o rolId = 1) ya que es confidencial
        const filteredRoles = response.data.filter((role: Role) => {
          const roleId = role.rolId?.toString() || role.rolId;
          return roleId !== '1' && roleId !== '1';
        });
        console.log('Roles cargados desde API:', filteredRoles.map(r => ({ 
          id: r.rolId, 
          nombre: r.nombre || r.name, 
          desc: r.descripcion 
        })));
        setRoles(filteredRoles);
      } else {
        console.warn('Response.data no es un array:', response.data);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      // Si falla, usar roles por defecto (excepto SuperAdmin)
      const defaultRoles = [
        { rolId: '2', name: 'Administrador' },
        { rolId: '3', name: 'Veterinario' },
        { rolId: '4', name: 'Propietario' },
        { rolId: '5', name: 'Empleado' },
      ];
      console.log('Usando roles por defecto:', defaultRoles);
      setRoles(defaultRoles);
    }
  };

  const filterUsers = () => {
    if (!users || users.length === 0) {
      setFilteredUsers([]);
      return;
    }
    
    const filtered = users.filter(user =>
      user.ident?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
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
    
    // Validar que el rolId esté seleccionado
    if (!formData.rolId || formData.rolId.trim() === '') {
      alert('Debe seleccionar un rol');
      return;
    }
    
    // Validar que el rolId sea válido (debe existir en la lista de roles)
    const selectedRole = roles.find(r => r.rolId?.toString() === formData.rolId.toString());
    if (!selectedRole) {
      alert('El rol seleccionado no es válido. Por favor, seleccione otro rol.');
      return;
    }
    
    // El rolId debe enviarse como string según el DTO del backend
    const rolIdToSend = formData.rolId.toString();
    
    try {
      if (editingUser) {
        // Preparar datos para actualización según UpdateUserRequest
        const updateData: any = {
          userId: parseInt(editingUser.user_id || '0'),
          name: formData.name,
          tipoId: formData.tipoId,
          ident: formData.ident,
          correo: formData.correo,
          telefono: formData.telefono,
          direccion: formData.direccion,
          rolId: rolIdToSend,
          activo: formData.activo
        };
        // Solo incluir password si se proporcionó uno nuevo (vacío = mantener actual)
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
        }
        console.log('Updating user with data:', updateData);
        await userAPI.update(updateData);
      } else {
        // Validar que todos los campos requeridos estén presentes
        if (!formData.password || formData.password.trim() === '') {
          alert('La contraseña es requerida para crear un nuevo usuario');
          return;
        }
        
        // Preparar datos para creación según UserCreateDto
        const createData = {
          name: formData.name.trim(),
          tipoId: formData.tipoId,
          ident: formData.ident.trim(),
          correo: formData.correo.trim(),
          password: formData.password,
          telefono: formData.telefono.trim(),
          direccion: formData.direccion.trim(),
          rolId: rolIdToSend
        };
        console.log('Creating user with data:', createData);
        await userAPI.create(createData);
      }
      await loadUsers();
      resetForm();
    } catch (error: any) {
      console.error('Error saving user:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      
      let errorMessage = 'Error desconocido al guardar el usuario';
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
      
      alert(`Error al guardar el usuario: ${errorMessage}\n\nPor favor, verifique que todos los campos estén completos y sean válidos.`);
    }
  };

  const handleEdit = async (user: User) => {
    setEditingUser(user);
    
    // Obtener el usuario completo desde el backend para asegurar que tenemos todos los campos
    let fullUserData = user;
    try {
      const userResponse = await userAPI.getById(user.user_id || '');
      if (userResponse.data) {
        fullUserData = userResponse.data;
      }
    } catch (error) {
      console.warn('No se pudo cargar los datos completos del usuario, usando datos disponibles:', error);
    }
    
    // Buscar el rolId correcto basado en el rol_id que viene del backend
    let rolIdValue = '';
    const userRolId = fullUserData.rol_id?.toString() || user.rol_id?.toString() || '';
    
    // Si rol_id es un número, usarlo directamente
    if (!isNaN(parseInt(userRolId))) {
      rolIdValue = userRolId;
    } else {
      // Si es un nombre, buscar el rolId correspondiente en la lista de roles
      const matchingRole = roles.find(r => 
        r.nombre === userRolId || r.name === userRolId || r.rolId?.toString() === userRolId
      );
      rolIdValue = matchingRole?.rolId?.toString() || userRolId;
    }
    
    // Obtener tipoId de los datos completos o del usuario original
    // Intentar diferentes formas de obtener tipoId
    let tipoIdValue = '';
    if ((fullUserData as any).tipoId) {
      tipoIdValue = (fullUserData as any).tipoId;
    } else if ((user as any).tipoId) {
      tipoIdValue = (user as any).tipoId;
    } else if ((fullUserData as any).tipo_id) {
      tipoIdValue = (fullUserData as any).tipo_id;
    } else if ((user as any).tipo_id) {
      tipoIdValue = (user as any).tipo_id;
    }
    
    console.log('Editando usuario:', {
      user_id: user.user_id,
      tipoId: tipoIdValue,
      rolId: rolIdValue,
      fullUserData: fullUserData,
      userOriginal: user,
      tipoIdFromFullData: (fullUserData as any).tipoId,
      tipoIdFromUser: (user as any).tipoId
    });
    
    setFormData({
      tipoId: tipoIdValue || '', // Asegurar que tipoId se establezca correctamente
      ident: fullUserData.ident || user.ident || '',
      name: fullUserData.name || user.name,
      direccion: fullUserData.direccion || user.direccion || '',
      correo: fullUserData.correo || user.correo || '',
      telefono: fullUserData.telefono || user.telefono || '',
      password: '', // Se llenará solo si el usuario ingresa una nueva contraseña
      rolId: rolIdValue || '', // Asegurar que rolId se establezca correctamente
      activo: fullUserData.activo !== undefined ? fullUserData.activo : (user.activo !== undefined ? user.activo : false)
    });
    setShowForm(true);
  };



  const handleToggleActive = async (user: User) => {
    try {
      if (user.activo) {
        await userAPI.deactivate({ id: parseInt(user.user_id || '0') });
      } else {
        await userAPI.activate({ id: parseInt(user.user_id || '0') });
      }
      await loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      tipoId: '',
      ident: '',
      name: '',
      direccion: '',
      correo: '',
      telefono: '',
      password: '',
      rolId: '',
      activo: true
    });
    setEditingUser(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Registrar Usuario</h1>
        
        {/* User Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Identificación
              </label>
              <select
                name="tipoId"
                value={formData.tipoId || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PA">Pasaporte</option>
                <option value="NIT">NIT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificación
              </label>
              <input
                type="text"
                name="ident"
                value={formData.ident}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
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
                Email
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Celular
              </label>
              <input
                type="number"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              {editingUser ? (
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Dejar vacío para mantener actual o ingresar nueva contraseña"
                  />
                  {(!formData.password || formData.password === '') && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                      Encriptada
                    </span>
                  )}
                </div>
              ) : (
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  placeholder="Ingrese la contraseña"
                />
              )}
              {editingUser && (
                <p className="mt-1 text-xs text-gray-500">
                  {formData.password && formData.password.trim() !== '' 
                    ? 'Se actualizará la contraseña'
                    : 'Dejar vacío para mantener la contraseña actual encriptada'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar Cargo o Rol
              </label>
              <select
                name="rolId"
                value={formData.rolId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar rol</option>
                {roles.length > 0 ? (
                  roles.map((role) => {
                    // Asegurar que rolId sea string para comparación
                    const roleIdStr = String(role.rolId || '');
                    // Priorizar mostrar el nombre del rol, usar 'nombre' del backend o 'name' para compatibilidad
                    const roleName = (role.nombre || role.name || roleIdStr || 'Sin nombre').trim();
                    
                    // Debug: verificar que el rol tenga nombre
                    if (!role.nombre && !role.name && roleIdStr) {
                      console.warn(`Rol con ID ${roleIdStr} no tiene nombre:`, role);
                    }
                    
                    return (
                      <option key={roleIdStr} value={roleIdStr}>
                        {roleName}
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>Cargando roles...</option>
                )}
              </select>
              {/* Mostrar el nombre del rol seleccionado como texto de ayuda */}
              {formData.rolId && roles.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Rol seleccionado: {(() => {
                    const selectedRole = roles.find(r => String(r.rolId) === String(formData.rolId));
                    return selectedRole?.nombre || selectedRole?.name || formData.rolId;
                  })()}
                </p>
              )}
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

      {/* Users List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
         
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Agregar Usuario</span>
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

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Identificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Celular
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
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
                {paginatedData.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.ident}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.direccion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.correo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.telefono}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(() => {
                        // Buscar el nombre del rol en la lista de roles
                        // Convertir ambos a string para comparación confiable
                        const userRolId = user.rol_id?.toString() || '';
                        
                        // Si no hay roles cargados aún, mostrar el ID como fallback
                        if (!roles || roles.length === 0) {
                          return userRolId || 'N/A';
                        }
                        
                        const role = roles.find(r => {
                          const roleId = r.rolId?.toString() || '';
                          return roleId === userRolId;
                        });
                        
                        // Si no se encuentra por ID, intentar buscar por nombre (fallback)
                        if (!role) {
                          console.warn(`Rol no encontrado para usuario ${user.name} con rol_id: ${userRolId}`);
                          const roleByName = roles.find(r => r.name === userRolId);
                          return roleByName?.name || userRolId || 'N/A';
                        }
                        
                        // Priorizar mostrar el nombre del rol (usar 'nombre' del backend o 'name' para compatibilidad)
                        return role.nombre || role.name || role.rolId?.toString() || userRolId || 'N/A';
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.activo ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
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
            totalItems={filteredUsers.length}
            itemsPerPage={10}
            onPageChange={goToPage}
            itemName="usuarios"
          />

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">

            <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2"
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

export default Users;
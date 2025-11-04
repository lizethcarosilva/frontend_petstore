import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  Clock,
  User,
  Heart,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { appointmentAPI, petAPI, userAPI, clientAPI, serviceAPI, rolesAPI } from '../services/api';
import type { Appointment, Pet, User as UserType, Service, ClientResponseDto } from '../types/types';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';

const Appointments: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [clients, setClients] = useState<ClientResponseDto[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedVeterinarianId, setSelectedVeterinarianId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [petOwners, setPetOwners] = useState<ClientResponseDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    petId: '',
    serviceId: '',
    clientId: '', // Cambiado de userId a clientId
    veterinarianId: '',
    fecha: '',
    hora: '',
    observaciones: '',
    diagnostico: ''
  });

  // Hook de paginación
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage
  } = usePagination({
    data: filteredAppointments,
    itemsPerPage: 10
  });

  useEffect(() => {
    loadAppointments();
    loadPets();
    loadUsers();
    loadClients();
    loadServices();
    loadRoles();
  }, []);

  useEffect(() => {
    // Cargar horarios disponibles cuando cambia el veterinario o la fecha
    if (selectedVeterinarianId && selectedDate) {
      loadAvailableSlots(parseInt(selectedVeterinarianId), selectedDate);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedVeterinarianId, selectedDate]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm]);

  // Cargar propietarios cuando cambia la mascota seleccionada
  useEffect(() => {
    if (formData.petId && !editingAppointment && clients.length > 0) {
      loadPetOwners(parseInt(formData.petId));
    }
  }, [formData.petId, clients.length, editingAppointment]);

  // Función para cargar clientes propietarios de una mascota
  const loadPetOwners = async (petId: number, skipAutoSelect = false) => {
    try {
      const response = await petAPI.getOwners(petId);
      console.log('Clientes de la mascota:', response.data);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Extraer los userIds de los propietarios
        const ownerIds = response.data
          .map((owner: any) => owner.userId)
          .filter((id: any) => id !== undefined && id !== null);
        
        console.log('Owner IDs:', ownerIds);
        
        // Buscar los clientes completos en la lista de clientes
        const owners = clients.filter(client => 
          ownerIds.includes(client.clientId)
        );
        
        console.log('Clientes encontrados como propietarios:', owners);
        setPetOwners(owners);
        
        // Si solo hay un propietario y no es modo edición, seleccionarlo automáticamente
        if (!skipAutoSelect && owners.length === 1) {
          setFormData(prev => ({
            ...prev,
            clientId: owners[0].clientId?.toString() || ''
          }));
        }
      } else {
        setPetOwners([]);
      }
    } catch (error) {
      console.error('Error loading pet owners:', error);
      setPetOwners([]);
    }
  };

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await appointmentAPI.getAll();
      setAppointments(response.data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPets = async () => {
    try {
      const response = await petAPI.getAll();
      setPets(response.data);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await rolesAPI.getAll();
      if (Array.isArray(response.data)) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      // Cargar todos los usuarios - se filtrarán según el contexto de uso
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadClients = async () => {
    try {
      const response = await clientAPI.getAll();
      console.log('✅ Clientes cargados:', response.data);
      setClients(response.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadServices = async () => {
    try {
      const response = await serviceAPI.getAll();
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadAvailableSlots = async (veterinarianId: number, fecha: string) => {
    try {
      const response = await appointmentAPI.getAvailableSlots(veterinarianId, fecha, '08:00', '17:00', 30);
      if (response.data && response.data.horariosDisponibles) {
        // Convertir LocalDateTime a formato hora (HH:mm)
        const slots = response.data.horariosDisponibles.map((slot: string) => {
          const date = new Date(slot);
          return date.toTimeString().slice(0, 5); // HH:mm
        });
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots([]);
    }
  };

  // Filtrar usuarios: excluir SuperAdmin (rol_id = "1") siempre
  const filterUsers = (usersList: UserType[], descripcion?: string) => {
    if (!usersList || usersList.length === 0) {
      return [];
    }
    
    return usersList.filter(user => {
      // NUNCA mostrar SuperAdmin
      const rolId = user.rol_id?.toString() || '';
      if (rolId === '1') return false;
      
      // Si no se especifica descripción, devolver todos excepto SuperAdmin
      if (!descripcion) return true;
      
      // Si los roles aún no se han cargado, no filtrar por descripción
      if (!roles || roles.length === 0) {
        console.warn('Roles aún no cargados, mostrando todos los usuarios excepto SuperAdmin');
        return true;
      }
      
      // Buscar el rol del usuario en la lista de roles
      const role = roles.find(r => {
        const roleId = r.rolId?.toString() || '';
        return roleId === rolId;
      });
      
      // Si no se encuentra el rol, loguear para debugging
      if (!role) {
        console.warn(`Rol no encontrado para usuario ${user.name} con rol_id: ${rolId}`);
        return false;
      }
      
      // Verificar la descripción del rol
      const matches = role.descripcion === descripcion;
      
      if (!matches) {
        const roleName = role.nombre || role.name || role.rolId?.toString() || 'Sin nombre';
        console.debug(`Usuario ${user.name} tiene rol "${roleName}" con descripción "${role.descripcion}", no coincide con "${descripcion}"`);
      }
      
      return matches;
    });
  };

  const filterAppointments = () => {
    const filtered = appointments.filter(appointment =>
      appointment.estado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.petNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || // Para compatibilidad
      appointment.veterinarianName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAppointments(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Si cambia el veterinario o la fecha, actualizar estados para cargar horarios disponibles
    if (name === 'veterinarianId') {
      const previousVeterinarianId = formData.veterinarianId;
      setSelectedVeterinarianId(value);
      setFormData(prev => ({ ...prev, [name]: value }));
      // Limpiar hora si cambia el veterinario
      if (value !== previousVeterinarianId) {
        setFormData(prev => ({ ...prev, hora: '' }));
      }
    } else if (name === 'fecha') {
      const previousFecha = formData.fecha;
      setSelectedDate(value);
      setFormData(prev => ({ ...prev, [name]: value }));
      // Limpiar hora si cambia la fecha
      if (value !== previousFecha) {
        setFormData(prev => ({ ...prev, hora: '' }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Cargar propietarios cuando cambia la mascota (pero no en modo edición)
    if (name === 'petId' && !editingAppointment && value) {
      loadPetOwners(parseInt(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validar campos requeridos
      if (!formData.petId || !formData.serviceId || !formData.clientId) {
        alert('Debe seleccionar mascota, servicio y cliente');
        return;
      }

      // Combinar fecha y hora en formato ISO para LocalDateTime
      const fechaHora = formData.fecha && formData.hora 
        ? `${formData.fecha}T${formData.hora}:00`
        : null;

      if (!fechaHora) {
        alert('Debe seleccionar fecha y hora');
        return;
      }

      // Validar que el veterinario sea requerido
      if (!formData.veterinarianId) {
        alert('El veterinario es requerido para agendar una cita');
        return;
      }

      // Validar que el horario seleccionado esté disponible
      if (formData.hora && availableSlots.length > 0 && !availableSlots.includes(formData.hora)) {
        alert('El horario seleccionado no está disponible. Por favor, seleccione otro horario.');
        return;
      }

      if (editingAppointment) {
        // Preparar datos para actualización según Appointment model del backend
        const updateData = {
          appointmentId: editingAppointment.appointmentId || parseInt(editingAppointment.id || '0'),
          petId: parseInt(formData.petId),
          serviceId: parseInt(formData.serviceId),
          clientId: parseInt(formData.clientId), // Cambiado de userId a clientId
          veterinarianId: parseInt(formData.veterinarianId),
          fechaHora: fechaHora,
          estado: editingAppointment.estado || 'Programada',
          observaciones: formData.observaciones || null,
          diagnostico: formData.diagnostico || null
        };
        await appointmentAPI.update(updateData);
      } else {
        // Preparar datos para creación según AppointmentCreateDto del backend
        const createData = {
          petId: parseInt(formData.petId),
          serviceId: parseInt(formData.serviceId),
          clientId: parseInt(formData.clientId), // Ahora usa clientId
          veterinarianId: parseInt(formData.veterinarianId),
          fechaHora: fechaHora,
          observaciones: formData.observaciones || null
        };
        
        console.log('✅ Creating appointment with data:', createData);
        console.log('✅ Cliente seleccionado:', clients.find(c => c.clientId === parseInt(formData.clientId)));
        
        await appointmentAPI.create(createData);
      }
      await loadAppointments();
      resetForm();
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      const errorMessage = error?.response?.data || error?.message || 'Error desconocido';
      alert(`Error al guardar la cita: ${errorMessage}. Por favor, verifique que todos los campos estén completos.`);
    }
  };

  const handleEdit = async (appointment: Appointment) => {
    setEditingAppointment(appointment);
    
    // Convertir fechaHora a fecha y hora separadas
    let fecha = '';
    let hora = '';
    if (appointment.fechaHora) {
      const fechaHoraDate = new Date(appointment.fechaHora);
      fecha = fechaHoraDate.toISOString().split('T')[0];
      hora = fechaHoraDate.toTimeString().slice(0, 5);
    } else if (appointment.fecha && appointment.hora) {
      fecha = appointment.fecha;
      hora = appointment.hora;
    }
    
    const petId = appointment.petId?.toString() || appointment.mascotaId || '';
    
    setFormData({
      petId: petId,
      serviceId: appointment.serviceId?.toString() || '',
      clientId: appointment.clientId?.toString() || appointment.userId?.toString() || appointment.usuarioId || '',
      veterinarianId: appointment.veterinarianId?.toString() || '',
      fecha: fecha,
      hora: hora,
      observaciones: appointment.observaciones || '',
      diagnostico: appointment.diagnostico || ''
    });
    
    // Cargar propietarios de la mascota en modo edición también
    // skipAutoSelect = true para no sobrescribir el usuario ya seleccionado
    if (petId) {
      await loadPetOwners(parseInt(petId), true);
    }
    
    setShowForm(true);
  };

  const handleDelete = async (appointment: Appointment) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        const appointmentId = appointment.appointmentId || parseInt(appointment.id || '0');
        await appointmentAPI.delete(appointmentId);
        await loadAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleComplete = async (appointment: Appointment) => {
    // Validar que la cita no esté cancelada (case-insensitive)
    const estadoUpper = appointment.estado?.toUpperCase() || '';
    if (estadoUpper === 'CANCELADA') {
      alert('No se puede completar una cita cancelada. Debe reactivarla primero.');
      return;
    }
    
    // Redirigir a la página de Historial Clínico con los datos de la cita
    const petId = appointment.petId || appointment.mascotaId;
    const appointmentId = appointment.appointmentId || parseInt(appointment.id || '0');
    
    if (!petId) {
      alert('No se pudo obtener el ID de la mascota');
      return;
    }
    
    // Determinar si el servicio es de vacunación para redirigir a la página correcta
    const serviceName = appointment.serviceName?.toLowerCase() || '';
    const isVaccinationService = serviceName.includes('vacunación') || serviceName.includes('vacunacion');
    
    if (isVaccinationService) {
      // Navegar a la página de Vacunación
      navigate(`/vaccinations?petId=${petId}&appointmentId=${appointmentId}`);
    } else {
      // Navegar a Historial Clínico con los parámetros de la cita
      navigate(`/medical-history?petId=${petId}&appointmentId=${appointmentId}`);
    }
  };

  // Toggle entre cancelar y reactivar citas - ACTUALIZADO
  const handleCancel = async (appointment: Appointment) => {
    const estadoUpper = appointment.estado?.toUpperCase() || '';
    const isCancelled = estadoUpper === 'CANCELADA';
    
    console.log('=== HANDLE CANCEL DEBUG ===');
    console.log('Estado original:', appointment.estado);
    console.log('Estado uppercase:', estadoUpper);
    console.log('isCancelled:', isCancelled);
    console.log('========================');
    
    const confirmMessage = isCancelled 
      ? '¿Estás seguro de que quieres REACTIVAR esta cita y cambiar su estado a Programada?' 
      : '¿Estás seguro de que quieres CANCELAR esta cita?';
    
    if (window.confirm(confirmMessage)) {
      try {
        const appointmentId = appointment.appointmentId || parseInt(appointment.id || '0');
        
        if (isCancelled) {
          // Reactivar la cita: cambiar estado a "Programada"
          const updateData = {
            appointmentId: appointmentId,
            petId: appointment.petId,
            serviceId: appointment.serviceId,
            userId: appointment.userId,
            veterinarianId: appointment.veterinarianId,
            fechaHora: appointment.fechaHora,
            estado: 'Programada',
            observaciones: appointment.observaciones || null,
            diagnostico: appointment.diagnostico || null
          };
          console.log('REACTIVANDO cita con datos:', updateData);
          await appointmentAPI.update(updateData);
          alert('Cita reactivada exitosamente');
        } else {
          // Cancelar la cita
          console.log('CANCELANDO cita ID:', appointmentId);
          await appointmentAPI.cancel(appointmentId);
          alert('Cita cancelada exitosamente');
        }
        
        await loadAppointments();
      } catch (error: any) {
        console.error('Error toggling appointment status:', error);
        console.error('Error response:', error?.response?.data);
        alert(`Error al ${isCancelled ? 'reactivar' : 'cancelar'} la cita: ${error?.response?.data || error?.message || 'Error desconocido'}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      petId: '',
      serviceId: '',
      clientId: '', // Cambiado de userId a clientId
      veterinarianId: '',
      fecha: '',
      hora: '',
      observaciones: '',
      diagnostico: ''
    });
    setEditingAppointment(null);
    setSelectedVeterinarianId('');
    setSelectedDate('');
    setAvailableSlots([]);
    setPetOwners([]);
    setShowForm(false);
  };

  const getPetName = (petId: number | string | undefined) => {
    if (!petId) return 'N/A';
    const pet = pets.find(p => 
      p.petId === (typeof petId === 'number' ? petId : parseInt(petId.toString())) ||
      p.id === petId.toString()
    );
    return pet ? pet.nombre : 'Mascota no encontrada';
  };

  const getClientName = (clientId: number | string | undefined) => {
    if (!clientId) return 'N/A';
    const client = clients.find(c => 
      c.clientId === (typeof clientId === 'number' ? clientId : parseInt(clientId.toString()))
    );
    return client ? client.name : 'Cliente no encontrado';
  };

  const getUserName = (userId: number | string | undefined) => {
    if (!userId) return 'N/A';
    const user = users.find(u => 
      parseInt(u.user_id || '0') === (typeof userId === 'number' ? userId : parseInt(userId.toString()))
    );
    return user ? user.name : 'Usuario no encontrado';
  };

  const getServiceName = (serviceId: number | undefined) => {
    if (!serviceId) return 'N/A';
    const service = services.find(s => s.serviceId === serviceId);
    return service ? service.nombre : 'Servicio no encontrado';
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Programada':
        return 'bg-blue-100 text-blue-800';
      case 'En Proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completada':
        return 'bg-green-100 text-green-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Agendar Cita</h1>
        
        {/* Appointment Form */}
        {showForm && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Datos de la cita</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mascota
                </label>
                <select
                  name="petId"
                  value={formData.petId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar mascota</option>
                  {pets.map((pet) => (
                    <option key={pet.petId || pet.id} value={pet.petId || pet.id}>
                      {pet.nombre} - {pet.tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio
                </label>
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar servicio</option>
                  {services.filter(s => s.activo).map((service) => (
                    <option key={service.serviceId || service.id} value={service.serviceId || service.id}>
                      {service.nombre} - {service.duracionMinutos ? `${service.duracionMinutos} min` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                  {petOwners.length > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({petOwners.length} propietario{petOwners.length > 1 ? 's' : ''} de la mascota)
                    </span>
                  )}
                </label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  disabled={petOwners.length > 0 && petOwners.length === 1}
                >
                  <option value="">Seleccionar cliente</option>
                  {(() => {
                    // Si hay propietarios de la mascota, mostrarlos; si no, mostrar todos los clientes
                    const clientsToShow = petOwners.length > 0 ? petOwners : clients;
                    console.log('Clientes a mostrar en select:', clientsToShow.length, clientsToShow);
                    return clientsToShow.map((client) => (
                      <option key={client.clientId} value={client.clientId}>
                        {client.name} - {client.ident}
                      </option>
                    ));
                  })()}
                </select>
                {petOwners.length > 0 && petOwners.length === 1 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Cliente seleccionado automáticamente
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Veterinario (Requerido)
                </label>
                <select
                  name="veterinarianId"
                  value={formData.veterinarianId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar veterinario</option>
                  {(() => {
                    const trabajadores = filterUsers(users.filter(u => u.activo), 'Trabajador');
                    console.log('Trabajadores filtrados:', trabajadores.length, trabajadores);
                    return trabajadores.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.name}
                      </option>
                    ));
                  })()}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora
                  {formData.veterinarianId && formData.fecha && availableSlots.length > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({availableSlots.length} horarios disponibles)
                    </span>
                  )}
                </label>
                {formData.veterinarianId && formData.fecha && availableSlots.length > 0 ? (
                  <select
                    name="hora"
                    value={formData.hora}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar hora disponible</option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="time"
                    name="hora"
                    value={formData.hora}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    disabled={!formData.veterinarianId || !formData.fecha}
                    placeholder={!formData.veterinarianId || !formData.fecha ? 'Seleccione veterinario y fecha primero' : ''}
                  />
                )}
                {formData.veterinarianId && formData.fecha && availableSlots.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">No hay horarios disponibles para este veterinario en esta fecha</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              {editingAppointment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diagnóstico
                  </label>
                  <textarea
                    name="diagnostico"
                    value={formData.diagnostico}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Diagnóstico médico..."
                  />
                </div>
              )}


              <div className="flex items-center space-x-4">
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

            {/* Horarios Disponibles */}
            {formData.veterinarianId && formData.fecha && availableSlots.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Horarios Disponibles</h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, hora: slot }))}
                      className={`p-2 text-center rounded-md border transition-colors ${
                        formData.hora === slot
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {availableSlots.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No hay horarios disponibles para esta fecha</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Citas Programadas</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Agendar Cita</span>
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por mascota, cliente, servicio, estado o veterinario"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Appointments Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mascota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veterinario
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
                {paginatedData.map((appointment) => {
                  // Obtener fecha y hora de fechaHora o de fecha/hora separadas
                  let fechaDisplay = '';
                  let horaDisplay = '';
                  if (appointment.fechaHora) {
                    const fechaHoraDate = new Date(appointment.fechaHora);
                    fechaDisplay = fechaHoraDate.toLocaleDateString();
                    horaDisplay = fechaHoraDate.toTimeString().slice(0, 5);
                  } else if (appointment.fecha && appointment.hora) {
                    fechaDisplay = new Date(appointment.fecha).toLocaleDateString();
                    horaDisplay = appointment.hora;
                  }
                  
                  return (
                    <tr key={appointment.appointmentId || appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {fechaDisplay || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{horaDisplay || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 text-pink-500 mr-2" />
                          <div className="text-sm text-gray-900">
                            {appointment.petNombre || getPetName(appointment.petId || appointment.mascotaId)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {appointment.serviceName || getServiceName(appointment.serviceId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {appointment.clientName || getClientName(appointment.clientId || appointment.userId || appointment.usuarioId)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {appointment.veterinarianName || getUserName(appointment.veterinarianId) || 'No asignado'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.estado || '')}`}>
                          {appointment.estado || 'N/A'}
                        </span>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {(() => {
                        const estado = appointment.estado?.toUpperCase() || '';
                        console.log('Estado de cita:', appointment.estado, 'Estado uppercase:', estado);
                        
                        if (estado === 'PROGRAMADA') {
                          return (
                            <>
                              <button
                                onClick={() => handleComplete(appointment)}
                                className="text-green-600 hover:text-green-900"
                                title="Completar cita"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleCancel(appointment)}
                                className="text-red-600 hover:text-red-900"
                                title="Cancelar cita"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          );
                        }
                        
                        if (estado === 'CANCELADA') {
                          return (
                            <button
                              onClick={() => handleCancel(appointment)}
                              className="text-green-600 hover:text-green-900"
                              title="Reactivar cita"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          );
                        }
                        
                        return null;
                      })()}
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
            totalItems={filteredAppointments.length}
            itemsPerPage={10}
            onPageChange={goToPage}
            itemName="citas"
          />
        </div>
      </div>
    </div>
  );
};

export default Appointments;

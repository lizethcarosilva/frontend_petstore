import React, { useState, useEffect } from 'react';
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
  XCircle
} from 'lucide-react';
import { appointmentAPI, petAPI, userAPI } from '../services/api';
import type { Appointment, Pet, User as UserType } from '../types/types';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    mascotaId: '',
    usuarioId: '',
    fecha: '',
    hora: '',
    especialidad: '',
    estado: 'Programada',
    diagnostico: '',
    observaciones: ''
  });

  useEffect(() => {
    loadAppointments();
    loadPets();
    loadUsers();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm]);

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

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data.filter((user: UserType) => user.rol === 'Veterinario'));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const filterAppointments = () => {
    const filtered = appointments.filter(appointment =>
      appointment.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.mascota?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAppointments(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await appointmentAPI.update({ ...formData, id: editingAppointment.id });
      } else {
        await appointmentAPI.create(formData);
      }
      await loadAppointments();
      resetForm();
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      mascotaId: appointment.mascotaId,
      usuarioId: appointment.usuarioId,
      fecha: appointment.fecha,
      hora: appointment.hora,
      especialidad: appointment.especialidad,
      estado: appointment.estado,
      diagnostico: appointment.diagnostico || '',
      observaciones: appointment.observaciones || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (appointment: Appointment) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        await appointmentAPI.delete({ id: appointment.id });
        await loadAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleComplete = async (appointment: Appointment) => {
    try {
      await appointmentAPI.complete({ id: appointment.id, diagnostico: appointment.diagnostico });
      await loadAppointments();
    } catch (error) {
      console.error('Error completing appointment:', error);
    }
  };

  const handleCancel = async (appointment: Appointment) => {
    try {
      await appointmentAPI.cancel({ id: appointment.id });
      await loadAppointments();
    } catch (error) {
      console.error('Error canceling appointment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      mascotaId: '',
      usuarioId: '',
      fecha: '',
      hora: '',
      especialidad: '',
      estado: 'Programada',
      diagnostico: '',
      observaciones: ''
    });
    setEditingAppointment(null);
    setShowForm(false);
  };

  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.nombre : 'Mascota no encontrada';
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.nombre : 'Usuario no encontrado';
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
                  name="mascotaId"
                  value={formData.mascotaId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar mascota</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.nombre} - {pet.tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Veterinario
                </label>
                <select
                  name="usuarioId"
                  value={formData.usuarioId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar veterinario</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nombre}
                    </option>
                  ))}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  name="hora"
                  value={formData.hora}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidad
                </label>
                <select
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar especialidad</option>
                  <option value="Odontología">Odontología</option>
                  <option value="Cirugía">Cirugía</option>
                  <option value="Dermatología">Dermatología</option>
                  <option value="Cardiología">Cardiología</option>
                  <option value="Neurología">Neurología</option>
                  <option value="Consulta General">Consulta General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="Programada">Programada</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

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

            {/* Calendar and Time Slots */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Fecha y Hora</h3>
              
              {/* Date Selector */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Fecha</h4>
                <div className="grid grid-cols-7 gap-2">
                  {[8, 9, 10, 11, 12, 13, 14].map((day) => (
                    <button
                      key={day}
                      className={`p-2 text-center rounded-md border ${
                        formData.fecha.includes(`-${day.toString().padStart(2, '0')}`)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Horarios Disponibles</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '15:00'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, hora: time }))}
                      className={`p-2 text-center rounded-md border ${
                        formData.hora === time
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
                placeholder="Buscar por especialidad, estado o mascota"
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
                    Veterinario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidad
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
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {new Date(appointment.fecha).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{appointment.hora}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-pink-500 mr-2" />
                        <div className="text-sm text-gray-900">{getPetName(appointment.mascotaId)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{getUserName(appointment.usuarioId)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {appointment.especialidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.estado)}`}>
                        {appointment.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {appointment.estado === 'Programada' && (
                        <button
                          onClick={() => handleComplete(appointment)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {appointment.estado !== 'Cancelada' && appointment.estado !== 'Completada' && (
                        <button
                          onClick={() => handleCancel(appointment)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(appointment)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;

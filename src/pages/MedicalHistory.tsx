import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  FileText,
  Heart,
  User,
  Syringe,
  Eye
} from 'lucide-react';
import { medicalHistoryAPI, petAPI, serviceAPI, userAPI, appointmentAPI, vaccinationAPI, productAPI } from '../services/api';
import type { MedicalHistory, Pet, Service, User as UserType, Appointment, Vaccination } from '../types/types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';

const MedicalHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [histories, setHistories] = useState<MedicalHistory[]>([]);
  const [filteredHistories, setFilteredHistories] = useState<MedicalHistory[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [vaccineProducts, setVaccineProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPetFilter, setSelectedPetFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [editingHistory, setEditingHistory] = useState<MedicalHistory | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<MedicalHistory | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Determinar si el usuario es propietario (solo lectura)
  const isOwner = user?.rol_id === '5' || user?.rol_id === '6';
  const canEdit = !isOwner;

  // Hook de paginación
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage
  } = usePagination({
    data: filteredHistories,
    itemsPerPage: 10
  });
  
  // Get initial values from URL params if coming from appointment
  const appointmentIdParam = searchParams.get('appointmentId');
  const petIdParam = searchParams.get('petId');
  
  const [formData, setFormData] = useState({
    petId: '',
    appointmentId: '',
    serviceId: '',
    veterinarianId: '',
    fechaAtencion: '',
    tipoProcedimiento: '',
    diagnostico: '',
    observaciones: '',
    tratamiento: '',
    pesoKg: '',
    temperaturaC: '',
    notasAdicionales: ''
  });

  const [vaccinationFormData, setVaccinationFormData] = useState({
    vaccineName: '',
    vaccineType: '',
    manufacturer: '',
    batchNumber: '',
    applicationDate: '',
    nextDoseDate: '',
    doseNumber: '',
    applicationSite: '',
    observations: '',
    requiresBooster: false,
    isCompleted: false
  });

  const loadHistories = async () => {
    try {
      setIsLoading(true);
      const response = await medicalHistoryAPI.getAll();
      setHistories(response.data);
    } catch (error) {
      console.error('Error loading medical histories:', error);
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

  const loadServices = async () => {
    try {
      const response = await serviceAPI.getAll();
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      // Filtrar solo trabajadores (veterinarios, gerentes, etc.)
      const trabajadores = response.data.filter((user: UserType) => {
        const rolId = user.rol_id?.toString() || '';
        // Excluir SuperAdmin y Clientes
        return rolId !== '1' && rolId !== '5' && rolId !== '6';
      });
      setUsers(trabajadores);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadVaccineProducts = async () => {
    try {
      // Usar el endpoint específico de vacunas
      const response = await productAPI.getVaccines();
      setVaccineProducts(response.data || []);
    } catch (error) {
      console.error('Error loading vaccine products:', error);
      // Fallback: cargar todos los productos y filtrar
      try {
        const allProductsResponse = await productAPI.getAll();
        const vaccines = (allProductsResponse.data || []).filter((product: any) => 
          product.esVacuna === true
        );
        setVaccineProducts(vaccines);
      } catch (fallbackError) {
        console.error('Error loading products (fallback):', fallbackError);
        setVaccineProducts([]);
      }
    }
  };

  const loadAppointmentsByPet = async (petId: number) => {
    try {
      console.log('Cargando citas para mascota ID:', petId);
      const response = await appointmentAPI.getByPet(petId);
      if (Array.isArray(response.data)) {
        setAppointments(response.data);
        console.log('Citas cargadas:', response.data);
      }
    } catch (error) {
      console.error('Error loading appointments by pet:', error);
      setAppointments([]);
    }
  };

  const loadAppointmentFromParam = async (appointmentId: string) => {
    try {
      console.log('Cargando cita desde parámetro URL:', appointmentId);
      const response = await appointmentAPI.getById(parseInt(appointmentId));
      if (response.data) {
        const appointment = response.data;
        console.log('Cita cargada desde parámetro:', appointment);
        
        // Verificar si esta cita ya tiene un historial médico asociado
        const existingHistory = histories.find(h => 
          h.appointmentId === parseInt(appointmentId)
        );
        
        if (existingHistory) {
          alert('Esta cita ya fue atendida y tiene un historial médico asociado (ID: ' + existingHistory.historyId + ').');
          navigate('/medical-history');
          return;
        }
        
        // Actualizar formData con los datos de la cita
        let fechaAtencionISO = '';
        if (appointment.fechaHora) {
          const date = new Date(appointment.fechaHora);
          fechaAtencionISO = date.toISOString().slice(0, 16);
        }
        
        setFormData(prev => ({
          ...prev,
          petId: appointment.petId?.toString() || prev.petId,
          serviceId: appointment.serviceId?.toString() || prev.serviceId,
          veterinarianId: appointment.veterinarianId?.toString() || prev.veterinarianId,
          fechaAtencion: fechaAtencionISO || prev.fechaAtencion
        }));
        
        // Si ya tenemos petId, también cargar todas las citas de la mascota
        if (appointment.petId) {
          await loadAppointmentsByPet(appointment.petId);
        }
      }
    } catch (error) {
      console.error('Error loading appointment from param:', error);
    }
  };

  useEffect(() => {
    loadHistories();
    loadPets();
    loadServices();
    loadUsers();
    loadVaccineProducts();
  }, []);

  useEffect(() => {
    // Si hay parámetros de URL, configurar el formulario
    // Esperar a que se carguen los historiales primero
    if (isLoading) return;
    
    if (petIdParam && !editingHistory && !showForm) {
      setFormData(prev => ({
        ...prev,
        petId: petIdParam
      }));
      setShowForm(true);
    }
    if (appointmentIdParam) {
      setFormData(prev => ({
        ...prev,
        appointmentId: appointmentIdParam
      }));
      // Si hay appointmentId en la URL, intentar cargar la cita completa
      loadAppointmentFromParam(appointmentIdParam);
    }
  }, [petIdParam, appointmentIdParam, isLoading]);

  useEffect(() => {
    filterHistories();
  }, [histories, searchTerm, selectedPetFilter]);

  // Cargar citas cuando cambia el petId
  useEffect(() => {
    if (formData.petId && !editingHistory) {
      loadAppointmentsByPet(parseInt(formData.petId));
    }
  }, [formData.petId, editingHistory]);

  const filterHistories = () => {
    let filtered = histories;
    
    // Filtrar por mascota seleccionada
    if (selectedPetFilter) {
      filtered = filtered.filter(history => 
        history.petId?.toString() === selectedPetFilter
      );
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(history =>
        history.petNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        history.veterinarianName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        history.tipoProcedimiento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        history.diagnostico?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredHistories(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Cuando se selecciona una cita, cargar sus datos
    if (name === 'appointmentId' && value) {
      loadAppointmentData(parseInt(value));
    }
  };
  
  const loadAppointmentData = async (appointmentId: number) => {
    try {
      console.log('Cargando datos de la cita ID:', appointmentId);
      const appointment = appointments.find(apt => 
        apt.appointmentId === appointmentId || parseInt(apt.id || '0') === appointmentId
      );
      
      if (appointment) {
        console.log('Cita encontrada:', appointment);
        
        // Validar estado de la cita
        if (appointment.estado === 'Completada') {
          // Verificar si ya existe un historial para esta cita
          const existingHistory = histories.find(h => 
            h.appointmentId === appointmentId
          );
          
          if (existingHistory) {
            alert('Esta cita ya tiene un historial médico asociado. No se puede crear otro.');
            // Limpiar el appointmentId del formulario
            setFormData(prev => ({
              ...prev,
              appointmentId: ''
            }));
            return;
          }
        }
        
        // Extraer fecha y hora de fechaHora
        let fechaAtencionISO = '';
        if (appointment.fechaHora) {
          const date = new Date(appointment.fechaHora);
          fechaAtencionISO = date.toISOString().slice(0, 16); // formato yyyy-MM-ddTHH:mm
        }
        
        // Actualizar formData con los datos de la cita
        setFormData(prev => ({
          ...prev,
          serviceId: appointment.serviceId?.toString() || prev.serviceId,
          veterinarianId: appointment.veterinarianId?.toString() || prev.veterinarianId,
          fechaAtencion: fechaAtencionISO || prev.fechaAtencion
        }));
        
        console.log('Datos de cita cargados en formulario');
      }
    } catch (error) {
      console.error('Error loading appointment data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validar que la mascota tenga citas
      if (!editingHistory && formData.petId) {
        const petAppointments = appointments.filter(apt => {
          const petId = apt.petId || parseInt(apt.mascotaId || '0');
          return petId === parseInt(formData.petId);
        });
        
        if (petAppointments.length === 0) {
          alert('Esta mascota no tiene citas registradas. Debe crear una cita primero antes de crear un historial médico.');
          return;
        }
        
        // Verificar que haya al menos una cita disponible (sin historial asociado)
        const availableAppointments = petAppointments.filter(apt => {
          const aptId = apt.appointmentId || parseInt(apt.id || '0');
          return !histories.some(h => h.appointmentId === aptId);
        });
        
        if (availableAppointments.length === 0) {
          alert('Todas las citas de esta mascota ya tienen historial médico asociado. No se puede crear otro.');
          return;
        }
      }
      
      // Combinar fecha y hora para fechaAtencion (formato LocalDateTime: yyyy-MM-ddTHH:mm:ss)
      let fechaAtencionISO = '';
      if (formData.fechaAtencion) {
        // Si ya tiene hora incluida (formato ISO), agregar segundos si faltan
        if (formData.fechaAtencion.includes('T')) {
          fechaAtencionISO = formData.fechaAtencion.includes(':ss') 
            ? formData.fechaAtencion 
            : `${formData.fechaAtencion}:00`;
        } else {
          // Si solo es fecha, agregar hora por defecto
          fechaAtencionISO = `${formData.fechaAtencion}T12:00:00`;
        }
      }

      if (editingHistory) {
        // Actualizar - preparar datos según UpdateMedicalHistoryRequest
        const updateData: any = {
          historyId: editingHistory.historyId,
          serviceId: parseInt(formData.serviceId),
          veterinarianId: parseInt(formData.veterinarianId),
          tipoProcedimiento: formData.tipoProcedimiento,
          diagnostico: formData.diagnostico,
          observaciones: formData.observaciones || null,
          tratamiento: formData.tratamiento || null,
          pesoKg: formData.pesoKg ? parseFloat(formData.pesoKg) : null,
          temperaturaC: formData.temperaturaC ? parseFloat(formData.temperaturaC) : null,
          notasAdicionales: formData.notasAdicionales || null
        };

        // Agregar fechaAtencion si está presente
        if (fechaAtencionISO) {
          updateData.fechaAtencion = fechaAtencionISO;
        }

        console.log('Updating medical history with data:', updateData);
        await medicalHistoryAPI.update(updateData);
      } else {
        // Crear - preparar datos según MedicalHistoryCreateDto
        const createData: any = {
          petId: parseInt(formData.petId),
          serviceId: parseInt(formData.serviceId),
          veterinarianId: parseInt(formData.veterinarianId),
          tipoProcedimiento: formData.tipoProcedimiento,
          diagnostico: formData.diagnostico,
          observaciones: formData.observaciones || null,
          tratamiento: formData.tratamiento || null,
          pesoKg: formData.pesoKg ? parseFloat(formData.pesoKg) : null,
          temperaturaC: formData.temperaturaC ? parseFloat(formData.temperaturaC) : null,
          notasAdicionales: formData.notasAdicionales || null
        };

        // Solo incluir appointmentId si está presente
        if (formData.appointmentId && formData.appointmentId !== '') {
          createData.appointmentId = parseInt(formData.appointmentId);
        }

        // Agregar fechaAtencion
        if (fechaAtencionISO) {
          createData.fechaAtencion = fechaAtencionISO;
        }

        console.log('Creating medical history with data:', createData);
        await medicalHistoryAPI.create(createData);
      }
      
      await loadHistories();
      resetForm();
      // Limpiar parámetros de URL
      navigate('/medical-history');
    } catch (error: any) {
      console.error('Error saving medical history:', error);
      const errorMessage = error?.response?.data || error?.message || 'Error desconocido';
      alert(`Error al guardar el historial médico: ${errorMessage}`);
    }
  };

  const handleEdit = (history: MedicalHistory) => {
    setEditingHistory(history);
    
    // Convertir fechaAtencion a formato para el input date-local
    let fechaAtencion = '';
    if (history.fechaAtencion) {
      const date = new Date(history.fechaAtencion);
      fechaAtencion = date.toISOString().slice(0, 16); // formato yyyy-MM-ddTHH:mm
    }
    
    setFormData({
      petId: history.petId?.toString() || '',
      appointmentId: history.appointmentId?.toString() || '',
      serviceId: history.serviceId?.toString() || '',
      veterinarianId: history.veterinarianId?.toString() || '',
      fechaAtencion: fechaAtencion,
      tipoProcedimiento: history.tipoProcedimiento || '',
      diagnostico: history.diagnostico || '',
      observaciones: history.observaciones || '',
      tratamiento: history.tratamiento || '',
      pesoKg: history.pesoKg?.toString() || '',
      temperaturaC: history.temperaturaC?.toString() || '',
      notasAdicionales: history.notasAdicionales || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (history: MedicalHistory) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este historial médico?')) {
      try {
        await medicalHistoryAPI.delete(history.historyId!);
        await loadHistories();
      } catch (error) {
        console.error('Error deleting medical history:', error);
        alert('Error al eliminar el historial médico');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      petId: '',
      appointmentId: '',
      serviceId: '',
      veterinarianId: '',
      fechaAtencion: '',
      tipoProcedimiento: '',
      diagnostico: '',
      observaciones: '',
      tratamiento: '',
      pesoKg: '',
      temperaturaC: '',
      notasAdicionales: ''
    });
    setEditingHistory(null);
    setAppointments([]);
    setShowForm(false);
  };

  const loadVaccinationsByHistory = async (historyId: number) => {
    try {
      const response = await vaccinationAPI.getByMedicalHistory(historyId);
      setVaccinations(response.data);
    } catch (error) {
      console.error('Error loading vaccinations:', error);
      setVaccinations([]);
    }
  };

  const handleViewVaccinations = (history: MedicalHistory) => {
    setSelectedHistory(history);
    if (history.historyId) {
      loadVaccinationsByHistory(history.historyId);
    }
  };

  const handleVaccinationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setVaccinationFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setVaccinationFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Cuando se selecciona una vacuna del inventario, autocompletar datos
    if (name === 'vaccineName' && value) {
      const selectedProduct = vaccineProducts.find((p: any) => p.nombre === value);
      if (selectedProduct) {
        setVaccinationFormData(prev => ({
          ...prev,
          manufacturer: selectedProduct.fabricante || prev.manufacturer,
          batchNumber: selectedProduct.lote || prev.batchNumber
        }));
      }
    }
  };

  const handleVaccinationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHistory) return;

    try {
      const createData: any = {
        petId: selectedHistory.petId,
        medicalHistoryId: selectedHistory.historyId,
        veterinarianId: selectedHistory.veterinarianId,
        vaccineName: vaccinationFormData.vaccineName,
        vaccineType: vaccinationFormData.vaccineType,
        manufacturer: vaccinationFormData.manufacturer || null,
        batchNumber: vaccinationFormData.batchNumber || null,
        applicationDate: vaccinationFormData.applicationDate,
        nextDoseDate: vaccinationFormData.nextDoseDate || null,
        doseNumber: vaccinationFormData.doseNumber ? parseInt(vaccinationFormData.doseNumber) : null,
        applicationSite: vaccinationFormData.applicationSite || null,
        observations: vaccinationFormData.observations || null,
        requiresBooster: vaccinationFormData.requiresBooster,
        isCompleted: vaccinationFormData.isCompleted
      };

      // Verificar si es un refuerzo y actualizar la vacuna anterior
      if (vaccinationFormData.requiresBooster && vaccinationFormData.doseNumber && parseInt(vaccinationFormData.doseNumber) > 1) {
        await handleBoosterVaccinationFromHistory(createData);
      } else {
        await vaccinationAPI.create(createData);
      }
      
      await loadVaccinationsByHistory(selectedHistory.historyId!);
      resetVaccinationForm();
      alert('Vacuna registrada exitosamente');
    } catch (error: any) {
      console.error('Error saving vaccination:', error);
      const errorMessage = error?.response?.data || error?.message || 'Error desconocido';
      alert(`Error al guardar la vacuna: ${errorMessage}`);
    }
  };

  const handleBoosterVaccinationFromHistory = async (newVaccinationData: any) => {
    try {
      const previousDoseNumber = parseInt(newVaccinationData.doseNumber) - 1;
      const petId = parseInt(newVaccinationData.petId);
      const vaccineName = newVaccinationData.vaccineName;
      
      // Obtener todas las vacunas de la mascota
      const petVaccinationsResponse = await vaccinationAPI.getByPet(petId);
      const petVaccinations = petVaccinationsResponse.data || [];
      
      // Buscar la vacuna anterior (misma vacuna, dosis anterior)
      const previousVaccination = petVaccinations.find((v: Vaccination) => 
        v.vaccineName === vaccineName && 
        v.doseNumber === previousDoseNumber &&
        !v.isCompleted
      );
      
      if (previousVaccination && previousVaccination.vaccinationId) {
        // Crear la nueva vacuna primero
        const newVaccinationResponse = await vaccinationAPI.create(newVaccinationData);
        const newVaccinationId = newVaccinationResponse.data?.vaccinationId;
        
        // Actualizar la vacuna anterior
        const updateData: any = {
          vaccinationId: previousVaccination.vaccinationId,
          petId: previousVaccination.petId,
          medicalHistoryId: previousVaccination.medicalHistoryId || null,
          veterinarianId: previousVaccination.veterinarianId,
          vaccineName: previousVaccination.vaccineName,
          vaccineType: previousVaccination.vaccineType,
          manufacturer: previousVaccination.manufacturer || null,
          batchNumber: previousVaccination.batchNumber || null,
          applicationDate: previousVaccination.applicationDate,
          nextDoseDate: previousVaccination.nextDoseDate || null,
          doseNumber: previousVaccination.doseNumber,
          applicationSite: previousVaccination.applicationSite || null,
          requiresBooster: previousVaccination.requiresBooster || false,
          isCompleted: true,
          observations: previousVaccination.observations 
            ? `${previousVaccination.observations}\n\nAplicación de refuerzo dosis ${newVaccinationData.doseNumber} de la vacunación ID ${newVaccinationId || 'nueva'}.`
            : `Aplicación de refuerzo dosis ${newVaccinationData.doseNumber} de la vacunación ID ${newVaccinationId || 'nueva'}.`
        };
        
        console.log('=== ACTUALIZACIÓN DE VACUNA EN HISTORIAL ===');
        console.log('Vacuna a actualizar:', previousVaccination);
        console.log('Datos de actualización:', updateData);
        console.log('==========================================');
        
        await vaccinationAPI.update(updateData);
      } else {
        await vaccinationAPI.create(newVaccinationData);
      }
    } catch (error) {
      console.error('Error en handleBoosterVaccinationFromHistory:', error);
      await vaccinationAPI.create(newVaccinationData);
    }
  };

  const resetVaccinationForm = () => {
    setVaccinationFormData({
      vaccineName: '',
      vaccineType: '',
      manufacturer: '',
      batchNumber: '',
      applicationDate: '',
      nextDoseDate: '',
      doseNumber: '',
      applicationSite: '',
      observations: '',
      requiresBooster: false,
      isCompleted: false
    });
    setShowVaccinationForm(false);
  };

  const closeVaccinationModal = () => {
    setSelectedHistory(null);
    setVaccinations([]);
    resetVaccinationForm();
  };

  // Determinar si el tipo de servicio amerita vacunación
  const serviceRequiresVaccination = (tipoProcedimiento: string | undefined) => {
    if (!tipoProcedimiento) return false;
    const procedimientoLower = tipoProcedimiento.toLowerCase();
    // Servicios que ameritan vacunación
    const vaccinationServices = [
      'vacunación',
      'vacunacion',
      'consulta general',
      'chequeo general',
      'desparasitación',
      'desparasitacion',
      'cirugía',
      'cirugia'
    ];
    return vaccinationServices.some(service => procedimientoLower.includes(service));
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatDateOnly = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Historial Clínico</h1>
          {!isOwner && (
            <span className="text-sm text-gray-600">
              Modo: Administración
            </span>
          )}
          {isOwner && (
            <span className="text-sm text-blue-600">
              Modo: Solo Lectura (Propietario)
            </span>
          )}
        </div>

        {/* Filtro por mascota */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por mascota
          </label>
          <select
            value={selectedPetFilter}
            onChange={(e) => setSelectedPetFilter(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todas las mascotas</option>
            {pets.map((pet) => (
              <option key={pet.petId} value={pet.petId}>
                {pet.nombre} - {pet.tipo}
              </option>
            ))}
          </select>
        </div>
        
        {/* Medical History Form */}
        {showForm && canEdit && (
          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <option key={pet.petId} value={pet.petId}>
                    {pet.nombre} - {pet.tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cita asociada {(() => {
                  const availableAppts = appointments.filter(apt => {
                    const aptId = apt.appointmentId || parseInt(apt.id || '0');
                    const hasHistory = histories.some(h => h.appointmentId === aptId);
                    return !hasHistory;
                  });
                  return availableAppts.length > 0 && `(${availableAppts.length} disponible${availableAppts.length > 1 ? 's' : ''})`;
                })()}
              </label>
              <select
                name="appointmentId"
                value={formData.appointmentId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Ninguna cita</option>
                {appointments.length > 0 ? (
                  appointments
                    .filter(appointment => {
                      // Filtrar citas que NO tengan historial asociado
                      const aptId = appointment.appointmentId || parseInt(appointment.id || '0');
                      const hasHistory = histories.some(h => h.appointmentId === aptId);
                      return !hasHistory;
                    })
                    .map((appointment) => {
                      let fechaDisplay = 'N/A';
                      if (appointment.fechaHora) {
                        try {
                          const date = new Date(appointment.fechaHora);
                          fechaDisplay = date.toLocaleDateString('es-CO') + ' ' + date.toTimeString().slice(0, 5);
                        } catch (e) {
                          fechaDisplay = 'Fecha inválida';
                        }
                      }
                      const aptId = appointment.appointmentId || appointment.id;
                      const estado = appointment.estado || 'N/A';
                      return (
                        <option 
                          key={aptId} 
                          value={aptId}
                        >
                          ID: {aptId} - {appointment.serviceName || 'Servicio'} - {fechaDisplay} - {estado}
                        </option>
                      );
                    })
                ) : formData.petId && appointments.length === 0 ? (
                  <option value="" disabled>Esta mascota no tiene citas</option>
                ) : null}
              </select>
              {appointments.length === 0 && formData.petId && (
                <p className="mt-1 text-xs text-red-500">
                  Esta mascota no tiene citas registradas. Debe crear una cita primero.
                </p>
              )}
              {appointments.length > 0 && formData.petId && appointments.filter(apt => {
                const aptId = apt.appointmentId || parseInt(apt.id || '0');
                return !histories.some(h => h.appointmentId === aptId);
              }).length === 0 && (
                <p className="mt-1 text-xs text-red-500">
                  Todas las citas de esta mascota ya tienen historial médico asociado.
                </p>
              )}
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
                  <option key={service.serviceId} value={service.serviceId}>
                    {service.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veterinario/Trabajador
              </label>
              <select
                name="veterinarianId"
                value={formData.veterinarianId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar veterinario</option>
                {users.filter(u => u.activo).map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y Hora de Atención
              </label>
              <input
                type="datetime-local"
                name="fechaAtencion"
                value={formData.fechaAtencion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Procedimiento
              </label>
              <select
                name="tipoProcedimiento"
                value={formData.tipoProcedimiento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="Consulta General">Consulta General</option>
                <option value="Desparasitación">Desparasitación</option>
                <option value="Baño">Baño</option>
                <option value="Limpieza de Pulgas">Limpieza de Pulgas</option>
                <option value="Vacunación">Vacunación</option>
                <option value="Cirugía">Cirugía</option>
                <option value="Chequeo General">Chequeo General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                name="pesoKg"
                value={formData.pesoKg}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: 5.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura (°C)
              </label>
              <input
                type="number"
                step="0.1"
                name="temperaturaC"
                value={formData.temperaturaC}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: 38.5"
              />
            </div>

            <div className="col-span-full">
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
                required
              />
            </div>

            <div className="col-span-full">
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

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tratamiento
              </label>
              <textarea
                name="tratamiento"
                value={formData.tratamiento}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Medicamentos o productos utilizados..."
              />
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                name="notasAdicionales"
                value={formData.notasAdicionales}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Notas adicionales..."
              />
            </div>

            <div className="col-span-full flex items-center space-x-4">
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

      {/* Histories List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Historiales Médicos</h2>
            {canEdit && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo Historial</span>
              </button>
            )}
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por mascota, veterinario o diagnóstico"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Histories Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mascota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Procedimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veterinario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnóstico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((history) => (
                  <tr key={history.historyId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {formatDate(history.fechaAtencion)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-pink-500 mr-2" />
                        <div className="text-sm text-gray-900">
                          {history.petNombre || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {history.tipoProcedimiento || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {history.veterinarianName || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {history.diagnostico || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {/* Botón para ver/gestionar vacunas - mostrar solo si el servicio amerita */}
                        {serviceRequiresVaccination(history.tipoProcedimiento) && (
                          <button
                            onClick={() => handleViewVaccinations(history)}
                            className="text-purple-600 hover:text-purple-900"
                            title={isOwner ? "Ver vacunas" : "Gestionar vacunas"}
                          >
                            {isOwner ? <Eye className="h-4 w-4" /> : <Syringe className="h-4 w-4" />}
                          </button>
                        )}
                        
                        {/* Botones de edición y eliminación - solo para administradores */}
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleEdit(history)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(history)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredHistories.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredHistories.length}
              itemsPerPage={10}
              onPageChange={goToPage}
              itemName="historias clínicas"
            />
          )}

          {filteredHistories.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay historiales médicos</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comience creando un nuevo historial médico para una mascota.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Vacunas */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Vacunas - {selectedHistory.petNombre}
              </h3>
              <button
                onClick={closeVaccinationModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Fecha atención:</strong> {formatDate(selectedHistory.fechaAtencion)}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Tipo procedimiento:</strong> {selectedHistory.tipoProcedimiento}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Veterinario:</strong> {selectedHistory.veterinarianName}
              </p>
            </div>

            {/* Lista de vacunas */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Vacunas Aplicadas</h4>
              {vaccinations.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay vacunas registradas para este historial.</p>
              ) : (
                <div className="space-y-3">
                  {vaccinations.map((vaccination) => (
                    <div key={vaccination.vaccinationId} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <strong>Vacuna:</strong> {vaccination.vaccineName}
                        </div>
                        <div>
                          <strong>Tipo:</strong> {vaccination.vaccineType}
                        </div>
                        <div>
                          <strong>Dosis:</strong> {vaccination.doseNumber || 'N/A'}
                        </div>
                        <div>
                          <strong>Fecha aplicación:</strong> {formatDateOnly(vaccination.applicationDate)}
                        </div>
                        <div>
                          <strong>Próxima dosis:</strong> {vaccination.nextDoseDate ? formatDateOnly(vaccination.nextDoseDate) : 'N/A'}
                        </div>
                        <div>
                          <strong>Fabricante:</strong> {vaccination.manufacturer || 'N/A'}
                        </div>
                        {vaccination.batchNumber && (
                          <div>
                            <strong>Lote:</strong> {vaccination.batchNumber}
                          </div>
                        )}
                        {vaccination.applicationSite && (
                          <div>
                            <strong>Sitio aplicación:</strong> {vaccination.applicationSite}
                          </div>
                        )}
                        <div>
                          <strong>Completada:</strong> {vaccination.isCompleted ? 'Sí' : 'No'}
                        </div>
                        {vaccination.observations && (
                          <div className="col-span-2 md:col-span-3">
                            <strong>Observaciones:</strong> {vaccination.observations}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulario para agregar nueva vacuna - solo para administradores */}
            {canEdit && !showVaccinationForm && (
              <div className="mb-4">
                <button
                  onClick={() => setShowVaccinationForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Vacuna</span>
                </button>
              </div>
            )}

            {canEdit && showVaccinationForm && (
              <form onSubmit={handleVaccinationSubmit} className="border-t pt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Nueva Vacuna</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la vacuna *
                    </label>
                    <select
                      name="vaccineName"
                      value={vaccinationFormData.vaccineName}
                      onChange={handleVaccinationInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                      disabled={vaccineProducts.length === 0}
                    >
                      <option value="">Seleccionar vacuna del inventario</option>
                      {vaccineProducts.map((product: any) => (
                        <option key={product.productId} value={product.nombre}>
                          {product.nombre} {product.stock > 0 ? `(Stock: ${product.stock})` : '(Sin stock)'}
                        </option>
                      ))}
                    </select>
                    {vaccinationFormData.vaccineName && (() => {
                      const selectedVaccine = vaccineProducts.find((p: any) => p.nombre === vaccinationFormData.vaccineName);
                      return selectedVaccine && (
                        <p className="mt-1 text-xs text-gray-600">
                          <i className="pi pi-heart mr-1"></i> {selectedVaccine.descripcion || 'Vacuna seleccionada'}
                          {selectedVaccine.fabricante && ` - Fabricante: ${selectedVaccine.fabricante}`}
                        </p>
                      );
                    })()}
                    {vaccineProducts.length === 0 && (
                      <p className="mt-1 text-xs text-red-500">
                        No hay vacunas en el inventario. Registre productos marcados como vacuna primero.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de vacuna *
                    </label>
                    <select
                      name="vaccineType"
                      value={vaccinationFormData.vaccineType}
                      onChange={handleVaccinationInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="Polivalente">Polivalente</option>
                      <option value="Rabia">Rabia</option>
                      <option value="Parvovirus">Parvovirus</option>
                      <option value="Moquillo">Moquillo</option>
                      <option value="Hepatitis">Hepatitis</option>
                      <option value="Leptospirosis">Leptospirosis</option>
                      <option value="Bordetella">Bordetella</option>
                      <option value="Otra">Otra</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fabricante
                    </label>
                    <input
                      type="text"
                      name="manufacturer"
                      value={vaccinationFormData.manufacturer}
                      onChange={handleVaccinationInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de lote
                    </label>
                    <input
                      type="text"
                      name="batchNumber"
                      value={vaccinationFormData.batchNumber}
                      onChange={handleVaccinationInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de aplicación *
                    </label>
                    <input
                      type="date"
                      name="applicationDate"
                      value={vaccinationFormData.applicationDate}
                      onChange={handleVaccinationInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Próxima dosis
                    </label>
                    <input
                      type="date"
                      name="nextDoseDate"
                      value={vaccinationFormData.nextDoseDate}
                      onChange={handleVaccinationInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de dosis
                    </label>
                    <input
                      type="number"
                      name="doseNumber"
                      value={vaccinationFormData.doseNumber}
                      onChange={handleVaccinationInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                    />
                    {vaccinationFormData.doseNumber && parseInt(vaccinationFormData.doseNumber) > 1 && (
                      <p className="mt-1 text-xs text-blue-600">
                        <i className="pi pi-info-circle mr-1"></i> Dosis de refuerzo - Se completará automáticamente la dosis anterior si existe.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sitio de aplicación
                    </label>
                    <input
                      type="text"
                      name="applicationSite"
                      value={vaccinationFormData.applicationSite}
                      onChange={handleVaccinationInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: Pata delantera derecha"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observaciones
                    </label>
                    <textarea
                      name="observations"
                      value={vaccinationFormData.observations}
                      onChange={handleVaccinationInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="requiresBooster"
                        checked={vaccinationFormData.requiresBooster}
                        onChange={handleVaccinationInputChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Requiere refuerzo
                      </label>
                    </div>
                    {vaccinationFormData.requiresBooster && vaccinationFormData.doseNumber && parseInt(vaccinationFormData.doseNumber) > 1 && (
                      <p className="mt-1 text-xs text-purple-600">
                        <i className="pi pi-heart mr-1"></i> Al registrar esta dosis de refuerzo, la dosis {parseInt(vaccinationFormData.doseNumber) - 1} será marcada automáticamente como completada.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isCompleted"
                      checked={vaccinationFormData.isCompleted}
                      onChange={handleVaccinationInputChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Esquema completo
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mt-4">
                  <button
                    type="submit"
                    className={`${
                      vaccineProducts.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white px-4 py-2 rounded-md flex items-center space-x-2`}
                    disabled={vaccineProducts.length === 0}
                    title={vaccineProducts.length === 0 ? 'No hay vacunas en el inventario' : 'Guardar vacuna'}
                  >
                    <Save className="h-4 w-4" />
                    <span>Guardar Vacuna</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetVaccinationForm}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancelar</span>
                  </button>
                  {vaccineProducts.length === 0 && (
                    <span className="text-sm text-red-600 font-medium">
                      <i className="pi pi-exclamation-triangle mr-1"></i> Debe registrar vacunas en Productos primero
                    </span>
                  )}
                </div>
              </form>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeVaccinationModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistoryPage;


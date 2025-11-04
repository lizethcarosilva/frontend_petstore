import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar,
  Heart,
  User,
  Syringe,
  CheckCircle,
  Clock,
  Eye,
  X,
  Plus,
  Save,
  AlertCircle,
} from 'lucide-react';
import { vaccinationAPI, petAPI, userAPI, productAPI, appointmentAPI } from '../services/api';
import type { Vaccination, Pet, User as UserType, Product, Appointment } from '../types/types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';

const VaccinationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [filteredVaccinations, setFilteredVaccinations] = useState<Vaccination[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vaccineProducts, setVaccineProducts] = useState<Product[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPetFilter, setSelectedPetFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null);
  const [showBoosterFormInModal, setShowBoosterFormInModal] = useState(false);

  // Hook de paginación
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage
  } = usePagination({
    data: filteredVaccinations,
    itemsPerPage: 10
  });

  const [boosterFormData, setBoosterFormData] = useState({
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

  // Get initial values from URL params if coming from appointment
  const appointmentIdParam = searchParams.get('appointmentId');
  const petIdParam = searchParams.get('petId');

  // Determinar si el usuario es propietario (solo lectura)
  const isOwner = user?.rol_id === '5' || user?.rol_id === '6';
  const canEdit = !isOwner;

  const [formData, setFormData] = useState({
    petId: '',
    appointmentId: '',
    veterinarianId: '',
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

  useEffect(() => {
    loadVaccinations();
    loadPets();
    loadUsers();
    loadProducts();
  }, []);

  useEffect(() => {
    filterVaccinations();
  }, [vaccinations, searchTerm, selectedPetFilter, statusFilter]);

  // Si hay parámetros de URL, configurar el formulario
  useEffect(() => {
    if (isLoading) return;
    
    if (petIdParam && !showForm) {
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

  // Cargar citas y productos de vacunas cuando cambia el petId
  useEffect(() => {
    if (formData.petId) {
      loadAppointmentsByPet(parseInt(formData.petId));
      // Filtrar solo productos de vacunas cuando hay una mascota seleccionada
      filterVaccineProducts();
    }
  }, [formData.petId, products]);

  const loadVaccinations = async () => {
    try {
      setIsLoading(true);
      const response = await vaccinationAPI.getAll();
      setVaccinations(response.data);
    } catch (error) {
      console.error('Error loading vaccinations:', error);
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

  const loadProducts = async () => {
    try {
      // Usar el endpoint específico de vacunas del backend para mejor rendimiento
      const response = await productAPI.getVaccines();
      setProducts(response.data);
      // Como ya vienen solo vacunas del backend, no necesitamos filtrar
      setVaccineProducts(response.data);
    } catch (error) {
      console.error('Error loading vaccine products:', error);
      // Fallback: cargar todos los productos y filtrar
      try {
        const allProductsResponse = await productAPI.getAll();
        setProducts(allProductsResponse.data);
        filterVaccineProductsFallback(allProductsResponse.data);
      } catch (fallbackError) {
        console.error('Error loading products (fallback):', fallbackError);
      }
    }
  };

  const filterVaccineProductsFallback = (productsList: Product[]) => {
    // Filtrar solo productos que sean vacunas (método fallback si el endpoint específico falla)
    const vaccines = productsList.filter(product => {
      // Primero verificar si el producto tiene el campo esVacuna
      if (product.esVacuna !== undefined) {
        return product.esVacuna === true;
      }
      // Fallback: buscar por nombre o descripción para productos antiguos
      const nombre = product.nombre?.toLowerCase() || '';
      const descripcion = product.descripcion?.toLowerCase() || '';
      return nombre.includes('vacuna') || 
             descripcion.includes('vacuna') || 
             nombre.includes('inmunización') ||
             nombre.includes('inmunizacion');
    });
    setVaccineProducts(vaccines);
  };

  const filterVaccineProducts = () => {
    // Esta función ya no es necesaria porque loadProducts usa el endpoint específico
    // Pero la mantenemos por compatibilidad con useEffect existente
    if (products.length > 0 && vaccineProducts.length === 0) {
      filterVaccineProductsFallback(products);
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
        
        // Verificar si esta cita ya tiene una vacunación asociada
        const existingVaccination = vaccinations.find(v => 
          v.medicalHistoryId === parseInt(appointmentId)
        );
        
        if (existingVaccination) {
          alert('Esta cita ya fue atendida y tiene una vacunación asociada (ID: ' + existingVaccination.vaccinationId + ').');
          navigate('/vaccinations');
          return;
        }
        
        // Actualizar formData con los datos de la cita
        let fechaAtencionISO = '';
        if (appointment.fechaHora) {
          const date = new Date(appointment.fechaHora);
          fechaAtencionISO = date.toISOString().slice(0, 10); // formato yyyy-MM-dd
        }
        
        setFormData(prev => ({
          ...prev,
          petId: appointment.petId?.toString() || prev.petId,
          veterinarianId: appointment.veterinarianId?.toString() || prev.veterinarianId,
          applicationDate: fechaAtencionISO || prev.applicationDate
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

  const loadAppointmentData = async (appointmentId: number) => {
    try {
      console.log('Cargando datos de la cita ID:', appointmentId);
      const appointment = appointments.find(apt => 
        apt.appointmentId === appointmentId || parseInt(apt.id || '0') === appointmentId
      );
      
      if (appointment) {
        console.log('Cita encontrada:', appointment);
        
        // Extraer fecha de fechaHora
        let fechaAtencionISO = '';
        if (appointment.fechaHora) {
          const date = new Date(appointment.fechaHora);
          fechaAtencionISO = date.toISOString().slice(0, 10); // formato yyyy-MM-dd
        }
        
        // Actualizar formData con los datos de la cita
        setFormData(prev => ({
          ...prev,
          veterinarianId: appointment.veterinarianId?.toString() || prev.veterinarianId,
          applicationDate: fechaAtencionISO || prev.applicationDate
        }));
        
        console.log('Datos de cita cargados en formulario');
      }
    } catch (error) {
      console.error('Error loading appointment data:', error);
    }
  };

  const filterVaccinations = () => {
    let filtered = vaccinations;
    
    // Filtrar por mascota seleccionada
    if (selectedPetFilter) {
      filtered = filtered.filter(vaccination => 
        vaccination.petId?.toString() === selectedPetFilter
      );
    }
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed') {
        filtered = filtered.filter(v => v.isCompleted);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(v => !v.isCompleted);
      } else if (statusFilter === 'upcoming') {
        // Vacunas con próxima dosis programada
        filtered = filtered.filter(v => v.nextDoseDate && !v.isCompleted);
      }
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(vaccination =>
        vaccination.petNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccination.vaccineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccination.vaccineType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccination.veterinarianName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredVaccinations(filtered);
  };

  const formatDate = (dateString: string | undefined) => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Cuando se selecciona una cita, cargar sus datos
    if (name === 'appointmentId' && value) {
      loadAppointmentData(parseInt(value));
    }
    
    // Cuando se selecciona una vacuna del inventario, autocompletar datos
    if (name === 'vaccineName' && value) {
      const selectedProduct = vaccineProducts.find(p => p.nombre === value);
      if (selectedProduct) {
        setFormData(prev => ({
          ...prev,
          manufacturer: selectedProduct.fabricante || prev.manufacturer,
          batchNumber: selectedProduct.lote || prev.batchNumber
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validar que la mascota tenga citas
      if (formData.petId) {
        const petAppointments = appointments.filter(apt => {
          const petId = apt.petId || parseInt(apt.mascotaId || '0');
          return petId === parseInt(formData.petId);
        });
        
        if (petAppointments.length === 0) {
          alert('Esta mascota no tiene citas registradas. Debe crear una cita primero antes de registrar una vacuna.');
          return;
        }
      }

      // Validar que exista la vacuna en productos
      if (vaccineProducts.length === 0) {
        alert('No hay vacunas registradas en el inventario de productos. Por favor, registre primero las vacunas como productos.');
        return;
      }

      const createData: any = {
        petId: parseInt(formData.petId),
        veterinarianId: parseInt(formData.veterinarianId),
        vaccineName: formData.vaccineName,
        vaccineType: formData.vaccineType,
        manufacturer: formData.manufacturer || null,
        batchNumber: formData.batchNumber || null,
        applicationDate: formData.applicationDate,
        nextDoseDate: formData.nextDoseDate || null,
        doseNumber: formData.doseNumber ? parseInt(formData.doseNumber) : null,
        applicationSite: formData.applicationSite || null,
        observations: formData.observations || null,
        requiresBooster: formData.requiresBooster,
        isCompleted: formData.isCompleted
      };

      // Solo incluir medicalHistoryId si está presente (para vinculación con cita)
      if (formData.appointmentId && formData.appointmentId !== '') {
        createData.medicalHistoryId = parseInt(formData.appointmentId);
      }

      console.log('Creating vaccination with data:', createData);
      
      // Antes de crear la nueva vacuna, verificar si es una dosis > 1 y actualizar la vacuna anterior
      // Esto se ejecuta automáticamente independientemente del checkbox "requiresBooster"
      if (formData.doseNumber && parseInt(formData.doseNumber) > 1) {
        await handleBoosterVaccination(createData);
      } else {
        // Si es dosis 1, crear normalmente
        await vaccinationAPI.create(createData);
      }
      
      await loadVaccinations();
      resetForm();
      // Limpiar parámetros de URL
      navigate('/vaccinations');
      alert('Vacuna registrada exitosamente');
    } catch (error: any) {
      console.error('Error saving vaccination:', error);
      const errorMessage = error?.response?.data || error?.message || 'Error desconocido';
      alert(`Error al guardar la vacuna: ${errorMessage}`);
    }
  };

  const handleBoosterVaccination = async (newVaccinationData: any) => {
    try {
      // Buscar la vacuna anterior de la misma mascota, mismo nombre y dosis anterior
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
        !v.isCompleted // Solo si no está completada aún
      );
      
      if (previousVaccination && previousVaccination.vaccinationId) {
        console.log('Encontrada vacuna anterior para actualizar:', previousVaccination);
        
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
          isCompleted: true, // Marcar como completada
          observations: previousVaccination.observations 
            ? `${previousVaccination.observations}\n\nAplicación de refuerzo dosis ${newVaccinationData.doseNumber} de la vacunación ID ${newVaccinationId || 'nueva'}.`
            : `Aplicación de refuerzo dosis ${newVaccinationData.doseNumber} de la vacunación ID ${newVaccinationId || 'nueva'}.`
        };
        
        console.log('=== ACTUALIZACIÓN DE VACUNA ANTERIOR ===');
        console.log('Vacuna a actualizar:', previousVaccination);
        console.log('Datos de actualización:', updateData);
        console.log('=======================================');
        
        await vaccinationAPI.update(updateData);
        
        console.log('Vacuna anterior marcada como completada exitosamente');
      } else {
        // Si no se encuentra vacuna anterior, crear normalmente
        console.log('No se encontró vacuna anterior para actualizar, creando nueva vacuna');
        await vaccinationAPI.create(newVaccinationData);
      }
    } catch (error) {
      console.error('Error en handleBoosterVaccination:', error);
      // Si hay error, intentar crear la vacuna de todas formas
      await vaccinationAPI.create(newVaccinationData);
    }
  };

  const resetForm = () => {
    setFormData({
      petId: '',
      appointmentId: '',
      veterinarianId: '',
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
    setAppointments([]);
    setShowForm(false);
  };

  const handleViewDetails = (vaccination: Vaccination) => {
    setSelectedVaccination(vaccination);
    setShowBoosterFormInModal(false);
    // Si la vacuna requiere refuerzo y no está completada, preparar datos para refuerzo
    if (vaccination.requiresBooster && !vaccination.isCompleted) {
      const nextDoseNum = (vaccination.doseNumber || 0) + 1;
      setBoosterFormData({
        vaccineName: vaccination.vaccineName,
        vaccineType: vaccination.vaccineType,
        manufacturer: vaccination.manufacturer || '',
        batchNumber: vaccination.batchNumber || '',
        applicationDate: '',
        nextDoseDate: '',
        doseNumber: nextDoseNum.toString(),
        applicationSite: vaccination.applicationSite || '',
        observations: '',
        requiresBooster: true,
        isCompleted: false
      });
    }
  };

  const closeDetailsModal = () => {
    setSelectedVaccination(null);
    setShowBoosterFormInModal(false);
    resetBoosterForm();
  };

  const resetBoosterForm = () => {
    setBoosterFormData({
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
  };

  const handleBoosterInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setBoosterFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setBoosterFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBoosterSubmitFromModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVaccination || !selectedVaccination.petId) return;

    try {
      // Validar que haya un veterinario seleccionado
      const veterinarianId = formData.veterinarianId 
        ? parseInt(formData.veterinarianId) 
        : selectedVaccination.veterinarianId;
      
      if (!veterinarianId) {
        alert('Error: No se pudo determinar el veterinario. Por favor, asegúrese de tener un veterinario asignado.');
        return;
      }

      const createData: any = {
        petId: selectedVaccination.petId,
        veterinarianId: veterinarianId,
        vaccineName: boosterFormData.vaccineName,
        vaccineType: boosterFormData.vaccineType,
        manufacturer: boosterFormData.manufacturer || null,
        batchNumber: boosterFormData.batchNumber || null,
        applicationDate: boosterFormData.applicationDate,
        nextDoseDate: boosterFormData.nextDoseDate || null,
        doseNumber: parseInt(boosterFormData.doseNumber),
        applicationSite: boosterFormData.applicationSite || null,
        observations: boosterFormData.observations || null,
        requiresBooster: boosterFormData.requiresBooster,
        isCompleted: boosterFormData.isCompleted
      };

      // Crear la nueva vacuna (refuerzo)
      const newVaccinationResponse = await vaccinationAPI.create(createData);
      const newVaccinationId = newVaccinationResponse.data?.vaccinationId;

      // Actualizar la vacuna anterior (la que estamos viendo en el modal)
      const updateData: any = {
        vaccinationId: selectedVaccination.vaccinationId,
        petId: selectedVaccination.petId,
        medicalHistoryId: selectedVaccination.medicalHistoryId || null,
        veterinarianId: selectedVaccination.veterinarianId,
        vaccineName: selectedVaccination.vaccineName,
        vaccineType: selectedVaccination.vaccineType,
        manufacturer: selectedVaccination.manufacturer || null,
        batchNumber: selectedVaccination.batchNumber || null,
        applicationDate: selectedVaccination.applicationDate,
        nextDoseDate: selectedVaccination.nextDoseDate || null,
        doseNumber: selectedVaccination.doseNumber,
        applicationSite: selectedVaccination.applicationSite || null,
        requiresBooster: selectedVaccination.requiresBooster || false,
        isCompleted: true, // Marcar como completada
        observations: selectedVaccination.observations 
          ? `${selectedVaccination.observations}\n\nAplicación de refuerzo dosis ${boosterFormData.doseNumber} de la vacunación ID ${newVaccinationId || 'nueva'}.`
          : `Aplicación de refuerzo dosis ${boosterFormData.doseNumber} de la vacunación ID ${newVaccinationId || 'nueva'}.`
      };

      console.log('=== ACTUALIZACIÓN DE VACUNA ANTERIOR ===');
      console.log('Vacuna a actualizar:', selectedVaccination);
      console.log('Datos de actualización:', updateData);
      console.log('=======================================');

      await vaccinationAPI.update(updateData);
      
      // Recargar vacunaciones y cerrar modal
      await loadVaccinations();
      closeDetailsModal();
      alert('Refuerzo registrado exitosamente y vacuna anterior marcada como completada');
    } catch (error: any) {
      console.error('Error saving booster vaccination:', error);
      
      // Manejo específico de errores
      if (error?.response?.status === 400) {
        alert('Error 400 - Bad Request al actualizar vacunación:\n\n' +
              'El backend rechazó la solicitud. Posibles causas:\n' +
              '1. El endpoint PUT /api/vaccinations/update no está implementado\n' +
              '2. Falta el DTO VaccinationUpdateDto en el backend\n' +
              '3. Los datos enviados no coinciden con el formato esperado\n\n' +
              'Ver archivo VACCINATION_UPDATE_ERROR_SOLUTION.md para solución completa.\n\n' +
              'Detalles: ' + (error?.response?.data || error?.message));
      } else if (error?.response?.status === 403) {
        alert('Error 403 - Sin permisos para actualizar vacunación.\n' +
              'Verifica que el endpoint tenga @RequiresRole con tu rol.');
      } else {
        const errorMessage = error?.response?.data || error?.message || 'Error desconocido';
        alert(`Error al guardar el refuerzo: ${errorMessage}`);
      }
    }
  };

  // Verificar si una vacuna está próxima a vencer (próxima dosis en menos de 30 días)
  const isUpcomingSoon = (nextDoseDate: string | undefined) => {
    if (!nextDoseDate) return false;
    const today = new Date();
    const doseDate = new Date(nextDoseDate);
    const diffTime = doseDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Esquema de Vacunación</h1>
          {isOwner && (
            <span className="text-sm text-blue-600">
              Modo: Solo Lectura (Propietario)
            </span>
          )}
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por mascota
            </label>
            <select
              value={selectedPetFilter}
              onChange={(e) => setSelectedPetFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Todas las mascotas</option>
              {pets.map((pet) => (
                <option key={pet.petId} value={pet.petId}>
                  {pet.nombre} - {pet.tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del esquema
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="completed">Completados</option>
              <option value="pending">Pendientes</option>
              <option value="upcoming">Próximas dosis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por mascota o vacuna"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Esquemas Completos</p>
                <p className="text-2xl font-bold text-green-600">
                  {vaccinations.filter(v => v.isCompleted).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {vaccinations.filter(v => !v.isCompleted).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Syringe className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Vacunas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {vaccinations.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vaccination Form */}
        {showForm && canEdit && (
          <form onSubmit={handleSubmit} className="mt-6 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Registrar Nueva Vacuna</h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mascota *
                </label>
                <select
                  name="petId"
                  value={formData.petId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    return appointments.length > 0 && `(${appointments.length} disponible${appointments.length > 1 ? 's' : ''})`;
                  })()}
                </label>
                <select
                  name="appointmentId"
                  value={formData.appointmentId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Ninguna cita</option>
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => {
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Veterinario/Trabajador *
                </label>
                <select
                  name="veterinarianId"
                  value={formData.veterinarianId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

              {/* Alerta de productos de vacunas */}
              {formData.petId && vaccineProducts.length === 0 && (
                <div className="col-span-full">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">No hay vacunas en el inventario</p>
                      <p className="mt-1">
                        Debe registrar vacunas como productos en el sistema antes de poder registrar aplicaciones. 
                        Vaya a Productos y agregue las vacunas necesarias.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mostrar productos de vacunas disponibles */}
              {formData.petId && vaccineProducts.length > 0 && (
                <div className="col-span-full">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm font-medium text-blue-800 mb-2">
                      Vacunas disponibles en inventario ({vaccineProducts.length}):
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs text-blue-700">
                      {vaccineProducts.map(product => (
                        <div key={product.productId} className="flex items-center">
                          <Syringe className="h-3 w-3 mr-1" />
                          <span>{product.nombre} (Stock: {product.stock})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la vacuna *
                </label>
                <select
                  name="vaccineName"
                  value={formData.vaccineName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={vaccineProducts.length === 0}
                >
                  <option value="">Seleccionar vacuna del inventario</option>
                  {vaccineProducts.map((product) => (
                    <option key={product.productId} value={product.nombre}>
                      {product.nombre} {product.stock > 0 ? `(Stock: ${product.stock})` : '(Sin stock)'}
                    </option>
                  ))}
                </select>
                {formData.vaccineName && (() => {
                  const selectedVaccine = vaccineProducts.find(p => p.nombre === formData.vaccineName);
                  return selectedVaccine && (
                    <p className="mt-1 text-xs text-gray-600">
                      💉 {selectedVaccine.descripcion || 'Vacuna seleccionada'}
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
                  value={formData.vaccineType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  <option value="Leucemia Felina">Leucemia Felina</option>
                  <option value="Triple Felina">Triple Felina</option>
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
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: Laboratorio XYZ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de lote
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: LOT-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de aplicación *
                </label>
                <input
                  type="date"
                  name="applicationDate"
                  value={formData.applicationDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  value={formData.nextDoseDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de dosis
                </label>
                <input
                  type="number"
                  name="doseNumber"
                  value={formData.doseNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                  placeholder="Ej: 1, 2, 3..."
                />
                {formData.doseNumber && parseInt(formData.doseNumber) > 1 && (
                  <p className="mt-1 text-xs text-blue-600">
                    ℹ️ Dosis {formData.doseNumber} - La dosis {parseInt(formData.doseNumber) - 1} será marcada automáticamente como completada si existe.
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
                  value={formData.applicationSite}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: Pata delantera derecha"
                />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requiresBooster"
                    checked={formData.requiresBooster}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Requiere refuerzo
                  </label>
                </div>
                {formData.requiresBooster && (
                  <p className="mt-1 text-xs text-purple-600">
                    💉 Esta vacuna requerirá dosis adicionales en el futuro.
                    {formData.doseNumber && parseInt(formData.doseNumber) > 1 && 
                      ` La dosis ${parseInt(formData.doseNumber) - 1} será marcada como completada.`
                    }
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isCompleted"
                  checked={formData.isCompleted}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Esquema completo
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-6">
              <button
                type="submit"
                className={`${
                  !formData.petId || vaccineProducts.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white px-4 py-2 rounded-md flex items-center space-x-2`}
                disabled={!formData.petId || vaccineProducts.length === 0}
                title={
                  !formData.petId 
                    ? 'Seleccione una mascota primero' 
                    : vaccineProducts.length === 0 
                    ? 'No hay vacunas en el inventario' 
                    : 'Guardar vacuna'
                }
              >
                <Save className="h-4 w-4" />
                <span>Guardar Vacuna</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
              {vaccineProducts.length === 0 && (
                <span className="text-sm text-red-600 font-medium">
                  ⚠️ Debe registrar vacunas en Productos primero
                </span>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Vaccinations List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Registro de Vacunas</h2>
            {canEdit && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Nueva Vacuna</span>
              </button>
            )}
          </div>

          {/* Vaccinations Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mascota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vacuna
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Aplicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Próxima Dosis
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
                {paginatedData.map((vaccination) => (
                  <tr key={vaccination.vaccinationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-pink-500 mr-2" />
                        <div className="text-sm text-gray-900">
                          {vaccination.petNombre || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Syringe className="h-4 w-4 text-purple-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {vaccination.vaccineName}
                          </div>
                          {vaccination.doseNumber && (
                            <div className="text-xs text-gray-500">
                              Dosis {vaccination.doseNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {vaccination.vaccineType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {formatDate(vaccination.applicationDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vaccination.nextDoseDate ? (
                        <div className="text-sm">
                          <div className={isUpcomingSoon(vaccination.nextDoseDate) ? 'text-yellow-600 font-medium' : 'text-gray-900'}>
                            {formatDate(vaccination.nextDoseDate)}
                          </div>
                          {isUpcomingSoon(vaccination.nextDoseDate) && (
                            <div className="text-xs text-yellow-600">
                              ⚠️ Próximamente
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vaccination.isCompleted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button
                        onClick={() => handleViewDetails(vaccination)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredVaccinations.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredVaccinations.length}
              itemsPerPage={10}
              onPageChange={goToPage}
              itemName="vacunaciones"
            />
          )}

          {filteredVaccinations.length === 0 && (
            <div className="text-center py-12">
              <Syringe className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay vacunas registradas</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedPetFilter 
                  ? 'No hay vacunas para la mascota seleccionada.' 
                  : 'Aún no se han registrado vacunas en el sistema.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedVaccination && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white mb-20">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Detalles de Vacuna - {selectedVaccination.petNombre}
                </h3>
                <p className="text-sm text-gray-600">
                  Dosis {selectedVaccination.doseNumber || 'N/A'} - {selectedVaccination.vaccineName}
                </p>
              </div>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Mascota:</label>
                  <p className="text-sm text-gray-900">{selectedVaccination.petNombre}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Veterinario:</label>
                  <p className="text-sm text-gray-900">{selectedVaccination.veterinarianName || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Vacuna:</label>
                  <p className="text-sm text-gray-900">{selectedVaccination.vaccineName}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Tipo:</label>
                  <p className="text-sm text-gray-900">{selectedVaccination.vaccineType}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Fabricante:</label>
                  <p className="text-sm text-gray-900">{selectedVaccination.manufacturer || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Lote:</label>
                  <p className="text-sm text-gray-900">{selectedVaccination.batchNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Fecha de Aplicación:</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedVaccination.applicationDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Próxima Dosis:</label>
                  <p className="text-sm text-gray-900">
                    {selectedVaccination.nextDoseDate ? formatDate(selectedVaccination.nextDoseDate) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Dosis Número:</label>
                  <p className="text-sm text-gray-900">{selectedVaccination.doseNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Sitio de Aplicación:</label>
                  <p className="text-sm text-gray-900">{selectedVaccination.applicationSite || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Requiere Refuerzo:</label>
                  <p className="text-sm text-gray-900">{selectedVaccination.requiresBooster ? 'Sí' : 'No'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Esquema Completo:</label>
                  <p className="text-sm text-gray-900">{selectedVaccination.isCompleted ? 'Sí' : 'No'}</p>
                </div>
              </div>

              {selectedVaccination.observations && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Observaciones:</label>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-line">{selectedVaccination.observations}</p>
                </div>
              )}
            </div>

            {/* Sección de refuerzo - solo si requiere refuerzo y no está completada y usuario puede editar */}
            {canEdit && selectedVaccination.requiresBooster && !selectedVaccination.isCompleted && (
              <div className="mt-6 border-t pt-4">
                {!showBoosterFormInModal ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">
                          Esta vacuna requiere refuerzo
                        </h4>
                        <p className="text-sm text-yellow-700 mb-3">
                          Dosis actual: {selectedVaccination.doseNumber || 'N/A'}. 
                          {selectedVaccination.nextDoseDate && ` Próxima dosis programada: ${formatDate(selectedVaccination.nextDoseDate)}`}
                        </p>
                        <button
                          onClick={() => setShowBoosterFormInModal(true)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2 text-sm"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Agregar Dosis de Refuerzo (Dosis {(selectedVaccination.doseNumber || 0) + 1})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBoosterSubmitFromModal} className="bg-purple-50 border border-purple-200 rounded-md p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-semibold text-gray-900">
                        Registrar Dosis de Refuerzo (Dosis {boosterFormData.doseNumber})
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowBoosterFormInModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mb-3 bg-gray-50 border border-gray-200 rounded-md p-3">
                      <p className="text-sm text-gray-700">
                        <strong>Vacuna anterior (Dosis {selectedVaccination.doseNumber}):</strong> {selectedVaccination.vaccineName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Fecha aplicación: {formatDate(selectedVaccination.applicationDate)} | 
                        Veterinario: {selectedVaccination.veterinarianName || 'N/A'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Veterinario *
                        </label>
                        <select
                          name="veterinarianId"
                          value={formData.veterinarianId || selectedVaccination.veterinarianId?.toString()}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                          Fecha de aplicación *
                        </label>
                        <input
                          type="date"
                          name="applicationDate"
                          value={boosterFormData.applicationDate}
                          onChange={handleBoosterInputChange}
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
                          value={boosterFormData.nextDoseDate}
                          onChange={handleBoosterInputChange}
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
                          value={boosterFormData.batchNumber}
                          onChange={handleBoosterInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ej: LOT-2024-002"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sitio de aplicación
                        </label>
                        <input
                          type="text"
                          name="applicationSite"
                          value={boosterFormData.applicationSite}
                          onChange={handleBoosterInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ej: Pata trasera izquierda"
                        />
                      </div>

                      <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observaciones
                        </label>
                        <textarea
                          name="observations"
                          value={boosterFormData.observations}
                          onChange={handleBoosterInputChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Observaciones del refuerzo..."
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isCompleted"
                          checked={boosterFormData.isCompleted}
                          onChange={handleBoosterInputChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Esta es la última dosis (esquema completo)
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-800">
                        <strong>✓ Acción automática:</strong> Al guardar este refuerzo, la vacuna actual (Dosis {selectedVaccination.doseNumber}) 
                        será marcada como completada y se agregará la observación: "Aplicación de refuerzo dosis {boosterFormData.doseNumber} 
                        de la vacunación ID [nueva]."
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4">
                      <button
                        type="submit"
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Guardar Refuerzo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowBoosterFormInModal(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end border-t pt-4">
              <button
                onClick={closeDetailsModal}
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

export default VaccinationsPage;


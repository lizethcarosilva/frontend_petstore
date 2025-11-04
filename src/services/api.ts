import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor to add auth token and tenant_id
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar tenant_id desde localStorage (puede ser el seleccionado o el del usuario)
    const selectedTenantId = localStorage.getItem('selectedTenantId');
    if (selectedTenantId) {
      config.headers['X-Tenant-ID'] = selectedTenantId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  
  (error) => {
    // Solo redirigir a login si ya estamos autenticados y recibimos 401
    // No redirigir si estamos en la página de login (para mostrar el error)
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    console.log(error);
    return Promise.reject(error);
  }
);

// Tenant API
export const tenantAPI = {
  getAll: () => api.get('/api/tenants'),
  getById: (tenantId: string) => api.post('/api/tenants/getById', { 
    tenantId: tenantId.toString() 
  }),
  search: (query: string) => api.get(`/api/tenants/search?q=${query}`),
  getByPlan: (plan: string) => api.get(`/api/tenants/plan/${plan}`),
  getByNit: (nit: string) => api.get(`/api/tenants/nit/${nit}`),
  getCount: () => api.get('/api/tenants/count'),
  getActive: () => api.get('/api/tenants/active'),
  create: (data: any) => api.post('/api/tenants/create', data),
  update: (data: any) => api.put('/api/tenants/update', data),
  deactivate: (tenantId: string) => api.put(`/api/tenants/deactivate/${tenantId}`),
  activate: (tenantId: string) => api.put(`/api/tenants/activate/${tenantId}`),
};

// Service API
export const serviceAPI = {
  getAll: () => api.get('/api/services'),
  search: (query: string) => api.get(`/api/services/search?q=${query}`),
  getById: (id: number) => api.get(`/api/services/getId?id=${id}`),
  getCount: () => api.get('/api/services/count'),
  getByCode: (code: string) => api.get(`/api/services/codigo?codigo=${code}`),
  getActive: () => api.get('/api/services/active'),
  create: (data: any) => api.post('/api/services/create', data),
  update: (data: any) => api.put('/api/services/update', data),
  delete: (serviceId: number) => api.delete('/api/services/deleteService', { data: serviceId }),
  deletePermanent: (id: number) => api.delete('/api/services/servicePermanent', { data: id }),
};

// Product API
export const productAPI = {
  getAll: () => api.get('/api/products'),
  search: (query: string) => api.get(`/api/products/search?q=${query}`),
  getLowStock: () => api.get('/api/products/lowStock'),
  getById: (id: string) => api.get(`/api/products/getId?id=${id}`),
  getExpiringSoon: () => api.get('/api/products/expiringSoon'),
  getExpiringBefore: (date: string) => api.get(`/api/products/expiringBefore?date=${date}`),
  getCount: () => api.get('/api/products/count'),
  getLowStockCount: () => api.get('/api/products/count/lowStock'),
  getByCode: (code: string) => api.get(`/api/products/codigo?codigo=${code}`),
  getActive: () => api.get('/api/products/active'),
  getVaccines: () => api.get('/api/products/vaccines'),
  getAvailableVaccines: () => api.get('/api/products/vaccines/available'),
  getVaccinesCount: () => api.get('/api/products/count/vaccines'),
  create: (data: any) => api.post('/api/products/create', data),
  update: (data: any) => api.put('/api/products/update', data),
  updateStock: (data: any) => api.put('/api/products/updateStock', data),
  delete: (data: any) => api.delete('/api/products/deleteProduct', { data }),
  deletePermanent: (data: any) => api.delete('/api/products/productPermanent', { data }),
};

// Roles API
export const rolesAPI = {
  getAll: () => api.get('/api/roles'),
  getActive: () => api.get('/api/roles/active'),
  getById: (rolId: string) => api.post('/api/roles/getById', { rolId }),
};

// Client API (Nuevo)
export const clientAPI = {
  getAll: () => api.get('/api/clients'),
  getActive: () => api.get('/api/clients/active'),
  getById: (id: number) => api.post('/api/clients/getById', { id }),
  searchByName: (name: string) => api.post('/api/clients/searchByName', { name }),
  getByIdent: (ident: string) => api.post('/api/clients/getByIdent', { ident }),
  getByCorreo: (correo: string) => api.post('/api/clients/getByCorreo', { correo }),
  count: () => api.get('/api/clients/count'),
  create: (data: any) => api.post('/api/clients/create', data),
  update: (data: any) => api.put('/api/clients/update', data),
  delete: (id: number) => api.delete('/api/clients/delete', { data: { id } }),
  deletePermanent: (id: number) => api.delete('/api/clients/deletePermanent', { data: { id } }),
};

// User API
export const userAPI = {
  getAll: () => api.get('/api/users'),
  getIdTenant: (tenantId: string) => api.post('/api/users/getIdTenant', { 
    tenantId: tenantId.toString() 
  }),
  search: (query: string) => api.get(`/api/users/search?q=${query}`),
  getByRole: (roleId: string) => api.post('/api/users/rolId', { rolId: roleId }),
  getById: (id: string) => api.post('/api/users/getId', { id: parseInt(id) }),
  getCount: () => api.get('/api/users/count'),
  getActiveCount: () => api.get('/api/users/count/active'),
  getActive: () => api.get('/api/users/active'),
  login: (data: any) => api.post('/api/users/login', data),
  create: (data: any) => api.post('/api/users/create', data),
  update: (data: any) => api.put('/api/users/update', data),
  deactivate: (data: any) => api.put('/api/users/userDeactivate', data),
  activate: (data: any) => api.put('/api/users/userActivate', data),
  delete: (data: any) => api.delete('/api/users/deleteUser', { data }),
  deletePermanent: (data: any) => api.delete('/api/users/userPermanent', { data }),
};

// Appointment API
export const appointmentAPI = {
  getAll: () => api.get('/api/appointments'),
  getByClient: (clientId: number) => api.get(`/api/appointments/client?clientId=${clientId}`),
  getToday: () => api.get('/api/appointments/today'),
  getByPet: (petId: number) => api.get(`/api/appointments/pet?petId=${petId}`),
  getById: (id: number) => api.post('/api/appointments/getId', id),
  getByStatus: (status: string) => api.get(`/api/appointments/estado?estado=${status}`),
  getByDateRange: (inicio: string, fin: string) => 
    api.get(`/api/appointments/dateRange?inicio=${inicio}&fin=${fin}`),
  getTodayCount: () => api.get('/api/appointments/count/today'),
  getActive: () => api.get('/api/appointments/active'),
  create: (data: any) => api.post('/api/appointments/create', data),
  update: (data: any) => api.put('/api/appointments/update', data),
  complete: (appointmentId: number, diagnostico: string) => 
    api.put(`/api/appointments/complete?appointmentId=${appointmentId}&diagnostico=${encodeURIComponent(diagnostico)}`),
  cancel: (appointmentId: number) => api.put(`/api/appointments/cancel?appointmentId=${appointmentId}`),
  markAsInvoiced: (appointmentId: number) => api.put(`/api/appointments/markAsInvoiced?appointmentId=${appointmentId}`),
  delete: (appointmentId: number) => api.delete('/api/appointments/deleteAppointment', { data: appointmentId }),
  deletePermanent: (data: any) => api.delete('/api/appointments/appointmentPermanent', { data }),
  getByVeterinarianAndDate: (veterinarianId: number, fecha: string) =>
    api.get(`/api/appointments/veterinarian?veterinarianId=${veterinarianId}&fecha=${fecha}`),
  getAvailableSlots: (veterinarianId: number, fecha: string, horaInicio?: string, horaFin?: string, intervaloMinutos?: number) => {
    const params = new URLSearchParams({
      veterinarianId: veterinarianId.toString(),
      fecha: fecha,
      ...(horaInicio && { horaInicio }),
      ...(horaFin && { horaFin }),
      ...(intervaloMinutos && { intervaloMinutos: intervaloMinutos.toString() })
    });
    return api.get(`/api/appointments/availableSlots?${params.toString()}`);
  },
  // Nuevo endpoint para carrito de compras
  getForInvoice: (appointmentId: number) => api.post('/api/appointments/forInvoice', { id: appointmentId }),
};

// Pet API
export const petAPI = {
  getAll: () => api.get('/api/pets'),
  getByType: (type: string) => api.get(`/api/pets/type?type=${type}`),
  search: (query: string) => api.get(`/api/pets/search?q=${query}`),
  getByOwner: (ownerId: string) => api.get(`/api/pets/owner?ownerId=${ownerId}`),
  getById: (id: string) => api.post('/api/pets/getId', { id: parseInt(id) }),
  getOwners: (petId: number) => api.post('/api/pets/getOwners', { id: petId }),
  getCount: () => api.get('/api/pets/count'),
  getActive: () => api.get('/api/pets/active'),
  create: (data: any) => api.post('/api/pets/create', data),
  update: (data: any) => api.put('/api/pets/update', data),
  addOwner: (petId: number, ownerId: number) => api.post(`/api/pets/addOwner?petId=${petId}&ownerId=${ownerId}`),
  removeOwner: (petId: number, ownerId: number) => api.delete(`/api/pets/removeOwner?petId=${petId}&ownerId=${ownerId}`),
  delete: (data: any) => api.delete('/api/pets/deletePet', { data }),
  deletePermanent: (data: any) => api.delete('/api/pets/petPermanent', { data }),
};

// Invoice API
export const invoiceAPI = {
  // GET endpoints
  getAll: () => api.get('/api/invoices'),
  getActive: () => api.get('/api/invoices/active'),
  getById: (id: number) => api.post('/api/invoices/getId', id),
  getByNumero: (numero: string) => api.get(`/api/invoices/numero?numero=${numero}`),
  getByClient: (clientId: number) => api.get(`/api/invoices/client?clientId=${clientId}`),
  getByEstado: (estado: string) => api.get(`/api/invoices/estado?estado=${estado}`),
  getByDateRange: (inicio: string, fin: string) => 
    api.get(`/api/invoices/dateRange?inicio=${inicio}&fin=${fin}`),
  
  // Sales statistics
  getTotalSalesToday: () => api.get('/api/invoices/sales/today'),
  getTotalSalesMonth: () => api.get('/api/invoices/sales/month'),
  getTopProducts: () => api.get('/api/invoices/topProducts'),
  getTopServices: () => api.get('/api/invoices/topServices'),
  
  // Counters
  countInvoicesToday: () => api.get('/api/invoices/count/today'),
  
  // POST/PUT endpoints
  create: (data: any) => api.post('/api/invoices/create', data),
  updateStatus: (invoiceId: number, estado: string) => 
    api.put(`/api/invoices/updateStatus?invoiceId=${invoiceId}&estado=${estado}`),
  cancel: (invoiceId: number) => api.put(`/api/invoices/cancel?invoiceId=${invoiceId}`),
  
  // DELETE endpoints
  delete: (invoiceId: number) => api.delete('/api/invoices/deleteInvoice', { data: invoiceId }),
};

// Medical History API
export const medicalHistoryAPI = {
  getAll: () => api.get('/api/medical-history'),
  getById: (id: number) => api.post('/api/medical-history/getId', { id }),
  getByPet: (petId: number) => api.post('/api/medical-history/getByPet', { id: petId }),
  getByAppointment: (appointmentId: number) => api.post('/api/medical-history/getByAppointment', { id: appointmentId }),
  getByVeterinarian: (veterinarianId: number) => api.post('/api/medical-history/getByVeterinarian', { id: veterinarianId }),
  getByService: (serviceId: number) => api.post('/api/medical-history/getByService', { id: serviceId }),
  getByProcedureType: (petId: number, tipoProcedimiento: string) => 
    api.post('/api/medical-history/getByProcedureType', { petId, tipoProcedimiento }),
  getByDateRange: (petId: number, fechaInicio: string, fechaFin: string) => 
    api.post(`/api/medical-history/getByDateRange?petId=${petId}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
  create: (data: any) => api.post('/api/medical-history/create', data),
  update: (data: any) => api.put('/api/medical-history/update', data),
  delete: (id: number) => api.delete('/api/medical-history/deleteHistory', { data: { id } }),
  deletePermanent: (id: number) => api.delete('/api/medical-history/deletePermanent', { data: { id } }),
};

// Vaccination API
export const vaccinationAPI = {
  getAll: () => api.get('/api/vaccinations'),
  getById: (id: number) => api.post('/api/vaccinations/getId', { id }),
  getByPet: (petId: number) => api.post('/api/vaccinations/getByPet', { id: petId }),
  getByMedicalHistory: (medicalHistoryId: number) => api.post('/api/vaccinations/getByMedicalHistory', { id: medicalHistoryId }),
  getByVeterinarian: (veterinarianId: number) => api.post('/api/vaccinations/getByVeterinarian', { id: veterinarianId }),
  getByVaccineName: (petId: number, vaccineName: string) => api.post('/api/vaccinations/getByVaccineName', { petId, vaccineName }),
  getPending: (petId: number) => api.post('/api/vaccinations/pending', { id: petId }),
  getCompleted: (petId: number) => api.post('/api/vaccinations/getCompleted', { id: petId }),
  create: (data: any) => api.post('/api/vaccinations/create', data),
  update: (data: any) => api.put('/api/vaccinations/update', data),
  markAsInvoiced: (vaccinationId: number) => api.put(`/api/vaccinations/markAsInvoiced?vaccinationId=${vaccinationId}`),
  delete: (id: number) => api.delete('/api/vaccinations/deleteVaccination', { data: { id } }),
  deletePermanent: (id: number) => api.delete('/api/vaccinations/deletePermanent', { data: { id } }),
  // Nuevo endpoint para carrito de compras
  getForInvoice: (vaccinationId: number) => api.post('/api/vaccinations/forInvoice', { id: vaccinationId }),
};

// Dashboard API
export const dashboardAPI = {
  getUserStats: () => api.get('/api/dashboard/users/stats'),
  getTopServices: () => api.get('/api/dashboard/topServices'),
  getTopProducts: () => api.get('/api/dashboard/topProducts'),
  getSummary: () => api.get('/api/dashboard/summary'),
  getSalesStats: () => api.get('/api/dashboard/sales/stats'),
  getProductStats: () => api.get('/api/dashboard/products/stats'),
  getLowStockProducts: () => api.get('/api/dashboard/products/lowStock'),
  getExpiringSoonProducts: () => api.get('/api/dashboard/products/expiringSoon'),
  getPerformance: () => api.get('/api/dashboard/performance'),
  getTodayAppointments: () => api.get('/api/dashboard/appointments/today'),
  getAppointmentStats: () => api.get('/api/dashboard/appointments/stats'),
  getAlerts: () => api.get('/api/dashboard/alerts'),
};

// Métricas API - Nuevos endpoints optimizados
export const metricasAPI = {
  getCitasHoy: () => api.get('/api/metricas/citas-hoy'),
  getCantidadProductos: () => api.get('/api/metricas/cantidad-productos'),
  getVentasDia: () => api.get('/api/metricas/ventas-dia'),
  getVentasMes: () => api.get('/api/metricas/ventas-mes'),
  getProductosProximosVencer: () => api.get('/api/metricas/productos-proximos-vencer'),
  getAlertaBajoInventario: () => api.get('/api/metricas/alerta-bajo-inventario'),
  getComparativaVentas: () => api.get('/api/metricas/comparativa-ventas'),
  getDashboard: () => api.get('/api/metricas/dashboard'), // Todas las métricas en una sola llamada
};

// IA Chatbot API (Python FastAPI - Puerto 8000)
const IA_API_BASE_URL = 'http://localhost:8000';

const iaApi = axios.create({
  baseURL: IA_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatbotAPI = {
  // Chatbot
  sendMessage: (mensaje: string, usuario_id: string = 'user123') => 
    iaApi.post('/api/chat', { mensaje, usuario_id }),
  getComandos: () => iaApi.get('/api/chat/comandos'),
  
  // Estadísticas
  getEstadisticas: () => iaApi.get('/api/estadisticas'),
  
  // Análisis
  getTiposMascota: () => iaApi.get('/api/analisis/tipos-mascota'),
  getDiasAtencion: () => iaApi.get('/api/analisis/dias-atencion'),
  getHorasPico: () => iaApi.get('/api/analisis/horas-pico'),
  getServicios: () => iaApi.get('/api/analisis/servicios'),
  
  // Clustering
  getClusteringCompleto: () => iaApi.get('/api/clustering/completo'),
  getClusteringMascotas: () => iaApi.get('/api/clustering/mascotas'),
  getClusteringClientes: () => iaApi.get('/api/clustering/clientes'),
  getClusteringServicios: () => iaApi.get('/api/clustering/servicios'),
  
  // Predicciones
  predecirTipoMascota: (data: { dia_semana: number; hora: number; mes: number; service_id: number }) =>
    iaApi.post('/api/predicciones/tipo-mascota', data),
  predecirAsistencia: (data: any) => iaApi.post('/api/predicciones/asistencia', data),
  getTipoMasComun: () => iaApi.get('/api/predicciones/tipo-mas-comun'),
  getDiaMasAtencion: () => iaApi.get('/api/predicciones/dia-mas-atencion'),
  getEstadoModelos: () => iaApi.get('/api/predicciones/estado'),
  
  // Consultas
  buscarMascota: (nombre: string) => iaApi.get(`/api/mascotas/buscar/${nombre}`),
  getHistorialMascota: (pet_id: number) => iaApi.get(`/api/mascotas/${pet_id}/historial`),
  getCitasMascota: (pet_id: number) => iaApi.get(`/api/mascotas/${pet_id}/citas`),
  getVacunasMascota: (pet_id: number) => iaApi.get(`/api/mascotas/${pet_id}/vacunas`),
  buscarCliente: (correo: string) => iaApi.get(`/api/clientes/buscar/${correo}`),
  getMascotasCliente: (client_id: number) => iaApi.get(`/api/clientes/${client_id}/mascotas`),
  getServiciosDisponibles: () => iaApi.get('/api/servicios'),
  
  // Administración
  entrenarModelos: () => iaApi.post('/api/entrenar'),
  exportarDataset: () => iaApi.get('/api/exportar/dataset'),
  
  // Health check
  healthCheck: () => iaApi.get('/api/health'),
};

export default api;
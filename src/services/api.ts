import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
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
  getById: (id: string) => api.get(`/api/services/getId?id=${id}`),
  getCount: () => api.get('/api/services/count'),
  getByCode: (code: string) => api.get(`/api/services/codigo?codigo=${code}`),
  getActive: () => api.get('/api/services/active'),
  create: (data: any) => api.post('/api/services/create', data),
  update: (data: any) => api.put('/api/services/update', data),
  delete: (data: any) => api.delete('/api/services/deleteService', { data }),
  deletePermanent: (data: any) => api.delete('/api/services/servicePermanent', { data }),
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
  create: (data: any) => api.post('/api/products/create', data),
  update: (data: any) => api.put('/api/products/update', data),
  updateStock: (data: any) => api.put('/api/products/updateStock', data),
  delete: (data: any) => api.delete('/api/products/deleteProduct', { data }),
  deletePermanent: (data: any) => api.delete('/api/products/productPermanent', { data }),
};

// User API
export const userAPI = {
  getAll: () => api.get('/api/users'),
  getIdTenant: (tenantId: string) => api.post('/api/users/getIdTenant', { 
    tenantId: tenantId.toString() 
  }),
  search: (query: string) => api.get(`/api/users/search?q=${query}`),
  getByRole: (roleId: string) => api.get(`/api/users/rolId?rolId=${roleId}`),
  getById: (id: string) => api.get(`/api/users/getId?id=${id}`),
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
  getByUser: (userId: string) => api.get(`/api/appointments/user?userId=${userId}`),
  getToday: () => api.get('/api/appointments/today'),
  getByPet: (petId: string) => api.get(`/api/appointments/pet?petId=${petId}`),
  getById: (id: string) => api.get(`/api/appointments/getId?id=${id}`),
  getByStatus: (status: string) => api.get(`/api/appointments/estado?estado=${status}`),
  getByDateRange: (startDate: string, endDate: string) => 
    api.get(`/api/appointments/dateRange?startDate=${startDate}&endDate=${endDate}`),
  getTodayCount: () => api.get('/api/appointments/count/today'),
  getActive: () => api.get('/api/appointments/active'),
  create: (data: any) => api.post('/api/appointments/create', data),
  update: (data: any) => api.put('/api/appointments/update', data),
  complete: (data: any) => api.put('/api/appointments/complete', data),
  cancel: (data: any) => api.put('/api/appointments/cancel', data),
  delete: (data: any) => api.delete('/api/appointments/deleteAppointment', { data }),
  deletePermanent: (data: any) => api.delete('/api/appointments/appointmentPermanent', { data }),
};

// Pet API
export const petAPI = {
  getAll: () => api.get('/api/pets'),
  getByType: (type: string) => api.get(`/api/pets/type?type=${type}`),
  search: (query: string) => api.get(`/api/pets/search?q=${query}`),
  getByOwner: (ownerId: string) => api.get(`/api/pets/owner?ownerId=${ownerId}`),
  getById: (id: string) => api.get(`/api/pets/getId?id=${id}`),
  getCount: () => api.get('/api/pets/count'),
  getActive: () => api.get('/api/pets/active'),
  create: (data: any) => api.post('/api/pets/create', data),
  update: (data: any) => api.put('/api/pets/update', data),
  addOwner: (data: any) => api.post('/api/pets/addOwner', data),
  removeOwner: (data: any) => api.delete('/api/pets/removeOwner', { data }),
  delete: (data: any) => api.delete('/api/pets/deletePet', { data }),
  deletePermanent: (data: any) => api.delete('/api/pets/petPermanent', { data }),
};

// Invoice API
export const invoiceAPI = {
  getAll: () => api.get('/api/invoices'),
  getTopServices: () => api.get('/api/invoices/topServices'),
  getTopProducts: () => api.get('/api/invoices/topProducts'),
  getTodaySales: () => api.get('/api/invoices/sales/today'),
  getMonthSales: () => api.get('/api/invoices/sales/month'),
  getByNumber: (numero: string) => api.get(`/api/invoices/numero?numero=${numero}`),
  getById: (id: string) => api.get(`/api/invoices/getId?id=${id}`),
  getByStatus: (status: string) => api.get(`/api/invoices/estado?estado=${status}`),
  getByDateRange: (startDate: string, endDate: string) => 
    api.get(`/api/invoices/dateRange?startDate=${startDate}&endDate=${endDate}`),
  getTodayCount: () => api.get('/api/invoices/count/today'),
  getByClient: (clientId: string) => api.get(`/api/invoices/client?clientId=${clientId}`),
  getActive: () => api.get('/api/invoices/active'),
  create: (data: any) => api.post('/api/invoices/create', data),
  updateStatus: (data: any) => api.put('/api/invoices/updateStatus', data),
  cancel: (data: any) => api.put('/api/invoices/cancel', data),
  delete: (data: any) => api.delete('/api/invoices/deleteInvoice', { data }),
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

export default api;
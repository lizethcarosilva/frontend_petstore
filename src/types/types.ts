export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  name: string;
  ident?: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  rolId?: string;
  role?: string;
  activo?: boolean;
  created_on?: string;
}

export interface User {
  user_id?: string;
  ident?: string;
  name: string;
  direccion?: string;
  correo?: string;
  telefono?: string;
  rol_id: string;
  activo?: boolean;
  created_on?: string;
  updated_on?: string;
  tenantId?: string;
}

// Client - Nuevo modelo específico para clientes
export interface Client {
  clientId?: number;
  name: string;
  tipoId?: string; // CC, TI, CE, etc.
  ident: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  rolId?: string;
  createdOn?: string;
  activo?: boolean;
  tenantId?: string;
}

export interface ClientCreateDto {
  name: string;
  tipoId?: string;
  ident: string;
  correo: string;
  password: string;
  telefono?: string;
  direccion?: string;
}

export interface ClientResponseDto {
  clientId: number;
  name: string;
  tipoId?: string;
  ident: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  rolId?: string;
  createdOn: string;
  activo: boolean;
  tenantId: string;
}

export interface UpdateClientRequest {
  clientId: number;
  name: string;
  tipoId?: string;
  ident: string;
  correo: string;
  telefono?: string;
  direccion?: string;
}


export interface Tenant {
  tenantId?: string;
  razonSocial: string;
  nit: string;
  direccion: string;
  telefono: string;
  email: string;
  plan: string;
  activo?: boolean;
  configuracion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pet {
  petId?: number;
  nombre: string;
  tipo: string;
  raza: string;
  cuidadosEspeciales?: string;
  owners?: User[];
  activo?: boolean;
  createdOn?: string;
  updatedAt?: string;
  edad?: number;
  sexo?: string;
  color?: string;
}
export interface Service {
  serviceId?: number;
  id?: string; // Para compatibilidad
  codigo?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos?: number;
  activo?: boolean;
  createdOn?: string;
  createdAt?: string; // Para compatibilidad
  updatedAt?: string;
}

export interface Product {
  productId?: number;
  id?: string; // Para compatibilidad
  codigo?: string;
  nombre: string;
  descripcion: string;
  presentacion?: string;
  precio?: number; // Backend usa 'precio'
  precioVenta?: number; // Para compatibilidad
  stock: number;
  stockMinimo: number;
  fechaVencimiento?: string;
  lote?: string; // Número de lote
  fabricante?: string; // Fabricante o marca
  esVacuna?: boolean; // Indica si es una vacuna
  activo?: boolean;
  createdAt?: string;
  createdOn?: string;
  updatedAt?: string;
  lowStock?: boolean;
  nearExpiration?: boolean;
}

export interface Appointment {
  appointmentId?: number;
  id?: string; // Para compatibilidad
  petId?: number;
  mascotaId?: string; // Para compatibilidad
  petNombre?: string;
  serviceId?: number;
  serviceName?: string;
  clientId?: number; // Actualizado de userId a clientId
  clientName?: string; // Actualizado de userName a clientName
  userId?: number; // Mantener para compatibilidad
  usuarioId?: string; // Para compatibilidad
  userName?: string; // Para compatibilidad
  veterinarianId?: number;
  veterinarianName?: string;
  fechaHora?: string;
  fecha?: string; // Para compatibilidad
  hora?: string; // Para compatibilidad
  estado?: string;
  observaciones?: string;
  diagnostico?: string;
  activo?: boolean;
  createdOn?: string;
  createdAt?: string; // Para compatibilidad
  updatedAt?: string;
  mascota?: Pet;
  usuario?: User;
}

// DTO para crear citas (debe coincidir con el backend)
export interface AppointmentCreateDto {
  petId: number;
  serviceId: number;
  clientId: number; // Cambiado de userId a clientId
  veterinarianId?: number;
  fechaHora: string; // LocalDateTime en formato ISO
  observaciones?: string;
}

export interface Invoice {
  id?: string;
  numero: string;
  clienteId: string;
  empleadoId: string;
  fecha: string;
  subtotal: number;
  descuento: number;
  total: number;
  estado: string;
  cliente?: User;
  empleado?: User;
  detalles?: InvoiceDetail[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceDetail {
  id?: string;
  detailId?: number;
  facturaId?: string;
  tipo?: string; // PRODUCTO o SERVICIO
  productoId?: string;
  productId?: number;
  servicioId?: string;
  serviceId?: number;
  itemNombre?: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  producto?: Product;
  servicio?: Service;
}

// DTOs para coincidir con el backend
export interface InvoiceCreateDto {
  clientId: number;
  employeeId: number;
  appointmentId?: number;
  descuento: number;
  impuesto: number;
  observaciones?: string;
  details: InvoiceDetailCreateDto[];
}

export interface InvoiceDetailCreateDto {
  tipo: 'PRODUCTO' | 'SERVICIO';
  productId?: number;
  serviceId?: number;
  itemNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

export interface InvoiceResponseDto {
  invoiceId: number;
  numero: string;
  clientId: number;
  clientName: string;
  employeeId: number;
  employeeName: string;
  appointmentId?: number;
  fechaEmision: string;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  estado: string;
  observaciones?: string;
  activo: boolean;
  createdOn: string;
  details: InvoiceDetailDto[];
}

export interface InvoiceDetailDto {
  detailId: number;
  tipo: string;
  productId?: number;
  serviceId?: number;
  itemNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

// DTOs para carrito de compras
export interface AppointmentInvoiceDataDto {
  appointmentId: number;
  clientId: number;
  clientName: string;
  clientIdent: string;
  petId: number;
  petName: string;
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  estado: string;
}

export interface VaccinationInvoiceDataDto {
  vaccinationId: number;
  clientId: number;
  clientName: string;
  clientIdent: string;
  petId: number;
  petName: string;
  vaccineName: string;
  vaccineType: string;
  manufacturer?: string;
  batchNumber?: string;
  productId?: number;
  productName?: string;
  productPrice?: number;
  medicalHistoryId?: number;
}

// Item del carrito de compras
export interface CartItem {
  id: string; // ID único del item en el carrito
  tipo: 'PRODUCTO' | 'SERVICIO' | 'CITA' | 'VACUNACION';
  referenceId?: number; // ID de la cita, vacunación, etc.
  productId?: number;
  serviceId?: number;
  itemNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  metadata?: {
    petName?: string;
    petId?: number;
    appointmentId?: number;
    vaccinationId?: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  totalServices: number;
  todayAppointments: number;
  todaySales: number;
  monthSales: number;
  lowStockProducts: number;
  expiringSoonProducts: number;
}

export interface Role {
  rolId?: string;
  name?: string; // Para compatibilidad con código existente
  nombre?: string; // Nuevo campo del backend (RoleResponseDto)
  descripcion?: string;
  activo?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface MedicalHistory {
  historyId?: number;
  petId?: number;
  petNombre?: string;
  appointmentId?: number;
  serviceId?: number;
  serviceName?: string;
  veterinarianId?: number;
  veterinarianName?: string;
  fechaAtencion?: string;
  tipoProcedimiento?: string;
  diagnostico?: string;
  observaciones?: string;
  tratamiento?: string;
  pesoKg?: number;
  temperaturaC?: number;
  notasAdicionales?: string;
  activo?: boolean;
  createdOn?: string;
}

export interface Vaccination {
  vaccinationId?: number;
  petId?: number;
  petNombre?: string;
  medicalHistoryId?: number;
  veterinarianId?: number;
  veterinarianName?: string;
  vaccineName: string;
  vaccineType: string;
  manufacturer?: string;
  batchNumber?: string;
  applicationDate: string;
  nextDoseDate?: string;
  doseNumber?: number;
  applicationSite?: string;
  observations?: string;
  requiresBooster?: boolean;
  isCompleted?: boolean;
  activo?: boolean;
  createdOn?: string;
}

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
  id?: string;
  identificacionPropietario: string;
  nombre: string;
  tipo: string;
  raza: string;
  cuidadosEspeciales?: string;
  propietario?: User;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id?: string;
  codigo?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id?: string;
  codigo?: string;
  nombre: string;
  descripcion: string;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  fechaVencimiento?: string;
  lote?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  id?: string;
  mascotaId: string;
  usuarioId: string;
  fecha: string;
  hora: string;
  especialidad: string;
  estado: string;
  diagnostico?: string;
  observaciones?: string;
  mascota?: Pet;
  usuario?: User;
  createdAt?: string;
  updatedAt?: string;
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
  facturaId: string;
  productoId?: string;
  servicioId?: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  producto?: Product;
  servicio?: Service;
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

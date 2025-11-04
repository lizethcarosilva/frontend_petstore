import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  FileText,
  User,
  Printer,
  Download,
  X,
  ShoppingCart,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Heart
} from 'lucide-react';
import { invoiceAPI, productAPI, serviceAPI, userAPI, clientAPI, petAPI, appointmentAPI, vaccinationAPI } from '../services/api';
import type { 
  InvoiceResponseDto, 
  InvoiceCreateDto, 
  InvoiceDetailCreateDto,
  Product, 
  Service, 
  User as UserType,
  ClientResponseDto,
  Pet,
  Appointment,
  Vaccination
} from '../types/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import { useShoppingCart } from '../contexts/ShoppingCartContext';

const Invoices: React.FC = () => {
  // State management
  const [invoices, setInvoices] = useState<InvoiceResponseDto[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceResponseDto[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<ClientResponseDto[]>([]);
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientResponseDto | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<UserType | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [petAppointments, setPetAppointments] = useState<Appointment[]>([]);
  const [petVaccinations, setPetVaccinations] = useState<Vaccination[]>([]);
  const [selectedAppointments, setSelectedAppointments] = useState<number[]>([]);
  const [selectedVaccinations, setSelectedVaccinations] = useState<number[]>([]);
  // Rastrear las citas y vacunaciones que fueron agregadas a la factura actual
  const [invoicedAppointments, setInvoicedAppointments] = useState<number[]>([]);
  const [invoicedVaccinations, setInvoicedVaccinations] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponseDto | null>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  // Hook de paginación
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage
  } = usePagination({
    data: filteredInvoices,
    itemsPerPage: 10
  });
  const { cartItems, cartCount, clientId: cartClientId, clientName: cartClientName, clearCart } = useShoppingCart();
  
  // Form data
  const [formData, setFormData] = useState({
    clientId: 0,
    employeeId: 0,
    appointmentId: undefined as number | undefined,
    descuento: 0,
    impuesto: 19, // IVA por defecto
    observaciones: '',
  });

  const [saleDetails, setSaleDetails] = useState<InvoiceDetailCreateDto[]>([]);
  const [currentDetail, setCurrentDetail] = useState({
    tipo: 'PRODUCTO' as 'PRODUCTO' | 'SERVICIO',
    productId: undefined as number | undefined,
    serviceId: undefined as number | undefined,
    itemNombre: '',
    cantidad: 1,
    precioUnitario: 0,
    descuento: 0,
    subtotal: 0
  });

  const printRef = useRef<HTMLDivElement>(null);

  // Load data on mount
  useEffect(() => {
    loadInvoices();
    loadProducts();
    loadServices();
    loadUsers();
    loadPets();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm]);

  // Cargar items del carrito automáticamente cuando se abre el formulario
  useEffect(() => {
    if (showForm && cartItems.length > 0) {
      // Convertir items del carrito a detalles de factura
      const cartDetails: InvoiceDetailCreateDto[] = cartItems.map(item => ({
        tipo: item.tipo === 'CITA' || item.tipo === 'VACUNACION' ? 'SERVICIO' : item.tipo,
        productId: item.productId,
        serviceId: item.serviceId,
        itemNombre: item.itemNombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        descuento: item.descuento,
        subtotal: item.subtotal
      }));
      
      // Cargar items solo una vez
      setSaleDetails(prev => {
        if (prev.length === 0) {
          return cartDetails;
        }
        return prev;
      });
      
      // Pre-seleccionar cliente del carrito si existe
      if (cartClientId && !formData.clientId) {
        setFormData(prev => ({ ...prev, clientId: cartClientId }));
        const client = clients.find(c => c.clientId === cartClientId);
        if (client) {
          setSelectedClient(client);
        }
      }
    }
  }, [showForm]);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await invoiceAPI.getAll();
      console.log('Facturas cargadas:', response.data);
      setInvoices(response.data);
    } catch (error: any) {
      // Si es error 403, solo establecer array vacío sin mostrar error
      if (error.response?.status === 403) {
        console.warn('⚠️ Sin permisos para ver facturas. Debes actualizar InvoiceController en el backend.');
        setInvoices([]);
      } else {
        console.error('Error loading invoices:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      console.log('Productos cargados:', response.data);
      console.log('Cantidad de productos:', response.data.length);
      
      // Mostrar TODOS los productos activos (sin filtrar por stock para permitir venta)
      const availableProducts = response.data.filter((p: Product) => 
        p.activo !== false
      );
      
      console.log('Productos disponibles (activos):', availableProducts);
      console.log('Productos completos:', response.data);
      setProducts(availableProducts);
    } catch (error: any) {
      console.error('Error loading products:', error);
      console.error('Status:', error.response?.status);
    }
  };

  const loadServices = async () => {
    try {
      const response = await serviceAPI.getAll();
      console.log('Servicios cargados:', response.data);
      console.log('Cantidad de servicios:', response.data.length);
      
      // Filtrar solo servicios activos
      const availableServices = response.data.filter((s: Service) => 
        s.activo !== false
      );
      
      console.log('Servicios disponibles (activos):', availableServices);
      setServices(availableServices);
    } catch (error: any) {
      console.error('Error loading services:', error);
      console.error('Status:', error.response?.status);
    }
  };

  const loadUsers = async () => {
    try {
      // Cargar CLIENTES desde el nuevo endpoint /api/clients
      const clientsResponse = await clientAPI.getAll();
      console.log('✅ Clientes cargados desde API:', clientsResponse.data);
      console.log('✅ Total clientes:', clientsResponse.data.length);
      setClients(clientsResponse.data);
      
      // Cargar EMPLEADOS desde /api/users filtrando por rol
      const usersResponse = await userAPI.getAll();
      const allUsers = usersResponse.data;
      
      // Empleados: Admin (rol_id = 2) + Veterinarios (rol_id = 3)
      const employeesList = allUsers.filter((user: UserType) => {
        const rolId = user.rol_id?.toString();
        return rolId === '2' || rolId === '3';
      });
      
      console.log('✅ Empleados filtrados:', employeesList);
      console.log('✅ Total empleados encontrados:', employeesList.length);
      setEmployees(employeesList);
      
    } catch (error) {
      console.error('❌ Error loading users/clients:', error);
    }
  };

  const loadPets = async () => {
    try {
      const response = await petAPI.getAll();
      setPets(response.data);
      console.log('Mascotas cargadas:', response.data);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const loadPetServices = async (petId: number) => {
    try {
      // Cargar citas de la mascota
      const appointmentsResponse = await appointmentAPI.getByPet(petId);
      const completedAppointments = appointmentsResponse.data.filter((apt: Appointment) => {
        const estado = apt.estado?.toUpperCase() || '';
        return estado === 'COMPLETADA' || estado === 'COMPLETADO';
      });
      setPetAppointments(completedAppointments);
      console.log('Citas completadas de la mascota:', completedAppointments);

      // Cargar vacunaciones de la mascota
      const vaccinationsResponse = await vaccinationAPI.getByPet(petId);
      const completedVaccinations = vaccinationsResponse.data.filter((vac: Vaccination) => 
        vac.isCompleted === true
      );
      setPetVaccinations(completedVaccinations);
      console.log('Vacunaciones completadas de la mascota:', completedVaccinations);
    } catch (error) {
      console.error('Error loading pet services:', error);
    }
  };

  const filterInvoices = () => {
    const filtered = invoices.filter(invoice =>
      invoice.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Si se selecciona un cliente, guardar sus datos completos
    if (name === 'clientId') {
      const clientId = parseInt(value) || 0;
      const client = clients.find(c => c.clientId === clientId);
      setSelectedClient(client || null);
      
      // Verificar si este cliente tiene items en el carrito
      if (clientId && cartClientId && clientId === cartClientId && cartItems.length > 0) {
        // Mostrar notificación de que hay items esperando
        setTimeout(() => {
          alert(`Este cliente tiene ${cartCount} item${cartCount !== 1 ? 's' : ''} en el carrito que se agregarán automáticamente`);
        }, 100);
      }
    }
    
    // Si se selecciona un empleado, guardar sus datos completos
    if (name === 'employeeId') {
      const employee = employees.find(e => e.user_id === value);
      setSelectedEmployee(employee || null);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'clientId' || name === 'employeeId' || name === 'appointmentId' 
        ? parseInt(value) || 0 
        : name === 'descuento' || name === 'impuesto'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setCurrentDetail(prev => {
      const updated = { ...prev, [name]: value };
      
      // Actualizar precio unitario si se selecciona un producto o servicio
      if (name === 'productId' || name === 'serviceId') {
        const id = parseInt(value);
        if (name === 'productId' && id && !isNaN(id)) {
          const product = products.find(p => p.productId === id);
          if (product) {
            updated.itemNombre = product.nombre;
            updated.precioUnitario = product.precioVenta || product.precio || 0;
            updated.productId = id;
            updated.serviceId = undefined;
            updated.tipo = 'PRODUCTO';
          }
        } else if (name === 'serviceId' && id && !isNaN(id)) {
          const service = services.find(s => s.serviceId === id);
          if (service) {
            updated.itemNombre = service.nombre;
            updated.precioUnitario = service.precio;
            updated.serviceId = id;
            updated.productId = undefined;
            updated.tipo = 'SERVICIO';
          }
        }
      }
      
      // Calcular subtotal
      if (name === 'cantidad' || name === 'descuento' || name === 'productId' || name === 'serviceId') {
        const cantidad = name === 'cantidad' ? parseInt(value) || 1 : updated.cantidad;
        const descuento = name === 'descuento' ? parseFloat(value) || 0 : updated.descuento;
        const subtotal = cantidad * updated.precioUnitario;
        const descuentoAmount = subtotal * (descuento / 100);
        updated.subtotal = subtotal - descuentoAmount;
        updated.cantidad = cantidad;
        updated.descuento = descuento;
      }
      
      return updated;
    });
  };

  const handlePetChange = async (petId: string) => {
    if (petId) {
      const pet = pets.find(p => p.petId?.toString() === petId);
      setSelectedPet(pet || null);
      await loadPetServices(parseInt(petId));
    } else {
      setSelectedPet(null);
      setPetAppointments([]);
      setPetVaccinations([]);
      setSelectedAppointments([]);
      setSelectedVaccinations([]);
    }
  };

  const handleToggleAppointment = (appointmentId: number) => {
    setSelectedAppointments(prev => 
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const handleToggleVaccination = (vaccinationId: number) => {
    setSelectedVaccinations(prev => 
      prev.includes(vaccinationId)
        ? prev.filter(id => id !== vaccinationId)
        : [...prev, vaccinationId]
    );
  };

  const handleAddSelectedServices = async () => {
    const newDetails: InvoiceDetailCreateDto[] = [];

    // Agregar citas seleccionadas
    for (const aptId of selectedAppointments) {
      try {
        const response = await appointmentAPI.getForInvoice(aptId);
        const data = response.data;
        newDetails.push({
          tipo: 'SERVICIO',
          serviceId: data.serviceId,
          itemNombre: `${data.serviceName} - Mascota: ${data.petName}`,
          cantidad: 1,
          precioUnitario: data.servicePrice,
          descuento: 0,
          subtotal: data.servicePrice
        });
      } catch (error) {
        console.error('Error loading appointment data:', error);
      }
    }

    // Agregar vacunaciones seleccionadas
    for (const vacId of selectedVaccinations) {
      try {
        const response = await vaccinationAPI.getForInvoice(vacId);
        const data = response.data;
        const itemName = data.productName 
          ? `${data.productName} (Vacuna: ${data.vaccineName}) - Mascota: ${data.petName}`
          : `Vacuna: ${data.vaccineName} - Mascota: ${data.petName}`;
        
        newDetails.push({
          tipo: data.productId ? 'PRODUCTO' : 'SERVICIO',
          productId: data.productId,
          itemNombre: itemName,
          cantidad: 1,
          precioUnitario: data.productPrice || 0,
          descuento: 0,
          subtotal: data.productPrice || 0
        });
      } catch (error) {
        console.error('Error loading vaccination data:', error);
      }
    }

    setSaleDetails(prev => [...prev, ...newDetails]);
    
    // Guardar los IDs para marcarlos como facturados después
    setInvoicedAppointments(prev => [...prev, ...selectedAppointments]);
    setInvoicedVaccinations(prev => [...prev, ...selectedVaccinations]);
    
    setSelectedAppointments([]);
    setSelectedVaccinations([]);
    alert(`${newDetails.length} servicio(s) agregado(s) a la factura`);
  };

  const handleAddDetail = () => {
    if ((currentDetail.productId || currentDetail.serviceId) && currentDetail.cantidad > 0) {
      setSaleDetails(prev => [...prev, { ...currentDetail }]);
      setCurrentDetail({
        tipo: 'PRODUCTO',
        productId: undefined,
        serviceId: undefined,
        itemNombre: '',
        cantidad: 1,
        precioUnitario: 0,
        descuento: 0,
        subtotal: 0
      });
    }
  };

  const handleRemoveDetail = (index: number) => {
    setSaleDetails(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = saleDetails.reduce((sum, detail) => sum + detail.subtotal, 0);
    const descuentoTotal = subtotal * (formData.descuento / 100);
    const subtotalConDescuento = subtotal - descuentoTotal;
    const impuestoTotal = subtotalConDescuento * (formData.impuesto / 100);
    const total = subtotalConDescuento + impuestoTotal;
    
    return { subtotal, descuentoTotal, impuestoTotal, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saleDetails.length === 0) {
      alert('Debe agregar al menos un producto o servicio');
      return;
    }

    if (!formData.clientId || !formData.employeeId) {
      alert('Debe seleccionar un cliente y un empleado');
      return;
    }

    try {
      // Asegurar que los detalles tengan el formato correcto
      const formattedDetails = saleDetails.map(detail => ({
        tipo: detail.tipo,
        productId: detail.productId || undefined,
        serviceId: detail.serviceId || undefined,
        itemNombre: detail.itemNombre,
        cantidad: Number(detail.cantidad),
        precioUnitario: Number(detail.precioUnitario),
        descuento: Number(detail.descuento),
        subtotal: Number(detail.subtotal)
      }));

      const invoiceData: InvoiceCreateDto = {
        clientId: Number(formData.clientId),
        employeeId: Number(formData.employeeId),
        appointmentId: formData.appointmentId ? Number(formData.appointmentId) : undefined,
        descuento: Number(formData.descuento),
        impuesto: Number(formData.impuesto),
        observaciones: formData.observaciones || '',
        details: formattedDetails
      };
      
      console.log('Enviando datos de factura:', invoiceData);
      
      const response = await invoiceAPI.create(invoiceData);
      
      console.log('✅ Factura creada exitosamente:', response.data);
      
      // Marcar citas como facturadas
      if (invoicedAppointments.length > 0) {
        console.log('📋 Marcando citas como facturadas:', invoicedAppointments);
        for (const aptId of invoicedAppointments) {
          try {
            await appointmentAPI.markAsInvoiced(aptId);
            console.log(`✅ Cita ${aptId} marcada como facturada`);
          } catch (error) {
            console.error(`❌ Error marcando cita ${aptId} como facturada:`, error);
          }
        }
      }
      
      // Marcar vacunaciones como facturadas
      if (invoicedVaccinations.length > 0) {
        console.log('💉 Marcando vacunaciones como facturadas:', invoicedVaccinations);
        for (const vacId of invoicedVaccinations) {
          try {
            console.log(`🔵 Llamando a vaccinationAPI.markAsInvoiced(${vacId})`);
            const response = await vaccinationAPI.markAsInvoiced(vacId);
            console.log(`✅ Vacunación ${vacId} marcada como facturada. Respuesta:`, response.data);
          } catch (error: any) {
            console.error(`❌ Error marcando vacunación ${vacId} como facturada:`, error);
            console.error(`❌ Error completo:`, error.response?.data);
            console.error(`❌ Status:`, error.response?.status);
            console.error(`❌ URL:`, error.config?.url);
          }
        }
      }
      
      // Limpiar el carrito después de crear la factura exitosamente
      clearCart();
      
      // Mostrar la factura creada
      setSelectedInvoice(response.data);
      setShowInvoicePreview(true);
      
      await loadInvoices();
      resetForm();
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      let errorMessage = 'Error al crear la factura';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleCancelInvoice = async (invoiceId: number) => {
    if (window.confirm('¿Está seguro de que desea anular esta factura? Se devolverá el stock.')) {
      try {
        await invoiceAPI.cancel(invoiceId);
        await loadInvoices();
      } catch (error) {
        console.error('Error canceling invoice:', error);
      }
    }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta factura?')) {
      try {
        await invoiceAPI.delete(invoiceId);
        await loadInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: 0,
      employeeId: 0,
      appointmentId: undefined,
      descuento: 0,
      impuesto: 19,
      observaciones: '',
    });
    setSaleDetails([]);
    setCurrentDetail({
      tipo: 'PRODUCTO',
      productId: undefined,
      serviceId: undefined,
      itemNombre: '',
      cantidad: 1,
      precioUnitario: 0,
      descuento: 0,
      subtotal: 0
    });
    setSelectedClient(null);
    setSelectedEmployee(null);
    setSelectedPet(null);
    setPetAppointments([]);
    setPetVaccinations([]);
    setSelectedAppointments([]);
    setSelectedVaccinations([]);
    // Limpiar las citas y vacunaciones que fueron facturadas
    setInvoicedAppointments([]);
    setInvoicedVaccinations([]);
    setShowForm(false);
  };

  // Función auxiliar para obtener datos del cliente
  const getClientInfo = async (clientId: number): Promise<ClientResponseDto | null> => {
    try {
      const client = clients.find(c => c.clientId === clientId);
      if (client) return client;
      
      // Si no está en el cache, consultar al backend
      const response = await clientAPI.getById(clientId);
      return response.data;
    } catch (error) {
      console.error('Error getting client info:', error);
      return null;
    }
  };

  // Función para generar PDF
  const generatePDF = async (invoice: InvoiceResponseDto) => {
    const doc = new jsPDF();
    
    // Obtener información completa del cliente
    const clientInfo = await getClientInfo(invoice.clientId);
    
    // Encabezado
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA DE VENTA', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('PetStore - Sistema de Gestión Veterinaria', 105, 28, { align: 'center' });
    
    // Información de la factura
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Factura No: ${invoice.numero}`, 20, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date(invoice.fechaEmision).toLocaleString('es-CO')}`, 20, 52);
    doc.text(`Estado: ${invoice.estado}`, 20, 59);
    
    // Información del cliente (más completa)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL CLIENTE', 20, 72);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${invoice.clientName}`, 20, 79);
    
    if (clientInfo) {
      if (clientInfo.ident) {
        doc.text(`Documento: ${clientInfo.ident}`, 20, 86);
      }
      if (clientInfo.correo) {
        doc.text(`Email: ${clientInfo.correo}`, 20, 93);
      }
      if (clientInfo.telefono) {
        doc.text(`Teléfono: ${clientInfo.telefono}`, 20, 100);
      }
      if (clientInfo.direccion) {
        doc.text(`Dirección: ${clientInfo.direccion}`, 20, 107);
      }
    }
    
    // Información del empleado
    doc.setFont('helvetica', 'bold');
    doc.text('Atendido por:', 120, 79);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.employeeName, 120, 86);
    
    // Tabla de detalles
    const tableData = invoice.details.map(detail => [
      detail.tipo,
      detail.itemNombre,
      detail.cantidad.toString(),
      formatCurrency(detail.precioUnitario),
      `${detail.descuento}%`,
      formatCurrency(detail.subtotal)
    ]);
    
    const startY = clientInfo ? 115 : 95;
    
    autoTable(doc, {
      startY: startY,
      head: [['Tipo', 'Descripción', 'Cantidad', 'Precio Unit.', 'Desc.', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 }
    });
    
    // Totales
    const finalY = (doc as any).lastAutoTable.finalY || 85;
    const totalsStartY = finalY + 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 120, totalsStartY);
    doc.text(formatCurrency(invoice.subtotal), 180, totalsStartY, { align: 'right' });
    
    doc.text(`Descuento (${invoice.descuento}%):`, 120, totalsStartY + 7);
    doc.text(formatCurrency(invoice.subtotal * (invoice.descuento / 100)), 180, totalsStartY + 7, { align: 'right' });
    
    doc.text(`Impuesto (${invoice.impuesto}%):`, 120, totalsStartY + 14);
    doc.text(formatCurrency((invoice.subtotal - (invoice.subtotal * invoice.descuento / 100)) * (invoice.impuesto / 100)), 180, totalsStartY + 14, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Total:', 120, totalsStartY + 24);
    doc.text(formatCurrency(invoice.total), 180, totalsStartY + 24, { align: 'right' });
    
    // Observaciones
    if (invoice.observaciones) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Observaciones:', 20, totalsStartY + 35);
      doc.text(invoice.observaciones, 20, totalsStartY + 42, { maxWidth: 170 });
    }
    
    // Pie de página
    doc.setFontSize(8);
    doc.text('Gracias por su compra', 105, 280, { align: 'center' });
    
    // Descargar PDF
    doc.save(`Factura_${invoice.numero}.pdf`);
  };

  // Función para imprimir en POS
  const printPOS = async (invoice: InvoiceResponseDto) => {
    // Obtener información completa del cliente
    const clientInfo = await getClientInfo(invoice.clientId);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita las ventanas emergentes para imprimir');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura ${invoice.numero}</title>
        <style>
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 80mm;
            margin: 0 auto;
            padding: 5mm;
          }
          
          .center {
            text-align: center;
          }
          
          .bold {
            font-weight: bold;
          }
          
          .header {
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          
          .info {
            margin: 5px 0;
          }
          
          .line {
            border-bottom: 1px dashed #000;
            margin: 10px 0;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }
          
          th, td {
            text-align: left;
            padding: 3px 0;
          }
          
          th {
            border-bottom: 1px solid #000;
            border-top: 1px solid #000;
          }
          
          .totals {
            margin-top: 10px;
            border-top: 1px dashed #000;
            padding-top: 10px;
          }
          
          .total-line {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          
          .grand-total {
            font-size: 14px;
            font-weight: bold;
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 5px;
          }
          
          .footer {
            margin-top: 10px;
            border-top: 1px dashed #000;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header center">
          <div class="bold" style="font-size: 16px;">PETSTORE</div>
          <div>Sistema de Gestión Veterinaria</div>
          <div class="line"></div>
          <div class="bold">FACTURA DE VENTA</div>
          <div>No. ${invoice.numero}</div>
        </div>
        
        <div class="info">
          <div><span class="bold">Fecha:</span> ${new Date(invoice.fechaEmision).toLocaleString('es-CO')}</div>
          <div class="line"></div>
          <div style="margin-top: 5px;"><span class="bold">CLIENTE</span></div>
          <div><span class="bold">Nombre:</span> ${invoice.clientName}</div>
          ${clientInfo && clientInfo.ident ? `<div><span class="bold">Doc:</span> ${clientInfo.ident}</div>` : ''}
          ${clientInfo && clientInfo.telefono ? `<div><span class="bold">Tel:</span> ${clientInfo.telefono}</div>` : ''}
          ${clientInfo && clientInfo.correo ? `<div><span class="bold">Email:</span> ${clientInfo.correo}</div>` : ''}
          ${clientInfo && clientInfo.direccion ? `<div><span class="bold">Dir:</span> ${clientInfo.direccion}</div>` : ''}
          <div style="margin-top: 5px;"><span class="bold">Atendió:</span> ${invoice.employeeName}</div>
        </div>
        
        <div class="line"></div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: right;">Cant</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.details.map(detail => `
              <tr>
                <td colspan="3">${detail.itemNombre}</td>
              </tr>
              <tr>
                <td>${formatCurrency(detail.precioUnitario)}</td>
                <td style="text-align: right;">${detail.cantidad}</td>
                <td style="text-align: right;">${formatCurrency(detail.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>${formatCurrency(invoice.subtotal)}</span>
          </div>
          <div class="total-line">
            <span>Descuento (${invoice.descuento}%):</span>
            <span>-${formatCurrency(invoice.subtotal * (invoice.descuento / 100))}</span>
          </div>
          <div class="total-line">
            <span>Impuesto (${invoice.impuesto}%):</span>
            <span>${formatCurrency((invoice.subtotal - (invoice.subtotal * invoice.descuento / 100)) * (invoice.impuesto / 100))}</span>
          </div>
          <div class="total-line grand-total">
            <span>TOTAL:</span>
            <span>${formatCurrency(invoice.total)}</span>
          </div>
        </div>
        
        ${invoice.observaciones ? `
          <div class="line"></div>
          <div><span class="bold">Observaciones:</span></div>
          <div>${invoice.observaciones}</div>
        ` : ''}
        
        <div class="footer center">
          <div>¡Gracias por su compra!</div>
          <div style="margin-top: 5px; font-size: 10px;">Estado: ${invoice.estado}</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    
    // Esperar a que se cargue el contenido antes de imprimir
    printWindow.onload = () => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 100);
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (estado: string) => {
    switch (estado.toUpperCase()) {
      case 'PAGADA':
        return 'bg-green-100 text-green-800';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELADA':
      case 'ANULADA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totals = calculateTotals();

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
            <p className="text-sm text-gray-600 mt-1">Gestión de facturas de productos y servicios</p>
          </div>
          <div className="flex items-center space-x-3">
            {cartCount > 0 && !showForm && (
              <div className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-md">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">{cartCount} item{cartCount !== 1 ? 's' : ''} en carrito</span>
              </div>
            )}
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{showForm ? 'Cancelar' : 'Nueva Factura'}</span>
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="border-t pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Client & Employee Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Información General</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Seleccione un cliente</option>
                    {clients.map(client => (
                      <option key={client.clientId} value={client.clientId}>
                        {client.name} - {client.ident}
                      </option>
                    ))}
                  </select>
                  {/* Mostrar datos del cliente seleccionado */}
                  {selectedClient && (
                    <div className="mt-2 space-y-2">
                      <div className="p-3 bg-gray-50 rounded-md text-sm space-y-1">
                        <div className="font-semibold text-gray-900">{selectedClient.name}</div>
                        {selectedClient.ident && (
                          <div className="text-gray-600">
                            <span className="font-medium">Documento:</span> {selectedClient.ident}
                          </div>
                        )}
                        {selectedClient.correo && (
                          <div className="text-gray-600">
                            <span className="font-medium">Email:</span> {selectedClient.correo}
                          </div>
                        )}
                        {selectedClient.telefono && (
                          <div className="text-gray-600">
                            <span className="font-medium">Teléfono:</span> {selectedClient.telefono}
                          </div>
                        )}
                        {selectedClient.direccion && (
                          <div className="text-gray-600">
                            <span className="font-medium">Dirección:</span> {selectedClient.direccion}
                          </div>
                        )}
                      </div>
                      
                      {/* Notificación si el cliente tiene items en carrito */}
                      {formData.clientId === cartClientId && cartItems.length > 0 && (
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-md text-sm">
                          <div className="flex items-center space-x-2 text-purple-800">
                            <ShoppingCart className="h-4 w-4" />
                            <span className="font-semibold">
                              Este cliente tiene {cartCount} item{cartCount !== 1 ? 's' : ''} pendiente{cartCount !== 1 ? 's' : ''} de facturación
                            </span>
                          </div>
                          <div className="mt-1 text-purple-600 text-xs">
                            Los items se han agregado automáticamente a la factura
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empleado <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Seleccione un empleado</option>
                    {employees.map(employee => (
                      <option key={employee.user_id} value={employee.user_id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descuento General (%)
                  </label>
                  <input
                    type="number"
                    name="descuento"
                    value={formData.descuento}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Impuesto (%)
                  </label>
                  <input
                    type="number"
                    name="impuesto"
                    value={formData.impuesto}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Totals Summary */}
                <div className="bg-green-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-gray-900">Resumen</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Descuento:</span>
                      <span className="font-medium">-{formatCurrency(totals.descuentoTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impuesto:</span>
                      <span className="font-medium">{formatCurrency(totals.impuestoTotal)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saleDetails.length === 0}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  <CheckCircle className="inline h-5 w-5 mr-2" />
                  Generar Factura
                </button>
              </div>

              {/* Right Column - Product/Service Selection */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Agregar Items a la Factura</h3>
                
                {/* Sección: Servicios de Mascota */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-purple-900 flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Servicios de Mascota (Citas y Vacunas)
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seleccionar Mascota
                    </label>
                    <select
                      value={selectedPet?.petId || ''}
                      onChange={(e) => handlePetChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Seleccione una mascota...</option>
                      {pets.map(pet => (
                        <option key={pet.petId} value={pet.petId}>
                          {pet.nombre} - {pet.tipo} ({pet.raza})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPet && (petAppointments.length > 0 || petVaccinations.length > 0) && (
                    <div className="space-y-3">
                      {/* Citas Completadas */}
                      {petAppointments.length > 0 && (
                        <div className="bg-white rounded-md p-3">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">
                            Citas Completadas ({petAppointments.length})
                          </h5>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {petAppointments.map(apt => (
                              <label key={apt.appointmentId} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedAppointments.includes(apt.appointmentId!)}
                                  onChange={() => handleToggleAppointment(apt.appointmentId!)}
                                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <div className="flex-1 text-sm">
                                  <div className="font-medium text-gray-900">{apt.serviceName}</div>
                                  <div className="text-xs text-gray-600">
                                    {apt.fechaHora && new Date(apt.fechaHora).toLocaleString('es-CO')}
                                  </div>
                                  <div className="text-xs text-purple-600">
                                    Atendió: {apt.veterinarianName}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vacunaciones Completadas */}
                      {petVaccinations.length > 0 && (
                        <div className="bg-white rounded-md p-3">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">
                            Vacunaciones Completadas ({petVaccinations.length})
                          </h5>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {petVaccinations.map(vac => (
                              <label key={vac.vaccinationId} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedVaccinations.includes(vac.vaccinationId!)}
                                  onChange={() => handleToggleVaccination(vac.vaccinationId!)}
                                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <div className="flex-1 text-sm">
                                  <div className="font-medium text-gray-900">{vac.vaccineName}</div>
                                  <div className="text-xs text-gray-600">
                                    {vac.applicationDate && new Date(vac.applicationDate).toLocaleDateString('es-CO')}
                                  </div>
                                  {vac.manufacturer && (
                                    <div className="text-xs text-gray-500">
                                      {vac.manufacturer} - Lote: {vac.batchNumber}
                                    </div>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleAddSelectedServices}
                        disabled={selectedAppointments.length === 0 && selectedVaccinations.length === 0}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>
                          Agregar Seleccionados ({selectedAppointments.length + selectedVaccinations.length})
                        </span>
                      </button>
                    </div>
                  )}

                  {selectedPet && petAppointments.length === 0 && petVaccinations.length === 0 && (
                    <div className="text-center py-4 text-sm text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      Esta mascota no tiene citas o vacunaciones completadas pendientes de facturación
                    </div>
                  )}
                </div>
                
                {/* Sección: Productos y Servicios Manuales */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Agregar Productos/Servicios Adicionales
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        name="tipo"
                        value={currentDetail.tipo}
                        onChange={handleDetailChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="PRODUCTO">Producto</option>
                        <option value="SERVICIO">Servicio</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {currentDetail.tipo === 'PRODUCTO' ? 'Producto' : 'Servicio'}
                      </label>
                      {currentDetail.tipo === 'PRODUCTO' ? (
                        <select
                          name="productId"
                          value={currentDetail.productId || ''}
                          onChange={handleDetailChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Seleccione un producto...</option>
                          {products.length === 0 ? (
                            <option value="" disabled>No hay productos disponibles</option>
                          ) : (
                            products.map(product => (
                              <option key={product.productId} value={product.productId}>
                                {product.nombre} - {formatCurrency(product.precioVenta || product.precio || 0)} 
                                {product.stock !== undefined && ` (Stock: ${product.stock})`}
                              </option>
                            ))
                          )}
                        </select>
                      ) : (
                        <select
                          name="serviceId"
                          value={currentDetail.serviceId || ''}
                          onChange={handleDetailChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Seleccione un servicio...</option>
                          {services.length === 0 ? (
                            <option value="" disabled>No hay servicios disponibles</option>
                          ) : (
                            services.map(service => (
                              <option key={service.serviceId} value={service.serviceId}>
                                {service.nombre} - {formatCurrency(service.precio)}
                              </option>
                            ))
                          )}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        name="cantidad"
                        value={currentDetail.cantidad}
                        onChange={handleDetailChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descuento (%)
                      </label>
                      <input
                        type="number"
                        name="descuento"
                        value={currentDetail.descuento}
                        onChange={handleDetailChange}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold text-gray-900">
                      Subtotal: {formatCurrency(currentDetail.subtotal)}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddDetail}
                      disabled={!currentDetail.productId && !currentDetail.serviceId}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Items Agregados ({saleDetails.length})</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cant.</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">P. Unit.</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Desc.</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {saleDetails.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                              <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                              No hay items agregados
                            </td>
                          </tr>
                        ) : (
                          saleDetails.map((detail, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  detail.tipo === 'PRODUCTO' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {detail.tipo}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{detail.itemNombre}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{detail.cantidad}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(detail.precioUnitario)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{detail.descuento}%</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(detail.subtotal)}</td>
                              <td className="px-4 py-3 text-sm">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDetail(index)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Facturas Registradas</h2>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número, estado o cliente"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
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
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      No hay facturas registradas
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((invoice) => (
                    <tr key={invoice.invoiceId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900">{invoice.numero}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(invoice.fechaEmision).toLocaleDateString('es-CO')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{invoice.clientName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.employeeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.estado)}`}>
                          {invoice.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowInvoicePreview(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => generatePDF(invoice)}
                          className="text-green-600 hover:text-green-900"
                          title="Descargar PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => printPOS(invoice)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Imprimir POS"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        {invoice.estado.toUpperCase() !== 'CANCELADA' && invoice.estado.toUpperCase() !== 'ANULADA' && (
                          <button
                            onClick={() => handleCancelInvoice(invoice.invoiceId)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Anular factura"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteInvoice(invoice.invoiceId)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredInvoices.length}
            itemsPerPage={10}
            onPageChange={goToPage}
            itemName="facturas"
          />
        </div>
      </div>

      {/* Invoice Preview Modal */}
      {showInvoicePreview && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Factura {selectedInvoice.numero}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Fecha: {new Date(selectedInvoice.fechaEmision).toLocaleString('es-CO')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowInvoicePreview(false);
                    setSelectedInvoice(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Información del Cliente</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Nombre:</span>
                      <span className="text-gray-900 ml-2">{selectedInvoice.clientName}</span>
                    </div>
                    {(() => {
                      const client = clients.find(c => c.clientId === selectedInvoice.clientId);
                      if (!client) return null;
                      return (
                        <>
                          {client.ident && (
                            <div>
                              <span className="font-medium text-gray-700">Documento:</span>
                              <span className="text-gray-900 ml-2">{client.ident}</span>
                            </div>
                          )}
                          {client.correo && (
                            <div>
                              <span className="font-medium text-gray-700">Email:</span>
                              <span className="text-gray-900 ml-2">{client.correo}</span>
                            </div>
                          )}
                          {client.telefono && (
                            <div>
                              <span className="font-medium text-gray-700">Teléfono:</span>
                              <span className="text-gray-900 ml-2">{client.telefono}</span>
                            </div>
                          )}
                          {client.direccion && (
                            <div>
                              <span className="font-medium text-gray-700">Dirección:</span>
                              <span className="text-gray-900 ml-2">{client.direccion}</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Atendido por</h3>
                  <p className="text-gray-900">{selectedInvoice.employeeName}</p>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Detalles</h3>
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cant.</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">P. Unit.</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Desc.</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedInvoice.details.map((detail, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            detail.tipo === 'PRODUCTO' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {detail.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{detail.itemNombre}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{detail.cantidad}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(detail.precioUnitario)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{detail.descuento}%</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{formatCurrency(detail.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Descuento ({selectedInvoice.descuento}%):</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(selectedInvoice.subtotal * (selectedInvoice.descuento / 100))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Impuesto ({selectedInvoice.impuesto}%):</span>
                  <span className="font-medium">
                    {formatCurrency((selectedInvoice.subtotal - (selectedInvoice.subtotal * selectedInvoice.descuento / 100)) * (selectedInvoice.impuesto / 100))}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>

              {selectedInvoice.observaciones && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Observaciones</h3>
                  <p className="text-gray-900">{selectedInvoice.observaciones}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInvoice.estado)}`}>
                  Estado: {selectedInvoice.estado}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => generatePDF(selectedInvoice)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 inline-flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Descargar PDF</span>
                  </button>
                  <button
                    onClick={() => printPOS(selectedInvoice)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 inline-flex items-center space-x-2"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Imprimir POS</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;

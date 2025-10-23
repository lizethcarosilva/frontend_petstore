import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  FileText,
  DollarSign,
  User,
  Package,
  ShoppingCart,
  Calculator,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { invoiceAPI, productAPI, serviceAPI, userAPI } from '../services/api';
import type { Invoice, InvoiceDetail, Product, Service, User as UserType } from '../types/types';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<UserType[]>([]);
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [currentSale, setCurrentSale] = useState(1);
  const [activeTab, setActiveTab] = useState<'products' | 'payment' | 'invoice'>('products');
  const [formData, setFormData] = useState({
    clienteId: '',
    empleadoId: '',
    fecha: new Date().toISOString().split('T')[0],
    subtotal: 0,
    descuento: 0,
    total: 0,
    estado: 'Pendiente'
  });
  const [saleDetails, setSaleDetails] = useState<InvoiceDetail[]>([]);
  const [currentDetail, setCurrentDetail] = useState({
    productoId: '',
    servicioId: '',
    cantidad: 1,
    precioUnitario: 0,
    descuento: 0,
    subtotal: 0
  });

  useEffect(() => {
    loadInvoices();
    loadProducts();
    loadServices();
    loadUsers();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm]);

  useEffect(() => {
    calculateTotal();
  }, [saleDetails, formData.descuento]);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await invoiceAPI.getAll();
      setInvoices(response.data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
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
      setClients(response.data.filter((user: UserType) => user.rol === 'Propietario'));
      setEmployees(response.data.filter((user: UserType) => user.rol === 'Empleado' || user.rol === 'Veterinario'));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const filterInvoices = () => {
    const filtered = invoices.filter(invoice =>
      invoice.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(filtered);
  };

  const calculateTotal = () => {
    const subtotal = saleDetails.reduce((sum, detail) => sum + detail.subtotal, 0);
    const descuentoTotal = subtotal * (formData.descuento / 100);
    const total = subtotal - descuentoTotal;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      total
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setCurrentDetail(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Calculate subtotal
      if (name === 'cantidad' || name === 'precioUnitario' || name === 'descuento') {
        const subtotal = updated.cantidad * updated.precioUnitario;
        const descuentoAmount = subtotal * (updated.descuento / 100);
        updated.subtotal = subtotal - descuentoAmount;
      }
      
      return updated;
    });
  };

  const handleAddProduct = () => {
    if (currentDetail.productoId || currentDetail.servicioId) {
      const product = products.find(p => p.id === currentDetail.productoId);
      const service = services.find(s => s.id === currentDetail.servicioId);
      
      const newDetail: InvoiceDetail = {
        ...currentDetail,
        precioUnitario: product ? product.precioVenta : service ? service.precio : currentDetail.precioUnitario,
        subtotal: currentDetail.cantidad * (product ? product.precioVenta : service ? service.precio : currentDetail.precioUnitario)
      };
      
      setSaleDetails(prev => [...prev, newDetail]);
      setCurrentDetail({
        productoId: '',
        servicioId: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...formData,
        detalles: saleDetails
      };
      
      if (editingInvoice) {
        await invoiceAPI.update({ ...invoiceData, id: editingInvoice.id });
      } else {
        await invoiceAPI.create(invoiceData);
      }
      await loadInvoices();
      resetForm();
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      clienteId: invoice.clienteId,
      empleadoId: invoice.empleadoId,
      fecha: invoice.fecha,
      subtotal: invoice.subtotal,
      descuento: invoice.descuento,
      total: invoice.total,
      estado: invoice.estado
    });
    setSaleDetails(invoice.detalles || []);
    setShowForm(true);
  };

  const handleDelete = async (invoice: Invoice) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta factura?')) {
      try {
        await invoiceAPI.delete({ id: invoice.id });
        await loadInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleCancelInvoice = async (invoice: Invoice) => {
    try {
      await invoiceAPI.cancel({ id: invoice.id });
      await loadInvoices();
    } catch (error) {
      console.error('Error canceling invoice:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      clienteId: '',
      empleadoId: '',
      fecha: new Date().toISOString().split('T')[0],
      subtotal: 0,
      descuento: 0,
      total: 0,
      estado: 'Pendiente'
    });
    setSaleDetails([]);
    setCurrentDetail({
      productoId: '',
      servicioId: '',
      cantidad: 1,
      precioUnitario: 0,
      descuento: 0,
      subtotal: 0
    });
    setCurrentSale(1);
    setActiveTab('products');
    setEditingInvoice(null);
    setShowForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pagada':
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
        <h1 className="text-2xl font-bold text-gray-900">Registro de ventas</h1>
        
        {/* Sales Form */}
        {showForm && (
          <div className="mt-6">
            {/* Sale Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'products'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Registro productos
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'payment'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Método de pago
                </button>
                <button
                  onClick={() => setActiveTab('invoice')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'invoice'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Facturación
                </button>
              </nav>
            </div>

            {activeTab === 'products' && (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Venta {currentSale}</h3>
                  
                  {/* Sale Details Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Unitario</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento (%)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {saleDetails.map((detail, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {detail.productoId ? 
                                products.find(p => p.id === detail.productoId)?.nombre :
                                services.find(s => s.id === detail.servicioId)?.nombre
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={detail.cantidad}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                readOnly
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(detail.precioUnitario)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {detail.descuento}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(detail.subtotal)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleRemoveDetail(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        
                        {/* Add new item row */}
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{saleDetails.length + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={currentDetail.productoId || currentDetail.servicioId}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value.startsWith('product-')) {
                                  setCurrentDetail(prev => ({ ...prev, productoId: value.replace('product-', ''), servicioId: '' }));
                                } else if (value.startsWith('service-')) {
                                  setCurrentDetail(prev => ({ ...prev, servicioId: value.replace('service-', ''), productoId: '' }));
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                              <option value="">Buscar Producto</option>
                              <optgroup label="Productos">
                                {products.map(product => (
                                  <option key={`product-${product.id}`} value={`product-${product.id}`}>
                                    {product.nombre} - {formatCurrency(product.precioVenta)}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="Servicios">
                                {services.map(service => (
                                  <option key={`service-${service.id}`} value={`service-${service.id}`}>
                                    {service.nombre} - {formatCurrency(service.precio)}
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <button
                                onClick={() => setCurrentDetail(prev => ({ ...prev, cantidad: Math.max(1, prev.cantidad - 1) }))}
                                className="px-2 py-1 border border-gray-300 rounded-l-md hover:bg-gray-50"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                name="cantidad"
                                value={currentDetail.cantidad}
                                onChange={handleDetailChange}
                                className="w-16 px-2 py-1 border-t border-b border-gray-300 text-center text-sm"
                                min="1"
                              />
                              <button
                                onClick={() => setCurrentDetail(prev => ({ ...prev, cantidad: prev.cantidad + 1 }))}
                                className="px-2 py-1 border border-gray-300 rounded-r-md hover:bg-gray-50"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(currentDetail.precioUnitario)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              name="descuento"
                              value={currentDetail.descuento}
                              onChange={handleDetailChange}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(currentDetail.subtotal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={handleAddProduct}
                              className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700"
                            >
                              +
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Client and Employee Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Detalle de venta</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cliente
                    </label>
                    <div className="flex space-x-2">
                      <select
                        name="clienteId"
                        value={formData.clienteId}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="">Buscar Cliente</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.identificacion} - {client.nombre}
                          </option>
                        ))}
                      </select>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        Agregar Cliente
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empleado
                    </label>
                    <div className="flex space-x-2">
                      <select
                        name="empleadoId"
                        value={formData.empleadoId}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="">Buscar Empleado</option>
                        {employees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {employee.nombre}
                          </option>
                        ))}
                      </select>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        Agregar Empleado
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Total sin descuentos</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(formData.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Descuento total:</span>
                      <span className="text-lg font-bold text-red-600">{formatCurrency(formData.subtotal * (formData.descuento / 100))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Subtotal con descuentos:</span>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(formData.total)}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('payment')}
                      className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-medium"
                    >
                      Continuar con el pago
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'payment' || activeTab === 'invoice') && (
              <div className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Estado
                      </label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagada">Pagada</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Guardar Factura</span>
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Facturas Registradas</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Venta</span>
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número, estado o cliente"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Invoices Table */}
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
                    Subtotal
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
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{invoice.numero}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{invoice.cliente?.nombre || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{invoice.empleado?.nombre || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.subtotal)}
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
                        onClick={() => handleEdit(invoice)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {invoice.estado !== 'Cancelada' && (
                        <button
                          onClick={() => handleCancelInvoice(invoice)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(invoice)}
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

export default Invoices;

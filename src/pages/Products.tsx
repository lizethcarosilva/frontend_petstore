import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Syringe
} from 'lucide-react';
import { productAPI } from '../services/api';
import type { Product } from '../types/types';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all'); // 'all', 'vaccines', 'products'
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    presentacion: '',
    precio: 0,
    stock: 0,
    stockMinimo: 0,
    fechaVencimiento: '',
    lote: '',
    fabricante: '',
    esVacuna: false,
    activo: true
  });

  // Hook de paginación
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage
  } = usePagination({
    data: filteredProducts,
    itemsPerPage: 10
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, typeFilter]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productAPI.getAll();
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error: any) {
      console.error('Error loading products:', error);
      
      // Manejar error 403 específicamente
      if (error?.response?.status === 403) {
        alert('Error de permisos (403): No tienes autorización para ver los productos.\n\n' +
              'Posibles causas:\n' +
              '1. Tu usuario no tiene los roles necesarios\n' +
              '2. El endpoint /api/products en el backend no tiene la anotación @RequiresRole\n\n' +
              'Solución: Verifica que el ProductController tenga las anotaciones @RequiresRole apropiadas.\n' +
              'Ver archivo DEBUG_AUTH.md para más información.');
      } else if (error?.response?.status === 401) {
        alert('Error de autenticación (401): Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filtrar por tipo de producto
    if (typeFilter === 'vaccines') {
      filtered = filtered.filter(product => product.esVacuna === true);
    } else if (typeFilter === 'products') {
      filtered = filtered.filter(product => !product.esVacuna);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.presentacion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              (name === 'precio' ? (parseFloat(value) || 0) :
               name === 'stock' || name === 'stockMinimo' ? (parseInt(value) || 0) :
               type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Preparar datos para actualización según Product model del backend
        const updateData = {
          productId: editingProduct.productId || parseInt(editingProduct.id || '0'),
          codigo: formData.codigo,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          presentacion: formData.presentacion || null,
          precio: Number(formData.precio),
          stock: formData.stock,
          stockMinimo: formData.stockMinimo,
          fechaVencimiento: formData.fechaVencimiento || null,
          lote: formData.lote || null,
          fabricante: formData.fabricante || null,
          esVacuna: formData.esVacuna,
          activo: formData.activo
        };
        await productAPI.update(updateData);
      } else {
        // Preparar datos para creación según ProductCreateDto
        // Validar que el código no esté vacío
        if (!formData.codigo || formData.codigo.trim() === '') {
          alert('El código es obligatorio');
          return;
        }
        
        // Validar que el precio sea mayor a 0
        if (formData.precio <= 0) {
          alert('El precio debe ser mayor a 0');
          return;
        }
        
        const createData = {
          codigo: formData.codigo.trim(),
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          presentacion: formData.presentacion?.trim() || null,
          precio: Number(formData.precio),
          stock: formData.stock,
          stockMinimo: formData.stockMinimo,
          fechaVencimiento: formData.fechaVencimiento || null,
          lote: formData.lote?.trim() || null,
          fabricante: formData.fabricante?.trim() || null,
          esVacuna: formData.esVacuna
        };
        
        console.log('Creating product with data:', createData);
        await productAPI.create(createData);
      }
      await loadProducts();
      resetForm();
    } catch (error: any) {
      console.error('Error saving product:', error);
      const errorMessage = error?.response?.data || error?.message || 'Error desconocido';
      alert(`Error al guardar el producto: ${errorMessage}. Por favor, verifique que todos los campos estén completos y que el código sea único.`);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      codigo: product.codigo || '',
      nombre: product.nombre,
      descripcion: product.descripcion,
      presentacion: product.presentacion || '',
      precio: product.precio || product.precioVenta || 0,
      stock: product.stock,
      stockMinimo: product.stockMinimo,
      fechaVencimiento: product.fechaVencimiento || '',
      lote: product.lote || '',
      fabricante: product.fabricante || '',
      esVacuna: product.esVacuna || false,
      activo: product.activo !== undefined ? product.activo : true
    });
    setShowForm(true);
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const productId = product.productId || parseInt(product.id || '0');
        await productAPI.delete(productId);
        await loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const updateData = {
        productId: product.productId || parseInt(product.id || '0'),
        codigo: product.codigo || '',
        nombre: product.nombre,
        descripcion: product.descripcion,
        presentacion: product.presentacion || null,
        precio: Number(product.precio || product.precioVenta || 0),
        stock: product.stock,
        stockMinimo: product.stockMinimo,
        fechaVencimiento: product.fechaVencimiento || null,
        activo: !product.activo
      };
      await productAPI.update(updateData);
      await loadProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      presentacion: '',
      precio: 0,
      stock: 0,
      stockMinimo: 0,
      fechaVencimiento: '',
      lote: '',
      fabricante: '',
      esVacuna: false,
      activo: true
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isLowStock = (stock: number, stockMinimo: number) => stock <= stockMinimo;
  const isExpiringSoon = (fechaVencimiento: string) => {
    if (!fechaVencimiento) return false;
    const expDate = new Date(fechaVencimiento);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
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
        <h1 className="text-2xl font-bold text-gray-900">Administrar Productos</h1>
        
        {/* Product Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej. PROD-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej. Shampoo antipulgas"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presentación
              </label>
              <input
                type="text"
                name="presentacion"
                value={formData.presentacion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej. 500ml, 1kg, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Venta
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Actual
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Mínimo
              </label>
              <input
                type="number"
                name="stockMinimo"
                value={formData.stockMinimo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                name="fechaVencimiento"
                value={formData.fechaVencimiento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Opcional - Algunos productos no tienen fecha de vencimiento
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Lote
              </label>
              <input
                type="text"
                name="lote"
                value={formData.lote}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: LOT-2024-001"
              />
              <p className="mt-1 text-xs text-gray-500">
                Opcional - Si aplica al producto
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fabricante / Marca
              </label>
              <input
                type="text"
                name="fabricante"
                value={formData.fabricante}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: Laboratorio XYZ, Nestlé Purina..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Opcional - Fabricante o marca del producto
              </p>
            </div>

            {/* Checkbox para marcar si es vacuna */}
            <div className="col-span-full">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="esVacuna"
                  checked={formData.esVacuna}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm font-medium text-gray-700">
                  Este producto es una vacuna
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Marque esta opción solo si el producto es una vacuna. Esto permitirá que aparezca en el módulo de vacunación.
              </p>
              
              {/* Panel informativo solo si es vacuna */}
              {formData.esVacuna && (
                <div className="mt-3 bg-purple-50 border border-purple-200 rounded-md p-3 flex items-start">
                  <Syringe className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-purple-800">
                    <p className="font-medium">✓ Producto marcado como vacuna</p>
                    <p className="mt-1">
                      Este producto aparecerá en el listado de vacunas disponibles al registrar aplicaciones de vacunación.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Descripción del producto..."
                required
              />
            </div>

            <div className="flex items-center space-x-4 col-span-full">
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

      {/* Products List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-900">Productos Registrados</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {filteredProducts.length} {typeFilter === 'all' ? 'total' : typeFilter === 'vaccines' ? 'vacunas' : 'productos'}
              </span>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Producto</span>
            </button>
          </div>

          {/* Filtros y búsqueda */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, código, presentación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de producto
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Todos los productos</option>
                <option value="vaccines">Solo vacunas</option>
                <option value="products">Solo productos regulares</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Presentación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Venta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Mín.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    F. Venc.
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
                {paginatedData.map((product) => (
                  <tr key={product.productId || product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.codigo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.esVacuna ? (
                          <Syringe className="h-5 w-5 text-purple-500 mr-3" />
                        ) : (
                          <Package className="h-5 w-5 text-gray-400 mr-3" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.nombre}</div>
                          {product.esVacuna && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Vacuna
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.presentacion || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(product.precio || product.precioVenta || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          isLowStock(product.stock, product.stockMinimo) ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {product.stock}
                        </span>
                        {isLowStock(product.stock, product.stockMinimo) && (
                          <AlertTriangle className="h-4 w-4 text-red-500 ml-1" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stockMinimo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${
                        isExpiringSoon(product.fechaVencimiento || '') ? 'text-red-600 font-medium' : 'text-gray-900'
                      }`}>
                        {product.fechaVencimiento ? new Date(product.fechaVencimiento).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.activo ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
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

          {/* Paginación */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            itemsPerPage={10}
            onPageChange={goToPage}
            itemName="productos"
          />
        </div>
      </div>
    </div>
  );
};

export default Products;

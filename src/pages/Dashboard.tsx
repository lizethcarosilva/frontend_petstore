import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Users,
  ShoppingCart,
  MessageCircle,
  X
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
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

interface LowStockProduct {
  id: string;
  nombre: string;
  stock: number;
  stockMinimo: number;
}

interface ExpiringProduct {
  id: string;
  nombre: string;
  lote: string;
  fechaVencimiento: string;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chatbot'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [expiringProducts, setExpiringProducts] = useState<ExpiringProduct[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar datos del API
      const summaryResponse = await dashboardAPI.getSummary();
      setStats(summaryResponse.data);

      const lowStockResponse = await dashboardAPI.getLowStockProducts();
      setLowStockProducts(lowStockResponse.data.slice(0, 5));

      const expiringResponse = await dashboardAPI.getExpiringSoonProducts();
      setExpiringProducts(expiringResponse.data.slice(0, 5));

      const salesResponse = await dashboardAPI.getSalesStats();
      setSalesData(salesResponse.data);

      const topProductsResponse = await dashboardAPI.getTopProducts();
      setTopProducts(topProductsResponse.data.slice(0, 4));

      const topServicesResponse = await dashboardAPI.getTopServices();
      setTopServices(topServicesResponse.data.slice(0, 4));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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
      <div className="bg-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bienvenido, {user?.nombre}</h1>
            <p className="text-green-100 mt-1">
              Todo lo que tu mascota necesita, al alcance de un clic.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Citas agendadas para hoy</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.todayAppointments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">No. de productos en inventario</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ventas del día</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.todaySales || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ventas del mes</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.monthSales || 0)}</p>
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chatbot'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="inline h-4 w-4 mr-2" />
              Chatbot
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' ? (
            <div className="space-y-6">
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Número de productos y/o servicios
                    </h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {(stats?.totalProducts || 0) + (stats?.totalServices || 0)}
                      </div>
                      <p className="text-sm text-gray-600">Total disponibles</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Valor de productos vendidos</span>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(stats?.todaySales || 0)}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Valor de servicios generados</span>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(stats?.monthSales || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Expiring Soon */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Productos próximos a vencer
                </h3>
                <div className="space-y-3">
                  {expiringProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-red-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.nombre}</p>
                          <p className="text-sm text-gray-600">Lote: {product.lote}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">F. venc.: {product.fechaVencimiento}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance and Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Productos con mayor rendimiento
                  </h3>
                  <div className="space-y-3">
                    {topProducts.map((product: any, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{product.nombre}</span>
                        </div>
                        <span className="text-sm text-gray-600">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Alerta de bajo inventario
                  </h3>
                  <div className="space-y-3">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">{product.nombre}</span>
                          <span className="text-sm text-gray-600">{product.stock}/{product.stockMinimo}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${(product.stock / product.stockMinimo) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sales Chart */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Indicador de ventas: Mes en curso vs Anterior
                </h3>
                <div className="h-64 min-h-[200px]">
                  {salesData && salesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Line type="monotone" dataKey="current" stroke="#10B981" strokeWidth={2} />
                        <Line type="monotone" dataKey="previous" stroke="#6B7280" strokeWidth={2} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Cargando datos de ventas...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 bg-white border rounded-lg p-6 flex flex-col">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Asistente Virtual</h3>
              </div>
              
              {/* Chat Messages Area */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
                <div className="space-y-3">
                  {/* Welcome message */}
                  <div className="flex justify-start">
                    <div className="bg-white border rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-gray-700">
                        ¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?
                      </p>
                      <span className="text-xs text-gray-500">Ahora</span>
                    </div>
                  </div>
                  
                  {/* User message example */}
                  <div className="flex justify-end">
                    <div className="bg-green-600 text-white rounded-lg p-3 max-w-xs">
                      <p className="text-sm">¿Cuántos productos tengo en stock bajo?</p>
                      <span className="text-xs text-green-100">Hace 1 min</span>
                    </div>
                  </div>
                  
                  {/* Bot response example */}
                  <div className="flex justify-start">
                    <div className="bg-white border rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-gray-700">
                        Actualmente tienes 3 productos con stock bajo: Alimento Premium (2 unidades), Jabón Antiséptico (1 unidad) y Vitaminas (3 unidades).
                      </p>
                      <span className="text-xs text-gray-500">Hace 1 min</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Input Area */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Escribe tu pregunta aquí..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center justify-center mt-2">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span>Conectado</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
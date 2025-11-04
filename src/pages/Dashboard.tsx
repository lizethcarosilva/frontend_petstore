import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Package, 

  Clock,
  Users,
  MessageCircle,
  X,
  Brain,
  Minimize2
} from 'lucide-react';
import { dashboardAPI, chatbotAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Chatbot from '../components/Chatbot';
import ClusteringDashboard from '../components/ClusteringDashboard';

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



const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Estados para IA
  const [iaStats, setIaStats] = useState<any>(null);
  const [tiposMascota, setTiposMascota] = useState<any>(null);
  const [diasAtencion, setDiasAtencion] = useState<any>(null);
  const [horasPico, setHorasPico] = useState<any>(null);
  const [isLoadingIA, setIsLoadingIA] = useState(false);

  // Estado para el chatbot flotante
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadIAStats();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      const summaryResponse = await dashboardAPI.getSummary();
      setStats(summaryResponse.data);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats(null);
      setIsLoading(false);
    }
  };

  const loadIAStats = async () => {
    try {
      setIsLoadingIA(true);
      
      const statsResponse = await chatbotAPI.getEstadisticas();
      setIaStats(statsResponse.data);

      const tiposResponse = await chatbotAPI.getTiposMascota();
      setTiposMascota(tiposResponse.data);

      const diasResponse = await chatbotAPI.getDiasAtencion();
      setDiasAtencion(diasResponse.data);

      const horasResponse = await chatbotAPI.getHorasPico();
      setHorasPico(horasResponse.data);

    } catch (error) {
      console.error('Error loading IA stats:', error);
      // Si falla la conexión, establecer todo en null para ocultar las secciones
      setIaStats(null);
      setTiposMascota(null);
      setDiasAtencion(null);
      setHorasPico(null);
    } finally {
      setIsLoadingIA(false);
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
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bienvenido, {user?.name || 'Usuario'}</h1>
            <p className="text-green-100 mt-2 text-lg">
              Dashboard con Análisis de Inteligencia Artificial
            </p>
          </div>
          <Brain className="h-16 w-16 opacity-80" />
        </div>
      </div>


      {/* Mensaje cuando la API de IA no está disponible */}
      {!iaStats && !isLoadingIA && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Brain className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Análisis con Inteligencia Artificial
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⚠️ No disponible
                </span>
              </h3>

            </div>
          </div>
        </div>
      )}

      {/* Estadísticas de IA - Solo si hay datos disponibles */}
      {iaStats && !isLoadingIA && (
        <>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Brain className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Análisis con Inteligencia Artificial</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Insights generados por Machine Learning basados en tus datos
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                🟢 Conectado a IA
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Mascotas</p>
                  <p className="text-4xl font-bold mt-2">{iaStats.total_mascotas || 0}</p>
                </div>
                <Users className="h-12 w-12 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Clientes</p>
                  <p className="text-4xl font-bold mt-2">{iaStats.total_clientes || 0}</p>
                </div>
                <Users className="h-12 w-12 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Citas</p>
                  <p className="text-4xl font-bold mt-2">{iaStats.total_citas || 0}</p>
                </div>
                <Calendar className="h-12 w-12 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Servicios</p>
                  <p className="text-4xl font-bold mt-2">{iaStats.total_servicios || 0}</p>
                </div>
                <Package className="h-12 w-12 opacity-80" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tipo de Mascota Más Común */}
      {tiposMascota && !isLoadingIA && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="h-5 w-5 text-green-600 mr-2" />
            Tipo de Mascota Más Común (IA)
          </h3>
          <div className="text-center py-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg mb-4">
            <div className="text-7xl mb-3">
              {tiposMascota.tipo_mas_comun === 'Perro' ? '🐕' : 
               tiposMascota.tipo_mas_comun === 'Gato' ? '🐱' : '🐾'}
            </div>
            <p className="text-3xl font-bold text-green-600">{tiposMascota.tipo_mas_comun}</p>
            <p className="text-sm text-gray-600 mt-2">
              {tiposMascota.estadisticas && tiposMascota.estadisticas[0]?.porcentaje.toFixed(1)}% del total
            </p>
          </div>
          <div className="space-y-3">
            {tiposMascota.estadisticas?.slice(0, 4).map((tipo: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{tipo.tipo_mascota}</span>
                  <span className="text-sm text-gray-600">{tipo.total_mascotas}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${tipo.porcentaje}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Análisis Temporal con IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Día con Más Atención */}
        {diasAtencion && diasAtencion.estadisticas && diasAtencion.estadisticas.length > 0 && !isLoadingIA && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              Día con Más Atención (IA)
            </h3>
            <div className="text-center py-4 mb-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <p className="text-5xl font-bold text-blue-600">{diasAtencion.dia_mas_atencion}</p>
              <p className="text-sm text-gray-600 mt-2">Día más concurrido de la semana</p>
            </div>
            <div className="h-64" style={{ minHeight: '256px' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                <BarChart data={diasAtencion.estadisticas.slice(0, 7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia_semana" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_citas" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Hora Pico */}
        {horasPico && horasPico.estadisticas && horasPico.estadisticas.length > 0 && !isLoadingIA && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 text-purple-600 mr-2" />
              Hora Pico de Atención (IA)
            </h3>
            <div className="text-center py-4 mb-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <p className="text-5xl font-bold text-purple-600">{horasPico.hora_pico}:00</p>
              <p className="text-sm text-gray-600 mt-2">Hora con más citas del día</p>
            </div>
            <div className="h-64" style={{ minHeight: '256px' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                <BarChart data={horasPico.estadisticas.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_citas" fill="#A855F7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Dashboard de Clustering - Solo si la API de IA está disponible */}
      {iaStats && !isLoadingIA && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Brain className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Análisis de Clustering con Machine Learning</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Descubre patrones ocultos y segmentaciones inteligentes en tus datos
          </p>
          <ClusteringDashboard />
        </div>
      )}

      {/* Botón flotante del Chatbot */}
      <button
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        className={`fixed bottom-6 right-6 ${
          isChatbotOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        } text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 z-50 group`}
        aria-label={isChatbotOpen ? 'Cerrar chatbot' : 'Abrir chatbot'}
      >
        {isChatbotOpen ? (
          <X className="h-7 w-7" />
        ) : (
          <>
            <MessageCircle className="h-7 w-7 group-hover:scale-110 transition-transform duration-200" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
            </span>
          </>
        )}
      </button>

      {/* Panel del Chatbot */}
      {isChatbotOpen && (
        <div className="fixed bottom-24 right-6 w-[450px] h-[700px] bg-white rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-green-200">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="h-6 w-6 text-white mr-2" />
              <div>
                <h3 className="text-white font-semibold">Asistente Virtual IA</h3>
                <p className="text-green-100 text-xs">Powered by Machine Learning</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatbotOpen(false)}
              className="text-white hover:bg-green-700 rounded-full p-1 transition-colors duration-200"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Chatbot usuarioId={user?.user_id?.toString()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

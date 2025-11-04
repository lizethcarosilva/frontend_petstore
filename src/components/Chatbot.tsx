import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, User, AlertCircle, Loader } from 'lucide-react';
import { chatbotAPI } from '../services/api';

interface Message {
  id: string;
  texto: string;
  esUsuario: boolean;
  timestamp: Date;
  confianza?: number;
  intencion?: string;
}

interface ChatbotProps {
  usuarioId?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ usuarioId = 'user123' }) => {
  const [mensajes, setMensajes] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  // Verificar conexión al montar el componente
  useEffect(() => {
    checkConnection();
    // Mensaje de bienvenida
    setMensajes([
      {
        id: '0',
        texto: '¡Hola! 👋 Soy tu asistente con IA.\n\nPuedo ayudarte con:\n• 📊 Estadísticas\n• 🔍 Buscar mascotas\n• 📈 Análisis y predicciones\n\n¿Qué necesitas?',
        esUsuario: false,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const checkConnection = async () => {
    try {
      console.log('🔍 Verificando conexión con API de IA...');
      const response = await chatbotAPI.healthCheck();
      console.log('✅ Conexión exitosa con API de IA:', response.data);
      setIsConnected(true);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error conectando con la API de IA:', err);
      setIsConnected(false);
      
      // Mensaje de error más específico
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('No se pudo conectar con el servidor de IA. Verifica que python api.py esté corriendo en http://localhost:8000');
      } else {
        setError(`Error: ${err.response?.data?.message || err.message || 'No se pudo conectar con la API de IA'}`);
      }
    }
  };

  const enviarMensaje = async () => {
    if (!inputValue.trim() || isLoading) return;

    const mensajeUsuario = inputValue.trim();
    setInputValue('');

    // Agregar mensaje del usuario
    const nuevoMensajeUsuario: Message = {
      id: Date.now().toString(),
      texto: mensajeUsuario,
      esUsuario: true,
      timestamp: new Date(),
    };

    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setIsLoading(true);
    setError(null);

    try {
      // Enviar mensaje a la API
      const response = await chatbotAPI.sendMessage(mensajeUsuario, usuarioId);
      const data = response.data;

      // Agregar respuesta del bot
      const mensajeBot: Message = {
        id: (Date.now() + 1).toString(),
        texto: data.respuesta || 'Lo siento, no pude procesar tu mensaje.',
        esUsuario: false,
        timestamp: new Date(),
        confianza: data.confianza,
        intencion: data.intencion,
      };

      setMensajes((prev) => [...prev, mensajeBot]);
      setIsConnected(true);
    } catch (err: any) {
      console.error('Error enviando mensaje:', err);
      
      // Mensaje de error
      const mensajeError: Message = {
        id: (Date.now() + 1).toString(),
        texto: err.response?.status === 500 
          ? '❌ Hubo un error procesando tu mensaje. Por favor, intenta de nuevo.'
          : '❌ No se pudo conectar con el servidor de IA. Verifica que la API esté corriendo en http://localhost:8000',
        esUsuario: false,
        timestamp: new Date(),
      };

      setMensajes((prev) => [...prev, mensajeError]);
      setIsConnected(false);
      setError('Error de conexión con la API de IA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const ejemplosPreguntas = [
    '¿Cuál es el tipo de mascota más común?',
    '¿Qué día hay más atención?',
    '¿Cuántos clientes tengo?',
    'Muestra las estadísticas',
  ];

  const usarEjemplo = (pregunta: string) => {
    setInputValue(pregunta);
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Indicador de conexión */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
        <div className="flex items-center text-sm">
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-4 w-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-red-800">{error}</p>
            <button
              onClick={checkConnection}
              className="text-xs text-red-600 underline hover:text-red-800 mt-1"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Ejemplos de preguntas (solo si no hay mensajes del usuario) */}
      {mensajes.filter(m => m.esUsuario).length === 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2 font-medium">Prueba preguntando:</p>
          <div className="space-y-1.5">
            {ejemplosPreguntas.slice(0, 3).map((pregunta, index) => (
              <button
                key={index}
                onClick={() => usarEjemplo(pregunta)}
                className="w-full text-left text-xs p-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors duration-150"
              >
                💬 {pregunta}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Área de Mensajes */}
      <div className="flex-1 bg-gray-50 rounded-lg p-3 overflow-y-auto" style={{ maxHeight: '500px', minHeight: '400px' }}>
        <div className="space-y-3">
          {mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`flex ${mensaje.esUsuario ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex ${mensaje.esUsuario ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[85%]`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 ${mensaje.esUsuario ? 'ml-1.5' : 'mr-1.5'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    mensaje.esUsuario ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {mensaje.esUsuario ? (
                      <User className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                </div>

                {/* Mensaje */}
                <div className={`rounded-lg p-2.5 ${
                  mensaje.esUsuario
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}>
                  <p className="text-xs whitespace-pre-wrap break-words">{mensaje.texto}</p>
                  
                  <span className={`text-[10px] mt-1 block ${
                    mensaje.esUsuario ? 'text-green-100' : 'text-gray-400'
                  }`}>
                    {formatTime(mensaje.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Indicador de escritura */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-2">
                <Loader className="h-3 w-3 text-gray-500 animate-spin mr-1.5" />
                <span className="text-xs text-gray-500">Escribiendo...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="mt-3 flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu pregunta..."
          disabled={isLoading || !isConnected}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={enviarMensaje}
          disabled={isLoading || !isConnected || !inputValue.trim()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;


import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, AppointmentInvoiceDataDto, VaccinationInvoiceDataDto } from '../types/types';

interface ShoppingCartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  clientId: number | null;
  clientName: string | null;
  addProductToCart: (productId: number, productName: string, price: number, quantity: number) => void;
  addServiceToCart: (serviceId: number, serviceName: string, price: number, quantity: number) => void;
  addAppointmentToCart: (appointmentData: AppointmentInvoiceDataDto) => void;
  addVaccinationToCart: (vaccinationData: VaccinationInvoiceDataDto) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateDiscount: (itemId: string, discount: number) => void;
  clearCart: () => void;
  isInCart: (tipo: string, referenceId?: number) => boolean;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

interface ShoppingCartProviderProps {
  children: ReactNode;
}

export const ShoppingCartProvider: React.FC<ShoppingCartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [clientId, setClientId] = useState<number | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem('shoppingCart');
    const savedClientId = localStorage.getItem('cartClientId');
    const savedClientName = localStorage.getItem('cartClientName');
    
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    
    if (savedClientId) {
      setClientId(parseInt(savedClientId));
    }
    
    if (savedClientName) {
      setClientName(savedClientName);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('shoppingCart');
      localStorage.removeItem('cartClientId');
      localStorage.removeItem('cartClientName');
      setClientId(null);
      setClientName(null);
    }
  }, [cartItems]);

  // Guardar clientId cuando cambie
  useEffect(() => {
    if (clientId) {
      localStorage.setItem('cartClientId', clientId.toString());
    }
    if (clientName) {
      localStorage.setItem('cartClientName', clientName);
    }
  }, [clientId, clientName]);

  const cartCount = cartItems.reduce((total, item) => total + item.cantidad, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.subtotal, 0);

  const generateItemId = (tipo: string, referenceId?: number) => {
    return `${tipo}-${referenceId || Date.now()}-${Math.random()}`;
  };

  const calculateSubtotal = (cantidad: number, precioUnitario: number, descuento: number) => {
    const subtotal = cantidad * precioUnitario;
    const descuentoAmount = subtotal * (descuento / 100);
    return subtotal - descuentoAmount;
  };

  const addProductToCart = (productId: number, productName: string, price: number, quantity: number = 1) => {
    const newItem: CartItem = {
      id: generateItemId('PRODUCTO', productId),
      tipo: 'PRODUCTO',
      productId,
      itemNombre: productName,
      cantidad: quantity,
      precioUnitario: price,
      descuento: 0,
      subtotal: calculateSubtotal(quantity, price, 0),
    };
    
    setCartItems(prev => [...prev, newItem]);
  };

  const addServiceToCart = (serviceId: number, serviceName: string, price: number, quantity: number = 1) => {
    const newItem: CartItem = {
      id: generateItemId('SERVICIO', serviceId),
      tipo: 'SERVICIO',
      serviceId,
      itemNombre: serviceName,
      cantidad: quantity,
      precioUnitario: price,
      descuento: 0,
      subtotal: calculateSubtotal(quantity, price, 0),
    };
    
    setCartItems(prev => [...prev, newItem]);
  };

  const addAppointmentToCart = (appointmentData: AppointmentInvoiceDataDto) => {
    // Establecer cliente si no está establecido o verificar que sea el mismo
    if (!clientId) {
      setClientId(appointmentData.clientId);
      setClientName(appointmentData.clientName);
    } else if (clientId !== appointmentData.clientId) {
      alert(`El carrito ya tiene items del cliente "${clientName}". Por favor, finalice la factura actual o limpie el carrito para cambiar de cliente.`);
      return;
    }

    // Verificar si ya está en el carrito
    if (isInCart('CITA', appointmentData.appointmentId)) {
      alert('Esta cita ya está en el carrito');
      return;
    }

    const newItem: CartItem = {
      id: generateItemId('CITA', appointmentData.appointmentId),
      tipo: 'SERVICIO', // Las citas se facturan como servicios
      referenceId: appointmentData.appointmentId,
      serviceId: appointmentData.serviceId,
      itemNombre: `${appointmentData.serviceName} - Mascota: ${appointmentData.petName}`,
      cantidad: 1,
      precioUnitario: appointmentData.servicePrice,
      descuento: 0,
      subtotal: appointmentData.servicePrice,
      metadata: {
        petName: appointmentData.petName,
        petId: appointmentData.petId,
        appointmentId: appointmentData.appointmentId,
      },
    };
    
    setCartItems(prev => [...prev, newItem]);
  };

  const addVaccinationToCart = (vaccinationData: VaccinationInvoiceDataDto) => {
    // Establecer cliente si no está establecido o verificar que sea el mismo
    if (!clientId) {
      setClientId(vaccinationData.clientId);
      setClientName(vaccinationData.clientName);
    } else if (clientId !== vaccinationData.clientId) {
      alert(`El carrito ya tiene items del cliente "${clientName}". Por favor, finalice la factura actual o limpie el carrito para cambiar de cliente.`);
      return;
    }

    // Verificar si ya está en el carrito
    if (isInCart('VACUNACION', vaccinationData.vaccinationId)) {
      alert('Esta vacunación ya está en el carrito');
      return;
    }

    const itemName = vaccinationData.productName 
      ? `${vaccinationData.productName} (Vacuna: ${vaccinationData.vaccineName}) - Mascota: ${vaccinationData.petName}`
      : `Vacuna: ${vaccinationData.vaccineName} - Mascota: ${vaccinationData.petName}`;

    const price = vaccinationData.productPrice || 0;

    const newItem: CartItem = {
      id: generateItemId('VACUNACION', vaccinationData.vaccinationId),
      tipo: vaccinationData.productId ? 'PRODUCTO' : 'SERVICIO',
      referenceId: vaccinationData.vaccinationId,
      productId: vaccinationData.productId,
      itemNombre: itemName,
      cantidad: 1,
      precioUnitario: price,
      descuento: 0,
      subtotal: price,
      metadata: {
        petName: vaccinationData.petName,
        petId: vaccinationData.petId,
        vaccinationId: vaccinationData.vaccinationId,
      },
    };
    
    setCartItems(prev => [...prev, newItem]);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const subtotal = calculateSubtotal(quantity, item.precioUnitario, item.descuento);
        return { ...item, cantidad: quantity, subtotal };
      }
      return item;
    }));
  };

  const updateDiscount = (itemId: string, discount: number) => {
    if (discount < 0 || discount > 100) return;
    
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const subtotal = calculateSubtotal(item.cantidad, item.precioUnitario, discount);
        return { ...item, descuento: discount, subtotal };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
    setClientId(null);
    setClientName(null);
  };

  const isInCart = (tipo: string, referenceId?: number) => {
    if (!referenceId) return false;
    
    return cartItems.some(item => {
      if (tipo === 'CITA') {
        return item.metadata?.appointmentId === referenceId;
      }
      if (tipo === 'VACUNACION') {
        return item.metadata?.vaccinationId === referenceId;
      }
      return false;
    });
  };

  return (
    <ShoppingCartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        clientId,
        clientName,
        addProductToCart,
        addServiceToCart,
        addAppointmentToCart,
        addVaccinationToCart,
        removeFromCart,
        updateQuantity,
        updateDiscount,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
};

export const useShoppingCart = () => {
  const context = useContext(ShoppingCartContext);
  if (context === undefined) {
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
};


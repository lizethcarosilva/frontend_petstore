import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ShoppingCart } from 'lucide-react';
import { useShoppingCart } from '../../contexts/ShoppingCartContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onMenuToggle }) => {
  const navigate = useNavigate();
  const { cartCount, cartItems, clientName } = useShoppingCart();

  const handleCartClick = () => {
    navigate('/invoices');
  };

  return (
    <header className="bg-pet-green text-white p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-pet-light-green rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-200">{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* Shopping Cart Indicator */}
        <div className="flex items-center space-x-4">
          {cartCount > 0 && clientName && (
            <div className="hidden md:block text-right text-sm">
              <div className="font-semibold">Carrito: {clientName}</div>
              <div className="text-gray-200">{cartCount} item{cartCount !== 1 ? 's' : ''}</div>
            </div>
          )}
          <button
            onClick={handleCartClick}
            className="relative p-2 hover:bg-pet-light-green rounded-lg transition-colors"
            title={`Carrito de compras${cartCount > 0 ? `: ${cartCount} items` : ''}`}
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

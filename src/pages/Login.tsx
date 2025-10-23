import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login({ correo: email, password });
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and title */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Heart className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Log in</h2>
            <p className="mt-2 text-sm text-gray-600">
              Si no tienes una cuenta registrada{' '}
              <button className="font-medium text-green-600 hover:text-green-500">
                Puedes registrarte aquí
              </button>
            </p>
          </div>

          {/* Login form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Ingresa tu cuenta"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Ingresa tu contraseña"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Recuérdame
                </label>
              </div>

              <div className="text-sm">
                <button className="font-medium text-green-600 hover:text-green-500">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {/* Login button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-green-600 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="bg-white rounded-full p-8 mb-8">
            <div className="flex justify-center items-center space-x-4">
              <div className="text-6xl">🐕</div>
              <div className="text-6xl">🐱</div>
            </div>
            <div className="mt-4 text-2xl font-bold text-gray-800">
              ADoPt Me :)
            </div>
          </div>
          <h3 className="text-4xl font-bold text-white mb-4">
            Un cuidado adecuado para tu mascota
          </h3>
          <p className="text-xl text-green-100">
            Todo lo que tu mascota necesita, al alcance de un clic.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
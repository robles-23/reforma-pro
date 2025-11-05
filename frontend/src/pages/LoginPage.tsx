import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;
      login(user, accessToken, refreshToken);
      navigate('/upload');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-olive-50 via-sage-50 to-olive-100">
      <div className="max-w-md w-full mx-4">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-olive-600 to-olive-700 mb-4 shadow-soft-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-olive-900 mb-2">Reforma Pro</h1>
          <p className="text-olive-600 text-lg">Presentaciones profesionales de renovación</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-soft-lg p-8 animate-fadeIn">
          <h2 className="text-2xl font-semibold text-olive-900 mb-6 text-center">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-olive-900 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-md border border-olive-200 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                placeholder="tu@email.com"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-olive-900 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-md border border-olive-200 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-olive-600 to-olive-700 text-white font-medium rounded-md hover:from-olive-700 hover:to-olive-800 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-soft"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-olive-600 text-sm mt-6">
          © 2024 Reforma Pro. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}

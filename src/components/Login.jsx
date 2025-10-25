import React, { useState } from 'react';
import { Sparkles, Zap, Brain, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

// New reusable component for floating icons (modern touch)
const FloatingIcon = ({ icon: Icon, className = "", delay = 0 }) => (
  <div className={`absolute opacity-10 animate-bounce ${className}`} style={{ animationDelay: `${delay}s` }}>
    <Icon size={32} className="text-white" />
  </div>
);

// Enhanced Login Form
const LoginForm = ({ onLogin, onSwitchToSignup }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/auth/login', formData);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      login(result.token);
      onLogin(result.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-4 relative overflow-hidden">
      {/* Background pattern for modern feel */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-purple-300 transform rotate-12 scale-150"></div>
      </div>
      
      {/* Floating background icons */}
      <FloatingIcon icon={Sparkles} className="top-20 left-20" delay={0} />
      <FloatingIcon icon={Zap} className="top-40 right-40" delay={1} />
      <FloatingIcon icon={Brain} className="bottom-20 left-1/3" delay={2} />

      <div className="relative z-10 bg-white/90 backdrop-blur-lg rounded-2xl p-10 shadow-2xl w-full max-w-md hover:shadow-3xl transition-all duration-300">
        <div className="text-center mb-8">
          {/* <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-6 shadow-xl animate-pulse">
            <LogIn className="text-white" size={40} />
          </div> */}
          <h2 className="text-4xl font-black text-gray-800 mb-2 animate-fade-in">Welcome Back</h2>
          <p className="text-gray-600 text-lg animate-fade-in animation-delay-200">Sign in to your account to continue learning</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-3">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-3">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center shadow-md animate-slide-in">
              <div className="flex items-center justify-center gap-2">
                <span className="text-red-500 text-lg">⚠️</span>
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-gray-600 text-base">Don't have an account? 
            <button 
              onClick={onSwitchToSignup} 
              className="text-cyan-600 hover:text-cyan-700 font-bold underline ml-2 transition-colors duration-300"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

function Login({ onLogin, onSwitchToSignup }) {
  return <LoginForm onLogin={onLogin} onSwitchToSignup={onSwitchToSignup} />;
}

export default Login;

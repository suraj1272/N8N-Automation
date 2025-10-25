import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Sparkles, BookOpen, Brain, Trophy, Zap, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

// Floating Icon Component
const FloatingIcon = ({ icon: Icon, className = "", delay = 0 }) => (
  <div className={`absolute opacity-10 animate-bounce ${className}`} style={{ animationDelay: `${delay}s` }}>
    <Icon size={48} className="text-white" />
  </div>
);

function Signup({ onSignup, onSwitchToLogin }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Signup failed');
      }

      login(result.token);
      onSignup(result.token);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-purple-200 transform rotate-12 scale-150"></div>
      </div>

      {/* Floating background icons */}
      <FloatingIcon icon={Sparkles} className="top-20 left-10" delay={0} />
      <FloatingIcon icon={Brain} className="top-40 right-20" delay={1} />
      <FloatingIcon icon={Trophy} className="bottom-20 left-20" delay={2} />
      <FloatingIcon icon={BookOpen} className="bottom-40 right-10" delay={1.5} />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Icon Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full mb-4 shadow-2xl animate-pulse">
            <UserPlus className="text-white" size={40} />
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Join Us Today
          </h1>
          <p className="text-xl text-gray-700 font-light">
            Create your account and start learning
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={20} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Create a strong password"
                  required
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Check className="text-gray-400" size={20} />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-shake">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <p className="font-semibold">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-lg">
              Already have an account?{' '}
              <button 
                onClick={onSwitchToLogin} 
                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 font-bold underline transition-all duration-300"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm">
            <Sparkles className="mx-auto text-cyan-600 mb-2" size={24} />
            <p className="text-xs font-semibold text-gray-700">Personalized</p>
          </div>
          <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm">
            <Zap className="mx-auto text-blue-600 mb-2" size={24} />
            <p className="text-xs font-semibold text-gray-700">Fast Learning</p>
          </div>
          <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm">
            <Trophy className="mx-auto text-purple-600 mb-2" size={24} />
            <p className="text-xs font-semibold text-gray-700">Certificates</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
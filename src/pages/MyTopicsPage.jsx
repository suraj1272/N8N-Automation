import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Calendar, ArrowLeft, Search, Trash2, Eye, LogOut, Sparkles, Zap, Brain, Trophy } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import TopNavigation from "../components/TopNavigation";

import Card from "../components/Card";
import Button from "../components/Button";

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const Loader = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
      <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-75"></div>
    </div>
    <p className="mt-6 text-gray-600 font-medium animate-pulse">Loading your topics...</p>
  </div>
);

// New reusable component for floating icons (modern touch)
const FloatingIcon = ({ icon: Icon, className = "", delay = 0 }) => (
  <div className={`absolute opacity-10 animate-bounce ${className}`} style={{ animationDelay: `${delay}s` }}>
    <Icon size={32} className="text-blue-400" />
  </div>
);

// Enhanced Header Section
const TopicsHeader = () => (
  <div className="relative text-center mb-16 overflow-hidden">
    {/* Floating background icons */}
    <FloatingIcon icon={Sparkles} className="top-10 left-10" delay={0} />
    <FloatingIcon icon={Trophy} className="top-20 right-20" delay={1} />
    <FloatingIcon icon={Brain} className="bottom-10 left-1/4" delay={2} />
    
    <div className="relative z-10">
      <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full mb-8 shadow-2xl animate-pulse">
        <BookOpen className="text-white animate-spin" size={56} style={{ animationDuration: '3s' }} />
      </div>
      <h1 className="text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight animate-fade-in">
        My Topics
      </h1>
      <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light animate-fade-in animation-delay-200">
        Explore your personalized learning library. Track progress, revisit favorites, and continue your knowledge journey.
      </p>
    </div>
  </div>
);

// Enhanced Stats Cards
const StatsSection = ({ searches }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
    <Card className="p-8 text-center shadow-xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl hover:shadow-2xl transition-all duration-300">
      <div className="text-4xl font-black text-cyan-600 mb-3">{searches.length}</div>
      <div className="text-gray-600 font-medium">Total Topics</div>
    </Card>
    <Card className="p-8 text-center shadow-xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl hover:shadow-2xl transition-all duration-300">
      <div className="text-4xl font-black text-green-600 mb-3">
        {searches.filter(s => new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
      </div>
      <div className="text-gray-600 font-medium">This Week</div>
    </Card>
    <Card className="p-8 text-center shadow-xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl hover:shadow-2xl transition-all duration-300">
      <div className="text-4xl font-black text-purple-600 mb-3">
        {searches.filter(s => new Date(s.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
      </div>
      <div className="text-gray-600 font-medium">This Month</div>
    </Card>
  </div>
);

// Enhanced Topic Card
const TopicCard = ({ search, onView, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="p-8 hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm rounded-xl border-0 hover:scale-102">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="text-cyan-600" size={28} />
            <h3 className="text-2xl font-bold text-gray-900">
              {search.status === 'processing' ? (
                <span className="text-orange-600 animate-pulse">Generating... {search.topic}</span>
              ) : (
                search.topic
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-base mb-6">
            <Calendar size={18} />
            <span>Created on {formatDate(search.createdAt)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-base text-gray-600">
            <span className="flex items-center gap-2"><span>📚</span> Learning modules</span>
            <span className="flex items-center gap-2"><span>🧠</span> Knowledge checks</span>
            <span className="flex items-center gap-2"><span>💻</span> Coding challenges</span>
            <span className="flex items-center gap-2"><span>🎥</span> Video resources</span>
          </div>
        </div>
        <div className="flex gap-3 ml-6">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onView(search)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Eye size={18} />
            View
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(search._id)}
            className="hover:bg-red-600 hover:shadow-lg transition-all duration-300"
          >
            <Trash2 size={18} />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Enhanced Empty State
const EmptyState = () => (
  <Card className="p-16 text-center shadow-xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl">
    <BookOpen className="mx-auto text-gray-400 mb-6" size={64} />
    <h3 className="text-2xl font-bold text-gray-900 mb-4">No topics yet</h3>
    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
      Start your learning journey by searching for a topic and unlock personalized content!
    </p>
    <Link to="/search">
      <Button variant="primary" size="lg" className="px-8 py-4 text-xl font-semibold shadow-lg hover:shadow-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300">
        <Search size={24} />
        Search Your First Topic
      </Button>
    </Link>
  </Card>
);

// Enhanced Error Display
const ErrorDisplay = ({ error, onRetry }) => (
  <Card className="p-6 mb-6 border-red-300 bg-red-50 shadow-lg rounded-xl animate-slide-in">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-white text-sm font-bold">⚠️</span>
        </div>
        <p className="text-red-800 font-semibold">{error}</p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={onRetry}
        className="hover:bg-gray-200 transition-colors"
      >
        Try Again
      </Button>
    </div>
  </Card>
);

function MyTopicsPage() {
  const { user, logout } = useAuth();
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSearches();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const loadSearches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/search');
      const data = await response.json();
      setSearches(data.searches || []);
    } catch (err) {
      console.error('Error loading searches:', err);
      setError('Failed to load your topics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTopic = (search) => {
    // Navigate to the dedicated topic view page
    navigate(`/topic/${search._id}`);
  };

  const handleDeleteTopic = async (searchId) => {
    if (!window.confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/api/search/${searchId}`);
      if (response.ok) {
        setSearches(searches.filter(search => search._id !== searchId));
      } else {
        throw new Error('Failed to delete topic');
      }
    } catch (err) {
      console.error('Error deleting topic:', err);
      alert('Failed to delete topic. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Background pattern for modern feel */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-purple-200 transform rotate-12 scale-150"></div>
        </div>
        
        <TopNavigation onLogout={handleLogout} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <Card className="p-16 shadow-2xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl">
            <Loader />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background pattern for modern feel */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-purple-200 transform rotate-12 scale-150"></div>
      </div>
      
      <TopNavigation onLogout={handleLogout} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <TopicsHeader />

        {/* Header with Search Button */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-gray-600 text-lg">
                All your learning topics and progress
              </p>
            </div>
          </div>
          <Link to="/search">
            <Button variant="primary" className="px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300">
              <Search size={20} />
              Search New Topic
            </Button>
          </Link>
        </div>

        <StatsSection searches={searches} />

        {/* Error Message */}
        {error && <ErrorDisplay error={error} onRetry={loadSearches} />}

        {/* Topics List */}
        {searches.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {searches.map((search) => (
              <TopicCard
                key={search._id}
                search={search}
                onView={handleViewTopic}
                onDelete={handleDeleteTopic}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTopicsPage;

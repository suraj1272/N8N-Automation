import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Calendar, ArrowLeft, Search, Trash2, Eye } from "lucide-react";
import config from "../config";

// Reusable Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "primary", size = "md", disabled, onClick, className = "" }) => {
  const baseStyles = "font-medium rounded-lg transition-all duration-200 flex items-center gap-2 justify-center";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    success: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white",
    danger: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white",
    ghost: "hover:bg-gray-100 text-gray-700"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

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
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">Loading your topics...</p>
  </div>
);

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
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">{search.topic}</h3>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
            <Calendar size={16} />
            <span>Created on {formatDate(search.createdAt)}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>📚 Learning modules</span>
            <span>🧠 Knowledge checks</span>
            <span>💻 Coding challenges</span>
            <span>🎥 Video resources</span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onView(search)}
          >
            <Eye size={16} />
            View
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(search._id)}
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};

function MyTopicsPage() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = config.API_BASE_URL;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // Mock user data, in real app you'd decode token or fetch user info
    setUser({ email: 'user@example.com' });
    loadSearches();
  }, [token, navigate]);

  const loadSearches = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSearches(data.searches || []);
      } else {
        throw new Error('Failed to load searches');
      }
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
      const response = await fetch(`${API_BASE_URL}/api/search/${searchId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="p-8">
            <Loader />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Topics
              </h1>
              <p className="text-gray-600 mt-1">
                All your learning topics and progress
              </p>
            </div>
          </div>
          <Link to="/search">
            <Button variant="primary">
              <Search size={20} />
              Search New Topic
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{searches.length}</div>
            <div className="text-gray-600">Total Topics</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {searches.filter(s => new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-gray-600">This Week</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {searches.filter(s => new Date(s.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-gray-600">This Month</div>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-6 mb-6 border-red-200 bg-red-50">
            <p className="text-red-700 font-medium">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadSearches}
              className="mt-3"
            >
              Try Again
            </Button>
          </Card>
        )}

        {/* Topics List */}
        {searches.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No topics yet</h3>
            <p className="text-gray-600 mb-6">
              Start your learning journey by searching for a topic!
            </p>
            <Link to="/search">
              <Button variant="primary" size="lg">
                <Search size={20} />
                Search Your First Topic
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
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

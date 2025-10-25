import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Calendar, ArrowLeft, Search, Trash2, Eye, Clock, RefreshCw, AlertTriangle ,CheckCircle} from "lucide-react"; // Added Clock, RefreshCw, AlertTriangle
import config from "../config";

// --- Reusable Components (Keep these as they are) ---
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

const Badge = ({ children, variant = "default", className = "" }) => { // Added className prop
  const variants = {
    default: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700", // Added danger variant
    processing: "bg-purple-100 text-purple-700 animate-pulse" // Added processing variant
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1.5 ${variants[variant]} ${className}`}> {/* Added inline-flex and gap */}
      {children}
    </span>
  );
};

const Loader = ({ message = "Loading..." }) => ( // Added message prop
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">{message}</p>
  </div>
);
// --- End Reusable Components ---


// --- Updated TopicCard Component ---
const TopicCard = ({ search, onView, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'; // Handle case where date might be missing
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determine badge variant based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success"><CheckCircle size={14} /> Completed</Badge>;
      case 'processing':
        return <Badge variant="processing"><RefreshCw size={14} className="animate-spin" /> Processing</Badge>;
      case 'failed':
        return <Badge variant="danger"><AlertTriangle size={14} /> Failed</Badge>;
      default:
        return <Badge variant="warning">Unknown</Badge>;
    }
  };

  const isViewable = search.status === 'completed';

  return (
    <Card className="p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        {/* Left Side: Topic Info */}
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="text-blue-600 flex-shrink-0" size={24} />
            <h3 className="text-xl font-bold text-gray-900 truncate" title={search.topic}>{search.topic}</h3>
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-sm mb-4 pl-9"> {/* Indent metadata */}
            <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{formatDate(search.createdAt)}</span>
            </div>
            {/* Display Status Badge */}
            {getStatusBadge(search.status)}
          </div>
          {/* Optional: Show short description or number of items if available */}
          {/* <p className="text-sm text-gray-600 pl-9">Contains modules, quizzes, and more...</p> */}
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onView(search)}
            disabled={!isViewable} // Disable view if not completed
            title={isViewable ? "View Topic Details" : "Topic is still processing or failed"}
          >
            <Eye size={16} />
            View
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(search._id)}
            title="Delete Topic"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};
// --- End Updated TopicCard Component ---


function MyTopicsPage() {
  const [user, setUser] = useState(null); // Keep user info if needed
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = config.API_BASE_URL;

  // Function to load searches - added error state clearing
  const loadSearches = async () => {
    if (!token) {
      navigate('/login'); // Redirect if no token
      return;
    }
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await fetch(`${API_BASE_URL}/api/search`, { // Correct endpoint
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json(); // Always try to parse JSON

      if (response.ok) {
        if (data.success) {
          setSearches(data.searches || []);
        } else {
          // Handle cases where API returns success: false
          throw new Error(data.message || 'Failed to load searches');
        }
      } else {
         // Throw error with message from backend if available
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error loading searches:', err);
      // More specific error handling could be added here (e.g., for 401 Unauthorized)
      setError('Failed to load your topics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load searches on initial mount
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // Mock user data (replace with actual user fetching/token decoding if needed)
    setUser({ email: 'user@example.com' });
    loadSearches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]); // Only run when token or navigate changes


  const handleViewTopic = (search) => {
    // Navigate to the topic view page, it will handle loading based on ID
    // Ensure the TopicViewPage component correctly handles 'processing' or 'failed' statuses
    if (search.status === 'completed') {
        navigate(`/topic/${search._id}`);
    } else if (search.status === 'processing') {
        alert('This topic is still being generated. Please wait a moment and refresh.');
        // Optionally automatically refresh the list after a delay
        // setTimeout(loadSearches, 5000);
    } else {
        alert('This topic failed during generation. You may need to delete it and try again.');
    }
  };

  const handleDeleteTopic = async (searchId) => {
    if (!window.confirm('Are you sure you want to delete this topic and its progress? This action cannot be undone.')) {
      return;
    }

    // Optionally show a temporary loading state for the specific item being deleted
    // setSearches(searches.map(s => s._id === searchId ? { ...s, deleting: true } : s));

    try {
      const response = await fetch(`${API_BASE_URL}/api/search/${searchId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const result = await response.json(); // Try parsing JSON response

      if (response.ok && result.success) {
        // Remove deleted item from state
        setSearches(currentSearches => currentSearches.filter(search => search._id !== searchId));
        // Optionally show a success notification
      } else {
        throw new Error(result.message || 'Failed to delete topic');
      }
    } catch (err) {
      console.error('Error deleting topic:', err);
      alert(`Failed to delete topic: ${err.message}. Please try again.`);
      // Optionally reset deleting state if you implemented it
      // setSearches(searches.map(s => s._id === searchId ? { ...s, deleting: false } : s));
    }
  };

  // --- Render Logic ---

  if (loading && searches.length === 0) { // Show full page loader only on initial load
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader message="Loading your topics..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex"> {/* Hide on very small screens */}
                <ArrowLeft size={20} />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Topics
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Your generated learning paths and progress
              </p>
            </div>
          </div>
          <div className="flex gap-2">
             <Button variant="secondary" size="md" onClick={loadSearches} disabled={loading} title="Refresh topic list">
                 <RefreshCw size={18} className={loading ? 'animate-spin' : ''}/>
                 {loading ? 'Refreshing...' : 'Refresh'}
             </Button>
             <Link to="/search">
                 <Button variant="primary">
                     <Search size={20} />
                     Search New Topic
                 </Button>
             </Link>
          </div>
        </div>

        {/* Stats (Removed for simplicity, add back if needed) */}

        {/* Error Message */}
        {error && (
          <Card className="p-4 sm:p-6 mb-6 border-red-200 bg-red-50">
             <div className="flex items-center justify-between">
                 <p className="text-red-700 font-medium">{error}</p>
                 <Button
                     variant="secondary"
                     size="sm"
                     onClick={loadSearches}
                     disabled={loading}
                 >
                     <RefreshCw size={16} /> Try Again
                 </Button>
             </div>
          </Card>
        )}

        {/* Topics List */}
        {!loading && searches.length === 0 && !error ? ( // Show only if not loading, no searches, and no error
          <Card className="p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No topics found</h3>
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
                // Pass status down
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTopicsPage;
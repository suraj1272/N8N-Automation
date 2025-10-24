import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Use useNavigate instead of window.location
import { BookOpen, LogOut, Search, Clock, RefreshCw, Eye, Trash2, AlertTriangle, CheckCircle } from "lucide-react"; // Added/cleaned up icons
import config from "../config";

// --- Reusable Components (Keep these as they are or as updated previously) ---
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
    <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    processing: "bg-purple-100 text-purple-700 animate-pulse"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1.5 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Loader = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">{message}</p>
  </div>
);

// --- End Reusable Components ---

function Dashboard() {
  const [user, setUser] = useState(null); // Store basic user info
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [searchHistory, setSearchHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true); // Specific loading state for history
  const [historyError, setHistoryError] = useState(null); // Specific error state for history
  const navigate = useNavigate();

  const API_BASE_URL = config.API_BASE_URL; // Should be '' for production build

  // --- Effect to check token and load initial data ---
  useEffect(() => {
    if (!token) {
      navigate('/login'); // Use navigate for internal routing
      return;
    }
    // TODO: Replace mock user with actual user info (e.g., decode JWT or fetch /api/auth/me)
    setUser({ email: 'user@example.com' });
    loadSearchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]); // Dependencies for this effect

  // --- Logout Handler ---
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    setSearchHistory([]);
    navigate('/login'); // Redirect to login page
  };

  // --- Load Search History ---
  const loadSearchHistory = async () => {
    if (!token) return;
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/search`, { // Correct endpoint
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const result = await response.json(); // Always try parsing

      if (response.ok && result.success) {
        setSearchHistory(result.searches || []); // Use the 'searches' array
      } else {
         // Throw error using message from backend if available
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error loading search history:', err);
      setHistoryError('Failed to load your recent topics. Please try again.');
    } finally {
      setLoadingHistory(false);
    }
  };

  // --- Handle Clicking a Previous Search ---
  // Renamed from loadPreviousSearch for clarity
  const handleViewTopic = (searchId) => {
     // Navigate to the dedicated topic view page.
     // That page will handle fetching the details and showing status.
     navigate(`/topic/${searchId}`);
  };


  // --- Render Logic ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <BookOpen className="text-white" size={40} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Learning Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Welcome back! Manage your topics and track your progress.
          </p>
        </div>

        {/* User Info & Actions Card */}
        <Card className="p-4 sm:p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {user?.email ? user.email[0].toUpperCase() : '?'}
              </div>
              <div>
                <p className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs">{user?.email}</p>
                <p className="text-sm text-gray-500">Your Learning Space</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/search">
                <Button variant="primary" size="md">
                  <Search size={18} />
                  New Topic
                </Button>
              </Link>
              <Link to="/my-topics">
                 <Button variant="secondary" size="md">
                   <BookOpen size={18} />
                   My Topics
                 </Button>
               </Link>
              <Button variant="danger" size="md" onClick={handleLogout}>
                <LogOut size={18} />
                Logout
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent Searches Section */}
        <Card className="p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                 <Clock className="text-gray-600" size={20} />
                 <h3 className="text-xl font-semibold text-gray-900">Recent Topics</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={loadSearchHistory} disabled={loadingHistory}>
                 <RefreshCw size={16} className={loadingHistory ? 'animate-spin' : ''}/>
                 {loadingHistory ? 'Refreshing...' : 'Refresh'}
              </Button>
          </div>

          {loadingHistory && <Loader message="Loading history..." />}

          {historyError && (
             <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
               {historyError}
             </div>
          )}

          {!loadingHistory && !historyError && searchHistory.length === 0 && (
             <p className="text-gray-500 text-center py-4">You haven't searched for any topics yet.</p>
          )}

          {!loadingHistory && !historyError && searchHistory.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {/* Show only the 5 most recent */}
              {searchHistory.slice(0, 5).map((search) => (
                <button
                  key={search._id}
                  onClick={() => handleViewTopic(search._id)} // Pass only ID
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center gap-2"
                  title={`View topic: ${search.topic}`}
                >
                   {/* Optionally add status icon */}
                   {search.status === 'completed' && <CheckCircle size={14} className="text-green-600"/>}
                   {search.status === 'processing' && <RefreshCw size={14} className="text-purple-600 animate-spin"/>}
                   {search.status === 'failed' && <AlertTriangle size={14} className="text-red-600"/>}
                   {search.topic}
                </button>
              ))}
              {searchHistory.length > 5 && (
                 <Link to="/my-topics" className="px-4 py-2 text-sm font-medium text-blue-600 hover:underline">
                   View all ({searchHistory.length}) →
                 </Link>
              )}
            </div>
          )}
        </Card>

         {/* Removed the search input and generate button from here */}
         {/* Removed the display area for 'data' - this belongs on the TopicViewPage */}

      </div>
    </div>
  );
}

export default Dashboard;
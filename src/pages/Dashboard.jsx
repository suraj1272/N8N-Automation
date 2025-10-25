import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Use useNavigate instead of window.location
import { BookOpen, LogOut, Search, Clock, RefreshCw, Eye, Trash2, AlertTriangle, CheckCircle, Sparkles, Zap, Brain, Trophy } from "lucide-react"; // Added/cleaned up icons
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import TopNavigation from "../components/TopNavigation";
import Card from "../components/Card";
import Button from "../components/Button";

// --- Reusable Components (Keep these as they are or as updated previously) ---
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

const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div
      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

// New reusable component for floating icons (modern touch)
const FloatingIcon = ({ icon: Icon, className = "", delay = 0 }) => (
  <div className={`absolute opacity-10 animate-bounce ${className}`} style={{ animationDelay: `${delay}s` }}>
    <Icon size={32} className="text-blue-400" />
  </div>
);

// Enhanced Hero Section for Dashboard
const DashboardHero = () => (
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
        Learning Dashboard
      </h1>
      <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light animate-fade-in animation-delay-200">
        Welcome back! Dive into your personalized learning journey and track your progress with cutting-edge insights.
      </p>
    </div>
  </div>
);

// Enhanced User Info Card
const UserInfoCard = ({ user }) => (
  <Card className="p-8 mb-10 shadow-2xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl hover:shadow-3xl transition-all duration-300">
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg">
          {user?.email ? user.email[0].toUpperCase() : '?'}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-xl truncate max-w-[300px]">{user?.email}</p>
          <p className="text-base text-gray-500 font-medium">Your Personalized Learning Hub</p>
        </div>
      </div>
      <div className="ml-auto">
        <Zap className="text-cyan-500 animate-pulse" size={32} />
      </div>
    </div>
  </Card>
);

// --- End Reusable Components ---

function Dashboard() {
  const { user, logout } = useAuth();
  const [searchHistory, setSearchHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true); // Specific loading state for history
  const [historyError, setHistoryError] = useState(null); // Specific error state for history
  const [progressData, setProgressData] = useState({});
  const navigate = useNavigate();

  // --- Effect to load initial data ---
  useEffect(() => {
    loadSearchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencies for this effect

  // --- Logout Handler ---
  const handleLogout = () => {
    logout();
    setSearchHistory([]);
  };

  // --- Load Search History ---
  const loadSearchHistory = async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const response = await api.get('/api/search');
      const result = await response.json();

      if (response.ok && result.success) {
        const searches = result.searches || [];
        setSearchHistory(searches);

        // Load progress for each search
        const progressPromises = searches.map(async (search) => {
          try {
            const progressResponse = await api.get(`/api/progress/${search._id}`);
            if (progressResponse.ok) {
              const progressResult = await progressResponse.json();
              return { searchId: search._id, progress: progressResult.progress || {} };
            }
          } catch (err) {
            console.error('Error loading progress for search:', search._id, err);
          }
          return { searchId: search._id, progress: {} };
        });

        const progressResults = await Promise.all(progressPromises);
        const progressMap = {};
        progressResults.forEach(({ searchId, progress }) => {
          progressMap[searchId] = progress;
        });
        setProgressData(progressMap);
      } else {
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background pattern for modern feel */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-purple-200 transform rotate-12 scale-150"></div>
      </div>
      
      <TopNavigation />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <DashboardHero />

        <UserInfoCard user={user} />

        {/* Recent Searches Section */}
        <Card className="p-8 mb-10 shadow-2xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl">
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <Clock className="text-gray-600" size={24} />
                 <h3 className="text-2xl font-bold text-gray-900">Recent Topics</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={loadSearchHistory} disabled={loadingHistory} className="hover:bg-cyan-100 transition-colors">
                 <RefreshCw size={18} className={loadingHistory ? 'animate-spin' : ''}/>
                 {loadingHistory ? 'Refreshing...' : 'Refresh'}
              </Button>
          </div>

          {loadingHistory && <Loader message="Loading history..." />}

          {historyError && (
             <div className="p-6 border border-red-300 bg-red-50 rounded-xl text-red-700 shadow-md animate-slide-in">
               <div className="flex items-center gap-3">
                 <AlertTriangle className="text-red-500" size={24} />
                 {historyError}
               </div>
             </div>
          )}

          {!loadingHistory && !historyError && searchHistory.length === 0 && (
             <p className="text-gray-500 text-center py-8 text-lg">You haven't searched for any topics yet. Start your learning journey!</p>
          )}

          {!loadingHistory && !historyError && searchHistory.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Show only the 6 most recent */}
              {searchHistory.slice(0, 6).map((search) => {
                const searchProgress = progressData[search._id] || {};
                const modulesRead = searchProgress.modulesRead || [];
                const quizzesCompleted = searchProgress.quizzesCompleted || [];

                // Get total modules and quizzes from search data (if available)
                let totalModules = 0;
                let totalQuizzes = 0;

                // Only calculate totals if responseData exists and search is completed
                if (search.responseData && search.status === 'completed') {
                  try {
                    // responseData is already an object, no need to parse
                    const searchData = search.responseData;
                    if (searchData.modules) totalModules = Array.isArray(searchData.modules) ? searchData.modules.length : 0;
                    if (searchData.quiz) totalQuizzes = Array.isArray(searchData.quiz) ? searchData.quiz.length : 0;

                    // Handle levels structure
                    if (searchData.levels) {
                      Object.values(searchData.levels).forEach(level => {
                        if (Array.isArray(level.modules)) totalModules += level.modules.length;
                        if (Array.isArray(level.quiz)) totalQuizzes += level.quiz.length;
                      });
                    }
                  } catch (err) {
                    console.error('Error parsing search data:', err);
                  }
                }

                const modulesProgress = totalModules > 0 ? (modulesRead.length / totalModules) * 100 : 0;
                const quizzesProgress = totalQuizzes > 0 ? (quizzesCompleted.length / totalQuizzes) * 100 : 0;
                const overallProgress = totalModules + totalQuizzes > 0 ?
                  ((modulesRead.length + quizzesCompleted.length) / (totalModules + totalQuizzes)) * 100 : 0;

                return (
                  <Card key={search._id} className="p-6 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm rounded-xl border-0 hover:scale-105">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-gray-900 text-xl leading-tight">{search.topic}</h4>
                      <Badge variant={search.status === 'completed' ? 'success' : search.status === 'processing' ? 'processing' : 'danger'} className="shadow-sm">
                        {search.status === 'completed' && <CheckCircle size={16} />}
                        {search.status === 'processing' && <RefreshCw size={16} />}
                        {search.status === 'failed' && <AlertTriangle size={16} />}
                        {search.status}
                      </Badge>
                    </div>

                    {/* Overall Progress - TopicViewPage style */}
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                        <span className="text-sm font-semibold text-gray-700">{modulesRead.length + quizzesCompleted.length}/{totalModules + totalQuizzes} completed</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${overallProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Module Progress - TopicViewPage style */}
                    {totalModules > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <BookOpen className="text-blue-600" size={20} />
                            <h5 className="font-semibold text-gray-900">Learning Modules</h5>
                          </div>
                          <Badge variant="default" className="shadow-sm">
                            {modulesRead.length}/{totalModules} Complete
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${modulesProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Quiz Progress - TopicViewPage style */}
                    {totalQuizzes > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="text-purple-600" size={20} />
                            <h5 className="font-semibold text-gray-900">Knowledge Check</h5>
                          </div>
                          <Badge variant="warning" className="shadow-sm">
                            {quizzesCompleted.length}/{totalQuizzes} Answered
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${quizzesProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <Button variant="primary" size="sm" onClick={() => handleViewTopic(search._id)} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg">
                      <Eye size={16} />
                      View Topic
                    </Button>
                  </Card>
                );
              })}
              {searchHistory.length > 6 && (
                <div className="col-span-full text-center">
                  <Link to="/my-topics" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold">
                    <BookOpen size={20} />
                    View All Topics ({searchHistory.length})
                  </Link>
                </div>
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

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Code, Video, Download, Search, CheckCircle, Circle, Trophy, LogOut, Sparkles, Zap, Brain } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import TopNavigation from "../components/TopNavigation";
import Card from "../components/Card";
import Button from "../components/Button";

const Input = ({ value, onChange, placeholder, className = "" }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
  />
);

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
    <p className="mt-6 text-gray-600 font-medium animate-pulse">Generating your content...</p>
  </div>
);

const ModuleCard = ({ module, index, isRead, onMarkRead }) => (
  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          {isRead ? (
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          ) : (
            <Circle className="text-gray-400 flex-shrink-0" size={20} />
          )}
          <h4 className="font-semibold text-gray-900">{module.title}</h4>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed ml-7">{module.content}</p>
      </div>
      <Button
        variant={isRead ? "success" : "primary"}
        size="sm"
        onClick={onMarkRead}
        disabled={isRead}
      >
        {isRead ? "Read" : "Mark Read"}
      </Button>
    </div>
  </div>
);

const QuizCard = ({ quiz, index, isCompleted, onMarkComplete }) => (
  <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
    <div className="flex items-start justify-between gap-4 mb-3">
      <div className="flex items-start gap-2 flex-1">
        <span className="font-bold text-purple-600 mt-1">Q{index + 1}</span>
        <p className="font-medium text-gray-900">{quiz.question}</p>
      </div>
      <Button
        variant={isCompleted ? "success" : "primary"}
        size="sm"
        onClick={onMarkComplete}
        disabled={isCompleted}
      >
        {isCompleted ? "Done" : "Complete"}
      </Button>
    </div>
    <div className="ml-8 p-3 bg-white rounded-lg border border-green-200">
      <p className="text-sm text-gray-700">
        <span className="font-semibold text-green-700">Answer:</span> {quiz.answer}
      </p>
    </div>
  </div>
);

const CodingProblemCard = ({ problem, index }) => (
  <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-200">
    <div className="flex items-center gap-2 mb-3">
      <Code className="text-blue-600" size={20} />
      <h4 className="font-semibold text-gray-900">Problem {index + 1}</h4>
    </div>
    <p className="text-gray-700 mb-4">{problem.problem}</p>
    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
      <pre className="text-sm text-green-400 font-mono">
        <code>{problem.solution}</code>
      </pre>
    </div>
  </div>
);

// New reusable component for floating icons (modern touch)
const FloatingIcon = ({ icon: Icon, className = "", delay = 0 }) => (
  <div className={`absolute opacity-10 animate-bounce ${className}`} style={{ animationDelay: `${delay}s` }}>
    <Icon size={32} className="text-blue-400" />
  </div>
);

// Enhanced Hero Section with animations and floating elements
const HeroSection = () => (
  <div className="relative text-center mb-16 overflow-hidden">
    {/* Floating background icons */}
    <FloatingIcon icon={Sparkles} className="top-10 left-10" delay={0} />
    <FloatingIcon icon={Zap} className="top-20 right-20" delay={1} />
    <FloatingIcon icon={Brain} className="bottom-10 left-1/4" delay={2} />
    
    <div className="relative z-10">
      <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full mb-8 shadow-2xl animate-pulse">
        <Search className="text-white animate-spin" size={56} style={{ animationDuration: '3s' }} />
      </div>
      <h1 className="text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight animate-fade-in">
        Search & Learn
      </h1>
      <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light animate-fade-in animation-delay-200">
        Unleash the power of AI to create personalized learning journeys. Explore, discover, and master any topic with cutting-edge technology.
      </p>
    </div>
  </div>
);

// Enhanced Search Form with modern styling
const SearchForm = ({ topic, setTopic, onGenerate, loading }) => (
  <Card className="p-10 mb-10 shadow-2xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl hover:shadow-3xl transition-all duration-300">
    <div className="flex flex-col md:flex-row gap-6 items-center">
      <div className="flex-1 w-full relative">
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter any topic... e.g., Quantum Computing"
          className="text-xl py-5 pl-6 pr-12 rounded-xl border-2 border-gray-100 focus:border-cyan-400 shadow-inner"
        />
        <Sparkles className="absolute right-4 top-1/2 transform -translate-y-1/2 text-cyan-400" size={24} />
      </div>
      <Button 
        variant="primary" 
        onClick={onGenerate} 
        disabled={loading}
        className="px-10 py-5 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl"
      >
        <Zap size={28} className="mr-3" />
        {loading ? 'Generating...' : 'Ignite Learning'}
      </Button>
    </div>
    <p className="text-base text-gray-500 mt-6 text-center font-medium">
      🚀 Transform your curiosity into knowledge with AI-powered content generation.
    </p>
  </Card>
);

// Enhanced Error Display with dismiss functionality
const ErrorDisplay = ({ error, onDismiss }) => (
  <Card className="p-6 mb-6 border-red-400 bg-red-50 shadow-lg rounded-xl animate-slide-in">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-white text-sm font-bold">⚠️</span>
        </div>
        <p className="text-red-800 font-semibold">{error}</p>
      </div>
      <button 
        onClick={onDismiss} 
        className="text-red-600 hover:text-red-800 transition-colors"
      >
        ✕
      </button>
    </div>
  </Card>
);

// New component for inspirational quotes or tips
const InspirationCard = () => (
  <Card className="p-8 mt-16 shadow-xl border-0 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
    <div className="text-center">
      <Brain className="mx-auto mb-4 text-indigo-600" size={48} />
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Explore?</h3>
      <p className="text-gray-600 text-lg leading-relaxed">
        Try topics like "Machine Learning Algorithms", "React Best Practices", or "Cryptocurrency Explained". 
        Your personalized learning adventure awaits!
      </p>
    </div>
  </Card>
);

function SearchPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    logout();
  };

  const handleGenerate = async () => {
    if (!topic) {
      alert("Please enter a topic");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/search', { topic });

      // --- NEW LOGIC START ---

      // Check if the response status is 202 (Accepted)
      if (response.status === 202) {
        const result = await response.json(); // Get the { message, searchId, status }
        console.log("✅ Processing initiated:", result);
        // Optionally: Show a success message briefly before redirecting
        // Example: alert("Processing started! You'll be redirected to My Topics.");
        navigate('/my-topics'); // Redirect to where the user can see status
        // --- NEW LOGIC END ---

      } else if (!response.ok) {
        // Handle other non-ok responses (like 400, 404, 500, 504)
        let errorResult;
        try {
          // Try to parse error JSON from backend
          errorResult = await response.json();
        } catch (jsonError) {
          // If response is not JSON (e.g., plain text or HTML error page)
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Throw specific error message from backend if available
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);

      } else {
         // Handle unexpected success (200 OK - should not happen now)
         // This case might indicate the backend hasn't been updated yet
         console.warn("Received unexpected 200 OK response, expected 202 Accepted.");
         const result = await response.json();
         // Attempt to navigate anyway, but log the warning
         navigate('/my-topics');
      }

    } catch (err) {
      console.error("Error initiating content generation:", err);

      // More specific error messages based on potential backend responses
      if (err.message.includes('INITIAL_TIMEOUT') || err.message.includes('504')) {
        setError("The request to start generation timed out. Please try again.");
      } else if (err.message.includes('WEBHOOK_NOT_FOUND') || err.message.includes('404')) {
        // Note: A 404 *could* also mean the /api/search endpoint itself wasn't found
        setError("Could not find the generation service. Please check configuration or contact support.");
      } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
         setError("Authentication error. Please log out and log back in.");
      }
       else {
        setError(`Failed to start generation: ${err.message}. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const dismissError = () => setError(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background pattern for modern feel */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-purple-200 transform rotate-12 scale-150"></div>
      </div>
      
      <TopNavigation />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <HeroSection />

        <SearchForm 
          topic={topic} 
          setTopic={setTopic} 
          onGenerate={handleGenerate} 
          loading={loading} 
        />

        {loading && (
          <Card className="p-16 shadow-2xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl">
            <Loader />
          </Card>
        )}

        {error && <ErrorDisplay error={error} onDismiss={dismissError} />}

        <InspirationCard />
      </div>
    </div>
  );
}

export default SearchPage;

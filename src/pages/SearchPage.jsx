import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Code, Video, Download, Search, CheckCircle, Circle, Trophy } from "lucide-react";
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
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">Generating your content...</p>
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

function SearchPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = config.API_BASE_URL;

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
  }, [token]);

const handleGenerate = async () => {
    if (!topic || !token) {
      alert("Please enter a topic and ensure you're logged in");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ topic }),
      });

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <Search className="text-white" size={40} />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Search & Learn
          </h1>
          <p className="text-xl text-gray-600">
            Generate personalized learning content for any topic
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter any topic... e.g., Introduction to Python"
              />
            </div>
            <Button variant="primary" onClick={handleGenerate} disabled={loading}>
              <Search size={20} />
              {loading ? 'Generating...' : 'Generate'}
            </Button>
            <Link to="/dashboard">
              <Button variant="secondary">
                Back to Dashboard
              </Button>
            </Link>
          </div>const ha
        </Card>

        {loading && <Card className="p-8"><Loader /></Card>}

        {error && (
          <Card className="p-6 mb-6 border-red-200 bg-red-50">
            <p className="text-red-700 font-medium">{error}</p>
          </Card>
        )}

      </div>
    </div>
  );
}

export default SearchPage;


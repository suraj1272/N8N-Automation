import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BookOpen, Code, Video, Download, ArrowLeft, CheckCircle, Circle, Trophy } from "lucide-react";
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
    <p className="mt-4 text-gray-600 font-medium">Loading topic...</p>
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
        {module.content && <p className="text-gray-600 text-sm leading-relaxed ml-7">{module.content}</p>}
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
    {quiz.answer && (
      <div className="ml-8 p-3 bg-white rounded-lg border border-green-200">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-green-700">Answer:</span> {quiz.answer}
        </p>
      </div>
    )}
  </div>
);

const CodingProblemCard = ({ problem, index }) => (
  <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-200">
    <div className="flex items-center gap-2 mb-3">
      <Code className="text-blue-600" size={20} />
      <h4 className="font-semibold text-gray-900">Problem {index + 1}</h4>
    </div>
    <p className="text-gray-700 mb-4">{problem.problem}</p>
    {problem.solution && (
      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm text-green-400 font-mono">
          <code>{problem.solution}</code>
        </pre>
      </div>
    )}
  </div>
);

function TopicViewPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [topic, setTopic] = useState("");
  const [data, setData] = useState({
    modules: [],
    quiz: [],
    coding_problems: [],
    youtube_videos: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({
    modulesRead: [],
    quizzesCompleted: []
  });

  const API_BASE_URL = config.API_BASE_URL;

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setUser({ email: 'user@example.com' });
    loadTopic();
  }, [token, id]);

  const loadTopic = async () => {
    if (!token || !id) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/search/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const res = await response.json();

        // Normalize data safely
        let mergedModules = [];
        let mergedQuizzes = [];
        let mergedCoding = [];
        let mergedVideos = [];

        if (res.data) {
          mergedModules = Array.isArray(res.data.modules) ? res.data.modules : [];
          mergedQuizzes = Array.isArray(res.data.quiz) ? res.data.quiz : [];
          mergedCoding = Array.isArray(res.data.coding_problems) ? res.data.coding_problems : [];
          mergedVideos = Array.isArray(res.data.youtube_videos) ? res.data.youtube_videos : [];

          if (res.data.levels) {
            Object.values(res.data.levels).forEach(level => {
              if (Array.isArray(level.modules)) mergedModules.push(...level.modules);
              if (Array.isArray(level.quiz)) mergedQuizzes.push(...level.quiz);
              if (Array.isArray(level.coding_problems)) mergedCoding.push(...level.coding_problems);
              if (Array.isArray(level.youtube_videos)) mergedVideos.push(...level.youtube_videos);
            });
          }
        }

        setTopic(res.topic || res.data?.topic || "Unknown Topic");
        setData({
          modules: mergedModules,
          quiz: mergedQuizzes,
          coding_problems: mergedCoding,
          youtube_videos: mergedVideos
        });

        loadProgress(id);
      } else {
        throw new Error('Failed to load topic');
      }
    } catch (err) {
      console.error('Error loading topic:', err);
      setError('Failed to load topic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async (searchId) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/progress/${searchId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const prog = await response.json();
        setProgress({
          modulesRead: Array.isArray(prog.modulesRead) ? prog.modulesRead : [],
          quizzesCompleted: Array.isArray(prog.quizzesCompleted) ? prog.quizzesCompleted : []
        });
      }
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  };

  const updateProgress = async (type, index) => {
    if (!id || !token) return;
    const newProgress = { ...progress };
    if (type === 'module') {
      if (!newProgress.modulesRead.includes(index)) newProgress.modulesRead.push(index);
    } else if (type === 'quiz') {
      if (!newProgress.quizzesCompleted.includes(index)) newProgress.quizzesCompleted.push(index);
    }

    try {
      await fetch(`${API_BASE_URL}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          searchId: id,
          modulesRead: newProgress.modulesRead,
          quizzesCompleted: newProgress.quizzesCompleted,
        }),
      });
      setProgress(newProgress);
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handleDownload = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${topic.replace(/\s+/g, '_')}_learning_data.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const totalProgress = (progress?.modulesRead?.length || 0) + (progress?.quizzesCompleted?.length || 0);
  const totalItems = (data?.modules?.length || 0) + (data?.quiz?.length || 0);

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/my-topics">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} /> Back to My Topics
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{topic}</h1>
              <p className="text-gray-600 mt-1">Your personalized learning path</p>
            </div>
          </div>
          <Button variant="success" onClick={handleDownload}>
            <Download size={20} /> Download
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{topic}</h2>
                <p className="opacity-90">Your personalized learning path</p>
              </div>
              <Trophy size={48} className="opacity-80" />
            </div>
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{totalProgress}/{totalItems} completed</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalItems > 0 ? (totalProgress / totalItems) * 100 : 0}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Modules */}
          {Array.isArray(data?.modules) && data.modules.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-blue-600" size={24} />
                  <h3 className="text-2xl font-bold text-gray-900">Learning Modules</h3>
                </div>
                <Badge variant="default">
                  {progress.modulesRead.length}/{data.modules.length} Complete
                </Badge>
              </div>
              <div className="space-y-3">
                {data.modules.map((module, index) => (
                  <ModuleCard
                    key={index}
                    module={module}
                    index={index}
                    isRead={progress.modulesRead.includes(index)}
                    onMarkRead={() => updateProgress('module', index)}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Quizzes */}
          {Array.isArray(data?.quiz) && data.quiz.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-purple-600" size={24} />
                  <h3 className="text-2xl font-bold text-gray-900">Knowledge Check</h3>
                </div>
                <Badge variant="warning">
                  {progress.quizzesCompleted.length}/{data.quiz.length} Answered
                </Badge>
              </div>
              <div className="space-y-4">
                {data.quiz.map((q, index) => (
                  <QuizCard
                    key={index}
                    quiz={q}
                    index={index}
                    isCompleted={progress.quizzesCompleted.includes(index)}
                    onMarkComplete={() => updateProgress('quiz', index)}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Coding Problems */}
          {Array.isArray(data?.coding_problems) && data.coding_problems.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Code className="text-blue-600" size={24} />
                <h3 className="text-2xl font-bold text-gray-900">Coding Challenges</h3>
              </div>
              <div className="space-y-4">
                {data.coding_problems.map((prob, index) => (
                  <CodingProblemCard key={index} problem={prob} index={index} />
                ))}
              </div>
            </Card>
          )}

          {/* YouTube Videos */}
          {Array.isArray(data?.youtube_videos) && data.youtube_videos.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Video className="text-red-600" size={24} />
                <h3 className="text-2xl font-bold text-gray-900">Video Resources</h3>
              </div>
              <div className="grid gap-3">
                {data.youtube_videos.map((video, index) => (
                  <a
                    key={index}
                    href={video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                  >
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="text-white" size={20} />
                    </div>
                    <span className="text-gray-700 group-hover:text-blue-600 transition-colors flex-1 truncate">{video}</span>
                    <span className="text-gray-400 group-hover:text-blue-600">→</span>
                  </a>
                ))}
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}

export default TopicViewPage;

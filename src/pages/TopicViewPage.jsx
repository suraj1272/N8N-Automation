import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BookOpen, Code, Video, Download, ArrowLeft, CheckCircle, Circle, Trophy, LogOut, Sparkles, Zap, Brain, Target } from "lucide-react";
import jsPDF from "jspdf";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import TopNavigation from "../components/TopNavigation";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Loader from "../components/Loader";
import TopicHeader from "../components/TopicHeader";
import ProgressCard from "../components/ProgressCard";
import ModuleCard from "../components/ModuleCard";
import QuizCard from "../components/QuizCard";
import CodingProblemCard from "../components/CodingProblemCard";

function TopicViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  useEffect(() => {
    loadTopic();
  }, [id]);

  const handleLogout = () => {
    logout();
  };

  const loadTopic = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.get(`/api/search/${id}`);
      const res = await response.json();

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
    } catch (err) {
      console.error('Error loading topic:', err);
      setError('Failed to load topic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async (searchId) => {
    try {
      const response = await api.get(`/api/progress/${searchId}`);
      const prog = await response.json();
      setProgress({
        modulesRead: Array.isArray(prog.progress?.modulesRead) ? prog.progress.modulesRead : [],
        quizzesCompleted: Array.isArray(prog.progress?.quizzesCompleted) ? prog.progress.quizzesCompleted : []
      });
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  };

  const updateProgress = async (type, index) => {
    if (!id) return;
    const newProgress = { ...progress };
    if (type === 'module') {
      if (!newProgress.modulesRead.includes(index)) newProgress.modulesRead.push(index);
    } else if (type === 'quiz') {
      if (!newProgress.quizzesCompleted.includes(index)) newProgress.quizzesCompleted.push(index);
    }

    try {
      await api.post('/api/progress', {
        searchId: id,
        progress: {
          modulesRead: newProgress.modulesRead,
          quizzesCompleted: newProgress.quizzesCompleted,
        },
      });
      setProgress(newProgress);
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handleDownloadCertificate = () => {
    const doc = new jsPDF();

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Certificate of Completion", 105, 40, { align: "center" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text("This is to certify that", 105, 60, { align: "center" });

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(user?.email || 'User', 105, 75, { align: "center" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text("has successfully completed the learning path for:", 105, 90, { align: "center" });

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(topic, 105, 110, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Completed on: ${new Date().toLocaleDateString()}`, 105, 130, { align: "center" });

    doc.text(`Modules Completed: ${progress.modulesRead.length}/${data.modules.length}`, 105, 150, { align: "center" });
    doc.text(`Quizzes Completed: ${progress.quizzesCompleted.length}/${data.quiz.length}`, 105, 165, { align: "center" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Congratulations on your achievement!", 105, 185, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.text("Generated by Learning Frontend", 105, 210, { align: "center" });

    doc.save(`${topic.replace(/\s+/g, '_')}_certificate.pdf`);
  };

  const totalProgress = (progress?.modulesRead?.length || 0) + (progress?.quizzesCompleted?.length || 0);
  const totalItems = (data?.modules?.length || 0) + (data?.quiz?.length || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 relative overflow-hidden">
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-purple-200 transform rotate-12 scale-150"></div>
        </div>
        
        <TopNavigation onLogout={handleLogout} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <Card className="p-8 border-red-300 bg-red-50 shadow-xl rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">⚠️</span>
              </div>
              <p className="text-red-800 font-semibold text-lg">{error}</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-purple-200 transform rotate-12 scale-150"></div>
      </div>
      
      <TopNavigation onLogout={handleLogout} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/my-topics">
            <Button variant="ghost" size="sm" className="hover:bg-white/50 backdrop-blur-sm shadow-sm">
              <ArrowLeft size={20} /> Back to My Topics
            </Button>
          </Link>
        </div>

        <TopicHeader topic={topic} />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mb-8">
          <Button
            variant="primary"
            onClick={handleDownloadCertificate}
            disabled={totalProgress !== totalItems || totalItems === 0}
            className={`px-6 py-3 text-lg font-semibold shadow-xl ${
              totalProgress === totalItems && totalItems > 0
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <Trophy size={24} /> 
            {totalProgress === totalItems && totalItems > 0 ? "Download Certificate" : "Complete All to Unlock"}
          </Button>
        </div>

        <div className="space-y-8">
          <ProgressCard topic={topic} totalProgress={totalProgress} totalItems={totalItems} />

          {/* Modules */}
          {Array.isArray(data?.modules) && data.modules.length > 0 && (
            <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="text-white" size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900">Learning Modules</h3>
                </div>
                <Badge variant="default" className="text-base px-4 py-2">
                  {progress.modulesRead.length}/{data.modules.length} Complete
                </Badge>
              </div>
              <div className="space-y-4">
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
            <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="text-white" size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900">Knowledge Check</h3>
                </div>
                <Badge variant="warning" className="text-base px-4 py-2">
                  {progress.quizzesCompleted.length}/{data.quiz.length} Answered
                </Badge>
              </div>
              <div className="space-y-5">
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
            <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Code className="text-white" size={24} />
                </div>
                <h3 className="text-3xl font-black text-gray-900">Coding Challenges</h3>
              </div>
              <div className="space-y-5">
                {data.coding_problems.map((prob, index) => (
                  <CodingProblemCard key={index} problem={prob} index={index} />
                ))}
              </div>
            </Card>
          )}

          {/* YouTube Videos */}
          {Array.isArray(data?.youtube_videos) && data.youtube_videos.length > 0 && (
            <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Video className="text-white" size={24} />
                </div>
                <h3 className="text-3xl font-black text-gray-900">Video Resources</h3>
              </div>
              <div className="grid gap-4">
                {data.youtube_videos.map((video, index) => (
                  <a
                    key={index}
                    href={video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-6 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <Video className="text-white" size={24} />
                    </div>
                    <span className="text-gray-700 group-hover:text-blue-600 transition-colors flex-1 truncate font-medium text-lg">{video}</span>
                    <span className="text-2xl text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all">→</span>
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
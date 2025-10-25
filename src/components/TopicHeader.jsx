import React from 'react';
import { BookOpen, Sparkles, Target, Brain } from 'lucide-react';
import FloatingIcon from './FloatingIcon';

const TopicHeader = ({ topic }) => (
  <div className="relative text-center mb-12 overflow-hidden">
    {/* Floating background icons */}
    <FloatingIcon icon={Sparkles} className="top-10 left-10" delay={0} />
    <FloatingIcon icon={Target} className="top-20 right-20" delay={1} />
    <FloatingIcon icon={Brain} className="bottom-10 left-1/4" delay={2} />

    <div className="relative z-10">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl animate-pulse">
        <BookOpen className="text-white" size={48} />
      </div>
      <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight">
        {topic}
      </h1>
      <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed font-light">
        Master this topic with personalized modules, quizzes, and hands-on challenges
      </p>
    </div>
  </div>
);

export default TopicHeader;

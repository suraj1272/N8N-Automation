import React from 'react';
import { Trophy } from 'lucide-react';
import Card from './Card';

const ProgressCard = ({ topic, totalProgress, totalItems }) => (
  <Card className="p-8 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 text-white shadow-2xl border-0 rounded-2xl mb-8">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Your Learning Journey</h2>
        <p className="opacity-90 text-lg">Track your progress and achievements</p>
      </div>
      <Trophy size={56} className="opacity-80 animate-pulse" />
    </div>
    <div className="mt-6">
      <div className="flex justify-between mb-3">
        <span className="text-lg font-semibold">Overall Progress</span>
        <span className="text-lg font-semibold">{totalProgress}/{totalItems} completed</span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-4 shadow-inner">
        <div
          className="bg-white h-full rounded-full transition-all duration-500 shadow-lg"
          style={{ width: `${totalItems > 0 ? (totalProgress / totalItems) * 100 : 0}%` }}
        />
      </div>
      <p className="text-sm opacity-90 mt-3">
        {totalProgress === totalItems && totalItems > 0
          ? "🎉 Congratulations! You've completed everything!"
          : `Keep going! ${totalItems - totalProgress} items remaining`}
      </p>
    </div>
  </Card>
);

export default ProgressCard;

import React from 'react';
import { Code } from 'lucide-react';

const CodingProblemCard = ({ problem, index }) => (
  <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <Code className="text-white" size={20} />
      </div>
      <h4 className="font-bold text-gray-900 text-lg">Coding Challenge {index + 1}</h4>
    </div>
    <p className="text-gray-700 mb-5 leading-relaxed">{problem.problem}</p>
    {problem.solution && (
      <div className="bg-gray-900 rounded-xl p-5 overflow-x-auto shadow-inner">
        <pre className="text-sm text-green-400 font-mono">
          <code>{problem.solution}</code>
        </pre>
      </div>
    )}
  </div>
);

export default CodingProblemCard;

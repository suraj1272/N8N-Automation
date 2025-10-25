import React from 'react';
import Button from './Button';

const QuizCard = ({ quiz, index, isCompleted, onMarkComplete }) => (
  <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-start gap-3 flex-1">
        <span className="font-black text-purple-600 text-xl mt-1">Q{index + 1}</span>
        <p className="font-semibold text-gray-900 text-lg">{quiz.question}</p>
      </div>
      <Button
        variant={isCompleted ? "success" : "primary"}
        size="sm"
        onClick={onMarkComplete}
        disabled={isCompleted}
        className={isCompleted ? "opacity-75" : "shadow-md hover:shadow-lg"}
      >
        {isCompleted ? "✓ Done" : "Complete"}
      </Button>
    </div>
    {quiz.answer && (
      <div className="ml-10 p-4 bg-white rounded-lg border-2 border-green-200 shadow-sm">
        <p className="text-sm text-gray-700">
          <span className="font-bold text-green-700">💡 Answer:</span> {quiz.answer}
        </p>
      </div>
    )}
  </div>
);

export default QuizCard;

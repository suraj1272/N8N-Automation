import React, { useState } from "react";

/**
 * Expect quiz format:
 * [{ question, options: [..], answer_index }]
 * or [{ question, answer }]
 */

export default function Quiz({ quiz }) {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState({});
  const [index, setIndex] = useState(0);

  if (!quiz?.length) return <p className="muted">No quiz returned.</p>;

  const current = quiz[index];

  function choose(i, idx) {
    setSelected(prev => ({ ...prev, [i]: idx }));
  }

  function next() {
    setIndex(i => Math.min(quiz.length - 1, i + 1));
  }
  function prev() {
    setIndex(i => Math.max(0, i - 1));
  }

  const options = current.options || current.choices || [];
  const correctIndex = typeof current.answer_index === "number" ? current.answer_index : undefined;

  return (
    <div className="quiz-modal">
      <div className="quiz-header">
        <h3>Quiz: {current.title || 'Question'}</h3>
        <div className="quiz-progress"><div className="quiz-progress-bar" style={{ width: `${((index+1)/quiz.length)*100}%`}}></div></div>
      </div>

      <div className="quiz-body">
        <div className="quiz-question"><strong>{index+1}. {current.question}</strong></div>

        {options.length ? (
          <ul className="quiz-options">
            {options.map((opt, idx) => {
              const isSelected = selected[index] === idx;
              const isCorrect = revealed && (correctIndex === idx);
              const className = `option ${isCorrect ? "correct" : ""}`;
              return (
                <li
                  key={idx}
                  className={className}
                  onClick={() => choose(index, idx)}
                  style={{ opacity: selected[index] != null && !isSelected ? 0.75 : 1 }}
                >
                  {String.fromCharCode(65 + idx)}. {opt}
                  {isSelected ? " ⟶ your answer" : ""}
                  {revealed && isCorrect ? " ✅" : ""}
                </li>
              );
            })}
          </ul>
        ) : (
          <div style={{ marginTop: 6 }}>{current.answer ? (revealed ? <em>Answer: {current.answer}</em> : <span className="muted">Answer hidden</span>) : <em className="muted">No options provided</em>}</div>
        )}
      </div>

      <div className="quiz-footer">
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={prev} disabled={index===0}>Previous</button>
          <button className="btn" onClick={next} disabled={index===quiz.length-1}>Next</button>
        </div>
        <div>
          <button className="btn" onClick={() => setRevealed(r => !r)}>{revealed ? 'Hide Answers' : 'Reveal Answers'}</button>
        </div>
      </div>
    </div>
  );
}

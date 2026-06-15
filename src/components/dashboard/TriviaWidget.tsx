import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserXP } from '../../lib/firestore';
import { trackEvent } from '../../utils/analytics';
import { useToast } from '../../hooks/useToast';

interface TriviaQuestion {
  question: string;
  correctAnswer: string;
  answers: string[];
}

export const TriviaWidget: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [questionData, setQuestionData] = useState<TriviaQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answeredStatus, setAnsweredStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const fetchQuestion = async () => {
    setLoading(true);
    setSelectedAnswer(null);
    setAnsweredStatus('idle');
    setQuestionData(null);

    try {
      // Geography (Category 22) or History (Category 23) which frequently contain US-related culture
      const categories = [22, 23];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const response = await fetch(`https://opentdb.com/api.php?amount=1&category=${randomCategory}&type=multiple`);
      if (!response.ok) {
        throw new Error('Failed to load trivia question.');
      }
      
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        
        const question = decodeHtml(result.question);
        const correctAnswer = decodeHtml(result.correct_answer);
        const incorrectAnswers = result.incorrect_answers.map((ans: string) => decodeHtml(ans));
        
        // Shuffle answers
        const allAnswers = [...incorrectAnswers, correctAnswer].sort(() => Math.random() - 0.5);

        setQuestionData({
          question,
          correctAnswer,
          answers: allAnswers
        });
      } else {
        throw new Error('No question results.');
      }
    } catch (err) {
      console.warn('Trivia fetch failed:', err);
      // Fallback local question
      setQuestionData({
        question: "In which US city is the Golden Gate Bridge located?",
        correctAnswer: "San Francisco",
        answers: ["New York", "Chicago", "San Francisco", "Los Angeles"]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleAnswerClick = async (answer: string) => {
    if (answeredStatus !== 'idle' || !questionData) return;
    
    setSelectedAnswer(answer);
    
    if (answer === questionData.correctAnswer) {
      setAnsweredStatus('correct');
      trackEvent('trivia_solve', { correct: true });
      showToast({ type: 'success', message: 'Correct! +20 XP awarded.' });
      
      if (user?.uid) {
        try {
          await updateUserXP(user.uid, 20);
        } catch (err) {
          console.error('Error awarding trivia XP:', err);
        }
      }
    } else {
      setAnsweredStatus('incorrect');
      trackEvent('trivia_solve', { correct: false });
      showToast({ type: 'error', message: 'Oops! That is incorrect.' });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇺🇸</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">Culture Trivia</h3>
          </div>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 rounded-full">
            Worth 20 XP
          </span>
        </div>

        {loading && (
          <div className="flex flex-col justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-xs text-slate-500">Loading trivia...</p>
          </div>
        )}

        {!loading && questionData && (
          <div className="space-y-4">
            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              {questionData.question}
            </p>

            <div className="grid grid-cols-1 gap-2">
              {questionData.answers.map((answer, i) => {
                let buttonStyle = "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-200";
                
                if (answeredStatus !== 'idle') {
                  if (answer === questionData.correctAnswer) {
                    buttonStyle = "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20";
                  } else if (answer === selectedAnswer && answeredStatus === 'incorrect') {
                    buttonStyle = "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20";
                  } else {
                    buttonStyle = "bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-500 cursor-not-allowed";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerClick(answer)}
                    disabled={answeredStatus !== 'idle'}
                    className={`w-full py-2.5 px-4 text-xs font-light text-left border rounded-xl transition-all duration-200 ${buttonStyle}`}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {answeredStatus !== 'idle' && (
        <button
          onClick={fetchQuestion}
          className="w-full mt-4 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md"
        >
          Next Question
        </button>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tips } from '../data/tips';
import { courses } from '../data/courses';
import { getWhatsAppLink } from '../../constants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Dicas: React.FC = () => {
  const navigate = useNavigate();
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  
  useDocumentTitle('English Tips');

  const toggleTip = (tipId: string) => {
    setExpandedTip(expandedTip === tipId ? null : tipId);
  };

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700',
      orange: 'bg-orange-100 text-orange-700',
      purple: 'bg-purple-100 text-purple-700',
      red: 'bg-red-100 text-red-700',
      green: 'bg-green-100 text-green-700',
      indigo: 'bg-indigo-100 text-indigo-700'
    };
    return colors[color] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">English Tips & Tricks</h1>
          <p className="text-xl opacity-90 mb-8">
            Real American English insights from Matt's experience teaching Brazilians
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/', { state: { openAuthModal: true } })}
              className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Start Learning
            </button>
            <a
              href={getWhatsAppLink('general')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
            >
              Ask Matt a Question
            </a>
          </div>
        </div>
      </div>

      {/* Tips Grid */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className={`bg-white rounded-lg border border-slate-200 overflow-hidden transition-all ${
                expandedTip === tip.id ? 'shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(tip.categoryColor)}`}>
                    {tip.category}
                  </span>
                  <span className="text-sm text-slate-500">{tip.readTime}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{tip.title}</h3>

                {/* Preview */}
                <p className="text-slate-600 mb-4">{tip.preview}</p>

                {/* Expanded Content */}
                {expandedTip === tip.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {tip.fullContent}
                      </p>
                    </div>
                    
                    {/* Course Upsell */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900 mb-3">
                        Want to learn more about {tip.category.toLowerCase()} English?
                      </p>
                      <button
                        onClick={() => navigate(`/courses/${tip.courseId}`)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        View {courses.find(c => c.id === tip.courseId)?.title || 'Course'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => toggleTip(tip.id)}
                    className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded transition-colors"
                  >
                    {expandedTip === tip.id ? 'Show Less' : 'Read More'}
                  </button>
                  
                  {expandedTip === tip.id && (
                    <a
                      href={getWhatsAppLink('general')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
                    >
                      Ask Matt
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Get Personalized English Tips
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Receive weekly tips and practice directly with Matt on WhatsApp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`${getWhatsAppLink('general')}&text=Hi%20Matt!%20I%20want%20to%20receive%20weekly%20English%20tips`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-green-600 font-bold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Join WhatsApp Tips List
            </a>
            <button
              onClick={() => navigate('/courses')}
              className="px-8 py-4 bg-green-500 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
            >
              Browse All Courses
            </button>
          </div>
          <p className="text-sm opacity-80 mt-6">
            Free tips every week - no spam, just value
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dicas;

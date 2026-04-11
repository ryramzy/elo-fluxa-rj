import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { getWhatsAppLink } from '../../constants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Videos: React.FC = () => {
  const navigate = useNavigate();
  const [waitlistForm, setWaitlistForm] = useState({
    name: '',
    whatsapp: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  useDocumentTitle('Video Lessons');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!waitlistForm.name || !waitlistForm.whatsapp) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const waitlistId = new Date().toISOString();
      const waitlistRef = doc(db, 'waitlist', waitlistId);
      
      await setDoc(waitlistRef, {
        ...waitlistForm,
        createdAt: new Date(),
        source: 'videos-page'
      });

      setSubmitSuccess(true);
      setWaitlistForm({ name: '', whatsapp: '' });
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      alert('Error joining waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const videoPreviews = [
    {
      title: 'NBA Slang com Matt',
      description: 'Learn basketball terms Americans use every day',
      category: 'Sports English',
      color: 'orange',
      emoji: '??'
    },
    {
      title: 'Como se apresentar em inglês',
      description: 'Master professional introductions for interviews',
      category: 'Business English',
      color: 'blue',
      emoji: '??'
    },
    {
      title: 'Hip Hop e o Bronx',
      description: 'The cultural origins of hip hop English',
      category: 'Hip Hop Culture',
      color: 'purple',
      emoji: '??'
    }
  ];

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      orange: 'bg-orange-100 text-orange-700',
      blue: 'bg-blue-100 text-blue-700',
      purple: 'bg-purple-100 text-purple-700'
    };
    return colors[color] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Video Lessons Coming Soon
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8">
            Learn American English with Matt's video lessons - from sports slang to business English
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium">Launching in 2025</span>
          </div>
        </div>
      </div>

      {/* Video Previews */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">What's Coming</h2>
          <p className="text-lg text-slate-600">
            Be the first to know when our video lessons launch
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {videoPreviews.map((video, index) => (
            <div key={index} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-32 bg-gradient-to-br ${video.color === 'orange' ? 'from-orange-400 to-orange-600' : video.color === 'blue' ? 'from-blue-400 to-blue-600' : 'from-purple-400 to-purple-600'} flex items-center justify-center`}>
                <div className="text-center">
                  <div className="text-4xl mb-2">{video.emoji}</div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-xs font-medium text-white">Em breve</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(video.color)} mb-3`}>
                  {video.category}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{video.title}</h3>
                <p className="text-sm text-slate-600">{video.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Waitlist Form */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Join the Waitlist</h3>
            <p className="text-slate-600">
              Be the first to access our video lessons and get exclusive early-bird pricing
            </p>
          </div>

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">You're on the list!</h4>
              <p className="text-slate-600 mb-6">
                We'll notify you as soon as our video lessons are ready.
              </p>
              <a
                href={getWhatsAppLink('general')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.028 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
                </svg>
                Chat with Matt about videos
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={waitlistForm.name}
                  onChange={(e) => setWaitlistForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="text"
                  value={waitlistForm.whatsapp}
                  onChange={(e) => setWaitlistForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="5521XXXXXXXXX"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors"
              >
                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 mb-4">
              While you wait, check out our free lessons
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
            >
              Browse Courses
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">What to Expect</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">HD</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">High Quality Videos</h4>
              <p className="text-sm text-slate-600">Professional production with clear audio and subtitles</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600">??</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Real American Content</h4>
              <p className="text-slate-600">Authentic materials from American culture and media</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600">??</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Practice Exercises</h4>
              <p className="text-slate-600">Interactive exercises to reinforce your learning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Videos;

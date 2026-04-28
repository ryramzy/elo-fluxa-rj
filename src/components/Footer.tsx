import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getWhatsAppLink } from '../../constants';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">Elo!</h3>
            <p className="text-slate-400 text-sm mb-4">
              Inglês com professores nativos
            </p>
            <a
              href={getWhatsAppLink('general')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.028 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
              </svg>
              WhatsApp
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Learn</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigate('/courses')}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  All Courses
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/dicas')}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  English Tips
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/videos')}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Video Lessons
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/sobre')}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  About Matt
                </button>
              </li>
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4 className="font-semibold mb-4">Popular Courses</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigate('/courses/business-english')}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Business English
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/courses/sports-english')}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Sports English
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/courses/hiphop-culture')}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Hip Hop Culture
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/courses/medical-english')}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Medical English
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Get Help</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={getWhatsAppLink('general')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Chat with Matt
                </a>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/courses')}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Schedule a Class
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/', { state: { openAuthModal: true } })}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Create Account
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/admin')}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Admin Access
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2026 Elo Matt! All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <a
                href={getWhatsAppLink('general')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                WhatsApp: (21) 99232-2566
              </a>
              <button 
                onClick={() => navigate('/sobre')}
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => navigate('/sobre')}
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { FaTimes, FaGraduationCap, FaMapMarkerAlt, FaMicrophone } from 'react-icons/fa';

interface TutorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorProfileModal: React.FC<TutorProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Card wrapper */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glow Backgrounds */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors z-10"
        >
          <FaTimes size={16} />
        </button>

        <div className="p-6 sm:p-8">
          {/* Tutor Info Header */}
          <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-white/5 pb-5 mb-5">
            <div className="w-20 h-20 rounded-2xl bg-cover bg-center border-2 border-blue-500 shadow-md flex-shrink-0" style={{ backgroundImage: `url('/bobby.jpg')` }} />
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-white font-serif tracking-tight">Professor Nativo</h3>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mt-0.5">Fundador & Tutor Principal</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2">
                <span className="flex items-center gap-1 text-[9px] font-bold text-slate-450 uppercase bg-slate-950 px-2 py-0.5 rounded-md border border-white/5">
                  <FaGraduationCap className="text-blue-500" /> TEFL Certified
                </span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-slate-450 uppercase bg-slate-950 px-2 py-0.5 rounded-md border border-white/5">
                  <FaMicrophone className="text-emerald-500" /> Native Accent
                </span>
              </div>
            </div>
          </div>

          {/* Credentials List */}
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-light mb-6">
            <p>
              <strong>Hi, I'm Professor Nativo, founder and lead tutor of ELO!</strong>
            </p>
            <p>
              Over the past decade, I've helped hundreds of Brazilian executives, developers, and language learners bridge the communication gap and sound natural in English. Having lived in Boston, MA and worked across global teams, my teaching methodology revolves around contextual chunking, business negotiation strategies, and accent expansion.
            </p>
            <p>
              ELO! is my signature library, designed to bypass dry grammar textbooks and focus on how Americans actually speak. I look forward to working with you in our live sessions to fine-tune your pronunciation and build professional confidence.
            </p>

            <div className="bg-slate-950/60 rounded-2xl border border-white/5 p-4 space-y-2 mt-4 text-[11px]">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-slate-400" />
                <span><strong>Hometown:</strong> Boston, Massachusetts (USA)</span>
              </div>
              <div className="flex items-center gap-2">
                <FaMicrophone className="text-slate-400" />
                <span><strong>Accent Profile:</strong> General American / New England Native</span>
              </div>
            </div>
          </div>

          {/* Booking / Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg active:scale-95 shadow-blue-900/20"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

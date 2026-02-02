/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';

const VideoGrid: React.FC = () => {
  const placeholders = [
    { title: 'Próximas aulas em vídeo aqui', icon: '🎬' },
    { title: 'Dicas de Pronúncia', icon: '🗣️' },
    { title: 'Slang Essentials', icon: '⚡' },
    { title: 'Business English Hacks', icon: '💼' },
    { title: 'The Rio Experience', icon: '🌴' },
    { title: 'Live Coaching Sessions', icon: '📱' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {placeholders.map((item, idx) => (
        <div 
          key={idx} 
          className="aspect-video bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center p-8 group hover:bg-white hover:border-blue-300 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-lg"
        >
          <span className="text-5xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</span>
          <h4 className="text-lg font-bold text-gray-400 group-hover:text-blue-800 transition-colors uppercase tracking-widest">{item.title}</h4>
          <span className="mt-4 text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 uppercase tracking-[0.3em] transition-opacity">
            Coming Soon
          </span>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
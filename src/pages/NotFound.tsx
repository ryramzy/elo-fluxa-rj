import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">??</span>
          </div>
          <h1 className="text-6xl font-bold text-slate-900 mb-2">404</h1>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Essa página foi embora estudar inglês
          </h2>
          <p className="text-slate-600 mb-2">
            A página que você está procurando não existe ou foi movida.
          </p>
          <p className="text-slate-600">
            Mas não se preocupe - podemos te levar de volta para as aulas!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Voltar para o início
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Meu painel
          </button>
        </div>

        {/* Fun illustration */}
        <div className="mt-12 text-sm text-slate-500">
          <p>Enquanto isso, que tal praticar?</p>
          <div className="mt-4 space-y-2">
            <p className="italic">"How do you say 'página não encontrada' in English?"</p>
            <p className="font-medium text-slate-700">"Page not found" ?</p>
            <p className="text-green-600">?? Correct!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

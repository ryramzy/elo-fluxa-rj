import React from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelect: (plan: 'starter' | 'pro' | 'elite') => void;
}

export default function SubscriptionModal({ isOpen, onClose, onPlanSelect }: SubscriptionModalProps) {
  if (!isOpen) return null;

  const handlePlanClick = (plan: 'starter' | 'pro' | 'elite') => {
    if (plan === 'starter') {
      onPlanSelect(plan);
      onClose();
    } else {
      // For Pro and Elite, show WhatsApp placeholder
      onPlanSelect(plan);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal content */}
        <div 
          className="bg-white rounded-lg shadow-xl max-w-5xl w-full p-8 relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Learning Path
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Unlock your English learning potential with the perfect plan for your goals and schedule
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Starter Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Explorador</h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  R$0 <span className="text-lg font-normal text-gray-600">/ forever</span>
                </div>
                <p className="text-sm text-gray-600">Experimenta sem compromisso</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Acesse as primeiras aulas de cada curso
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Veja se o método funciona pra você
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Sem cartão de crédito necessário
                </li>
              </ul>
              
              <button
                onClick={() => handlePlanClick('starter')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Começar de graça
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white border-2 border-blue-500 rounded-lg p-6 relative hover:border-blue-600 transition-colors">
              {/* "Most Popular" badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Mais popular
                </span>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fluente</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  R$97 <span className="text-lg font-normal text-gray-600">/ month</span>
                </div>
                <p className="text-sm text-gray-600">Para quem quer resultado de verdade</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  4 aulas ao vivo por mês
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Todos os cursos desbloqueados
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  O plano que a maioria escolhe
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Suporte por WhatsApp quando precisar
                </li>
              </ul>
              
              <a
                href="https://wa.me/5522992322566?text=Oi%20Matt!%20Quero%20assinar%20o%20plano%20Pro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.207l-.694 2.547 2.628-.69c.904.536 1.774.821 2.809.822 3.183 0 5.768-2.587 5.769-5.767 0-3.181-2.587-5.766-5.769-5.766zm3.386 8.213c-.148.416-.745.76-1.024.811-.278.051-.62.083-1.002-.134-1.482-.84-2.441-2.355-2.515-2.454-.074-.1-.603-.803-.603-1.532s.38-1.083.515-1.232c.134-.149.297-.186.396-.186.099 0 .198.001.284.004.092.003.216-.034.338.257.123.292.421 1.024.458 1.099.037.075.062.163.013.261-.05.1-.074.162-.149.248-.074.086-.156.193-.223.259-.074.075-.152.156-.065.306.087.149.387.639.83 1.034.57.507 1.05.664 1.2.739.149.075.236.063.323-.037.086-.1.371-.433.47-.583.099-.15.198-.124.334-.075.137.049.866.408 1.015.483.149.075.248.112.284.174.037.062.037.36-.112.776zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.18L2 22l4.947-1.3c1.472.822 3.161 1.3 4.978 1.3 5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
                Assinar pelo WhatsApp
              </a>
              
            </div>

            {/* Elite Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Imersão Total</h3>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  R$197 <span className="text-lg font-normal text-gray-600">/ month</span>
                </div>
                <p className="text-sm text-gray-600">Para quem precisa acelerar</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Aulas ilimitadas
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Suporte direto com Matt
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Certificados de conclusão
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Para deadlines reais
                </li>
              </ul>
              
              <a
                href="https://wa.me/5522992322566?text=Oi%20Matt!%20Quero%20o%20plano%20Imers%C3%A3o%20Total"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.207l-.694 2.547 2.628-.69c.904.536 1.774.821 2.809.822 3.183 0 5.768-2.587 5.769-5.767 0-3.181-2.587-5.766-5.769-5.766zm3.386 8.213c-.148.416-.745.76-1.024.811-.278.051-.62.083-1.002-.134-1.482-.84-2.441-2.355-2.515-2.454-.074-.1-.603-.803-.603-1.532s.38-1.083.515-1.232c.134-.149.297-.186.396-.186.099 0 .198.001.284.004.092.003.216-.034.338.257.123.292.421 1.024.458 1.099.037.075.062.163.013.261-.05.1-.074.162-.149.248-.074.086-.156.193-.223.259-.074.075-.152.156-.065.306.087.149.387.639.83 1.034.57.507 1.05.664 1.2.739.149.075.236.063.323-.037.086-.1.371-.433.47-.583.099-.15.198-.124.334-.075.137.049.866.408 1.015.483.149.075.248.112.284.174.037.062.037.36-.112.776zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.18L2 22l4.947-1.3c1.472.822 3.161 1.3 4.978 1.3 5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
                Falar com Matt
              </a>
              
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>All plans include instant access to course materials</p>
            <p className="mt-2">Cancel anytime. No questions asked.</p>
          </div>
        </div>
      </div>
    </>
  );
}

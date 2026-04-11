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
                <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  R$0 <span className="text-lg font-normal text-gray-600">/ forever</span>
                </div>
                <p className="text-sm text-gray-600">Perfect for getting started</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Access to 1 course only
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  1 class booking per month
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Basic badges and XP
                </li>
              </ul>
              
              <button
                onClick={() => handlePlanClick('starter')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Começar grátis
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  R$97 <span className="text-lg font-normal text-gray-600">/ month</span>
                </div>
                <p className="text-sm text-gray-600">Most popular choice</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Access to all 6 courses
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  4 class bookings per month
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Full gamification system
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority booking slots
                </li>
              </ul>
              
              <button
                onClick={() => handlePlanClick('pro')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Assinar Pro
              </button>
              
              {/* WhatsApp placeholder message */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-700">
                  Pagamento em breve - entre em contato pelo WhatsApp
                </p>
                <a 
                  href="https://wa.me/5521999999999?text=Ol%C3%A1!%20Tenho%20interesse%20no%20plano%20Pro."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                >
                  Falar com Matt no WhatsApp
                </a>
              </div>
            </div>

            {/* Elite Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Elite</h3>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  R$197 <span className="text-lg font-normal text-gray-600">/ month</span>
                </div>
                <p className="text-sm text-gray-600">Full access experience</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Everything in Pro
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited class bookings
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  1:1 WhatsApp access to Matt
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Course completion certificates
                </li>
              </ul>
              
              <button
                onClick={() => handlePlanClick('elite')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Assinar Elite
              </button>
              
              {/* WhatsApp placeholder message */}
              <div className="mt-4 p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-sm text-purple-700">
                  Pagamento em breve - entre em contato pelo WhatsApp
                </p>
                <a 
                  href="https://wa.me/5521999999999?text=Ol%C3%A1!%20Tenho%20interesse%20no%20plano%20Elite."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium underline"
                >
                  Falar com Matt no WhatsApp
                </a>
              </div>
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

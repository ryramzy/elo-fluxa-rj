import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { courses } from '../data/courses';
import { doc, updateDoc, setDoc, collection, getDoc } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { getWhatsAppLink } from '../../constants';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const courseOptions = [
    { id: 'business-english', emoji: '??', title: 'Trabalho e entrevistas' },
    { id: 'sports-english', emoji: '??', title: 'Esportes americanos' },
    { id: 'hiphop-culture', emoji: '??', title: 'Hip hop e cultura' },
    { id: 'medical-english', emoji: '??', title: 'Inglês médico' },
    { id: 'study-abroad', emoji: '??', title: 'Intercâmbio e exames' },
    { id: 'law-enforcement', emoji: '??', title: 'Cultura policial americana' }
  ];

  useEffect(() => {
    if (isOpen && user) {
      // Check if onboarding is already complete
      checkOnboardingStatus();
    }
  }, [isOpen, user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    
    try {
      const userDoc = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists() && userSnapshot.data().onboardingComplete) {
        onClose();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleCourseSelection = async (courseId: string) => {
    setSelectedCourse(courseId);
    setLoading(true);

    if (!user) return;

    try {
      // Update user profile with primary course
      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, {
        primaryCourse: courseId,
        onboardingComplete: true
      });

      // Auto-enroll in free tier of selected course
      const enrollmentDoc = doc(db, 'users', user.uid, 'enrollments', courseId);
      const course = courses.find(c => c.id === courseId);
      
      await setDoc(enrollmentDoc, {
        courseId,
        enrolledAt: new Date(),
        progress: 0,
        lessonsCompleted: 0,
        totalLessons: course?.lessons.length || 0,
        xpEarned: 0
      });

      setCurrentStep(3);
    } catch (error) {
      console.error('Error saving course selection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishOnboarding = () => {
    onClose();
    navigate('/dashboard');
  };

  const handleWhatsAppClick = () => {
    window.open(getWhatsAppLink('onboarding'), '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with step indicator */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-900">
              {currentStep === 1 && 'Bem-vindo ao Elo Matt! ?'}
              {currentStep === 2 && 'Qual é o seu objetivo?'}
              {currentStep === 3 && 'Como funciona'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Step indicator */}
          <div className="flex gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div className="text-center py-8">
              {/* Matt's avatar */}
              <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6">
                M
              </div>
              
              <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                Você está a um passo de aprender o inglês americano de verdade 
                - não o inglês do livro.
              </p>
              
              <button
                onClick={() => setCurrentStep(2)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Vamos começar
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="py-4">
              <p className="text-lg text-slate-600 text-center mb-8">
                Escolha o curso que melhor se encaixa nos seus objetivos
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseOptions.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => handleCourseSelection(course.id)}
                    disabled={loading}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedCourse === course.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{course.emoji}</span>
                      <span className="font-medium text-slate-900">{course.title}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {loading && (
                <div className="text-center mt-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-slate-600 mt-2">Configurando seu curso...</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="py-4">
              <div className="space-y-4 mb-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Explore as primeiras aulas - de graça
                    </h3>
                    <p className="text-slate-600">
                      Comece com as aulas gratuitas para conhecer o método e ver se funciona para você
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Quando quiser mais, fale com Matt
                    </h3>
                    <p className="text-slate-600">
                      Desbloqueie o curso completo conversando diretamente com Matt no WhatsApp
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Agende aulas ao vivo e acelere seu inglês
                    </h3>
                    <p className="text-slate-600">
                      Pratique conversação com Matt em sessões individuais personalizadas
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleWhatsAppClick}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Falar com Matt agora
                </button>
                <button
                  onClick={handleFinishOnboarding}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Ir para o meu painel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;

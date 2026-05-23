import React, { useState, useEffect } from 'react';
import { Joyride, CallBackProps, STATUS } from 'react-joyride';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firestore';
import { useAuth } from '../../hooks/useAuth';

interface OnboardingTourProps {
  hasSeenOnboarding: boolean;
  profileLoaded: boolean;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ hasSeenOnboarding, profileLoaded }) => {
  const [run, setRun] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only run if the profile is loaded and they haven't seen the tour
    if (profileLoaded && !hasSeenOnboarding && user) {
      // Small delay to ensure the UI has finished animating/rendering
      const timer = setTimeout(() => setRun(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding, profileLoaded, user]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      
      // Update Firestore so they never see it again
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            hasSeenOnboarding: true
          });
        } catch (error) {
          console.error('Failed to update onboarding status:', error);
        }
      }
    }
  };

  const steps = [
    {
      target: 'body',
      content: 'Bem-vindo ao Elo! Vamos fazer um tour rápido pela sua nova área de estudos.',
      placement: 'center' as const,
      disableBeacon: true,
    },
    {
      target: '.tour-step-courses',
      content: 'Aqui você encontra todos os seus cursos. Escolha um para começar a aprender e ganhar XP!',
      placement: 'top' as const,
    },
    {
      target: '.tour-step-agenda',
      content: 'Quando estiver pronto para praticar fala, agende uma aula ao vivo 1-a-1 com o professor aqui.',
      placement: 'left' as const,
    },
    {
      target: '.tour-step-xp',
      content: 'Complete aulas e mantenha sua ofensiva (streak) para subir de nível. Boa sorte!',
      placement: 'bottom' as const,
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#2563eb', // blue-600
          zIndex: 1000,
        },
        buttonNext: {
          backgroundColor: '#2563eb',
        },
        buttonBack: {
          color: '#64748b',
        }
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Pronto!',
        next: 'Avançar',
        skip: 'Pular',
      }}
    />
  );
};

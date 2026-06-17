import { beginnerContent } from './content/beginner';
import { intermediateContent } from './content/intermediate';
import { advancedConversationContent } from './content/advanced-conversation';
import { advancedBusinessContent } from './content/advanced-business';
import { specialtyContent } from './content/specialty';
import { newTopicsContent } from './content/new-topics';

export interface LessonContent {
  id: string;
  title: string;
  slides: string[];
}

// We will aggregate all content here as we generate the batches
export const lessonContent: Record<string, Record<string, LessonContent>> = {
  ...beginnerContent,
  ...intermediateContent,
  ...advancedConversationContent,
  ...advancedBusinessContent,
  ...specialtyContent,
  ...newTopicsContent,
};

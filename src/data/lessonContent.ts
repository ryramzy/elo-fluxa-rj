import { beginnerContent } from './content/beginner';

export interface LessonContent {
  id: string;
  title: string;
  slides: string[];
}

// We will aggregate all content here as we generate the batches
export const lessonContent: Record<string, Record<string, LessonContent>> = {
  ...beginnerContent,
};

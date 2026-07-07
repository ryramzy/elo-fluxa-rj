import { courses } from '../src/data/courses';
import { lessonContent } from '../src/data/lessonContent';

console.log('🧪 Starting LMS Content QA Verification...');
console.log('==========================================');

let issuesCount = 0;
const knownTypes = ['INTRO', 'VOCAB', 'CONCEPT', 'EXAMPLE', 'CULTURE', 'DRILL', 'ROLEPLAY', 'REVIEW'];

courses.forEach((course) => {
  const courseId = course.id;
  const courseContent = lessonContent[courseId];

  console.log(`Checking Course: ${course.title} (${courseId})`);

  if (!courseContent) {
    console.error(`  ❌ Error: No content defined in lessonContent for course ID: "${courseId}"`);
    issuesCount++;
    return;
  }

  // Check lessons count
  if (course.lessons.length !== course.totalLessons) {
    console.warn(`  ⚠️ Warning: lessons array length (${course.lessons.length}) does not match totalLessons field (${course.totalLessons})`);
  }

  course.lessons.forEach((lesson) => {
    const lessonId = lesson.id;
    const lessonData = courseContent[lessonId];

    if (!lessonData) {
      console.error(`  ❌ Error: No slide content defined for lesson ID: "${lessonId}" in course: "${courseId}"`);
      issuesCount++;
      return;
    }

    if (lessonData.title !== lesson.title) {
      console.warn(`  ⚠️ Warning: Lesson title mismatch for "${lessonId}". Course definition: "${lesson.title}", Lesson content: "${lessonData.title}"`);
    }

    if (!lessonData.slides || !Array.isArray(lessonData.slides) || lessonData.slides.length === 0) {
      console.error(`  ❌ Error: Lesson "${lessonId}" has empty or missing slides array.`);
      issuesCount++;
      return;
    }

    lessonData.slides.forEach((slide, slideIdx) => {
      const parts = slide.split('|||');
      if (parts.length < 3 || parts.length > 5) {
        console.error(`  ❌ Error: Slide ${slideIdx} in lesson "${lessonId}" is malformed. Expected between 3 and 5 parts (split by "|||"), got ${parts.length}.`);
        console.error(`     Content: "${slide}"`);
        issuesCount++;
        return;
      }

      const type = parts[0];
      if (!knownTypes.includes(type)) {
        console.warn(`  ⚠️ Warning: Slide ${slideIdx} in lesson "${lessonId}" has unconventional slide type: "${type}". Known types are: ${knownTypes.join(', ')}`);
      }

      const title = parts[1];
      const content = parts[2];
      const eloPrompt = parts[3] || '';

      if (!title || !content) {
        console.error(`  ❌ Error: Slide ${slideIdx} in lesson "${lessonId}" has empty title or content.`);
        issuesCount++;
      }
    });
  });
});

console.log('==========================================');
if (issuesCount === 0) {
  console.log('✅ LMS Content QA Passed! No critical errors found.');
} else {
  console.error(`❌ LMS Content QA Failed. Found ${issuesCount} critical issues.`);
  process.exit(1);
}

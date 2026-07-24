const fs = require('fs');
const path = require('path');

const coursesContent = fs.readFileSync(path.join(__dirname, '../src/data/courses.ts'), 'utf8');
const matches = [...coursesContent.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);

console.log(`Total ID matches in courses.ts: ${matches.length}`);
const lessonIds = matches.filter(id => id.includes('-') && !id.startsWith('course-') && !id.startsWith('track-'));
console.log(`Total lesson IDs: ${lessonIds.length}`);

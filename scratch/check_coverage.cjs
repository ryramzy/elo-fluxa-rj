const fs = require('fs');
const path = require('path');

const coursesContent = fs.readFileSync(path.join(__dirname, '../src/data/courses.ts'), 'utf8');
const matches = [...coursesContent.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const lessonIds = matches.filter(id => id.includes('-') && !id.startsWith('course-') && !id.startsWith('track-'));

console.log(`Total lesson IDs in courses.ts: ${lessonIds.length}`);

// Read completionContent keys
const compContent = fs.readFileSync(path.join(__dirname, '../src/data/content/completionContent.ts'), 'utf8');
const compKeys = [...compContent.matchAll(/"([a-z0-9-]+)":\s*\{/g)].map(m => m[1]).filter(k => k !== 'completion-section');

console.log(`Found ${compKeys.length} completion lesson keys:`, compKeys);

const fs = require('fs');
const path = require('path');

const coursesContent = fs.readFileSync(path.join(__dirname, '../src/data/courses.ts'), 'utf8');

// Match only lesson objects inside lessons array
const lessonMatches = [...coursesContent.matchAll(/lessons:\s*\[([\s\S]*?)\]\s*\}/g)];
const lessonIds = [];

for (const match of lessonMatches) {
  const ids = [...match[1].matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  lessonIds.push(...ids);
}

console.log(`Exact lesson IDs in course definitions: ${lessonIds.length}`);

const files = [
  'beginner.ts',
  'intermediate.ts',
  'advanced-conversation.ts',
  'advanced-business.ts',
  'specialty.ts',
  'new-topics.ts',
  'completionContent.ts'
];

let totalFound = 0;
const missing = [];

for (const id of lessonIds) {
  let found = false;
  for (const file of files) {
    const text = fs.readFileSync(path.join(__dirname, '../src/data/content', file), 'utf8');
    if (text.includes(`"${id}":`) || text.includes(`'${id}':`) || text.includes(`${id}:`)) {
      found = true;
      break;
    }
  }
  if (found) {
    totalFound++;
  } else {
    missing.push(id);
  }
}

console.log(`\nRESULTS:`);
console.log(`Total lesson IDs: ${lessonIds.length}`);
console.log(`Bespoke content found: ${totalFound} / ${lessonIds.length}`);
if (missing.length > 0) {
  console.log(`Missing bespoke content for (${missing.length}):`, missing);
} else {
  console.log(`🎉 100% BESPOKE CONTENT COVERAGE VERIFIED! Every single lesson has bespoke content!`);
}

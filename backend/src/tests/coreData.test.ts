import { createTechnologySchema } from '../schemas/technology.schema';
import { createGoalSchema } from '../schemas/goal.schema';
import { createResourceSchema } from '../schemas/resource.schema';
import { createSessionSchema } from '../schemas/session.schema';
import { createNoteSchema } from '../schemas/note.schema';

async function runCoreDataTests() {
  console.log('--- Starting Phase 3 Core Data Tests ---');

  // Test 1: Technology Validation
  const validTech = createTechnologySchema.safeParse({
    name: 'TypeScript',
    description: 'Typed JavaScript for enterprise web applications',
    category: 'Programming Languages',
    status: 'IN_PROGRESS',
    progress: 75,
  });
  console.log('1. Technology Schema (Valid):', validTech.success);
  if (!validTech.success) {
    throw new Error('Valid technology schema failed validation');
  }

  const invalidTech = createTechnologySchema.safeParse({
    name: '', // Empty name
    progress: 150, // Invalid progress > 100
  });
  console.log('2. Technology Schema (Invalid rejected):', !invalidTech.success);
  if (invalidTech.success) {
    throw new Error('Invalid technology schema was incorrectly accepted');
  }

  // Test 2: Goal Validation
  const validGoal = createGoalSchema.safeParse({
    title: 'Master React Server Components',
    targetMetric: 'Build 2 Full-Stack apps',
    progress: 50,
    status: 'IN_PROGRESS',
  });
  console.log('3. Goal Schema (Valid):', validGoal.success);
  if (!validGoal.success) {
    throw new Error('Valid goal schema failed validation');
  }

  // Test 3: Resource URL Security Protocol Validation
  const validHttpsResource = createResourceSchema.safeParse({
    title: 'Prisma Documentation',
    url: 'https://www.prisma.io/docs',
    type: 'DOCUMENTATION',
  });
  console.log('4. Resource HTTPS URL (Valid):', validHttpsResource.success);
  if (!validHttpsResource.success) {
    throw new Error('Valid HTTPS resource was rejected');
  }

  const invalidJsUrlResource = createResourceSchema.safeParse({
    title: 'Malicious Exploit Resource',
    url: 'javascript:alert(document.cookie)',
    type: 'ARTICLE',
  });
  console.log('5. Resource malicious URL (javascript: rejected):', !invalidJsUrlResource.success);
  if (invalidJsUrlResource.success) {
    throw new Error('Malicious javascript: protocol was not rejected!');
  }

  const invalidFtpUrlResource = createResourceSchema.safeParse({
    title: 'FTP Resource',
    url: 'ftp://ftp.example.com/file.pdf',
    type: 'OTHER',
  });
  console.log('6. Resource non-http/https URL (FTP rejected):', !invalidFtpUrlResource.success);
  if (invalidFtpUrlResource.success) {
    throw new Error('Non-HTTP/HTTPS protocol was not rejected!');
  }

  // Test 4: Learning Session Duration & Content Validation
  const validSession = createSessionSchema.safeParse({
    durationMinutes: 90,
    topicsCovered: 'Building PostgreSQL transactions & Anti-IDOR security',
    notes: 'Reviewed row-level checks & composite keys',
  });
  console.log('7. Learning Session (Valid):', validSession.success);
  if (!validSession.success) {
    throw new Error('Valid learning session failed validation');
  }

  const invalidDurationSession = createSessionSchema.safeParse({
    durationMinutes: 0, // Must be at least 1 min
    topicsCovered: 'Quick break',
  });
  console.log('8. Learning Session (Zero duration rejected):', !invalidDurationSession.success);
  if (invalidDurationSession.success) {
    throw new Error('Invalid session duration was incorrectly accepted');
  }

  // Test 5: Note Creation & Tags Validation
  const validNote = createNoteSchema.safeParse({
    title: 'Understanding HttpOnly and CSRF Double-Submit',
    content: '## HttpOnly\nCookies with HttpOnly flag cannot be accessed via JavaScript `document.cookie`.',
    tags: ['security', 'cookies', 'csrf', 'express'],
  });
  console.log('9. Note Schema (Valid):', validNote.success);
  if (!validNote.success) {
    throw new Error('Valid note schema failed validation');
  }

  console.log('--- All Phase 3 Core Data Tests PASSED Successfully! ---');
}

runCoreDataTests().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});

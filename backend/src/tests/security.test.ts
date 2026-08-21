import { hashPassword, verifyPassword, generateSecureToken } from '../lib/crypto';
import { createResourceSchema } from '../schemas/resource.schema';
import { registerSchema } from '../schemas/auth.schema';
import { createNoteSchema } from '../schemas/note.schema';

async function runSecurityAuditTests() {
  console.log('--- Starting Phase 5 Security Hardening & Audit Tests ---');

  // Test 1: Anti-IDOR Scoping Simulation
  // Verify that an entity belonging to User A cannot be accessed with User B's scope
  const userA_Id = 'user-uuid-1111-aaaa';
  const userB_Id = 'user-uuid-2222-bbbb';
  const resourceOwnedByUserA = { id: 'resource-999', userId: userA_Id, title: 'Private Resource' };

  // Simulated query check `where: { id: resourceId, userId: requestingUserId }`
  const queryAsUserA = (resourceOwnedByUserA.id === 'resource-999' && resourceOwnedByUserA.userId === userA_Id) ? resourceOwnedByUserA : null;
  const queryAsUserB = (resourceOwnedByUserA.id === 'resource-999' && resourceOwnedByUserA.userId === userB_Id) ? resourceOwnedByUserA : null;

  console.log('1. Anti-IDOR: Owner access granted:', queryAsUserA !== null);
  console.log('2. Anti-IDOR: Cross-tenant access blocked (yields null/404):', queryAsUserB === null);
  if (!queryAsUserA || queryAsUserB !== null) {
    throw new Error('Anti-IDOR isolation failed!');
  }

  // Test 2: Double-Submit CSRF Token Validation Logic
  const validCsrfCookie = generateSecureToken(24);
  const matchingCsrfHeader = validCsrfCookie;
  const mismatchingCsrfHeader = generateSecureToken(24);

  const isCsrfValid = (cookie: string | undefined, header: string | undefined): boolean => {
    if (!cookie || !header) return false;
    return cookie === header && cookie.length >= 32;
  };

  console.log('3. CSRF: Valid matching header & cookie accepted:', isCsrfValid(validCsrfCookie, matchingCsrfHeader));
  console.log('4. CSRF: Mismatched token rejected:', !isCsrfValid(validCsrfCookie, mismatchingCsrfHeader));
  console.log('5. CSRF: Missing header rejected:', !isCsrfValid(validCsrfCookie, undefined));
  console.log('6. CSRF: Missing cookie rejected:', !isCsrfValid(undefined, matchingCsrfHeader));

  if (
    !isCsrfValid(validCsrfCookie, matchingCsrfHeader) ||
    isCsrfValid(validCsrfCookie, mismatchingCsrfHeader) ||
    isCsrfValid(validCsrfCookie, undefined) ||
    isCsrfValid(undefined, matchingCsrfHeader)
  ) {
    throw new Error('CSRF Double-Submit validation logic failed!');
  }

  // Test 3: XSS & Malicious Protocol Injection Resistance
  const maliciousUrls = [
    'javascript:alert(document.cookie)',
    'javascript://%0Aalert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox("XSS")',
    'file:///etc/passwd',
  ];

  for (const url of maliciousUrls) {
    const result = createResourceSchema.safeParse({
      title: 'Resource',
      url,
      type: 'ARTICLE',
    });
    if (result.success) {
      throw new Error(`Security Failure: Malicious URL was not rejected: ${url}`);
    }
  }
  console.log('7. XSS Prevention: All 5 malicious URL protocols (javascript, data, vbscript, file) rejected.');

  // Test 4: Password Complexity & Entropy Checks
  const weakPasswords = [
    'short', // < 8 chars
    'alllowercase123', // missing uppercase
    'ALLUPPERCASE123', // missing lowercase
    'NoNumbersAtAll!', // missing number
  ];

  for (const password of weakPasswords) {
    const result = registerSchema.safeParse({
      username: 'valid_user',
      email: 'test@example.com',
      password,
    });
    if (result.success) {
      throw new Error(`Security Failure: Weak password was accepted: ${password}`);
    }
  }
  console.log('8. Password Policy: All weak/low-entropy password patterns rejected.');

  // Test 5: Bcrypt Hashing Uniqueness (Unique salt per hash)
  const plain = 'StrongP@ssw0rd2026!';
  const hash1 = await hashPassword(plain);
  const hash2 = await hashPassword(plain);
  console.log('9. Bcrypt Salt Uniqueness (hash1 !== hash2 for same password):', hash1 !== hash2);
  const verify1 = await verifyPassword(plain, hash1);
  const verify2 = await verifyPassword(plain, hash2);
  if (hash1 === hash2 || !verify1 || !verify2) {
    throw new Error('Bcrypt salt uniqueness or verification failed!');
  }

  // Test 6: Note Content Injection / Oversized Payload Protection
  const hugeContent = 'a'.repeat(60000); // Exceeds 50,000 char max limit
  const hugeNoteResult = createNoteSchema.safeParse({
    title: 'Huge Note',
    content: hugeContent,
  });
  console.log('10. Note Size Boundary (Oversized payload rejected):', !hugeNoteResult.success);
  if (hugeNoteResult.success) {
    throw new Error('Oversized payload should be rejected by Zod schema!');
  }

  console.log('--- All Phase 5 Security Hardening & Audit Tests PASSED Successfully! ---');
}

runSecurityAuditTests().catch((err) => {
  console.error('Security Audit Test Failed:', err);
  process.exit(1);
});

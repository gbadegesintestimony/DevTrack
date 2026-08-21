import { hashPassword, verifyPassword, generateSecureToken, hashToken, createHmacSignature, verifyHmacSignature } from '../lib/crypto';
import { registerSchema, loginSchema, resetPasswordSchema } from '../schemas/auth.schema';

async function runAuthVerification() {
  console.log('--- Starting Auth & Security Tests ---');

  // Test 1: Password hashing and verification
  const testPassword = 'Password123!';
  const hashedPassword = await hashPassword(testPassword);
  console.log('1. Password Hashing: Generated hash length =', hashedPassword.length);
  if (!hashedPassword.startsWith('$2')) {
    throw new Error('Expected bcrypt hash format ($2a$ or $2b$)');
  }

  const isValidMatch = await verifyPassword(testPassword, hashedPassword);
  console.log('2. Password Verification Match:', isValidMatch);
  if (!isValidMatch) {
    throw new Error('Password verification failed for valid password');
  }

  const isInvalidMatch = await verifyPassword('WrongPassword123!', hashedPassword);
  console.log('3. Password Rejection for wrong password:', !isInvalidMatch);
  if (isInvalidMatch) {
    throw new Error('Password verification should reject incorrect password');
  }

  // Test 2: Token Generation & SHA-256 Hashing
  const rawToken = generateSecureToken(32);
  const tokenHashed = hashToken(rawToken);
  console.log('4. Token Generation: raw token length =', rawToken.length, ', hashed =', tokenHashed.length);
  if (tokenHashed.length !== 64) {
    throw new Error('SHA-256 hash length should be exactly 64 hex characters');
  }

  // Test 3: HMAC Signature & Verification
  const secret = 'super-secret-key';
  const data = 'session-payload-123';
  const sig = createHmacSignature(data, secret);
  const isSigValid = verifyHmacSignature(data, sig, secret);
  const isWrongSigValid = verifyHmacSignature(data, 'wrong-sig', secret);
  console.log('5. HMAC Verification:', isSigValid, ', Invalid signature rejected:', !isWrongSigValid);
  if (!isSigValid || isWrongSigValid) {
    throw new Error('HMAC signature verification failed');
  }

  // Test 4: Zod Validation Schemas
  const validRegister = registerSchema.safeParse({
    username: 'dev_hero99',
    email: 'dev@example.com',
    password: 'SecurePassword123',
    name: 'Dev Hero',
  });
  console.log('6. Register Schema (Valid):', validRegister.success);
  if (!validRegister.success) {
    throw new Error('Valid registration input was rejected');
  }

  const invalidRegister = registerSchema.safeParse({
    username: 'ab', // too short (<3)
    email: 'not-an-email',
    password: 'short', // too short (<8) & no upper/number
  });
  console.log('7. Register Schema (Invalid rejected):', !invalidRegister.success);
  if (invalidRegister.success) {
    throw new Error('Invalid registration input should be rejected');
  }

  const validLogin = loginSchema.safeParse({
    emailOrUsername: 'dev_hero99',
    password: 'SecurePassword123',
  });
  console.log('8. Login Schema (Valid):', validLogin.success);
  if (!validLogin.success) {
    throw new Error('Valid login input was rejected');
  }

  const validReset = resetPasswordSchema.safeParse({
    token: 'a'.repeat(64),
    newPassword: 'NewPassword2026',
  });
  console.log('9. Reset Password Schema (Valid):', validReset.success);
  if (!validReset.success) {
    throw new Error('Valid reset password input was rejected');
  }

  console.log('--- All Auth & Security Tests PASSED Successfully! ---');
}

runAuthVerification().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});

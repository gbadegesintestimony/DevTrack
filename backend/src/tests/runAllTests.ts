import { runIntegrationTests } from './integration.test';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

async function runMasterTestSuite() {
  console.log('=====================================================');
  console.log('       🚀 DEVTRACK MASTER TEST SUITE RUNNER');
  console.log('=====================================================\n');

  const cwd = path.resolve(__dirname, '../../');
  const suites = [
    { name: '1. Authentication & Cryptography Unit Tests', file: 'src/tests/auth.test.ts' },
    { name: '2. Core Data Validation & Protocol Tests', file: 'src/tests/coreData.test.ts' },
    { name: '3. Dashboard Analytics & Streak Math Tests', file: 'src/tests/dashboard.test.ts' },
    { name: '4. Security Hardening & Anti-IDOR Tests', file: 'src/tests/security.test.ts' },
  ];

  let passedCount = 0;

  for (const suite of suites) {
    console.log(`▶ Running: ${suite.name}...`);
    try {
      const { stdout } = await execAsync(`npx tsx ${suite.file}`, { cwd });
      console.log(stdout.trim());
      console.log(`✔ ${suite.name} PASSED\n`);
      passedCount++;
    } catch (error: any) {
      console.error(`✖ ${suite.name} FAILED:`);
      console.error(error.stdout || error.message);
      process.exit(1);
    }
  }

  // 5. In-process Live Integration Test Suite
  console.log('▶ Running: 5. End-to-End API Integration Test Suite...');
  try {
    await runIntegrationTests();
    console.log('✔ 5. End-to-End API Integration Test Suite PASSED\n');
    passedCount++;
  } catch (error: any) {
    console.error('✖ Integration Test Suite FAILED:', error.message);
    process.exit(1);
  }

  console.log('=====================================================');
  console.log(`🎉 ALL ${passedCount} TEST SUITES PASSED WITH 100% SUCCESS!`);
  console.log('=====================================================');
}

runMasterTestSuite().catch((err) => {
  console.error('Master Test Runner Exception:', err);
  process.exit(1);
});

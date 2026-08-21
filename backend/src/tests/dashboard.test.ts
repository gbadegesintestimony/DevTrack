import { DashboardService } from '../services/dashboard.service';

async function runDashboardTests() {
  console.log('--- Starting Phase 4 Dashboard & Analytics Tests ---');

  const dashboardService = new DashboardService();

  // Test 1: Empty sessions streak = 0
  const emptyStreak = dashboardService.calculateStreak([]);
  console.log('1. Empty sessions streak is 0:', emptyStreak === 0);
  if (emptyStreak !== 0) {
    throw new Error('Empty sessions should yield a 0 streak');
  }

  // Test 2: Active consecutive streak ending today
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);

  const threeDayStreak = dashboardService.calculateStreak([today, yesterday, twoDaysAgo]);
  console.log('2. Three consecutive days streak:', threeDayStreak);
  if (threeDayStreak !== 3) {
    throw new Error(`Expected 3-day streak, got ${threeDayStreak}`);
  }

  // Test 3: Multiple sessions on the same day count as 1 day in streak
  const multipleSameDay = dashboardService.calculateStreak([today, today, yesterday]);
  console.log('3. Multiple sessions same day streak:', multipleSameDay);
  if (multipleSameDay !== 2) {
    throw new Error(`Expected 2-day streak for multi-session same day, got ${multipleSameDay}`);
  }

  // Test 4: Broken streak (missed yesterday)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(today.getDate() - 3);
  const fourDaysAgo = new Date();
  fourDaysAgo.setDate(today.getDate() - 4);

  const brokenStreak = dashboardService.calculateStreak([threeDaysAgo, fourDaysAgo]);
  console.log('4. Broken streak (inactive last 2 days) is 0:', brokenStreak === 0);
  if (brokenStreak !== 0) {
    throw new Error('Broken streak should be 0');
  }

  console.log('--- All Phase 4 Dashboard & Analytics Tests PASSED Successfully! ---');
}

runDashboardTests().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});

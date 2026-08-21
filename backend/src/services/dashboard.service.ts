import { prisma } from '../lib/prisma';

export interface DailyActivity {
  date: string;
  dayName: string;
  minutes: number;
  sessionsCount: number;
}

export interface TechnologyDistribution {
  technologyId: string | null;
  name: string;
  minutes: number;
  percentage: number;
}

export class DashboardService {
  /**
   * Calculates the current consecutive day streak of study sessions
   */
  calculateStreak(sessionDates: Date[]): number {
    if (!sessionDates || sessionDates.length === 0) return 0;

    // Convert dates to YYYY-MM-DD set (unique local calendar days)
    const uniqueDays = new Set<string>();
    sessionDates.forEach((d) => {
      uniqueDays.add(d.toISOString().split('T')[0]);
    });

    const sortedDays = Array.from(uniqueDays).sort().reverse();
    if (sortedDays.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If no session today or yesterday, streak is 0
    const mostRecent = sortedDays[0];
    if (mostRecent !== todayStr && mostRecent !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date(mostRecent);

    for (let i = 0; i < sortedDays.length; i++) {
      const expectedStr = checkDate.toISOString().split('T')[0];
      if (sortedDays.includes(expectedStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  async getStats(userId: string) {
    const [
      totalTechs,
      masteredTechs,
      inProgressTechs,
      totalGoals,
      completedGoals,
      sessions,
      totalResources,
      completedResources,
      totalNotes,
    ] = await Promise.all([
      prisma.technology.count({ where: { userId } }),
      prisma.technology.count({ where: { userId, status: 'MASTERED' } }),
      prisma.technology.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.goal.count({ where: { userId } }),
      prisma.goal.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.learningSession.findMany({
        where: { userId },
        select: { durationMinutes: true, sessionDate: true },
        orderBy: { sessionDate: 'desc' },
      }),
      prisma.learningResource.count({ where: { userId } }),
      prisma.learningResource.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.note.count({ where: { userId } }),
    ]);

    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const sessionDates = sessions.map((s) => s.sessionDate);
    const currentStreakDays = this.calculateStreak(sessionDates);

    const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    const resourceCompletionRate =
      totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;

    return {
      technologies: {
        total: totalTechs,
        mastered: masteredTechs,
        inProgress: inProgressTechs,
      },
      goals: {
        total: totalGoals,
        completed: completedGoals,
        active: totalGoals - completedGoals,
        completionRate: goalCompletionRate,
      },
      learning: {
        totalMinutes,
        totalHours,
        totalSessions: sessions.length,
        currentStreakDays,
      },
      resources: {
        total: totalResources,
        completed: completedResources,
        completionRate: resourceCompletionRate,
      },
      notes: {
        total: totalNotes,
      },
    };
  }

  async getActivity(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const sessions = await prisma.learningSession.findMany({
      where: {
        userId,
        sessionDate: { gte: startDate },
      },
      include: {
        technology: {
          select: { id: true, name: true },
        },
      },
      orderBy: { sessionDate: 'asc' },
    });

    // Build 7-day or 30-day date buckets
    const dailyMap = new Map<string, { minutes: number; count: number }>();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateKey = d.toISOString().split('T')[0];
      dailyMap.set(dateKey, { minutes: 0, count: 0 });
    }

    // Populate actual session values
    sessions.forEach((s) => {
      const dateKey = s.sessionDate.toISOString().split('T')[0];
      if (dailyMap.has(dateKey)) {
        const curr = dailyMap.get(dateKey)!;
        curr.minutes += s.durationMinutes;
        curr.count += 1;
      }
    });

    const dailyActivity: DailyActivity[] = Array.from(dailyMap.entries()).map(([date, val]) => {
      const parsedDate = new Date(date);
      return {
        date,
        dayName: dayNames[parsedDate.getUTCDay()],
        minutes: val.minutes,
        sessionsCount: val.count,
      };
    });

    // Technology time distribution over this period
    const techMap = new Map<string, { name: string; minutes: number }>();
    let periodTotalMinutes = 0;

    sessions.forEach((s) => {
      const techId = s.technologyId || 'general';
      const techName = s.technology?.name || 'General Learning';
      periodTotalMinutes += s.durationMinutes;

      if (!techMap.has(techId)) {
        techMap.set(techId, { name: techName, minutes: 0 });
      }
      techMap.get(techId)!.minutes += s.durationMinutes;
    });

    const technologyDistribution: TechnologyDistribution[] = Array.from(techMap.entries())
      .map(([id, val]) => ({
        technologyId: id === 'general' ? null : id,
        name: val.name,
        minutes: val.minutes,
        percentage:
          periodTotalMinutes > 0 ? Math.round((val.minutes / periodTotalMinutes) * 100) : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);

    return {
      periodDays: days,
      dailyActivity,
      technologyDistribution,
      totalMinutesLogged: periodTotalMinutes,
    };
  }

  async getSummary(userId: string) {
    const [stats, activity, topTechnologies, activeGoals, recentSessions, recentNotes] =
      await Promise.all([
        this.getStats(userId),
        this.getActivity(userId, 7),
        prisma.technology.findMany({
          where: { userId },
          orderBy: { progress: 'desc' },
          take: 5,
        }),
        prisma.goal.findMany({
          where: { userId, status: { in: ['NOT_STARTED', 'IN_PROGRESS'] } },
          include: { technology: { select: { id: true, name: true } } },
          orderBy: { deadline: 'asc' },
          take: 4,
        }),
        prisma.learningSession.findMany({
          where: { userId },
          include: { technology: { select: { id: true, name: true } } },
          orderBy: { sessionDate: 'desc' },
          take: 5,
        }),
        prisma.note.findMany({
          where: { userId },
          include: { technology: { select: { id: true, name: true } } },
          orderBy: { updatedAt: 'desc' },
          take: 4,
        }),
      ]);

    return {
      stats,
      activity,
      topTechnologies,
      activeGoals,
      recentSessions,
      recentNotes,
    };
  }
}

export const dashboardService = new DashboardService();

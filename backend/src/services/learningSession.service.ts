import { prisma } from '../lib/prisma';
import { CreateSessionInput, UpdateSessionInput, SessionQueryInput } from '../schemas/session.schema';

export class LearningSessionService {
  async list(userId: string, query: SessionQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.technologyId) {
      where.technologyId = query.technologyId;
    }

    if (query.startDate || query.endDate) {
      where.sessionDate = {};
      if (query.startDate) where.sessionDate.gte = new Date(query.startDate);
      if (query.endDate) where.sessionDate.lte = new Date(query.endDate);
    }

    const [items, total] = await Promise.all([
      prisma.learningSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sessionDate: 'desc' },
        include: {
          technology: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      }),
      prisma.learningSession.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(userId: string, id: string) {
    const item = await prisma.learningSession.findFirst({
      where: { id, userId },
      include: {
        technology: true,
      },
    });

    if (!item) {
      const error = new Error('Learning session not found.');
      (error as any).statusCode = 404;
      (error as any).code = 'NOT_FOUND';
      throw error;
    }

    return item;
  }

  async create(userId: string, input: CreateSessionInput) {
    if (input.technologyId) {
      const tech = await prisma.technology.findFirst({
        where: { id: input.technologyId, userId },
      });
      if (!tech) {
        const error = new Error('Associated technology not found.');
        (error as any).statusCode = 404;
        (error as any).code = 'NOT_FOUND';
        throw error;
      }
    }

    const session = await prisma.learningSession.create({
      data: {
        userId,
        durationMinutes: input.durationMinutes,
        topicsCovered: input.topicsCovered,
        notes: input.notes || null,
        technologyId: input.technologyId || null,
        sessionDate: input.sessionDate ? new Date(input.sessionDate) : new Date(),
      },
      include: {
        technology: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return session;
  }

  async update(userId: string, id: string, input: UpdateSessionInput) {
    const existing = await prisma.learningSession.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      const error = new Error('Learning session not found.');
      (error as any).statusCode = 404;
      (error as any).code = 'NOT_FOUND';
      throw error;
    }

    if (input.technologyId) {
      const tech = await prisma.technology.findFirst({
        where: { id: input.technologyId, userId },
      });
      if (!tech) {
        const error = new Error('Associated technology not found.');
        (error as any).statusCode = 404;
        (error as any).code = 'NOT_FOUND';
        throw error;
      }
    }

    const updated = await prisma.learningSession.update({
      where: { id },
      data: {
        ...(input.durationMinutes !== undefined && { durationMinutes: input.durationMinutes }),
        ...(input.topicsCovered !== undefined && { topicsCovered: input.topicsCovered }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.technologyId !== undefined && { technologyId: input.technologyId }),
        ...(input.sessionDate !== undefined && { sessionDate: input.sessionDate ? new Date(input.sessionDate) : new Date() }),
      },
      include: {
        technology: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  async delete(userId: string, id: string) {
    const existing = await prisma.learningSession.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      const error = new Error('Learning session not found.');
      (error as any).statusCode = 404;
      (error as any).code = 'NOT_FOUND';
      throw error;
    }

    await prisma.learningSession.delete({
      where: { id },
    });

    return { message: 'Learning session deleted successfully.' };
  }
}

export const learningSessionService = new LearningSessionService();

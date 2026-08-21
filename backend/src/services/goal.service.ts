import { prisma } from '../lib/prisma';
import { CreateGoalInput, UpdateGoalInput, GoalQueryInput } from '../schemas/goal.schema';

export class GoalService {
  async list(userId: string, query: GoalQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.technologyId) {
      where.technologyId = query.technologyId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.goal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          technology: {
            select: {
              id: true,
              name: true,
              status: true,
              category: true,
            },
          },
        },
      }),
      prisma.goal.count({ where }),
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
    const item = await prisma.goal.findFirst({
      where: { id, userId },
      include: {
        technology: true,
      },
    });

    if (!item) {
      const error = new Error('Goal not found.');
      (error as any).statusCode = 404;
      (error as any).code = 'NOT_FOUND';
      throw error;
    }

    return item;
  }

  async create(userId: string, input: CreateGoalInput) {
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

    const goal = await prisma.goal.create({
      data: {
        userId,
        title: input.title,
        description: input.description || null,
        technologyId: input.technologyId || null,
        targetMetric: input.targetMetric || null,
        progress: input.progress ?? 0,
        deadline: input.deadline ? new Date(input.deadline) : null,
        status: input.status,
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

    return goal;
  }

  async update(userId: string, id: string, input: UpdateGoalInput) {
    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      const error = new Error('Goal not found.');
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

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.technologyId !== undefined && { technologyId: input.technologyId }),
        ...(input.targetMetric !== undefined && { targetMetric: input.targetMetric }),
        ...(input.progress !== undefined && { progress: input.progress }),
        ...(input.deadline !== undefined && { deadline: input.deadline ? new Date(input.deadline) : null }),
        ...(input.status !== undefined && { status: input.status }),
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
    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      const error = new Error('Goal not found.');
      (error as any).statusCode = 404;
      (error as any).code = 'NOT_FOUND';
      throw error;
    }

    await prisma.goal.delete({
      where: { id },
    });

    return { message: 'Goal deleted successfully.' };
  }
}

export const goalService = new GoalService();

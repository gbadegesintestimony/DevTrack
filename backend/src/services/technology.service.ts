import { prisma } from '../lib/prisma';
import { CreateTechnologyInput, UpdateTechnologyInput, TechnologyQueryInput } from '../schemas/technology.schema';

export class TechnologyService {
  async list(userId: string, query: TechnologyQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.category) {
      where.category = { contains: query.category, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.technology.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: {
              goals: true,
              resources: true,
              sessions: true,
              notes: true,
            },
          },
        },
      }),
      prisma.technology.count({ where }),
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
    const item = await prisma.technology.findFirst({
      where: { id, userId },
      include: {
        goals: { orderBy: { createdAt: 'desc' } },
        resources: { orderBy: { createdAt: 'desc' } },
        sessions: { orderBy: { sessionDate: 'desc' }, take: 10 },
        notes: { orderBy: { updatedAt: 'desc' }, take: 10 },
        _count: {
          select: {
            goals: true,
            resources: true,
            sessions: true,
            notes: true,
          },
        },
      },
    });

    if (!item) {
      const error = new Error('Technology not found.');
      (error as any).statusCode = 404;
      (error as any).code = 'NOT_FOUND';
      throw error;
    }

    return item;
  }

  async create(userId: string, input: CreateTechnologyInput) {
    const existing = await prisma.technology.findUnique({
      where: {
        userId_name: {
          userId,
          name: input.name,
        },
      },
    });

    if (existing) {
      const error = new Error(`You are already tracking a technology named "${input.name}".`);
      (error as any).statusCode = 409;
      (error as any).code = 'TECHNOLOGY_ALREADY_EXISTS';
      throw error;
    }

    const technology = await prisma.technology.create({
      data: {
        userId,
        name: input.name,
        description: input.description || null,
        category: input.category || null,
        status: input.status,
        progress: input.progress ?? 0,
        startDate: input.startDate ? new Date(input.startDate) : null,
        targetDate: input.targetDate ? new Date(input.targetDate) : null,
      },
    });

    return technology;
  }

  async update(userId: string, id: string, input: UpdateTechnologyInput) {
    // Anti-IDOR check
    const existing = await prisma.technology.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      const error = new Error('Technology not found.');
      (error as any).statusCode = 404;
      (error as any).code = 'NOT_FOUND';
      throw error;
    }

    if (input.name && input.name !== existing.name) {
      const nameConflict = await prisma.technology.findUnique({
        where: {
          userId_name: {
            userId,
            name: input.name,
          },
        },
      });

      if (nameConflict) {
        const error = new Error(`You are already tracking a technology named "${input.name}".`);
        (error as any).statusCode = 409;
        (error as any).code = 'TECHNOLOGY_ALREADY_EXISTS';
        throw error;
      }
    }

    const updated = await prisma.technology.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.progress !== undefined && { progress: input.progress }),
        ...(input.startDate !== undefined && { startDate: input.startDate ? new Date(input.startDate) : null }),
        ...(input.targetDate !== undefined && { targetDate: input.targetDate ? new Date(input.targetDate) : null }),
      },
    });

    return updated;
  }

  async delete(userId: string, id: string) {
    // Anti-IDOR check
    const existing = await prisma.technology.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      const error = new Error('Technology not found.');
      (error as any).statusCode = 404;
      (error as any).code = 'NOT_FOUND';
      throw error;
    }

    await prisma.technology.delete({
      where: { id },
    });

    return { message: 'Technology deleted successfully.' };
  }
}

export const technologyService = new TechnologyService();

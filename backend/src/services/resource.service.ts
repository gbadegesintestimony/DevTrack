import { prisma } from '../lib/prisma';
import { CreateResourceInput, UpdateResourceInput, ResourceQueryInput } from '../schemas/resource.schema';

export class ResourceService {
  async list(userId: string, query: ResourceQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.type) {
      where.type = query.type;
    }

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
      prisma.learningResource.findMany({
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
            },
          },
        },
      }),
      prisma.learningResource.count({ where }),
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
    const item = await prisma.learningResource.findFirst({
      where: { id, userId },
      include: {
        technology: true,
      },
    });

    if (!item) {
      const error = new Error('Resource not found.');
      (error as any).statusCode = 404;
      (error as any).code = 'NOT_FOUND';
      throw error;
    }

    return item;
  }

  async create(userId: string, input: CreateResourceInput) {
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

    const resource = await prisma.learningResource.create({
      data: {
        userId,
        title: input.title,
        description: input.description || null,
        url: input.url,
        type: input.type,
        status: input.status,
        progress: input.progress ?? 0,
        notes: input.notes || null,
        technologyId: input.technologyId || null,
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

    return resource;
  }

  async update(userId: string, id: string, input: UpdateResourceInput) {
    const existing = await prisma.learningResource.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      const error = new Error('Resource not found.');
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

    const updated = await prisma.learningResource.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.url !== undefined && { url: input.url }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.progress !== undefined && { progress: input.progress }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.technologyId !== undefined && { technologyId: input.technologyId }),
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
    const existing = await prisma.learningResource.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      const error = new Error('Resource not found.');
      (error as any).statusCode = 404;
      (error as any).code = 'NOT_FOUND';
      throw error;
    }

    await prisma.learningResource.delete({
      where: { id },
    });

    return { message: 'Resource deleted successfully.' };
  }
}

export const resourceService = new ResourceService();

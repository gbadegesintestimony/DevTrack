import { prisma } from '../lib/prisma';
import { CreateNoteInput, UpdateNoteInput, NoteQueryInput } from '../schemas/note.schema';

export class NoteService {
  async list(userId: string, query: NoteQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.technologyId) {
      where.technologyId = query.technologyId;
    }

    if (query.tag) {
      where.tags = { has: query.tag };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.note.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          technology: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.note.count({ where }),
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
    // Strict Anti-IDOR enforcement: Note must belong to the requesting user!
    const item = await prisma.note.findFirst({
      where: { id, userId },
      include: {
        technology: true,
      },
    });

    if (!item) {
      const error = new Error('Note not found.');
      (error as any).statusCode = 404;
      (error as any).code = 'NOT_FOUND';
      throw error;
    }

    return item;
  }

  async create(userId: string, input: CreateNoteInput) {
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

    const note = await prisma.note.create({
      data: {
        userId,
        title: input.title,
        content: input.content,
        technologyId: input.technologyId || null,
        tags: input.tags || [],
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

    return note;
  }

  async update(userId: string, id: string, input: UpdateNoteInput) {
    const existing = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      const error = new Error('Note not found.');
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

    const updated = await prisma.note.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.technologyId !== undefined && { technologyId: input.technologyId }),
        ...(input.tags !== undefined && { tags: input.tags }),
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
    const existing = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      const error = new Error('Note not found.');
      (error as any).statusCode = 404;
      (error as any).code = 'NOT_FOUND';
      throw error;
    }

    await prisma.note.delete({
      where: { id },
    });

    return { message: 'Note deleted successfully.' };
  }
}

export const noteService = new NoteService();

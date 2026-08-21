import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z
    .string({ required_error: 'Note title is required' })
    .min(1, 'Note title cannot be empty')
    .max(200, 'Note title cannot exceed 200 characters')
    .trim(),
  content: z
    .string({ required_error: 'Note content is required' })
    .min(1, 'Note content cannot be empty')
    .max(50000, 'Note content cannot exceed 50,000 characters'),
  technologyId: z.string().uuid('Invalid technology ID').optional().nullable(),
  tags: z.array(z.string().trim().max(50)).optional().default([]),
});

export const updateNoteSchema = createNoteSchema.partial();

export const noteQuerySchema = z.object({
  search: z.string().optional(),
  technologyId: z.string().uuid().optional(),
  tag: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type NoteQueryInput = z.infer<typeof noteQuerySchema>;

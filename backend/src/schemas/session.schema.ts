import { z } from 'zod';

const dateOrEmptySchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
  .or(z.literal(''))
  .optional()
  .nullable()
  .transform((val) => (val === '' ? null : val));

export const createSessionSchema = z.object({
  technologyId: z
    .string()
    .uuid('Invalid technology ID')
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  durationMinutes: z.coerce
    .number({ required_error: 'Duration in minutes is required' })
    .min(1, 'Duration must be at least 1 minute')
    .max(1440, 'Duration cannot exceed 24 hours (1440 minutes)'),
  topicsCovered: z
    .string({ required_error: 'Topics covered description is required' })
    .min(1, 'Please specify topics covered')
    .max(500, 'Topics cannot exceed 500 characters')
    .trim(),
  notes: z
    .string()
    .max(2000)
    .trim()
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  sessionDate: dateOrEmptySchema,
});

export const updateSessionSchema = createSessionSchema.partial();

export const sessionQuerySchema = z.object({
  technologyId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type SessionQueryInput = z.infer<typeof sessionQuerySchema>;

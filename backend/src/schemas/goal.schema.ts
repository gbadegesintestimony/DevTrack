import { z } from 'zod';

export const GoalStatusEnum = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']);

const dateOrEmptySchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
  .or(z.literal(''))
  .optional()
  .nullable()
  .transform((val) => (val === '' ? null : val));

export const createGoalSchema = z.object({
  title: z
    .string({ required_error: 'Goal title is required' })
    .min(1, 'Goal title cannot be empty')
    .max(150, 'Goal title cannot exceed 150 characters')
    .trim(),
  description: z
    .string()
    .max(1000)
    .trim()
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  technologyId: z
    .string()
    .uuid('Invalid technology ID')
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  targetMetric: z
    .string()
    .max(100)
    .trim()
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  progress: z.coerce.number().min(0).max(100).optional().default(0),
  deadline: dateOrEmptySchema,
  status: GoalStatusEnum.optional().default('NOT_STARTED'),
});

export const updateGoalSchema = createGoalSchema.partial();

export const goalQuerySchema = z.object({
  search: z.string().optional(),
  technologyId: z.string().uuid().optional(),
  status: GoalStatusEnum.optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GoalQueryInput = z.infer<typeof goalQuerySchema>;

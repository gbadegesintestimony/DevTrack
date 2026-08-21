import { z } from 'zod';

export const TechStatusEnum = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'MASTERED', 'ON_HOLD']);

const dateOrEmptySchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
  .or(z.literal(''))
  .optional()
  .nullable()
  .transform((val) => (val === '' ? null : val));

export const createTechnologySchema = z.object({
  name: z
    .string({ required_error: 'Technology name is required' })
    .min(1, 'Technology name cannot be empty')
    .max(100, 'Technology name cannot exceed 100 characters')
    .trim(),
  description: z
    .string()
    .max(1000)
    .trim()
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  category: z
    .string()
    .max(50)
    .trim()
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  status: TechStatusEnum.optional().default('NOT_STARTED'),
  progress: z.coerce.number().min(0).max(100).optional().default(0),
  startDate: dateOrEmptySchema,
  targetDate: dateOrEmptySchema,
});

export const updateTechnologySchema = createTechnologySchema.partial();

export const technologyQuerySchema = z.object({
  search: z.string().optional(),
  status: TechStatusEnum.optional(),
  category: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateTechnologyInput = z.infer<typeof createTechnologySchema>;
export type UpdateTechnologyInput = z.infer<typeof updateTechnologySchema>;
export type TechnologyQueryInput = z.infer<typeof technologyQuerySchema>;

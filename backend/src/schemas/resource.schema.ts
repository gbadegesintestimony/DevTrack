import { z } from 'zod';

export const ResourceTypeEnum = z.enum([
  'COURSE',
  'DOCUMENTATION',
  'BOOK',
  'TUTORIAL',
  'VIDEO',
  'ARTICLE',
  'OTHER',
]);

export const ResourceStatusEnum = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']);

// Validates that the URL uses http or https protocol
const secureUrlSchema = z
  .string({ required_error: 'Resource URL is required' })
  .url('Please provide a valid URL')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL must use HTTP or HTTPS protocol' }
  );

export const createResourceSchema = z.object({
  title: z
    .string({ required_error: 'Resource title is required' })
    .min(1, 'Resource title cannot be empty')
    .max(200, 'Resource title cannot exceed 200 characters')
    .trim(),
  description: z
    .string()
    .max(1000)
    .trim()
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  url: secureUrlSchema,
  technologyId: z
    .string()
    .uuid('Invalid technology ID')
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  type: ResourceTypeEnum.optional().default('ARTICLE'),
  status: ResourceStatusEnum.optional().default('NOT_STARTED'),
  progress: z.coerce.number().min(0).max(100).optional().default(0),
  notes: z
    .string()
    .max(2000)
    .trim()
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
});

export const updateResourceSchema = createResourceSchema.partial();

export const resourceQuerySchema = z.object({
  search: z.string().optional(),
  technologyId: z.string().uuid().optional(),
  type: ResourceTypeEnum.optional(),
  status: ResourceStatusEnum.optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ResourceQueryInput = z.infer<typeof resourceQuerySchema>;

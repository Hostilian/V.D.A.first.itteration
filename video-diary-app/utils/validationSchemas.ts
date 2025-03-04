import { z } from 'zod';

export const videoMetadataSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 50 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
});

// Fix the zod type inference syntax
export type VideoMetadataFormData = z.infer<typeof videoMetadataSchema>;

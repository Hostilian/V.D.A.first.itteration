// lib/validation.ts
import { z } from 'zod';

export const videoMetadataSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
});

export type VideoMetadataFormValues = z.infer<typeof videoMetadataSchema>;

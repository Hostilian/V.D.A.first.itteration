// lib/validation.ts
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { z } from 'zod';

// Basic validation constants
const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_TAG_LENGTH = 30;
const MAX_TAGS = 10;

// Common error messages
export const ValidationErrorMessages = {
  required: 'This field is required',
  tooShort: (field: string, min: number) => `${field} must be at least ${min} characters`,
  tooLong: (field: string, max: number) => `${field} cannot exceed ${max} characters`,
  invalidFormat: (field: string) => `${field} format is invalid`,
  fileSize: (maxSize: string) => `File size should not exceed ${maxSize}`,
  invalidFileType: 'File type not supported'
};

// Video file validation
export const videoFileSchema = z.object({
  uri: z.string().min(1, { message: ValidationErrorMessages.required }),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  duration: z.number().optional()
}).refine(data => {
  if (data.mimeType) {
    return data.mimeType.startsWith('video/');
  }
  return true;
}, {
  message: ValidationErrorMessages.invalidFileType,
  path: ['mimeType']
}).refine(data => {
  // Max file size: 500MB (adjust as needed)
  const MAX_SIZE = 500 * 1024 * 1024;
  if (data.fileSize) {
    return data.fileSize <= MAX_SIZE;
  }
  return true;
}, {
  message: ValidationErrorMessages.fileSize('500MB'),
  path: ['fileSize']
});

// Video metadata validation
export const videoMetadataSchema = z.object({
  title: z.string()
    .min(MIN_TITLE_LENGTH, { message: ValidationErrorMessages.tooShort('Title', MIN_TITLE_LENGTH) })
    .max(MAX_TITLE_LENGTH, { message: ValidationErrorMessages.tooLong('Title', MAX_TITLE_LENGTH) }),
  description: z.string()
    .max(MAX_DESCRIPTION_LENGTH, { message: ValidationErrorMessages.tooLong('Description', MAX_DESCRIPTION_LENGTH) })
    .optional(),
  tags: z.array(z.string()
    .max(MAX_TAG_LENGTH, { message: ValidationErrorMessages.tooLong('Tag', MAX_TAG_LENGTH) }))
    .max(MAX_TAGS, { message: `Cannot add more than ${MAX_TAGS} tags` })
    .optional(),
  recordedAt: z.date().optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional()
  }).optional()
});

// Platform-specific validation helpers
export const platformSpecificValidation = {
  getVideoConstraints: () => {
    if (Platform.OS === 'ios') {
      return {
        maxFileSize: 1024 * 1024 * 1024, // 1GB
        maxDuration: 600, // 10 minutes
        allowedFormats: ['mp4', 'mov']
      };
    } else if (Platform.OS === 'android') {
      return {
        maxFileSize: 700 * 1024 * 1024, // 700MB
        maxDuration: 600,
        allowedFormats: ['mp4', '3gp', 'webm']
      };
    } else {
      return {
        maxFileSize: 300 * 1024 * 1024, // 300MB
        maxDuration: 300, // 5 minutes
        allowedFormats: ['mp4']
      };
    }
  },
  isVideoFormatSupported: (mimeType: string) => {
    const format = mimeType.split('/')[1];
    const constraints = platformSpecificValidation.getVideoConstraints();
    return constraints.allowedFormats.includes(format);
  }
};

// Form validation helper that returns formatted errors
export function validateForm<T>(schema: z.ZodType<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const key = err.path.join('.') || 'form';
        formattedErrors[key] = err.message;
      });
      return { success: false, errors: formattedErrors };
    }
    return {
      success: false,
      errors: { form: 'An unknown validation error occurred' }
    };
  }
}

// Create a form hook wrapper for validation
export function useFormValidation<T>(schema: z.ZodType<T>, initialValues: Partial<T>) {
  const [values, setValues] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: keyof T, value: any) => {
    const fieldSchema = z.object({ [name]: schema.shape[name] });
    const result = validateForm(fieldSchema, { [name]: value });
    if (!result.success && result.errors) {
      setErrors(prev => ({ ...prev, [name]: result.errors![name] || '' }));
      return false;
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
      return true;
    }
  }, [schema]);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name as string]) {
      validateField(name, value);
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  }, [values, validateField]);

  const validateAll = useCallback(() => {
    const result = validateForm(schema, values);
    if (!result.success && result.errors) {
      setErrors(result.errors);
      // Mark all fields as touched
      const allTouched = Object.keys(result.errors).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setTouched(prev => ({ ...prev, ...allTouched }));
      return false;
    }
    return true;
  }, [schema, values]);

  return {
    values,
    setValues,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    validateField
  };
}

// User input validation for search
export const searchQuerySchema = z.string()
  .trim()
  .min(1, { message: 'Search query cannot be empty' })
  .max(100, { message: ValidationErrorMessages.tooLong('Search query', 100) });

// Video crop parameters validation
export const cropParametersSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().min(50, { message: 'Width must be at least 50px' }),
  height: z.number().min(50, { message: 'Height must be at least 50px' })
});

// User settings validation
export const userSettingsSchema = z.object({
  videoQuality: z.enum(['high', 'medium', 'low']),
  autoSaveEnabled: z.boolean(),
  darkMode: z.boolean(),
  notificationsEnabled: z.boolean(),
  maxCacheSize: z.number().min(100 * 1024 * 1024) // Minimum 100MB
});

export type VideoMetadataFormValues = z.infer<typeof videoMetadataSchema>;

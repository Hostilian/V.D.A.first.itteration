import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * Hook to persist form data to AsyncStorage
 *
 * @param key Unique key for storage
 * @param form React Hook Form's useForm return value
 * @param onLoad Optional callback when form data is loaded
 */
export function useFormPersistence<T extends FieldValues>(
  key: string,
  form: UseFormReturn<T>,
  onLoad?: (data: T) => void
): {
  clearPersistedData: () => Promise<void>;
} {
  const isFocused = useIsFocused();
  const { watch, reset } = form;
  const formValues = watch();

  // Load form data from storage when component mounts
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const storedData = await AsyncStorage.getItem(key);
        if (storedData) {
          const parsedData = JSON.parse(storedData) as T;
          reset(parsedData);
          onLoad?.(parsedData);
        }
      } catch (error) {
        console.error('Failed to load persisted form data:', error);
      }
    };

    if (isFocused) {
      loadPersistedData();
    }
  }, [key, reset, isFocused, onLoad]);

  // Save form data to storage whenever it changes
  useEffect(() => {
    const persistData = async () => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(formValues));
      } catch (error) {
        console.error('Failed to persist form data:', error);
      }
    };

    if (Object.keys(formValues).length > 0) {
      persistData();
    }
  }, [key, formValues]);

  // Function to clear persisted data
  const clearPersistedData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear persisted form data:', error);
    }
  }, [key]);

  return { clearPersistedData };
}

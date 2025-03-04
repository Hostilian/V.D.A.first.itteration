import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

/**
 * Custom hook to persist form data to AsyncStorage
 * @param form The react-hook-form instance
 * @param key A unique key for this form
 * @param watch Optional array of field names to watch
 */
export function useFormPersistence<T>(
  form: UseFormReturn<T>,
  key: string,
  watch?: Array<keyof T>
) {
  const { reset, getValues, setValue } = form;

  // Load saved form data on mount
  useEffect(() => {
    const loadSavedFormData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(`form_${key}`);

        if (savedData) {
          const parsedData = JSON.parse(savedData) as Partial<T>;

          // Reset form with saved values
          reset(parsedData as T);
        }
      } catch (error) {
        console.error('Failed to load saved form data:', error);
      }
    };

    loadSavedFormData();

    // Clean up on unmount
    return () => {
      AsyncStorage.removeItem(`form_${key}`);
    };
  }, [key]);

  // Save form data as fields change
  useEffect(() => {
    const subscription = form.watch((value) => {
      const currentValues = getValues();

      // If watch array is provided, only persist those fields
      const valuesToSave = watch
        ? Object.fromEntries(
            watch.map(field => [field, currentValues[field as string]])
          )
        : currentValues;

      AsyncStorage.setItem(`form_${key}`, JSON.stringify(valuesToSave));
    });

    return () => subscription.unsubscribe();
  }, [form, key, watch]);

  // Function to clear saved form data
  const clearSavedData = async () => {
    await AsyncStorage.removeItem(`form_${key}`);
  };

  return {
    clearSavedData
  };
}

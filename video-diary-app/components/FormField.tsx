import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import CharacterCounter from './CharacterCounter';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  showCount?: boolean;
  maxLength?: number;
  currentLength?: number;
  containerStyle?: string;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  showCount = false,
  maxLength,
  currentLength = 0,
  containerStyle = '',
  required = false,
  ...props
}) => {
  return (
    <View className={`mb-4 ${containerStyle}`}>
      <Text className="text-base font-bold mb-2">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>

      <TextInput
        className={`bg-gray-50 border rounded-md px-3 py-2 mb-1 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholderTextColor="#9CA3AF"
        maxLength={maxLength}
        {...props}
      />

      {showCount && maxLength && (
        <CharacterCounter current={currentLength} max={maxLength} />
      )}

      {error && (
        <Text className="text-red-500 text-sm mt-1 mb-1">{error}</Text>
      )}
    </View>
  );
};

export default FormField;

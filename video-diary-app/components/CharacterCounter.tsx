import React from 'react';
import { Text, View } from 'react-native';

interface CharacterCounterProps {
  current: number;
  max: number;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({ current, max }) => {
  const isApproachingLimit = current > max * 0.8;
  const isAtLimit = current >= max;

  return (
    <View className="flex-row justify-end mt-1">
      <Text
        className={`text-xs ${
          isAtLimit
            ? 'text-red-600 font-bold'
            : isApproachingLimit
            ? 'text-amber-600'
            : 'text-gray-500'
        }`}
      >
        {current}/{max}
      </Text>
    </View>
  );
};

export default CharacterCounter;

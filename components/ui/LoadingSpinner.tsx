import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  return (
    <View className={`items-center justify-center gap-3 ${fullScreen ? 'flex-1' : 'py-12'}`}>
      <ActivityIndicator size="large" color="#3525cd" />
      {message && <Text className="text-sm text-surface-muted">{message}</Text>}
    </View>
  );
}

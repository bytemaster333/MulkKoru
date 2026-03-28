import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8 py-16">
      <View className="rounded-full bg-surface-card p-6">{icon}</View>
      <View className="items-center gap-2">
        <Text className="text-xl font-bold text-dark-text text-center">{title}</Text>
        <Text className="text-sm text-surface-muted text-center leading-5">{description}</Text>
      </View>
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} size="md" className="mt-2" />
      )}
    </View>
  );
}

import React from 'react';
import { View, Text } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  danger:  'bg-danger/20 text-danger',
  info:    'bg-info/20 text-info',
  brand:   'bg-brand/20 text-brand-200',
  neutral: 'bg-surface-container text-on-surface',
};

export function Badge({ label, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const padding  = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';
  const textSize = size === 'sm' ? 'text-xs'     : 'text-sm';

  return (
    <View className={`rounded-full ${padding} ${VARIANT_STYLES[variant].split(' ')[0]}`}>
      <Text className={`${textSize} font-semibold ${VARIANT_STYLES[variant].split(' ')[1]}`}>
        {label}
      </Text>
    </View>
  );
}

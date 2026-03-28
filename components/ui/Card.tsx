import React from 'react';
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'bordered';
}

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  const base = 'rounded-2xl p-4';
  const variants = {
    default:  'bg-surface-card',
    elevated: 'bg-surface-card shadow-lg',
    bordered: 'bg-surface-card border border-surface-border',
  };

  return (
    <View
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}

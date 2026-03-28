import React, { useState } from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? 'border-danger'
    : focused
    ? 'border-brand-500'
    : 'border-surface-border';

  return (
    <View className="gap-1">
      {label && (
        <Text className="text-sm font-medium text-dark-subtext">{label}</Text>
      )}
      <View
        className={`flex-row items-center rounded-xl border bg-surface-card px-3 py-3 gap-2 ${borderColor}`}
      >
        {leftIcon}
        <TextInput
          className={`flex-1 text-base text-dark-text ${className}`}
          placeholderTextColor="#6b7280"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon}
      </View>
      {error ? (
        <Text className="text-xs text-danger">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-surface-muted">{hint}</Text>
      ) : null}
    </View>
  );
}

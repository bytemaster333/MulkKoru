import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, type TouchableOpacityProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string }> = {
  primary:   { bg: 'bg-brand-500 active:bg-brand-600',       text: 'text-white' },
  secondary: { bg: 'bg-accent active:bg-accent/80',          text: 'text-white' },
  outline:   { bg: 'border border-brand-500 bg-transparent', text: 'text-brand-300' },
  ghost:     { bg: 'bg-transparent',                         text: 'text-brand-300' },
  danger:    { bg: 'bg-danger active:bg-danger/80',          text: 'text-white' },
};

const SIZE_STYLES: Record<ButtonSize, { padding: string; text: string }> = {
  sm: { padding: 'px-4 py-2',   text: 'text-sm' },
  md: { padding: 'px-5 py-3',   text: 'text-base' },
  lg: { padding: 'px-6 py-4',   text: 'text-lg' },
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const { bg, text } = VARIANT_STYLES[variant];
  const { padding, text: textSize } = SIZE_STYLES[size];
  const opacity = disabled || loading ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      className={`flex-row items-center justify-center gap-2 rounded-xl ${bg} ${padding} ${opacity} ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <>
          {icon}
          <Text className={`font-semibold ${textSize} ${text}`}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

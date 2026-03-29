// Bento-box stil istatistik kartı — Dashboard ana bileşeni
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: string;
  trend?: { value: string; positive: boolean };
  onPress?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  onPress,
  className = '',
}: StatCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      className={`rounded-xl bg-white border border-surface-container p-4 gap-3 ${className}`}
      activeOpacity={0.8}
    >
      {/* Header row */}
      <View className="flex-row items-center justify-between">
        <View className="rounded-xl bg-brand-500/10 p-2">
          {icon}
        </View>
        {trend && (
          <View className={`flex-row items-center gap-1 rounded-full px-2 py-0.5 ${
            trend.positive ? 'bg-success/20' : 'bg-danger/20'
          }`}>
            <Text className={`text-xs font-semibold ${
              trend.positive ? 'text-success' : 'text-danger'
            }`}>
              {trend.positive ? '▲' : '▼'} {trend.value}
            </Text>
          </View>
        )}
      </View>

      {/* Value */}
      <View className="gap-0.5">
        <Text className="text-2xl font-bold text-on-surface" numberOfLines={1}>
          {value}
        </Text>
        <Text className="text-sm text-surface-muted">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-surface-muted mt-0.5">{subtitle}</Text>
        )}
      </View>
    </Wrapper>
  );
}

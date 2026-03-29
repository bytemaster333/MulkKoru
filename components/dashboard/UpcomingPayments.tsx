import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Calendar, AlertCircle } from 'lucide-react-native';
import { formatCurrency, formatDate, daysUntil } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import type { Payment } from '../../types';

interface UpcomingPaymentsProps {
  payments: Payment[];
  onPaymentPress?: (payment: Payment) => void;
}

export function UpcomingPayments({ payments, onPaymentPress }: UpcomingPaymentsProps) {
  if (payments.length === 0) {
    return (
      <View className="items-center py-8 gap-2">
        <Calendar size={32} color="#6b7280" />
        <Text className="text-sm text-surface-muted">Yaklaşan ödeme bulunmuyor</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={payments.slice(0, 5)}
      keyExtractor={item => item.id}
      scrollEnabled={false}
      ItemSeparatorComponent={() => <View className="h-2" />}
      renderItem={({ item }) => {
        const days    = daysUntil(item.due_date);
        const overdue = days < 0;
        const urgent  = days >= 0 && days <= 3;

        return (
          <TouchableOpacity
            onPress={() => onPaymentPress?.(item)}
            activeOpacity={0.8}
            className="flex-row items-center gap-3 rounded-xl bg-surface-container/50 p-3"
          >
            <View className={`rounded-xl p-2 ${overdue ? 'bg-error/10' : urgent ? 'bg-warning/20' : 'bg-brand-500/10'}`}>
              {overdue
                ? <AlertCircle size={16} color="#ba1a1a" />
                : <Calendar size={16} color={urgent ? '#f59e0b' : '#3525cd'} />
              }
            </View>

            <View className="flex-1 gap-0.5">
              <Text className="text-sm font-medium text-on-surface" numberOfLines={1}>
                {(item.contract as { properties?: { title?: string } } | undefined)?.properties?.title ?? 'Mülk'}
              </Text>
              <Text className="text-xs text-surface-muted">
                {formatDate(item.due_date)} ·{' '}
                {overdue
                  ? `${Math.abs(days)} gün gecikmiş`
                  : days === 0
                  ? 'Bugün'
                  : `${days} gün kaldı`}
              </Text>
            </View>

            <Text className={`text-sm font-bold ${overdue ? 'text-error' : 'text-on-surface'}`}>
              {formatCurrency(item.amount)}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

// Ödeme Takvimi — aylık görünüm, renk kodlu göstergeler
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import { useMonthlyPayments } from '../../hooks/usePayments';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, formatDate, formatStatus } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Payment, PaymentStatus } from '../../types';

const STATUS_CONFIG: Record<PaymentStatus, { icon: typeof CheckCircle; color: string; badge: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  paid:    { icon: CheckCircle,  color: '#10b981', badge: 'success' },
  pending: { icon: Clock,        color: '#f59e0b', badge: 'warning' },
  partial: { icon: Clock,        color: '#3b82f6', badge: 'info' as 'neutral' },
  overdue: { icon: AlertCircle,  color: '#ef4444', badge: 'danger' },
};

const TR_MONTHS = [
  'Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık',
];

export default function CalendarScreen() {
  const now            = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { payments, loading, refetch } = useMonthlyPayments(year, month);

  const totalExpected = payments.reduce((s, p) => s + p.amount, 0);
  const totalPaid     = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.paid_amount ?? p.amount), 0);
  const overdueCount  = payments.filter(p => p.status === 'overdue').length;

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else              setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else               setMonth(m => m + 1);
  }

  async function handleMarkPaid(payment: Payment) {
    await paymentService.markAsPaid(payment.id);
    refetch();
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-dark">
      {/* ── Header ─────────────────────────────────── */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-dark-text">Ödeme Takvimi</Text>
      </View>

      {/* ── Ay Navigasyonu ─────────────────────────── */}
      <View className="mx-5 rounded-2xl bg-surface-card border border-surface-border p-4 gap-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={prevMonth}
            className="w-9 h-9 rounded-xl bg-surface-border items-center justify-center"
          >
            <ChevronLeft size={20} color="#94a3b8" />
          </TouchableOpacity>
          <Text className="text-dark-text font-bold text-lg">
            {TR_MONTHS[month - 1]} {year}
          </Text>
          <TouchableOpacity
            onPress={nextMonth}
            className="w-9 h-9 rounded-xl bg-surface-border items-center justify-center"
          >
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Özet istatistikler */}
        <View className="flex-row gap-2">
          <View className="flex-1 rounded-xl bg-success/10 p-3 gap-1">
            <Text className="text-xs text-surface-muted">Tahsilat</Text>
            <Text className="text-sm font-bold text-success">{formatCurrency(totalPaid)}</Text>
          </View>
          <View className="flex-1 rounded-xl bg-brand/10 p-3 gap-1">
            <Text className="text-xs text-surface-muted">Beklenen</Text>
            <Text className="text-sm font-bold text-brand-300">{formatCurrency(totalExpected)}</Text>
          </View>
          {overdueCount > 0 && (
            <View className="flex-1 rounded-xl bg-danger/10 p-3 gap-1">
              <Text className="text-xs text-surface-muted">Gecikmiş</Text>
              <Text className="text-sm font-bold text-danger">{overdueCount} ödeme</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Ödeme Listesi ──────────────────────────── */}
      {loading ? (
        <LoadingSpinner message="Ödemeler yükleniyor..." />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={item => item.id}
          contentContainerClassName="px-5 pt-4 pb-6 gap-3"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              tintColor="#3525cd"
              colors={['#3525cd']}
            />
          }
          ListEmptyComponent={
            <View className="items-center py-16 gap-3">
              <CalendarIcon size={40} color="#6b7280" />
              <Text className="text-surface-muted text-sm text-center">
                Bu ay için ödeme kaydı bulunmuyor.
              </Text>
            </View>
          }
          renderItem={({ item }: { item: Payment }) => {
            const config    = STATUS_CONFIG[item.status];
            const Icon      = config.icon;
            const canMarkPaid = item.status === 'pending' || item.status === 'overdue';

            return (
              <View className="rounded-2xl bg-surface-card border border-surface-border p-4 gap-3">
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-row items-center gap-2 flex-1">
                    <View className={`rounded-xl p-2 bg-${config.badge === 'success' ? 'success' : config.badge === 'warning' ? 'warning' : config.badge === 'danger' ? 'danger' : 'brand'}/20`}>
                      <Icon size={16} color={config.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-dark-text" numberOfLines={1}>
                        {(item.contract as { properties?: { title?: string } } | undefined)?.properties?.title ?? 'Mülk'}
                      </Text>
                      <Text className="text-xs text-surface-muted">
                        {formatDate(item.due_date)}
                      </Text>
                    </View>
                  </View>
                  <Badge label={formatStatus(item.status)} variant={config.badge} />
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-dark-text">
                    {formatCurrency(item.amount)}
                  </Text>
                  {canMarkPaid && (
                    <TouchableOpacity
                      onPress={() => handleMarkPaid(item)}
                      className="flex-row items-center gap-1.5 bg-success/20 rounded-xl px-3 py-1.5"
                    >
                      <CheckCircle size={14} color="#10b981" />
                      <Text className="text-success text-xs font-semibold">Ödendi</Text>
                    </TouchableOpacity>
                  )}
                  {item.status === 'paid' && item.paid_date && (
                    <Text className="text-xs text-surface-muted">
                      {formatDate(item.paid_date)} tarihinde alındı
                    </Text>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

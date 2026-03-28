// Dashboard — Bento-box Fintech UI
import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Building2, Users, TrendingUp, AlertTriangle,
  Bell, Settings, Home,
} from 'lucide-react-native';
import { StatCard } from '../../components/ui/StatCard';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { UpcomingPayments } from '../../components/dashboard/UpcomingPayments';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useDashboardStats, useUpcomingPayments } from '../../hooks/usePayments';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export default function DashboardScreen() {
  const router             = useRouter();
  const { user }           = useAuth();
  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { payments, loading: paymentsLoading, refetch: refetchPayments } = useUpcomingPayments(30);

  const isLoading   = statsLoading || paymentsLoading;
  const greeting    = getGreeting();
  const firstName   = user?.full_name?.split(' ')[0] ?? 'Hoş Geldiniz';

  const onRefresh = useCallback(async () => {
    await Promise.all([refetchStats(), refetchPayments()]);
  }, [refetchStats, refetchPayments]);

  return (
    <SafeAreaView className="flex-1 bg-surface-dark">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor="#3525cd"
            colors={['#3525cd']}
          />
        }
      >
        {/* ── Header ─────────────────────────────────── */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
          <View>
            <Text className="text-surface-muted text-sm">{greeting}</Text>
            <Text className="text-dark-text text-xl font-bold">{firstName}</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity className="w-10 h-10 rounded-full bg-surface-card items-center justify-center">
              <Bell size={20} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-surface-card items-center justify-center">
              <Settings size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading && !stats ? (
          <LoadingSpinner message="Veriler yükleniyor..." />
        ) : (
          <View className="px-5 gap-5">

            {/* ── Ana Gelir Kartı (tam genişlik) ────────── */}
            <View className="rounded-3xl bg-brand-500 p-5 gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-brand-200 text-sm font-medium">Aylık Kira Geliri</Text>
                <View className="rounded-full bg-white/10 p-2">
                  <TrendingUp size={18} color="#ffffff" />
                </View>
              </View>
              <Text className="text-white text-4xl font-bold">
                {formatCurrency(stats?.monthly_income ?? 0)}
              </Text>
              <View className="flex-row items-center gap-4 pt-2 border-t border-white/20">
                <View className="flex-row items-center gap-1.5">
                  <Home size={14} color="#aba1ed" />
                  <Text className="text-brand-200 text-xs">{stats?.active_contracts ?? 0} aktif sözleşme</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Building2 size={14} color="#aba1ed" />
                  <Text className="text-brand-200 text-xs">
                    {formatPercentage(stats?.occupancy_rate ?? 0, 0)} doluluk
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Bento Stat Grid ────────────────────────── */}
            <View className="flex-row gap-3">
              <StatCard
                className="flex-1"
                title="Toplam Mülk"
                value={String(stats?.total_properties ?? 0)}
                icon={<Building2 size={20} color="#3525cd" />}
              />
              <StatCard
                className="flex-1"
                title="Kiracı Sayısı"
                value={String(stats?.active_contracts ?? 0)}
                icon={<Users size={20} color="#6d5ce7" />}
              />
            </View>

            <View className="flex-row gap-3">
              <StatCard
                className="flex-1"
                title="Gecikmiş"
                value={String(stats?.overdue_payments ?? 0)}
                subtitle="ödeme"
                icon={<AlertTriangle size={20} color="#ef4444" />}
              />
              <StatCard
                className="flex-1"
                title="Yaklaşan"
                value={String(stats?.upcoming_payments_count ?? 0)}
                subtitle="30 gün içinde"
                icon={<Bell size={20} color="#f59e0b" />}
              />
            </View>

            {/* ── Hızlı İşlemler ────────────────────────── */}
            <View className="gap-3">
              <Text className="text-dark-text font-semibold text-base">Hızlı İşlemler</Text>
              <QuickActions
                onAddProperty={() => router.push('/modals/add-property')}
                onAddTenant={() => router.push('/modals/add-tenant')}
                onNewContract={() => router.push('/modals/add-contract')}
              />
            </View>

            {/* ── Yaklaşan Ödemeler ──────────────────────── */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-dark-text font-semibold text-base">Yaklaşan Ödemeler</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
                  <Text className="text-brand-300 text-sm">Tümünü Gör</Text>
                </TouchableOpacity>
              </View>
              <View className="rounded-2xl bg-surface-card border border-surface-border p-4">
                <UpcomingPayments payments={payments} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Günaydın,';
  if (hour < 18) return 'İyi günler,';
  return 'İyi akşamlar,';
}

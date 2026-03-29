// Dashboard — Bento-box Light Theme
import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import {
  Building2, Users, AlertTriangle, Bell, Settings,
  TrendingUp, UserPlus, Sparkles,
} from 'lucide-react-native';
import { StatCard } from '../../components/ui/StatCard';
import { UpcomingPayments } from '../../components/dashboard/UpcomingPayments';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useDashboardStats, useUpcomingPayments } from '../../hooks/usePayments';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

// ── Circular Progress ──────────────────────────────────────────────────────
function CircularProgress({
  percentage,
  size = 80,
  strokeWidth = 8,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#eaedff"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#3525cd"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '800', color: '#3525cd' }}>
          %{Math.round(percentage)}
        </Text>
      </View>
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router   = useRouter();
  const { user } = useAuth();
  const { stats, loading: statsLoading, refetch: refetchStats }       = useDashboardStats();
  const { payments, loading: paymentsLoading, refetch: refetchPayments } = useUpcomingPayments(30);

  const isLoading = statsLoading || paymentsLoading;
  const firstName = user?.full_name?.split(' ')[0] ?? 'Hoş Geldiniz';
  const initials  = firstName[0]?.toUpperCase() ?? 'M';
  const greeting  = getGreeting();
  const occupancy = stats?.occupancy_rate ?? 0;

  const onRefresh = useCallback(async () => {
    await Promise.all([refetchStats(), refetchPayments()]);
  }, [refetchStats, refetchPayments]);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
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
        {/* ── Header ──────────────────────────────────────── */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-full bg-brand-500 items-center justify-center">
              <Text className="text-white text-lg font-bold">{initials}</Text>
            </View>
            <View>
              <Text className="text-surface-muted text-xs">{greeting}</Text>
              <Text className="text-on-surface text-xl font-bold">{firstName}</Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity className="w-10 h-10 rounded-full bg-surface-container items-center justify-center">
              <Bell size={20} color="#131b2e" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-surface-container items-center justify-center">
              <Settings size={20} color="#131b2e" />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading && !stats ? (
          <LoadingSpinner message="Veriler yükleniyor..." />
        ) : (
          <View className="px-5 gap-4">

            {/* ── Ana Gelir Kartı (tam genişlik) ────────────── */}
            <View className="rounded-xl bg-brand-500 p-5 gap-3">
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
                  <Building2 size={14} color="#aba1ed" />
                  <Text className="text-brand-200 text-xs">{stats?.active_contracts ?? 0} aktif sözleşme</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Users size={14} color="#aba1ed" />
                  <Text className="text-brand-200 text-xs">
                    {formatPercentage(occupancy, 0)} doluluk
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Bento Aksiyon Sırası (asimetrik) ────────────── */}
            <View className="flex-row gap-3">
              {/* Sol — Mülk Ekle (gradient, flex-1) */}
              <TouchableOpacity
                onPress={() => router.push('/modals/add-property')}
                activeOpacity={0.85}
                className="flex-1 rounded-xl bg-brand-500 p-5 gap-3"
              >
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                  <Building2 size={20} color="#ffffff" />
                </View>
                <View className="gap-0.5">
                  <Text className="text-white text-base font-bold">Mülk Ekle</Text>
                  <Text className="text-white/70 text-xs">Portföyünüzü genişletin</Text>
                </View>
              </TouchableOpacity>

              {/* Sağ — Kiracı Davet Et (sade) */}
              <TouchableOpacity
                onPress={() => router.push('/modals/add-tenant')}
                activeOpacity={0.85}
                style={{ width: 144 }}
                className="rounded-xl bg-surface-container border border-brand-100 p-5 gap-3"
              >
                <View className="w-10 h-10 rounded-full bg-brand-500/15 items-center justify-center">
                  <UserPlus size={20} color="#3525cd" />
                </View>
                <View className="gap-0.5">
                  <Text className="text-on-surface text-base font-bold">Kiracı</Text>
                  <Text className="text-surface-muted text-xs">Davet et</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* ── AI Denetimi Banner ────────────────────────── */}
            <View className="rounded-xl bg-white border border-surface-container p-4 gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-9 h-9 rounded-xl bg-brand-500/10 items-center justify-center">
                    <Sparkles size={18} color="#3525cd" />
                  </View>
                  <View>
                    <Text className="text-on-surface font-bold text-sm">AI Denetimi</Text>
                    <Text className="text-surface-muted text-xs">Faz 2'de aktif olacak</Text>
                  </View>
                </View>
                <View
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: '#3525cd18' }}
                >
                  <Text style={{ color: '#3525cd', fontSize: 11, fontWeight: '700' }}>YAKINDA</Text>
                </View>
              </View>
              <Text className="text-surface-muted text-xs leading-relaxed">
                Sözleşmeleriniz henüz analiz edilmedi. AI denetimi ile hukuki risklerinizi anında tespit edin.
              </Text>
            </View>

            {/* ── Kira Durumu Widget ────────────────────────── */}
            <View className="rounded-xl bg-white border border-surface-container p-5">
              <Text className="text-on-surface font-bold text-sm mb-4">Doluluk Durumu</Text>
              <View className="flex-row items-center gap-5">
                <CircularProgress percentage={occupancy} size={80} strokeWidth={8} />
                <View className="flex-1 gap-3">
                  <View className="flex-row justify-between">
                    <View className="gap-0.5">
                      <Text className="text-surface-muted text-xs">Aylık Gelir</Text>
                      <Text className="text-on-surface font-bold text-sm">
                        {formatCurrency(stats?.monthly_income ?? 0)}
                      </Text>
                    </View>
                    <View className="gap-0.5 items-end">
                      <Text className="text-surface-muted text-xs">Mülk</Text>
                      <Text className="text-on-surface font-bold text-sm">
                        {stats?.total_properties ?? 0}
                      </Text>
                    </View>
                    <View className="gap-0.5 items-end">
                      <Text className="text-surface-muted text-xs">Sözleşme</Text>
                      <Text className="text-on-surface font-bold text-sm">
                        {stats?.active_contracts ?? 0}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* ── TÜFE Kartı ────────────────────────────────── */}
            <View
              className="rounded-xl border p-4 gap-2"
              style={{ backgroundColor: '#00533812', borderColor: '#00533830' }}
            >
              <View className="flex-row items-center justify-between">
                <View className="gap-0.5">
                  <Text className="text-surface-muted text-xs font-medium">Güncel TÜFE Oranı</Text>
                  <Text className="text-surface-muted text-xs">Mart 2026 · 12 aylık ortalama</Text>
                </View>
                <TrendingUp size={20} color="#005338" />
              </View>
              <Text style={{ fontSize: 44, fontWeight: '900', color: '#005338', lineHeight: 52 }}>
                %65,45
              </Text>
              <Text className="text-surface-muted text-xs">
                Kira artışlarınızda yasal tavan · TBK m.344
              </Text>
            </View>

            {/* ── Bento Stat Grid ───────────────────────────── */}
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

            {/* ── Yaklaşan Ödemeler ──────────────────────────── */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-on-surface font-bold text-base">Yaklaşan Ödemeler</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
                  <Text className="text-brand-500 text-sm font-medium">Tümünü Gör</Text>
                </TouchableOpacity>
              </View>
              <View className="rounded-xl bg-white border border-surface-container p-4">
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

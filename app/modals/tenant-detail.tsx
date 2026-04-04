import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  X, User, Phone, Mail, Shield, AlertTriangle, FileText, Calendar,
} from 'lucide-react-native';
import { tenantService } from '../../services/tenantService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Tenant } from '../../types';

function InfoRow({ icon: Icon, label, value }: {
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-2.5 border-b border-surface-container">
      <Icon size={14} color="#6b7280" />
      <Text className="text-sm text-surface-muted w-20">{label}</Text>
      <Text className="text-sm font-medium text-on-surface flex-1">{value}</Text>
    </View>
  );
}

export default function TenantDetailModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    tenantService
      .getById(id)
      .then(setTenant)
      .catch(err => {
        Alert.alert('Hata', err instanceof Error ? err.message : 'Kiracı yüklenemedi.');
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <LoadingSpinner message="Kiracı bilgileri yükleniyor..." />
      </SafeAreaView>
    );
  }

  if (!tenant) return null;

  const contract = tenant.active_contract;
  const hasActive = !!contract;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-surface-container">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="w-10 h-10 rounded-full bg-brand-500 items-center justify-center">
            <Text className="text-white text-lg font-bold">
              {tenant.full_name[0]?.toUpperCase() ?? 'K'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-on-surface" numberOfLines={1}>
              {tenant.full_name}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          <Badge
            label={hasActive ? 'Aktif' : 'Pasif'}
            variant={hasActive ? 'success' : 'neutral'}
          />
          <TouchableOpacity onPress={() => router.back()}>
            <X size={22} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-5 gap-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Kişisel Bilgiler */}
        <View className="rounded-xl bg-white border border-surface-container p-4">
          <Text className="text-sm font-bold text-on-surface mb-2">Kişisel Bilgiler</Text>
          {tenant.tc_no_masked && (
            <InfoRow icon={Shield} label="TC Kimlik" value={tenant.tc_no_masked} />
          )}
          {tenant.phone && (
            <InfoRow icon={Phone} label="Telefon" value={tenant.phone} />
          )}
          {tenant.email && (
            <InfoRow icon={Mail} label="E-posta" value={tenant.email} />
          )}
          {!tenant.phone && !tenant.email && !tenant.tc_no_masked && (
            <Text className="text-sm text-surface-muted py-2">
              Henüz iletişim bilgisi eklenmemiş.
            </Text>
          )}
        </View>

        {/* Acil Durum İletişimi */}
        {tenant.emergency_contact && (
          <View className="rounded-xl bg-white border border-surface-container p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <AlertTriangle size={14} color="#f59e0b" />
              <Text className="text-sm font-bold text-on-surface">Acil Durum İletişimi</Text>
            </View>
            <InfoRow icon={User} label="İsim" value={tenant.emergency_contact.name} />
            <InfoRow icon={Phone} label="Telefon" value={tenant.emergency_contact.phone} />
            <View className="flex-row items-center gap-3 py-2.5">
              <User size={14} color="#6b7280" />
              <Text className="text-sm text-surface-muted w-20">Yakınlık</Text>
              <Text className="text-sm font-medium text-on-surface flex-1">
                {tenant.emergency_contact.relation}
              </Text>
            </View>
          </View>
        )}

        {/* Aktif Sözleşme */}
        {contract ? (
          <View className="rounded-xl bg-white border border-surface-container p-4">
            <Text className="text-sm font-bold text-on-surface mb-2">Aktif Sözleşme</Text>
            <View className="flex-row items-center justify-between py-2.5 border-b border-surface-container">
              <Text className="text-sm text-surface-muted">Mülk</Text>
              <Text className="text-sm font-medium text-on-surface">
                {(contract.property as { title?: string } | undefined)?.title ?? '—'}
              </Text>
            </View>
            <View className="flex-row items-center justify-between py-2.5 border-b border-surface-container">
              <Text className="text-sm text-surface-muted">Aylık Kira</Text>
              <Text className="text-sm font-bold text-success">
                {formatCurrency(contract.monthly_rent)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between py-2.5 border-b border-surface-container">
              <Text className="text-sm text-surface-muted">Başlangıç</Text>
              <Text className="text-sm font-medium text-on-surface">
                {formatDate(contract.start_date)}
              </Text>
            </View>
            {contract.end_date && (
              <View className="flex-row items-center justify-between py-2.5 border-b border-surface-container">
                <Text className="text-sm text-surface-muted">Bitiş</Text>
                <Text className="text-sm font-medium text-on-surface">
                  {formatDate(contract.end_date)}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View className="rounded-xl bg-white border border-surface-container p-5 items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-surface-container items-center justify-center">
              <FileText size={24} color="#6b7280" />
            </View>
            <Text className="text-sm text-surface-muted text-center">
              Bu kiracı için aktif sözleşme bulunmuyor.
            </Text>
          </View>
        )}

        {/* Kayıt Tarihi */}
        <View className="flex-row items-center justify-center gap-1.5">
          <Calendar size={12} color="#6b7280" />
          <Text className="text-xs text-surface-muted">
            Kayıt: {formatDate(tenant.created_at, 'long')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

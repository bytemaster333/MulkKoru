import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  X, Home, MapPin, Ruler, Building, DoorOpen, FileText,
  ChevronRight, Car, ArrowUpDown, Fence, Sofa, Wifi, Flame, Heater,
} from 'lucide-react-native';
import { propertyService } from '../../services/propertyService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import {
  formatPropertyType, formatCurrency, formatDate,
  formatArea, formatPaymentDay, formatIncreaseBasis,
} from '../../utils/formatters';
import type { Property, Contract } from '../../types';

const FEATURE_LABELS: Record<string, { label: string; icon: typeof Car }> = {
  parking:       { label: 'Otopark',        icon: Car },
  elevator:      { label: 'Asansör',        icon: ArrowUpDown },
  balcony:       { label: 'Balkon',         icon: Fence },
  garden:        { label: 'Bahçe',          icon: Fence },
  furnished:     { label: 'Eşyalı',        icon: Sofa },
  internet:      { label: 'İnternet',       icon: Wifi },
  floor_heating: { label: 'Yerden Isıtma',  icon: Flame },
};

const HEATING_LABELS: Record<string, string> = {
  central: 'Merkezi Isıtma',
  kombi:   'Kombi',
  soba:    'Soba',
  none:    'Isıtma Yok',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2.5 border-b border-surface-container">
      <Text className="text-sm text-surface-muted">{label}</Text>
      <Text className="text-sm font-medium text-on-surface">{value}</Text>
    </View>
  );
}

export default function PropertyDetailModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    propertyService
      .getById(id)
      .then(setProperty)
      .catch(err => {
        Alert.alert('Hata', err instanceof Error ? err.message : 'Mülk yüklenemedi.');
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <LoadingSpinner message="Mülk bilgileri yükleniyor..." />
      </SafeAreaView>
    );
  }

  if (!property) return null;

  const contracts = (property as Property & { contracts?: Contract[] }).contracts ?? [];
  const activeContract = contracts.find(c => c.status === 'active') ?? property.active_contract;
  const hasContract = !!activeContract;
  const features = property.features ?? {};
  const activeFeatures = Object.entries(features).filter(
    ([key, val]) => key !== 'heating' && val === true,
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-surface-container">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="rounded-xl bg-brand-500/10 p-2">
            <Home size={18} color="#3525cd" />
          </View>
          <Text className="text-lg font-bold text-on-surface flex-1" numberOfLines={1}>
            {property.title}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Badge
            label={hasContract ? 'Kirada' : 'Boş'}
            variant={hasContract ? 'success' : 'neutral'}
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
        {/* Mülk Bilgileri */}
        <View className="rounded-xl bg-white border border-surface-container p-4">
          <Text className="text-sm font-bold text-on-surface mb-2">Mülk Bilgileri</Text>
          <InfoRow label="Mülk Tipi" value={formatPropertyType(property.property_type)} />
          <InfoRow
            label="Konum"
            value={`${property.city}${property.district ? ' / ' + property.district : ''}`}
          />
          <View className="flex-row items-start py-2.5 border-b border-surface-container gap-2">
            <Text className="text-sm text-surface-muted">Adres</Text>
            <Text className="text-sm font-medium text-on-surface text-right flex-1">
              {property.address}
            </Text>
          </View>
          {property.area_sqm != null && (
            <InfoRow label="Alan" value={formatArea(property.area_sqm)} />
          )}
          {property.floor != null && (
            <InfoRow label="Kat" value={`${property.floor}. Kat`} />
          )}
          {property.rooms && (
            <InfoRow label="Oda Sayısı" value={property.rooms} />
          )}
        </View>

        {/* Özellikler */}
        {(activeFeatures.length > 0 || features.heating) && (
          <View className="rounded-xl bg-white border border-surface-container p-4">
            <Text className="text-sm font-bold text-on-surface mb-3">Özellikler</Text>
            <View className="flex-row flex-wrap gap-2">
              {activeFeatures.map(([key]) => {
                const feat = FEATURE_LABELS[key];
                if (!feat) return null;
                const Icon = feat.icon;
                return (
                  <View
                    key={key}
                    className="flex-row items-center gap-1.5 rounded-xl bg-brand-500/10 px-3 py-1.5"
                  >
                    <Icon size={13} color="#3525cd" />
                    <Text className="text-xs font-medium text-brand-500">{feat.label}</Text>
                  </View>
                );
              })}
              {features.heating && features.heating !== 'none' && (
                <View className="flex-row items-center gap-1.5 rounded-xl bg-brand-500/10 px-3 py-1.5">
                  <Heater size={13} color="#3525cd" />
                  <Text className="text-xs font-medium text-brand-500">
                    {HEATING_LABELS[features.heating] ?? features.heating}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Aktif Sözleşme */}
        {activeContract ? (
          <View className="rounded-xl bg-white border border-surface-container p-4">
            <Text className="text-sm font-bold text-on-surface mb-2">Aktif Sözleşme</Text>
            {activeContract.tenant && (
              <InfoRow
                label="Kiracı"
                value={(activeContract.tenant as { full_name?: string }).full_name ?? '—'}
              />
            )}
            <InfoRow label="Aylık Kira" value={formatCurrency(activeContract.monthly_rent)} />
            <InfoRow label="Başlangıç" value={formatDate(activeContract.start_date)} />
            {activeContract.end_date && (
              <InfoRow label="Bitiş" value={formatDate(activeContract.end_date)} />
            )}
            <InfoRow label="Ödeme Günü" value={formatPaymentDay(activeContract.payment_day)} />
            <InfoRow label="Artış Bazı" value={formatIncreaseBasis(activeContract.increase_basis)} />
            {activeContract.deposit_amount != null && activeContract.deposit_amount > 0 && (
              <InfoRow label="Depozito" value={formatCurrency(activeContract.deposit_amount)} />
            )}
          </View>
        ) : (
          <View
            className="rounded-xl border p-5 items-center gap-4"
            style={{ backgroundColor: '#3525cd08', borderColor: '#3525cd30' }}
          >
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: '#3525cd15' }}
            >
              <FileText size={28} color="#3525cd" />
            </View>
            <View className="items-center gap-1">
              <Text className="text-base font-bold text-on-surface text-center">
                Bu mülk henüz kiralanmamış
              </Text>
              <Text className="text-sm text-surface-muted text-center leading-5">
                Kiracı atayarak aylık kira takibini ve ödeme takvimini otomatik başlatın.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/modals/add-contract')}
              className="flex-row items-center gap-2 rounded-xl px-5 py-3"
              style={{ backgroundColor: '#3525cd' }}
            >
              <FileText size={16} color="#ffffff" />
              <Text className="text-white text-sm font-bold">Sözleşme Başlat</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Kayıt Tarihi */}
        <Text className="text-xs text-surface-muted text-center">
          Kayıt: {formatDate(property.created_at, 'long')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

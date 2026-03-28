import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Home, MapPin, TrendingUp } from 'lucide-react-native';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatPropertyType, formatDate } from '../../utils/formatters';
import type { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
}

export function PropertyCard({ property, onPress }: PropertyCardProps) {
  const hasContract = !!property.active_contract;
  const rent        = property.active_contract?.monthly_rent ?? property.monthly_rent;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="rounded-2xl bg-surface-card border border-surface-border overflow-hidden"
    >
      {/* Üst bar — mülk tipi rengi */}
      <View className="h-1 bg-brand-500" />

      <View className="p-4 gap-3">
        {/* Başlık satırı */}
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-row items-center gap-2 flex-1">
            <View className="rounded-xl bg-brand/20 p-2">
              <Home size={18} color="#3525cd" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-dark-text" numberOfLines={1}>
                {property.title}
              </Text>
              <Text className="text-xs text-surface-muted">{formatPropertyType(property.property_type)}</Text>
            </View>
          </View>
          <Badge
            label={hasContract ? 'Kirada' : 'Boş'}
            variant={hasContract ? 'success' : 'neutral'}
          />
        </View>

        {/* Adres */}
        <View className="flex-row items-center gap-1.5">
          <MapPin size={13} color="#6b7280" />
          <Text className="text-xs text-surface-muted flex-1" numberOfLines={1}>
            {property.district ? `${property.district}, ` : ''}{property.city}
          </Text>
        </View>

        {/* Bilgi satırı */}
        <View className="flex-row items-center gap-4 pt-1 border-t border-surface-border">
          {property.rooms && (
            <Text className="text-xs text-surface-muted">{property.rooms}</Text>
          )}
          {property.area_sqm && (
            <Text className="text-xs text-surface-muted">{property.area_sqm} m²</Text>
          )}
          {rent ? (
            <View className="flex-row items-center gap-1 ml-auto">
              <TrendingUp size={13} color="#10b981" />
              <Text className="text-sm font-bold text-success">{formatCurrency(rent)}</Text>
            </View>
          ) : null}
        </View>

        {/* Kiracı bilgisi */}
        {property.active_contract?.tenant && (
          <Text className="text-xs text-surface-muted">
            Kiracı: {(property.active_contract.tenant as { full_name?: string }).full_name}
            {property.active_contract.end_date
              ? ` · Bitiş: ${formatDate(property.active_contract.end_date)}`
              : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

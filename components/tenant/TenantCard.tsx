import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { User, Phone, Mail, Shield } from 'lucide-react-native';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Tenant } from '../../types';

interface TenantCardProps {
  tenant: Tenant;
  onPress: () => void;
}

export function TenantCard({ tenant, onPress }: TenantCardProps) {
  const contract  = tenant.active_contract;
  const hasActive = !!contract;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="rounded-2xl bg-surface-card border border-surface-border p-4 gap-3"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          {/* Avatar placeholder */}
          <View className="w-10 h-10 rounded-full bg-brand/20 items-center justify-center">
            <User size={20} color="#3525cd" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-dark-text" numberOfLines={1}>
              {tenant.full_name}
            </Text>
            {tenant.tc_no_masked && (
              <View className="flex-row items-center gap-1">
                <Shield size={11} color="#6b7280" />
                <Text className="text-xs text-surface-muted">{tenant.tc_no_masked}</Text>
              </View>
            )}
          </View>
        </View>
        <Badge
          label={hasActive ? 'Aktif' : 'Pasif'}
          variant={hasActive ? 'success' : 'neutral'}
        />
      </View>

      {/* İletişim */}
      <View className="gap-1.5">
        {tenant.phone && (
          <View className="flex-row items-center gap-2">
            <Phone size={13} color="#6b7280" />
            <Text className="text-xs text-surface-muted">{tenant.phone}</Text>
          </View>
        )}
        {tenant.email && (
          <View className="flex-row items-center gap-2">
            <Mail size={13} color="#6b7280" />
            <Text className="text-xs text-surface-muted">{tenant.email}</Text>
          </View>
        )}
      </View>

      {/* Sözleşme özeti */}
      {contract && (
        <View className="pt-2 border-t border-surface-border flex-row items-center justify-between">
          <Text className="text-xs text-surface-muted">
            {(contract.property as { title?: string } | undefined)?.title ?? 'Mülk'}
          </Text>
          <Text className="text-sm font-bold text-success">
            {formatCurrency(contract.monthly_rent)}/ay
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Search, Users } from 'lucide-react-native';
import { TenantCard } from '../../components/tenant/TenantCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useTenants } from '../../hooks/useTenants';
import type { Tenant } from '../../types';

export default function TenantsScreen() {
  const router                    = useRouter();
  const { tenants, loading, refetch } = useTenants();
  const [query, setQuery]         = useState('');

  const filtered = tenants.filter(t =>
    t.full_name.toLowerCase().includes(query.toLowerCase()) ||
    (t.phone?.includes(query) ?? false) ||
    (t.email?.toLowerCase().includes(query.toLowerCase()) ?? false),
  );

  const activeCount = tenants.filter(t => t.active_contract).length;

  return (
    <SafeAreaView className="flex-1 bg-surface-dark">
      {/* ── Header ─────────────────────────────────── */}
      <View className="px-5 pt-4 pb-3 gap-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-dark-text">Kiracılarım</Text>
            <Text className="text-sm text-surface-muted">
              {tenants.length} kayıtlı · {activeCount} aktif
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/modals/add-tenant')}
            className="flex-row items-center gap-1.5 bg-brand-500 rounded-xl px-4 py-2.5"
          >
            <Plus size={18} color="#ffffff" />
            <Text className="text-white text-sm font-semibold">Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Arama */}
        <View className="flex-row items-center gap-2 rounded-xl bg-surface-card border border-surface-border px-3 py-2.5">
          <Search size={16} color="#6b7280" />
          <TextInput
            className="flex-1 text-dark-text text-sm"
            placeholder="Ad, telefon veya e-posta ara..."
            placeholderTextColor="#6b7280"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {/* ── Liste ──────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner message="Kiracılar yükleniyor..." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerClassName="px-5 pb-6 gap-3"
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
            query ? (
              <View className="items-center py-16">
                <Text className="text-surface-muted text-sm">Arama sonucu bulunamadı.</Text>
              </View>
            ) : (
              <EmptyState
                icon={<Users size={40} color="#6b7280" />}
                title="Henüz kiracı eklemediniz"
                description="Kiracı bilgilerini kaydederek sözleşme oluşturabilirsiniz."
                actionLabel="Kiracı Ekle"
                onAction={() => router.push('/modals/add-tenant')}
              />
            )
          }
          renderItem={({ item }: { item: Tenant }) => (
            <TenantCard
              tenant={item}
              onPress={() => router.push(`/modals/tenant-detail?id=${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Search, Building2 } from 'lucide-react-native';
import { PropertyCard } from '../../components/property/PropertyCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useProperties } from '../../hooks/useProperties';
import type { Property } from '../../types';

export default function PropertiesScreen() {
  const router                    = useRouter();
  const { properties, loading, refetch } = useProperties();
  const [query, setQuery]         = useState('');

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const filtered = properties.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.city.toLowerCase().includes(query.toLowerCase()) ||
    (p.district?.toLowerCase().includes(query.toLowerCase()) ?? false),
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* ── Header ─────────────────────────────────── */}
      <View className="px-5 pt-4 pb-3 gap-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-on-surface">Mülklerim</Text>
            <Text className="text-sm text-surface-muted">
              {properties.length} mülk kayıtlı
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/modals/add-property')}
            className="flex-row items-center gap-1.5 bg-brand-500 rounded-xl px-4 py-2.5"
          >
            <Plus size={18} color="#ffffff" />
            <Text className="text-white text-sm font-semibold">Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Arama */}
        <View className="flex-row items-center gap-2 rounded-xl bg-white border border-surface-container px-3 py-2.5">
          <Search size={16} color="#6b7280" />
          <TextInput
            className="flex-1 text-on-surface text-sm"
            placeholder="Mülk adı veya şehir ara..."
            placeholderTextColor="#6b7280"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {/* ── Liste ──────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner message="Mülkler yükleniyor..." />
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
                icon={<Building2 size={40} color="#6b7280" />}
                title="Henüz mülk eklemediniz"
                description="İlk mülkünüzü ekleyerek kira yönetimine başlayın."
                actionLabel="Mülk Ekle"
                onAction={() => router.push('/modals/add-property')}
              />
            )
          }
          renderItem={({ item }: { item: Property }) => (
            <PropertyCard
              property={item}
              onPress={() => router.push(`/modals/property-detail?id=${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

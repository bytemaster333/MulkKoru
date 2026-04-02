import React, { useState } from 'react';
import {
  View, Text, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Diğer'];
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Home } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { propertyService } from '../../services/propertyService';
import { validatePositiveAmount, validateRoomFormat } from '../../utils/validators';
import type { PropertyType, PropertyFormData } from '../../types';

const PROPERTY_TYPES: Array<{ value: PropertyType; label: string }> = [
  { value: 'apartment',  label: 'Daire' },
  { value: 'house',      label: 'Müstakil Ev' },
  { value: 'commercial', label: 'Ticari' },
  { value: 'land',       label: 'Arsa' },
];

const INITIAL: PropertyFormData = {
  title: '', address: '', city: '', district: '',
  property_type: 'apartment', area_sqm: '', floor: '', rooms: '', features: {},
};

export default function AddPropertyModal() {
  const router          = useRouter();
  const [form, setForm] = useState<PropertyFormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Partial<Record<keyof PropertyFormData, string>>>({});

  function update<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.title.trim())   errs.title   = 'Mülk adı zorunludur.';
    if (!form.address.trim()) errs.address = 'Adres zorunludur.';
    if (!form.city.trim())    errs.city    = 'Şehir zorunludur.';
    if (form.rooms && !validateRoomFormat(form.rooms)) errs.rooms = 'Format: 3+1, 2+0 gibi girin.';
    if (form.area_sqm && !validatePositiveAmount(form.area_sqm)) errs.area_sqm = 'Geçerli bir alan girin.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    try {
      setLoading(true);
      await propertyService.create(form);
      router.back();
    } catch (e: unknown) {
      Alert.alert('Hata', e instanceof Error ? e.message : 'Mülk eklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-surface-container">
          <View className="flex-row items-center gap-2">
            <View className="rounded-xl bg-brand-500/10 p-2">
              <Home size={18} color="#3525cd" />
            </View>
            <Text className="text-lg font-bold text-on-surface">Yeni Mülk Ekle</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={22} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 py-5 gap-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mülk Tipi */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-surface-muted">Mülk Tipi</Text>
            <View className="flex-row flex-wrap gap-2">
              {PROPERTY_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => update('property_type', type.value)}
                  className={`rounded-xl px-4 py-2 border ${
                    form.property_type === type.value
                      ? 'bg-brand-500 border-brand-500'
                      : 'bg-white border-surface-container'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    form.property_type === type.value ? 'text-white' : 'text-on-surface'
                  }`}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label="Mülk Adı / Başlığı *"
            placeholder="ör. Kadıköy 3+1 Daire"
            value={form.title}
            onChangeText={v => update('title', v)}
            error={errors.title}
          />
          <Input
            label="Tam Adres *"
            placeholder="Mahalle, cadde/sokak, bina no"
            value={form.address}
            onChangeText={v => update('address', v)}
            error={errors.address}
            multiline
            numberOfLines={2}
          />
          {/* Şehir Seçimi */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-surface-muted">Şehir *</Text>
            <View className="flex-row flex-wrap gap-2">
              {CITIES.map(city => (
                <TouchableOpacity
                  key={city}
                  onPress={() => update('city', city)}
                  className={`rounded-xl px-4 py-2 border ${
                    form.city === city
                      ? 'bg-brand-500 border-brand-500'
                      : 'bg-white border-surface-container'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    form.city === city ? 'text-white' : 'text-on-surface'
                  }`}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.city && <Text className="text-xs text-error">{errors.city}</Text>}
          </View>
          <Input
            label="İlçe"
            placeholder="Kadıköy"
            value={form.district}
            onChangeText={v => update('district', v)}
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Alan (m²)"
                placeholder="120"
                keyboardType="numeric"
                value={form.area_sqm}
                onChangeText={v => update('area_sqm', v)}
                error={errors.area_sqm}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Kat"
                placeholder="3"
                keyboardType="numeric"
                value={form.floor}
                onChangeText={v => update('floor', v)}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Oda Sayısı"
                placeholder="3+1"
                value={form.rooms}
                onChangeText={v => update('rooms', v)}
                error={errors.rooms}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="px-5 py-4 border-t border-surface-container">
          <Button
            title="Mülkü Kaydet"
            onPress={handleSubmit}
            loading={loading}
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

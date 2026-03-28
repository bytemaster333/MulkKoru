import React, { useState } from 'react';
import {
  View, Text, ScrollView, Alert, TouchableOpacity,
  KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, User, Phone, Mail, Shield, Info } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { tenantService } from '../../services/tenantService';
import {
  validateTCKimlikNo, validatePhoneNumber, validateEmail,
} from '../../utils/validators';
import type { TenantFormData } from '../../types';

const INITIAL: TenantFormData = {
  full_name: '', tc_no: '', phone: '', email: '',
  emergency_name: '', emergency_phone: '', emergency_relation: '',
};

export default function AddTenantModal() {
  const router              = useRouter();
  const [form, setForm]     = useState<TenantFormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Partial<Record<keyof TenantFormData, string>>>({});
  const [showEmergency, setShowEmergency] = useState(false);

  function update<K extends keyof TenantFormData>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.full_name.trim())   errs.full_name = 'Ad Soyad zorunludur.';
    if (form.tc_no && !validateTCKimlikNo(form.tc_no)) {
      errs.tc_no = 'TC Kimlik No geçersiz. 11 haneli ve algoritmaya uygun olmalıdır.';
    }
    if (form.phone && !validatePhoneNumber(form.phone)) {
      errs.phone = 'Geçerli bir Türkiye telefon numarası girin. (05XX XXX XX XX)';
    }
    if (form.email && !validateEmail(form.email)) {
      errs.email = 'Geçerli bir e-posta adresi girin.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    try {
      setLoading(true);
      await tenantService.create(form);
      router.back();
    } catch (e: unknown) {
      Alert.alert('Hata', e instanceof Error ? e.message : 'Kiracı eklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-dark">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-surface-border">
          <View className="flex-row items-center gap-2">
            <View className="rounded-xl bg-brand/20 p-2">
              <User size={18} color="#3525cd" />
            </View>
            <Text className="text-lg font-bold text-dark-text">Yeni Kiracı Ekle</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={22} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 py-5 gap-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* KVKK Uyarısı */}
          <View className="flex-row items-start gap-2 rounded-xl bg-brand/10 p-3 border border-brand/20">
            <Info size={16} color="#3525cd" className="mt-0.5" />
            <Text className="text-xs text-brand-200 flex-1 leading-4">
              Kişisel veriler KVKK kapsamında korunmaktadır. TC Kimlik No yalnızca maskelenmiş
              hâliyle saklanır; ham veri cihazınızda tutulmaz.
            </Text>
          </View>

          <Input
            label="Ad Soyad *"
            placeholder="Ahmet Yılmaz"
            autoCapitalize="words"
            value={form.full_name}
            onChangeText={v => update('full_name', v)}
            error={errors.full_name}
            leftIcon={<User size={18} color="#6b7280" />}
          />
          <Input
            label="TC Kimlik No"
            placeholder="12345678901"
            keyboardType="numeric"
            maxLength={11}
            value={form.tc_no}
            onChangeText={v => update('tc_no', v)}
            error={errors.tc_no}
            hint="Opsiyonel — sözleşme ve hukuki süreçler için gereklidir."
            leftIcon={<Shield size={18} color="#6b7280" />}
          />
          <Input
            label="Telefon"
            placeholder="0532 123 45 67"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={v => update('phone', v)}
            error={errors.phone}
            leftIcon={<Phone size={18} color="#6b7280" />}
          />
          <Input
            label="E-posta"
            placeholder="ahmet@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={v => update('email', v)}
            error={errors.email}
            leftIcon={<Mail size={18} color="#6b7280" />}
          />

          {/* Acil İletişim */}
          <View className="flex-row items-center justify-between rounded-xl bg-surface-card border border-surface-border p-4">
            <View>
              <Text className="text-sm font-medium text-dark-text">Acil İletişim Kişisi</Text>
              <Text className="text-xs text-surface-muted">Opsiyonel</Text>
            </View>
            <Switch
              value={showEmergency}
              onValueChange={setShowEmergency}
              trackColor={{ false: '#2d2d5e', true: '#3525cd' }}
              thumbColor="#ffffff"
            />
          </View>

          {showEmergency && (
            <>
              <Input
                label="Acil Kişi Adı"
                placeholder="Fatma Yılmaz"
                autoCapitalize="words"
                value={form.emergency_name}
                onChangeText={v => update('emergency_name', v)}
              />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Telefon"
                    placeholder="0532 000 00 00"
                    keyboardType="phone-pad"
                    value={form.emergency_phone}
                    onChangeText={v => update('emergency_phone', v)}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Yakınlık"
                    placeholder="Eş, anne, vb."
                    value={form.emergency_relation}
                    onChangeText={v => update('emergency_relation', v)}
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Footer */}
        <View className="px-5 py-4 border-t border-surface-border">
          <Button
            title="Kiracıyı Kaydet"
            onPress={handleSubmit}
            loading={loading}
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

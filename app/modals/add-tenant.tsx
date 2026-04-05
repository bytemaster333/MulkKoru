import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, Alert, TouchableOpacity,
  KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  X, User, Phone, Mail, Shield, Info, Home, AlertCircle,
} from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PickerField } from '../../components/ui/PickerField';
import { DatePickerField } from '../../components/ui/DatePickerField';
import { tenantService } from '../../services/tenantService';
import { contractService } from '../../services/contractService';
import { useProperties } from '../../hooks/useProperties';
import {
  validateTCKimlikNo, validatePhoneNumber, validateEmail, validatePositiveAmount,
} from '../../utils/validators';
import type { TenantFormData, Property } from '../../types';

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const INITIAL: TenantFormData = {
  full_name: '', tc_no: '', phone: '', email: '',
  emergency_name: '', emergency_phone: '', emergency_relation: '',
};

export default function AddTenantModal() {
  const router = useRouter();
  const { properties, loading: propertiesLoading } = useProperties();

  const [form, setForm]     = useState<TenantFormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Partial<Record<keyof TenantFormData, string>>>({});
  const [rentError, setRentError] = useState<string | undefined>();
  const [showEmergency, setShowEmergency] = useState(false);

  // Bağlanacak mülk (opsiyonel)
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [monthlyRent, setMonthlyRent]               = useState('');
  const [startDate, setStartDate]                   = useState(todayISO());

  // Sadece 'Boş' mülkler
  const emptyProperties = useMemo(
    () => properties.filter(p => !p.active_contract),
    [properties],
  );

  const propertyItems = useMemo(() => emptyProperties.map(p => ({
    id:       p.id,
    label:    p.title,
    subtitle: `${p.city}${p.district ? ' / ' + p.district : ''}`,
  })), [emptyProperties]);

  const selectedProperty: Property | undefined = useMemo(
    () => emptyProperties.find(p => p.id === selectedPropertyId),
    [emptyProperties, selectedPropertyId],
  );

  function handlePropertySelect(id: string) {
    setSelectedPropertyId(id);
    const prop = emptyProperties.find(p => p.id === id);
    if (prop?.monthly_rent) {
      setMonthlyRent(String(prop.monthly_rent));
    }
    setRentError(undefined);
  }

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

    let rentErr: string | undefined;
    if (selectedPropertyId && !validatePositiveAmount(monthlyRent)) {
      rentErr = 'Mülk seçildiyse geçerli bir kira tutarı zorunludur.';
    }

    setErrors(errs);
    setRentError(rentErr);
    return Object.keys(errs).length === 0 && !rentErr;
  }

  async function handleSubmit() {
    if (!validate()) return;
    try {
      setLoading(true);
      const tenant = await tenantService.create(form);

      if (selectedPropertyId && monthlyRent && startDate) {
        await contractService.create({
          property_id:              selectedPropertyId,
          tenant_id:                tenant.id,
          start_date:               startDate,
          end_date:                 '',
          monthly_rent:             monthlyRent,
          deposit_amount:           '',
          payment_day:              '1',
          increase_basis:           'TUFE',
          increase_rate:            '',
          eviction_undertaking:     false,
          eviction_undertaking_date: '',
          notes:                    '',
        });
      }
      router.back();
    } catch (e: unknown) {
      Alert.alert('Hata', e instanceof Error ? e.message : 'Kiracı eklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  const hasProperty = !!selectedPropertyId;

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
              <User size={18} color="#3525cd" />
            </View>
            <Text className="text-lg font-bold text-on-surface">Yeni Kiracı Ekle</Text>
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
          {/* ── Bağlanacak Mülk ──────────────────────── */}
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <Home size={16} color="#3525cd" />
              <Text className="text-sm font-bold text-on-surface">Hangi Mülk İçin?</Text>
              <Text className="text-xs text-surface-muted">(Opsiyonel)</Text>
            </View>

            {!propertiesLoading && emptyProperties.length === 0 ? (
              <View className="flex-row items-start gap-2 rounded-xl border p-3"
                style={{ backgroundColor: '#f59e0b12', borderColor: '#f59e0b30' }}>
                <AlertCircle size={15} color="#f59e0b" />
                <Text className="text-xs text-on-surface flex-1 leading-4">
                  Şu an boşta mülkünüz bulunmuyor. Kiracıyı mülksüz ekleyebilir, daha sonra sözleşme oluşturabilirsiniz.
                </Text>
              </View>
            ) : (
              <PickerField
                label="Bağlanacak Mülk"
                placeholder="Seçmek için dokunun (opsiyonel)"
                items={propertyItems}
                selectedId={selectedPropertyId}
                onSelect={handlePropertySelect}
                emptyMessage="Boşta mülk bulunamadı"
              />
            )}

            {/* Seçili mülk için kira + tarih */}
            {hasProperty && (
              <View className="rounded-xl border border-brand-100 p-4 gap-3"
                style={{ backgroundColor: '#3525cd08' }}>
                <View className="flex-row items-center gap-1.5">
                  <View className="w-2 h-2 rounded-full bg-brand-500" />
                  <Text className="text-xs font-semibold text-brand-500">
                    {selectedProperty?.title} için sözleşme oluşturulacak
                  </Text>
                </View>
                <Input
                  label="Aylık Kira (₺) *"
                  placeholder="15.000"
                  keyboardType="numeric"
                  value={monthlyRent}
                  onChangeText={v => { setMonthlyRent(v); setRentError(undefined); }}
                  error={rentError}
                />
                <DatePickerField
                  label="Sözleşme Başlangıç Tarihi"
                  value={startDate}
                  onChange={setStartDate}
                />
              </View>
            )}
          </View>

          {/* Ayraç */}
          <View className="flex-row items-center gap-3">
            <View className="flex-1 h-px bg-surface-container" />
            <Text className="text-xs text-surface-muted">Kiracı Bilgileri</Text>
            <View className="flex-1 h-px bg-surface-container" />
          </View>

          {/* KVKK Uyarısı */}
          <View className="flex-row items-start gap-2 rounded-xl bg-surface-container p-3 border border-brand-100">
            <Info size={16} color="#3525cd" />
            <Text className="text-xs text-on-surface flex-1 leading-4">
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
          <View className="flex-row items-center justify-between rounded-xl bg-white border border-surface-container p-4">
            <View>
              <Text className="text-sm font-medium text-on-surface">Acil İletişim Kişisi</Text>
              <Text className="text-xs text-surface-muted">Opsiyonel</Text>
            </View>
            <Switch
              value={showEmergency}
              onValueChange={setShowEmergency}
              trackColor={{ false: '#eaedff', true: '#3525cd' }}
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
        <View className="px-5 py-4 border-t border-surface-container gap-2">
          {hasProperty && (
            <Text className="text-xs text-surface-muted text-center">
              Kaydedilince kiracı + sözleşme birlikte oluşturulur
            </Text>
          )}
          <Button
            title={hasProperty ? 'Kiracıyı Kaydet ve Sözleşme Oluştur' : 'Kiracıyı Kaydet'}
            onPress={handleSubmit}
            loading={loading}
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

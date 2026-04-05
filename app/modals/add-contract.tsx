import React, { useState } from 'react';
import {
  View, Text, ScrollView, Alert, TouchableOpacity,
  KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, FileText, AlertTriangle, Info } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { DatePickerField } from '../../components/ui/DatePickerField';
import { PickerField } from '../../components/ui/PickerField';
import type { PickerItem } from '../../components/ui/PickerField';
import { contractService } from '../../services/contractService';
import { useProperties } from '../../hooks/useProperties';
import { useTenants } from '../../hooks/useTenants';
import { validatePositiveAmount, validateEvictionUndertakingDate } from '../../utils/validators';
import { validateDepositAmount } from '../../utils/tufeCalculator';
import { LEGAL } from '../../constants/legal';
import type { ContractFormData, IncreaseBasis } from '../../types';

// ── Artış seçeneği ─────────────────────────────────────────────────────────
const INCREASE_OPTIONS: Array<{ value: IncreaseBasis; label: string }> = [
  { value: 'TUFE',   label: 'TÜFE (Yasal)' },
  { value: 'FIXED',  label: 'Sabit Oran' },
  { value: 'AGREED', label: 'Anlaşmalı' },
];

const INITIAL: ContractFormData = {
  property_id: '', tenant_id: '', start_date: '', end_date: '',
  monthly_rent: '', deposit_amount: '', payment_day: '1',
  increase_basis: 'TUFE', increase_rate: '',
  eviction_undertaking: false, eviction_undertaking_date: '', notes: '',
};

// ── Ana ekran ──────────────────────────────────────────────────────────────
export default function AddContractModal() {
  const router              = useRouter();
  const { property_id: initPropId, tenant_id: initTenantId } = useLocalSearchParams<{
    property_id?: string;
    tenant_id?: string;
  }>();
  const { properties }      = useProperties();
  const { tenants }         = useTenants();
  const [form, setForm]     = useState<ContractFormData>({
    ...INITIAL,
    property_id: initPropId ?? '',
    tenant_id:   initTenantId ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Partial<Record<keyof ContractFormData, string>>>({});
  const [depositWarning, setDepositWarning] = useState<string | null>(null);

  // Picker için item listelerini hazırla
  const propertyItems: PickerItem[] = properties.map(p => ({
    id:       p.id,
    label:    p.title,
    subtitle: `${p.city}${p.district ? ' · ' + p.district : ''} · ${p.rooms ?? ''}`,
  }));

  const tenantItems: PickerItem[] = tenants.map(t => ({
    id:       t.id,
    label:    t.full_name,
    subtitle: t.phone ?? t.email ?? undefined,
  }));

  function update<K extends keyof ContractFormData>(key: K, value: ContractFormData[K]) {
    setForm(f => {
      const next = { ...f, [key]: value };
      if ((key === 'deposit_amount' || key === 'monthly_rent') && next.deposit_amount && next.monthly_rent) {
        const check = validateDepositAmount(
          parseFloat(next.deposit_amount as string),
          parseFloat(next.monthly_rent as string),
        );
        setDepositWarning(
          check.compliant ? null :
          `Depozito TBK m.342 uyarınca en fazla 3 aylık kira (${check.maxAllowed.toLocaleString('tr-TR')} ₺) olabilir.`,
        );
      }
      return next;
    });
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.property_id)                          errs.property_id = 'Mülk seçiniz.';
    if (!form.tenant_id)                            errs.tenant_id   = 'Kiracı seçiniz.';
    if (!form.start_date)                           errs.start_date  = 'Başlangıç tarihi zorunludur.';
    if (!validatePositiveAmount(form.monthly_rent)) errs.monthly_rent = 'Geçerli kira tutarı girin.';
    const day = parseInt(form.payment_day, 10);
    if (!form.payment_day || isNaN(day) || day < 1 || day > 28) {
      errs.payment_day = 'Ödeme günü 1 ile 28 arasında olmalıdır.';
    }
    if (form.eviction_undertaking && form.eviction_undertaking_date) {
      const { valid, error } = validateEvictionUndertakingDate(form.start_date, form.eviction_undertaking_date);
      if (!valid) errs.eviction_undertaking_date = error;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    try {
      setLoading(true);
      await contractService.create(form);
      router.back();
    } catch (e: unknown) {
      Alert.alert('Hata', e instanceof Error ? e.message : 'Sözleşme oluşturulamadı.');
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
            <View className="rounded-xl bg-tertiary/10 p-2">
              <FileText size={18} color="#005338" />
            </View>
            <Text className="text-lg font-bold text-on-surface">Yeni Sözleşme</Text>
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
          {/* ── Mülk Seçimi ───────────────────────── */}
          <PickerField
            label="Mülk *"
            placeholder="Mülk seçiniz..."
            items={propertyItems}
            selectedId={form.property_id}
            onSelect={id => update('property_id', id)}
            error={errors.property_id}
          />

          {/* ── Kiracı Seçimi ─────────────────────── */}
          <PickerField
            label="Kiracı *"
            placeholder="Kiracı seçiniz..."
            items={tenantItems}
            selectedId={form.tenant_id}
            onSelect={id => update('tenant_id', id)}
            error={errors.tenant_id}
          />

          {/* ── Tarihler ──────────────────────────── */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <DatePickerField
                label="Başlangıç Tarihi *"
                value={form.start_date}
                onChange={v => update('start_date', v)}
                error={errors.start_date}
              />
            </View>
            <View className="flex-1">
              <DatePickerField
                label="Bitiş Tarihi"
                value={form.end_date}
                onChange={v => update('end_date', v)}
                hint="Boş = açık süreli"
              />
            </View>
          </View>

          {/* ── Kira & Depozito ───────────────────── */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Aylık Kira (₺) *"
                placeholder="15.000"
                keyboardType="numeric"
                value={form.monthly_rent}
                onChangeText={v => update('monthly_rent', v)}
                error={errors.monthly_rent}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Depozito (₺)"
                placeholder="45.000"
                keyboardType="numeric"
                value={form.deposit_amount}
                onChangeText={v => update('deposit_amount', v)}
                hint={`Maks: ${LEGAL.MAX_DEPOSIT_MONTHS} aylık kira`}
              />
            </View>
          </View>

          {depositWarning && (
            <View className="flex-row items-start gap-2 rounded-xl bg-warning/10 p-3 border border-warning/20">
              <AlertTriangle size={14} color="#f59e0b" />
              <Text className="text-xs text-on-surface flex-1 leading-4">{depositWarning}</Text>
            </View>
          )}

          {/* ── Ödeme Günü ────────────────────────── */}
          <View style={{ width: '48%' }}>
            <Input
              label="Ödeme Günü"
              placeholder="1"
              keyboardType="numeric"
              maxLength={2}
              value={form.payment_day}
              onChangeText={v => update('payment_day', v)}
              hint="Her ayın kaçında? (1-28)"
              error={errors.payment_day}
            />
          </View>

          {/* ── Artış Bazı ────────────────────────── */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-surface-muted">Kira Artış Bazı</Text>
            <View className="flex-row gap-2">
              {INCREASE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => update('increase_basis', opt.value)}
                  className={`flex-1 rounded-xl py-2.5 items-center border ${
                    form.increase_basis === opt.value
                      ? 'bg-brand-500 border-brand-500'
                      : 'bg-white border-surface-container'
                  }`}
                >
                  <Text className={`text-xs font-medium ${
                    form.increase_basis === opt.value ? 'text-white' : 'text-on-surface'
                  }`}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row items-start gap-2 rounded-xl bg-surface-container p-3">
              <Info size={13} color="#3525cd" />
              <Text className="text-xs text-on-surface flex-1 leading-4">
                TBK m.344: Konut kiralarında artış oranı TÜFE 12 aylık ortalamasını geçemez.
              </Text>
            </View>
          </View>

          {/* ── Tahliye Taahhütnamesi ─────────────── */}
          <View className="rounded-xl bg-white border border-surface-container p-4 gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-medium text-on-surface">Tahliye Taahhütnamesi</Text>
                <Text className="text-xs text-surface-muted">TBK m.352 — Sözleşme sonrası imzalanmalıdır</Text>
              </View>
              <Switch
                value={form.eviction_undertaking}
                onValueChange={v => update('eviction_undertaking', v as unknown as string)}
                trackColor={{ false: '#eaedff', true: '#3525cd' }}
                thumbColor="#ffffff"
              />
            </View>
            {form.eviction_undertaking && (
              <DatePickerField
                label="Taahhütname İmza Tarihi"
                value={form.eviction_undertaking_date}
                onChange={v => update('eviction_undertaking_date', v)}
                error={errors.eviction_undertaking_date}
                hint="Kira başlangıcından sonra olmalıdır."
              />
            )}
          </View>

          {/* ── Notlar ────────────────────────────── */}
          <Input
            label="Notlar"
            placeholder="Eklemek istediğiniz özel şartlar..."
            value={form.notes}
            onChangeText={v => update('notes', v)}
            multiline
            numberOfLines={3}
          />
        </ScrollView>

        {/* Footer */}
        <View className="px-5 py-4 border-t border-surface-container">
          <Button
            title="Sözleşmeyi Oluştur"
            onPress={handleSubmit}
            loading={loading}
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

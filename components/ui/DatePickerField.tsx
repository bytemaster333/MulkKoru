import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Platform, Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

interface DatePickerFieldProps {
  label: string;
  value: string; // ISO date 'YYYY-MM-DD'
  onChange: (date: string) => void;
  error?: string;
  hint?: string;
}

function toDate(iso: string): Date {
  if (!iso) return new Date();
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export function DatePickerField({ label, value, onChange, error, hint }: DatePickerFieldProps) {
  const [show, setShow] = useState(false);
  const hasValue = !!value;

  function handleChange(_event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShow(false);
    if (selected) onChange(toISO(selected));
  }

  const trigger = (
    <TouchableOpacity
      onPress={() => setShow(true)}
      className="flex-row items-center justify-between rounded-xl bg-white border px-4 py-3"
      style={{ borderColor: error ? '#ba1a1a' : '#eaedff' }}
    >
      <Text
        className={hasValue ? 'text-on-surface text-sm' : 'text-surface-muted text-sm'}
      >
        {hasValue ? formatDisplay(value) : 'Tarih seçin'}
      </Text>
      <Calendar size={16} color="#6b7280" />
    </TouchableOpacity>
  );

  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-on-surface">{label}</Text>
      {trigger}
      {hint && !error && <Text className="text-xs text-surface-muted">{hint}</Text>}
      {error && <Text className="text-xs text-error">{error}</Text>}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={show}
          transparent
          animationType="slide"
          onRequestClose={() => setShow(false)}
        >
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}
            activeOpacity={1}
            onPress={() => setShow(false)}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={{
                backgroundColor: '#ffffff',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: 24,
              }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  paddingHorizontal: 20,
                  paddingTop: 16,
                  paddingBottom: 4,
                }}>
                  <TouchableOpacity onPress={() => setShow(false)}>
                    <Text style={{ color: '#3525cd', fontWeight: '700', fontSize: 16 }}>Tamam</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={toDate(value)}
                  mode="date"
                  display="spinner"
                  onChange={handleChange}
                  locale="tr-TR"
                  style={{ backgroundColor: '#ffffff' }}
                />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            value={toDate(value)}
            mode="date"
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { X, ChevronDown, Check } from 'lucide-react-native';

export interface PickerItem {
  id: string;
  label: string;
  subtitle?: string;
}

interface PickerFieldProps {
  label: string;
  placeholder: string;
  items: PickerItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  error?: string;
  emptyMessage?: string;
}

export function PickerField({
  label, placeholder, items, selectedId, onSelect, error,
  emptyMessage = 'Henüz kayıt bulunmuyor',
}: PickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = items.find(i => i.id === selectedId);

  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-on-surface">{label}</Text>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-xl bg-white border px-4 py-3"
        style={{ borderColor: error ? '#ba1a1a' : '#eaedff' }}
      >
        <View className="flex-1">
          {selected ? (
            <>
              <Text className="text-on-surface text-sm font-medium">{selected.label}</Text>
              {selected.subtitle && (
                <Text className="text-xs text-surface-muted">{selected.subtitle}</Text>
              )}
            </>
          ) : (
            <Text className="text-surface-muted text-sm">{placeholder}</Text>
          )}
        </View>
        <ChevronDown size={18} color="#6b7280" />
      </TouchableOpacity>
      {error && <Text className="text-xs text-error">{error}</Text>}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={{
              backgroundColor: '#faf8ff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingHorizontal: 20, paddingVertical: 16,
                borderBottomWidth: 1, borderBottomColor: '#eaedff',
              }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#131b2e' }}>
                  {label} Seç
                </Text>
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <X size={22} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {items.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <Text style={{ color: '#6b7280', fontSize: 14 }}>{emptyMessage}</Text>
                </View>
              ) : (
                <FlatList
                  data={items}
                  keyExtractor={i => i.id}
                  style={{ maxHeight: 320 }}
                  contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8 }}
                  ItemSeparatorComponent={() => (
                    <View style={{ height: 1, backgroundColor: '#eaedff' }} />
                  )}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => { onSelect(item.id); setOpen(false); }}
                      style={{
                        paddingVertical: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          color: '#131b2e', fontSize: 15,
                          fontWeight: item.id === selectedId ? '700' : '400',
                        }}>
                          {item.label}
                        </Text>
                        {item.subtitle && (
                          <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 1 }}>
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                      {item.id === selectedId && <Check size={18} color="#3525cd" />}
                    </TouchableOpacity>
                  )}
                />
              )}
              <View style={{ height: 20 }} />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

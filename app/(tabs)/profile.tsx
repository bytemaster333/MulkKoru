// Profil & Hesap Sayfası
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User, Mail, Shield, Bell, Info, FileText, LogOut, ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileScreen() {
  const router           = useRouter();
  const { user, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const initials  = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'MK';
  const firstName = user?.full_name ?? 'Kullanıcı';

  async function handleLogout() {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await signOut();
              router.replace('/(auth)/login');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Başlık ──────────────────────────────────── */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-on-surface">Profil</Text>
        </View>

        {/* ── Avatar & Kullanıcı Bilgisi ──────────────── */}
        <View className="items-center py-8 gap-3">
          <View className="w-20 h-20 rounded-full bg-brand-500 items-center justify-center">
            <Text className="text-white text-2xl font-bold">{initials}</Text>
          </View>
          <View className="items-center gap-1">
            <Text className="text-on-surface text-xl font-bold">{firstName}</Text>
            <Text className="text-surface-muted text-sm">{user?.email ?? ''}</Text>
          </View>
        </View>

        {/* ── Hesap Bilgileri ─────────────────────────── */}
        <View className="mx-5 gap-2 mb-4">
          <Text className="text-xs font-semibold text-surface-muted uppercase tracking-wider px-1 mb-1">
            Hesap
          </Text>
          <View className="bg-white border border-surface-container rounded-xl overflow-hidden">
            <InfoRow icon={<User size={18} color="#3525cd" />} label="Ad Soyad" value={firstName} />
            <View className="h-px bg-surface-container mx-4" />
            <InfoRow icon={<Mail size={18} color="#3525cd" />} label="E-posta" value={user?.email ?? '—'} />
            <View className="h-px bg-surface-container mx-4" />
            <InfoRow icon={<Shield size={18} color="#3525cd" />} label="Hesap Türü" value="Ev Sahibi" />
          </View>
        </View>

        {/* ── Uygulama Ayarları ───────────────────────── */}
        <View className="mx-5 gap-2 mb-4">
          <Text className="text-xs font-semibold text-surface-muted uppercase tracking-wider px-1 mb-1">
            Uygulama
          </Text>
          <View className="bg-white border border-surface-container rounded-xl overflow-hidden">
            <ActionRow icon={<Bell size={18} color="#6b7280" />} label="Bildirimler" />
            <View className="h-px bg-surface-container mx-4" />
            <ActionRow icon={<FileText size={18} color="#6b7280" />} label="Gizlilik Politikası" />
            <View className="h-px bg-surface-container mx-4" />
            <ActionRow icon={<Info size={18} color="#6b7280" />} label="Uygulama Hakkında" value="v1.0.0" />
          </View>
        </View>

        {/* ── Çıkış Yap ───────────────────────────────── */}
        <View className="mx-5">
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.8}
            className="flex-row items-center justify-center gap-2 rounded-xl py-4"
            style={{ backgroundColor: '#ba1a1a', opacity: loggingOut ? 0.6 : 1 }}
          >
            <LogOut size={20} color="#ffffff" />
            <Text className="text-white font-bold text-base">
              {loggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Yardımcı bileşenler ───────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3.5">
      <View className="w-8 h-8 rounded-lg bg-brand-500/10 items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-xs text-surface-muted">{label}</Text>
        <Text className="text-sm font-medium text-on-surface">{value}</Text>
      </View>
    </View>
  );
}

function ActionRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center gap-3 px-4 py-3.5"
    >
      <View className="w-8 h-8 rounded-lg bg-surface-container items-center justify-center">
        {icon}
      </View>
      <Text className="flex-1 text-sm font-medium text-on-surface">{label}</Text>
      {value && <Text className="text-xs text-surface-muted mr-1">{value}</Text>}
      <ChevronRight size={16} color="#6b7280" />
    </TouchableOpacity>
  );
}

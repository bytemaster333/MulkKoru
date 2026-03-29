import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, KeyboardAvoidingView,
  ScrollView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, Shield } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { validateEmail } from '../../utils/validators';

export default function RegisterScreen() {
  const router          = useRouter();
  const { signUp }      = useAuth();
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (fullName.trim().length < 2) errs.fullName = 'Ad Soyad en az 2 karakter olmalıdır.';
    if (!validateEmail(email))      errs.email    = 'Geçerli bir e-posta adresi girin.';
    if (password.length < 6)        errs.password = 'Şifre en az 6 karakter olmalıdır.';
    if (password !== confirm)       errs.confirm  = 'Şifreler eşleşmiyor.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    try {
      setLoading(true);
      await signUp(email.trim(), password, fullName.trim());
      Alert.alert(
        'Kayıt Başarılı',
        'E-posta adresinize doğrulama bağlantısı gönderdik. Lütfen e-postanızı kontrol edin.',
        [{ text: 'Tamam', onPress: () => router.back() }],
      );
    } catch (e: unknown) {
      Alert.alert('Kayıt Başarısız', e instanceof Error ? e.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Text className="text-brand-500 text-sm">← Geri Dön</Text>
        </TouchableOpacity>

        <View className="items-center mb-8 gap-3">
          <View className="w-16 h-16 rounded-3xl bg-brand-500 items-center justify-center">
            <Shield size={32} color="#ffffff" />
          </View>
          <View className="items-center gap-1">
            <Text className="text-2xl font-bold text-on-surface">Hesap Oluştur</Text>
            <Text className="text-sm text-surface-muted">MülkKoru'ya katılın</Text>
          </View>
        </View>

        <View className="gap-4">
          <Input
            label="Ad Soyad"
            placeholder="Ahmet Yılmaz"
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            leftIcon={<User size={18} color="#6b7280" />}
          />
          <Input
            label="E-posta"
            placeholder="ornek@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            leftIcon={<Mail size={18} color="#6b7280" />}
          />
          <Input
            label="Şifre"
            placeholder="En az 6 karakter"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            leftIcon={<Lock size={18} color="#6b7280" />}
          />
          <Input
            label="Şifre Tekrar"
            placeholder="Şifrenizi tekrar girin"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            error={errors.confirm}
            leftIcon={<Lock size={18} color="#6b7280" />}
          />

          <Button
            title="Kayıt Ol"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            className="mt-2"
          />
        </View>

        <Text className="text-xs text-surface-muted text-center mt-6 leading-4">
          Kayıt olarak KVKK kapsamındaki{' '}
          <Text className="text-brand-500">Gizlilik Politikası</Text>'nı
          {' '}ve{' '}
          <Text className="text-brand-500">Kullanım Şartları</Text>'nı kabul etmiş olursunuz.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

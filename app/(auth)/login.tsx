import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, KeyboardAvoidingView,
  ScrollView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Shield } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { validateEmail } from '../../utils/validators';

export default function LoginScreen() {
  const router        = useRouter();
  const { signIn }    = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!validateEmail(email)) errs.email = 'Geçerli bir e-posta adresi girin.';
    if (password.length < 6)  errs.password = 'Şifre en az 6 karakter olmalıdır.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    try {
      setLoading(true);
      await signIn(email.trim(), password);
    } catch (e: unknown) {
      Alert.alert(
        'Giriş Başarısız',
        e instanceof Error ? e.message : 'E-posta veya şifre hatalı.',
      );
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
        contentContainerClassName="flex-grow px-6 justify-center"
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View className="items-center mb-10 gap-3">
          <View className="w-20 h-20 rounded-3xl bg-brand-500 items-center justify-center">
            <Shield size={40} color="#ffffff" />
          </View>
          <View className="items-center gap-1">
            <Text className="text-3xl font-bold text-on-surface">MülkKoru</Text>
            <Text className="text-sm text-surface-muted">Akıllı Kira Yönetimi</Text>
          </View>
        </View>

        {/* Form */}
        <View className="gap-4">
          <Input
            label="E-posta"
            placeholder="ornek@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            leftIcon={<Mail size={18} color="#6b7280" />}
          />
          <Input
            label="Şifre"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            leftIcon={<Lock size={18} color="#6b7280" />}
          />

          <Button
            title="Giriş Yap"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            className="mt-2"
          />
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-center mt-8 gap-1">
          <Text className="text-sm text-surface-muted">Hesabınız yok mu?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-sm font-semibold text-brand-500">Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

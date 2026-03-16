// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { supabase } from '../../supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre boş bırakılamaz.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Giriş Hatası', error.message);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Üst Alan */}
      <View style={styles.header}>
        <Text style={styles.emoji}>🏥</Text>
        <Text style={styles.title}>Hasta Takip Sistemi</Text>
        <Text style={styles.subtitle}>Sağlığınızı takip edin, verilerinizi yönetin</Text>
      </View>

      {/* Form Alanı */}
      <View style={styles.form}>
        <Text style={styles.label}>E-Posta Adresi</Text>
        <TextInput
          style={styles.input}
          placeholder="ornek@mail.com"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Şifre</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Giriş Yap</Text>
          }
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>veya</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>Yeni Hesap Oluştur</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>© 2026 Hasta Takip Sistemi</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#f0f4ff',
    justifyContent: 'center', padding: 24
  },
  header: {
    alignItems: 'center', marginBottom: 40
  },
  emoji: {
    fontSize: 56, marginBottom: 12
  },
  title: {
    fontSize: 26, fontWeight: '700',
    color: '#1a1a2e', letterSpacing: 0.5,
    textAlign: 'center', marginBottom: 8
  },
  subtitle: {
    fontSize: 14, color: '#6b7280',
    textAlign: 'center', lineHeight: 20
  },
  form: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 24, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 12,
    elevation: 4
  },
  label: {
    fontSize: 13, fontWeight: '600',
    color: '#374151', marginBottom: 6, marginLeft: 2
  },
  input: {
    backgroundColor: '#f9fafb', borderRadius: 10, padding: 14,
    fontSize: 15, marginBottom: 16,
    borderWidth: 1, borderColor: '#e5e7eb', color: '#1a1a2e'
  },
  button: {
    backgroundColor: '#2563eb', borderRadius: 10,
    padding: 15, alignItems: 'center', marginTop: 4
  },
  buttonText: {
    color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.3
  },
  divider: {
    flexDirection: 'row', alignItems: 'center', marginVertical: 20
  },
  line: {
    flex: 1, height: 1, backgroundColor: '#e5e7eb'
  },
  dividerText: {
    marginHorizontal: 12, color: '#9ca3af', fontSize: 13
  },
  registerButton: {
    borderWidth: 1.5, borderColor: '#2563eb',
    borderRadius: 10, padding: 15, alignItems: 'center'
  },
  registerText: {
    color: '#2563eb', fontSize: 15, fontWeight: '600'
  },
  footer: {
    textAlign: 'center', color: '#9ca3af',
    fontSize: 12, marginTop: 32
  },
});
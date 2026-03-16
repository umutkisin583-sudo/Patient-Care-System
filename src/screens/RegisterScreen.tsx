// src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { supabase } from '../../supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  setIgnore: (val: boolean) => void;
};

export default function RegisterScreen({ navigation, setIgnore }: Props) {
  const [fullName, setFullName] = useState('');
  const [age, setAge]           = useState('');
  const [weight, setWeight]     = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!fullName || !age || !weight || !email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setIgnore(true);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setIgnore(false);
      setLoading(false);
      Alert.alert('Kayıt Hatası', signUpError.message);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName,
          age: parseInt(age),
          weight: parseFloat(weight),
        });

      if (profileError) {
        setIgnore(false);
        setLoading(false);
        Alert.alert('Profil Hatası', profileError.message);
        return;
      }
    }

    await supabase.auth.signOut();
    await new Promise(resolve => setTimeout(resolve, 500));

    setLoading(false);
    Alert.alert(
      'Kayıt Başarılı! 🎉',
      'Hesabın oluşturuldu. Şimdi giriş yapabilirsin.',
      [{ text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Üst Alan */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🏥</Text>
          <Text style={styles.title}>Hasta Takip Sistemi</Text>
          <Text style={styles.subtitle}>Yeni hesap oluşturun</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            style={styles.input}
            placeholder="Adınızı girin"
            placeholderTextColor="#aaa"
            value={fullName}
            onChangeText={setFullName}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Yaş</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                placeholderTextColor="#aaa"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Kilo (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="70"
                placeholderTextColor="#aaa"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

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

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Kayıt Ol</Text>
            }
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Zaten hesabın var mı? Giriş Yap</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>© 2026 Hasta Takip Sistemi</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, backgroundColor: '#f0f4ff',
    justifyContent: 'center', padding: 24
  },
  header: { alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: {
    fontSize: 26, fontWeight: '700', color: '#1a1a2e',
    letterSpacing: 0.5, textAlign: 'center', marginBottom: 8
  },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  form: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4
  },
  row: { flexDirection: 'row' },
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
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { marginHorizontal: 12, color: '#9ca3af', fontSize: 13 },
  loginButton: {
    borderWidth: 1.5, borderColor: '#2563eb',
    borderRadius: 10, padding: 15, alignItems: 'center'
  },
  loginText: { color: '#2563eb', fontSize: 15, fontWeight: '600' },
  footer: {
    textAlign: 'center', color: '#9ca3af',
    fontSize: 12, marginTop: 32
  },
});
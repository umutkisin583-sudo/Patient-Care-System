// src/screens/HomeScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { supabase } from '../../supabase';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const [fullName, setFullName] = useState('');
  const [lastMeasurement, setLastMeasurement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchLastMeasurement();
    }, [])
  );

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      if (data) setFullName(data.full_name);
    }
  };

  const fetchLastMeasurement = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data) setLastMeasurement(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Normal') return '#16a34a';
    if (status === 'Normal Üstü') return '#2563eb';
    if (status === 'Yüksek Risk') return '#d97706';
    if (status === 'Hipertansiyon') return '#dc2626';
    return '#6b7280';
  };

  const getStatusEmoji = (status: string) => {
    if (status === 'Normal') return '🟢';
    if (status === 'Normal Üstü') return '🔵';
    if (status === 'Yüksek Risk') return '🟡';
    if (status === 'Hipertansiyon') return '🔴';
    return '⚪';
  };

  const today = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>📅 {today}</Text>
          <Text style={styles.welcome}>
            Hoşgeldin, {fullName ? fullName.split(' ')[0] : '...'} 👋
          </Text>
          <Text style={styles.subtitle}>Sağlığınızı takip edin</Text>
        </View>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>
            {fullName ? fullName.split(' ')[0][0].toUpperCase() : '?'}
          </Text>
        </View>
      </View>

      {/* Son Ölçüm Kartı */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>SON ÖLÇÜM</Text>
          <Text style={styles.cardIcon}>🩺</Text>
        </View>
        {loading ? (
          <ActivityIndicator color="#2563eb" style={{ marginTop: 16 }} />
        ) : lastMeasurement ? (
          <>
            <View style={styles.measureRow}>
              <View style={styles.measureItem}>
                <Text style={styles.measureValue}>
                  {lastMeasurement.systolic}/{lastMeasurement.diastolic}
                </Text>
                <Text style={styles.measureLabel}>mmHg · Tansiyon</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.measureItem}>
                <Text style={styles.measureValue}>{lastMeasurement.pulse}</Text>
                <Text style={styles.measureLabel}>bpm · Nabız</Text>
              </View>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lastMeasurement.status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(lastMeasurement.status) }]}>
                {getStatusEmoji(lastMeasurement.status)}  {lastMeasurement.status}
              </Text>
              {lastMeasurement.status === 'Hipertansiyon' && (
                <TouchableOpacity
                  style={styles.emergencyMini}
                  onPress={() => Linking.openURL('tel:112')}
                >
                  <Text style={styles.emergencyMiniText}>🚨 112'yi Ara</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyText}>Henüz ölçüm yapılmadı</Text>
            <Text style={styles.emptySubText}>Ölçüm Ekle sekmesinden başlayın</Text>
          </View>
        )}
      </View>

      {/* Bilgi Kartları */}
      <View style={styles.infoRow}>
        <View style={[styles.infoCard, { backgroundColor: '#eff6ff' }]}>
          <Text style={styles.infoEmoji}>💧</Text>
          <Text style={styles.infoTitle}>Normal</Text>
          <Text style={styles.infoValue}>120/80</Text>
          <Text style={styles.infoSub}>mmHg altı</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: '#fffbeb' }]}>
          <Text style={styles.infoEmoji}>⚠️</Text>
          <Text style={styles.infoTitle}>Yüksek Risk</Text>
          <Text style={styles.infoValue}>140/90</Text>
          <Text style={styles.infoSub}>mmHg üstü</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: '#fef2f2' }]}>
          <Text style={styles.infoEmoji}>🚨</Text>
          <Text style={styles.infoTitle}>Hiper.</Text>
          <Text style={styles.infoValue}>160/100</Text>
          <Text style={styles.infoSub}>mmHg üstü</Text>
        </View>
      </View>

      {/* Çıkış */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#2563eb', padding: 24, paddingTop: 60, paddingBottom: 32,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  date: { fontSize: 12, color: '#bfdbfe', marginBottom: 4 },
  welcome: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#bfdbfe' },
  avatarBox: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#1d4ed8', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#93c5fd'
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#fff' },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    margin: 20, marginTop: -16,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 6
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 1 },
  cardIcon: { fontSize: 20 },
  measureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  measureItem: { flex: 1, alignItems: 'center' },
  measureValue: { fontSize: 32, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  measureLabel: { fontSize: 12, color: '#6b7280' },
  dividerVertical: { width: 1, height: 56, backgroundColor: '#f3f4f6' },
  statusBadge: { borderRadius: 12, padding: 12, alignItems: 'center' },
  statusText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  emergencyMini: {
    marginTop: 10, backgroundColor: '#dc2626',
    borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10,
  },
  emergencyMiniText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  emptyBox: { alignItems: 'center', paddingVertical: 24 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#374151', fontWeight: '600', marginBottom: 4 },
  emptySubText: { fontSize: 13, color: '#9ca3af' },
  infoRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  infoCard: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center' },
  infoEmoji: { fontSize: 20, marginBottom: 6 },
  infoTitle: { fontSize: 11, fontWeight: '600', color: '#374151', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '800', color: '#1a1a2e' },
  infoSub: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  logoutButton: {
    marginHorizontal: 20, marginBottom: 32, padding: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb',
    alignItems: 'center', backgroundColor: '#fff'
  },
  logoutText: { color: '#dc2626', fontSize: 14, fontWeight: '600' },
});
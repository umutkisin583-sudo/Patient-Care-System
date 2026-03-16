// src/screens/HistoryScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, RefreshControl, TouchableOpacity, Alert
} from 'react-native';
import { supabase } from '../../supabase';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type Measurement = {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  status: string;
  notes: string | null;
  created_at: string;
};

export default function HistoryScreen() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [pdfLoading, setPdfLoading]     = useState(false);
  const [fullName, setFullName]         = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Profil bilgisi
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    if (profile) setFullName(profile.full_name);

    // Ölçümler
    const { data } = await supabase
      .from('measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setMeasurements(data);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusColor = (status: string) => {
    if (status === 'Normal')        return '#16a34a';
    if (status === 'Normal Üstü')   return '#2563eb';
    if (status === 'Yüksek Risk')   return '#d97706';
    if (status === 'Hipertansiyon') return '#dc2626';
    return '#6b7280';
  };

  const getStatusEmoji = (status: string) => {
    if (status === 'Normal')        return '🟢';
    if (status === 'Normal Üstü')   return '🔵';
    if (status === 'Yüksek Risk')   return '🟡';
    if (status === 'Hipertansiyon') return '🔴';
    return '⚪';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const generatePDF = async () => {
    if (measurements.length === 0) {
      Alert.alert('Hata', 'PDF oluşturmak için en az bir ölçüm gerekli.');
      return;
    }

    setPdfLoading(true);

    const rows = measurements.map((m, i) => `
      <tr style="background: ${i % 2 === 0 ? '#f9fafb' : '#fff'}">
        <td>${formatDate(m.created_at)}</td>
        <td style="text-align:center; font-weight:700">${m.systolic}/${m.diastolic}</td>
        <td style="text-align:center; font-weight:700">${m.pulse}</td>
        <td style="text-align:center; color:${getStatusColor(m.status)}; font-weight:700">
          ${getStatusEmoji(m.status)} ${m.status}
        </td>
        <td>${m.notes || '-'}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #1a1a2e; }
          .header { text-align: center; margin-bottom: 32px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
          .header h1 { color: #2563eb; font-size: 28px; margin: 0 0 8px 0; }
          .header p { color: #6b7280; margin: 4px 0; font-size: 14px; }
          .info-box { background: #eff6ff; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
          .info-box p { margin: 4px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #2563eb; color: white; padding: 12px 8px; text-align: left; }
          td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
          .footer { text-align: center; margin-top: 32px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
          .summary { display: flex; gap: 16px; margin-bottom: 24px; }
          .summary-card { flex: 1; border-radius: 12px; padding: 12px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 Hasta Takip Sistemi</h1>
          <p>Tansiyon & Nabız Ölçüm Raporu</p>
          <p>Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div class="info-box">
          <p><strong>👤 Hasta Adı:</strong> ${fullName}</p>
          <p><strong>📊 Toplam Ölçüm:</strong> ${measurements.length} kayıt</p>
          <p><strong>📅 İlk Ölçüm:</strong> ${formatDate(measurements[measurements.length - 1].created_at)}</p>
          <p><strong>📅 Son Ölçüm:</strong> ${formatDate(measurements[0].created_at)}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Tarih & Saat</th>
              <th style="text-align:center">Tansiyon (mmHg)</th>
              <th style="text-align:center">Nabız (bpm)</th>
              <th style="text-align:center">Durum</th>
              <th>Not</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          <p>Bu rapor Hasta Takip Sistemi tarafından otomatik oluşturulmuştur.</p>
          <p>Tıbbi tanı için lütfen doktorunuza başvurun.</p>
        </div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'PDF Raporu Paylaş',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      Alert.alert('Hata', 'PDF oluşturulurken bir hata oluştu.');
    }

    setPdfLoading(false);
  };

  const renderItem = ({ item }: { item: Measurement }) => (
    <View style={styles.card}>
      <View style={[styles.cardAccent, { backgroundColor: getStatusColor(item.status) }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '18' }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
              {getStatusEmoji(item.status)} {item.status}
            </Text>
          </View>
        </View>
        <View style={styles.valuesRow}>
          <View style={styles.valueBlock}>
            <Text style={styles.valueNumber}>{item.systolic}/{item.diastolic}</Text>
            <Text style={styles.valueLabel}>mmHg · Tansiyon</Text>
          </View>
          <View style={styles.valueSep} />
          <View style={styles.valueBlock}>
            <Text style={styles.valueNumber}>💓 {item.pulse}</Text>
            <Text style={styles.valueLabel}>bpm · Nabız</Text>
          </View>
        </View>
        {item.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>📝 {item.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Geçmiş Ölçümler</Text>
          <Text style={styles.headerSub}>{measurements.length} ölçüm kayıtlı</Text>
        </View>
        <TouchableOpacity style={styles.pdfButton} onPress={generatePDF} disabled={pdfLoading}>
          {pdfLoading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.pdfButtonText}>📄 PDF</Text>
          }
        </TouchableOpacity>
      </View>

      {measurements.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>Henüz ölçüm yok</Text>
          <Text style={styles.emptySub}>Ölçüm Ekle sekmesinden yeni ölçüm ekleyebilirsiniz</Text>
        </View>
      ) : (
        <FlatList
          data={measurements}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff' },
  header: {
    backgroundColor: '#2563eb', padding: 24, paddingTop: 60, paddingBottom: 32,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 14, color: '#bfdbfe' },
  pdfButton: {
    backgroundColor: '#1d4ed8', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1.5, borderColor: '#93c5fd'
  },
  pdfButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  list: { padding: 20, paddingTop: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 12,
    flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3
  },
  cardAccent: { width: 5, borderRadius: 4 },
  cardContent: { flex: 1, padding: 16 },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12
  },
  cardDate: { fontSize: 11, color: '#9ca3af', flex: 1 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  valuesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  valueBlock: { flex: 1, alignItems: 'center' },
  valueNumber: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 2 },
  valueLabel: { fontSize: 11, color: '#9ca3af' },
  valueSep: { width: 1, height: 44, backgroundColor: '#f3f4f6' },
  notesBox: { backgroundColor: '#f8faff', borderRadius: 8, padding: 10, marginTop: 4 },
  notesText: { fontSize: 12, color: '#4b5563' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22 },
});
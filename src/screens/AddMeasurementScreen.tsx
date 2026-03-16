// src/screens/AddMeasurementScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, Linking, Modal
} from 'react-native';
import { supabase } from '../../supabase';

export default function AddMeasurementScreen() {
  const [systolic, setSystolic]           = useState('');
  const [diastolic, setDiastolic]         = useState('');
  const [pulse, setPulse]                 = useState('');
  const [notes, setNotes]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);

  const analyzeStatus = (sys: number, dia: number): string => {
    if (sys >= 160 || dia >= 100) return 'Hipertansiyon';
    if (sys >= 140 || dia >= 90)  return 'Yüksek Risk';
    if (sys >= 120 || dia >= 80)  return 'Normal Üstü';
    return 'Normal';
  };

  const handleSave = async () => {
    if (!systolic || !diastolic || !pulse) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }

    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    const pul = parseInt(pulse);

    if (isNaN(sys) || isNaN(dia) || isNaN(pul)) {
      Alert.alert('Hata', 'Lütfen geçerli sayılar girin.');
      return;
    }

    if (sys < 60 || sys > 250 || dia < 40 || dia > 150 || pul < 30 || pul > 250) {
      Alert.alert('Geçersiz Değer', 'Girilen değerler geçerli aralıkta değil.');
      return;
    }

    const status = analyzeStatus(sys, dia);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      Alert.alert('Hata', 'Kullanıcı bulunamadı.');
      return;
    }

    const { error } = await supabase.from('measurements').insert({
      user_id: user.id,
      systolic: sys,
      diastolic: dia,
      pulse: pul,
      notes: notes || null,
      status,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    if (status === 'Hipertansiyon') {
      setShowEmergency(true);
    } else if (status === 'Yüksek Risk') {
      Alert.alert('🟡 Yüksek Risk', 'Tansiyon değerleriniz yüksek.\nBir doktora danışmanız önerilir.', [{ text: 'Tamam', onPress: resetForm }]);
    } else if (status === 'Normal Üstü') {
      Alert.alert('🔵 Normal Üstü', 'Değerleriniz biraz yüksek. Takip etmeye devam edin.', [{ text: 'Tamam', onPress: resetForm }]);
    } else {
      Alert.alert('✅ Harika!', 'Tansiyon değerleriniz normal. Sağlıklı görünüyorsunuz.', [{ text: 'Tamam', onPress: resetForm }]);
    }
  };

  const resetForm = () => {
    setSystolic('');
    setDiastolic('');
    setPulse('');
    setNotes('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* ACİL MODAL */}
      <Modal
        visible={showEmergency}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>🚨</Text>
            <Text style={styles.modalTitle}>KRİTİK UYARI!</Text>
            <Text style={styles.modalDesc}>
              Tansiyon değerleriniz tehlikeli seviyede.{'\n'}
              Lütfen hemen 112 Acil Servisi arayın!
            </Text>
            <Text style={styles.modalValues}>
              {systolic}/{diastolic} mmHg
            </Text>

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => {
                setShowEmergency(false);
                resetForm();
                Linking.openURL('tel:112');
              }}
            >
              <Text style={styles.callButtonText}>📞 112'yi Ara</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowEmergency(false);
                resetForm();
              }}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Yeni Ölçüm</Text>
          <Text style={styles.headerSub}>Tansiyon ve nabız değerlerinizi girin</Text>
        </View>

        {/* Tansiyon Kartı */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>TANSİYON</Text>
            <Text style={styles.cardIcon}>🩺</Text>
          </View>
          <Text style={styles.cardDesc}>Sistolik / Diyastolik (mmHg)</Text>
          <View style={styles.tansiyonRow}>
            <View style={styles.tansiyonInputWrap}>
              <Text style={styles.inputLabel}>Büyük</Text>
              <TextInput
                style={styles.tansiyonInput}
                placeholder="120"
                placeholderTextColor="#d1d5db"
                value={systolic}
                onChangeText={setSystolic}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <View style={styles.slashWrap}>
              <Text style={styles.slash}>/</Text>
            </View>
            <View style={styles.tansiyonInputWrap}>
              <Text style={styles.inputLabel}>Küçük</Text>
              <TextInput
                style={styles.tansiyonInput}
                placeholder="80"
                placeholderTextColor="#d1d5db"
                value={diastolic}
                onChangeText={setDiastolic}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>
        </View>

        {/* Nabız Kartı */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>NABIZ</Text>
            <Text style={styles.cardIcon}>💓</Text>
          </View>
          <Text style={styles.cardDesc}>Atım / Dakika (bpm)</Text>
          <TextInput
            style={styles.input}
            placeholder="72"
            placeholderTextColor="#d1d5db"
            value={pulse}
            onChangeText={setPulse}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        {/* Not Kartı */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>NOT</Text>
            <Text style={styles.cardIcon}>📝</Text>
          </View>
          <Text style={styles.cardDesc}>İsteğe bağlı — doktor notu veya gözlem</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Örn: İlaç aldıktan sonra ölçüldü..."
            placeholderTextColor="#d1d5db"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Referans */}
        <View style={styles.referenceCard}>
          <Text style={styles.cardTitle}>REFERANS DEĞERLERİ</Text>
          <View style={styles.refRow}>
            <View style={[styles.refDot, { backgroundColor: '#dcfce7' }]}><Text>🟢</Text></View>
            <View>
              <Text style={styles.refTitle}>Normal</Text>
              <Text style={styles.refValue}>120/80 mmHg altı</Text>
            </View>
          </View>
          <View style={styles.refRow}>
            <View style={[styles.refDot, { backgroundColor: '#fef9c3' }]}><Text>🟡</Text></View>
            <View>
              <Text style={styles.refTitle}>Yüksek Risk</Text>
              <Text style={styles.refValue}>140/90 mmHg üstü</Text>
            </View>
          </View>
          <View style={styles.refRow}>
            <View style={[styles.refDot, { backgroundColor: '#fee2e2' }]}><Text>🔴</Text></View>
            <View>
              <Text style={styles.refTitle}>Hipertansiyon</Text>
              <Text style={styles.refValue}>160/100 mmHg üstü</Text>
            </View>
          </View>
        </View>

        {/* Kaydet */}
        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>💾  Kaydet</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  header: {
    backgroundColor: '#2563eb', padding: 24, paddingTop: 60, paddingBottom: 32,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28, marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 14, color: '#bfdbfe' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center', padding: 24
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 24, padding: 32,
    alignItems: 'center', width: '100%',
    borderWidth: 3, borderColor: '#dc2626'
  },
  modalEmoji: { fontSize: 56, marginBottom: 12 },
  modalTitle: {
    fontSize: 24, fontWeight: '900', color: '#dc2626',
    letterSpacing: 1, marginBottom: 12
  },
  modalDesc: {
    fontSize: 15, color: '#374151', textAlign: 'center',
    lineHeight: 24, marginBottom: 16
  },
  modalValues: {
    fontSize: 32, fontWeight: '900', color: '#dc2626',
    marginBottom: 24
  },
  callButton: {
    backgroundColor: '#dc2626', borderRadius: 14, padding: 16,
    width: '100%', alignItems: 'center', marginBottom: 12,
    shadowColor: '#dc2626', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6
  },
  callButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  closeButton: {
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14,
    padding: 14, width: '100%', alignItems: 'center'
  },
  closeButtonText: { color: '#6b7280', fontSize: 15, fontWeight: '600' },

  // Form
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    marginHorizontal: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 1 },
  cardIcon: { fontSize: 18 },
  cardDesc: { fontSize: 12, color: '#6b7280', marginBottom: 14 },
  tansiyonRow: { flexDirection: 'row', alignItems: 'flex-end' },
  tansiyonInputWrap: { flex: 1 },
  inputLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 6, fontWeight: '600' },
  tansiyonInput: {
    backgroundColor: '#f9fafb', borderRadius: 12, padding: 16,
    fontSize: 24, fontWeight: '700', color: '#1a1a2e',
    borderWidth: 1.5, borderColor: '#e5e7eb', textAlign: 'center'
  },
  slashWrap: { paddingHorizontal: 12, paddingBottom: 12 },
  slash: { fontSize: 28, color: '#d1d5db', fontWeight: '300' },
  input: {
    backgroundColor: '#f9fafb', borderRadius: 12, padding: 14,
    fontSize: 16, color: '#1a1a2e', borderWidth: 1.5, borderColor: '#e5e7eb'
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  referenceCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    marginHorizontal: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#e0e7ff'
  },
  refRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 },
  refDot: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  refTitle: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  refValue: { fontSize: 12, color: '#6b7280' },
  button: {
    backgroundColor: '#2563eb', borderRadius: 14, padding: 18,
    alignItems: 'center', marginHorizontal: 20, marginBottom: 40,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
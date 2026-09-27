import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { DataContext } from '../../contexts/DataContext';

export default function CycleScreen() {
  const { data, loading, saveData } = useContext(DataContext);
  const [editingWorkouts, setEditingWorkouts] = useState([]);

  useEffect(() => {
    if (data && data.workouts) {
      setEditingWorkouts([...data.workouts]);
    }
  }, [data]);

  const handleUpdateCycle = async () => {
    if (!data) return;
    let newData = { ...data };
    newData.workouts = editingWorkouts;
    await saveData(newData);
    Alert.alert("Başarılı", "Antrenman döngünüz güncellendi.");
  };

  if (loading || !data) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2196F3" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛠️ Döngüyü Düzenle</Text>
        <Text style={styles.subText}>7 günlük antrenman sıranızı değiştirin:</Text>
        {editingWorkouts.map((workout, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.rowLabel}>Gün {index + 1}:</Text>
            <TextInput
              style={styles.input}
              value={workout}
              onChangeText={(text) => {
                const newArr = [...editingWorkouts];
                newArr[index] = text;
                setEditingWorkouts(newArr);
              }}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.btnPrimary} onPress={handleUpdateCycle}>
          <Text style={styles.btnText}>💾 Döngüyü Güncelle</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 10, elevation: 2 },
  cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8, color: '#333' },
  subText: { fontSize: 14, color: '#666', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rowLabel: { width: 60, fontSize: 16, color: '#333', fontWeight: '500' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#fff' },
  btnPrimary: { backgroundColor: '#2196F3', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

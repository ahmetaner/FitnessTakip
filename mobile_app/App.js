import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const API_URL = 'http://192.168.0.12:8000/api/data';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actualWorkout, setActualWorkout] = useState('');
  const [editingWorkouts, setEditingWorkouts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      const fetchedData = response.data;
      if (!fetchedData.workouts) {
        fetchedData.workouts = ["push", "pull", "leg", "upper", "lower", "v-sit", "muscle up"];
      }
      if (fetchedData.next_workout_idx === undefined) fetchedData.next_workout_idx = 5;
      
      setData(fetchedData);
      setEditingWorkouts([...fetchedData.workouts]);
      
      const currentIdx = fetchedData.next_workout_idx % fetchedData.workouts.length;
      setActualWorkout(fetchedData.workouts[currentIdx]);
      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Hata", "Veri sunucudan alınamadı. api.py çalışıyor mu?");
      setLoading(false);
    }
  };

  const saveData = async (newData) => {
    try {
      await axios.post(API_URL, newData);
      setData(newData);
    } catch (error) {
      Alert.alert("Hata", "Veri kaydedilemedi.");
    }
  };

  const getTodayStr = () => {
    const today = new Date();
    // adjust for local timezone offset manually or just use string split
    return new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };

  const addDays = (dateStr, days) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };

  const handleCompleteWorkout = async () => {
    if (!data) return;
    const today = getTodayStr();
    let newData = { ...data };
    
    // Streak logic
    newData.streak = (newData.streak || 0) + 1;
    if (newData.streak > (newData.max_streak || 0)) {
      newData.max_streak = newData.streak;
    }
    
    newData.last_completed_date = today;
    if (!newData.completed_history) newData.completed_history = [];
    newData.completed_history.push({ title: 'Antrenman: ' + actualWorkout, date: today });
    
    // Swap logic
    let workoutsList = [...newData.workouts];
    const currentIdx = newData.next_workout_idx % workoutsList.length;
    const scheduledName = workoutsList[currentIdx];
    
    if (actualWorkout !== scheduledName) {
      const swapIdx = workoutsList.indexOf(actualWorkout);
      if (swapIdx !== -1) {
        workoutsList[currentIdx] = workoutsList[swapIdx];
        workoutsList[swapIdx] = scheduledName;
      }
    }
    newData.workouts = workoutsList;
    
    // Date increment
    const currMod = newData.next_workout_idx % workoutsList.length;
    const isRestNext = [1, 3, 6].includes(currMod);
    newData.expected_next_date = addDays(today, isRestNext ? 2 : 1);
    
    newData.next_workout_idx = (newData.next_workout_idx + 1) % workoutsList.length;
    
    await saveData(newData);
    Alert.alert("Tebrikler", "Antrenman başarıyla tamamlandı!");
  };

  const handleDelay = async () => {
    if (!data) return;
    const today = getTodayStr();
    let newData = { ...data };
    
    newData.expected_next_date = addDays(today, 1);
    newData.streak = 0;
    
    await saveData(newData);
    Alert.alert("Ertelendi", "Antrenman yarına kaydırıldı.");
  };

  const handleUpdateCycle = async () => {
    if (!data) return;
    let newData = { ...data };
    newData.workouts = editingWorkouts;
    await saveData(newData);
    Alert.alert("Başarılı", "Antrenman döngünüz güncellendi.");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const todayStr = getTodayStr();
  const isCompletedToday = data?.last_completed_date === todayStr;
  const currentIdx = data?.next_workout_idx % data?.workouts.length;
  const scheduledName = data?.workouts[currentIdx];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.header}>💪 Fitness Takip</Text>
      
      {/* Stats Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Streak (Seri)</Text>
        <Text style={styles.statValue}>{data?.streak || 0} Gün</Text>
        <Text style={styles.statSub}>Max: {data?.max_streak || 0} Gün</Text>
      </View>

      {/* Today's Workout Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏋️ Bugünün Antrenmanı</Text>
        {isCompletedToday ? (
          <Text style={styles.successText}>Bugünkü antrenmanı tamamladınız! Harika iş çıkardınız.</Text>
        ) : (
          <View>
            <Text style={styles.label}>Planlanan veya Yaptığınız İdman:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={actualWorkout}
                onValueChange={(itemValue) => setActualWorkout(itemValue)}
              >
                {data?.workouts.map((w, idx) => (
                  <Picker.Item key={idx} label={w} value={w} />
                ))}
              </Picker>
            </View>
            
            <TouchableOpacity style={styles.btnSuccess} onPress={handleCompleteWorkout}>
              <Text style={styles.btnText}>✅ Tamamla (Streak +1)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.btnWarning} onPress={handleDelay}>
              <Text style={styles.btnText}>⚠️ Bugünü Ertele</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Cycle Editor Section */}
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
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#333' },
  statValue: { fontSize: 36, fontWeight: 'bold', color: '#ff4b4b' },
  statSub: { fontSize: 14, color: '#666', marginTop: 4 },
  label: { fontSize: 14, color: '#555', marginBottom: 8 },
  successText: { fontSize: 16, color: '#4CAF50', fontWeight: 'bold' },
  pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 16, backgroundColor: '#fafafa' },
  btnSuccess: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  btnWarning: { backgroundColor: '#ff9800', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#2196F3', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  subText: { fontSize: 14, color: '#666', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rowLabel: { width: 60, fontSize: 16, color: '#333', fontWeight: '500' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#fff' }
});

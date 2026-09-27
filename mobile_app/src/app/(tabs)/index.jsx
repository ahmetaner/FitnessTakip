import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { DataContext } from '../../contexts/DataContext';

export default function TodayScreen() {
  const { data, loading, saveData } = useContext(DataContext);
  const [actualWorkout, setActualWorkout] = useState('');

  useEffect(() => {
    if (data) {
      const currentIdx = data.next_workout_idx % data.workouts.length;
      setActualWorkout(data.workouts[currentIdx]);
    }
  }, [data]);

  const getTodayStr = () => {
    const today = new Date();
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
    
    newData.streak = (newData.streak || 0) + 1;
    if (newData.streak > (newData.max_streak || 0)) newData.max_streak = newData.streak;
    
    newData.last_completed_date = today;
    if (!newData.completed_history) newData.completed_history = [];
    newData.completed_history.push({ title: 'Antrenman: ' + actualWorkout, date: today });
    
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
    
    const currMod = newData.next_workout_idx % workoutsList.length;
    newData.expected_next_date = addDays(today, [1, 3, 6].includes(currMod) ? 2 : 1);
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

  if (loading || !data) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  const todayStr = getTodayStr();
  const isCompletedToday = data.last_completed_date === todayStr;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>💪 Fitness Takip</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏋️ Bugünün Antrenmanı</Text>
        {isCompletedToday ? (
          <Text style={styles.successText}>Bugünkü antrenmanı tamamladınız! Harika iş çıkardınız.</Text>
        ) : (
          <View>
            <Text style={styles.label}>Planlanan veya Yaptığınız İdman:</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={actualWorkout} onValueChange={(val) => setActualWorkout(val)}>
                {data.workouts.map((w, idx) => (
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20, textAlign: 'center', marginTop: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#333' },
  label: { fontSize: 14, color: '#555', marginBottom: 8 },
  successText: { fontSize: 16, color: '#4CAF50', fontWeight: 'bold' },
  pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 16, backgroundColor: '#fafafa' },
  btnSuccess: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  btnWarning: { backgroundColor: '#ff9800', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

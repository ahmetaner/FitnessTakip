import React, { useContext, useMemo, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { DataContext } from '../../contexts/DataContext';

LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  monthNamesShort: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  dayNames: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
  dayNamesShort: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],
  today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

export default function CalendarScreen() {
  const { data, loading } = useContext(DataContext);
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);

  const { markedDates, scheduleMap } = useMemo(() => {
    if (!data || !data.workouts) return { markedDates: {}, scheduleMap: {} };
    
    let marks = {};
    let sMap = {};
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (data.completed_history) {
        data.completed_history.forEach(item => {
            marks[item.date] = { selected: true, selectedColor: '#4CAF50' };
            sMap[item.date] = { type: 'completed', title: item.title };
        });
    }
    
    let currentDateStr = data.expected_next_date;
    if (!currentDateStr || new Date(currentDateStr) < today) {
        currentDateStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    }
    
    let currentDate = new Date(currentDateStr);
    let idx = data.next_workout_idx || 0;
    
    for (let i = 0; i < 90; i++) {
        const dateStr = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const workoutName = data.workouts[idx % data.workouts.length];
        
        if (!marks[dateStr]) {
            marks[dateStr] = { marked: true, dotColor: '#FF4B4B' };
        }
        
        sMap[dateStr] = { type: 'planned', title: 'Antrenman: ' + workoutName };
        
        const currMod = idx % data.workouts.length;
        if ([1, 3, 6].includes(currMod)) {
            const restDate = new Date(currentDate);
            restDate.setDate(restDate.getDate() + 1);
            const restDateStr = new Date(restDate.getTime() - (restDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            sMap[restDateStr] = { type: 'rest', title: '🛋️ Dinlenme Günü' };
            currentDate.setDate(currentDate.getDate() + 2);
        } else {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        idx++;
    }
    
    return { markedDates: marks, scheduleMap: sMap };
  }, [data]);

  if (loading || !data) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2196F3" /></View>;
  }

  const handleDayPress = (day) => {
    const info = scheduleMap[day.dateString];
    if (info) {
      setSelectedDayInfo({ date: day.dateString, ...info });
    } else {
      setSelectedDayInfo({ date: day.dateString, type: 'unknown', title: 'Plan bulunmuyor.' });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🗓️ İdman Takvimi</Text>
        <Calendar
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={{
            todayTextColor: '#2196F3',
            arrowColor: '#2196F3',
            dotColor: '#FF4B4B',
            selectedDayBackgroundColor: '#4CAF50',
          }}
        />
        <View style={styles.legend}>
            <Text style={{color: '#4CAF50', fontWeight: 'bold'}}>🟩 Tamamlanan</Text>
            <Text style={{color: '#FF4B4B', fontWeight: 'bold', marginLeft: 15}}>🔴 Gelecek Plan</Text>
        </View>
      </View>

      {selectedDayInfo && (
        <View style={[styles.card, styles.infoCard]}>
          <Text style={styles.infoDate}>{selectedDayInfo.date}</Text>
          <Text style={[styles.infoTitle, selectedDayInfo.type === 'completed' ? {color: '#4CAF50'} : selectedDayInfo.type === 'rest' ? {color: '#2196F3'} : {color: '#333'} ]}>
            {selectedDayInfo.title.replace('Antrenman: ', '🏋️ ')}
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedDayInfo(null)}>
            <Text style={styles.closeBtnText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 10, elevation: 2 },
  cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#333' },
  legend: { flexDirection: 'row', marginTop: 15, justifyContent: 'center' },
  infoCard: { alignItems: 'center', backgroundColor: '#e3f2fd', borderWidth: 1, borderColor: '#90caf9' },
  infoDate: { fontSize: 14, color: '#666', marginBottom: 4 },
  infoTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  closeBtn: { backgroundColor: '#2196F3', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  closeBtnText: { color: '#fff', fontWeight: 'bold' }
});

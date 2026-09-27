import React, { useContext, useMemo } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
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

  const markedDates = useMemo(() => {
    if (!data || !data.workouts) return {};
    
    let marks = {};
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Add past completed workouts
    if (data.completed_history) {
        data.completed_history.forEach(item => {
            marks[item.date] = { selected: true, selectedColor: '#4CAF50' };
        });
    }
    
    // Generate future schedule
    let currentDateStr = data.expected_next_date;
    if (!currentDateStr || new Date(currentDateStr) < today) {
        currentDateStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    }
    
    let currentDate = new Date(currentDateStr);
    let idx = data.next_workout_idx || 0;
    
    for (let i = 0; i < 90; i++) {
        const dateStr = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        
        if (!marks[dateStr]) {
            marks[dateStr] = { marked: true, dotColor: '#FF4B4B' };
        }
        
        const currMod = idx % data.workouts.length;
        if ([1, 3, 6].includes(currMod)) {
            currentDate.setDate(currentDate.getDate() + 2);
        } else {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        idx++;
    }
    
    return marks;
  }, [data]);

  if (loading || !data) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2196F3" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🗓️ İdman Takvimi</Text>
        <Calendar
          markedDates={markedDates}
          theme={{
            todayTextColor: '#2196F3',
            arrowColor: '#2196F3',
            dotColor: '#FF4B4B',
            selectedDayBackgroundColor: '#4CAF50',
          }}
        />
        <View style={styles.legend}>
            <Text style={{color: '#4CAF50', fontWeight: 'bold'}}>🟩 Tamamlananlar</Text>
            <Text style={{color: '#FF4B4B', fontWeight: 'bold', marginLeft: 15}}>🔴 Gelecek Plan</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 10, elevation: 2 },
  cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#333' },
  legend: { flexDirection: 'row', marginTop: 15, justifyContent: 'center' }
});

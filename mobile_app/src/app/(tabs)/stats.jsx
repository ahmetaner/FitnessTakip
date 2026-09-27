import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { DataContext } from '../../contexts/DataContext';

export default function StatsScreen() {
  const { data, loading } = useContext(DataContext);

  if (loading || !data) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#ff4b4b" /></View>;
  }

  const history = data.completed_history || [];
  const recentHistory = [...history].reverse().slice(0, 10); // Last 10

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Streak (Seri)</Text>
        <Text style={styles.statValue}>{data.streak || 0} Gün</Text>
        <Text style={styles.statSub}>Max: {data.max_streak || 0} Gün</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📚 Son Tamamlananlar</Text>
        {recentHistory.length === 0 ? (
          <Text style={styles.subText}>Henüz tamamlanmış idman yok.</Text>
        ) : (
          recentHistory.map((h, i) => (
            <View key={i} style={styles.historyRow}>
              <Text style={styles.historyTitle}>{h.title.replace('Antrenman: ', '')}</Text>
              <Text style={styles.historyDate}>{h.date}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, marginTop: 10, elevation: 2 },
  cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#333' },
  statValue: { fontSize: 36, fontWeight: 'bold', color: '#ff4b4b' },
  statSub: { fontSize: 14, color: '#666', marginTop: 4 },
  subText: { fontSize: 14, color: '#666' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  historyTitle: { fontSize: 16, color: '#333', fontWeight: '500' },
  historyDate: { fontSize: 14, color: '#888' },
});

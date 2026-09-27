import React, { useContext, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { DataContext } from '../../contexts/DataContext';

export default function StatsScreen() {
  const { data, loading } = useContext(DataContext);

  const stats = useMemo(() => {
    if (!data) return { comp30: 0, miss30: 0, rate30: 0, comp365: 0, miss365: 0, rate365: 0 };
    
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const oneYearAgo = new Date();
    oneYearAgo.setDate(today.getDate() - 365);

    const compHistory = data.completed_history || [];
    const missHistory = data.missed_history || [];

    const comp30 = compHistory.filter(h => new Date(h.date) >= thirtyDaysAgo).length;
    const miss30 = missHistory.filter(h => new Date(h.date) >= thirtyDaysAgo).length;
    const total30 = comp30 + miss30;
    const rate30 = total30 > 0 ? Math.round((comp30 / total30) * 100) : 0;

    const comp365 = compHistory.filter(h => new Date(h.date) >= oneYearAgo).length;
    const miss365 = missHistory.filter(h => new Date(h.date) >= oneYearAgo).length;
    const total365 = comp365 + miss365;
    const rate365 = total365 > 0 ? Math.round((comp365 / total365) * 100) : 0;

    return { comp30, miss30, rate30, comp365, miss365, rate365 };
  }, [data]);

  if (loading || !data) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#ff4b4b" /></View>;
  }

  const history = data.completed_history || [];
  const recentHistory = [...history].reverse().slice(0, 10);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Streak (Seri)</Text>
        <Text style={styles.statValue}>{data.streak || 0} Gün</Text>
        <Text style={styles.statSub}>Rekor: {data.max_streak || 0} Gün</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Başarı Oranları</Text>
        
        <Text style={styles.subTitle}>Son 30 Gün</Text>
        <Text style={styles.desc}>Tamamlanan: {stats.comp30} | Kaçırılan: {stats.miss30}</Text>
        <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, {width: ${stats.rate30}%}]} />
        </View>
        <Text style={styles.progressText}>Başarı: %{stats.rate30}</Text>

        <Text style={[styles.subTitle, {marginTop: 16}]}>Son 1 Yıl</Text>
        <Text style={styles.desc}>Tamamlanan: {stats.comp365} | Kaçırılan: {stats.miss365}</Text>
        <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, {width: ${stats.rate365}%}]} />
        </View>
        <Text style={styles.progressText}>Başarı: %{stats.rate365}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📚 Son 10 İdman</Text>
        {recentHistory.length === 0 ? (
          <Text style={styles.desc}>Henüz tamamlanmış idman yok.</Text>
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
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, marginTop: 5, elevation: 2 },
  cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#333' },
  subTitle: { fontSize: 16, fontWeight: 'bold', color: '#444', marginBottom: 4 },
  statValue: { fontSize: 36, fontWeight: 'bold', color: '#ff4b4b' },
  statSub: { fontSize: 14, color: '#666', marginTop: 4 },
  desc: { fontSize: 14, color: '#666', marginBottom: 8 },
  progressBarBg: { height: 12, backgroundColor: '#eee', borderRadius: 6, overflow: 'hidden', marginVertical: 4 },
  progressBarFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 6 },
  progressText: { fontSize: 12, color: '#4CAF50', fontWeight: 'bold', textAlign: 'right' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  historyTitle: { fontSize: 16, color: '#333', fontWeight: '500' },
  historyDate: { fontSize: 14, color: '#888' },
});

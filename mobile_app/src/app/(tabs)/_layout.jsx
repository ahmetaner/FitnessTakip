import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#4CAF50',
      tabBarStyle: { paddingBottom: 5, height: 60 }
    }}>
      <Tabs.Screen name="index" options={{ 
        title: 'Özet', 
        tabBarIcon: ({color}) => <Text style={{fontSize: 20}}>🏠</Text> 
      }} />
      <Tabs.Screen name="calendar" options={{ 
        title: 'Takvim', 
        tabBarIcon: ({color}) => <Text style={{fontSize: 20}}>🗓️</Text> 
      }} />
      <Tabs.Screen name="cycle" options={{ 
        title: 'Döngü', 
        tabBarIcon: ({color}) => <Text style={{fontSize: 20}}>🔁</Text> 
      }} />
    </Tabs>
  );
}

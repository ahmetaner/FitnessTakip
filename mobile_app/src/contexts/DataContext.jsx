import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';

export const DataContext = createContext();
const API_URL = 'https://ahmetTaner.pythonanywhere.com/api/data';

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      const fetchedData = response.data;
      if (!fetchedData.workouts) {
        fetchedData.workouts = ["push", "pull", "leg", "upper", "lower", "v-sit", "muscle up"];
      }
      if (fetchedData.next_workout_idx === undefined) fetchedData.next_workout_idx = 5;
      setData(fetchedData);
      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Hata Detayı", "Bağlantı hatası: " + error.message + "\nURL: " + API_URL);
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

  useEffect(() => { fetchData(); }, []);

  return (
    <DataContext.Provider value={{ data, loading, saveData, fetchData }}>
      {children}
    </DataContext.Provider>
  );
};

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/health`);
      if (response.data.status === 'connected') {
        setConnectionStatus('You are connected to the backend!');
        setIsConnected(true);
      }
    } catch (error) {
      setConnectionStatus('Unable to connect to backend');
      setIsConnected(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World</Text>
      <Text style={[styles.status, isConnected ? styles.connected : styles.disconnected]}>
        {connectionStatus}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    marginTop: 10,
  },
  connected: {
    color: 'green',
  },
  disconnected: {
    color: 'red',
  },
});

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import SignUpScreen from './screens/SignUpScreen';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBackendConnection();

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Show sign-up screen if user is not authenticated
  if (!user) {
    return (
      <>
        <SignUpScreen onSignUpSuccess={() => {}} />
        <StatusBar style="auto" />
      </>
    );
  }

  // Show main app content if user is authenticated
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, {user.email}!</Text>
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

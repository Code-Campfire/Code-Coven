import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './screens/Login';

function AppContent() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    // Spinner while checking auth state
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!user) {
    return (
      // runs when no user is signed in
      <>
        <Login
          onLoginSuccess={() => {
            // This will be handled by Firebase auth state change
            console.log('Login successful');
          }}
        />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.successText}>You are logged in</Text>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  successText: {
    color: 'green',
    fontSize: 18,
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    maxWidth: 400,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

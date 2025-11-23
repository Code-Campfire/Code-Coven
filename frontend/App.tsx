import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import LoginScreen from './src/components/LoginScreen';
import SignupScreen from './src/components/SignupScreen';
import DashboardScreen from './src/components/DashboardScreen';
import { signUpUser, signInUser, resetPassword, logoutUser } from './src/services/authService';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const handleLogin = async (email: string, password: string) => {
    try {
      // Sign in user with Firebase and fetch from database
      const userData = await signInUser(email, password);
      console.log('User logged in successfully:', userData);

      // Navigation will happen automatically after successful login
    } catch (error: any) {
      // Error is already formatted by authService
      throw error;
    }
  };

  const handleSignup = async (email: string, password: string) => {
    try {
      // Sign up user with Firebase and initialize in database
      const userData = await signUpUser(email, password);
      console.log('User signed up successfully:', userData);

      // Navigation will happen automatically after successful signup
      // The user is already auto-logged in by Firebase's createUserWithEmailAndPassword
    } catch (error: any) {
      // Error is already formatted by authService
      throw error;
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error: any) {
      // Error is already formatted by authService
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      console.log('User logged out successfully');
      // Navigate to login after logout
      if (navigationRef.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error: any) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const navigationRef = React.useRef<any>(null);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Login"
          options={{ title: 'Sign In' }}
        >
          {(props) => (
            <LoginScreen
              {...props}
              onLogin={handleLogin}
              onPasswordReset={handlePasswordReset}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="Signup"
          options={{ title: 'Sign Up' }}
        >
          {(props) => <SignupScreen {...props} onSignup={handleSignup} />}
        </Stack.Screen>

        <Stack.Screen
          name="Dashboard"
          options={{
            title: 'Dashboard',
            headerBackVisible: false,
            headerRight: () => (
              <TouchableOpacity onPress={handleLogout} style={{ marginRight: 10 }}>
                <Text style={{ color: '#fff', fontSize: 16 }}>Log Out</Text>
              </TouchableOpacity>
            ),
          }}
          component={DashboardScreen}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

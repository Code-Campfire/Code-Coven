import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { validatePassword, validatePasswordMatch } from '../utils/passwordValidation';

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

interface SignupScreenProps {
  onSignup: (email: string, password: string) => Promise<void>;
}

export default function SignupScreen({ onSignup }: SignupScreenProps) {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordValidation = validatePassword(password);
  const passwordsMatch = validatePasswordMatch(password, confirmPassword);

  const handleSignup = async () => {
    // Clear previous errors
    setError('');

    // Validate email
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password
    if (!passwordValidation.isValid) {
      setError('Please fix password requirements');
      return;
    }

    // Validate password match
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    // Validate terms acceptance
    if (!acceptedTerms) {
      setError('You must accept the Terms of Service');
      return;
    }

    setLoading(true);
    try {
      await onSignup(email, password);
      // Signup successful - navigate to dashboard
      // User is already auto-logged in via Firebase createUserWithEmailAndPassword
      navigation.replace('Dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordValidation.strength) {
      case 'weak':
        return '#ff4444';
      case 'medium':
        return '#ffaa00';
      case 'strong':
        return '#00cc00';
      default:
        return '#cccccc';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Password Strength Indicator */}
        {password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBar}>
              <View
                style={[
                  styles.strengthFill,
                  {
                    width: `${(Object.values(passwordValidation.requirements).filter(r => r).length / 6) * 100}%`,
                    backgroundColor: getStrengthColor(),
                  },
                ]}
              />
            </View>
            <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
              {passwordValidation.strength.charAt(0).toUpperCase() + passwordValidation.strength.slice(1)}
            </Text>
          </View>
        )}

        {/* Password Requirements */}
        {password.length > 0 && (
          <View style={styles.requirementsContainer}>
            {Object.entries({
              minLength: '8-12 characters',
              hasUppercase: 'One uppercase letter',
              hasLowercase: 'One lowercase letter',
              hasNumber: 'One number',
              hasSpecialChar: 'One special character',
            }).map(([key, label]) => (
              <Text
                key={key}
                style={[
                  styles.requirement,
                  passwordValidation.requirements[key as keyof typeof passwordValidation.requirements]
                    ? styles.requirementMet
                    : styles.requirementUnmet,
                ]}
              >
                {passwordValidation.requirements[key as keyof typeof passwordValidation.requirements] ? '✓' : '○'} {label}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        {confirmPassword.length > 0 && !passwordsMatch && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}
        {confirmPassword.length > 0 && passwordsMatch && (
          <Text style={styles.successText}>✓ Passwords match</Text>
        )}
      </View>

      {/* Terms of Service */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setAcceptedTerms(!acceptedTerms)}
      >
        <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
          {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>
          I accept the <Text style={styles.link}>Terms of Service</Text>
        </Text>
      </TouchableOpacity>

      {/* Error Message */}
      {error && <Text style={styles.errorMessage}>{error}</Text>}

      {/* Signup Button */}
      <TouchableOpacity
        style={[
          styles.button,
          (!passwordValidation.isValid || !passwordsMatch || !acceptedTerms || !email) &&
            styles.buttonDisabled,
        ]}
        onPress={handleSignup}
        disabled={loading || !passwordValidation.isValid || !passwordsMatch || !acceptedTerms || !email}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      {/* Login Link */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
          <Text style={styles.loginLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  strengthContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  strengthBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    width: 60,
  },
  requirementsContainer: {
    marginTop: 8,
    paddingLeft: 4,
  },
  requirement: {
    fontSize: 13,
    marginVertical: 2,
  },
  requirementMet: {
    color: '#00cc00',
  },
  requirementUnmet: {
    color: '#999999',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 13,
    marginTop: 4,
  },
  successText: {
    color: '#00cc00',
    fontSize: 13,
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#cccccc',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333333',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  errorMessage: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff0f0',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
  },
  loginLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});

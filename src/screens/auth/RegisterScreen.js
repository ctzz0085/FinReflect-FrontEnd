import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleRegister = async () => {
    setError('');
    setFieldErrors({});

    // Validate email is required
    if (!email.trim()) {
      setFieldErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    // Validate phone format if provided
    if (phoneNumber.trim()) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber.trim().replace(/\s/g, ''))) {
        setFieldErrors(prev => ({ ...prev, phoneNumber: 'Please enter a valid phone number (e.g., +919876543210)' }));
        return;
      }
    }

    if (password !== confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    if (password.length < 6) {
      setFieldErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register({
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        password,
      });

      if (!res?.token) {
        setError('Registration failed');
        return;
      }

      await login({
        userId: res.userId,
        applicationId: res.applicationId,
        email: res.email,
        phoneNumber: res.phoneNumber,
        role: res.role,
      }, res.token);

    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Expense Tracker</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, fieldErrors.email && styles.inputError]}
                placeholder="user@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (fieldErrors.email) {
                    setFieldErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
              {fieldErrors.email && (
                <Text style={styles.errorTextSmall}>{fieldErrors.email}</Text>
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number (optional)</Text>
              <TextInput
                style={[styles.input, fieldErrors.phoneNumber && styles.inputError]}
                placeholder="+919876543210"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (fieldErrors.phoneNumber) {
                    setFieldErrors(prev => ({ ...prev, phoneNumber: '' }));
                  }
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="phone-pad"
              />
              {fieldErrors.phoneNumber && (
                <Text style={styles.errorTextSmall}>{fieldErrors.phoneNumber}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, fieldErrors.password && styles.inputError]}
                placeholder="Enter password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (fieldErrors.password) {
                    setFieldErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                secureTextEntry
                autoCapitalize="none"
              />
              {fieldErrors.password && (
                <Text style={styles.errorTextSmall}>{fieldErrors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[styles.input, fieldErrors.confirmPassword && styles.inputError]}
                placeholder="Confirm password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                secureTextEntry
                autoCapitalize="none"
              />
              {fieldErrors.confirmPassword && (
                <Text style={styles.errorTextSmall}>{fieldErrors.confirmPassword}</Text>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.registerButtonText}>Register</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
                Login
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4', // green-50 equivalent
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 32,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800 equivalent
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280', // gray-500 equivalent
  },
  errorContainer: {
    backgroundColor: '#fef2f2', // red-100 equivalent
    borderWidth: 1,
    borderColor: '#f87171', // red-400 equivalent
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626', // red-700 equivalent
    fontSize: 14,
  },
  errorTextSmall: {
    color: '#dc2626', // red-700 equivalent
    fontSize: 12,
    marginTop: 4,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151', // gray-700 equivalent
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#d1d5db', // gray-300 equivalent
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#f87171', // red-400 equivalent
  },
  registerButton: {
    backgroundColor: '#4ade80', // green-400 equivalent
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  registerButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280', // gray-600 equivalent
  },
  linkText: {
    color: '#2563eb', // blue-600 equivalent
    fontWeight: '500',
  },
});

export default RegisterScreen;

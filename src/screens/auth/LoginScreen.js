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

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login({ identifier: username, password });

      if (!res?.token) {
        Alert.alert('Error', 'Invalid credentials');
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
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Login failed';
      Alert.alert('Error', msg);
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
            <Text style={styles.subtitle}>Manage your finances efficiently</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email ID / Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Email, Phone, or User ID"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>
                Don't have an account? <Text style={styles.linkTextBold}>Register</Text>
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.linkTextBold}>Forgot your password?</Text>
            </TouchableOpacity>
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
  loginButton: {
    backgroundColor: '#4ade80', // green-400 equivalent
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  linkTextBold: {
    color: '#2563eb', // blue-600 equivalent
    fontWeight: '500',
  },
  forgotButton: {
    marginTop: 8,
  },
});

export default LoginScreen;

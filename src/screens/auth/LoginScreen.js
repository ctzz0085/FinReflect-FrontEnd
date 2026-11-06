import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const backgroundImage = require('../../../assets/images/login-background.jpg');
const PLACEHOLDER_COLOR = '#86948a';

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

    // Dev admin bypass - no API call
    if (username.trim() === 'admin' && password === 'admin123') {
      await login({
        userId: 0,
        applicationId: 'expense-app',
        email: 'admin@dev.local',
        phoneNumber: '',
        role: 'ADMIN',
      }, 'dev-admin-token');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login({ email: username, password });

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
    <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>FinReflect</Text>
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
                  placeholderTextColor={PLACEHOLDER_COLOR}
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
                  placeholderTextColor={PLACEHOLDER_COLOR}
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
                  <ActivityIndicator color="#00422b" />
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1326',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: 'rgba(19, 27, 46, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(78, 222, 163, 0.3)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 8,
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
    color: '#dae2fd',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#bbcabf',
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
    color: '#bbcabf',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#3c4a42',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#dae2fd',
    backgroundColor: '#0b1326',
  },
  loginButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#2d3449',
    shadowOpacity: 0,
  },
  loginButtonText: {
    color: '#00422b',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    color: '#bbcabf',
    marginBottom: 8,
  },
  linkTextBold: {
    color: '#4edea3',
    fontWeight: '500',
  },
  forgotButton: {
    marginTop: 8,
  },
});

export default LoginScreen;

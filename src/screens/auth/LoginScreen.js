import { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { authAPI } from '../../api/auth';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { useAuth } from '../../context/AuthContext';

const backgroundImage = require('../../../assets/images/login-background.jpg');

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleGoogleCredential = async (idToken) => {
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.googleLogin(idToken);

      if (!res?.token) {
        setError('Google sign-in failed. Please try again.');
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
      setError(
        err?.response?.data?.error
        || err?.response?.data?.message
        || err?.message
        || 'Google sign-in failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>FinReflect</Text>
            <Text style={styles.subtitle}>Manage your finances efficiently</Text>
          </View>

          <GoogleSignInButton onCredential={handleGoogleCredential} onError={setError} />

          {loading && <ActivityIndicator style={styles.status} color="#4edea3" />}
          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1326',
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
  status: {
    marginTop: 16,
  },
  error: {
    color: '#ffb4ab',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default LoginScreen;

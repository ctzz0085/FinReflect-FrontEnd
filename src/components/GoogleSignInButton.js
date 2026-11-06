import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import getEnvVars from '../config/env';

const { GOOGLE_WEB_CLIENT_ID } = getEnvVars();
const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const BUTTON_WIDTH = 280;

let gisScriptPromise = null;

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  if (!gisScriptPromise) {
    gisScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GIS_SCRIPT_URL;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        gisScriptPromise = null;
        script.remove();
        reject(new Error('Could not load Google sign-in'));
      };
      document.head.appendChild(script);
    });
  }
  return gisScriptPromise;
};

// Renders Google's own sign-in button and hands the ID token to onCredential.
// Web only for now: Android and iOS need their own OAuth clients and an Expo
// development build.
const GoogleSignInButton = ({ onCredential, onError }) => {
  const containerRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [ready, setReady] = useState(false);

  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return undefined;
    }

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current) {
          return;
        }
        window.google.accounts.id.initialize({
          client_id: GOOGLE_WEB_CLIENT_ID,
          callback: (response) => onCredentialRef.current?.(response.credential),
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: BUTTON_WIDTH,
        });
        setReady(true);
      })
      .catch((err) => {
        if (!cancelled) {
          onErrorRef.current?.(err.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (Platform.OS !== 'web') {
    return (
      <Text style={styles.notice}>
        Google sign-in is available on the web app for now.
      </Text>
    );
  }

  return (
    <View style={styles.wrapper}>
      {!ready && <ActivityIndicator color="#4edea3" />}
      <View ref={containerRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  notice: {
    color: '#bbcabf',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default GoogleSignInButton;

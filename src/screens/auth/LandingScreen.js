import React, { useEffect } from 'react';

// Web only. Embeds the FinReflect marketing page, built into public/landing by
// `npm run build:app` in finreflect-landing. Its Sign In button posts a message
// to this window, which opens the Login screen.
const LandingScreen = ({ navigation }) => {
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin === window.location.origin && event.data?.type === 'finreflect:login') {
        navigation.navigate('Login');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigation]);

  return (
    <iframe
      src="/landing/index.html"
      title="FinReflect"
      style={{ border: 0, width: '100%', height: '100%' }}
    />
  );
};

export default LandingScreen;

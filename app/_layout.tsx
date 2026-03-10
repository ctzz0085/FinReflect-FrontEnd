import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { TabProvider } from '../src/context/TabContext';
import AppNavigator from '../src/navigation/AppNavigator';

export default function RootLayout() {
  return (
    <AuthProvider>
      <TabProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </TabProvider>
    </AuthProvider>
  );
}

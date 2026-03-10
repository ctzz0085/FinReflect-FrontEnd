import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} key="main" />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} key="auth" />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AddExpenseScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Expense</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
});

export default AddExpenseScreen;
